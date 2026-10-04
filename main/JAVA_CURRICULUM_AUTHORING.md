# Java curriculum authoring handoff

Updated 2026-10-04. Read this for every Java content-authoring session, alongside
`PROJECT_TRACKER.md`. This is the durable authoring contract and progress ledger;
it does not replace the project tracker or describe verified live database data.

## User goal and priority

The app is usable enough for the user to start learning and provide feedback.
Prioritize filling the Java project deeply, one topic and importable batch at a
time. Defer new UX/mastery features unless a defect blocks content use.

Target **Java 27**, excluding preview/incubator features unless requested.
Use multiple choice throughout: one correct answer and three convincing,
comparable alternatives. Do not introduce typed short-answer cards. Code
prediction, debugging, design decisions and practical scenarios can all be MC.

Structure: Java project → ordered topic decks → atomic concepts → questions.
Aim for expert-oriented coverage of each defined topic, not a vocabulary quiz.
Neither a fixed card count nor perfect recall of familiar choices proves
professional expertise or certification readiness. Include unseen variations,
delayed practice and application reasoning; do not promise exam success without
an identified exam syllabus and a separate coverage audit.

## Read these implementation references

Paths here are relative to `main/` (npm commands run there).

- `src/apps/knowledge/curricula/pathways.ts`: authoritative topic order, keys,
  names and aliases. The outline is source-configured; learning data is in Supabase.
- `supabase/seeds/JAVA_FOUNDATIONS.md`: existing seed behavior and user instructions.
- `cards/pathways/java_foundations_1_2.json`: existing structured source pack.
- `scripts/build-java-foundations-seed.mjs`: actual SQL generator and UUID rules.
- `scripts/verify-java-foundations.mjs`: executable snippet checks.
- `supabase/migrations/20261004_concept_tracking.sql` and
  `supabase/CONCEPT_TRACKING.md`: installed concept/history schema and setup.
- `src/apps/knowledge/services/cardImport.ts` and
  `src/apps/knowledge/services/multipleChoice.ts`: inspect current import/choice
  semantics before authoring if these paths or behavior have changed.

Inspect actual files, not older generic generation prompts. The 80 older flat
JSON cards and four Collections pilot cards are not evidence of complete coverage.
The structured pathway seed pack is **not** flat Bulk Add JSON.

## Topic ledger

Local authoring status only. Imported/live counts have not been inspected.
The user applied and accepted the concept migration; content-seed execution has
not been reported. Do not treat an authored SQL file as an applied batch.

| Order | Topic key | Deck title | Local coverage status |
| --- | --- | --- | --- |
| 1 | types | Types, variables and operators | Depth batches 1/2 supplied: 9 concepts / 96 cumulative cards; incomplete; import/practice pending |
| 2 | control-flow | Control flow | Active: depth batch 2 supplied, 9 concepts / 104 cumulative cards; incomplete; import/practice pending |
| 3 | methods | Methods and scope | Not authored in this pathway seed workflow |
| 4 | arrays | Arrays | Not authored in this workflow; legacy pack exists |
| 5 | strings | Strings and text | Not authored in this workflow; legacy pack exists |
| 6 | objects | Classes and interfaces | Not authored in this pathway seed workflow |
| 7 | exceptions | Exceptions | Not authored in this pathway seed workflow |
| 8 | generics | Generics | Not authored in this pathway seed workflow |
| 9 | collections | Collections | Four-card pilot only; full coverage outstanding |
| 10 | lambdas | Lambdas and functional interfaces | Not authored in this pathway seed workflow |
| 11 | streams | Streams | Not authored in this pathway seed workflow |
| 12 | date-time | Date and time | Not authored in this pathway seed workflow |
| 13 | io | I/O and resource management | Not authored in this pathway seed workflow |
| 14 | concurrency | Concurrency | Not authored in this pathway seed workflow |
| 15 | jvm | JVM and memory | Not authored in this pathway seed workflow |

Maintain a per-topic coverage file under `cards/pathways/coverage/` when starting
that topic. Record concept keys, objectives, relevant subrules/edge cases, source
sections, card keys, verification status and remaining gaps. Record each batch's
JSON/SQL paths, ID namespace, new-card count, cumulative authored count, and
separate states: authored, validated, SQL supplied, user import reported,
user practice accepted. Never invent completion or acceptance.

