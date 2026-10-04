# Control flow teaching progression — 2026-10-04

Run all of [java_control_flow_progression_1.sql](java_control_flow_progression_1.sql)
in Supabase SQL Editor. This supplies **30 new introductory MC questions** and
an explicit teaching order for all **134** locally authored Control flow cards.
It requires the existing concept-tracking setup, not a rerun of that migration.
No database connection or credentials were used by the authoring agent.

## Expected counts

| Starting state, excluding extra user cards | New concepts | New questions | Final Control flow concepts/questions |
| --- | ---: | ---: | --- |
| Starter plus both Control flow depth packs | 0 | 30 | 9 / 134 |
| Starter only | 1 | 30 | 9 / 54 |
| Empty topic | 9 | 30 | 9 / 30 |
| This progression pack already imported | 0 | 0 | Unchanged |

With all earlier Types and Control flow packs, Foundations = **18 concepts /
230 questions**. The final summary should show batch_questions_present = 30,
and ordered_questions = 134 with all Control flow packs present and unchanged
links. Extra user cards/positions can increase summary totals. Previously
missing packs are not recreated by this seed; after importing them, rerun this
SQL to fill their null ordering fields.

## What changes

The nine retained concept identities form these ordered subtopic bundles:

1. If, else-if and else (19 questions)
2. For and enhanced-for loops (18)
3. While and do-while loops (13)
4. Break and continue (12)
5. Nested loops and labels (10)
6. Switch statements and case labels (17)
7. Switch expressions and yield (17)
8. Reference patterns and guards (14)
9. Scope and reachable paths (14)

Each starts with basic syntax/meaning or ordinary behavior. Later questions
add contrasts, practical use, boundaries and restrictions. Existing harder
cards remain in their bundles. Positions are internal; no difficulty labels.
The local consolidated teaching view is
`cards/pathways/java_control_flow_curriculum.json`; the exact sequence manifest
is `cards/pathways/java_control_flow_sequence.json`. Do not import the full
consolidated view as a fresh batch: it includes all earlier questions.

Unlike earlier insert-only packs, this SQL adds nullable learning_order integer
columns to cards and concepts and fills positions only where null. It changes
standard concept titles only when both old title and objective exactly match
the authored originals; custom titles/objectives are preserved. Ordering skips
cards no longer linked to their intended resolved concept rather than relinking
them. Ambiguous/moved parents retain the existing seed safety checks.

Existing card IDs, edits, links, scheduling and review history are preserved.
No existing question/answer is replaced, and no reviews are invented or reset.
The common advisory lock is acquired before DDL as well as seed setup. Stable
java-foundations-v1 card identities and ON CONFLICT DO NOTHING remain in use.
Existing non-null positions survive reruns. Subsequent deliberate curriculum
reordering requires a separately reviewed metadata update, not schedule resets.

Leave requested_project_id NULL for a single recognized Java project. If several
exist, paste the intended UUID near the top. Run the whole transaction; if a
failed prior transaction remains open, ROLLBACK first. Live schema assumptions
from earlier instructions still apply. These additive columns do not change
access policies or grants. PostgREST is notified to reload its schema.

## App behavior and learning

Use the updated app build. Concept lists and question lists respect positions;
new questions in topic/concept practice follow that teaching sequence instead
of being shuffled. Study today retains due-first scheduling and its five-new-
question limit, ordering new cards by topic then teaching position. Pending
saves retain precedence. Therefore a due advanced review can still appear
before a new introductory question; this is intentional schedule preservation,
not a strict prerequisite gate. Existing concept practice still treats zero-
repetition cards as its initial/practice queue; Study today uses review history
to distinguish previously practised Again cards.

For first exposure, open the first subtopic and work through its introductory
examples, reading feedback after each answer. Use Study today for spaced reviews.
When a construct becomes familiar, explain your reasoning before choosing an
option and write/run a tiny example outside Anne. MC card styles can test syntax,
explanations, prediction, code completion, diagnosis, repair and design choices;
they do not establish independent coding fluency. Later mixed-topic assessment
and more repair/completion/design questions remain planned.

Nullable metadata allows deployments without this SQL to keep working. Decks
without teaching positions retain their earlier topic-practice shuffle. Refresh
any downloaded deck after import to obtain new questions/positions; offline
review reconciliation remains a separate existing limitation.

## Validation and testing

From main/:

```sh
npm run seed:java:control-flow-progression
npm run test:java:control-flow-progression
npm run verify:java:control-flow-progression -- --baseline-release=21
```

New snippets are baseline checked on JDK 25.0.2 with javac --release 21,
without previews. Java 27 execution remains unverified; set JAVA_HOME to JDK 27
and run the verifier without the baseline flag. SQL generation and embedded JSON
are statically checked, not executed against PostgreSQL/Supabase. Desktop/mobile,
live constraints/RLS and preservation of actual learning records need user checks.

Manual acceptance:

1. Record one edited/reviewed existing card's ID, text, concept link, schedule
   and history, plus a custom concept title if present. Run the complete SQL.
2. Check NOTICE for zero new concepts/thirty new cards with prior packs present;
   summary: Control flow 9/134, batch presence 30, ordered questions 134.
3. Refresh the app. Open Control flow: expect recognizable ordered subtopics.
   If you customized a concept title it should remain yours.
4. Open If/else concept practice. With no pending/due reviews, its first new
   question should identify the condition in if (ready), then a false condition,
   if/else, else-if and block grouping. Check later questions build in scope.
5. In Study today, due reviews should remain first; new questions should follow
   the earliest topic and teaching order. Types still precedes Control flow.
6. Verify the sampled older records remain unchanged. Edit/review a new card,
   rerun SQL: zero new questions and all its edits/schedules/history survive.
7. Check phone-width code/choices, source links and feedback. Report counts,
   order surprises, unclear questions or SQL errors before further authoring.

Coverage remains incomplete. Neither 134 cards nor this sequence establishes
mastery. The authoring contract now requires beginner-to-advanced progression
and varied MC tasks for every future bundle.

Validation result: 30/30 new snippets passed JDK 25.0.2 --release 21, without
previews. All 57 Knowledge tests passed, including the 10 focused progression/
queue/content checks; the strengthened consolidated-view check also passed in
the final focused rerun. Production build and targeted ESLint passed. Build
retains existing large-bundle/stale Browserslist warnings. Java 27 execution,
SQL execution against PostgreSQL/Supabase and browser/mobile behavior remain
unverified. No live database connection or credentials were used.
