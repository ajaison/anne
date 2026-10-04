# Project Anne - Development Tracker & AI Context

This file serves as a comprehensive guide and long-term context tracker for "Project Anne". It is specifically designed to get new AI coding sessions quickly up to speed on what we are building, where everything is located, and what the roadmap looks like.

## Current priority — updated 2026-10-04

The hub must work on desktop and mobile. The primary focus is Knowledge: a
developer mastery trainer for a mid-level Java, React, and TypeScript engineer,
with roughly one hour of focused morning practice. The goal is production
knowledge, recall, coding fluency, debugging, edge cases, and long-term retention.

Add pathways alongside existing projects/decks: clickable ordered topics,
atomic concepts, varied exercises, concept-level spaced repetition, visible
mastery, last-practised dates, and due/weak indicators. Mastery must depend on
unassisted performance across different days and exercise types. Curriculum
coverage and exam readiness must be shown separately from mastery.

The repository root `AGENTS.md` points agents here. Keep this filename as the
canonical tracker. Read [KNOWLEDGE_DESIGN.md](KNOWLEDGE_DESIGN.md) for the current
code inspection, requirement gap analysis, proposed data model, and staged plan.
Ordered pathway navigation and concept/review evidence are implemented.
Concept scheduling and mastery remain proposed; see updates 4 and 5 below.

### Content-first priority — user update 2026-10-04

The user considers the app usable enough to begin learning and wants to fill
the Java pathway deeply before further UX work. Work through topics in order,
expanding concepts and practical multiple-choice questions in importable batches,
then wait for import/practice feedback. Topics 1/2 are starter content, not
complete coverage. Do not return to the Collections pilot as the primary focus.

[JAVA_CURRICULUM_AUTHORING.md](JAVA_CURRICULUM_AUTHORING.md) is the durable
new-session handoff: topic ledger, coverage standards, Java 27 requirements,
existing schema/seed references, stable IDs, progress-preserving SQL rules and
a reusable prompt. Default next content task: deepen topic 1, then topic 2,
then remaining topics. No live content import is assumed from generated files.

## Iterative delivery workflow — agreed 2026-10-04

Use this file as the project document; do not introduce a second `project.md`
with competing context. Deliver one small, testable update at a time:

1. Describe the update's scope and expected behavior.
2. Implement it and run checks appropriate to that change.
3. Give the user specific manual testing steps for desktop and mobile.
4. Wait for the user's test feedback before starting the next update.
5. Fix issues found in that update, then record its outcome here.

### Run locally

```sh
cd /Users/alanjaison/Documents/2026/workspace/anne/main
npm run dev -- --host 0.0.0.0
```

Open the Local URL printed by Vite and visit `/knowledge`. For a phone on the
same Wi-Fi, use the printed Network URL. Vite may select another port if its
default port is occupied. Keep the terminal running; Ctrl+C stops the server.

### Update 1: reliable study-mode selection and import

Status: implemented and accepted by the user on 2026-10-04. The invalid batch
returned the expected Card 2 error, and the valid study-mode sample worked
correctly. Separate mobile testing was not reported.

Goal: every existing/imported card renders a usable study exercise, and the
app respects the mode selected by the author.

Scope:

- Centralize validation/normalization of the four supported study modes.
- Accept legacy `fill_in_the_blank` as `fill_blank` when loading or importing
  cards, so existing stored cards work without a database migration.
- Honor explicit `classic`, including code cards. Use classic as a predictable
  fallback for missing/unknown stored modes.
- Validate bulk imports before saving: reject unsupported explicit modes and
  missing/empty question or answer fields with useful item-level messages;
  keep existing JSON and pipe formats available.
- Correct the generation prompt and local card packs to use `fill_blank`.

Acceptance checks:

- A classic card stays classic and offers Show Answer plus rating buttons.
- A legacy blank card renders the Fill in the Blank exercise.
- All four supported modes render and advance normally.
- Unknown stored modes fall back to classic instead of a blank study screen.
- Invalid imports show an actionable error before inserting any cards; valid
  legacy JSON imports are normalized and saved correctly.
- Existing cards remain readable; no review records or schedules are migrated.
- Check the study flow on desktop and a narrow/mobile screen.

Implementation: shared mode resolution in `services/studyModes.ts`, validated
batch parsing in `services/cardImport.ts`, inline import errors in DeckView,
and Quick Add no longer changes Classic when it detects code. Legacy modes
normalize during study without rewriting remote or cached records. The
generation prompt and four bundled packs now use `fill_blank`.

User test procedure:

1. Create a temporary project/deck for this test.
2. In Bulk Add, paste `tests/fixtures/invalid-import.json`. Expect an error for
   Card 2 and zero cards inserted; the pasted text should remain editable.
3. Replace the text with `tests/fixtures/study-modes.json` and import. Expect
   five cards. Study all five: Classic code stays Classic, both blank spellings
   render blanks, and multiple-choice/typed-answer modes work.
4. Use Quick Add, select Classic, then enter fenced code in the answer. Expect
   the selection to stay Classic.
5. Repeat the import-error and study interactions on mobile/narrow width.
6. Report any issues before update 2 starts.

Automated checks: `npm run test:knowledge` (Node 22.6+ type stripping) covers
mode resolution, JSON/pipe compatibility, whole-batch rejection, malformed
input, and all 80 bundled cards. All six checks and the production build pass.
Lint reports 11 existing errors and 8 warnings (down from the inspection's
16 errors and 9 warnings); the new helpers have no lint findings. No database
migration was needed. User acceptance testing passed as described above.