The current 15 topics are an outline, not a complete Java specification syllabus.
Audit missing areas such as enums, records, sealed types, pattern matching,
modules, annotations, reflection, modern concurrency and relevant newer APIs.
Place them in suitable existing topics where coherent; record unmapped areas
and propose an outline extension instead of silently dropping them or changing
the pathway UI during content work.

### Topic 1 depth batch 1 — supplied 2026-10-04

Audit: [cards/pathways/coverage/java_types.md](cards/pathways/coverage/java_types.md).
Source: `cards/pathways/java_types_depth_1.json`; runnable SQL:
`supabase/seeds/java_types_depth_1.sql`; instructions:
`supabase/seeds/JAVA_TYPES_DEPTH_1.md`. Adds 32 MC cards, reuses eight concepts,
adds `bits-shifts`; cumulative Topic 1 = 9 concepts / 56 cards. With both starter
topics: 17 concepts / 80 cards. Same `java-foundations-v1` identities; originals
unchanged. Authored, baseline validated and SQL supplied; user import/practice
pending. Stop here for feedback. Next unfinished work remains Topic 1.

Generate with `npm run seed:java:types-depth`. Verify using
`npm run verify:java:types-depth` (JDK 27), or explicit
`-- --baseline-release=21` for the documented older-JDK check. All 32 new and
48 original snippets passed JDK 25.0.2 / --release 21; 38 Knowledge tests passed.
No Java 27 execution or PostgreSQL/Supabase seed execution was performed.

### Topic 1 depth batch 2 — supplied 2026-10-04

User authorized further content toward hundreds of detailed Foundations questions.
`cards/pathways/java_types_depth_2.json` adds 40 MC questions against explicit
conversion/evaluation/assignment gaps, reusing six concepts. SQL:
`supabase/seeds/java_types_depth_2.sql`; instructions:
`supabase/seeds/JAVA_TYPES_DEPTH_2.md`. Cumulative Topic 1 = 9 concepts / 96
questions; all structured Foundations packs = 17 concepts / 120 questions.
No new concepts if earlier packs are present. Same `java-foundations-v1` identity
namespace; earlier source packs and SQL remain unchanged. Authored, baseline
validated and SQL supplied; all import/practice states still unreported.

Generate with `npm run seed:java:types-depth-2`; verify with
`npm run verify:java:types-depth-2` (JDK 27), or explicit
`-- --baseline-release=21` for the documented baseline. All 40 new snippets
passed JDK 25.0.2 / --release 21; 41 Knowledge tests passed. No Java 27 execution
or PostgreSQL/Supabase seed execution. The existing Types generator now accepts
explicit pack/output arguments; alternate packs cannot implicitly replace the
previous SQL. Per-card `coverage_gap` notes record why each new scenario is needed.

Next: Topic 1 depth 3 literal/var/character/numeric/bitmask boundaries and practical
repair questions, followed by residual audit and Control flow. The preceding
40-question conversion/evaluation batch in the plan is now supplied, not yet
reported imported. Do not mistake 120 authored cards for full Foundations coverage.

### Topic 2 Control flow depth batch 1 — supplied 2026-10-04

`cards/pathways/java_control_flow_depth_1.json` adds 40 MC questions across all
8 existing concepts. Runnable SQL: `supabase/seeds/java_control_flow_depth_1.sql`;
user instructions: `supabase/seeds/JAVA_CONTROL_FLOW_DEPTH_1.md`. Starter + batch
= 8 concepts / 64 Control flow questions; all structured Foundations packs
= 17 concepts / 160 questions (Types stays 9/96). Same `java-foundations-v1`
namespace and keys; existing JSON/SQL and learning records remain preserved.
Source metadata records each question's coverage gap. Authored, baseline
validated and SQL supplied; user import/practice still unreported.

Reproduce with `npm run seed:java:control-flow`, focused validation with
`npm run test:java:control-flow`, and execution with
`npm run verify:java:control-flow` (JDK 27) or explicitly
`-- --baseline-release=21`. All 40 new snippets passed JDK 25.0.2 / --release 21;
three focused tests passed. Full app suite and older snippets were not rerun.
SQL remains unexecuted against PostgreSQL/Supabase; Java 27 execution unverified.

