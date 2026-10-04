import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { parseCardImport } from '../src/apps/knowledge/services/cardImport.ts';
import { authoredChoices, splitChoiceAnswer } from '../src/apps/knowledge/services/multipleChoice.ts';
const read = path => readFileSync(new URL('../' + path, import.meta.url), 'utf8');
const pack = JSON.parse(read('cards/pathways/java_types_depth_1.json'));
const starter = JSON.parse(read('cards/pathways/java_foundations_1_2.json'));
const entries = p => p.topics.flatMap(t => t.concepts.flatMap(c => c.cards.map(q => ({ id: `${t.key}/${c.key}/${q.key}`, concept: c, card: q }))));
const cards = entries(pack);

test('depth batch adds 32 distinct identities and reuses all eight starter concept keys', () => {
  assert.equal(pack.java_release, 27);
  assert.equal(pack.preview_features, false);
  assert.deepEqual(pack.topics.map(t => t.key), ['types']);
  assert.equal(cards.length, 32);
  assert.equal(new Set(cards.map(c => c.id)).size, 32);
  const old = new Set(entries(starter).map(c => c.id));
  assert.ok(cards.every(c => !old.has(c.id)));
  for (const concept of starter.topics[0].concepts) {
    const reused = pack.topics[0].concepts.find(c => c.key === concept.key);
    assert.equal(reused.title, concept.title);
    assert.equal(reused.objective, concept.objective);
    assert.deepEqual(reused.identity_card_keys, concept.cards.map(q => q.key));
  }
  assert.equal(pack.topics[0].concepts.filter(c => !starter.topics[0].concepts.some(o => o.key === c.key)).length, 1);
});

test('every new card survives app option formatting and has an exact executable snippet and official citation', () => {
  const imported = parseCardImport(JSON.stringify(cards.map(({ card }) => ({ ...card,
    explanation: `${card.explanation}\n\nSource: [Official Java 27 reference](${card.source}).`,
  }))), 'deck');
  for (const [index, card] of imported.entries()) {
    const original = cards[index].card;
    assert.equal(authoredChoices(card).length, 4);
    assert.equal(splitChoiceAnswer(card.answer).correctOption, original.correct_option);
    assert.match(splitChoiceAnswer(card.answer).explanation, /Source:/);
    assert.ok(original.explanation.length > 150);
    assert.match(original.source, /^https:\/\/docs.oracle.com\/(javase\/specs\/jls\/se27\/html\/|en\/java\/javase\/27\/docs\/api\/)/);
    assert.equal(original.question.match(/```java\n([\s\S]*?)\n```/)[1], original.verification.code);
    const { kind, expected } = original.verification;
    assert.ok(['output', 'compile_error', 'runtime_exception'].includes(kind));
    if (kind === 'output') assert.ok(original.correct_option.includes(expected));
    if (kind === 'compile_error') assert.match(original.correct_option, /^Compilation fails:/);
    if (kind === 'runtime_exception') assert.ok(original.correct_option.includes(expected));
    assert.equal(card.is_code, true);
  }
});

test('repeatable SQL generation embeds only this batch with unchanged identity namespace and additive writes', () => {
  const before = read('supabase/seeds/java_types_depth_1.sql');
  const result = spawnSync(process.execPath, ['scripts/build-java-types-depth-seed.mjs'], { cwd: new URL('../', import.meta.url), encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr);
  const sql = read('supabase/seeds/java_types_depth_1.sql');
  assert.equal(sql, before);
  const payload = JSON.parse(sql.split('$java_pack$')[1]);
  assert.deepEqual(entries(payload).map(c => c.id), cards.map(c => c.id));
  assert.ok(entries(payload).every(c => !('verification' in c.card)));
  assert.match(sql, /pg_advisory_xact_lock\(20261004, 12\)/);
  assert.match(sql, /:java-foundations-v1:card:/);
  assert.match(sql, /ON CONFLICT \(id\) DO NOTHING/);
  assert.match(sql, /ARRAY\(SELECT jsonb_array_elements_text\(card->'distractors'\)\)/);
  assert.ok(sql.includes("E'\\n\\n'"));
  assert.match(sql, /known starter\/batch IDs/);
  assert.match(sql, /multiple parents/);
  assert.match(sql, /batch_questions_present/);
  // Guard against accidentally adding mutations to existing content/history.
  assert.doesNotMatch(sql, /\b(?:UPDATE public\.|DELETE FROM|ALTER TABLE|DROP TABLE|INSERT INTO public\.review_history)\b/i);
  assert.ok(sql.trimEnd().endsWith('COMMIT;'));
});
