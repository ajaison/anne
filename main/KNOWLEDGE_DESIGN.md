# Knowledge app inspection and minimum-change design

Inspected 2026-10-04. This document describes repository evidence and proposed
work, not a live database audit. No application code or remote data was changed
as part of the inspection. Build/lint results are recorded in PROJECT_TRACKER.md.

Subsequent implementation: Update 1 fixed mode resolution (including explicit
Classic and legacy blanks), batch import validation, and generation/pack mode
names. The inspection below remains a historical snapshot; current delivery
status and verification are tracked in PROJECT_TRACKER.md.

Update 2 also extracted scheduling for accurate previews, added checked and
resumable review saves, protected against duplicate submissions and regrading
via Prev, and added same-tab pending-review recovery. Offline review syncing
and server-transaction atomicity remain future work. See the tracker for tests
and limitations; the inspection below describes the earlier baseline.

User preference update: conceptual questions should use multiple choice with
convincing, comparable authored alternatives, rather than typed short answers.
Update 3 therefore prioritizes that experience and post-selection explanations.
Typed-answer and open-ended grading proposals below are deferred, not immediate
requirements. Concept-level history/mastery remains relevant to this approach;
multiple-choice evidence alone cannot establish code-from-memory proficiency.

Update 3 is now implemented: authored MC alternatives, stable option order,
post-selection explanations, creation/editing/conversion, validated imports,
and ungraded skipping of unprepared legacy cards. New JSON fields are mapped
into existing columns, so no remote schema migration was needed. A four-card
Java Collections pilot is available; see PROJECT_TRACKER.md for current status.

Update 4 adds general concepts inside existing decks, optional card links,
focused MC practice, and nullable durable review evidence plus topic counts/last
practice. The user applied the supplied migration and accepted the concept flow.
Concept scheduling, mastery and learner ownership remain proposed. See `supabase/CONCEPT_TRACKING.md` and the
tracker for setup and acceptance steps. Sections below remain the baseline.

Update 5 implements ordered Java/React pathway pages, fresh Java project setup,
and concept detail/history navigation. Projects are subjects, decks are topics,
and concepts remain smaller learning objectives. Source manifests match explicit
names/aliases; setup creates missing empty decks when clicked. No live project
was inspected or modified by the agent; the user chose a fresh start. See
`PATHWAYS.md` for configuration, metrics and limitations. Baseline below is historical.

Update 6 supplies a Java 27 starter content pack for foundation topics 1/2
(16 concepts, 48 MC questions) and a generated transactional SQL seed for the user
to run. The outline remains source-configured; learning records are database-
stored. Java 27 references were reviewed; snippet execution used an explicitly
labeled older-JDK baseline, since JDK 27 is not installed. See the tracker and
`supabase/seeds/JAVA_FOUNDATIONS.md`. No live seed was run by the agent.

## A. Current architecture

Anne is a personal mini-app hub. `src/App.tsx` routes to the Hub, Birthday, and
Knowledge apps. Knowledge is a React SPA using React 19, TypeScript 5.9, Vite 7,
React Router 7, vanilla CSS, Framer Motion, and Lucide icons. React Markdown,
remark-gfm, and Prism render card content. Supabase provides remote persistence;
Dexie provides IndexedDB storage. Vite PWA configuration exists, but `public/`
is empty, including the referenced manifest icons. Wrangler configuration
targets static `dist` assets; there is no custom application server in the repo.

### Screens and data flow

| Route / component | Current behavior |
| --- | --- |
| `/knowledge` / KnowledgeApp | List, search, create, delete projects; link to stats. |
| `/knowledge/project/:projectId` / ProjectView | Project details, deck list, deck creation. |
| `/knowledge/deck/:deckId` / DeckView | Card browser, creation/deletion, Quick Add, JSON/pipe import, AI context export, offline download, Study action. |
| `/knowledge/study/:deckId` / StudySession | Select cards, choose presentation, grade/self-rate, update schedule/history, show session summary. |
| `/knowledge/stats` / StatsView | Global card maturity, reviews due, rating-based success percentage, total reviews, 84-day activity calendar. |

Components include MultipleChoiceCard, FillBlankCard, TypeAnswerCard,
FlashcardContent, QuickAddPanel, and SessionSummary. There are no pathway,
concept, lesson, or prerequisite screens. Responsive CSS exists, including
640px rules, but desktop/mobile usability has not been visually verified here.

