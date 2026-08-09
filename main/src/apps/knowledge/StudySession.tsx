import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Loader, Flame, Zap, ChevronLeft } from 'lucide-react';
import { updateCardStats, supabase } from './services/supabase';
import { syncService } from './services/sync';
import { db } from './services/db';
import { FlashcardContent } from './components/FlashcardContent';
import MultipleChoiceCard from './components/MultipleChoiceCard';
import FillBlankCard from './components/FillBlankCard';
import TypeAnswerCard from './components/TypeAnswerCard';
import SessionSummary from './components/SessionSummary';
import type { Card, Deck, StudyMode, SessionCardResult, SessionResult } from './types';
import './KnowledgeApp.css';

/** Choose the best mode for a card. Respects explicit card_type, otherwise picks based on content. */
const resolveMode = (card: Card, sessionIndex: number): StudyMode => {
  if (card.card_type && card.card_type !== 'classic') return card.card_type;

  // Cycle through modes for variety: multiple_choice → fill_blank → type_answer → classic
  if (card.is_code) {
    const codeModes: StudyMode[] = ['multiple_choice', 'fill_blank', 'multiple_choice', 'fill_blank'];
    return codeModes[sessionIndex % codeModes.length];
  }
  const modes: StudyMode[] = ['multiple_choice', 'type_answer', 'multiple_choice', 'classic'];
  return modes[sessionIndex % modes.length];
};

const XP_CORRECT_FIRST = 15;
const XP_CORRECT = 10;