### Update 2: reliable review submission and interval previews

Status: implemented 2026-10-04; automated verification complete. The user
subsequently requested update 3; separate manual save-test results were not reported.

- Prevent rapid clicks/keyboard input from submitting the same review twice.
- Allow revisiting completed cards without awarding XP or recording another
  review; keep their recorded result visible.
- Extract the existing scheduler into a shared pure function and use its
  calculated intervals for the rating-button previews. Preserve the current
  algorithm in this update; do not advertise intraday relearning it lacks.
- Advance and award XP only after a successful save. Show save failures and
  provide a retry path that avoids re-recording a completed review.
- Keep in-session card statistics consistent with saved results.
- Surface the current offline persistence limitation clearly. Full review
  outbox/reconciliation remains separate planned work.

Acceptance: repeated input records one review, revisiting cannot inflate XP or
accuracy, previews match saved next-review dates, and failed saves keep the
current card available for recovery. Verify with focused automated checks and
user testing before moving on to the multiple-choice content improvements.

Implementation:

- `services/scheduler.ts` supplies both previews and persisted schedules,
  preserving the original algorithm (including Again being tomorrow).
- `services/reviewSaver.ts` locks each submission synchronously, returns one
  committed result per card in a session, and remembers completed save stages.
- `services/reviewPersistence.ts` checks remote errors and verifies the card
  update affected a row. It uses an explicit UUID for each history insert; on
  a duplicate-ID response it verifies the existing row matches the original
  card/rating/time before accepting it. Cache updates now upsert full cards.
- A single unfinished review draft is kept in sessionStorage per deck/tab.
  Same-tab reloads restore that original result/ID/schedule for manual retry.
  This is not a full offline review outbox or persistent session history.
- XP, streaks, summary results, and navigation update only after saving
  succeeds. Prev displays completed cards read-only with their recorded result
  and next-review date. Interactive buttons/keyboard input lock during saves.
- Offline attempts remain pending until the user reconnects and retries;
  unsupported offline syncing is visibly explained.

Limitations: the two Supabase writes are still separate requests, not a server
transaction. A schedule may be saved before history fails; retry finishes the
original attempt without applying a second schedule progression. The recovery
draft survives same-tab refreshes, not closing the tab. Completed-session XP
and results remain transient. Live policies/schema must support the existing
history UUID primary key and reads/writes; no remote migration was performed.

User test procedure (use the temporary deck from update 1):

1. Study a card and rapidly double-click its rating/Next button or press Enter
   repeatedly after answering. Expect one saved review, one XP award, and one
   card advance.
2. Click Prev. Expect the recorded answer/result and next-review date, with no
   rating controls. Next returns to the current unanswered card; XP stays fixed.
3. On a Classic card, check the rating intervals. New cards show 1d for all
   ratings under the preserved algorithm. Again shows 1d, not <10m. After saving,
   use Prev to verify the recorded date matches the selected interval.
4. While a loaded card is displayed, simulate Offline in browser DevTools or
   disconnect the network, then submit. Expect a visible error/Retry button,
   no XP award, and no card advance. Reconnect and click Retry; it should finish
   once. Optionally refresh the same tab before retrying to verify restoration.
5. Finish the deck. The summary should contain one result per studied card and
   accuracy no greater than 100%. Check navigation/retry layout on mobile too.

Verification: all 15 focused checks pass (six content/import checks and nine
scheduling/save checks), including concurrent submissions, staged failures,
offline retries, and restored requests after a lost response. Production build
passes. Lint remains at 11 existing errors, with warnings reduced from 8 to 4.
Live browser/database behavior is awaiting user testing.

### Update 3: convincing multiple-choice questions

Status: implemented 2026-10-04 at the user's request; edit-layout correction
accepted. Broader manual test results were not separately reported.
User preference: conceptual questions should use multiple choice, not typed
short-answer matching.

- Present one correct option and three carefully authored alternatives based
  on realistic misconceptions. Keep options comparable in length, formatting,
  specificity, and style; avoid clues from an unusually detailed correct answer.
- Show the explanation after selection, ideally explaining why the alternatives
  are wrong. Keep the correct option distinguishable from this feedback content
  internally; this does not require the learner to type an answer.
- Avoid unrelated sibling answers or generic Java error messages as automatic
  substitutes for conceptual distractors. Identify content needing authored
  choices instead of treating generated filler as good learning material.
- Shuffle choices without changing them while the learner answers/saves.
- Update authoring/import guidance and demonstrate the flow with a small
  carefully reviewed Java topic pack before changing large amounts of content.
- Convert conceptual typed-answer cards as content is updated, preserving their
  IDs/review records. Existing Classic/blank modes remain available; the user
  has not requested a wholesale removal of those accepted modes.

Typed-answer grading improvements and open-ended code/rubric exercises are
deferred. Concept tracking is still needed for topic mastery regardless of how
the questions are presented. Multiple-choice performance provides recognition
and reasoning evidence; it must not alone claim code-from-memory mastery.

Implementation and compatibility:

- MultipleChoiceCard uses exactly three authored distractors and one correct
  option; sibling-card and generic-error fallback choices were removed.
- Choices are shuffled once when the card mounts and remain stable during
  feedback and saving. Correctness remains an exact option comparison.
- The answer's first paragraph is the complete correct option; text after a
  blank line is post-selection feedback. Compact multiline options are retained
  instead of truncating them to the first line. Inline Markdown code now renders
  inline in explanations rather than being treated as a fenced block.
