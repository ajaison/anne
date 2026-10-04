import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync, readdirSync } from 'node:fs';
import { parseCardImport } from '../src/apps/knowledge/services/cardImport.ts';
import { parseStudyMode, resolveStudyMode, STUDY_MODES } from '../src/apps/knowledge/services/studyModes.ts';

test('explicit modes are preserved, legacy blanks normalize, unknown stored modes fall back', () => {
  for (const mode of STUDY_MODES) assert.equal(resolveStudyMode(mode), mode);
  assert.equal(resolveStudyMode('fill_in_the_blank'), 'fill_blank');
  for (const mode of [undefined, null, '', 'unknown', 42]) {
    assert.equal(parseStudyMode(mode), undefined);
    assert.equal(resolveStudyMode(mode), 'classic');
  }
});

test('JSON aliases and multiline code survive import with legacy modes normalized', () => {
  const question = 'Predict:\n```java\nint x = 1;\n```';
  const [card] = parseCardImport(JSON.stringify([
    { q: question, a: '1\n\nExplanation', t: 'fill_in_the_blank', c: true, d: ['2', '3'] },
  ]), 'deck');
  assert.equal(card.deck_id, 'deck');
  assert.equal(card.question, question);
  assert.equal(card.answer, '1\n\nExplanation');
  assert.equal(card.card_type, 'fill_blank');
  assert.equal(card.is_code, true);
  assert.deepEqual(card.distractors, ['2', '3']);
});

test('pipe imports preserve code/type pipes and correctly handle false code flags', () => {
  const cards = parseCardImport(
    'Q: What is string | number? | A: A union | C: false | TYPE: classic\n\n' +
    'Q: Complete int n = 1 | 2; | A: int | TYPE: fill_in_the_blank | C: true\n' +
    'Simple question | Simple answer', 'deck');
  assert.equal(cards.length, 3);
  assert.equal(cards[0].question, 'What is string | number?');
  assert.equal(cards[0].is_code, false);
  assert.equal(cards[1].question, 'Complete int n = 1 | 2;');
  assert.equal(cards[1].card_type, 'fill_blank');
  assert.equal(cards[2].card_type, 'classic');
});

test('one invalid card rejects the entire batch with item-level errors', () => {
  assert.throws(() => parseCardImport(JSON.stringify([
    { question: 'Valid', answer: 'Valid' },
    { question: ' ', answer: 'Valid', card_type: 'unsupported' },
    { question: 'Valid', answer: 123 },
  ]), 'deck'), error => {
    assert.match(error.message, /Nothing was imported/);
    assert.match(error.message, /Card 2:.*question.*unsupported study mode/);
    assert.match(error.message, /Card 3:.*answer/);
    return true;
  });
  assert.throws(() => parseCardImport('Q: Valid | A: Valid\nbad line', 'deck'), /Line 2/);
});

test('malformed JSON, non-arrays, empty batches and invalid field shapes are rejected', () => {
  for (const text of ['[{"question": "missing closing bracket"}', '{}', 'null', '[]', '']) {
    assert.throws(() => parseCardImport(text, 'deck'));
  }
  for (const fields of [
    { card_type: null }, { card_type: '' }, { card_type: 1 },
    { is_code: 'false-ish' }, { distractors: 'wrong' }, { distractors: [1] },
    { image_url: 42 },
  ]) {
    assert.throws(() => parseCardImport(JSON.stringify([
      { question: 'Q', answer: 'A', ...fields },
    ]), 'deck'), /Card 1/);
  }
});

test('all 80 bundled cards import successfully with supported modes', () => {
  let count = 0;
  const directory = new URL('../cards/', import.meta.url);
  for (const name of readdirSync(directory).filter(name => name.endsWith('.json'))) {
    const cards = parseCardImport(readFileSync(new URL(name, directory), 'utf8'), 'deck');
    for (const card of cards) assert.ok(STUDY_MODES.includes(card.card_type));
    count += cards.length;
  }
  assert.equal(count, 80);
});
