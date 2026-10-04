import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { parseCardImport } from '../src/apps/knowledge/services/cardImport.ts';
import { authoredChoices, splitChoiceAnswer } from '../src/apps/knowledge/services/multipleChoice.ts';
import { getPathway } from '../src/apps/knowledge/curricula/pathways.ts';
import { resolvePathwayTopics } from '../src/apps/knowledge/services/pathwayProgress.ts';

const pack = JSON.parse(readFileSync(new URL('../cards/pathways/java_foundations_1_2.json', import.meta.url), 'utf8'));
const cards = pack.topics.flatMap(topic => topic.concepts.flatMap(concept => concept.cards));

test('foundations pack maps to exactly the first two Java topics and covers separate stable concepts', () => {
  const java = getPathway('java-core');
  assert.equal(pack.java_release, 27);
  assert.equal(pack.topics.length, 2);
  assert.deepEqual(pack.topics.map(topic => topic.key), java.topics.slice(0, 2).map(topic => topic.id));
  const keys = new Set();
  for (const topic of pack.topics) {
    assert.equal(topic.concepts.length, 8);
    const deck = { id: topic.key, project_id: 'java', name: topic.title };
    assert.equal(resolvePathwayTopics(java, [deck], 'java').find(entry => entry.id === topic.key).decks[0].id, deck.id);
    for (const concept of topic.concepts) {
      assert.ok(concept.objective.trim());
      assert.equal(concept.cards.length, 3);
      for (const card of concept.cards) {
        const key = `${topic.key}/${concept.key}/${card.key}`;
        assert.equal(keys.has(key), false);
        keys.add(key);
      }
    }
  }
  assert.equal(keys.size, 48);
});

test('all authored options and explanations survive the existing MC import/storage/rendering format', () => {
  const imported = parseCardImport(JSON.stringify(cards.map(card => ({ ...card,
    explanation: `${card.explanation}\n\nSource: [Java 27 language specification](${card.source}).`,
  }))), 'deck');
  assert.equal(imported.length, 48);
  for (const [index, card] of imported.entries()) {
    const choices = authoredChoices(card, () => 0.5);
    assert.equal(choices.length, 4);
    assert.equal(new Set(choices).size, 4);
    assert.equal(splitChoiceAnswer(card.answer).correctOption, cards[index].correct_option);
    assert.match(splitChoiceAnswer(card.answer).explanation, /docs\.oracle\.com\/javase\/specs\/jls\/se27/);
    assert.equal(card.card_type, 'multiple_choice');
    assert.ok(!choices.some(choice => choice.includes('Source:')));
  }
});

test('Java verification executes the exact learner-visible snippets and supports each claimed answer', () => {
  for (const card of cards) {
    assert.equal(card.question.match(/```java\n([\s\S]*?)\n```/)[1], card.verification.code);
    const { kind, expected } = card.verification;
    assert.ok(['output', 'compile_error', 'runtime_exception'].includes(kind));
    assert.equal(typeof expected, 'string');
    if (kind === 'output') assert.ok(card.correct_option.includes(expected));
    if (kind === 'compile_error') assert.match(card.correct_option, /^Compilation fails:/);
    if (kind === 'runtime_exception') assert.ok(card.correct_option.includes(expected));
  }
});