Next Control flow gaps: reference patterns/guards/dominance, statement/expression
contrasts, enhanced-for behavior, deeper loop/switch boundaries and repair choices.
The updated topic coverage ledger distinguishes the initial audit from remaining
scope after this batch. Neither 64 topic cards nor 160 Foundations cards completes
coverage or establishes learner mastery.

## Foundations completion plan — user direction 2026-10-04

Cover the five source-configured Foundations topics in order: Types, variables
and operators; Control flow; Methods and scope; Arrays; Strings and text.
Continue filling audited gaps without duplicating existing questions. The user
requested a small plan before further authoring; this planning update does not
add content or establish import/practice acceptance for supplied batches.

Next planned batches (25–40 new MC questions each; adjust allocation after audit):

1. Topic 1 depth 2: assignment versus invocation conversions, unary/mixed numeric
   promotion, precedence versus evaluation order, abrupt expression evaluation,
   conditional typing, and definite-assignment paths.
2. Topic 1 depth 3: remaining literal/var restrictions, numeric boundary/API
   decisions, UTF-16 char behavior and remaining bitmask/shift cases.
3. Re-audit Topic 1; fill residual gaps with distinct practical debugging/repair
   scenarios. Then audit/deepen Control flow rather than treating its 24 starter
   cards as complete. Repeat audit → batch → validation for Methods, Arrays, Strings.
4. Finish with mixed Foundations scenarios and previously unseen assessment
   variants, followed by delayed practice and targeted fixes from learner feedback.

Maintain rule/scenario inventory per topic. Before adding a card, compare all
pathway packs and relevant legacy/pilot packs for exact and semantic duplicates.
A repeated rule needs a different boundary, failure mode or application decision;
changing names/numbers alone does not justify a new question. Track why a new
variant is needed. Every batch retains JSON/SQL delivery, official Java 27 sources,
no previews, preservation protections and explicit execution limitations.

Coverage completion requires every in-scope rule reviewed, ordinary/boundary
contrasts and practical reasoning represented, known content defects resolved,
and remaining exclusions explicit. No fixed question quota establishes coverage.
Learner mastery requires reliable first-attempt reasoning on unfamiliar examples
across separate days plus independent application in Java. MC completion alone
cannot verify coding fluency; these are learning criteria, not an implemented
mastery score or a guarantee of expertise. Import/practice state remains separate.

## Active topic and faster validation — user direction 2026-10-04

The user requested moving to **Topic 2: Control flow** next and keeping content
work moving quickly. Depth batch 2 is now supplied (9 concepts / 104 cards). Topic 1 remains at 96 authored questions with documented
remaining gaps; moving on does not mark it complete. Active audit:
`cards/pathways/coverage/java_control_flow.md`. The first depth batch supplied 40 new MC
questions in branches, practical loop boundaries, transfer semantics, switch
edge cases and reachability. Depth batch 2 adds reference patterns/guards, enhanced-for behavior, switch
result typing and further scope/transfer constraints. Residual repair cases and
advanced final pattern rules remain; keep preview features excluded. Import/practice states remain
unreported. The audit and supplied JSON/SQL paths are recorded above.

Use proportionate verification: check every new batch for duplicate keys and
scenarios, four usable options, answer/feedback format and sources; compile/run
new executable snippets with explicit target/baseline disclosure. Avoid rerunning
older snippets or the full app regression suite for unchanged content tooling.
Run focused relevant tests when generators/verifiers/import behavior change,
and the broader suite when shared changes or failures justify it. No routine
production build/lint for content-only additions. SQL still needs static
preservation/count checks, with execution limitations clearly disclosed.

## Depth and question quality

1. Inventory the topic before authoring: atomic concepts, prerequisites,
   guaranteed language/API behavior, common mistakes, boundary cases and
   practical decisions. Compare existing cards against that inventory.
2. Cover fundamentals, contrasting cases, edge cases, compiler/runtime
   distinctions, debugging, API contracts and trade-offs where relevant. Mark
   genuinely irrelevant categories N/A. Avoid padding with reworded duplicates.
3. Use several independent scenarios for each important rule. A typical topic
   might need 80–200+ questions, but coverage determines the count. Three cards
   per broad concept is a starting point, not a completion rule.
4. Deliver roughly 25–40 carefully checked new cards per batch, or fewer when
   complexity warrants it. Keep remaining gaps explicit. A topic is ready only
   when its inventory is covered and all authored items have been reviewed.
