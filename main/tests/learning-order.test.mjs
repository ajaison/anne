import { test } from 'node:test';
import assert from 'node:assert/strict';
import { compareLearningOrder, orderNewCards } from '../src/apps/knowledge/services/learningOrder.ts';
import { dailyStudyQueue } from '../src/apps/knowledge/services/dailyStudy.ts';
import { getPathway } from '../src/apps/knowledge/curricula/pathways.ts';

test('teaching order beats UUID order; unsequenced cards follow; inputs stay unchanged', () => {
  const cards = [{ id: 'a', learning_order: 1030 }, { id: 'z', learning_order: 1010 },
    { id: 'b', learning_order: null }, { id: 'c' }];
  const before = JSON.stringify(cards);
  assert.deepEqual(orderNewCards(cards).map(c => c.id), ['z', 'a', 'b', 'c']);
  assert.equal(JSON.stringify(cards), before);
  assert.equal(compareLearningOrder({ id: 'a' }, { id: 'b' }), -1);
  assert.ok(compareLearningOrder({ id: 'a', learning_order: NaN }, { id: 'z', learning_order: 1 }) > 0);
});

test('daily study applies teaching order only to new cards, retaining oldest-due-first and limits', () => {
  const deck = { id: 'deck', name: 'Control flow', project_id: 'java' };
  const concept = { id: 'concept', deck_id: 'deck' };
  const card = (id, order, repetitions = 0, next_review = '2026-10-03T00:00:00Z') => ({
    id, deck_id: 'deck', concept_id: 'concept', learning_order: order, repetitions, next_review,
    answer: 'A\n\nExplanation', distractors: ['B', 'C', 'D'], card_type: 'multiple_choice',
  });
  const cards = [card('a-hard', 2000), card('z-basic', 1010), card('b-due', 9999, 2, '2026-10-01T00:00:00Z'),
    card('a-due', 1, 2), ...Array.from({ length: 6 }, (_, i) => card(`extra-${i}`, 1100 + i))];
  const before = JSON.stringify(cards);
  const queue = dailyStudyQueue(getPathway('java-core'), 'java', [deck], [concept], cards, [], new Date('2026-10-04T12:00:00Z'));
  assert.deepEqual(queue.cards.slice(0, 3).map(c => c.id), ['b-due', 'a-due', 'z-basic']);
  assert.equal(queue.newCount, 5);
  assert.equal(queue.dueCount, 2);
  assert.equal(JSON.stringify(cards), before);
});
