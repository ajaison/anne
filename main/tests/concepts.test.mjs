import assert from 'node:assert/strict';
import { test } from 'node:test';
import { cardsForConcept, conceptEvidence, summarizeConcept } from '../src/apps/knowledge/services/conceptEvidence.ts';
import { createReviewSaver, matchesReviewHistory } from '../src/apps/knowledge/services/reviewSaver.ts';

const card = { id: 'question-a', deck_id: 'deck', concept_id: 'concept-a',
  question: 'Q', answer: 'A', interval: 0, repetitions: 0, ease_factor: 2.5,
  next_review: '2026-10-04T08:00:00Z', card_type: 'multiple_choice' };
const result = { card, correct: true, attempts: 1, mode: 'multiple_choice', rating: 'good' };
const attempt = { id: 'review', card, result, rating: 'good', created_at: '2026-10-04T08:00:00Z' };

test('concept practice excludes unlinked and other-concept questions without changing deck study', () => {
  const cards = [card, { ...card, id: 'b', concept_id: 'concept-b' }, { ...card, id: 'c', concept_id: null }];
  assert.deepEqual(cardsForConcept(cards, 'concept-a'), [card]);
  assert.deepEqual(cardsForConcept(cards, 'unknown'), []);
  assert.equal(cardsForConcept(cards, null), cards);
});

test('classic self-ratings never become objective correctness; retries retain original evidence', () => {
  assert.deepEqual(conceptEvidence(attempt), {
    concept_id: 'concept-a', exercise_id: card.id, study_mode: 'multiple_choice', correct: true, first_attempt: true,
  });
  assert.equal(conceptEvidence({ ...attempt, result: { ...result, attempts: 2 } }).first_attempt, false);
  assert.deepEqual(conceptEvidence({ ...attempt, result: { ...result, mode: 'classic' } }), {
    concept_id: 'concept-a', exercise_id: card.id, study_mode: 'classic', correct: null, first_attempt: null,
  });
});

test('topic counts distinguish first-choice results, variants, historical unknowns, and self-ratings', () => {
  const base = { id: '1', card_id: 'question-a', concept_id: 'concept-a',
    created_at: '2026-10-04T08:00:00Z', study_mode: 'multiple_choice', correct: true, first_attempt: true };
  const reviews = [base,
    { ...base, id: '2', correct: false },
    { ...base, id: '3', card_id: 'question-b', first_attempt: false },
    { ...base, id: '4', study_mode: 'classic', correct: null, first_attempt: null, created_at: '2026-10-05T08:00:00Z' },
    { ...base, id: '5', concept_id: null, study_mode: null, correct: null, first_attempt: null },
    { ...base, id: '6', concept_id: 'concept-b', created_at: '2026-10-10T08:00:00Z' },
  ];
  assert.deepEqual(summarizeConcept('concept-a', reviews), {
    choiceReviews: 3, correctFirst: 1, distinctQuestions: 2, lastPractised: '2026-10-05T08:00:00.000Z',
  });
  assert.equal(summarizeConcept('unseen', reviews).lastPractised, null);
  assert.equal(summarizeConcept('concept-a', [{ ...base, created_at: 'bad date' }]).lastPractised, null);
  assert.equal(summarizeConcept('concept-a', [{ ...base, card_id: null }]).distinctQuestions, 0);
  assert.equal(summarizeConcept('concept-a', [{ ...base, card_id: null, exercise_id: 'deleted-question' }]).distinctQuestions, 1);
});

test('duplicate-ID recovery rejects mismatched concept, grading, or first-choice evidence', () => {
  const row = { card_id: card.id, rating: attempt.rating, created_at: attempt.created_at, ...conceptEvidence(attempt) };
  assert.ok(matchesReviewHistory(attempt, row));
  for (const override of [{ concept_id: 'other' }, { exercise_id: 'other' }, { correct: false }, { first_attempt: false }, { study_mode: 'classic' }]) {
    assert.equal(matchesReviewHistory(attempt, { ...row, ...override }), false);
  }
  assert.equal(matchesReviewHistory(attempt, { card_id: card.id, rating: 'good', created_at: attempt.created_at }), false);
});

test('failed concept history survives a refresh, card reassignment, and a later retry without new results', async () => {
  let draft;
  let fail = true;
  const rows = new Map();
  const dependencies = {
    online: () => true, newId: () => 'fixed-id',
    keepPending: value => { draft = value ? structuredClone(value) : undefined; },
    saveStats: async () => {}, saveCache: async () => {},
    saveHistory: async value => {
      if (fail) throw new Error('History unavailable');
      rows.set(value.id, { card_id: value.card.id, rating: value.rating, created_at: value.created_at, ...conceptEvidence(value) });
    },
  };
  const saver = createReviewSaver(dependencies);
  await assert.rejects(saver.submit(card, 'good', result, new Date(attempt.created_at)), /History unavailable/);
  const original = structuredClone(draft);
  fail = false;
  const restored = createReviewSaver(dependencies, draft);
  await restored.submit({ ...card, concept_id: 'concept-b' }, 'again', { ...result, correct: false }, new Date('2026-10-10'));
  assert.equal(rows.size, 1);
  assert.ok(matchesReviewHistory(original, rows.get('fixed-id')));
  assert.equal(rows.get('fixed-id').concept_id, 'concept-a');
  assert.equal(draft, undefined);
});
