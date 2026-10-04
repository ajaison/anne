# Control flow depth batch 2 — 2026-10-04

Run the whole [java_control_flow_depth_2.sql](java_control_flow_depth_2.sql) in
Supabase SQL Editor. It adds **40 new Java 27 multiple-choice questions** across
eight existing concepts and one new reference-pattern concept. No previews.
The previously installed concept-tracking migration is required; do not rerun
that migration for this import. No Supabase connection or credentials were used.

Leave `requested_project_id uuid := NULL` for the sole recognized Java project.
If several exist, set the intended quoted UUID near the top of the SQL.

## Expected counts

| Starting state, excluding extra user content | Concepts added | Questions added | Control flow final concepts / questions |
| --- | ---: | ---: | --- |
| Starter and Control flow depth 1 imported | 1 | 40 | 9 / 104 |
| Starter only | 1 | 40 | 9 / 64 |
| Empty Control flow topic | 9 | 40 | 9 / 40 |
| This batch already present | 0 | 0 | Unchanged |

With the starter, both Types depth packs and both Control flow depth packs,
Foundations totals **18 concepts / 200 questions**: Types = 9/96; Control flow
= 9/104. Methods, Arrays and Strings still need structured content. This SQL
embeds only the forty new questions, not missing earlier batches. Extra user
content increases totals. NOTICE reports actual additions; the selected-deck
summary reports overall counts and `batch_questions_present`, expected **40**.
New cards are unseen/ready rather than already practised due reviews.

## Coverage added

- Reference patterns: 12 questions on binding, failed/skipped/nullable guards,
  broader-type and constant-true dominance, dominated constants, unconditional
  patterns, null/default coverage and pattern-variable scope.
- Enhanced/basic for loops: 6 questions on primitive copies, object mutation,
  reference reassignment, hidden unboxing, one-time provider evaluation and
  dependent updates from left to right.
- While/do and transfers: 6 questions on progress skipped by continue,
  runtime-false reachability, do-body definite assignment, target-specific
  updates, missing break targets and conflicting enclosing labels.
- Classic switch: 4 questions on matching past default, boxed Byte selectors,
  out-of-range constant labels and direct-entry definite assignment.
- Switch expressions/statements: 5 questions on legal arrow statement bodies,
  nonexhaustive traditional statements, forbidden outward return and standalone
  versus Object-targeted numeric result types.
- Branching/scope: 7 questions on positive/negative pattern flow scope,
  permission-policy grouping, retaining unknown Boolean values, forbidden
  outward break and explicit blocks as a case-local declaration repair.

Source JSON: `cards/pathways/java_control_flow_depth_2.json`. Every card has
three authored alternatives, detailed feedback explaining the alternatives,
an official Java 27 section link, a coverage-gap note and exact snippet
verification metadata. Intentional contrasts deepen a rule with distinct
scenarios; keys and normalized snippets do not repeat earlier packs.

## Preservation and limits

Existing concept keys/titles/objectives and the `java-foundations-v1` namespace
are unchanged. The new key is `reference-patterns`. Known starter and depth-1
question keys support recovery of adopted parents after renames. The generator
requires an explicit reviewed output path for alternate packs and leaves
previous SQL byte-for-byte unchanged.

The SQL uses the shared transaction advisory lock, optional project UUID,
parent ambiguity/move checks, text[] alternatives and real answer paragraph
breaks. ON CONFLICT DO NOTHING preserves existing records; only new cards
receive initial scheduling fields. Existing IDs, edits, links, schedules and
review history are not updated or deleted. Complete batch groups are skipped
on rerun, preserving reassigned links. An adopted renamed parent with no
surviving known linked questions cannot be reliably recovered; restore a
recognized name before importing. Renamed deck visibility still depends on
the app's existing aliases.

Live schema is uninspected. Assumptions remain UUID primary keys, project/deck
created_at defaults, cards.distractors text[], existing scheduling columns and
installed concept foreign keys/triggers. Run the full transaction. If an error
leaves the SQL Editor transaction open, ROLLBACK before correcting/rerunning.

## Focused validation

From `main/`:

```sh
npm run seed:java:control-flow-2
npm run test:java:control-flow-2
npm run verify:java:control-flow-2 -- --baseline-release=21
```

- All **40/40 new snippets passed** on Homebrew JDK 25.0.2 with
  `javac --release 21` and `java`, without preview flags. Exact outputs,
  compiler diagnostic substrings and runtime exception classes were checked.
- **Six focused tests passed** across both Control flow batches because their
  generator changed: distinct keys/snippets against all earlier structured and
  four legacy packs, retained concept identities, one new concept, app option/
  feedback compatibility, source/snippet metadata, deterministic insert-only
  SQL and rejection of accidental earlier-output replacement. All prior SQL
  artifacts remained byte-for-byte unchanged. No full app suite or old Java
  snippet suite was rerun.
- Official Java 27 JLS chapters 6/14/15/16 were reviewed, with per-card links.
- **Java 27 execution is unverified**. Set JAVA_HOME to JDK 27 and run
  `npm run verify:java:control-flow-2` without the baseline flag.
- SQL was generated and statically checked, **not executed against PostgreSQL
  or Supabase**. Live transactions, constraints, RLS, identity recovery and
  preservation of learning records require the import checks below.

## Import and practice checks

1. Record an older edited/reviewed card's ID, concept, content, schedule and
   history. Run the whole SQL. With starter and depth 1 imported, expect one
   new concept, forty cards, Control flow 9/104 and batch presence forty.
2. Refresh Anne → Java → Control flow. Practise pattern/guard, enhanced-for
   and switch-typing examples. Check four choices, readable code, feedback
   concealed until selection, explanations/source links and saved reviews.
3. Edit and review a new card, then rerun SQL. Expect zero additions and
   unchanged sampled IDs, edits, links, schedules and history.
4. Report import counts/errors and confusing alternatives or explanations.

Control flow remains incomplete; see the updated
[coverage ledger](../../cards/pathways/coverage/java_control_flow.md).
Import and practice acceptance remain pending. Card counts do not prove mastery.
