# Populate Java 27 foundations topics 1 and 2

## Run this file

Open `java_foundations_1_2.sql`, copy its entire contents into your Supabase SQL
Editor, and run it. This assumes the concept migration you already installed.
It seeds content; it does not change tables or access policies.

Leave `requested_project_id uuid := NULL` near the top for the normal case:
the script finds your sole Java project or creates one named Java if none exists.
If more than one Java/Java 21/Java 27/Java Fundamentals project exists, it stops without
committing. Replace NULL with the intended project's quoted UUID and rerun.

It reuses recognized existing decks (including topics created by Set up topics).
Ambiguous matching decks/concepts cause an explicit error, not an arbitrary
choice. Unrelated projects and the remaining 13 Java topics are untouched.

On a clean project, expect:

| Topic | Concepts | Questions |
| --- | ---: | ---: |
| Types, variables and operators | 8 | 24 |
| Control flow | 8 | 24 |
| Total | 16 | 48 |

The final query displays totals for matching Java topics, including existing
content if any. All 48 questions are multiple choice with one correct option,
three authored alternatives and explanations linking to the Java 27 specification.

## Concepts covered

Types: primitive values/references; literals/var; initialization/definite
assignment; numeric promotion/narrowing; overflow/division/remainder;
floating-point special values/precision; equality/boxing/unboxing; evaluation.

Control flow: boolean branches/else binding; for-loop bounds/empty bodies;
while/do-while tests; break/continue/update; nested labeled transfers;
colon-style switch/fall-through; arrow switch expressions/yield/exhaustiveness;
scope/reachability.

## After running

1. Refresh Knowledge and open Java. Topics 1 and 2 should each show 8 concepts
   and 24 ready questions. New questions are not counted as due reviews.
2. Open a topic, then a concept. Each seeded concept has three variants.
3. Practice, save a result, and return. Expect retained practice history/date.
4. Optionally rerun the seed after that review. It must not reset the card's
   schedule, history or content, and the fresh pack stays at 48 questions.

No live seed was executed by the coding agent. The original project/deck/card
schema is inferred from the working client; projects/decks need their existing
created_at defaults, and cards.distractors is expected to be text[]. If the SQL
errors, share the message; the BEGIN/DO/COMMIT seed transaction rolls back on
an insertion failure. The summary query runs after commit and only reads data.

Stable question UUIDs are derived from project UUID + versioned content keys.
Existing cards use ON CONFLICT DO NOTHING: user edits, links, schedules and
reviews are never overwritten. Existing complete concept groups are skipped.
Deleting a seeded question and rerunning restores it with initial scheduling fields;
past retained review rows stay untouched. Avoid changing content keys in version 1.
Renaming reused topic decks can require updating the source alias configuration;
the seed is not a mechanism for moving questions between decks.

## Pathway configuration versus learning data

The Java/React outline is currently configured in
`src/apps/knowledge/curricula/pathways.ts`: topic order, sections, objectives and
name aliases. Supabase stores the actual projects, topic decks, concepts, cards
and reviews. This script fills those actual learning records, with no manual
question linking required. An editable database-backed pathway outline can be
added later; it is not necessary to add or edit practice content now.

The source pack is `cards/pathways/java_foundations_1_2.json`. It is a structured
seed pack, not the flat Bulk Add JSON format. Regenerate its SQL with
`npm run seed:java:foundations`. Verify all learner-visible snippets with
`npm run verify:java:foundations` (JDK 27+; set JAVA_HOME if required). Verification
uses --release 27 to compile, and checks successful output, expected compilation
errors and expected runtime exceptions. The available local JDK is 25.0.2, so the snippets were checked using
--baseline-release 21 and reviewed against the Java 27 specification. This
baseline check is not a Java 27 compiler/runtime check. Run the verifier with
JDK 27 to complete release-specific execution verification. This is a starter practice pack, not a certification
syllabus or evidence of mastery by itself.
