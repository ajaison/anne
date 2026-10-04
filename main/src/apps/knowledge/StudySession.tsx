import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Loader, Flame, Zap, ChevronLeft } from 'lucide-react';
import { supabase } from './services/supabase';
import { syncService } from './services/sync';
import { db } from './services/db';
import { resolveStudyMode } from './services/studyModes';
import { makeReviewSaver } from './services/reviewPersistence';
import type { ReviewAttempt } from './services/reviewSaver';
import { reviewIntervalLabel, scheduleReview } from './services/scheduler';
import { cardsForConcept } from './services/conceptEvidence';
import { choiceProblem } from './services/multipleChoice';
import { loadTopicCards } from './services/concepts';
import { conceptUrl, topicUrl } from './curricula/pathways';
import { FlashcardContent } from './components/FlashcardContent';
import MultipleChoiceCard from './components/MultipleChoiceCard';
import FillBlankCard from './components/FillBlankCard';
import TypeAnswerCard from './components/TypeAnswerCard';
import SessionSummary from './components/SessionSummary';
import type { Card, Deck, StudyMode, ReviewRating, SessionCardResult, SessionResult } from './types';
import './KnowledgeApp.css';

const RATINGS: ReviewRating[] = ['again', 'hard', 'good', 'easy'];

const StudySession = () => {
  const { deckId } = useParams<{ deckId: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const conceptId = searchParams.get('conceptId');
  const backPath = conceptId ? (searchParams.get('returnToConcept') === '1'
    ? conceptUrl(deckId!, conceptId, searchParams.get('pathway'))
    : topicUrl(deckId!, searchParams.get('pathway'))) : `/knowledge/deck/${deckId}`;

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
  const [skippedIds, setSkippedIds] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [pendingReview, setPendingReview] = useState<ReviewAttempt | undefined>();
  const [online, setOnline] = useState(navigator.onLine);
  const [sessionRun, setSessionRun] = useState(0);
  const saverRef = useRef<ReturnType<typeof makeReviewSaver> | null>(null);

  useEffect(() => {
    const updateOnline = () => setOnline(navigator.onLine);
    window.addEventListener('online', updateOnline);
    window.addEventListener('offline', updateOnline);
    return () => {
      window.removeEventListener('online', updateOnline);
      window.removeEventListener('offline', updateOnline);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      if (!deckId) return;
      setLoading(true);
      setLoadError(null);
      setSaveError(null);
      setPendingReview(undefined);
      setCurrentIndex(0);
      setShowAnswer(false);
      setFinished(false);
      setCardResults([]);
      setSkippedIds([]);
      setXp(0);
      setStreak(0);
      setBestStreak(0);
      setXpFlash(null);
      try {
        const saver = makeReviewSaver(deckId);
        saverRef.current = saver;
        const pending = saver.getPending();
        if (conceptId) {
          if (!navigator.onLine) throw new Error('Reconnect to load concept practice. Downloaded deck study remains available.');
          const { data, error } = await supabase.from('concepts').select('id')
            .eq('id', conceptId).eq('deck_id', deckId).single();
          if (error || !data) throw new Error('This concept could not be loaded in this deck. Return to the topic and try again.');
        }
        const getDeck = async () => {
          if (navigator.onLine) {
            const { data } = await supabase.from('decks').select('*').eq('id', deckId).single();
            if (data) return data as Deck;
          }
          return await db.decks.get(deckId) ?? null;
        };
        const [deckData, allCards] = await Promise.all([getDeck(), conceptId
          ? loadTopicCards(deckId, conceptId) : syncService.getCards(deckId)]);
        const cardData = cardsForConcept(allCards, conceptId).filter(card => !conceptId ||
          (card.card_type === 'multiple_choice' && !choiceProblem(card.answer, card.distractors)));
        if (cancelled) return;
        setDeck(deckData);
        const now = new Date();
        const due = cardData.filter(c => new Date(c.next_review) <= now && c.repetitions > 0)
          .sort((a, b) => Date.parse(a.next_review) - Date.parse(b.next_review));
        const unseen = cardData.filter(c => c.repetitions === 0).sort(() => Math.random() - 0.5);
        let sessionCards = [...due, ...unseen];
        if (!sessionCards.length && cardData.length) {
          sessionCards = [...cardData].sort((a, b) => a.interval - b.interval || a.ease_factor - b.ease_factor);
        }
        if (pending) {
          sessionCards = [pending.card, ...sessionCards.filter(c => c.id !== pending.card.id)];
          setPendingReview(pending);
          setSaveError(conceptId && pending.card.concept_id !== conceptId
            ? 'An unfinished review from this deck was restored. Retry to save that original result before practising this concept.'
            : 'An unfinished review was restored. Retry to finish saving your original result.');
        }
        setCards(sessionCards);
      } catch (error) {
        if (!cancelled) setLoadError(error instanceof Error ? error.message : 'Unable to load this session.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    void load();
    return () => { cancelled = true; };
  }, [deckId, conceptId, sessionRun]);

  const activeCard = cards[currentIndex];
  const currentMode: StudyMode = resolveStudyMode(activeCard?.card_type);
  const recordedResult = cardResults.find(result => result.card.id === activeCard?.id);
  const displayedResult = recordedResult ?? pendingReview?.result;
  const wasSkipped = skippedIds.includes(activeCard?.id);
  const progress = cards.length > 0 ? ((cardResults.length + skippedIds.length) / cards.length) * 100 : 0;

  const advanceCard = () => {
    setShowAnswer(false);
    if (currentIndex < cards.length - 1) setCurrentIndex(currentIndex + 1);
    else setFinished(true);
  };

  const skipUnpreparedCard = () => {
    if (saverRef.current?.isBusy() || saverRef.current?.getPending()) return;
    setSkippedIds(previous => previous.includes(activeCard.id) ? previous : [...previous, activeCard.id]);
    advanceCard();
  };

  const prevCard = () => {
    if (currentIndex > 0 && !saverRef.current?.getPending()) {
      setShowAnswer(false);
      setCurrentIndex(currentIndex - 1);
    }
  };

  const submitReview = async (card: Card, rating: ReviewRating, result: SessionCardResult) => {
    const saver = saverRef.current;
    if (!saver || saver.isBusy()) return;
    setSaving(true);
    setSaveError(null);
    try {
      const saved = await saver.submit(card, rating, result);
      if (!saved || saverRef.current !== saver) return;
      const updatedCard = { ...saved.card, ...saved.stats };
      setCards(previous => previous.map(c => c.id === updatedCard.id ? updatedCard : c));
      setCardResults(previous => [...previous, { ...saved.result, card: updatedCard }]);
      const earned = saved.result.correct ? (saved.result.mode === 'classic' ? 10 : 15) : 0;
      if (earned) {
        setXp(previous => previous + earned);
        setXpFlash(earned);
        setTimeout(() => setXpFlash(null), 1000);
      }
      const nextStreak = saved.result.correct ? streak + 1 : 0;
      setStreak(nextStreak);
      setBestStreak(previous => Math.max(previous, nextStreak));
      setPendingReview(undefined);
      advanceCard();
    } catch (error) {
      if (saverRef.current !== saver) return;
      setPendingReview(saver.getPending());
      setSaveError(error instanceof Error ? error.message : 'Review could not be saved. Retry to finish.');
    } finally {
      if (saverRef.current === saver) setSaving(false);
    }
  };

  const handleInteractiveResult = (correct: boolean) => {
    const rating = correct ? 'good' : 'again';
    return submitReview(activeCard, rating, {
      card: activeCard, correct, attempts: 1, mode: currentMode, rating,
    });
  };

  const handleRating = (rating: ReviewRating) => submitReview(activeCard, rating, {
    card: activeCard, correct: rating === 'good' || rating === 'easy',
    attempts: 1, mode: 'classic', rating,
  });

  // --- Session Result ---
  const sessionResult: SessionResult = {
    totalCards: cardResults.length,
    skippedCards: skippedIds.length,
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
        setSessionRun(previous => previous + 1);
      }}
      onBackToDeck={() => navigate(backPath)}
    />
  );

  if (loadError) return (
    <div className="study-container empty">
      <p role="alert">{loadError}</p>
      <button className="primary-btn" onClick={() => setSessionRun(previous => previous + 1)}>Retry loading</button>
      <button className="close-btn" disabled={saving} onClick={() => {
              if (!saverRef.current?.isBusy()) navigate(backPath);
            }}>Back to Deck</button>
    </div>
  );

  // --- EMPTY ---
  if (cards.length === 0) return (
    <div className="study-container empty">
      <h2>No cards found. Add some knowledge first!</h2>
      <button className="primary-btn" onClick={() => navigate(backPath)}>Back to Deck</button>
    </div>
  );

  return (
    <div className="study-container">
      {/* Header */}
      <header className="study-header">
        <div className="study-header-row">
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <button className="close-btn" disabled={saving} onClick={() => {
              if (!saverRef.current?.isBusy()) navigate(backPath);
            }}>
              <ArrowLeft size={20} /> Stop
            </button>
            {currentIndex > 0 && (
              <button className="close-btn" disabled={saving || !!pendingReview} onClick={prevCard} title="Go back to previous card">
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

      {!online && (
        <p className="study-save-notice" role="status">
          You are offline. You can read downloaded content; reconnect to save reviews.
          Offline review syncing is not available yet.
        </p>
      )}
      {saving && <p className="study-save-notice" role="status">Saving review…</p>}
      {saveError && (
        <div className="study-save-notice study-save-error" role="alert">
          <p>{saveError}</p>
          {pendingReview && (
            <button className="primary-btn" disabled={saving} onClick={() =>
              submitReview(pendingReview.card, pendingReview.rating, pendingReview.result)
            }>Retry saving review</button>
          )}
        </div>
      )}
      <main className="study-main" aria-busy={saving}>
        <AnimatePresence mode="wait">
          <motion.div
            key={`${activeCard.id}-${currentMode}`}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.35 }}
            className="study-card-wrapper"
          >
            {wasSkipped ? (
              <div className="flashcard flashcard--interactive saved-review">
                <p>Skipped: this card needs answer choices. No review or XP was recorded.</p>
                <FlashcardContent content={activeCard.question} />
                <button className="primary-btn" onClick={advanceCard}>Next Question →</button>
              </div>
            ) : recordedResult || pendingReview ? (
              <div className="flashcard flashcard--interactive">
                <div className="saved-review">
                  <p className="study-mode-badge">
                    {recordedResult ? 'Review already recorded' : 'Review waiting to save'}
                  </p>
                  <FlashcardContent content={activeCard.question} />
                  <FlashcardContent content={activeCard.answer} />
                  <p>{displayedResult?.mode === 'classic'
                    ? `Self-rated: ${displayedResult.rating}`
                    : displayedResult?.correct ? 'Correct on first attempt' : 'Incorrect on first attempt'}</p>
                  {recordedResult && (
                    <>
                      <p>Next review: {new Date(recordedResult.card.next_review).toLocaleString()}</p>
                      <p>This card is read-only. Your score and review history stay unchanged.</p>
                      <button className="primary-btn" onClick={advanceCard}>Next Question →</button>
                    </>
                  )}
                </div>
              </div>
            ) : (
              <>
            {/* MULTIPLE CHOICE */}
            {currentMode === 'multiple_choice' && (
              <div className="flashcard flashcard--interactive">
                <MultipleChoiceCard
                  card={activeCard}
                  onSkip={skipUnpreparedCard}
                  onResult={handleInteractiveResult}
                  disabled={saving}
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
                  disabled={saving}
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
                  disabled={saving}
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
                    <button className="show-btn" onClick={() => setShowAnswer(true)}>
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
                      {RATINGS.map(rating => (
                        <button key={rating} disabled={saving} onClick={() => handleRating(rating)}
                          className={`rate-btn ${rating}`}
                          title={`Next review: ${new Date(scheduleReview(activeCard, rating).next_review).toLocaleString()}`}>
                          {rating[0].toUpperCase() + rating.slice(1)}
                          <span className="rate-time">{reviewIntervalLabel(activeCard, rating)}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
};

export default StudySession;
