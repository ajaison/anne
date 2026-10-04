# Concept tracking setup

This update works with any deck. A deck is the temporary topic container;
ordered Java/React pathways will reuse concepts rather than replace them.

## Before applying

The repository records `review_history(id, card_id, rating, created_at)` in
`supabase_setup.sql`; projects/decks/cards are inferred from client types and
queries. The application has no login or learner-scoped queries. The supplied
history policies allow public reads/inserts. Live policies for other tables
have not been verified; no administrator/database connection is available here.

In the Supabase SQL Editor for the same project as the app, inspect its actual
columns and policies with the following read-only queries:

```sql
SELECT table_name, column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name IN ('projects', 'decks', 'cards', 'review_history', 'concepts')
ORDER BY table_name, ordinal_position;

SELECT tablename, policyname, roles, cmd, qual, with_check
FROM pg_policies WHERE schemaname = 'public'
  AND tablename IN ('projects', 'decks', 'cards', 'review_history', 'concepts');
```

Migration prerequisites: UUID deck/card/history primary keys, an existing
history table matching the recorded columns, and card updates plus history
reads/inserts already allowed for the application. This migration targets the
current shared personal vault. New concept reads and inserts require a visible
parent deck, including anonymous access when decks are visible anonymously.
It does not introduce authentication or individual learner ownership.

## Apply

Run `migrations/20261004_concept_tracking.sql` once. It is transactional: a schema
conflict stops the migration without partially adding the feature. It is not
an idempotent script. It seeds nothing and does not rewrite questions, schedules,
ratings, or past timestamps. It adds optional card links, nullable review evidence,
same-deck validation, and changes the history/card foreign key to SET NULL so
deleting questions retains practice history. A separate exercise UUID snapshot
retains the question identity for variant counts after deletion. Concepts have create/read
access only; deletion/renaming and ownership changes are separate updates.

No live migration was run by the coding agent. Existing deck study uses the old
history fields for unlinked cards, so it still works before setup. Opening
Concepts before setup shows an explanation and a route back to the deck.
Linked reviews require the new evidence columns; failures use the existing
pending-review recovery instead of silently throwing away results.

## Test

1. Open any deck and click **Concepts**. Create a named concept with an objective.
2. Link at least two prepared multiple-choice questions to it using the dropdowns.
   Link other questions to a second concept, or leave them unlinked.
3. Click **Practice concept**. Only that concept's prepared MC questions should
   appear. Select one correct and one incorrect answer and click Next to save.
4. Return to Concepts. Expect `1 / 2 reviews`, two questions practised, and a last
   practice timestamp. Reload and verify the evidence remains.
5. Normal deck Study must still include unlinked questions. Edit linked question
   wording using the existing editor: its concept and past evidence should remain.
6. Reassign a question: its old history stays with the original concept; future
   reviews attach to the new one. Prev/retry should not inflate review totals.
7. Check the concept list, forms, dropdowns, and practice on a phone/narrow screen.

Use the Collections pilot to test the same general flow if convenient. Example
concepts: equality/hash contract, collisions, null lookup, mutable keys. Nothing
in the application or migration depends on those names or on Java.

These counts are recognition evidence, not mastery percentages or certification
readiness. Old rating-only rows remain unknown. Classic self-assessment never
becomes verified correctness. Concept scheduling, delayed-review qualification,
and learner identity remain future work. Existing card-level schedules continue
to run, including extra practice when nothing is due.
