# Topic 1 depth batch 1 — 2026-10-04

Run the whole [java_types_depth_1.sql](java_types_depth_1.sql) in Supabase SQL
Editor. It adds **32 new multiple-choice questions**, extends eight existing
concepts, and introduces **Bit masks and shift operators**. The installed
concept-tracking migration is required; do not rerun it for this batch.

Leave `requested_project_id uuid := NULL` for a single recognized Java project.
If there are several, set it to the intended UUID near the top of the SQL.
No Supabase connection or credentials were used during authoring.

## Expected counts

| Starting state | Newly inserted concepts | Newly inserted questions | Topic 1 final concepts/questions |
| --- | ---: | ---: | --- |
| Starter imported; no other content | 1 | 32 | 9 / 56 |
| Empty project/topic | 9 | 32 | 9 / 32 |
| This batch already present | 0 | 0 | Unchanged |

With both starter topics plus this batch, cumulative authored content is 17
concepts and 80 questions: Topic 1 = 9/56; Topic 2 stays 8/24. Import the
original foundations seed too if its starter content is absent; this SQL embeds
only the 32 new questions. Extra user content can make the summary larger.
The NOTICE reports actual insert counts; the final read-only summary reports
selected project/deck totals and `batch_questions_present` (expected 32).
New questions are ready/unseen, not yet due reviewed cards.

## Preservation behavior

The namespace remains `java-foundations-v1`. Existing topic, concept and card
keys are unchanged. IDs use the original md5 formulas. Inserts initialize only
new cards; `ON CONFLICT (id) DO NOTHING` preserves content edits, concept links,
schedules and history. No UPDATE, DELETE, DDL or history insert is generated.

Setup uses the original shared advisory transaction lock. Stable parent IDs
are preferred, followed by known starter/batch card identities to recover
renamed adopted parents, followed by unambiguous title/alias matches. Multiple
candidate decks/parents or known questions moved outside the selected project
stop the transaction. Existing cards are never moved. A complete batch concept
group is skipped, preserving reassigned links without adding empty parents.
Stable parents moved out of their original container stop incomplete imports.
If adopted renamed parents have no surviving linked seed questions, identity
cannot be recovered reliably; restore a recognized name before importing.
Renamed decks may need a recognized alias to appear in the app's pathway.

SQL assumes the working client schema: project/deck defaults for created_at;
UUID primary keys; cards.distractors text[]; scheduling columns; installed
concept foreign keys and triggers. The live schema has not been inspected.
An error during the full transaction must be resolved before rerunning; share
the exact error. If the SQL Editor leaves a failed transaction open, run ROLLBACK.

## Validation and reproduction

From `main/`:

```sh
npm run seed:java:types-depth
npm run test:knowledge
npm run verify:java:types-depth -- --baseline-release=21
```

38 Knowledge tests passed on Node 22.17.1, including new identity/key collision,
app option/feedback compatibility, exact snippet matching and deterministic SQL
payload/preservation checks. All 32 new snippets passed with Homebrew OpenJDK
25.0.2: `javac --release 21`, then `java -cp <temporary-directory> <class>`.
The unchanged 48 starter snippets also passed after adding the verifier's
optional `--pack=` argument. Successful output, specific compilation diagnostic
substrings and runtime exception classes were checked. No preview flags were used.

Official Java 27 JLS chapters 3/4/5/14/15/16 and Integer API references were
reviewed. Each card links its relevant section. The older-release execution
check does **not** verify JDK 27 behavior. To finish target execution verification,
set JAVA_HOME to JDK 27 and run `npm run verify:java:types-depth` without the
baseline flag. SQL was generated and statically checked, not executed against
PostgreSQL or Supabase; no local PostgreSQL executable was available.

## Import and practice test

1. Before import, note an existing reviewed card's ID, edited content, concept,
   schedule fields and history count. Use that same card to check preservation.
2. Run the complete SQL. For a starter-only topic expect a NOTICE adding one
   concept and 32 questions; final counts 9 concepts, 56 questions, batch count 32.
3. Refresh Knowledge → Java → Types, variables and operators. Open the new
   bitmask concept (four variants), then practise several extended concepts.
4. On desktop and mobile, check four distinct options, concealed explanation
   until selection, readable code, all-option feedback and working source links.
   Try both correct and incorrect choices; save and refresh to check history.
5. Edit one new question, save its content, practise it and note its schedule
   and history. Rerun this SQL: expect zero additions and unchanged IDs, edits,
   links, schedule and history for both that question and the older baseline.
6. Report import counts/errors and any ambiguous choices or explanation issues.

This is deeper coverage, not complete Topic 1 coverage or proof of mastery/exam
readiness. See [the coverage audit](../../cards/pathways/coverage/java_types.md).
The next batch waits for user import/practice feedback.
