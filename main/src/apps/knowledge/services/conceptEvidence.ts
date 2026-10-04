import type { Card, ConceptReview } from '../types/index.ts';
import type { ReviewAttempt } from './reviewSaver.ts';

/** Classic ratings are self-assessment, never verified correctness. */
export const conceptEvidence = (attempt: ReviewAttempt) => ({
  concept_id: attempt.card.concept_id ?? null,
  exercise_id: attempt.card.id,
  study_mode: attempt.result.mode,
  correct: attempt.result.mode === 'classic' ? null : attempt.result.correct,
  first_attempt: attempt.result.mode === 'classic' ? null : attempt.result.attempts === 1,
});

export const cardsForConcept = (cards: Card[], conceptId: string | null) =>
  conceptId ? cards.filter(card => card.concept_id === conceptId) : cards;

/** Recognition evidence only; old ratings and other grading modes are excluded. */
export const summarizeConcept = (conceptId: string, reviews: ConceptReview[]) => {
  const linked = reviews.filter(review => review.concept_id === conceptId);
  const choices = linked.filter(review => review.study_mode === 'multiple_choice' &&
    typeof review.correct === 'boolean' && typeof review.first_attempt === 'boolean');
  const dates = linked.map(review => Date.parse(review.created_at)).filter(Number.isFinite);
  return {
    lastPractised: dates.length ? new Date(Math.max(...dates)).toISOString() : null,
    choiceReviews: choices.length,
    correctFirst: choices.filter(review => review.correct && review.first_attempt).length,
    distinctQuestions: new Set(choices.map(review => review.exercise_id ?? review.card_id).filter(Boolean)).size,
  };
};