- Imports can use `correct_option` + `explanation`, which are combined into the
  existing `answer` column. Existing `answer`-format cards remain supported.
  New MC imports require three nonempty, distinct authored alternatives that
  differ from the correct option; ambiguous answer fields are rejected.
- Quick Add and the full editor expose correct option, three wrong options,
  and explanation fields. Save errors retain the draft. Edit card updates only
  content, preserving IDs and scheduling/history. Legacy typed cards offer
  Convert to multiple choice; existing remote cards are not rewritten in bulk.
- Unprepared stored MC cards display Needs answer choices in the deck. Study
  allows ungraded answer viewing and skipping; skips do not update SRS/history,
  award XP, or enter the accuracy denominator. Summary reports skipped cards.
- AI prompt/context export now retain authored alternatives and recommend MC
  questions. Automatic format validation cannot judge how convincing a wrong
  option is; authored content still needs review.
- Four Java 21 Collections questions with comparable options and source-linked
  explanations are in `cards/pilots/java_collections_choices.json`. No database
  migration or remote data change was performed during implementation.

User test procedure:

1. Import the four-card pilot JSON into a fresh temporary deck using Bulk Add.
2. Study it: expect four believable options per question, no typed input, and
   no explanation until selection. Try correct and incorrect selections; check
   feedback, Next, Prev, and save behavior on desktop/mobile.
3. Edit an imported card, alter an option/explanation, and save. Expect the same
   card ID and existing review progress. Study again to see the updated content.
4. Use Quick Add to author an MC card. Missing/duplicate alternatives should
   give validation feedback without clearing the input; complete options save.
5. To exercise legacy handling, view an existing stored MC card without three
   usable alternatives. Expect the preparation notice and ungraded Skip.
   Repair it through Edit card. Do not test this by importing an invalid new
   card: the importer now correctly rejects incomplete MC content.
6. Optionally convert an existing typed card with Convert to multiple choice,
   adding its three authored alternatives before saving.

Verification: all 21 focused tests pass, including the original 80-card packs,
new import/storage compatibility, duplicate-option rejection, no-filler
handling, multiline options, shuffling, and the pilot pack. Production build
passes. Lint is down to 6 existing errors and 3 warnings. Live authoring,
persistence, and desktop/mobile interactions await user testing.

User feedback fix: the Question and Correct answer textareas in Edit card were
not stretching after introducing the disabled fieldset. Restored the fieldset's
vertical flex layout, added visible field labels, and applied the shared
full-width textarea styling (including light/dark colors).

The user accepted the corrected edit-screen layout ("this looks great").
The build passed after the fix. Broader MC/save/mobile test results were not
separately reported; the user is discussing the next iteration.

### Update 4: reusable concept tracking and topic practice

Status: implemented and accepted. The user ran the SQL successfully and
confirmed the concept flow works great. This is general product functionality. Collections is sample content,
not a dedicated feature or architecture dependency.

- Any deck now has a Concepts view. Create concepts with stable database UUIDs
  and learning objectives; link several existing questions to each concept.
- A deck is the temporary topic container. Future ordered Java/React pathways
  can reference these topic containers and concept identities.
- Optional card links preserve existing IDs, content, schedules, and history.
  Ordinary deck study still includes unlinked cards. Existing editing preserves
  concept links because content updates do not send that field.
- Practice concept selects only that concept's prepared MC questions, using the
  existing grading, schedule, save locking, retry, and Prev protections. Unfinished
  reviews from another concept in the same deck must finish first, with a notice.
- Linked history stores the exercise ID snapshot, concept snapshot, mode, correctness,
  first-attempt status, rating, and original practice timestamp. Retry duplicate-ID
  verification now also checks the concept and evidence. Classic ratings have
  null correctness/first-attempt fields. Old rows are not backfilled or invented.
- Topic concepts show prepared/linked question counts, correct first choices out
  of recorded MC reviews, different questions practised, and last practice time.
  Self-ratings and historical unknowns do not enter MC correctness counts.
  New topic/card/history queries paginate rather than silently cap counts.
- There is no mastery percentage yet. Card schedules and the existing extra
  practice fallback are retained; this is not concept scheduling or delayed
  retention qualification. Those are the next iteration after user acceptance.

Database delivery: `supabase/migrations/20261004_concept_tracking.sql` is a
transactional, run-once migration. It adds concepts, nullable links/evidence,
parent-deck visibility policies and same-deck guards; it changes history's card
foreign key to SET NULL so deleting questions retains review records and the
exercise UUID snapshot. Existing
card/history grants and policies are unchanged. No content is automatically
seeded, no existing schedules/ratings are rewritten, and no live SQL was run.

Ownership inspection is repository-based, not a verified live audit: the app
has no Knowledge login or learner-scoped queries; supplied history SQL allows
public reads/inserts; other live policies are unknown. New concept access follows
visible parent decks in the current shared personal vault. This does not create
private learner ownership. Read-only schema/policy inspection queries, migration
prerequisites, and exact test steps are in `supabase/CONCEPT_TRACKING.md`.

Before applying the migration, Concepts reports that tracking needs setup and
normal unlinked deck study remains usable. Linked reviews require richer history
and fail visibly/retry if that write cannot be saved. Topic progress needs a live
connection; this update does not introduce offline concept sync or a review outbox.
Dexie can retain the added card property without a schema/index migration.

User test: apply the SQL using the setup guide, then open any deck -> Concepts.
Create one concept and link two prepared MC questions, leaving another unlinked.
Practice the concept; save one correct and one incorrect result. Return and reload:
expect 1 / 2 reviews, two questions practised, and a saved date. Verify normal deck
study still includes unlinked cards, content edits preserve concept links, and
reassignment keeps past evidence attached to the old concept. Check narrow/mobile
layout and retry/Prev behavior before moving to ordered pathways and mastery.