`services/supabase.ts` wraps table queries; screens also issue Supabase calls
directly. `sync.ts` downloads decks/cards and fetches cards with a local fallback.
There is no code runner, API for grading, or built-in AI generation service.
The AI workflow is copy context/prompt into an external AI, then bulk import.

### Data model and authentication

The client expects:

- Project: id, name, description, created_at, optional user_id.
- Deck: id, project_id, name, description, created_at.
- Card: id, deck_id, question, answer, interval, ease_factor, repetitions,
  next_review, optional image_url, is_code, card_type, distractors.
- Tags and card_tags: helper APIs exist; the inspected screens do not expose
  a concept hierarchy through tags.
- Review history: id, card_id, rating, created_at, according to the supplied SQL.
- SessionCardResult and SessionResult: correctness, attempts, mode, XP, streaks;
  these live in React state and are not persisted as those records.

Dexie v2 stores projects, decks, and cards, but the download service only writes
decks/cards. There is no local review history or upload queue. The SQL file
creates only review_history, so the repository cannot recreate the full remote
schema, defaults, policies, and constraints. Existing remote schema is unverified.

Knowledge has no login flow, auth guard, or user-scoped queries. The optional
Project.user_id is unused. The supplied history policies permit public reads
and inserts. Policies for other tables are not recorded here. Birthday's
password gate is separate and does not authenticate Knowledge.

### Scheduling, confidence, and progress

StudySession selects due reviewed cards first, then shuffled unseen cards. If
neither exists, it crams all cards, sorting by shorter interval then lower ease.
The scheduling unit is always a card, not a topic or concept.

The existing scheduler is SM-2-like, with four ratings:

- Again resets repetitions and interval to zero, but next_review is tomorrow.
- Hard, Good, and Easy increment repetitions. First success uses one day,
  second uses six days, later successes multiply the old interval by old ease.
- Easy adds 0.15 to ease; Hard subtracts 0.15; minimum ease is 1.3. Good keeps ease.
- The new date uses `interval || 1` days. There is no intraday relearning step.
- Interactive correctness maps to Good on a first attempt, Hard on a subsequent
  correct attempt, and Again on failure. The UI does not collect a separate
  numeric confidence score. Classic cards use manual ratings.

Review history stores the rating and timestamp, not submitted answers, objective
correctness, hints, duration, question type, or elapsed retention interval.
Stats labels any rating other than Again as a successful review. This includes
Hard, although the session summary treats classic Hard as incorrect. Mature
means card interval greater than 21 days; it does not establish practical mastery.
Session XP, streak, accuracy, and per-card breakdown are transient.

### Exercise support and reliability gaps

All cards use question/answer strings. Fenced Markdown can contain Java,
TypeScript, or other code. Rendering code does not compile or execute it.
The four presentation modes are classic, multiple_choice, fill_blank, type_answer.
These are UI modes, not a model of recall, debugging, implementation, etc.

- Explicit classic is overridden by resolveMode: code cards alternate choice
  and blanks; other cards rotate choice, typed answer, and classic by position.
  Changing presentation does not create a new exercise testing the concept.
- Multiple choice takes the first line of answer as its correct option. Choices
  use authored distractors, sibling answers, or Java-oriented generic fallbacks.
  They need not be suitable for the actual question.
- FillBlankCard automatically removes a token from the answer and shows chips.
  It remains recognition practice and is Java-specific. The dynamic regex is
  not escaped, so punctuation in extracted tokens can break matching.
- TypeAnswerCard uses case-insensitive edit distance against the whole answer.
  This is unsuitable for code semantics and open-ended explanations, especially
  where the answer also includes a long explanation.
- The prompt and all four local packs use fill_in_the_blank, whereas the app
  expects fill_blank. Bulk import passes this through without validation; these
  cards can resolve to an unsupported mode with no exercise rendered.
- Four local Java packs contain 20 cards each (80 total), covering variables,
  control flow, arrays, and strings. Their import into the live DB is unverified.
  The generation prompt's topic-count matrix disagrees with the local packs.
- Classic rating labels advertise <10m/1d/3d/5d; actual intervals differ.
- Prev permits already reviewed cards to be graded again. Session history/XP
  can double count; card state in the session is not updated after a write.
- There is no submission lock or idempotent review ID. Remote result errors
  are ignored; schedule and history writes are separate, so they can diverge.
- Offline reviews update only existing cached cards; history is not retained
  or queued. Online reviews do not upsert uncached cards. A later download may
  overwrite local progress. Project/deck metadata screens still fetch remotely.
- Quick Add reports success and clears input without checking Supabase's error.

## B. Gap analysis

