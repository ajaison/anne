import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { parseCardImport } from '../src/apps/knowledge/services/cardImport.ts';
import { authoredChoices, splitChoiceAnswer } from '../src/apps/knowledge/services/multipleChoice.ts';
const read = p => readFileSync(new URL('../' + p, import.meta.url), 'utf8');
const pack = JSON.parse(read('cards/pathways/java_control_flow_progression_1.json'));
const sequence = JSON.parse(read('cards/pathways/java_control_flow_sequence.json'));
const entries = p => p.topics.flatMap(t => t.concepts.flatMap(c => c.cards.map(card => ({ id: `${t.key}/${c.key}/${card.key}`, card }))));
const names = ['java_foundations_1_2', 'java_types_depth_1', 'java_types_depth_2', 'java_control_flow_depth_1', 'java_control_flow_depth_2'];
const prior = names.map(n => JSON.parse(read(`cards/pathways/${n}.json`)));
const old = prior.flatMap(entries), fresh = entries(pack);
const normalize = s => s.replace(/\s+/g, ' ').trim();

test('30 introductory cards add distinct scenarios and a complete explicit sequence for 134 Control flow cards', () => {
  assert.equal(pack.java_release, 27);
  assert.equal(pack.preview_features, false);
  assert.equal(fresh.length, 30);
  assert.equal(old.length + fresh.length, 230);
  const legacy = ['01_variables_and_datatypes', '02_control_flow_and_loops', '03_arrays', '04_strings_and_string_pool']
    .flatMap(n => JSON.parse(read(`cards/${n}.json`)))
    .flatMap(c => [...c.question.matchAll(/```java\n([\s\S]*?)\n```/g)].map(m => normalize(m[1])));
  const snippets = old.map(e => normalize(e.card.verification.code)).concat(legacy);
  assert.equal(new Set(fresh.map(e => normalize(e.card.verification.code))).size, 30);
  for (const e of fresh) {
    assert.ok(!old.some(o => o.id === e.id), e.id);
    assert.ok(!snippets.includes(normalize(e.card.verification.code)), e.id);
  }
  const known = [...old.filter(e => e.id.startsWith('control-flow/')), ...fresh];
  const sequenced = sequence.concepts.flatMap(c => c.cards.map(q => ({ id: `control-flow/${c.key}/${q.key}`, position: q.learning_order })));
  assert.equal(sequenced.length, 134);
  assert.deepEqual(sequenced.map(e => e.id).sort(), known.map(e => e.id).sort());
  assert.equal(new Set(sequenced.map(e => e.position)).size, 134);
  assert.equal(sequence.concepts.length, 9);
  const consolidated = JSON.parse(read('cards/pathways/java_control_flow_curriculum.json'));
  assert.deepEqual(entries(consolidated).map(e => e.id), sequenced.map(e => e.id));
  for (const e of entries(consolidated)) {
    const { learning_order, ...originalFields } = e.card;
    assert.deepEqual(originalFields, known.find(k => k.id === e.id).card);
    assert.equal(learning_order, sequenced.find(q => q.id === e.id).position);
  }
  for (const c of sequence.concepts) {
    assert.ok(fresh.some(e => e.id === `control-flow/${c.key}/${c.cards[0].key}`));
    assert.ok(c.cards.every((q, i) => i === 0 || q.learning_order > c.cards[i - 1].learning_order));
    const newConcept = pack.topics[0].concepts.find(x => x.key === c.key);
    assert.deepEqual(newConcept.identity_card_keys.sort(), known.filter(e => e.id.startsWith(`control-flow/${c.key}/`) && !fresh.includes(e)).map(e => e.card.key).sort());
  }
});

test('introductory MC parses in the app with source feedback, plausible choices and exact code metadata', () => {
  const imported = parseCardImport(JSON.stringify(fresh.map(({ card }) => card)), 'deck');
  for (let i = 0; i < imported.length; i++) {
    const q = fresh[i].card;
    assert.equal(authoredChoices(imported[i]).length, 4);
    assert.equal(new Set(authoredChoices(imported[i])).size, 4);
    assert.equal(splitChoiceAnswer(imported[i].answer).correctOption, q.correct_option);
    assert.ok(q.explanation.length > 200);
    assert.match(q.source, /^https:\/\/docs.oracle.com\/javase\/specs\/jls\/se27\/html\//);
    assert.equal(q.question.match(/```java\n([\s\S]*?)\n```/)[1], q.verification.code);
  }
});

test('repeatable SQL adds only new cards and changes only guarded curriculum metadata on existing records', () => {
  const oldSql = names.map(n => read(`supabase/seeds/${n}.sql`));
  const before = read('supabase/seeds/java_control_flow_progression_1.sql');
  const generated = spawnSync(process.execPath, ['scripts/build-java-control-flow-seed.mjs',
    '--pack=cards/pathways/java_control_flow_progression_1.json', '--output=supabase/seeds/java_control_flow_progression_1.sql'],
    { cwd: new URL('../', import.meta.url), encoding: 'utf8' });
  assert.equal(generated.status, 0, generated.stderr);
  const sql = read('supabase/seeds/java_control_flow_progression_1.sql');
  assert.equal(before, sql);
  names.forEach((n, i) => assert.equal(read(`supabase/seeds/${n}.sql`), oldSql[i]));
  assert.deepEqual(entries(JSON.parse(sql.split('$java_pack$')[1])).map(e => e.id), fresh.map(e => e.id));
  assert.deepEqual(JSON.parse(sql.split('$learning_sequence$')[1]), sequence);
  assert.match(sql, /ALTER TABLE public.cards ADD COLUMN IF NOT EXISTS learning_order integer/);
  assert.match(sql, /ON CONFLICT \(id\) DO NOTHING/);
  assert.match(sql, /pg_advisory_xact_lock\(20261004, 12\)/);
  assert.match(sql, /concept_id = v_concept AND learning_order IS NULL/);
  assert.match(sql, /title = group_item->>'original_title' AND objective = group_item->>'original_objective'/);
  const updates = [...sql.matchAll(/UPDATE public\.(\w+) SET ([\s\S]*?)\n\s*WHERE/g)];
  assert.equal(updates.length, 3);
  assert.ok(updates.every(m => m[2].startsWith('learning_order =') || m[1] === 'concepts' && m[2].startsWith('title =')));
  assert.doesNotMatch(sql, /DELETE FROM|DROP TABLE|UPDATE public.review_history|SET (?:question|answer|concept_id|next_review|interval|repetitions)\s*=/);
  assert.ok(sql.trimEnd().endsWith('COMMIT;'));
});
