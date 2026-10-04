import { readFileSync, writeFileSync } from 'node:fs';

const packArg = process.argv.find(value => value.startsWith('--pack='));
const outputArg = process.argv.find(value => value.startsWith('--output='));
const inputPath = packArg ? packArg.slice(7) : 'cards/pathways/java_control_flow_depth_1.json';
const outputPath = outputArg ? outputArg.slice(9) : 'supabase/seeds/java_control_flow_depth_1.sql';
if (packArg && !outputArg) throw new Error('An alternate pack requires --output= to avoid replacing an earlier batch SQL.');
if (!inputPath.startsWith('cards/pathways/') || !outputPath.startsWith('supabase/seeds/') ||
    inputPath.includes('..') || outputPath.includes('..')) throw new Error('Use repository-relative pathway pack and seed paths.');
const pack = JSON.parse(readFileSync(new URL('../' + inputPath, import.meta.url), 'utf8'));
if (pack.topics.length !== 1 || pack.topics[0].key !== 'control-flow') throw new Error('Expected a single Control flow topic.');
const batches = {
  'java-control-flow-depth-batch-1': { count: 40, concepts: 8, output: 'supabase/seeds/java_control_flow_depth_1.sql', header: `-- Java 27 Control flow depth batch 1: 40 NEW MC cards, 8 reused concepts.
-- After the starter: Control flow has 8 concepts / 64 questions.
-- This batch alone on an empty topic: 8 concepts / 40 questions.` },
  'java-control-flow-depth-batch-2': { count: 40, concepts: 9, output: 'supabase/seeds/java_control_flow_depth_2.sql', header: `-- Java 27 Control flow depth batch 2: 40 NEW MC cards, 8 reused concepts, 1 new concept.
-- After starter + depth batches 1 and 2: Control flow has 9 concepts / 104 questions.
-- This batch alone on an empty topic: 9 concepts / 40 questions.` },
};
batches['java-control-flow-progression-1'] = { count: 30, concepts: 9,
  output: 'supabase/seeds/java_control_flow_progression_1.sql',
  header: `-- Java 27 Control flow teaching progression: 30 NEW introductory MC cards.
-- With starter + both depth packs: 9 concepts / 134 questions.
-- Adds nullable learning_order metadata; preserves all existing study records.` };
const metadata = batches[pack.id];
if (!metadata) throw new Error('Add reviewed count/header metadata before generating another batch.');
if (outputPath !== metadata.output) throw new Error('Use the reviewed output path for this batch to preserve earlier SQL.');
const count = pack.topics[0].concepts.reduce((sum, concept) => sum + concept.cards.length, 0);
if (count !== metadata.count || pack.topics[0].concepts.length !== metadata.concepts) throw new Error('Reviewed batch counts changed.');
const seedHeader = metadata.header;
const payload = JSON.stringify({ ...pack, topics: pack.topics.map(topic => ({ ...topic,
  concepts: topic.concepts.map(concept => ({ ...concept,
    cards: concept.cards.map(({ verification: _verification, ...card }) => card),
  })),
})) }, null, 2);
if (payload.includes('$java_pack$') || payload.includes('$seed$')) throw new Error('Payload conflicts with SQL dollar delimiter.');

