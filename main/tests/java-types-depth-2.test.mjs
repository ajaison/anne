import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { parseCardImport } from '../src/apps/knowledge/services/cardImport.ts';
import { authoredChoices, splitChoiceAnswer } from '../src/apps/knowledge/services/multipleChoice.ts';
const read = path => readFileSync(new URL('../' + path, import.meta.url), 'utf8');
const pack = JSON.parse(read('cards/pathways/java_types_depth_2.json'));
const previous = ['java_foundations_1_2', 'java_types_depth_1'].map(name => JSON.parse(read(`cards/pathways/${name}.json`)));
const entries = p => p.topics.flatMap(t => t.concepts.flatMap(c => c.cards.map(q => ({ id: `${t.key}/${c.key}/${q.key}`, concept: c, card: q }))));
const cards = entries(pack);
const old = previous.flatMap(entries);
const normalizeSnippet = code => code.replace(/\s+/g, ' ').trim();

test('depth 2 adds 40 disjoint card keys/snippets and reuses six existing concept identities', () => {
  assert.equal(pack.java_release, 27);
  assert.equal(pack.preview_features, false);
  assert.deepEqual(pack.topics.map(t => t.key), ['types']);
  assert.equal(cards.length, 40);
  assert.equal(new Set(cards.map(c => c.id)).size, 40);
  assert.ok(cards.every(c => !old.some(o => o.id === c.id)));
  assert.equal(old.length + cards.length, 120);
  assert.equal(pack.topics[0].concepts.length, 6);
  const legacy = ['01_variables_and_datatypes', '02_control_flow_and_loops', '03_arrays', '04_strings_and_string_pool']
    .flatMap(name => JSON.parse(read(`cards/${name}.json`)));
  const knownSnippets = [...old.map(e => e.card.verification.code),
    ...legacy.flatMap(card => [...card.question.matchAll(/```java\n([\s\S]*?)\n```/g)].map(match => match[1]))]
    .map(normalizeSnippet);
  assert.equal(new Set(cards.map(e => normalizeSnippet(e.card.verification.code))).size, 40);
  for (const { card } of cards) {
    assert.ok(!knownSnippets.includes(normalizeSnippet(card.verification.code)), card.key);
    assert.ok(card.coverage_gap.length > 25, card.key);
  }
  for (const concept of pack.topics[0].concepts) {
    const original = previous[0].topics[0].concepts.find(c => c.key === concept.key);
    assert.equal(concept.title, original.title);
    assert.equal(concept.objective, original.objective);
    assert.deepEqual(concept.identity_card_keys, old.filter(e => e.id.startsWith(`types/${concept.key}/`)).map(e => e.card.key));
  }
});

test('all depth 2 MC options, feedback and exact snippets survive current app formatting', () => {
  const imported = parseCardImport(JSON.stringify(cards.map(({ card }) => ({ ...card,
    explanation: `${card.explanation}\n\nSource: [Official Java 27 reference](${card.source}).`,
  }))), 'deck');
  assert.equal(imported.length, 40);
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
    if (kind === 'output') assert.ok(original.correct_option.includes(expected));
    if (kind === 'compile_error') assert.match(original.correct_option, /^Compilation fails:/);
  }
});

test('alternate pack generation is deterministic and cannot overwrite prior SQL implicitly', () => {
  const previousSQL = read('supabase/seeds/java_types_depth_1.sql');
  const before = read('supabase/seeds/java_types_depth_2.sql');
  const cwd = new URL('../', import.meta.url);
  const unsafe = spawnSync(process.execPath, ['scripts/build-java-types-depth-seed.mjs', '--pack=cards/pathways/java_types_depth_2.json'], { cwd, encoding: 'utf8' });
  assert.notEqual(unsafe.status, 0);
  assert.match(unsafe.stderr, /alternate pack requires --output=/);
  assert.equal(read('supabase/seeds/java_types_depth_1.sql'), previousSQL);
  const safe = spawnSync(process.execPath, ['scripts/build-java-types-depth-seed.mjs', '--pack=cards/pathways/java_types_depth_2.json', '--output=supabase/seeds/java_types_depth_2.sql'], { cwd, encoding: 'utf8' });
  assert.equal(safe.status, 0, safe.stderr);
  const sql = read('supabase/seeds/java_types_depth_2.sql');
  assert.equal(sql, before);
  assert.equal(read('supabase/seeds/java_types_depth_1.sql'), previousSQL);
  const payload = JSON.parse(sql.split('$java_pack$')[1]);
  assert.deepEqual(entries(payload).map(c => c.id), cards.map(c => c.id));
  assert.ok(entries(payload).every(c => !('verification' in c.card)));
  assert.match(sql, /pg_advisory_xact_lock\(20261004, 12\)/);
  assert.match(sql, /:java-foundations-v1:card:/);
  assert.match(sql, /ON CONFLICT \(id\) DO NOTHING/);
  assert.match(sql, /ARRAY\(SELECT jsonb_array_elements_text\(card->'distractors'\)\)/);
  assert.ok(sql.includes("E'\\n\\n'"));
  assert.match(sql, /multiple parents/);
  assert.match(sql, /batch_questions_present/);
  assert.doesNotMatch(sql, /\b(?:UPDATE public\.|DELETE FROM|ALTER TABLE|DROP TABLE|INSERT INTO public\.review_history)\b/i);
  assert.ok(sql.trimEnd().endsWith('COMMIT;'));
});