5. Each card has exactly one defensible answer. State version, imports, enclosing
   context and assumptions when they affect the result. Avoid unspecified
   iteration order, scheduling, GC timing or implementation-dependent outcomes
   unless that uncertainty itself is the correct answer.
6. Distractors represent specific plausible misconceptions. Match the correct
   option's style and specificity; avoid length clues, joke options, overlapping
   answers and “all/none of the above.” Explain the rule and why each alternative
   fails. Put explanations after the answer, not in the selectable answer text.
7. Include Markdown code fences, readable formatting, and a precise official
   source link per question. Browse Java 27 JLS/JVMS, API documentation and
   OpenJDK release/JEP sources. Verify final versus preview status; don't rely
   on memory or silently substitute Java 21/25 behavior.
8. Verify executable examples against JDK 27 when available. Record exact
   compiler/runtime and flags. Existing 48 snippets passed a Java 21 baseline
   on local JDK 25.0.2, with Java 27 source review; this is **not** Java 27 runtime
   verification. Report that distinction if the same limitation remains.

## Source format and SQL contract

Use committed structured JSON as the source of truth and generated `.sql` files
under `supabase/seeds/` as the user's runnable artifacts. Extend tooling only as
needed for content generation/validation; don't rewrite the app.

The existing pack uses root `id`, `version`, `java_release`, `preview_features`,
and `topics`. A topic has `key`, `title`, `aliases`, `objective`, `concepts`.
A concept has `key`, `title`, `objective`, `cards`. A card has stable `key`,
`question`, `correct_option`, exactly three `distractors`, `explanation`,
official `source`, `card_type: "multiple_choice"`, and `is_code`.
Executable cards also carry verification metadata; inspect the verifier's
supported format before extending it. Conceptual cards need not be executable.

The current generator is specific to foundations 1/2: fixed input/output paths,
namespace, summary aliases and `is_code: true`. Adapt or generalize those details
deliberately for new packs. Merely changing the pack's `id` does not change its
generated UUID namespace. Preserve existing identity formulas when expanding
the starter topics:

```text
topic UUID   = md5(project UUID + ':java-foundations-v1:topic:' + topic key)
concept UUID = md5(deck UUID + ':java-foundations-v1:concept:' + concept key)
card UUID    = md5(project UUID + ':java-foundations-v1:card:' + topic key
                  + ':' + concept key + ':' + card key)
```

These hashes are cast to UUID by SQL. Existing keys and namespaces must remain
stable across batches. New question keys must be unique; new topic namespaces
must be documented and reused. Do not give existing concepts a new namespace
just to publish another batch. Reuse existing decks by project-scoped title/
aliases, and concepts by stable ID or unambiguous deck-scoped title. Stop with a
clear error on ambiguous matches. Preserve user-renamed/reassigned content;
don't recreate empty concept copies or silently move cards.

SQL must:

- Run as a complete transaction in Supabase SQL Editor, using the existing
  generator's project selection and ambiguity protection as a reference.
  Keep an explicit optional project UUID override and consistent setup lock.
- Insert into existing `projects`, `decks`, `concepts`, `cards`; do not change
  access policies, delete content, or rerun the installed concept migration.
- Link each card to its topic deck and concept. `concepts` requires `id`,
  `deck_id`, `title`, `objective`; existing created_at defaults are assumed.
- Set `cards.answer` to correct option + two actual newlines + explanation +
  two newlines + source link. The app uses the first paragraph as the choice.
- Store `cards.distractors` as PostgreSQL **text[]**, not a JSONB array; use
  `card_type='multiple_choice'` and correct `is_code` per card.
- Initialize only new cards' scheduling (`interval=0`, `ease_factor=2.5`,
  `repetitions=0`, `next_review=now()`). Use stable IDs with
  `ON CONFLICT (id) DO NOTHING`; preserve edits, links, schedules and history.
- Qualify columns and prefix SQL variables, e.g. `v_project_id`, to avoid
  ambiguous identifiers. Reject payload collisions with SQL dollar delimiters.
- Include an accurate read-only summary and expected fresh-import counts.
  Distinguish cumulative counts from newly added cards on repeat runs.

Re-running additive SQL does not fix an already imported wrong answer because
conflicts are skipped. If correction is needed, supply a separate narrowly
scoped content-only patch, preserving identity and all scheduling/history;
check the expected prior content and report conflicts instead of overwriting
user edits. Never solve a correction by deleting/recreating the project.