Verification: 26 focused tests pass, including concept filtering, historical/self-
rating exclusions, wrong/repeated-choice counts, original evidence recovery after
reassignment/reload, and rich duplicate-ID checks. Production build passes with
the existing bundle-size/Browserslist warnings. Lint remains at 6 existing errors
and 3 warnings, with no new findings. The user subsequently applied the SQL and accepted the concept/practice flow.
Separate mobile/recovery checks were not explicitly reported.

### Update 5: ordered pathways and fresh Java configuration

Status: implemented; awaiting user acceptance testing.

Structure agreed: Project (Java) → Pathway → Topic/deck (Collections) →
Concept (equality/hashing) → Questions. Collections remains a topic.

- Source-controlled, versioned Java (15 topics) and React (8 topics) outlines,
  with recommended ordering, learning objectives and explicit deck-name aliases.
  Based on official Java/React learning areas; these are not exam syllabuses.
- Projects named Java/React automatically open their pathway. Generic projects
  keep the old deck browser. Manage decks and Open pathway connect both views.
- A fresh Java project shows planned topics and Set up topics. The action creates
  missing topic decks through the app, leaving them empty for content authoring.
  Individual setup is also available. Existing matches/content/history are reused.
- Pathway topic buttons show available questions, concept practice coverage,
  reviewed questions due and last recorded concept practice. Empty topics are
  visibly planned/awaiting content, never presented as completed or mastered.
- Topic → concept detail shows the objective, first-choice results, question
  variety and recent history; practice returns to its originating concept/topic,
  preserving pathway navigation. Manage questions remains the existing editor.
- Due counts use current card schedules and include previously reviewed Again
  cards even when repetitions is zero. New/unlinked/unprepared questions do not
  count as ready due questions. Open next due topic chooses a relevant deck; a
  combined review queue/concept-level scheduling remains future work.
- Reads are project/deck/concept-scoped and paginated. No new SQL is needed after
  the accepted concept migration. Extra unmatched decks stay available. Renamed
  decks need a recognized alias to stay in the ordered outline; editable persistent
  pathway bindings are deferred. Setup is protected from repeat clicks in-view;
  no cross-tab uniqueness is claimed without a database constraint.

The attempted shell read of Supabase was declined. The user chose to delete the
old Java project themselves and start afresh. The agent did not delete anything
or access/change live project data. Configuration is in the app; topic setup
runs only when the user clicks its action. Deleting the old project is optional
and removes its content; the user was advised to export anything to keep.

See `PATHWAYS.md` for setup, metrics, caveats and tests. User test: create/open
Java → Set up topics → Collections → add concept(s) → Manage questions and link
MC questions → concept detail → Practice → return to pathway and refresh. Expect
saved dates/coverage, no mastery claims, stable topic counts and mobile navigation.

Verification: 32 focused tests pass; production build passes. Pathway matching,
project scoping, legacy aliases, failed-practice coverage, due/new/Again exclusion,
deleted-question evidence and return URLs are covered. Lint remains at 6 existing
errors and 3 warnings; new functionality has no lint findings. Live setup and
browser/mobile interactions are awaiting user testing.

### Update 6: Java 27 foundations content and runnable SQL seed

Status: authored and verified locally as described below; user has not yet run
this content seed. The user requested topic 1 and 2 only, then explicitly selected
Java 27 as the target. No live database was read or written by the agent.

- Java pathway now says Java 27; project aliases include Java and Java 27 while
  retaining existing Java 21/Fundamentals compatibility. Ordering remains source-
  configured in `src/apps/knowledge/curricula/pathways.ts`; actual learning records
  and review evidence remain in Supabase. No schema migration is introduced.
- `cards/pathways/java_foundations_1_2.json`: 2 topics, 16 concepts and 48 authored
  multiple-choice questions (8 concepts and 24 questions per topic). All questions
  have three alternatives, post-choice feedback, Java 27 specification links and
  code snippets with independent expected-output/error verification metadata.
- Topic 1 covers values/references, literals/var, initialization/assignment,
  promotion/narrowing, overflow/division, floating-point behavior, equality/
  unboxing and evaluation. Topic 2 covers branches, loop bounds/tests, transfers,
  labels, switch groups/expressions and scope/reachability. Preview features are
  excluded. This starter pack does not claim complete curriculum/exam coverage.
- `supabase/seeds/java_foundations_1_2.sql`: transactional seed finds the sole Java
  project (or creates it), reuses matching topic decks/concepts, and inserts linked
  ready MC cards with initial schedules. Duplicate project/topic/concept matches
  fail explicitly; an optional project UUID selects between Java projects.
- Deterministic question IDs and ON CONFLICT DO NOTHING preserve existing card
  edits, links, schedules and history on rerun. Complete concept groups are skipped;
  no existing content is overwritten. Remaining topics are not seeded here.
- SQL is generated by `npm run seed:java:foundations`; no keys/credentials/network
  access are needed. Run the generated full file in Supabase SQL Editor, then
  refresh Java. Fresh counts: topic 1 = 8 concepts/24 cards, topic 2 = 8/24.
  `supabase/seeds/JAVA_FOUNDATIONS.md` documents prerequisites and acceptance steps.

