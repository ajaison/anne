import { test } from 'node:test';
import assert from 'node:assert/strict';
import { getPathway, pathwayForProject, topicUrl, conceptUrl, practiceUrl } from '../src/apps/knowledge/curricula/pathways.ts';
import { resolvePathwayTopics, summarizeTopic } from '../src/apps/knowledge/services/pathwayProgress.ts';

const java = getPathway('java-core');
const deck = { id: 'collections', project_id: 'java-project', name: 'Java Collections' };
const concepts = [
  { id: 'hashing', deck_id: deck.id }, { id: 'iteration', deck_id: deck.id },
  { id: 'effects', deck_id: 'react-deck' },
];
const card = { id: 'q1', deck_id: deck.id, concept_id: 'hashing', question: 'Q',
  answer: 'Option A', distractors: ['Option B', 'Option C', 'Option D'],
  card_type: 'multiple_choice', repetitions: 1, next_review: '2026-10-04T08:00:00Z' };
const review = { id: 'r1', card_id: card.id, exercise_id: card.id, concept_id: 'hashing',
  study_mode: 'multiple_choice', correct: false, first_attempt: true, created_at: '2026-10-03T08:00:00Z' };
const now = new Date('2026-10-04T09:00:00Z');

test('fresh Java/React projects get their pathway while unrelated projects keep ordinary decks', () => {
  assert.equal(pathwayForProject('  JAVA  '), java);
  assert.equal(pathwayForProject('Java 27'), java);
  assert.equal(pathwayForProject('React').id, 'react-core');
  assert.equal(pathwayForProject('Personal notes'), undefined);
  assert.equal(getPathway('unknown'), undefined);
});

test('pathway setup reuses exact topic aliases within this project, including several matching decks', () => {
  const sameTopic = { ...deck, id: 'collections-2', name: 'Collections Framework' };
  const unrelated = { ...deck, id: 'wrong-project', project_id: 'other' };
  const nonmatch = { ...deck, id: 'test-deck', name: 'Collections test questions' };
  const topics = resolvePathwayTopics(java, [deck, sameTopic, unrelated, nonmatch], 'java-project');
  assert.deepEqual(topics.find(topic => topic.id === 'collections').decks, [deck, sameTopic]);
  assert.equal(topics.filter(topic => !topic.decks.length).length, java.topics.length - 1);
  assert.equal(resolvePathwayTopics(java, [], 'new-project').every(topic => !topic.decks.length), true);
});

test('coverage includes failed practice but excludes unlinked history and other-topic evidence', () => {
  const summary = summarizeTopic([deck], concepts, [card], [review,
    { ...review, id: 'r2', concept_id: null, created_at: '2026-10-10T08:00:00Z' },
    { ...review, id: 'r3', concept_id: 'effects', created_at: '2026-10-11T08:00:00Z' },
  ], now);
  assert.deepEqual(summary, { concepts: 2, practisedConcepts: 1, questions: 1,
    readyQuestions: 1, dueQuestions: 1, lastPractised: '2026-10-03T08:00:00.000Z' });
  assert.equal('mastery' in summary, false);
});

test('due counts include reviewed Again cards but exclude new, future, unlinked and unprepared questions', () => {
  const cards = [
    { ...card, repetitions: 0 }, // Again resets repetitions; recorded history still marks it reviewed.
    { ...card, id: 'new', repetitions: 0 },
    { ...card, id: 'future', next_review: '2026-10-05T09:00:00Z' },
    { ...card, id: 'unlinked', concept_id: null },
    { ...card, id: 'classic', card_type: 'classic' },
    { ...card, id: 'unprepared', distractors: [] },
    { ...card, id: 'outside', deck_id: 'react-deck', concept_id: 'effects' },
  ];
  const summary = summarizeTopic([deck], concepts, cards, [review], now);
  assert.equal(summary.questions, 6);
  assert.equal(summary.readyQuestions, 3);
  assert.equal(summary.dueQuestions, 1);
});

test('empty topics never look completed and removing questions does not erase recorded concept coverage', () => {
  const empty = summarizeTopic([deck], [], [], [], now);
  assert.equal(empty.concepts, 0);
  assert.equal(empty.practisedConcepts, 0);
  assert.equal(empty.lastPractised, null);
  const retained = summarizeTopic([deck], concepts, [], [{ ...review, card_id: null }], now);
  assert.equal(retained.practisedConcepts, 1);
  assert.equal(retained.readyQuestions, 0);
  assert.equal(retained.lastPractised, '2026-10-03T08:00:00.000Z');
});

test('topic/concept/practice URLs retain only known pathway context and encode concept selectors', () => {
  assert.equal(topicUrl('deck', 'java-core'), '/knowledge/deck/deck/concepts?pathway=java-core');
  assert.equal(conceptUrl('deck', 'concept', 'react-core'), '/knowledge/deck/deck/concept/concept?pathway=react-core');
  assert.equal(topicUrl('deck', 'https://outside.example'), '/knowledge/deck/deck/concepts');
  assert.equal(practiceUrl('deck', 'a&b', 'java-core', true), '/knowledge/study/deck?conceptId=a%26b&pathway=java-core&returnToConcept=1');
});
