import { test } from 'node:test';
import assert from 'node:assert/strict';
import { getPathway } from '../src/apps/knowledge/curricula/pathways.ts';
import { dailyStudyQueue } from '../src/apps/knowledge/services/dailyStudy.ts';

const pathway = getPathway('java-core');
const decks = [
  { id: 'types', name: 'Types, variables and operators', project_id: 'java' },
  { id: 'control', name: 'Control flow', project_id: 'java' },
  { id: 'other', name: 'Personal notes', project_id: 'java' },
  { id: 'foreign', name: 'Types, variables and operators', project_id: 'another-java' },
];
const concepts = decks.map(deck => ({ id: `${deck.id}-concept`, deck_id: deck.id }));
const now = new Date('2026-10-04T12:00:00Z');
const card = (id, changes = {}) => ({ id, deck_id: 'types', concept_id: 'types-concept',
  question: 'Which value?', answer: 'A\n\nExplanation', distractors: ['B', 'C', 'D'],
  card_type: 'multiple_choice', repetitions: 0, next_review: '2026-10-03T12:00:00Z',
  interval: 0, ease_factor: 2.5, ...changes });
const queue = (cards, reviews = []) => dailyStudyQueue(pathway, 'java', decks, concepts, cards, reviews, now);

test('prioritizes oldest due reviews across topics, then limits new questions to five in pathway order', () => {
  const cards = [card('later-due', { repetitions: 2 }),
    card('oldest-due', { repetitions: 1, deck_id: 'control', concept_id: 'control-concept', next_review: '2026-10-01T12:00:00Z' }),
    ...Array.from({ length: 8 }, (_, i) => card(`new-${i}`)),
    card('control-new', { deck_id: 'control', concept_id: 'control-concept' })];
  const original = JSON.stringify(cards);
  const result = queue(cards);
  assert.deepEqual(result.cards.slice(0, 2).map(card => card.id), ['oldest-due', 'later-due']);
  assert.equal(result.newCount, 5);
  assert.equal(result.dueCount, 2);
  assert.ok(result.cards.slice(2).every(card => card.deck_id === 'types'));
  assert.equal(JSON.stringify(cards), original);
});

test('caps the session at twenty, exposes remaining reviews and defers new content during a backlog', () => {
  const result = queue([...Array.from({ length: 23 }, (_, i) => card(`due-${i}`, { repetitions: 1 })), card('new')]);
  assert.equal(result.cards.length, 20);
  assert.equal(result.dueCount, 20);
  assert.equal(result.newCount, 0);
  assert.equal(result.remainingDue, 3);
  const nearlyFull = queue([...Array.from({ length: 19 }, (_, i) => card(`due-${i}`, { repetitions: 1 })), card('new'), card('new-2')]);
  assert.equal(nearlyFull.newCount, 1);
});

test('Again cards with zero repetitions stay reviews; future and invalid schedules do not become new', () => {
  const reviews = ['again', 'again-future'].map(id => ({ exercise_id: id, card_id: null, concept_id: 'types-concept' }));
  const result = queue([card('again'), card('again-future', { next_review: '2026-10-05T12:00:00Z' }),
    card('future', { repetitions: 2, next_review: '2026-10-05T12:00:00Z' }),
    card('invalid', { repetitions: 2, next_review: 'bad-date' }), card('new')], reviews);
  assert.deepEqual(result.cards.map(card => card.id), ['again', 'new']);
  assert.equal(result.dueCount, 1);
  assert.equal(result.newCount, 1);
});

test('only complete concept-linked MC in matching project topics can enter daily study', () => {
  const result = queue([card('valid'), card('unlinked', { concept_id: null }),
    card('wrong-link', { concept_id: 'control-concept' }), card('unprepared', { distractors: [] }),
    card('typed', { card_type: 'type_answer' }),
    card('other', { deck_id: 'other', concept_id: 'other-concept' }),
    card('foreign', { deck_id: 'foreign', concept_id: 'foreign-concept' })]);
  assert.deepEqual(result.cards.map(card => card.id), ['valid']);
});

test('caught-up pathways return no cram fallback and empty pathways are safe', () => {
  assert.equal(queue([card('future', { repetitions: 1, next_review: '2026-10-05T12:00:00Z' })]).cards.length, 0);
  assert.equal(dailyStudyQueue(pathway, 'empty', [], [], [], [], now).cards.length, 0);
});