Verification: 35 focused Node tests pass, including pack/app format compatibility,
unique content keys and first-two-topic alignment. All 48 learner-visible snippets
were compiled/executed using the available JDK 25.0.2 with --release 21: expected
outputs, compilation errors and runtime exceptions matched. References were
reviewed against the official Java 27 specification. This baseline check is not
Java 27 compiler/runtime verification: JDK 27 is not installed locally. The
verifier defaults to --release 27 and requires a suitable JDK; older-JDK baseline
runs require explicit --baseline-release=21 and label that limitation. The SQL
seed has not been executed against PostgreSQL/Supabase in this session.

### Update 7: Topic 1 Java curriculum depth batch 1

Status: authored, baseline validated, SQL supplied 2026-10-04. User import and
practice feedback pending; wait before authoring the next batch. No Supabase
connection, schema migration or application feature change.

- Audited Topic 1 starter coverage and added `cards/pathways/coverage/java_types.md`
  with subrule inventory, stable question keys, source sections and remaining gaps.
- `cards/pathways/java_types_depth_1.json` adds 32 MC questions with practical
  contexts, plausible alternatives, all-option feedback and official Java 27
  sources. Extends all eight existing concepts and adds bit masks/shifts.
  Topic 1 cumulative: 9 concepts / 56 questions; both starter topics plus this
  batch: 17 concepts / 80 questions. Topic 1 remains incomplete.
- `supabase/seeds/java_types_depth_1.sql` uses unchanged `java-foundations-v1`
  identities, transaction/setup lock, optional project UUID, text[] alternatives,
  real answer paragraph breaks and initial schedules for new cards only.
  ON CONFLICT DO NOTHING preserves edits, links, schedules and review history.
  Parent recovery handles known renamed adopted parents; ambiguous/moved data
  stops rather than silently duplicating or moving content. Read-only summary
  scopes to the selected project/deck and reports 32 batch identities present.
- Reproduce with `npm run seed:java:types-depth`; verifier now supports optional
  `--pack=` without changing its original default. Full instructions and expected
  starter/empty/rerun counts: `supabase/seeds/JAVA_TYPES_DEPTH_1.md`.

Validation: 38 Knowledge tests passed on Node 22.17.1. All 32 new and all 48
starter snippets passed Homebrew JDK 25.0.2 with javac --release 21, no preview.
Java 27 compiler/runtime verification remains unavailable. SQL was generated,
reviewed and statically checked; no local PostgreSQL executable was available
and no live seed was run. Original schema/defaults remain inferred from client
and migration references. Git status inspection was blocked by the host's
unaccepted Xcode license; no license or system settings were changed.

User checks: run the full SQL; starter-only Topic 1 should add one concept and
32 questions (final 9/56). Refresh and practise on desktop/mobile, check source
links and feedback, save/edit a card, then rerun: zero additions with unchanged
content, schedule and history. Report import/practice results. Next content task
continues Topic 1 conversion contexts, evaluation and literal/var gaps after
feedback; do not infer mastery or exam readiness from question counts.

### Foundations completion plan — user direction 2026-10-04

The user wants continued nonduplicative, gap-driven content across all five
Foundations topics: Types, Control flow, Methods, Arrays and Strings. A small
plan is recorded in `JAVA_CURRICULUM_AUTHORING.md`. Next: Topic 1 conversion/
evaluation/assignment gaps, then literal/var/numeric/bitmask gaps, followed by
residual audit and Control flow expansion. Author 25–40-question batches,
compare against existing structured and legacy content, and preserve the current
JSON/SQL workflow and learning records. Final section audit includes mixed and
unseen scenarios. Coverage completion and learner mastery remain distinct;
finishing MC cards alone does not establish practical coding fluency. No new
questions in this planning update; prior seed import/practice remains unreported.

### Update 8: Topic 1 Java curriculum depth batch 2

Status: authored, baseline validated and SQL supplied 2026-10-04 after user
requested continued gap-driven Foundations content toward hundreds of questions.
User import and practice acceptance remain unreported. No application feature,
schema migration, credentials or Supabase connection.

- `cards/pathways/java_types_depth_2.json`: 40 new MC questions extending six
  existing concepts. Targets assignment/invocation conversions, unary/mixed
  promotion, precedence/evaluation/failure timing, conditional typing,
  definite assignment, wrapper/null equality and remaining var restrictions.
  Each question records its coverage gap, exact executable snippet, all-option
  feedback and official Java 27 source. No previews. Compared with prior
  pathway and legacy/pilot content for duplicates; deliberate contrasts test
  different guaranteed rules, not renamed/renumbered copies.
- `supabase/seeds/java_types_depth_2.sql`: same stable namespace and transaction
  protections, six existing concepts reused, forty linked cards inserted only
  if absent. Current edits, links, schedules/history stay preserved on rerun.
  Known-parent recovery includes starter and depth-1 keys. Previous JSON/SQL
  artifacts are unchanged. The existing Types generator supports explicit
  alternate input/output, requiring output to avoid accidental replacement.
- Expected after all packs: Topic 1 = 9 concepts / 96 questions, Control flow
  remains 8/24. Structured Foundations = 17 concepts / 120 questions. Methods,
  Arrays and Strings still need structured batches. Counts describe authored
  scope, not mastery or confirmed live content. Coverage ledger and authoring
  handoff updated; instructions: `supabase/seeds/JAVA_TYPES_DEPTH_2.md`.