| Requirement | Status | Evidence / work needed |
| --- | --- | --- |
| Personal mini-app hub | Already supported | Separate Hub, Birthday, Knowledge apps. |
| Desktop/mobile website | Partially supported | Responsive CSS; interaction and overflow QA still needed. |
| Projects, decks, cards | Already supported | Remote CRUD and local deck download. |
| Java/React/TypeScript pathways, topic buttons | Missing | Ordered curriculum and pathway/topic practice routes. |
| Atomic concepts, prerequisites | Requires architectural change | Add stable concept identities and ordered curriculum metadata. |
| Concept scheduling with varied exercises | Requires architectural change | Concept schedule plus linked exercises; keep old card scheduling. |
| Several presentation modes | Already supported | Four modes, with import/routing defects. |
| Recall before answer reveal | Partially supported | Typed input/classic reveal; choices and chips dominate. |
| Code-from-memory, debugging, prediction, refactoring, implementation, edge cases, trade-offs | Partially supported | Can author prompts as Markdown; missing semantic type, submission/rubric and grading support. |
| Code in cards | Already supported | Markdown and syntax highlighting; no runner. |
| Difficulty and language/version | Missing | Add explicit content metadata. |
| Review history and confidence | Partially supported | Four ratings/timestamps; no rich evidence or separate confidence. |
| Concept mastery and weak states | Requires architectural change | Evidence rules across days, modalities, and delayed reviews. |
| Last practised, topic/pathway progress | Missing | Derive from concept review history and aggregate. |
| Due count, activity, maturity, session accuracy | Already supported | Existing displays, with metric/reliability limits above. |
| First-attempt accuracy, hints, duration, 7/30-day retention | Partially supported | First-attempt summary is transient; durable evidence missing. |
| AI material generation | Partially supported | External prompt/export/import only. |
| Deterministic grading | Partially supported | String/choice checks; missing compiler/tests and rubric-based review. |
| Daily focused learning flow | Partially supported | Deck sessions; no cross-topic due queue or new-concept budget. |
| Offline learning | Partially supported | Card cache exists; review outbox and metadata fallback missing. |
| Authentication/private progress | Missing | No Knowledge auth; deployed policies need inspection. |
| Certification readiness | Missing | Versioned coverage, named exam objectives, unseen assessments needed. |

## C. Recommended minimum-change design

Keep the mini-app shell, existing project/deck organization, Supabase, Dexie,
Markdown renderer, CSS, and session UI. Extract scheduling into a pure function,
fix its integration, then reuse it for concept progress rather than replacing
the algorithm immediately. Existing unlinked cards retain their card schedule.

For the pilot, put a versioned curriculum manifest in source control:
Pathway -> Topics -> Concept IDs. This makes Java/React/TypeScript topic buttons
possible without new authoring screens or three new curriculum tables. Store
concepts in the database so cards and review history have stable foreign keys.
Each card remains an exercise within a deck and optionally links to one concept.
Changing exercise wording then preserves the concept's learning history.

Use concept_progress for concept-level schedule fields and select a suitable,
less-recently-seen exercise when that concept is due. Selection should cover
required exercise types, avoid immediate repeats, and distinguish delayed
review from extra practice. Do not derive mastery from the most mature sibling
card or let the automatic cram fallback award delayed-retention credit.

The pathway view shows clickable topic buttons with mastery progress, concepts
mastered/total, due count, weak count, and last practised. Selecting a topic opens
its concepts and a Practice action; Java/React due reviews can also be combined.
Keep lessons and new learning accessible even when nothing is due.

## D. Proposed question/content model

| Entity | Minimal proposed fields / role |
| --- | --- |
| Curriculum manifest | Version, pathway ID, language/runtime target, ordered topics and concept IDs; prerequisites by stable concept ID. |
| Concept | id, stable slug, title, learning objective, concise lesson, source references. |
| Card / Exercise | Existing card fields plus nullable concept_id, question_type, difficulty, language/version, expected_answer, explanation, optional accepted_answers, starter_code, rubric/test reference. Keep answer for backward compatibility. |
| QuestionType | recall, code, debugging, prediction, multiple_choice, refactoring, implementation, edge_case, trade_off. Separate this from card_type/presentation. |
| Prerequisites | Concept ID list in the initial manifest; recommendations initially, avoiding unnecessary hard locks. |
| ConceptProgress | concept_id, learner identity, existing interval/ease/repetitions/next_review fields. Derive mastery and last practised from history initially rather than keeping duplicate authoritative values. |
| ReviewHistory | Extend existing table with unique client review ID, nullable concept_id, session ID, question type/exercise version snapshot, submitted answer, correct/first_attempt, rating, hints/AI-assisted flag, duration, grading method, scheduled/practice status, prior/actual review gap. Keep card_id nullable when an exercise is removed so concept evidence survives. |