The project/deck/card schema is inferred from the working client, not verified
against the live database. Inspect current schema references before producing
SQL and state any assumptions. **Do not connect to Supabase or read credentials.**
The user runs SQL and reports results; do not claim live execution/testing.

## Iterative session workflow

1. Read the ledger and latest user feedback. Default to topic 1 expansion first,
   then topic 2, then the remaining ordered topics. A requested topic overrides
   that order. “Next” means next batch of the active topic until coverage is done.
2. Audit coverage, then author and validate the next batch in the same turn.
   Do not stop at a plan when the user has requested content delivery.
3. Save JSON, generated SQL and topic coverage notes. Check option uniqueness,
   answer/feedback formatting, stable IDs, citations and executable examples.
   Run relevant existing checks if generation/validation tooling changes.
4. Update this ledger and PROJECT_TRACKER.md. Provide the SQL file link, new
   concepts/cards count, remaining gaps, checks actually performed, and concise
   Supabase import/application practice steps.
5. Wait for user import/practice feedback before another batch. Fix reported
   mistakes first. Keep authoring completion separate from applied/accepted state.

## Prompt for a fresh session in this repository

```text
We are filling the Java learning pathway in Anne, not adding UX features.
Work in /Users/alanjaison/Documents/2026/workspace/anne.
Read AGENTS.md, main/PROJECT_TRACKER.md and
main/JAVA_CURRICULUM_AUTHORING.md, then inspect the referenced seed/schema files
and any per-topic coverage ledger.

Continue the next unfinished Java topic/batch from the ledger. If no deeper
batch has been started, begin by expanding Topic 1: Types, variables and
operators, rather than treating its 24 starter questions as complete.

Target Java 27 without preview features. Build deep, expert-oriented concept
coverage using only multiple-choice questions with three convincing distractors,
clear explanations of every option, practical scenarios and precise official
sources. Preserve existing IDs, content edits, review history and schedules.

Audit existing coverage, then produce the next roughly 25–40 new questions,
their structured JSON, and safe repeatable SQL for me to run in Supabase.
Follow the authoring brief's exact schema, answer format and stable UUID rules;
adapt the starter generator where necessary. Do not connect to Supabase.
Validate the content and code examples, stating any Java 27 verification limits.
Update the coverage ledger and tracker, and give me the SQL file and expected
counts. Stop after this batch so I can import it, practise and give feedback.
```

A normal ChatGPT conversation cannot read this workspace automatically. For
that workflow, attach this brief plus the current source pack, generator,
pathway manifest and concept migration; include the active topic's coverage
ledger. A new Codex session in this repository can read them directly.

### Topic 2 Control flow depth batch 2 — supplied 2026-10-04

`cards/pathways/java_control_flow_depth_2.json`: 40 MC questions across eight
existing concepts plus new `reference-patterns` (12 cards). SQL:
`supabase/seeds/java_control_flow_depth_2.sql`; instructions:
`supabase/seeds/JAVA_CONTROL_FLOW_DEPTH_2.md`. Expected after all earlier packs:
Control flow = 9 concepts / 104 cards; Foundations = 18 concepts / 200 cards.
Types stays 9/96. Existing identities/edits/schedules/history are preserved by
insert-only SQL; known-parent recovery includes starter and depth-1 keys.
No prior packs were changed. Shared generator now supports explicit reviewed
pack/output paths with overwrite guards; earlier SQL remains byte-identical.

Coverage: final reference patterns, guards/dominance/null coverage, enhanced-for
value/reference behavior, switch label compatibility, statement/expression
contrasts, standalone/target numeric typing, pattern flow scope, transfer
boundaries and do definite assignment. Ledger records every new key and source
and residual gaps, including repair choices and enhanced statement/pattern rules.

All 40 snippets passed JDK 25.0.2 --release 21, no previews. Six focused tests
across both Control flow packs passed. No full app or older snippet suite rerun.
Official Java 27 JLS reviewed; Java 27 execution and PostgreSQL/Supabase execution
remain unverified. User import/practice feedback pending; no live connection.
Next: residual Control flow audit/batch, then Methods and scope. No topic is
complete and 200 cards do not establish mastery or exam readiness.
