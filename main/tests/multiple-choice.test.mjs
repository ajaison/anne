import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync } from 'node:fs';
import { authoredChoices, choiceProblem, displayChoice, splitChoiceAnswer } from '../src/apps/knowledge/services/multipleChoice.ts';
import { parseCardImport } from '../src/apps/knowledge/services/cardImport.ts';

test('new imports keep the correct option separate from feedback in existing storage fields', () => {
  const [card] = parseCardImport(JSON.stringify([{
    question: 'Which rule holds?', correct_option: 'Equal values share a hash.',
    explanation: 'Why it works.\n\nWhy the alternatives are wrong.',
    distractors: ['Every hash is unique.', 'Equal values have different hashes.', 'Identity always decides equality.'],
    card_type: 'multiple_choice',
  }]), 'deck');
  const content = splitChoiceAnswer(card.answer);
  assert.equal(content.correctOption, 'Equal values share a hash.');
  assert.equal(content.explanation, 'Why it works.\n\nWhy the alternatives are wrong.');
  assert.deepEqual(Object.keys(card).sort(), ['answer', 'card_type', 'deck_id', 'distractors', 'image_url', 'is_code', 'question']);
});

test('legacy answers retain multiline choices but never include post-answer explanation', () => {
  const answer = '```text\nfirst line\nsecond line\n```\n\nExplanation';
  const choices = authoredChoices({ answer, distractors: ['other output 1', 'other output 2', 'other output 3'] }, () => 0.5);
  assert.equal(choices.length, 4);
  assert.ok(choices.includes('first line\nsecond line'));
  assert.ok(choices.every(choice => !choice.includes('Explanation')));
  assert.equal(displayChoice('`HashMap`'), 'HashMap');
});

test('unprepared stored cards produce no filler choices', () => {
  for (const distractors of [undefined, [], ['One'], ['One', 'Two'], ['One', 'Two', 'Three', 'Four']]) {
    const card = { answer: 'Correct', distractors };
    assert.match(choiceProblem(card.answer, distractors), /three/);
    assert.deepEqual(authoredChoices(card), []);
  }
});

test('duplicate/correct-equivalent distractors reject the entire import batch', () => {
  for (const distractors of [ ['HashMap', 'TreeMap', 'HashSet'], ['TreeMap', '`TreeMap`', 'HashSet'] ]) {
    assert.throws(() => parseCardImport(JSON.stringify([
      { question: 'Valid classic', answer: 'A' },
      { question: 'Q', answer: 'HashMap\n\nFeedback', distractors, card_type: 'multiple_choice' },
    ]), 'deck'), /Card 2:.*different/);
  }
  assert.throws(() => parseCardImport(JSON.stringify([
    { question: 'Q', answer: 'A', card_type: 'multiple_choice' },
  ]), 'deck'), /exactly three/);
});

test('shuffling neither mutates authored content nor changes the available options', () => {
  const card = { answer: 'Correct\n\nFeedback', distractors: ['Wrong 1', 'Wrong 2', 'Wrong 3'] };
  const original = structuredClone(card);
  const first = authoredChoices(card, () => 0);
  const second = authoredChoices(card, () => 0.99);
  assert.notDeepEqual(first, second);
  assert.deepEqual([...first].sort(), [...second].sort());
  assert.deepEqual(card, original);
  assert.equal(new Set(first).size, 4);
});

test('Java pilot provides four complete, comparable option sets with source-linked feedback', () => {
  const raw = readFileSync(new URL('../cards/pilots/java_collections_choices.json', import.meta.url), 'utf8');
  const cards = parseCardImport(raw, 'deck');
  assert.equal(cards.length, 4);
  for (const card of cards) {
    const choices = authoredChoices(card, () => 0.5);
    assert.equal(card.card_type, 'multiple_choice');
    assert.equal(choices.length, 4);
    const lengths = choices.map(choice => choice.length);
    assert.ok(Math.max(...lengths) / Math.min(...lengths) < 1.6);
    assert.match(splitChoiceAnswer(card.answer).explanation, /https:\/\/docs.oracle.com/);
  }
});
