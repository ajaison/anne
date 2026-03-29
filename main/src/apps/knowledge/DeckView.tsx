import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, CheckCircle, HelpCircle, Loader, Play } from 'lucide-react';
import { fetchCardsByDeck, createCard, supabase } from './services/supabase';
import type { Card, Deck } from './types';
import './KnowledgeApp.css';

const DeckView = () => {
    const { deckId } = useParams<{ deckId: string }>();
    const navigate = useNavigate();
    
    const [deck, setDeck] = useState<Deck | null>(null);
    const [cards, setCards] = useState<Card[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    
    const [question, setQuestion] = useState('');
    const [answer, setAnswer] = useState('');

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
        const { data, error } = await fetchCardsByDeck(deckId);
        if (!error) setCards(data || []);
        setLoading(false);
    };

    const handleCreateCard = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!question.trim() || !answer.trim() || !deckId) return;

        const { error } = await createCard(deckId, question, answer);
        if (!error) {
            setQuestion('');
            setAnswer('');
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
                                placeholder="THE QUESTION" 
                                value={question}
                                onChange={(e) => setQuestion(e.target.value)}
                                rows={3}
                                autoFocus
                            />
                            <textarea 
                                placeholder="THE ANSWER"
                                value={answer}
                                onChange={(e) => setAnswer(e.target.value)}
                                rows={5}
                            />
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
                            <div key={card.id} className="knowledge-card">
                                <div className="card-front">
                                    <HelpCircle className="card-icon" size={20} />
                                    <p>{card.question}</p>
                                </div>
                                <div className="card-back">
                                    <CheckCircle className="answer-icon" size={20} />
                                    <p>{card.answer}</p>
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