Verification: 41 Knowledge tests pass on Node 22.17.1. All 40 new snippets pass
Homebrew JDK 25.0.2 using javac --release 21 and matching runtime, no preview.
Java 27 runtime/compiler verification remains unavailable. SQL was reviewed,
generated and statically checked; no local psql executable and no live SQL run.
Schema/default assumptions remain as previously documented. Supplied import
steps check 40 additions, 40 batch identities, practice/feedback on desktop and
mobile, and a rerun after edits/reviews preserving prior records.

Next content: Topic 1 depth 3 literal/character/numeric/bitmask boundaries and
repair decisions, then coverage audit before Control flow expansion. User
import/practice feedback can identify corrections to prioritize first.

### Active topic update — Control flow, 2026-10-04

User requested moving to the next Foundations topic and faster progress.
Topic 2 Control flow is now active: 8 starter concepts / 24 authored questions.
`cards/pathways/coverage/java_control_flow.md` records the starter inventory,
missing rules and the next planned 40-question batch. Topic 1 is parked at
96 questions with its residual gaps intact; it is not declared complete.

Validation is proportional: verify new content/duplicate scenarios and new
snippets each batch; rerun focused tooling tests only when relevant tooling
changes, with broader app regression tests when shared changes/failures warrant.
Do not routinely rerun old snippet checks or production build/lint for content
additions. This planning/audit update adds no questions or SQL; import/practice
acceptance of previous packs remains unreported.

### Update 9: Control flow curriculum depth batch 1

Status: authored, baseline validated, SQL supplied 2026-10-04. User import and
practice acceptance unreported. No live database/credential access, migration
or application changes. User asked for faster, focused content delivery.

- `cards/pathways/java_control_flow_depth_1.json`: 40 new MC variants extending
  eight existing concepts: branch priority/guards, practical loop bounds/retries,
  switch-versus-loop transfers, label validity, colon/default/constant matching,
  switch-expression null/yield/throw/exhaustiveness and scope/reachability.
  Every card has its specific coverage gap, source and exact verification code.
- `supabase/seeds/java_control_flow_depth_1.sql` retains the shared setup lock,
  stable `java-foundations-v1` identities, optional project UUID, known-parent
  recovery and insert-only conflict handling. Summary uses Control flow IDs.
  Existing edits, links, schedules/history and prior pack artifacts stay intact.
- With starter present: zero new concepts, forty cards; Control flow final 8/64.
  All structured Foundations packs: 17 concepts / 160 cards, Types stays 9/96.
  Empty topic gets 8/40 from this batch alone. Rerun adds zero. Coverage is
  incomplete and does not establish mastery. Updated coverage/authoring ledger;
  instructions: `supabase/seeds/JAVA_CONTROL_FLOW_DEPTH_1.md`.

Focused verification: all 40 new snippets pass Homebrew JDK 25.0.2 with
javac --release 21 and matching runtime, no previews. Three new focused tests
pass for duplicate keys/snippets, app MC formatting, unchanged concept identity
and deterministic SQL/preservation/summary. No full app suite, older snippet
reruns, build or lint: no shared application/verifier behavior changed. Java 27
execution and PostgreSQL/Supabase SQL execution remain unverified.

Next Control flow content: final reference patterns, guards/dominance, richer
switch statement/expression contrasts, enhanced-for behavior and practical
loop/switch repair choices. Existing user content/import acceptance is not inferred.

### Next updates (order can adapt to test feedback)

1. Update 1 above: mode selection/import reliability.
2. Review reliability: duplicate submission/navigation protection, correct
   interval previews, and visible persistence errors.
3. Multiple-choice content: convincing authored options for conceptual questions,
   stable shuffled choices, and explanations after selection; typed conceptual
   answers and open-ended submissions are deferred.
4. Database/ownership readiness and concept/review evidence extensions.
5. General Java/React pathways (Collections as pilot content): topic buttons, varied exercises,
   concept schedule, last practised, and evidence-based mastery.
6. Validate delayed reviews and mobile daily use; expand to React/TypeScript.

Offline review reconciliation must be complete before offline learning is
treated as reliable; schedule it alongside persistence work as needed.

## 🎯 Vision & Concept
The purpose of this site is to serve as a **personal hub of small applications** designed to solve personal problems and host personal projects for the user. 
Rather than having multiple disconnected websites, everything is unified under a single dashboard. 

## 🏗️ Architecture & File Structure

The project lives under the `main/` directory and is organized into a modular app structure.

```text
main/
├── src/
│   ├── apps/
│   │   ├── hub/         # The main entry/dashboard that links to other mini-apps
│   │   ├── birthday/    # The girlfriend's birthday game app
│   │   └── knowledge/   # "2nd Brain" - Brainscape/Anki/Notion clone using Supabase
│   ├── shared/          # Shared components, hooks, utilities used across apps
│   ├── App.tsx          # Main React router and app shell configuration
│   ├── main.tsx         # React entry point
│   └── index.css        # Global CSS variables and vanilla CSS styles (No Tailwind)
├── index.html           # HTML template
├── package.json         # Project dependencies and definition
└── vite.config.ts       # Vite bundler configuration
```

### 🧰 Technology Stack
*   **Core:** React 19, TypeScript, Vite
*   **Routing:** React Router v7 (`react-router-dom`)
*   **Styling:** Vanilla CSS (`index.css`) with rich, modern design aesthetics (glassmorphism, vibrant colors, gradients). Tailwind CSS is *not* used.
*   **Animations:** `framer-motion` for micro-interactions and page transitions, prioritizing a dynamic, premium feel. 
*   **Icons:** `lucide-react`
*   **Backend / Database:** Supabase (`@supabase/supabase-js`) is used as our backend-as-a-service (BaaS), specifically managing the relational database for our knowledge tracking app.
*   **PWA:** `vite-plugin-pwa` is configured to enable "Add to Home Screen" on iOS and provide the foundation for offline access.

