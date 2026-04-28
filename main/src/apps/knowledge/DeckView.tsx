import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, CheckCircle, HelpCircle, Loader, Play, CloudDownload } from 'lucide-react';
import { createCard, supabase } from './services/supabase';
import { syncService } from './services/sync';
import { FlashcardContent } from './components/FlashcardContent';
import type { Card, Deck } from './types';
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

        const { error } = await createCard(deckId, question, answer, imageUrl.trim() || undefined, isCode);
        if (!error) {
            setQuestion('');
            setAnswer('');
            setImageUrl('');
            setIsCode(false);
            setIsCreating(false);
            loadCards();
        }
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
                        <button 
                            className="sync-btn"
                            onClick={handleSync}
                            disabled={isSyncing}
                            title="Download for offline use"
                        >
                            <CloudDownload size={18} className={isSyncing ? 'animate-pulse' : ''} />
                            {isSyncing ? 'Syncing...' : 'Sync Offline'}
                        </button>
                        <button 
                            className="study-btn" 
                            disabled={cards.length === 0}
                            onClick={() => navigate(`/knowledge/study/${deckId}`)}
                        >
                            <Play size={18} /> Study Now
                        </button>
                        <button className="add-project-btn" onClick={() => setIsCreating(true)}>
                            <Plus size={20} /> New Card
                        </button>
                    </div>
                </div>
                <p className="project-subtitle">{cards.length} cards total</p>
            </header>

            <main className="knowledge-content">
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
                                    <span>Contain Code Snippet</span>
                                </label>
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
        </div>
    );
};

export default DeckView;
