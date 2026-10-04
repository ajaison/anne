# Control flow depth batch 1 — 2026-10-04

Run the whole [java_control_flow_depth_1.sql](java_control_flow_depth_1.sql) in
Supabase SQL Editor. It adds **40 new Java 27 multiple-choice questions** to
Topic 2, extending its eight existing concepts. No previews or app changes.
The concept-tracking migration already installed by the user is required;
do not rerun it for this content import.

Leave `requested_project_id uuid := NULL` for the sole recognized Java project.
If several exist, set the intended quoted UUID near the top of the SQL.
No Supabase connection or credentials were used in this authoring session.

## Expected counts

| Starting state, excluding extra user content | Concepts added | Questions added | Control flow final concepts / questions |
| --- | ---: | ---: | --- |
| Foundations starter imported | 0 | 40 | 8 / 64 |
| Empty Control flow topic | 8 | 40 | 8 / 40 |
| This batch already present | 0 | 0 | Unchanged |

With the starter plus both Types depth packs and this pack, structured
Foundations totals are **17 concepts / 160 questions**: Types = 9/96 and
Control flow = 8/64. Methods, Arrays and Strings still need structured content.
This file embeds only the new forty questions. Extra user cards increase totals.
The NOTICE reports actual additions; the final selected-project/deck summary
reports overall counts and `batch_questions_present`, expected **40**.
New cards are unseen/ready, not already practised due reviews.

## Coverage added

- Branching: 8 questions on branch priority, independent tests, skipped tests,
  explicit brace grouping, null guards and work suppressed by early return.
- Loops: 5 for-loop questions and 3 while/do questions on reverse/paired/stride
  traversal, empty-input boundary errors, explicit termination, sentinel scans,
  retry test counts and continue reaching the do condition.
- Transfers: 4 break/continue questions and 4 label questions on switch versus
  loop targets, skipped updates/tests, block labels and label validity.
- Switch: 6 colon questions on default placement, shared labels, one-time
  selector evaluation, constant labels and String content matching; 6 expression
  questions on null, grouped constants, throwing arms, missing yield, enum
  exhaustiveness and yield through a nested loop.
- Scope/reachability: 4 questions on unconditional return, infinite loops,
  reachable break/assignment and colon-case shared local scope.

Source JSON: `cards/pathways/java_control_flow_depth_1.json`. Each question has
three authored alternatives, feedback explaining all choices, its official
Java 27 source and a `coverage_gap` note. All learner-visible snippets have
exact verification metadata. Paired-index/stride outputs quote their trailing
space explicitly, so option trimming does not obscure expected output.

## Preservation

Original `java-foundations-v1` identities and concept keys/titles/objectives
remain stable. Known starter question IDs help recover renamed adopted parents.
The generator retains the shared transaction advisory lock, optional project
UUID, parent ambiguity/move checks, text[] alternatives and real answer paragraph
breaks. ON CONFLICT DO NOTHING preserves earlier edits, links, IDs, schedules
and review history; only new cards receive initial scheduling fields.
No existing records are updated, deleted, moved or given invented review evidence.
The previously supplied JSON/SQL artifacts are unchanged.

Ambiguous known-parent mappings and moved stable parents stop incomplete
imports. Complete batch groups are skipped on rerun, preserving reassigned links.
An adopted renamed parent with no surviving known linked questions cannot be
recovered reliably; restore a recognized name before importing. App pathway
visibility of renamed decks still depends on its existing name aliases.

Live schema remains uninspected. Assumptions: UUID primary keys; created_at
defaults for projects/decks; cards.distractors text[]; existing scheduling columns;
installed concept foreign keys/triggers. No DDL or access-policy change is supplied.
Run the full transaction. If an error leaves the SQL Editor transaction open,
ROLLBACK before correcting the issue and rerunning.

## Focused validation

From `main/`:

```sh
npm run seed:java:control-flow
npm run test:java:control-flow
npm run verify:java:control-flow -- --baseline-release=21
```

- **Three focused tests passed**: distinct identities/snippets against the
  earlier structured and four legacy packs, exact eight-concept reuse, app
  option/feedback compatibility, precise code metadata and deterministic SQL
  with correct Control flow summary IDs and insert-only preservation.
- **All 40 new snippets passed** using Homebrew JDK 25.0.2:
  `javac --release 21`, then `java -cp <temporary directory> <class>`.
  Exact outputs, compiler diagnostic substrings and runtime exception classes
  were checked. No preview flags. Existing snippet suites and full app tests
  were not rerun; no shared app/verifier changes were made.
- Official Java 27 JLS chapters 14/15/16 and Boolean.equals API were browsed
  and reviewed; per-card sources point to relevant sections.
- **Java 27 execution is unverified**. Set JAVA_HOME to JDK 27 and run
  `npm run verify:java:control-flow` without the baseline flag to finish it.
- SQL was generated/reviewed and statically checked, **not executed against
  PostgreSQL/Supabase**. Static assertions do not establish live transaction,
  constraint, RLS, identity-recovery or learning-record preservation behavior.

## Import and practice checks

1. Note an older edited/reviewed card's ID, concept, content, schedule and history
   before import. Run the whole SQL; starter-only Control flow should add zero
   concepts and forty cards, reaching 8/64 with batch presence forty.
2. Refresh Anne → Java → Control flow. Practise a few branch, loop and switch
   variants on desktop/mobile. Check four choices, readable snippets, concealed
   feedback until selection, explanations/source links and saved history.
3. Edit and review a new question. Rerun SQL: expect zero additions and unchanged
   IDs, edits, links, schedules/history for both it and the older sampled card.
4. Report import counts/errors and any unclear options or explanations.

Control flow remains incomplete. Next gaps include final reference patterns,
guards/dominance, statement-versus-expression contrasts, additional switch and
loop boundary/repair cases, enhanced-for behavior and deeper flow analysis.
See [the coverage ledger](../../cards/pathways/coverage/java_control_flow.md).