const StudySession = () => {
  const { deckId } = useParams<{ deckId: string }>();
  const navigate = useNavigate();

  const [deck, setDeck] = useState<Deck | null>(null);
  const [cards, setCards] = useState<Card[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [loading, setLoading] = useState(true);
  const [finished, setFinished] = useState(false);

  // Session gamification state
  const [xp, setXp] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [xpFlash, setXpFlash] = useState<number | null>(null);
  const [cardResults, setCardResults] = useState<SessionCardResult[]>([]);
  const [firstAttempt, setFirstAttempt] = useState(true); // Track if current card is first attempt

  useEffect(() => {
    if (deckId) loadSession();
  }, [deckId]);

  const loadSession = async () => {
    if (!deckId) return;
    setLoading(true);
    try {
      const { data: deckData } = await supabase.from('decks').select('*').eq('id', deckId).single();
      setDeck(deckData);

      const cardData = await syncService.getCards(deckId);
      if (cardData) {
        const now = new Date();
        const dueCards = cardData.filter(c => new Date(c.next_review) <= now && c.repetitions > 0);
        const newCards = cardData.filter(c => c.repetitions === 0);
        dueCards.sort((a, b) => new Date(a.next_review).getTime() - new Date(b.next_review).getTime());
        newCards.sort(() => Math.random() - 0.5);

        let sessionCards = [...dueCards, ...newCards];
        if (sessionCards.length === 0 && cardData.length > 0) {
          sessionCards = [...cardData].sort((a, b) => {
            if (a.interval !== b.interval) return a.interval - b.interval;
            return a.ease_factor - b.ease_factor;
          });
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
  const currentMode: StudyMode = activeCard ? resolveMode(activeCard, currentIndex) : 'classic';
  const progress = cards.length > 0 ? (currentIndex / cards.length) * 100 : 0;

  const advanceCard = () => {
    setShowAnswer(false);
    setFirstAttempt(true);
    if (currentIndex < cards.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setFinished(true);
    }
  };

  const prevCard = () => {
    if (currentIndex > 0) {
      setShowAnswer(false);
      setFirstAttempt(false);
      setCurrentIndex(prev => prev - 1);
    }
  };

  const triggerXpFlash = (amount: number) => {
    setXp(prev => prev + amount);
    setXpFlash(amount);
    setTimeout(() => setXpFlash(null), 1000);
  };

  /** Called by interactive modes (MC, FillBlank, TypeAnswer) with a boolean result */
  const handleInteractiveResult = async (correct: boolean) => {
    const earned = correct && firstAttempt ? XP_CORRECT_FIRST : correct ? XP_CORRECT : 0;
    if (earned > 0) triggerXpFlash(earned);

    const newStreak = correct ? streak + 1 : 0;
    setStreak(newStreak);
    if (newStreak > bestStreak) setBestStreak(newStreak);

    // Map result to SRS rating
    const rating = correct && firstAttempt ? 'good' : correct ? 'hard' : 'again';
    await applySRS(rating);

    setCardResults(prev => [...prev, {
      card: activeCard,
      correct: correct && firstAttempt,
      attempts: firstAttempt ? 1 : 2,
      mode: currentMode,
    }]);

    advanceCard();
  };

  /** Called by classic mode's manual rating buttons */
  const handleRating = async (rating: 'again' | 'hard' | 'good' | 'easy') => {
    const correct = rating === 'good' || rating === 'easy';
    const earned = correct ? XP_CORRECT : 0;
    if (earned > 0) triggerXpFlash(earned);

    const newStreak = correct ? streak + 1 : 0;
    setStreak(newStreak);
    if (newStreak > bestStreak) setBestStreak(newStreak);

    await applySRS(rating);

    setCardResults(prev => [...prev, {
      card: activeCard,
      correct,
      attempts: 1,
      mode: 'classic',
    }]);

    advanceCard();
  };

  const applySRS = async (rating: 'again' | 'hard' | 'good' | 'easy') => {
    let { interval, ease_factor, repetitions } = activeCard;
    if (rating === 'again') {
      repetitions = 0; interval = 0;
    } else {
      repetitions += 1;
      if (repetitions === 1) interval = 1;
      else if (repetitions === 2) interval = 6;
      else interval = Math.round(interval * ease_factor);
      if (rating === 'easy') ease_factor += 0.15;
      if (rating === 'hard') ease_factor -= 0.15;
      if (ease_factor < 1.3) ease_factor = 1.3;
    }
    const nextReview = new Date();
    nextReview.setDate(nextReview.getDate() + (interval || 1));
    const updatedStats = { interval, ease_factor, repetitions, next_review: nextReview.toISOString() };

    if (navigator.onLine) {
      await updateCardStats(activeCard.id, updatedStats);
      await supabase.from('review_history').insert({ card_id: activeCard.id, rating });
    }
    await db.cards.update(activeCard.id, updatedStats);
  };

  // --- Session Result ---
  const sessionResult: SessionResult = {
    totalCards: cards.length,
    correctFirst: cardResults.filter(r => r.correct).length,
    xpEarned: xp,
    bestStreak,
    cardResults,
  };

  // --- LOADING ---
  if (loading) return (
    <div className="study-container loading-full">
      <Loader size={60} className="animate-spin" />
      <p>Gathering your knowledge...</p>
    </div>
  );

  // --- FINISHED ---
  if (finished) return (
    <SessionSummary
      result={sessionResult}
      deckName={deck?.name || 'Deck'}
      onStudyAgain={() => {
        setFinished(false);
        setCurrentIndex(0);
        setShowAnswer(false);
        setXp(0);
        setStreak(0);
        setBestStreak(0);
        setCardResults([]);
        setFirstAttempt(true);
        loadSession();
      }}
      onBackToDeck={() => navigate(`/knowledge/deck/${deckId}`)}
    />
  );

  // --- EMPTY ---
  if (cards.length === 0) return (
    <div className="study-container empty">
      <h2>No cards found. Add some knowledge first!</h2>
      <button className="primary-btn" onClick={() => navigate(`/knowledge/deck/${deckId}`)}>Back to Deck</button>
    </div>
  );

  return (
    <div className="study-container">
      {/* Header */}
      <header className="study-header">
        <div className="study-header-row">
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <button className="close-btn" onClick={() => navigate(`/knowledge/deck/${deckId}`)}>
              <ArrowLeft size={20} /> Stop
            </button>
            {currentIndex > 0 && (
              <button className="close-btn" onClick={prevCard} title="Go back to previous card">
                <ChevronLeft size={20} /> Prev
              </button>
            )}
          </div>

          {/* XP & Streak */}
          <div className="study-meta">
            {streak >= 2 && (
              <motion.div
                className="streak-badge"
                initial={{ scale: 0 }} animate={{ scale: 1 }}
                key={streak}
              >
                <Flame size={16} /> {streak}
              </motion.div>
            )}
            <div className="xp-badge">
              <Zap size={14} /> {xp} XP
            </div>
          </div>
        </div>

        <div className="study-progress-wrapper">
          <div className="progress-text">Card {currentIndex + 1} of {cards.length}</div>
          <div className="progress-bar-bg">
            <motion.div className="progress-bar-fill" animate={{ width: `${progress}%` }} />
          </div>
        </div>
      </header>

      {/* XP Flash */}
      <AnimatePresence>
        {xpFlash !== null && (
          <motion.div
            className="xp-flash"
            initial={{ opacity: 1, y: 0, scale: 1 }}
            animate={{ opacity: 0, y: -40, scale: 1.3 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.9 }}
          >
            +{xpFlash} XP
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mode badge */}
      <div className="study-mode-badge">
        {currentMode === 'multiple_choice' && '🎯 Multiple Choice'}
        {currentMode === 'fill_blank' && '✏️ Fill in the Blank'}
        {currentMode === 'type_answer' && '⌨️ Type Answer'}
        {currentMode === 'classic' && '🃏 Classic'}
      </div>

      <main className="study-main">
        <AnimatePresence mode="wait">
          <motion.div
            key={`${activeCard.id}-${currentMode}`}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.35 }}
            className="study-card-wrapper"
          >
            {/* MULTIPLE CHOICE */}
            {currentMode === 'multiple_choice' && (
              <div className="flashcard flashcard--interactive">
                <MultipleChoiceCard
                  card={activeCard}
                  allCards={cards}
                  onResult={handleInteractiveResult}
                />
              </div>
            )}

            {/* FILL IN THE BLANK */}
            {currentMode === 'fill_blank' && (
              <div className="flashcard flashcard--interactive">
                <FillBlankCard
                  question={activeCard.question}
                  answer={activeCard.answer}
                  onResult={handleInteractiveResult}
                />
              </div>
            )}

            {/* TYPE ANSWER */}
            {currentMode === 'type_answer' && (
              <div className="flashcard flashcard--interactive">
                <TypeAnswerCard
                  question={activeCard.question}
                  answer={activeCard.answer}
                  onResult={handleInteractiveResult}
                />
              </div>
            )}

            {/* CLASSIC */}
            {currentMode === 'classic' && (
              <div className={`flashcard ${showAnswer ? 'flipped' : ''}`}>
                {!showAnswer ? (
                  <div className="flashcard-front">
                    <div className="q-text">
                      <FlashcardContent content={activeCard.question} />
                    </div>
                    {activeCard.image_url && <img src={activeCard.image_url} alt="Study guide" className="study-card-image" />}
                    <button className="show-btn" onClick={() => { setShowAnswer(true); setFirstAttempt(false); }}>
                      Show Answer
                    </button>
                  </div>
                ) : (
                  <div className="flashcard-back">
                    <div className="q-peek">
                      <FlashcardContent content={activeCard.question} />
                    </div>
                    <div className="a-text">
                      <FlashcardContent content={activeCard.answer} />
                    </div>
                    {activeCard.image_url && (
                      <img src={activeCard.image_url} alt="Study visual" className="study-card-image" />
                    )}
                    <div className="rating-options">
                      <button onClick={() => handleRating('again')} className="rate-btn again">Again <span className="rate-time">&lt; 10m</span></button>
                      <button onClick={() => handleRating('hard')} className="rate-btn hard">Hard <span className="rate-time">1d</span></button>
                      <button onClick={() => handleRating('good')} className="rate-btn good">Good <span className="rate-time">3d</span></button>
                      <button onClick={() => handleRating('easy')} className="rate-btn easy">Easy <span className="rate-time">5d</span></button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
};

export default StudySession;
