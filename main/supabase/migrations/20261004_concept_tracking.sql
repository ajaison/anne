-- Additive migration for the current personal/shared Knowledge vault.
-- Run once in this project's Supabase SQL Editor. No content is seeded.
-- Concepts inherit deck SELECT visibility; this is not per-user authentication.
BEGIN;

CREATE TABLE public.concepts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  deck_id uuid NOT NULL REFERENCES public.decks(id) ON DELETE CASCADE,
  title text NOT NULL CHECK (length(trim(title)) BETWEEN 1 AND 160),
  objective text NOT NULL CHECK (length(trim(objective)) BETWEEN 1 AND 2000),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX concepts_deck_id_idx ON public.concepts(deck_id);
ALTER TABLE public.concepts ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT ON public.concepts TO anon, authenticated;
CREATE POLICY concepts_read_visible_deck ON public.concepts FOR SELECT
  TO anon, authenticated USING (EXISTS (
    SELECT 1 FROM public.decks WHERE decks.id = concepts.deck_id
  ));
CREATE POLICY concepts_create_visible_deck ON public.concepts FOR INSERT
  TO anon, authenticated WITH CHECK (EXISTS (
    SELECT 1 FROM public.decks WHERE decks.id = concepts.deck_id
  ));

ALTER TABLE public.cards ADD COLUMN concept_id uuid
  REFERENCES public.concepts(id) ON DELETE SET NULL;
CREATE INDEX cards_concept_id_idx ON public.cards(concept_id);

CREATE FUNCTION public.check_card_concept_deck() RETURNS trigger
LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.concept_id IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM public.concepts WHERE id = NEW.concept_id AND deck_id = NEW.deck_id
  ) THEN
    RAISE EXCEPTION 'A question and its concept must belong to the same deck';
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER cards_concept_deck BEFORE INSERT OR UPDATE OF concept_id, deck_id
  ON public.cards FOR EACH ROW EXECUTE FUNCTION public.check_card_concept_deck();

ALTER TABLE public.review_history
  ADD COLUMN concept_id uuid REFERENCES public.concepts(id) ON DELETE SET NULL,
  -- Snapshot without a foreign key: stays available after deleting the question.
  ADD COLUMN exercise_id uuid,
  ADD COLUMN study_mode text CHECK (study_mode IN ('classic', 'multiple_choice', 'fill_blank', 'type_answer')),
  ADD COLUMN correct boolean,
  ADD COLUMN first_attempt boolean,
  ADD CONSTRAINT review_self_rating_not_correctness CHECK (
    study_mode IS DISTINCT FROM 'classic' OR (correct IS NULL AND first_attempt IS NULL)
  );
CREATE INDEX review_history_concept_date_idx ON public.review_history(concept_id, created_at, id);

-- Retain practice evidence when a question is deleted. Discover the existing
-- single-column card FK rather than assuming the live constraint's name.
ALTER TABLE public.review_history ALTER COLUMN card_id DROP NOT NULL;
DO $$
DECLARE
  card_column smallint;
  existing_fk record;
BEGIN
  SELECT attnum INTO card_column FROM pg_attribute
    WHERE attrelid = 'public.review_history'::regclass AND attname = 'card_id';
  FOR existing_fk IN SELECT conname FROM pg_constraint
    WHERE conrelid = 'public.review_history'::regclass AND contype = 'f'
      AND confrelid = 'public.cards'::regclass AND conkey = ARRAY[card_column]
  LOOP
    EXECUTE format('ALTER TABLE public.review_history DROP CONSTRAINT %I', existing_fk.conname);
  END LOOP;
END;
$$;
ALTER TABLE public.review_history ADD CONSTRAINT review_history_card_id_preserve_fk
  FOREIGN KEY (card_id) REFERENCES public.cards(id) ON DELETE SET NULL;

CREATE FUNCTION public.check_review_concept_deck() RETURNS trigger
LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.concept_id IS NOT NULL AND NEW.card_id IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM public.cards JOIN public.concepts
      ON concepts.deck_id = cards.deck_id
    WHERE cards.id = NEW.card_id AND concepts.id = NEW.concept_id
  ) THEN
    RAISE EXCEPTION 'Review question and concept must belong to the same deck';
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER reviews_concept_deck BEFORE INSERT OR UPDATE OF concept_id, card_id
  ON public.review_history FOR EACH ROW EXECUTE FUNCTION public.check_review_concept_deck();

-- Existing card/history grants and policies stay unchanged. Null legacy fields
-- are intentional: past ratings cannot reconstruct first-choice correctness.
NOTIFY pgrst, 'reload schema';
COMMIT;
