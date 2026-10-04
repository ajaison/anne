import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Plus, CheckCircle, HelpCircle, Loader, Play, CloudDownload, Trash2, Zap, Copy } from 'lucide-react';
import { supabase, deleteCard, bulkCreateCards, updateCardContent } from './services/supabase';
import { syncService } from './services/sync';
import { parseCardImport } from './services/cardImport';
import { choiceProblem, splitChoiceAnswer, choiceGenerationPrompt } from './services/multipleChoice';
import { resolveStudyMode } from './services/studyModes';
import { getPathway, topicUrl } from './curricula/pathways';
import { db } from './services/db';
import ChoiceAuthoringFields from './components/ChoiceAuthoringFields';
import { FlashcardContent } from './components/FlashcardContent';
import QuickAddPanel from './components/QuickAddPanel';
import type { Card, Deck, StudyMode } from './types';
import './KnowledgeApp.css';

const DeckView = () => {
    const { deckId } = useParams<{ deckId: string }>();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const pathway = getPathway(searchParams.get('pathway'));
    
    const [deck, setDeck] = useState<Deck | null>(null);
    const [cards, setCards] = useState<Card[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);
    
    const [question, setQuestion] = useState('');
    const [answer, setAnswer] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [isCode, setIsCode] = useState(false);
    const [cardType, setCardType] = useState<StudyMode>('multiple_choice');
    const [isBulkMode, setIsBulkMode] = useState(false);
    const [showGuide, setShowGuide] = useState(false);
    const [bulkText, setBulkText] = useState('');
    const [isImporting, setIsImporting] = useState(false);
    const [importError, setImportError] = useState<string | null>(null);
    const [showQuickAdd, setShowQuickAdd] = useState(false);
    const [editingCard, setEditingCard] = useState<Card | null>(null);
    const [distractors, setDistractors] = useState(['', '', '']);
    const [explanation, setExplanation] = useState('');
    const [cardSaveError, setCardSaveError] = useState<string | null>(null);
    const [savingCard, setSavingCard] = useState(false);
    const saveCardLock = useRef(false);

    useEffect(() => {
        if (deckId) {
            loadDeckDetails();
            loadCards();
        }
    }, [deckId]);

    const loadDeckDetails = async () => {
        const { data, error } = await supabase.from('decks').select('*').eq('id', deckId).single();
        if (!error) setDeck(data);
    };

    const loadCards = async () => {
        if (!deckId) return;
        setLoading(true);
        try {
            // Use syncService to get cards (handles offline fallback)
            const data = await syncService.getCards(deckId);
            setCards(data || []);
        } catch (error) {
            console.error('Failed to load cards:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSync = async () => {
        if (!deckId) return;
        setIsSyncing(true);
        await syncService.downloadDeck(deckId);
        setIsSyncing(false);
    };

    const openCardEditor = (card?: Card) => {
        if (saveCardLock.current) return;
        const choice = card ? splitChoiceAnswer(card.answer) : { correctOption: '', explanation: '' };
        const mode = card ? resolveStudyMode(card.card_type) : 'multiple_choice';
        const useChoice = mode === 'multiple_choice' || mode === 'type_answer';
        setEditingCard(card ?? null);
        setQuestion(card?.question ?? '');
        setAnswer(useChoice ? choice.correctOption : card?.answer ?? '');
        setExplanation(useChoice ? choice.explanation : '');
        setDistractors([0, 1, 2].map(i => card?.distractors?.[i] ?? ''));
        setImageUrl(card?.image_url ?? '');
        setIsCode(card?.is_code ?? false);
        setCardType(mode === 'type_answer' ? 'multiple_choice' : mode);
        setCardSaveError(null);
        setIsCreating(true);
    };

    const handleCreateCard = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!deckId || saveCardLock.current) return;
        saveCardLock.current = true;
        setSavingCard(true);
        setCardSaveError(null);
        try {
            const [content] = parseCardImport(JSON.stringify([{
                question, card_type: cardType, image_url: imageUrl, is_code: isCode,
                ...(cardType === 'multiple_choice'
                    ? { correct_option: answer, explanation, distractors }
                    : { answer }),
            }]), deckId);
            if (editingCard) {
                const { data, error } = await updateCardContent(editingCard.id, content);
                if (error) throw new Error(error.message);
                await db.cards.put(data as Card);
            } else {
                const { error } = await bulkCreateCards([content]);
                if (error) throw new Error(error.message);
            }
            setIsCreating(false);
            setEditingCard(null);
            await loadCards();
        } catch (error) {
            setCardSaveError(error instanceof Error ? error.message : 'Unable to save the card.');
        } finally {
            saveCardLock.current = false;
            setSavingCard(false);
        }
    };
    const handleDeleteCard = async (id: string) => {
        if (!confirm('Are you sure you want to delete this card?')) return;
        
        const { error } = await deleteCard(id);
        if (error) {
            alert('Failed to delete card: ' + error.message);
        } else {
            loadCards();
        }
    };

    const handleBulkImport = async () => {
        if (!bulkText.trim() || !deckId || isImporting) return;
        setIsImporting(true);
        setImportError(null);
        try {
            const cardsToCreate = parseCardImport(bulkText, deckId);
            const { error } = await bulkCreateCards(cardsToCreate);
            if (error) throw error;
            setBulkText('');
            setIsBulkMode(false);
            loadCards();
            alert(`Successfully imported ${cardsToCreate.length} cards!`);
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message
                : typeof error === 'object' && error !== null && 'message' in error
                    ? String(error.message) : 'Unable to save cards. Please try again.';
            setImportError(message);
        } finally {
            setIsImporting(false);
        }
    };

    const copyDeckForAI = () => {
        const content = cards.map(card => ({
            question: card.question, answer: card.answer, card_type: card.card_type,
            distractors: card.distractors, is_code: card.is_code, image_url: card.image_url,
        }));
        navigator.clipboard.writeText(`# Existing cards for ${deck?.name}\n${JSON.stringify(content, null, 2)}`);
        alert('Deck context, including authored choices, copied!');
    };

    const copyPromptTemplate = () => {
        navigator.clipboard.writeText(choiceGenerationPrompt(deck?.name ?? 'this topic'));
        alert('Multiple-choice generation prompt copied!');
    };

    return (
        <div className="knowledge-container">
            <header className="knowledge-header">
                <button className="back-button" onClick={() => navigate(pathway
                    ? topicUrl(deckId!, pathway.id) : `/knowledge/project/${deck?.project_id}`)}>
                    <ArrowLeft size={20} /> {pathway ? 'Back to topic' : 'Back to Project'}
                </button>
                <div className="header-bottom">
                    <h1>{deck?.name || 'Loading Deck...'}</h1>
                    <div className="deck-actions">
                        <button className="copy-ai-btn" onClick={() => navigate(topicUrl(deckId!, pathway?.id))}>
                            Concepts
                        </button>
                        <button className="copy-ai-btn" onClick={() => setShowGuide(true)} title="AI Generation Guide">
                            <HelpCircle size={18} /> Guide
                        </button>
                        <button className="copy-ai-btn" onClick={copyDeckForAI} title="Copy deck for AI analysis">
                            <Copy size={18} /> Context
                        </button>
                        <button 
                            className="sync-btn"
                            onClick={handleSync}
                            disabled={isSyncing}
                            title="Download for offline use"
                        >
                            <CloudDownload size={18} className={isSyncing ? 'animate-pulse' : ''} />
                            Offline
                        </button>
                        <button 
                            className="study-btn" 
                            disabled={cards.length === 0}
                            onClick={() => navigate(`/knowledge/study/${deckId}`)}
                        >
                            <Play size={18} /> Study
                        </button>
                        <button className="bulk-add-btn" onClick={() => { setIsBulkMode(!isBulkMode); setImportError(null); }}>
                            <Zap size={18} /> Bulk Add
                        </button>
                        <button className="quick-add-btn" onClick={() => setShowQuickAdd(true)}>
                            <Zap size={18} /> Quick Add
                        </button>
                        <button className="add-project-btn" onClick={() => openCardEditor()}>
                            <Plus size={20} />
                        </button>
                    </div>
                </div>
                <p className="project-subtitle">{cards.length} cards total</p>
            </header>

            <main className="knowledge-content">
                {showGuide && (
                    <div className="project-form-card ai-guide-modal">
                        <div className="editor-header">
                            <h2><HelpCircle size={20} /> AI Flashcard Guide</h2>
                            <p>Create convincing multiple-choice cards in 3 steps:</p>
                        </div>
                        <div className="guide-steps">
                            <div className="step">
                                <strong>1. Copy Context:</strong>
                                <p>Click the <b>Context</b> button to let your AI know what you already have.</p>
                            </div>
                            <div className="step">
                                <strong>2. Use the Prompt:</strong>
                                <p>Paste your context into your AI and ask it to generate new cards using our standard format.</p>
                                <button className="copy-template-btn" onClick={copyPromptTemplate}>
                                    <Copy size={14} /> Copy Prompt Template
                                </button>
                            </div>
                            <div className="step">
                                <strong>3. Bulk Import:</strong>
                                <p>Copy Gemini's output and paste it into the <b>Bulk Add</b> editor.</p>
                            </div>
                        </div>
                        <div className="form-actions">
                            <button className="submit-btn" onClick={() => setShowGuide(false)}>Got it!</button>
                        </div>
                    </div>
                )}
                {isBulkMode && (
                    <div className="project-form-card bulk-editor">
                        <div className="editor-header">
                            <h2><Zap size={20} /> Bulk Import Cards</h2>
                            <p>For multiple choice, paste a JSON array with <code>question</code>, <code>correct_option</code>, <code>explanation</code>, and three <code>distractors</code>. Legacy answer fields and pipe-format Classic cards still work.</p>
                        </div>
                        <textarea 
                            className="bulk-textarea"
                            placeholder="Example:
Q: What is React? | A: A JavaScript library for building UI
Q: What is Vite? | A: A fast frontend build tool" 
                            value={bulkText}
                            onChange={(e) => { setBulkText(e.target.value); setImportError(null); }}
                            disabled={isImporting}
                            aria-label="Cards to import"
                            aria-describedby={importError ? "card-import-error" : undefined}
                            rows={10}
                        />
                        {importError && (
                            <p id="card-import-error" className="card-import-error" role="alert">{importError}</p>
                        )}
                        <div className="form-actions">
                            <button className="cancel-btn" onClick={() => setIsBulkMode(false)}>Cancel</button>
                            <button 
                                className="submit-btn" 
                                onClick={handleBulkImport}
                                disabled={isImporting || !bulkText.trim()}
                            >
                                {isImporting ? 'Importing...' : 'Import All Cards'}
                            </button>
                        </div>
                    </div>
                )}
                {isCreating && (
                    <div className="project-form-card card-editor">
                        <h2>{editingCard ? "Edit Card" : "Add New Card"}</h2>
                        <form onSubmit={handleCreateCard}>
                            <fieldset className="card-editor-fields" disabled={savingCard}>
                            <label className="card-editor-label">
                              Question
                              <textarea
                                className="qa-textarea"
                                placeholder="Write the question (Markdown supported)"
                                value={question}
                                onChange={(e) => setQuestion(e.target.value)}
                                rows={3}
                                autoFocus
                              />
                            </label>
                            <label className="card-editor-label">
                              {cardType === 'multiple_choice' ? 'Correct answer option' : 'Answer'}
                              <textarea
                                className="qa-textarea"
                                placeholder={cardType === 'multiple_choice' ? 'Write the correct option; put the explanation below' : 'Write the answer (Markdown supported)'}
                                aria-label={cardType === 'multiple_choice' ? 'Correct answer option' : 'Answer'}
                                value={answer}
                                onChange={(e) => setAnswer(e.target.value)}
                                rows={cardType === 'multiple_choice' ? 3 : 5}
                              />
                            </label>
                            {cardType === 'multiple_choice' && (
                                <ChoiceAuthoringFields distractors={distractors} explanation={explanation}
                                    onDistractors={setDistractors} onExplanation={setExplanation} disabled={savingCard} />
                            )}
                            {cardSaveError && <p className="card-import-error" role="alert">{cardSaveError}</p>}
                            <div className="extra-inputs">
                                <input 
                                    type="url" 
                                    placeholder="Image URL (optional)" 
                                    value={imageUrl}
                                    onChange={(e) => setImageUrl(e.target.value)}
                                />
                                <label className="code-toggle">
                                    <input 
                                        type="checkbox" 
                                        checked={isCode}
                                        onChange={(e) => setIsCode(e.target.checked)}
                                    />
                                    <span>Contains Java Code</span>
                                </label>
                            </div>
                            <div className="extra-inputs">
                                <label className="card-type-label">Study Mode:</label>
                                <select
                                    className="card-type-select"
                                    value={cardType}
                                    onChange={(e) => setCardType(e.target.value as StudyMode)}
                                >
                                    <option value="multiple_choice">🎯 Multiple Choice</option>
                                    <option value="fill_blank">✏️ Fill in the Blank</option>
                                    <option value="type_answer">⌨️ Type Answer</option>
                                    <option value="classic">🃏 Classic Flip</option>
                                </select>
                            </div>
                            <div className="form-actions">
                                <button type="button" className="cancel-btn" onClick={() => setIsCreating(false)}>Cancel</button>
                                <button type="submit" className="submit-btn" disabled={savingCard || !question.trim() || !answer.trim()}>{savingCard ? 'Saving…' : 'Save Card'}</button>
                            </div>
                            </fieldset>
                        </form>
                    </div>
                )}

                {loading ? (
                    <div className="loading-state">
                        <Loader size={40} className="animate-spin" />
                        <p>Loading your cards...</p>
                    </div>
                ) : cards.length > 0 ? (
                    <div className="card-list">
                        {cards.map(card => (
                            <div key={card.id} className={`knowledge-card ${card.is_code ? 'code-card' : ''}`}>
                                <div className="card-front">
                                    <HelpCircle className="card-icon" size={20} />
                                    <div className="card-text-content">
                                        <div className="card-markdown">
                                            <FlashcardContent content={card.question} />
                                        </div>
                                        {card.image_url && <img src={card.image_url} alt="Card visual" className="card-image-preview" />}
                                    </div>
                                    <button 
                                        className="delete-card-btn" 
                                        onClick={() => handleDeleteCard(card.id)}
                                        title="Delete Card"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                                <div className="card-back">
                                    <CheckCircle className="answer-icon" size={20} />
                                    <div className="card-text-content">
                                        <div className="card-markdown">
                                            <FlashcardContent content={card.answer} />
                                        </div>
                                        <div className="choice-card-actions">
                                            <button className="copy-ai-btn" onClick={() => openCardEditor(card)}>
                                                {card.card_type === 'type_answer' ? 'Convert to multiple choice' : 'Edit card'}
                                            </button>
                                            {card.card_type === 'multiple_choice' && choiceProblem(card.answer, card.distractors) && (
                                                <span>Needs answer choices</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="empty-state">
                        <Plus size={60} className="empty-icon" />
                        <h2>Deck is empty.</h2>
                        <p>Ready to learn? Create your first flashcard to start building your 2nd Brain!</p>
                    </div>
                )}
            </main>

            {/* Quick Add Panel */}
            {showQuickAdd && deck && (
                <QuickAddPanel
                    deckId={deckId!}
                    deckName={deck.name}
                    onClose={() => setShowQuickAdd(false)}
                    onCardAdded={loadCards}
                />
            )}
        </div>
    );
};

export default DeckView;