let sql = `${seedHeader}
-- Generated from ${inputPath}. Run in Supabase SQL Editor.
-- Requires the already-installed concept-tracking migration. No deletes or updates.
-- Repeated runs preserve all existing card edits, IDs, links and review schedules.
BEGIN;
DO $seed$
DECLARE
  -- Leave NULL to find/create the single Java project. If several exist, paste
  -- the desired project UUID here, e.g. '...'::uuid, and run the whole script.
  requested_project_id uuid := NULL;
  v_project_id uuid;
  v_topic_id uuid;
  v_concept_id uuid;
  v_card_id uuid;
  seeded_id uuid;
  matches integer;
  affected integer;
  decks_added integer := 0;
  concepts_added integer := 0;
  cards_added integer := 0;
  topic jsonb;
  concept jsonb;
  card jsonb;
  pack jsonb := $java_pack$
${payload}
$java_pack$::jsonb;
BEGIN
  -- The lock covers this pack's setup across simultaneous SQL runs, including
  -- project creation. It does not lock unrelated ordinary app authoring.
  PERFORM pg_advisory_xact_lock(20261004, 12);
  IF requested_project_id IS NOT NULL THEN
    SELECT p.id INTO v_project_id FROM public.projects p WHERE p.id = requested_project_id
      AND regexp_replace(lower(trim(p.name)), '[^a-z0-9]+', '', 'g') IN ('java', 'java21', 'java27', 'javafundamentals');
    IF v_project_id IS NULL THEN RAISE EXCEPTION 'The requested Java project UUID was not found or its name is not recognized by the pathway.'; END IF;
  ELSE
    SELECT count(*) INTO matches FROM public.projects p
      WHERE regexp_replace(lower(trim(p.name)), '[^a-z0-9]+', '', 'g') IN ('java', 'java21', 'java27', 'javafundamentals');
    IF matches > 1 THEN RAISE EXCEPTION 'Several Java projects exist. Set requested_project_id near the top of this seed.'; END IF;
    SELECT p.id INTO v_project_id FROM public.projects p
      WHERE regexp_replace(lower(trim(p.name)), '[^a-z0-9]+', '', 'g') IN ('java', 'java21', 'java27', 'javafundamentals');
    IF v_project_id IS NULL THEN
      INSERT INTO public.projects (id, name, description)
        VALUES (gen_random_uuid(), 'Java', 'Java learning pathway: concepts, practice and spaced repetition.')
        RETURNING id INTO v_project_id;
    END IF;
  END IF;

  FOR topic IN SELECT value FROM jsonb_array_elements(pack->'topics') LOOP
    seeded_id := md5(v_project_id::text || ':java-foundations-v1:topic:' || (topic->>'key'))::uuid;
    IF EXISTS (SELECT 1 FROM public.decks d WHERE d.id = seeded_id AND d.project_id <> v_project_id) THEN
      RAISE EXCEPTION 'The seeded topic was moved to another project. No changes were committed.';
    END IF;
    IF EXISTS (
      SELECT 1 FROM public.cards q JOIN public.decks d ON d.id = q.deck_id
      WHERE d.project_id <> v_project_id AND EXISTS (
        SELECT 1 FROM jsonb_array_elements(topic->'concepts') group_item,
          jsonb_array_elements_text(group_item->'identity_card_keys' ||
            (SELECT jsonb_agg(item->>'key') FROM jsonb_array_elements(group_item->'cards') item)) item(key)
        WHERE q.id = md5(v_project_id::text || ':java-foundations-v1:card:' ||
          (topic->>'key') || ':' || (group_item->>'key') || ':' || item.key)::uuid
      )
    ) THEN RAISE EXCEPTION 'Known questions were moved outside the selected project. No changes were committed.'; END IF;
    -- Prefer a previously seeded ID so a name edit does not create a duplicate.
    SELECT d.id INTO v_topic_id FROM public.decks d WHERE d.id = seeded_id AND d.project_id = v_project_id;
    IF v_topic_id IS NULL THEN
      -- Recover an adopted deck after a rename using known starter/batch IDs.
      SELECT count(DISTINCT q.deck_id) INTO matches FROM public.cards q
      JOIN public.decks d ON d.id = q.deck_id AND d.project_id = v_project_id
      WHERE EXISTS (
        SELECT 1 FROM jsonb_array_elements(topic->'concepts') group_item,
          jsonb_array_elements_text(group_item->'identity_card_keys' ||
            (SELECT jsonb_agg(item->>'key') FROM jsonb_array_elements(group_item->'cards') item)) item(key)
        WHERE q.id = md5(v_project_id::text || ':java-foundations-v1:card:' ||
          (topic->>'key') || ':' || (group_item->>'key') || ':' || item.key)::uuid
      );
      IF matches > 1 THEN RAISE EXCEPTION 'Known topic questions are spread over multiple decks. Resolve manually; no data was changed.'; END IF;
      IF matches = 1 THEN
        SELECT DISTINCT q.deck_id INTO v_topic_id FROM public.cards q
        JOIN public.decks d ON d.id = q.deck_id AND d.project_id = v_project_id
        WHERE EXISTS (
          SELECT 1 FROM jsonb_array_elements(topic->'concepts') group_item,
            jsonb_array_elements_text(group_item->'identity_card_keys' ||
              (SELECT jsonb_agg(item->>'key') FROM jsonb_array_elements(group_item->'cards') item)) item(key)
          WHERE q.id = md5(v_project_id::text || ':java-foundations-v1:card:' ||
            (topic->>'key') || ':' || (group_item->>'key') || ':' || item.key)::uuid
        );
      END IF;
    END IF;
    IF v_topic_id IS NULL THEN
      SELECT count(*) INTO matches FROM public.decks d WHERE d.project_id = v_project_id AND EXISTS (
        SELECT 1 FROM jsonb_array_elements_text((topic->'aliases') || jsonb_build_array(topic->>'title')) alias(name)
        WHERE regexp_replace(lower(trim(d.name)), '[^a-z0-9]+', '', 'g') = regexp_replace(lower(trim(alias.name)), '[^a-z0-9]+', '', 'g')
      );
      IF matches > 1 THEN RAISE EXCEPTION 'Several decks match topic %. Resolve duplicate topic names before seeding.', topic->>'title'; END IF;
      SELECT d.id INTO v_topic_id FROM public.decks d WHERE d.project_id = v_project_id AND EXISTS (
        SELECT 1 FROM jsonb_array_elements_text((topic->'aliases') || jsonb_build_array(topic->>'title')) alias(name)
        WHERE regexp_replace(lower(trim(d.name)), '[^a-z0-9]+', '', 'g') = regexp_replace(lower(trim(alias.name)), '[^a-z0-9]+', '', 'g')
      );
      IF v_topic_id IS NULL THEN
        INSERT INTO public.decks (id, project_id, name, description)
          VALUES (seeded_id, v_project_id, topic->>'title', topic->>'objective') RETURNING id INTO v_topic_id;
        decks_added := decks_added + 1;
      END IF;
    END IF;

    FOR concept IN SELECT value FROM jsonb_array_elements(topic->'concepts') LOOP
      -- A complete seeded group needs no parent lookup or insert. This also
      -- preserves renamed/reassigned concepts rather than adding empty copies.
      SELECT count(*) INTO matches FROM public.cards c WHERE c.deck_id = v_topic_id AND EXISTS (
        SELECT 1 FROM jsonb_array_elements(concept->'cards') item
        WHERE c.id = md5(v_project_id::text || ':java-foundations-v1:card:' || (topic->>'key') || ':' || (concept->>'key') || ':' || (item->>'key'))::uuid
      );
      IF matches = jsonb_array_length(concept->'cards') THEN CONTINUE; END IF;
      seeded_id := md5(v_topic_id::text || ':java-foundations-v1:concept:' || (concept->>'key'))::uuid;
      IF EXISTS (SELECT 1 FROM public.concepts c WHERE c.id = seeded_id AND c.deck_id <> v_topic_id) THEN
        RAISE EXCEPTION 'The seeded concept was moved to another deck. No changes were committed.';
      END IF;
      SELECT c.id INTO v_concept_id FROM public.concepts c WHERE c.id = seeded_id AND c.deck_id = v_topic_id;
      IF v_concept_id IS NULL THEN
        SELECT count(DISTINCT c.concept_id) INTO matches FROM public.cards c
        JOIN public.concepts parent ON parent.id = c.concept_id AND parent.deck_id = v_topic_id
        WHERE c.deck_id = v_topic_id AND EXISTS (
          SELECT 1 FROM jsonb_array_elements_text(
            COALESCE(concept->'identity_card_keys', '[]'::jsonb) ||
            (SELECT jsonb_agg(item->>'key') FROM jsonb_array_elements(concept->'cards') item)
          ) item(key)
          WHERE c.id = md5(v_project_id::text || ':java-foundations-v1:card:' ||
            (topic->>'key') || ':' || (concept->>'key') || ':' || item.key)::uuid
        );
        IF matches > 1 THEN RAISE EXCEPTION 'Existing questions for concept % have multiple parents. Resolve manually; no data was changed.', concept->>'title'; END IF;
        IF matches = 1 THEN
          SELECT DISTINCT c.concept_id INTO v_concept_id FROM public.cards c
          JOIN public.concepts parent ON parent.id = c.concept_id AND parent.deck_id = v_topic_id
          WHERE c.deck_id = v_topic_id AND EXISTS (
            SELECT 1 FROM jsonb_array_elements_text(
              COALESCE(concept->'identity_card_keys', '[]'::jsonb) ||
              (SELECT jsonb_agg(item->>'key') FROM jsonb_array_elements(concept->'cards') item)
            ) item(key)
            WHERE c.id = md5(v_project_id::text || ':java-foundations-v1:card:' ||
              (topic->>'key') || ':' || (concept->>'key') || ':' || item.key)::uuid
          );
        END IF;
      END IF;
      IF v_concept_id IS NULL THEN
        SELECT count(*) INTO matches FROM public.concepts c WHERE c.deck_id = v_topic_id AND lower(trim(c.title)) = lower(trim(concept->>'title'));
        IF matches > 1 THEN RAISE EXCEPTION 'Several concepts match %. Resolve duplicates before seeding.', concept->>'title'; END IF;
        SELECT c.id INTO v_concept_id FROM public.concepts c WHERE c.deck_id = v_topic_id AND lower(trim(c.title)) = lower(trim(concept->>'title'));
        IF v_concept_id IS NULL THEN
          INSERT INTO public.concepts (id, deck_id, title, objective)
            VALUES (seeded_id, v_topic_id, concept->>'title', concept->>'objective') RETURNING id INTO v_concept_id;
          concepts_added := concepts_added + 1;
        END IF;
      END IF;

      FOR card IN SELECT value FROM jsonb_array_elements(concept->'cards') LOOP
        v_card_id := md5(v_project_id::text || ':java-foundations-v1:card:' || (topic->>'key') || ':' || (concept->>'key') || ':' || (card->>'key'))::uuid;
        IF EXISTS (SELECT 1 FROM public.cards c WHERE c.id = v_card_id AND c.deck_id <> v_topic_id) THEN
          RAISE EXCEPTION 'A seeded question now belongs to another deck. No changes were committed.';
        END IF;
        INSERT INTO public.cards (
          id, deck_id, concept_id, question, answer, card_type, distractors,
          is_code, interval, ease_factor, repetitions, next_review
        ) VALUES (
          v_card_id, v_topic_id, v_concept_id, card->>'question',
          (card->>'correct_option') || E'\\n\\n' || (card->>'explanation') || E'\\n\\nSource: [Official Java 27 reference](' || (card->>'source') || ').',
          'multiple_choice', ARRAY(SELECT jsonb_array_elements_text(card->'distractors')),
          (card->>'is_code')::boolean, 0, 2.5, 0, now()
        ) ON CONFLICT (id) DO NOTHING;
        GET DIAGNOSTICS affected = ROW_COUNT;
        cards_added := cards_added + affected;
      END LOOP;
    END LOOP;
  END LOOP;
  RAISE NOTICE 'Java project %: added % topics, % concepts, % questions. Existing data was preserved.', v_project_id, decks_added, concepts_added, cards_added;
  PERFORM set_config('anne.control_flow_batch_project', v_project_id::text, true);
  PERFORM set_config('anne.control_flow_batch_deck', v_topic_id::text, true);
  PERFORM set_config('anne.control_flow_batch_payload', pack::text, true);
END;
$seed$;

-- Read-only summary, scoped to the project and deck resolved above.
-- Uses transaction-local seed context so renamed topics and explicit overrides
-- are counted correctly. Counts include pre-existing/user-authored content.
SELECT p.id AS project_id, p.name AS project, d.id AS deck_id, d.name AS topic,
       (SELECT count(*) FROM public.concepts c WHERE c.deck_id = d.id) AS concepts,
       (SELECT count(*) FROM public.cards q WHERE q.deck_id = d.id) AS questions,
       (SELECT count(*) FROM public.cards q WHERE q.deck_id = d.id AND q.id IN (
          SELECT md5(p.id::text || ':java-foundations-v1:card:control-flow:' ||
            (c->>'key') || ':' || (card->>'key'))::uuid
          FROM jsonb_array_elements(current_setting('anne.control_flow_batch_payload')::jsonb->'topics'->0->'concepts') c,
               jsonb_array_elements(c->'cards') card
       )) AS batch_questions_present
FROM public.projects p JOIN public.decks d ON d.project_id = p.id
WHERE p.id = current_setting('anne.control_flow_batch_project')::uuid
  AND d.id = current_setting('anne.control_flow_batch_deck')::uuid;
COMMIT;
`;