## 📱 Sub-Applications

### 1. Hub / Dashboard (`src/apps/hub/`)
*   **Purpose:** The central navigation point where all small personal applications can be launched.
*   **Status:** Active/Ongoing

### 2. Birthday Game App (`src/apps/birthday/`)
*   **Purpose:** A birthday-themed application containing several mini-games (Wordle, Trivia, Love Letter, Connections, Balloon Pop, Candle "Make a Wish"). 
*   **Features:** Password-protected entry, progress tracking, background music, memory carousels, and an overarching "reward" system.
*   **Status:** Mostly complete (needs occasional refining).

### 3. Knowledge / "2nd Brain" App (`src/apps/knowledge/`)
*   **Purpose:** A comprehensive Brainscape/Anki/Notion clone designed to store long-term knowledge and assist with learning via Spaced Repetition (SRS).
*   **Backend Integration:** Utilizing a Supabase backend to store entities like Projects, Decks, and Flashcards within a relational database. Memory tracking and spaced repetition algorithms are central to this app.
*   **Current Focus:** Developing study sessions, memory interval tracking, responsive mobile/desktop design, and polishing the UI.
*   **Status:** In Progress. 

---

## 📋 Task Tracker

### To Do (Backlog)
*   [ ] Refine spacing, typography, and responsive layouts across the Knowledge app.
*   [ ] Complete offline support: deck/card download already exists, but review history/outbox, upload reconciliation, and metadata fallback are missing.
*   [ ] Fix SRS correctness and persistence: actual interval previews, duplicate submission/navigation protection, error handling, and consistent history updates.
*   [x] Normalize imported question modes (`fill_in_the_blank` versus `fill_blank`) and honor explicit classic mode; user accepted update 1.
*   [x] Improve conceptual multiple-choice content with authored alternatives and post-answer explanations; update 3 implemented, pending user testing. Typed/open-ended grading remains deferred.
*   [ ] Document the complete database schema and inspect live authentication/ownership policies before relying on private progress.
*   [ ] Build one Java Collections pathway slice with concepts, varied exercises, concept scheduling, mastery evidence, and last-practised dates.
*   [ ] Verify the complete pilot learning flow before expanding Java, React, and TypeScript curricula.
*   [ ] Ensure flawless mobile experience for the study sessions.

### In Progress
*   Java content expansion is the current priority; use `JAVA_CURRICULUM_AUTHORING.md` to continue topic-by-topic. Concept scheduling/mastery and further UX changes are deferred while the user learns and provides feedback.

### Done
*   [x] Update 4: general concepts, optional links, durable review evidence and topic practice; SQL applied by user and accepted.
*   [x] Update 5: ordered Java/React pathways, fresh Java setup and concept-detail navigation; awaiting acceptance testing.
*   [x] Initial setup and Github repository connection.
*   [x] Completion of core Birthday Game web app features.
*   [x] Connecting Supabase client and setting up the basic table structure for the Knowledge app.
*   [x] IndexedDB deck/card download and card-fetch fallback (partial offline support).
*   [x] 2026-10-04 architecture inspection and developer mastery roadmap; root `AGENTS.md` for agent discovery.
*   [x] Update 1: reliable study-mode resolution, validated JSON/pipe imports with inline errors, preserved Classic in Quick Add, corrected generation/pack mode names, and six focused automated checks.
*   [x] Update 2: shared schedule/previews, locked resumable review saves, read-only revisits, same-tab pending-review recovery, accurate in-session results, and nine additional focused checks; pending user testing.
*   [x] Update 3: authored MC options, stable shuffling, post-selection feedback, creation/editing/conversion, validation and ungraded skip handling, plus a four-question Java Collections pilot; pending user testing.
*   [x] Configured PWA infrastructure for iOS setup.
*   [x] **Advanced SRS Algorithm**: Implemented prioritized review logic (Due -> New -> Cram fallback).
*   [x] **Rich Media Flashcards**: Added Markdown, Prism syntax highlighting, and Image URL support.
*   [x] **AI Workflow**: Implemented "Context Export" and "Bulk Import" features for rapid card generation.
*   [x] **Mobile Optimization**: Fixed Hub Dashboard and Knowledge Hub layout issues for narrow screens.
*   [x] **Interactive Study Modes**: Added 4 study modes to StudySession — Multiple Choice (auto-generated distractors from sibling cards), Fill in the Blank (Java keyword auto-extraction), Type Answer (Levenshtein fuzzy match), Classic flip. Mode is auto-selected per card based on card_type field and session index.
*   [x] **Session Gamification**: XP flash animation (+10/+15 XP), streak badge (🔥), animated Session Summary screen with accuracy %, XP, best streak, and per-card breakdown.
*   [x] **Quick Add Panel**: Floating slide-in panel (⚡ Quick Add button in DeckView) for rapid card creation. Supports Cmd+Enter to save & reset, auto-detects Java code, mode selector dropdown.
*   [x] **Java Syntax Highlighting Upgrade**: vscDarkPlus theme, JetBrains Mono font, java-orange accent border on all code blocks, line numbers, and copy-to-clipboard button.
*   [x] **Supabase Schema**: Added `card_type TEXT DEFAULT 'classic'` and `distractors TEXT[]` columns to cards table. Dexie local schema bumped to v2.
*   [x] **Smart Distractor Fallbacks**: Enhanced `MultipleChoiceCard` to prevent full paragraph sibling answer pull-in; now uses structural length matching and domain-specific fallbacks (Compiler Errors, numeric offsets, boolean pairs).
*   [x] **Paced Study Session Flow**: Removed auto-advance timers on interactive cards; added explicit **Next Question ➔** buttons with `Enter`/`Space` keyboard shortcuts for comfortable self-paced learning.
*   [x] **Session Navigation**: Added **← Prev** button in StudySession header allowing backward/forward card navigation during study sessions.
*   [x] **80 Core Java Mastery Flashcards**: Generated 4 modular JSON card packs (20 cards each across Variables, Control Flow, Arrays, and Strings & String Pool) adhering to senior engineering specs.

