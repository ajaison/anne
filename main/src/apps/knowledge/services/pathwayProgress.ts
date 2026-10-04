import type { Card, Concept, ConceptReview, Deck } from '../types/index.ts';
import type { Pathway } from '../curricula/pathways.ts';
import { normalizeTopicName } from '../curricula/pathways.ts';
import { choiceProblem } from './multipleChoice.ts';

export const resolvePathwayTopics = (pathway: Pathway, decks: Deck[], projectId: string) =>
  pathway.topics.map(topic => ({ ...topic, decks: decks.filter(deck => deck.project_id === projectId &&
    [topic.title, ...topic.deckNames].some(name => normalizeTopicName(name) === normalizeTopicName(deck.name))) }));

export const summarizeTopic = (decks: Deck[], concepts: Concept[], cards: Card[], reviews: ConceptReview[], now = new Date()) => {
  const deckIds = new Set(decks.map(deck => deck.id));
  const topicConcepts = concepts.filter(concept => deckIds.has(concept.deck_id));
  const conceptIds = new Set(topicConcepts.map(concept => concept.id));
  const history = reviews.filter(review => review.concept_id && conceptIds.has(review.concept_id));
  const practised = new Set(history.map(review => review.concept_id));
  const reviewedQuestions = new Set(history.map(review => review.exercise_id ?? review.card_id).filter(Boolean));
  const topicCards = cards.filter(card => deckIds.has(card.deck_id));
  const prepared = topicCards.filter(card => card.concept_id && conceptIds.has(card.concept_id) &&
    card.card_type === 'multiple_choice' && !choiceProblem(card.answer, card.distractors));
  const due = prepared.filter(card => (card.repetitions > 0 || reviewedQuestions.has(card.id)) &&
    Date.parse(card.next_review) <= now.getTime());
  const dates = history.map(review => Date.parse(review.created_at)).filter(Number.isFinite);
  return {
    concepts: topicConcepts.length, practisedConcepts: practised.size,
    questions: topicCards.length, readyQuestions: prepared.length, dueQuestions: due.length,
    lastPractised: dates.length ? new Date(Math.max(...dates)).toISOString() : null,
  };
};
