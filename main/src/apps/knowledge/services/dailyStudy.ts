import type { Card, Concept, ConceptReview, Deck } from '../types/index.ts';
import type { Pathway } from '../curricula/pathways.ts';
import { resolvePathwayTopics } from './pathwayProgress.ts';
import { compareLearningOrder } from './learningOrder.ts';
import { choiceProblem } from './multipleChoice.ts';

export const DAILY_SESSION_LIMIT = 20;
export const DAILY_NEW_LIMIT = 5;

/** A bounded session, not a calendar-day quota. Extra practice stays separate. */
export const dailyStudyQueue = (pathway: Pathway, projectId: string,
  decks: Deck[], concepts: Concept[], cards: Card[], reviews: ConceptReview[], now = new Date()) => {
  const topics = resolvePathwayTopics(pathway, decks, projectId);
  const deckOrder = new Map(topics.flatMap((topic, index) => topic.decks.map(deck => [deck.id, index] as const)));
  const conceptDecks = new Map(concepts.map(concept => [concept.id, concept.deck_id]));
  const reviewed = new Set(reviews.filter(review => review.concept_id && conceptDecks.has(review.concept_id))
    .map(review => review.exercise_id ?? review.card_id).filter(Boolean));
  const ready = cards.filter(card => deckOrder.has(card.deck_id) && card.concept_id &&
    conceptDecks.get(card.concept_id) === card.deck_id && card.card_type === 'multiple_choice' &&
    !choiceProblem(card.answer, card.distractors));
  const isReviewed = (card: Card) => card.repetitions > 0 || reviewed.has(card.id);
  const due = ready.filter(card => isReviewed(card) && Date.parse(card.next_review) <= now.getTime())
    .sort((a, b) => Date.parse(a.next_review) - Date.parse(b.next_review) || a.id.localeCompare(b.id));
  const unseen = ready.filter(card => card.repetitions === 0 && !isReviewed(card))
    .sort((a, b) => deckOrder.get(a.deck_id)! - deckOrder.get(b.deck_id)! ||
      compareLearningOrder(a, b));
  const dueCards = due.slice(0, DAILY_SESSION_LIMIT);
  const newCards = unseen.slice(0, Math.min(DAILY_NEW_LIMIT, DAILY_SESSION_LIMIT - dueCards.length));
  return { cards: [...dueCards, ...newCards], dueCount: dueCards.length, newCount: newCards.length,
    remainingDue: due.length - dueCards.length, availableNew: unseen.length };
};
