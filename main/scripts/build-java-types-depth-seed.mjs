import { readFileSync, writeFileSync } from 'node:fs';

const packArg = process.argv.find(value => value.startsWith('--pack='));
const outputArg = process.argv.find(value => value.startsWith('--output='));
const inputPath = packArg ? packArg.slice(7) : 'cards/pathways/java_types_depth_1.json';
const outputPath = outputArg ? outputArg.slice(9) : 'supabase/seeds/java_types_depth_1.sql';
if (packArg && !outputArg) throw new Error('An alternate pack requires --output= to avoid replacing an earlier batch SQL.');
if (!inputPath.startsWith('cards/pathways/') || !outputPath.startsWith('supabase/seeds/') ||
    inputPath.includes('..') || outputPath.includes('..')) throw new Error('Use repository-relative pathway pack and seed paths.');
const pack = JSON.parse(readFileSync(new URL('../' + inputPath, import.meta.url), 'utf8'));
if (pack.topics.length !== 1 || pack.topics[0].key !== 'types') throw new Error('This generator supports a single Types topic.');
const count = pack.topics[0].concepts.reduce((sum, concept) => sum + concept.cards.length, 0);
const seedHeader = pack.id === 'java-types-depth-batch-1'
  ? `-- Java 27 Topic 1 depth batch 1: 32 NEW MC cards, 8 reused concepts, 1 new concept.
-- After starter + this batch: Topic 1 has 9 concepts / 56 questions.
-- This batch alone on an empty project: 1 topic / 9 concepts / 32 questions.`
  : `-- Java 27 Topic 1 depth batch 2: ${count} NEW MC cards, 6 reused concepts, 0 new concepts.
-- After starter + depth batches 1 and 2: Topic 1 has 9 concepts / 96 questions.
-- This batch alone on an empty project: 1 topic / 6 concepts / ${count} questions.`;
if (!['java-types-depth-batch-1', 'java-types-depth-batch-2'].includes(pack.id)) throw new Error('Add reviewed count/header metadata before generating another batch.');
const payload = JSON.stringify({ ...pack, topics: pack.topics.map(topic => ({ ...topic,
  concepts: topic.concepts.map(concept => ({ ...concept,
    cards: concept.cards.map(({ verification: _verification, ...card }) => card),
  })),
})) }, null, 2);
if (payload.includes('$java_pack$') || payload.includes('$seed$')) throw new Error('Payload conflicts with SQL dollar delimiter.');

const sql = `${seedHeader}
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
  PERFORM set_config('anne.types_batch_project', v_project_id::text, true);
  PERFORM set_config('anne.types_batch_deck', v_topic_id::text, true);
  PERFORM set_config('anne.types_batch_payload', pack::text, true);
END;
$seed$;

-- Read-only summary, scoped to the project and deck resolved above.
-- Uses transaction-local seed context so renamed topics and explicit overrides
-- are counted correctly. Counts include pre-existing/user-authored content.
SELECT p.id AS project_id, p.name AS project, d.id AS deck_id, d.name AS topic,
       (SELECT count(*) FROM public.concepts c WHERE c.deck_id = d.id) AS concepts,
       (SELECT count(*) FROM public.cards q WHERE q.deck_id = d.id) AS questions,
       (SELECT count(*) FROM public.cards q WHERE q.deck_id = d.id AND q.id IN (
          SELECT md5(p.id::text || ':java-foundations-v1:card:types:' ||
            (c->>'key') || ':' || (card->>'key'))::uuid
          FROM jsonb_array_elements(current_setting('anne.types_batch_payload')::jsonb->'topics'->0->'concepts') c,
               jsonb_array_elements(c->'cards') card
       )) AS batch_questions_present
FROM public.projects p JOIN public.decks d ON d.project_id = p.id
WHERE p.id = current_setting('anne.types_batch_project')::uuid
  AND d.id = current_setting('anne.types_batch_deck')::uuid;
COMMIT;
`;

writeFileSync(new URL('../' + outputPath, import.meta.url), sql);
console.log(`Generated ${outputPath}`);