### Inspection caveats (2026-10-04)

The Done list records earlier implementation work, not verified production
readiness. Scheduling still operates per card. Pathways/concepts now exist, but
durable mastery scores, Knowledge login and code compiler/test runner remain absent.
AI generation is an external copy/paste workflow. Live database contents and
policies have not been inspected. `supabase_setup.sql` only defines history.
The four local packs total 80 cards; the counts in `CARD_GENERATION_PROMPT.md`
do not match those files, and live import is unverified.

Baseline lint: `npm run lint` reports 16 errors and 9 warnings across Knowledge
and Birthday. These predate this documentation-only change. `npm run build`
passes, with a large JavaScript bundle warning (about 1.51 MB before gzip).
Desktop/mobile behavior and the live database remain unverified. Git inspection
is currently blocked by the host's unaccepted Xcode license. Application code and
remote data were left unchanged.

---

## 🔮 Future Vision: "The Loom" (Journal + SRS)
A future concept to merge long-form journaling with memory retention.
*   **Concept**: Write thoughts/ideas freely and extract flashcards automatically.
*   **Features**:
    *   Markdown Note Editor with specific SRS tagging syntax.
    *   AI "Memory Extraction" to suggest flashcards from journal entries.
    *   "Incremental Reflection": SRS prompts to review past thoughts/memories, not just facts.
    *   Bidirectional linking between cards and the source notes/journals.

---

## 🤖 Guide for Future AI Sessions

When starting a new session:
1.  **Read this document** entirely to understand the scope and current goals.
2.  **Navigate to the `main/` directory** within the terminal before running any scripts (e.g. `cd main && npm run dev`). 
3.  **Adhere to UI/UX Principles**: 
    *   Maintain a premium, dynamic interface using Vanilla CSS and Framer Motion.
    *   Never use generic designs. Implement modern visual styles (curated harmonious colors, modern typography, glassmorphism).
4.  **Keep it Modular**: Make sure code written for one app stays within its respective directory under `src/apps/` unless it is explicitly intended to be a reusable component in `src/shared/`.
5.  **Update this Tracker**: Any significant architectural changes, new feature additions, or updates to the roadmap must be reflected in this file to keep it accurate.

### Update 10: Control flow curriculum depth batch 2 — 2026-10-04

Continued the active topic with forty distinct MC scenarios to fill documented
Control flow gaps, keeping validation proportionate to content/tooling changes.

- `cards/pathways/java_control_flow_depth_2.json`: 40 new cards across eight
  retained concepts plus `reference-patterns`. Official Java 27 sources,
  four authored choices, detailed feedback and per-card gap/snippet metadata.
- Fills reference matching/guards/dominance/null coverage, enhanced-for copies
  versus object mutation, switch label/arrow/typing constraints, pattern scope,
  transfer targets and do definite assignment. Coverage ledger updated with
  forty key-to-gap mappings, cumulative counts and remaining gaps.
- `supabase/seeds/java_control_flow_depth_2.sql`: same insert-only namespace,
  advisory lock, project selection and parent safety checks. Existing keys,
  edits, links, schedules and review history preserved by construction.
  Known-parent recovery includes starter/depth-1 keys. Generator supports
  explicit pack/output with guards; earlier SQL bytes unchanged.
- With starter and Control flow depth 1 imported: one concept and forty cards
  added; Control flow 9/104. All structured Foundations packs: 18 concepts /
  200 cards (Types 9/96). Rerun adds zero. Counts exclude extra user content.
- 40/40 snippets passed JDK 25.0.2 with --release 21, no previews; six focused
  tests across both Control flow packs passed after shared generator changes.
  No full app regression or older Java snippet suite rerun. Java 27 execution
  remains unverified. SQL statically checked, not executed against PostgreSQL/
  Supabase; no credentials, connection or live schema inspection.
- Delivery/import instructions: `supabase/seeds/JAVA_CONTROL_FLOW_DEPTH_2.md`.
  User import and practice acceptance remain pending. No app features changed.

Next gaps: applied loop/branch/switch repair choices, remaining reference-pattern
and enhanced-statement rules, flow-sensitive pattern scope and multiple-exit
assignment. Then Methods and scope, Arrays and Strings need structured depth.
Types and Control flow remain incomplete; counts are not mastery evidence.
Wait for this batch's import/practice feedback before proceeding further.

### Control flow depth 2 import feedback — 2026-10-04

User reported Supabase 22P02 JSON parsing failure immediately before the final
String-selector distractor. Current generated SQL payload parses successfully
as JSON (40 cards), includes the comma before that option, matches the source
pack and passes all three focused batch tests on recheck. The exact submitted
SQL is unavailable, so its divergence from the current file is unconfirmed.
Recommended replacing the entire SQL Editor contents with the current seed,
including ROLLBACK first if the failed transaction remains open. Import success
and practice acceptance remain pending; no Supabase connection was made.