if (pack.id === 'java-control-flow-progression-1') {
  sql = sql.replace('No deletes or updates.', 'Only guarded curriculum metadata updates; no deletes.');
  const sequence = JSON.parse(readFileSync(new URL('../cards/pathways/java_control_flow_sequence.json', import.meta.url), 'utf8'));
  const sequencePayload = JSON.stringify(sequence, null, 2);
  if (sequencePayload.includes('$learning_sequence$')) throw new Error('Sequence delimiter collision.');
  sql = sql.replace('BEGIN;\nDO $seed$', `BEGIN;
SELECT pg_advisory_xact_lock(20261004, 12);
-- Metadata only: null preserves the behavior of decks without a teaching order.
ALTER TABLE public.cards ADD COLUMN IF NOT EXISTS learning_order integer;
ALTER TABLE public.concepts ADD COLUMN IF NOT EXISTS learning_order integer;
DO $seed$`);
  const ordering = `
-- Apply ordering to known cards without editing content, links or learning data.
DO $ordering$
DECLARE
  sequence jsonb := $learning_sequence$
${sequencePayload}
$learning_sequence$::jsonb;
  v_project uuid := current_setting('anne.control_flow_batch_project')::uuid;
  v_deck uuid := current_setting('anne.control_flow_batch_deck')::uuid;
  group_item jsonb;
  item jsonb;
  v_card uuid;
  v_concept uuid;
  v_parents integer;
BEGIN
  FOR group_item IN SELECT value FROM jsonb_array_elements(sequence->'concepts') LOOP
    -- Prefer stable concept IDs; only infer an adopted parent when unambiguous.
    SELECT id INTO v_concept FROM public.concepts
      WHERE id = md5(v_deck::text || ':java-foundations-v1:concept:' || (group_item->>'key'))::uuid AND deck_id = v_deck;
    IF v_concept IS NULL THEN
      SELECT count(DISTINCT q.concept_id) INTO v_parents FROM public.cards q
        JOIN public.concepts c ON c.id = q.concept_id AND c.deck_id = v_deck
        WHERE q.deck_id = v_deck AND q.id IN (
          SELECT md5(v_project::text || ':java-foundations-v1:card:control-flow:' ||
            (group_item->>'key') || ':' || (x->>'key'))::uuid
          FROM jsonb_array_elements(group_item->'cards') x);
      IF v_parents = 1 THEN
        SELECT DISTINCT q.concept_id INTO v_concept FROM public.cards q
          JOIN public.concepts c ON c.id = q.concept_id AND c.deck_id = v_deck
          WHERE q.deck_id = v_deck AND q.id IN (
            SELECT md5(v_project::text || ':java-foundations-v1:card:control-flow:' ||
              (group_item->>'key') || ':' || (x->>'key'))::uuid
            FROM jsonb_array_elements(group_item->'cards') x);
      END IF;
    END IF;
    UPDATE public.concepts SET learning_order = (group_item->>'learning_order')::integer
      WHERE id = v_concept AND deck_id = v_deck AND learning_order IS NULL;
    -- Rename only untouched authored labels; custom titles/objectives survive.
    UPDATE public.concepts SET title = group_item->>'title'
      WHERE id = v_concept AND deck_id = v_deck
        AND title = group_item->>'original_title' AND objective = group_item->>'original_objective';
    FOR item IN SELECT value FROM jsonb_array_elements(group_item->'cards') LOOP
      v_card := md5(v_project::text || ':java-foundations-v1:card:control-flow:' ||
        (group_item->>'key') || ':' || (item->>'key'))::uuid;
      UPDATE public.cards SET learning_order = (item->>'learning_order')::integer
        WHERE id = v_card AND deck_id = v_deck AND concept_id = v_concept AND learning_order IS NULL;
    END LOOP;
  END LOOP;
END;
$ordering$;
NOTIFY pgrst, 'reload schema';
`;
  sql = sql.replace('-- Read-only summary, scoped', ordering + '\n-- Read-only summary, scoped');
  sql = sql.replace('AS questions,', 'AS questions,\n       (SELECT count(*) FROM public.cards q WHERE q.deck_id = d.id AND q.learning_order IS NOT NULL) AS ordered_questions,');
}
writeFileSync(new URL('../' + outputPath, import.meta.url), sql);
console.log(`Generated ${outputPath}`);
