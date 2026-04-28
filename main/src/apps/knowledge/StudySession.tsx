import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Loader, Target, Sparkles } from 'lucide-react';
import { updateCardStats, supabase } from './services/supabase';
import { syncService } from './services/sync';
import { db } from './services/db';
import { FlashcardContent } from './components/FlashcardContent';
import type { Card, Deck } from './types';
import './KnowledgeApp.css';

const StudySession = () => {
    const { deckId } = useParams<{ deckId: string }>();
    const navigate = useNavigate();

    const [deck, setDeck] = useState<Deck | null>(null);
    const [cards, setCards] = useState<Card[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [showAnswer, setShowAnswer] = useState(false);
    const [loading, setLoading] = useState(true);
    const [finished, setFinished] = useState(false);

    useEffect(() => {
        if (deckId) {
            loadSession();
        }
    }, [deckId]);

    const loadSession = async () => {
        if (!deckId) return;
        setLoading(true);
        try {
            // 1. Fetch Deck info
            const { data: deckData } = await supabase.from('decks').select('*').eq('id', deckId).single();
            setDeck(deckData);

            // 2. Fetch Cards via Sync Service (handles offline)
            const cardData = await syncService.getCards(deckId);
            if (cardData) {
                const now = new Date();
                
                // Separate cards into categories
                const dueCards = cardData.filter(card => {
                    const reviewDate = new Date(card.next_review);
                    return reviewDate <= now && card.repetitions > 0;
                });
                
                const newCards = cardData.filter(card => card.repetitions === 0);
                
                // Sort due cards by how overdue they are (most overdue first)
                dueCards.sort((a, b) => new Date(a.next_review).getTime() - new Date(b.next_review).getTime());
                
                // Shuffle new cards to keep variety
                newCards.sort(() => Math.random() - 0.5);
                
                // Combine: Due cards first, then new cards
                let sessionCards = [...dueCards, ...newCards];
                
                // FALLBACK: If no cards are due or new, show cards from the rest of the deck
                // sorted by "least confidence" (lowest interval/ease factor)
                if (sessionCards.length === 0 && cardData.length > 0) {
                    const fallbackCards = [...cardData].sort((a, b) => {
                        if (a.interval !== b.interval) return a.interval - b.interval;
                        return a.ease_factor - b.ease_factor;
                    });
                    sessionCards = fallbackCards;
                }

                setCards(sessionCards);
            }
        } catch (error) {
            console.error('Failed to load session:', error);
        } finally {
            setLoading(false);
        }
    };

    const activeCard = cards[currentIndex];

    const handleRating = async (rating: 'again' | 'hard' | 'good' | 'easy') => {
        // --- Spaced Repetition (SRS) Simplified Logic ---
        let { interval, ease_factor, repetitions } = activeCard;

        if (rating === 'again') {
            repetitions = 0;
            interval = 0;
        } else {
            repetitions += 1;
            
            if (repetitions === 1) interval = 1;
            else if (repetitions === 2) interval = 6;
            else interval = Math.round(interval * ease_factor);

            if (rating === 'easy') ease_factor += 0.15;
            if (rating === 'hard') ease_factor -= 0.15;
            if (ease_factor < 1.3) ease_factor = 1.3; // Min ease
        }

        const nextReview = new Date();
        nextReview.setDate(nextReview.getDate() + (interval || 1));

        const updatedStats = {
            interval,
            ease_factor,
            repetitions,
            next_review: nextReview.toISOString()
        };

        // 1. Save Card Stats Update (Supabase - Online Only)
        if (navigator.onLine) {
            await updateCardStats(activeCard.id, updatedStats);
            
            // 2. Log to History for Stats (Supabase - Online Only)
            await supabase.from('review_history').insert({
                card_id: activeCard.id,
                rating: rating
            });
        }

        // 3. ALWAYS update locally in Dexie (Offline-First)
        await db.cards.update(activeCard.id, updatedStats);

        // Move to next card
        if (currentIndex < cards.length - 1) {
            setShowAnswer(false);
            setCurrentIndex(prev => prev + 1);
        } else {
            setFinished(true);
        }
    };

    if (loading) return (
        <div className="study-container loading-full">
            <Loader size={60} className="animate-spin" />
            <p>Gathering your knowledge...</p>
        </div>
    );

    if (finished) return (
        <div className="study-container finished">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="finish-card">
                <Sparkles size={80} color="#6366f1" />
                <h2>Session Complete! 🚀</h2>
                <p>You've reviewed all <strong>{cards.length}</strong> cards in <strong>{deck?.name}</strong>.</p>
                <div className="finish-actions">
                    <button className="primary-btn" onClick={() => navigate(`/knowledge/deck/${deckId}`)}>Back to Deck</button>
                    <button className="secondary-btn" onClick={() => {
                        setFinished(false);
                        setCurrentIndex(0);
                        setShowAnswer(false);
                        loadSession();
                    }}>Study Again</button>
                </div>
            </motion.div>
        </div>
    );

    if (cards.length === 0) return (
        <div className="study-container empty">
            <h2>No cards found. Add some knowledge first!</h2>
            <button className="primary-btn" onClick={() => navigate(`/knowledge/deck/${deckId}`)}>Back to Deck</button>
        </div>
    );

    const progress = ((currentIndex) / cards.length) * 100;

    return (
        <div className="study-container">
            <header className="study-header">
                <button className="close-btn" onClick={() => navigate(`/knowledge/deck/${deckId}`)}>
                    <ArrowLeft size={24} /> Stop Review
                </button>
                <div className="study-progress-wrapper">
                    <div className="progress-text">Card {currentIndex + 1} of {cards.length}</div>
                    <div className="progress-bar-bg">
                        <motion.div 
                            className="progress-bar-fill" 
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                        />
                    </div>
                </div>
            </header>

            <main className="study-main">
                <AnimatePresence mode="wait">
                    <motion.div 
                        key={`${activeCard.id}-${showAnswer}`}
                        initial={{ opacity: 0, y: 20, rotateY: 90 }}
                        animate={{ opacity: 1, y: 0, rotateY: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.4 }}
                        className={`flashcard ${showAnswer ? 'flipped' : ''}`}
                    >
                        {!showAnswer ? (
                            <div className="flashcard-front">
                                <Target size={32} className="card-q-icon" />
                                <div className="q-text">
                                    <FlashcardContent content={activeCard.question} />
                                </div>
                                {activeCard.image_url && <img src={activeCard.image_url} alt="Study guide" className="study-card-image" />}
                                <button className="show-btn" onClick={() => setShowAnswer(true)}>Show Answer</button>
                            </div>
                        ) : (
                            <div className="flashcard-back">
                                <div className="q-peek">
                                    <FlashcardContent content={activeCard.question} />
                                </div>
                                <div className="a-text">
                                    <FlashcardContent content={activeCard.answer} />
                                </div>
                                {activeCard.image_url && !activeCard.question.includes(activeCard.image_url) && (
                                    <img src={activeCard.image_url} alt="Study visual" className="study-card-image" />
                                )}
                                
                                <div className="rating-options">
                                    <button onClick={() => handleRating('again')} className="rate-btn again">
                                        Again <span className="rate-time">&lt; 10m</span>
                                    </button>
                                    <button onClick={() => handleRating('hard')} className="rate-btn hard">
                                        Hard <span className="rate-time">1d</span>
                                    </button>
                                    <button onClick={() => handleRating('good')} className="rate-btn good">
                                        Good <span className="rate-time">3d</span>
                                    </button>
                                    <button onClick={() => handleRating('easy')} className="rate-btn easy">
                                        Easy <span className="rate-time">5d</span>
                                    </button>
                                </div>
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </main>
        </div>
    );
};

export default StudySession;
