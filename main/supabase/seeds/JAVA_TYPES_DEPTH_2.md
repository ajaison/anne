# Topic 1 depth batch 2 — 2026-10-04

Run the complete [java_types_depth_2.sql](java_types_depth_2.sql) in Supabase SQL
Editor. It contains **40 new Java 27 multiple-choice questions**, extending six
existing Topic 1 concepts. It does not embed or replace the earlier questions.
No preview features, schema migration, application changes or live connection.

Leave `requested_project_id uuid := NULL` for the sole recognized Java project.
For several Java projects, set the intended quoted UUID near the top of the SQL.
Requires the concept-tracking migration already installed by the user.

## Expected counts

| Starting state, with no extra user content | New concepts | New questions | Topic 1 final concepts / questions |
| --- | ---: | ---: | --- |
| Starter plus depth batch 1 imported | 0 | 40 | 9 / 96 |
| Starter only imported | 0 | 40 | 8 / 64 |
| Empty project / topic | 6 | 40 | 6 / 40 |
| This batch already present | 0 | 0 | Unchanged |

If all three supplied packs are imported, structured Foundations totals are
**17 concepts / 120 questions**: Topic 1 = 9/96, Control flow = 8/24.
Methods, Arrays and Strings have no structured pathway batches yet. Legacy flat
packs are excluded from these counts. Foundations coverage remains incomplete.

The NOTICE gives actual additions; the read-only summary gives selected
project/deck totals and `batch_questions_present`, expected **40**. Extra user
cards can raise topic totals. New cards are unseen/ready, not reviewed due cards.

## Gaps addressed

- 10 conversion questions: assignment versus invocation narrowing/boxing,
  unary promotion, char/short conversions, long/float result type, precision
  after widening, boxing to a superclass and primitive/boxed compound contrast.
- 14 expression questions: precedence versus evaluation, assignment values,
  argument order, abrupt evaluation, array check timing, conditional
  associativity/narrow typing and wrapper-reference conditional behavior.
- 8 initialization questions: path-sensitive definite assignment with &&/||,
  runtime-looking true versus a constant proof, abrupt branches and blank-final
  assignment restrictions.
- 4 equality questions: null-safe API comparison, reference/primitive contrast,
  unrelated wrapper reference comparability and equality rounding.
- 2 reference questions and 2 var restriction questions.

Each source card includes `coverage_gap`, explaining why the scenario adds
coverage. Questions were compared against the starter, depth 1, four legacy
packs and Collections pilot. No exact question snippets or stable keys are
repeated. Manual semantic review distinguishes new rule/boundary cases from
mere changes to identifiers or numbers. The = versus += invalid-array pair is
intentional: the two operators have different RHS execution/check timing.

## Preservation and assumptions

The original `java-foundations-v1` ID formulas remain unchanged. Existing
concept titles/objectives and all earlier source packs/SQL files are preserved.
Known starter and depth-1 question keys help identify renamed adopted parents.
The same transaction advisory lock, optional project UUID and ambiguity/moved
parent checks are retained. Stable IDs and ON CONFLICT DO NOTHING leave existing
edits, links, schedules and history intact; only newly inserted cards receive
initial schedules. No UPDATE, DELETE, DDL or history inserts are generated.

A complete group is skipped on rerun. Existing questions are never reassigned.
If known questions are split between candidate parents or moved outside the
selected project, the SQL stops instead of silently duplicating or moving them.
Renamed adopted parents with no surviving linked known question cannot be
recovered reliably; restore a recognized name before importing. Renamed deck
visibility in the pathway still depends on the app's existing aliases.

The project/deck/card schema is inferred from the working client: UUID keys,
project/deck created_at defaults, cards.distractors text[], existing scheduling
fields and installed concept constraints/triggers. Live schema/RLS/defaults
were not inspected. SQL was statically checked, not executed against PostgreSQL
or Supabase; no local psql executable was available. Run the full transaction,
not individual parts. If the editor leaves a failed transaction open, ROLLBACK
before resolving the error and rerunning.

## Validation and reproduction

From `main/`:

```sh
npm run seed:java:types-depth-2
npm run test:knowledge
npm run verify:java:types-depth-2 -- --baseline-release=21
```

- All **41 Knowledge tests passed** on Node 22.17.1. New checks cover 40 disjoint
  keys/snippets, unchanged concept identity and known-parent keys, current app
  option/feedback formatting, exact visible snippet metadata and deterministic
  additive SQL. Alternate pack generation requires an explicit output path,
  protecting the previous SQL artifact from accidental replacement.
- All **40 new snippets passed** with Homebrew OpenJDK javac/java **25.0.2**:
  `javac --release 21`, followed by `java -cp <temporary directory> <class>`.
  Checks include exact outputs (including caught-exception traces) and specific
  compiler diagnostic substrings. No preview flags were used.
- Official Java 27 JLS chapters 4/5/14/15/16 and Objects API sections were browsed
  and reviewed; each question links its supporting section.
- **Java 27 execution remains unverified**. Set JAVA_HOME to JDK 27 and run
  `npm run verify:java:types-depth-2` without the baseline flag to complete it.
- Static SQL checks are not execution tests of PostgreSQL identity recovery,
  transaction rollback, constraints or live scheduling/history preservation.

## Import and practice test

1. Note an existing reviewed/edited card's ID, content, concept, schedule fields
   and history count before importing.
2. Run the whole SQL. With starter + depth 1 present, expect zero new concepts,
   40 new questions, final Topic 1 = 9/96 and batch presence = 40.
3. Refresh Knowledge → Java → Types, variables and operators. Practise variants
   in numeric promotion, initialization and evaluation on desktop/mobile.
4. Try correct and wrong options. Check four distinct choices, feedback after
   selection, source links, readable code and saved practice history.
5. Edit and review one new question, note its schedule/history, then rerun SQL.
   Expect zero additions and unchanged edits, links, IDs, schedules and history,
   including the existing card noted in step 1.
6. Report counts, SQL errors, confusing alternatives or inaccurate explanations.

Next unfinished work is Topic 1 numeric/literal/character/bitmask boundaries and
practical repair decisions. The [coverage ledger](../../cards/pathways/coverage/java_types.md)
records remaining gaps. Supplied files do not establish import acceptance,
complete Foundations coverage or learner mastery.