Use explicit validation and defaults for new content. Split the short expected
answer from explanation. Use authored distractors and blanks. Respect explicit
classic mode. Open-ended/code tasks get a multiline submission before the
rubric is revealed; mark self-assessment separately from verified grading.
Do not fuzzy-match Java/TypeScript programs. Add isolated compiler/test grading
later; never execute arbitrary Java code inside the existing static web host.

Mastery rules are a proposal to validate, not a scientifically calibrated score:

- Unseen: no qualifying attempt; Learning: attempted without stable recall.
- Recall: unassisted success on multiple separate days.
- Applied: Recall plus successful code-from-memory and debugging/prediction.
- Mastered: Applied plus explanation/trade-off and edge-case coverage, and
  successful delayed reviews (initial targets: 7 and 30 days). Include unseen
  variants so fixed wording cannot satisfy all the requirements.
- Weak: recent failures or a failed delayed check; show overdue separately
  rather than equating an overdue date with demonstrated failure.

Only qualifying, unassisted first attempts count toward mastery. Repeated
practice on the same day cannot substitute for delayed evidence. Missing
exercise categories or thin content coverage cap the attainable mastery stage.
Show the evidence and remaining requirements, including whether it was
self-assessed or verified. The rules should be versioned and easy to adjust.

Topic mastery percentage should aggregate defined concept stages over the full
topic denominator, including unseen concepts. Show curriculum coverage and
retention separately. A full pathway score represents mastery of its specified
version and scope. Exam readiness additionally needs a named exam/syllabus,
objective mapping, and unseen timed assessments; it must not promise a pass
from completing flashcards. The user's react.gg reference suggests a useful
combination of explanations and applied challenges: https://react.gg/ .

Before relying on private personal progress, inspect live Supabase policies,
choose Supabase Auth ownership, and document migration/backfill of current
data. New progress/review records should be scoped to the learner; do not
retroactively treat rating-only historical rows as strong mastery evidence.

## E. Staged implementation order

1. Make the existing flow trustworthy: reproduce import/mode defects, normalize
   legacy modes, respect explicit types, separate answer from explanation,
   prevent duplicate grading, use real interval previews, handle save errors,
   and document complete migrations. Inspect ownership/policies. Verify these
   critical behaviors with focused scheduling/import/persistence checks.
2. Build one end-to-end pathway slice: Java -> Collections -> HashMap equality
   contract. Add a small manifest, concepts, optional card linkage, richer
   history, concept scheduling, and topic/concept practice navigation. Keep
   old decks/cards working. Add durable local reviews/outbox if offline is
   enabled; otherwise surface the limitation explicitly during this milestone.
3. Populate 5-8 concepts with 3-5 reviewed, varied exercises each: recall,
   code-from-memory, debugging/prediction, and realistic edge cases. Use
   submission plus rubric for open-ended tasks first. Show mastery requirements,
   last practised, due date, and evidence from stored reviews.
4. Verify first use, incorrect answers, repeated same-day practice, changing
   exercises, refresh/restart, save failures, simulated 7/30-day review gaps,
   and desktop/mobile interaction. Validate real retention over actual daily
   use before claiming the mastery rules are effective.
5. Expand the same flow to React Effects and TypeScript narrowing/generics.
   Add prerequisites/coverage progressively, then deterministic code grading,
   exam mapping, richer analytics, and optional AI variations after attempts.

The first deliverable is a trustworthy small topic: select topic -> learn a
concept -> attempt a varied exercise -> save evidence -> return when due ->
see honest mastery progress. A complete curriculum comes after that flow works.

## User-directed teaching progression — 2026-10-04

Implemented locally: nullable learning_order metadata is consumed by concept
loaders, new topic-practice questions and new Study today questions. Control
flow SQL adds positions/default-label changes and thirty introductory cards.
No live import or browser verification is claimed. Due reviews/pending saves
retain priority; schedules and history are untouched. This is teaching order,
not mastery gating. MC remains the authorized authored card mode, with varied
task forms; independent coding evidence remains outside the current workflow.
Future authoring must start with syntax and ordinary worked examples and then
build practical reasoning and restrictions. See JAVA_CURRICULUM_AUTHORING.md.
