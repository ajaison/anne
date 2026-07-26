import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, CheckCircle, HelpCircle, Loader, Play, CloudDownload, Trash2, Zap, Copy } from 'lucide-react';
import { createCard, supabase, deleteCard, bulkCreateCards } from './services/supabase';
import { syncService } from './services/sync';
import { FlashcardContent } from './components/FlashcardContent';
import QuickAddPanel from './components/QuickAddPanel';
import type { Card, Deck, StudyMode } from './types';
import './KnowledgeApp.css';

const DeckView = () => {
    const { deckId } = useParams<{ deckId: string }>();
    const navigate = useNavigate();
    
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
    const [showQuickAdd, setShowQuickAdd] = useState(false);

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

    const handleCreateCard = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!question.trim() || !answer.trim() || !deckId) return;

        const { error } = await createCard(deckId, question, answer, imageUrl.trim() || undefined, isCode, cardType);
        if (!error) {
            setQuestion('');
            setAnswer('');
            setImageUrl('');
            setIsCode(false);
            setCardType('multiple_choice');
            setIsCreating(false);
            loadCards();
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
        if (!bulkText.trim() || !deckId) return;
        setIsImporting(true);
        
        try {
            let cardsToCreate: any[] = [];
            
            // Try parsing as JSON first (Most robust for images/code)
            try {
                const parsed = JSON.parse(bulkText);
                if (Array.isArray(parsed)) {
                    cardsToCreate = parsed.map(c => ({
                        deck_id: deckId,
                        question: c.question || c.q,
                        answer: c.answer || c.a,
                        image_url: c.image_url || c.i,
                        is_code: !!(c.is_code || c.c)
                    }));
                }
            } catch (e) {
                // If JSON fails, use the Enhanced Pipe Format
                // Q: Question | A: Answer | I: ImageURL | C: true
                const lines = bulkText.split('\n');
                lines.forEach(line => {
                    if (line.includes('|')) {
                        const parts = line.split('|');
                        const card: any = { deck_id: deckId };
                        
                        parts.forEach(part => {
                            const p = part.trim();
                            if (p.startsWith('Q:')) card.question = p.replace(/^Q:\s*/, '').trim();
                            else if (p.startsWith('A:')) card.answer = p.replace(/^A:\s*/, '').trim();
                            else if (p.startsWith('I:')) card.image_url = p.replace(/^I:\s*/, '').trim();
                            else if (p.startsWith('C:')) card.is_code = p.toLowerCase().includes('true');
                            else if (p.startsWith('TYPE:')) card.card_type = p.replace(/^TYPE:\s*/, '').trim();
                            // Fallback for parts without prefixes
                            else if (!card.question) card.question = p;
                            else if (!card.answer) card.answer = p;
                        });

                        if (card.question && card.answer) {
                            cardsToCreate.push(card);
                        }
                    }
                });
            }

            if (cardsToCreate.length > 0) {
                const { error } = await bulkCreateCards(cardsToCreate);
                if (error) throw error;
                setBulkText('');
                setIsBulkMode(false);
                loadCards();
                alert(`Successfully imported ${cardsToCreate.length} cards!`);
            } else {
                alert('No valid cards found. Use format: Q: Question | A: Answer | I: ImageURL | C: true');
            }
        } catch (err: any) {
            alert('Import failed: ' + err.message);
        } finally {
            setIsImporting(false);
        }
    };

    const copyDeckForAI = () => {
        const text = cards.map(c => {
            let line = `Q: ${c.question} | A: ${c.answer}`;
            if (c.image_url) line += ` | I: ${c.image_url}`;
            if (c.is_code) line += ` | C: true`;
            return line;
        }).join('\n');
        
        const header = `# Existing Flashcards for ${deck?.name}\n` +
                       `# Instructions: Generate new cards in this format: "Q: [Question] | A: [Answer] | I: [Optional Image URL] | C: [Optional true/false]"\n\n`;
        
        navigator.clipboard.writeText(header + text);
        alert('Deck context (including images/code tags) copied to clipboard!');
    };

    const copyPromptTemplate = () => {
        const template = `**Task:** Generate 20 new high-quality flashcards for the deck "${deck?.name}".\n\n` +
            `**Output Format:**\n` +
            `Q: [Question] | A: [Detailed Answer] | I: [Optional Image URL] | C: [true/false]\n\n` +
            `**Instructions:**\n` +
            `- Use Markdown for code/formatting.\n` +
            `- Focus on conceptual depth.\n` +
            `- No duplicates.`;
        navigator.clipboard.writeText(template);
        alert('Prompt template copied!');
    };

    return (
        <div className="knowledge-container">
            <header className="knowledge-header">
                <button className="back-button" onClick={() => navigate(`/knowledge/project/${deck?.project_id}`)}>
                    <ArrowLeft size={20} /> Back to Project
                </button>
                <div className="header-bottom">
                    <h1>{deck?.name || 'Loading Deck...'}</h1>
                    <div className="deck-actions">
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
                        <button className="bulk-add-btn" onClick={() => setIsBulkMode(!isBulkMode)}>
                            <Zap size={18} /> Bulk Add
                        </button>
                        <button className="quick-add-btn" onClick={() => setShowQuickAdd(true)}>
                            <Zap size={18} /> Quick Add
                        </button>
                        <button className="add-project-btn" onClick={() => setIsCreating(true)}>
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
                            <p>Use Gemini to grow your 2nd Brain in 3 steps:</p>
                        </div>
                        <div className="guide-steps">
                            <div className="step">
                                <strong>1. Copy Context:</strong>
                                <p>Click the <b>Context</b> button to let Gemini know what you already have.</p>
                            </div>
                            <div className="step">
                                <strong>2. Use the Prompt:</strong>
                                <p>Paste your context into Gemini and ask it to generate new cards using our standard format.</p>
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
                            <p>Paste cards from AI. Format: <code>Q: Question | A: Answer</code> (one per line) or a JSON array.</p>
                        </div>
                        <textarea 
                            className="bulk-textarea"
                            placeholder="Example:
Q: What is React? | A: A JavaScript library for building UI
Q: What is Vite? | A: A fast frontend build tool" 
                            value={bulkText}
                            onChange={(e) => setBulkText(e.target.value)}
                            rows={10}
                        />
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
                        <h2>Add New Card</h2>
                        <form onSubmit={handleCreateCard}>
                            <textarea 
                                placeholder="THE QUESTION (Markdown supported)" 
                                value={question}
                                onChange={(e) => setQuestion(e.target.value)}
                                rows={3}
                                autoFocus
                            />
                            <textarea 
                                placeholder="THE ANSWER (Markdown supported)"
                                value={answer}
                                onChange={(e) => setAnswer(e.target.value)}
                                rows={5}
                            />
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
                                <button type="submit" className="submit-btn" disabled={!question.trim() || !answer.trim()}>Save Card</button>
                            </div>
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
