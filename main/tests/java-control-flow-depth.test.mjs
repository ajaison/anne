import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { parseCardImport } from '../src/apps/knowledge/services/cardImport.ts';
import { authoredChoices, splitChoiceAnswer } from '../src/apps/knowledge/services/multipleChoice.ts';
const read = path => readFileSync(new URL('../' + path, import.meta.url), 'utf8');
const pack = JSON.parse(read('cards/pathways/java_control_flow_depth_1.json'));
const entries = p => p.topics.flatMap(t => t.concepts.flatMap(c => c.cards.map(q => ({ id: `${t.key}/${c.key}/${q.key}`, card: q }))));
const priorPacks = ['java_foundations_1_2', 'java_types_depth_1', 'java_types_depth_2'].map(name => JSON.parse(read(`cards/pathways/${name}.json`)));
const old = priorPacks.flatMap(entries);
const cards = entries(pack);
const normalize = code => code.replace(/\s+/g, ' ').trim();

test('Control flow adds 40 distinct keys/scenarios while reusing eight starter concept identities', () => {
  assert.equal(pack.java_release, 27);
  assert.equal(pack.preview_features, false);
  assert.deepEqual(pack.topics.map(t => t.key), ['control-flow']);
  assert.equal(cards.length, 40);
  assert.equal(new Set(cards.map(c => c.id)).size, 40);
  assert.equal(old.length + cards.length, 160);
  assert.ok(cards.every(c => !old.some(o => o.id === c.id)));
  const legacy = ['01_variables_and_datatypes', '02_control_flow_and_loops', '03_arrays', '04_strings_and_string_pool']
    .flatMap(name => JSON.parse(read(`cards/${name}.json`)));
  const snippets = [...old.map(e => e.card.verification.code),
    ...legacy.flatMap(card => [...card.question.matchAll(/```java\n([\s\S]*?)\n```/g)].map(match => match[1]))].map(normalize);
  assert.equal(new Set(cards.map(e => normalize(e.card.verification.code))).size, 40);
  for (const { card } of cards) {
    assert.ok(!snippets.includes(normalize(card.verification.code)), card.key);
    assert.ok(card.coverage_gap.length > 25);
  }
  const starter = priorPacks[0].topics[1];
  assert.equal(pack.topics[0].concepts.length, 8);
  for (const concept of pack.topics[0].concepts) {
    const original = starter.concepts.find(c => c.key === concept.key);
    assert.equal(concept.title, original.title);
    assert.equal(concept.objective, original.objective);
    assert.deepEqual(concept.identity_card_keys, original.cards.map(c => c.key));
  }
});

test('all new questions retain four options, feedback, official sources and exact visible verification snippets', () => {
  const imported = parseCardImport(JSON.stringify(cards.map(({ card }) => ({ ...card,
    explanation: `${card.explanation}\n\nSource: [Official Java 27 reference](${card.source}).`,
  }))), 'deck');
  for (const [index, card] of imported.entries()) {
    const original = cards[index].card;
    const choices = authoredChoices(card);
    assert.equal(choices.length, 4);
    assert.equal(new Set(choices).size, 4);
    assert.equal(splitChoiceAnswer(card.answer).correctOption, original.correct_option);
    assert.ok(!choices.some(choice => choice.includes('Source:')));
    assert.match(original.source, /^https:\/\/docs.oracle.com\/(javase\/specs\/jls\/se27\/html\/|en\/java\/javase\/27\/docs\/api\/)/);
    assert.ok(original.explanation.length > 150);
    assert.equal(original.question.match(/```java\n([\s\S]*?)\n```/)[1], original.verification.code);
    const { kind, expected } = original.verification;
    assert.ok(['output', 'compile_error', 'runtime_exception'].includes(kind));
    if (kind === 'output' || kind === 'runtime_exception') assert.ok(original.correct_option.includes(expected));
    if (kind === 'compile_error') assert.match(original.correct_option, /^Compilation fails:/);
  }
});

test('Control flow SQL reproduces only its batch with correct summary IDs and insert-only preservation', () => {
  const earlierFiles = ['java_foundations_1_2', 'java_types_depth_1', 'java_types_depth_2'];
  const earlier = earlierFiles.map(name => read(`supabase/seeds/${name}.sql`));
  const before = read('supabase/seeds/java_control_flow_depth_1.sql');
  const result = spawnSync(process.execPath, ['scripts/build-java-control-flow-seed.mjs'], { cwd: new URL('../', import.meta.url), encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr);
  const sql = read('supabase/seeds/java_control_flow_depth_1.sql');
  assert.equal(sql, before);
  earlierFiles.forEach((name, index) => assert.equal(read(`supabase/seeds/${name}.sql`), earlier[index]));
  const payload = JSON.parse(sql.split('$java_pack$')[1]);
  assert.deepEqual(entries(payload).map(c => c.id), cards.map(c => c.id));
  assert.ok(entries(payload).every(c => !('verification' in c.card)));
  assert.match(sql, /:java-foundations-v1:card:control-flow:/);
  assert.doesNotMatch(sql, /:java-foundations-v1:card:types:/);
  assert.match(sql, /anne\.control_flow_batch_project/);
  assert.match(sql, /pg_advisory_xact_lock\(20261004, 12\)/);
  assert.match(sql, /ON CONFLICT \(id\) DO NOTHING/);
  assert.match(sql, /ARRAY\(SELECT jsonb_array_elements_text\(card->'distractors'\)\)/);
  assert.ok(sql.includes("E'\\n\\n'"));
  assert.match(sql, /multiple parents/);
  assert.match(sql, /batch_questions_present/);
  assert.doesNotMatch(sql, /\b(?:UPDATE public\.|DELETE FROM|ALTER TABLE|DROP TABLE|INSERT INTO public\.review_history)\b/i);
  assert.ok(sql.trimEnd().endsWith('COMMIT;'));
});
