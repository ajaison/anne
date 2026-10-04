# Topic 2 coverage audit: Control flow

Updated 2026-10-04. Active next topic at the user's request. **Incomplete**.
Starter + depth batches 1/2 + progression 1: 9 concepts / 134 authored MC questions.
Depth batch 2 adds forty questions and one reference-pattern concept; baseline
validated with SQL supplied.
User reports adding many cards/concepts; exact per-pack counts and practice
acceptance remain uninspected. Previous depth-2 JSON import failure was reported.

## Starter inventory and initial gaps (audit before depth batch 1)

| Stable concept | Objective | Existing keys | Remaining rules/scenarios |
| --- | --- | --- | --- |
| `branching` | Require boolean conditions, detect unboxing in branches and understand which if owns an else. | `nonboolean-condition`, `dangling-else`, `boxed-condition` | Else-if priority versus independent if statements; guard clauses; safe nullable Boolean decisions; nested branches with braces. Do not repeat existing dangling-else/null-unboxing examples or Topic 1 Boolean-assignment questions. |
| `for-boundaries` | Count iterations accurately and distinguish a loop body from a trailing empty statement. | `exclusive-bound`, `inclusive-bound`, `empty-body` | Empty/single-item input traversal; safe last-index conditions; non-unit/reverse steps; multiple initializer/update expressions; omitted clauses with terminating break. Distinct practical failure cases, not another renamed summation. |
| `while-do` | Distinguish pre-tested/post-tested loops and include side effects from the final failed test. | `while-zero`, `do-once`, `failed-test-side-effect` | Continue reaching the do-while condition; bounded retry/sentinel scans; short-circuit tests with state changes; progress guarantees and termination bugs. Do not repeat zero-versus-one iteration or postfix final-test examples. |
| `break-continue` | Distinguish exiting a loop from skipping its current body and understand for updates after continue. | `continue-sum`, `break-sum`, `continue-update` | Break from a switch inside a loop; continue targeting its loop through a switch; update skipped after break versus executed after continue; safe loop repairs. Exception/finally interactions → Exceptions unless a later cross-topic assessment needs them. |
| `nested-labels` | Identify the loop targeted by unlabeled/labeled break and continue without skipping or inventing iterations. | `break-outer`, `break-inner`, `continue-outer` | Labeled break from an ordinary block; invalid continue label targets; nested for/while target-specific updates and tests. Avoid repeating starter or legacy outer-break/outer-continue trace patterns. |
| `switch-classic` | Trace colon-style case groups, missing matches and null selectors. | `switch-fallthrough`, `switch-no-match`, `switch-null` | Default in the middle; shared labels; selector evaluated once; duplicate/nonconstant labels; String matching by content; boxed selector behavior. No repeated basic fall-through/no-match/null-without-handler examples. |
| `switch-expression` | Predict non-falling-through arrow rules and return values from exhaustive switch expressions. | `arrow-no-fallthrough`, `block-yield`, `exhaustive-expression` | Explicit null cases; grouped labels; yield and throwing alternatives; missing value-producing branch; enum-based exhaustiveness; statement versus expression requirements. Later: final reference patterns, guards and dominance; exclude preview primitive selector/pattern expansions. |
| `scope-reachability` | Respect for-variable scope and distinguish Java reachability rules for while and if. | `for-scope`, `while-false-unreachable`, `if-false-reachable` | After return/break/continue; constant infinite loops with/without reachable break; case/block local scope; loop exit and definite assignment. Compare Topic 1 assignment questions and legacy scope cards before adding a scenario. |

## Depth batch 1 allocation — 40 supplied questions

| Area | New count | Purpose |
| --- | ---: | --- |
| Branching | 8 | Branch priority, guard decisions and nullable inputs |
| Loop boundaries and while/do behavior | 8 | Real traversal/retry conditions and boundary repairs |
| Break/continue and labels | 8 | Precise transfer target and update behavior |
| Colon switch | 6 | Default placement, labels and selector semantics |
| Switch expressions | 6 | Null handling, value-producing paths and exhaustiveness |
| Scope/reachability | 4 | Legal versus unreachable paths and scoped locals |

Actual allocation follows the forty-question plan. Loops split into five
for-loop and three while/do examples. Each scenario was checked against prior
structured and legacy content; no identical snippets or stable keys were added.
Reference patterns/guards/dominance and deeper loop/switch contrasts still need
later batches. Sixty-four questions do not automatically complete the topic.

## Source and identity references

Starter source: `cards/pathways/java_foundations_1_2.json`, topic `control-flow`.
Official section links are recorded in each starter card. Future questions need
reviewed Java 27 JLS chapter 14/15/16 sections; exclude previews. Stable namespace
remains `java-foundations-v1` with topic key `control-flow` and existing concept
keys. Do not rename those keys or move existing questions when adding variants.

Legacy audit inputs: `cards/02_control_flow_and_loops.json`, Topic 1 structured
packs, and the other legacy packs where scenarios overlap. Some legacy prompts
are version-qualified or underspecified; they are not evidence of Java 27 coverage.

## Validation and delivery policy

New content: structural/choice/duplicate/source checks, semantic review and
compilation/execution of new snippets. Report exact JDK/release flags; older
baseline execution does not verify Java 27. Skip repeated older snippet runs
and full app regression tests unless tooling/shared behavior changes or a
failure warrants them. Generator changes need relevant focused tests and SQL
preservation/count checks. No live Supabase connection.

## Batch ledger

| Batch | Cards | Status |
| --- | ---: | --- |
| Starter | 24 | Authored/baseline validated/SQL supplied previously; import/practice unreported |
| Depth 1 | 40 new / 64 cumulative | Authored, baseline validated, SQL supplied; import/practice pending |
| Depth 2 | 40 new / 104 cumulative | Authored, baseline validated, SQL supplied; import/practice pending |

Topic 1 remains incomplete at 96 authored cards. This topic switch reflects
user priority, not completion or demonstrated mastery.

## Supplied depth batch 1: gap-to-question mapping

JSON: `cards/pathways/java_control_flow_depth_1.json`.
SQL: `supabase/seeds/java_control_flow_depth_1.sql`.
Namespace: `java-foundations-v1`. Topic key `control-flow`; existing concept
keys remain unchanged. Topic UUID = md5(project UUID + namespace + topic key),
concept UUID = md5(actual deck UUID + namespace + concept key), card UUID =
md5(project UUID + namespace + topic/concept/card keys), using the exact colon
separators in the authoring contract. identity_card_keys holds starter pointers.

| Concept | New key | Gap filled | Official source |
| --- | --- | --- | --- |
| `branching` | `else-if-first-match` | Overlapping else-if thresholds depend on branch order. | [section](https://docs.oracle.com/javase/specs/jls/se27/html/jls-14.html#jls-14.9.2) |
| `branching` | `independent-if-both-run` | Independent if statements differ from exclusive else-if chains. | [section](https://docs.oracle.com/javase/specs/jls/se27/html/jls-14.html#jls-14.9.1) |
| `branching` | `else-if-skips-condition-effects` | A successful branch suppresses later else-if condition side effects. | [section](https://docs.oracle.com/javase/specs/jls/se27/html/jls-14.html#jls-14.9.2) |
| `branching` | `null-guard-early-return` | Early-return null guard prevents later dereference. | [section](https://docs.oracle.com/javase/specs/jls/se27/html/jls-14.html#jls-14.17) |
| `branching` | `nullable-boolean-safe-enable` | Null-safe Boolean decision instead of directly unboxing a nullable condition. | [section](https://docs.oracle.com/en/java/javase/27/docs/api/java.base/java/lang/Boolean.html#equals(java.lang.Object)) |
| `branching` | `ordered-null-and-empty-guard` | Practical guard order prevents nullable text dereference. | [section](https://docs.oracle.com/javase/specs/jls/se27/html/jls-15.html#jls-15.23) |
| `branching` | `braces-change-else-owner` | Explicit blocks alter branch grouping relative to dangling-else starter. | [section](https://docs.oracle.com/javase/specs/jls/se27/html/jls-14.html#jls-14.9.2) |
| `branching` | `guard-order-before-work` | Guard clauses suppress downstream work while leaving valid paths reachable. | [section](https://docs.oracle.com/javase/specs/jls/se27/html/jls-14.html#jls-14.17) |
| `for-boundaries` | `reverse-array-full-range` | Reverse traversal includes index zero and starts at length minus one. | [section](https://docs.oracle.com/javase/specs/jls/se27/html/jls-14.html#jls-14.14.1.2) |
| `for-boundaries` | `paired-index-meeting-stop` | Multiple indices update together and stop when an inward scan crosses. | [section](https://docs.oracle.com/javase/specs/jls/se27/html/jls-14.html#jls-14.14.1.2) |
| `for-boundaries` | `stride-odd-length` | Non-unit stride with an odd-sized input and a pre-access bound test. | [section](https://docs.oracle.com/javase/specs/jls/se27/html/jls-14.html#jls-14.14.1.2) |
| `for-boundaries` | `empty-input-inclusive-bound` | Inclusive traversal bound fails on empty input rather than skipping the body. | [section](https://docs.oracle.com/javase/specs/jls/se27/html/jls-14.html#jls-14.14.1.2) |
| `for-boundaries` | `omitted-for-condition-break` | Omitted for condition can be safely bounded by an explicit guard/break. | [section](https://docs.oracle.com/javase/specs/jls/se27/html/jls-14.html#jls-14.14.1.3) |
| `while-do` | `do-continue-runs-condition` | Continue in do-while transfers to its condition, including condition effects. | [section](https://docs.oracle.com/javase/specs/jls/se27/html/jls-14.html#jls-14.13.1) |
| `while-do` | `sentinel-and-bound-check` | Sentinel scanning combines boundary protection and stopping without consuming sentinel. | [section](https://docs.oracle.com/javase/specs/jls/se27/html/jls-14.html#jls-14.12) |
| `while-do` | `bounded-retry-short-circuit` | Retry body count differs from service test count at early success. | [section](https://docs.oracle.com/javase/specs/jls/se27/html/jls-14.html#jls-14.12) |
| `break-continue` | `switch-break-keeps-loop-running` | Unlabeled switch break does not exit its containing loop. | [section](https://docs.oracle.com/javase/specs/jls/se27/html/jls-14.html#jls-14.15) |
| `break-continue` | `switch-continue-targets-loop` | Continue inside switch targets the enclosing loop rather than the switch. | [section](https://docs.oracle.com/javase/specs/jls/se27/html/jls-14.html#jls-14.16) |
| `break-continue` | `break-skips-for-update` | Break suppresses the for update rather than merely skipping the body tail. | [section](https://docs.oracle.com/javase/specs/jls/se27/html/jls-14.html#jls-14.14.1.3) |
| `break-continue` | `do-break-skips-condition` | Do-loop break skips the trailing test; intentional contrast to continue. | [section](https://docs.oracle.com/javase/specs/jls/se27/html/jls-14.html#jls-14.13.1) |
| `nested-labels` | `break-labeled-block` | Labeled break can exit an ordinary block rather than only a loop. | [section](https://docs.oracle.com/javase/specs/jls/se27/html/jls-14.html#jls-14.15) |
| `nested-labels` | `continue-block-label-invalid` | Continue label target must be a loop even though break permits blocks. | [section](https://docs.oracle.com/javase/specs/jls/se27/html/jls-14.html#jls-14.16) |
| `nested-labels` | `inner-label-continue-update` | A labeled inner continue preserves that loop update and does not skip outer iterations. | [section](https://docs.oracle.com/javase/specs/jls/se27/html/jls-14.html#jls-14.16) |
| `nested-labels` | `label-out-of-scope` | Label availability depends on enclosing statement, not prior declaration order. | [section](https://docs.oracle.com/javase/specs/jls/se27/html/jls-14.html#jls-14.15) |
| `switch-classic` | `default-middle-falls-forward` | Middle default location determines forward fall-through for an unmatched selector. | [section](https://docs.oracle.com/javase/specs/jls/se27/html/jls-14.html#jls-14.11.3) |
| `switch-classic` | `shared-case-group` | Multiple colon labels can intentionally share one body. | [section](https://docs.oracle.com/javase/specs/jls/se27/html/jls-14.html#jls-14.11.1) |
| `switch-classic` | `selector-once-no-rematch` | Selector evaluation happens once; mutations do not rematch cases. | [section](https://docs.oracle.com/javase/specs/jls/se27/html/jls-14.html#jls-14.11.3) |
| `switch-classic` | `duplicate-folded-case-label` | Duplicate case detection uses evaluated constant values rather than spelling. | [section](https://docs.oracle.com/javase/specs/jls/se27/html/jls-14.html#jls-14.11.1) |
| `switch-classic` | `nonconstant-case-label` | Runtime locals cannot substitute for constant case labels. | [section](https://docs.oracle.com/javase/specs/jls/se27/html/jls-14.html#jls-14.11.1) |
| `switch-classic` | `string-case-content-matching` | String switch matching uses contents even for a non-interned selector. | [section](https://docs.oracle.com/javase/specs/jls/se27/html/jls-14.html#jls-14.11.1.2) |
| `switch-expression` | `explicit-null-switch-case` | Explicit null case changes behavior compared with starter null selector without handler. | [section](https://docs.oracle.com/javase/specs/jls/se27/html/jls-15.html#jls-15.28.2) |
| `switch-expression` | `grouped-arrow-labels` | Grouped arrow constants select one result once. | [section](https://docs.oracle.com/javase/specs/jls/se27/html/jls-15.html#jls-15.28.1) |
| `switch-expression` | `selected-throw-arm` | Switch expression arms may terminate by throwing instead of yielding. | [section](https://docs.oracle.com/javase/specs/jls/se27/html/jls-15.html#jls-15.28.2) |
| `switch-expression` | `block-missing-yield` | Exhaustive labels and value-producing rule blocks are separate requirements. | [section](https://docs.oracle.com/javase/specs/jls/se27/html/jls-15.html#jls-15.28.1) |
| `switch-expression` | `enum-exhaustive-without-default` | Complete enum constant coverage can make an expression exhaustive without default. | [section](https://docs.oracle.com/javase/specs/jls/se27/html/jls-15.html#jls-15.28.1) |
| `switch-expression` | `yield-exits-enclosing-expression` | Yield exits an enclosing switch expression through a nested loop. | [section](https://docs.oracle.com/javase/specs/jls/se27/html/jls-14.html#jls-14.21) |
| `scope-reachability` | `statement-after-unconditional-return` | Unconditional method return makes the following statement unreachable. | [section](https://docs.oracle.com/javase/specs/jls/se27/html/jls-14.html#jls-14.22) |
| `scope-reachability` | `infinite-while-no-exit-reachability` | Constant infinite loop without break makes later code unreachable. | [section](https://docs.oracle.com/javase/specs/jls/se27/html/jls-14.html#jls-14.22) |
| `scope-reachability` | `loop-break-definite-assignment` | Reachable break from while(true) proves both exit and local assignment. | [section](https://docs.oracle.com/javase/specs/jls/se27/html/jls-16.html#jls-16.2.10) |
| `scope-reachability` | `colon-case-shared-local-scope` | Colon case groups share local scope unless explicit blocks separate declarations. | [section](https://docs.oracle.com/javase/specs/jls/se27/html/jls-14.html#jls-14.11.1) |

## Historical remaining gaps after depth batch 1

| Concept | Authored cards | Remaining scope |
| --- | ---: | --- |
| `branching` | 11 | Combined validation/permission predicates, three-state nullable decisions and practical repair-choice scenarios; reference instanceof pattern guards with Control flow scope where suitable. |
| `for-boundaries` | 8 | Enhanced-for element copies versus referenced-object mutation; omitted/update ordering contrasts; overflow-sensitive termination; reverse/stride repair choices. Coordinate array details with Arrays. |
| `while-do` | 6 | Loop invariants/progress bugs, empty/single-item sentinel variants, short-circuit test effects under boundary exhaustion, repair choices; avoid unsafe nonterminating verifier examples. |
| `break-continue` | 7 | Continue in while requires explicit progress; multiple nested switch/loop transfers; mixed practical repairs. finally interactions belong mainly in Exceptions. |
| `nested-labels` | 7 | Outer for/while target-specific tests/updates; nearest target contrasts and label shadowing/duplicate rules with real distinct scenarios. |
| `switch-classic` | 9 | Default skipped on a matching later constant; boxed selector unboxing; constant narrowing labels; colon fall-through plus variable initialization; intentional break repairs. |
| `switch-expression` | 9 | Final reference type patterns, when guards, dominance, null/default combinations, statement versus expression rules, numeric result typing; sealed exhaustiveness coordinates with Objects. Exclude previews. |
| `scope-reachability` | 7 | Separate case blocks as repair; constant versus runtime loop conditions; legal/illegal transfers from switch expressions; loop break paths and definite assignment not already in Topic 1. |

## Depth batch 1 verification and delivery status

- 40/40 new snippets passed Homebrew javac/java 25.0.2, --release 21, no
  preview; exact output, compiler-error and runtime-exception checks.
- Three focused content/SQL tests passed. Full app regression tests and older
  snippet suites were not rerun; no shared app/verifier edits.
- Duplicate audit compared prior pathway packs, all four legacy packs and
  pilot concepts. Automated checks establish exact snippet/key uniqueness;
  manual semantic review distinguishes rule and scenario contrasts.
- Official Java 27 sources reviewed; Java 27 execution remains unverified.
- SQL generated/static checks only; no PostgreSQL/Supabase execution, live
  schema inspection, credentials or connection.
- Authored: yes. Baseline validated: yes. SQL supplied: yes.
  User import reported: pending. User practice accepted: pending.

Both structured topics now total 17 concepts / 160 authored cards: Types 9/96,
Control flow 8/64. Neither topic nor Foundations is declared complete.

[Import instructions and testing steps](../../../supabase/seeds/JAVA_CONTROL_FLOW_DEPTH_1.md).

## Supplied depth batch 2: gap-to-question mapping

JSON: `cards/pathways/java_control_flow_depth_2.json`.
SQL: `supabase/seeds/java_control_flow_depth_2.sql`.
Forty new questions; eight concepts reused and `reference-patterns` added.
Existing identities/titles/objectives remain stable. identity_card_keys includes
starter and depth-1 keys for renamed-parent recovery. No prior content edits.

| Concept | New key | Gap filled | Official source |
| --- | --- | --- | --- |
| `branching` | `pattern-and-binding-in-predicate` | Successful instanceof pattern binding is available to an AND predicate and true body. | [section](https://docs.oracle.com/javase/specs/jls/se27/html/jls-6.html#jls-6.3.1.1) |
| `branching` | `permission-parentheses-change-policy` | Permission predicates expose precedence versus explicitly grouped login requirement. | [section](https://docs.oracle.com/javase/specs/jls/se27/html/jls-15.html#jls-15.24) |
| `branching` | `three-state-boolean-retains-unknown` | Explicit first null branch preserves a third state instead of conflating missing with false. | [section](https://docs.oracle.com/javase/specs/jls/se27/html/jls-14.html#jls-14.9.2) |
| `for-boundaries` | `enhanced-primitive-copy-not-array-write` | Enhanced-for primitive iteration variable is a value copy, not a writable array element alias. | [section](https://docs.oracle.com/javase/specs/jls/se27/html/jls-14.html#jls-14.14.2) |
| `for-boundaries` | `enhanced-object-mutation-visible` | Reference-valued enhanced-for permits mutation of the referenced elements. | [section](https://docs.oracle.com/javase/specs/jls/se27/html/jls-14.html#jls-14.14.2) |
| `for-boundaries` | `enhanced-reference-reassignment-not-slot-write` | Reassigning enhanced-for reference does not replace its source array slot. | [section](https://docs.oracle.com/javase/specs/jls/se27/html/jls-14.html#jls-14.14.2) |
| `for-boundaries` | `enhanced-loop-hidden-unboxing` | Enhanced-for variable conversion can implicitly unbox a nullable element. | [section](https://docs.oracle.com/javase/specs/jls/se27/html/jls-14.html#jls-14.14.2) |
| `for-boundaries` | `enhanced-array-expression-once` | Enhanced-for array expression is evaluated once rather than per iteration/test. | [section](https://docs.oracle.com/javase/specs/jls/se27/html/jls-14.html#jls-14.14.2) |
| `for-boundaries` | `dependent-for-updates-left-to-right` | Dependent update expressions run left to right after the body. | [section](https://docs.oracle.com/javase/specs/jls/se27/html/jls-14.html#jls-14.14.1.2) |
| `while-do` | `continue-skips-required-progress` | While continue can bypass essential progress; bounded diagnostic safely exposes the repeated state. | [section](https://docs.oracle.com/javase/specs/jls/se27/html/jls-14.html#jls-14.12.1) |
| `while-do` | `runtime-false-loop-reachable-source` | Ordinary false-valued loop local differs from constant-false reachability rules. | [section](https://docs.oracle.com/javase/specs/jls/se27/html/jls-14.html#jls-14.22) |
| `while-do` | `do-body-establishes-local-assignment` | Guaranteed do-loop body can establish assignment before a later local read. | [section](https://docs.oracle.com/javase/specs/jls/se27/html/jls-16.html#jls-16.2.11) |
| `break-continue` | `outer-while-continue-skips-inner-for-update` | Outer while continue bypasses inner for update and includes the final outer test effect. | [section](https://docs.oracle.com/javase/specs/jls/se27/html/jls-14.html#jls-14.16) |
| `break-continue` | `break-without-enclosing-target` | Unlabeled break cannot target an if statement or the surrounding method. | [section](https://docs.oracle.com/javase/specs/jls/se27/html/jls-14.html#jls-14.15) |
| `nested-labels` | `duplicate-enclosing-label-invalid` | An enclosing label name cannot be reused on a nested labeled statement. | [section](https://docs.oracle.com/javase/specs/jls/se27/html/jls-14.html#jls-14.7) |
| `switch-classic` | `matched-later-case-skips-default` | Matched constant skips an earlier default body instead of always entering default first. | [section](https://docs.oracle.com/javase/specs/jls/se27/html/jls-14.html#jls-14.11.3) |
| `switch-classic` | `boxed-byte-selector-unboxing` | Non-null boxed small-integral selector is unboxed for constant-case matching. | [section](https://docs.oracle.com/javase/specs/jls/se27/html/jls-14.html#jls-14.11.3) |
| `switch-classic` | `case-constant-outside-byte-range` | Case-label compatibility checks representable constant range for a byte selector. | [section](https://docs.oracle.com/javase/specs/jls/se27/html/jls-14.html#jls-14.11.1) |
| `switch-classic` | `fallthrough-local-not-assigned-on-direct-entry` | A visible colon-case local may be unassigned when matching enters a later group directly. | [section](https://docs.oracle.com/javase/specs/jls/se27/html/jls-16.html#jls-16.2.9) |
| `switch-expression` | `statement-arrow-not-arbitrary-value` | Arrow switch statement and expression have different allowed expression-rule bodies. | [section](https://docs.oracle.com/javase/specs/jls/se27/html/jls-15.html#jls-15.28.1) |
| `switch-expression` | `arrow-statement-nonexhaustive` | Traditional arrow statement can remain nonexhaustive, unlike a switch expression. | [section](https://docs.oracle.com/javase/specs/jls/se27/html/jls-14.html#jls-14.11.2) |
| `switch-expression` | `return-cannot-exit-switch-expression` | Method return cannot cross a switch-expression boundary; yield is the needed result transfer. | [section](https://docs.oracle.com/javase/specs/jls/se27/html/jls-14.html#jls-14.17) |
| `switch-expression` | `standalone-switch-numeric-common-type` | Standalone switch numeric typing uses all result alternatives, not only the selected one. | [section](https://docs.oracle.com/javase/specs/jls/se27/html/jls-15.html#jls-15.28.1) |
| `switch-expression` | `object-target-switch-boxes-selected-type` | Target-typed reference switch can box each result separately instead of standalone numeric promotion. | [section](https://docs.oracle.com/javase/specs/jls/se27/html/jls-15.html#jls-15.28.1) |
| `scope-reachability` | `or-does-not-prove-pattern-match` | Positive pattern variable is not available in an OR operand reached on failed match. | [section](https://docs.oracle.com/javase/specs/jls/se27/html/jls-6.html#jls-6.3.1.2) |
| `scope-reachability` | `negated-pattern-return-enables-following-scope` | Negated pattern plus abrupt guard gives a definitely matched binding after the if. | [section](https://docs.oracle.com/javase/specs/jls/se27/html/jls-6.html#jls-6.3.2.2) |
| `scope-reachability` | `break-cannot-cross-switch-expression` | Labeled break cannot escape through an intervening switch expression. | [section](https://docs.oracle.com/javase/specs/jls/se27/html/jls-14.html#jls-14.15) |
| `scope-reachability` | `case-blocks-separate-local-names` | Separate blocks repair duplicate local declarations in colon case groups. | [section](https://docs.oracle.com/javase/specs/jls/se27/html/jls-6.html#jls-6.3) |
| `reference-patterns` | `type-pattern-binds-value` | Basic reference type pattern both tests type and binds the matched value. | [section](https://docs.oracle.com/javase/specs/jls/se27/html/jls-14.html#jls-14.11.1.2) |
| `reference-patterns` | `failed-guard-next-same-type` | Failed guard allows a later same-type pattern rather than selecting default immediately. | [section](https://docs.oracle.com/javase/specs/jls/se27/html/jls-14.html#jls-14.11.1.2) |
| `reference-patterns` | `guard-skipped-on-type-mismatch` | Guard side effects occur only after the associated reference type matches. | [section](https://docs.oracle.com/javase/specs/jls/se27/html/jls-14.html#jls-14.11.1.2) |
| `reference-patterns` | `nullable-guard-unboxes` | Nullable Boolean guards can fail during matching instead of behaving as false. | [section](https://docs.oracle.com/javase/specs/jls/se27/html/jls-14.html#jls-14.11.1.2) |
| `reference-patterns` | `wider-pattern-dominates-narrower` | Subtype pattern dominance prevents an unreachable narrower case. | [section](https://docs.oracle.com/javase/specs/jls/se27/html/jls-14.html#jls-14.11.1) |
| `reference-patterns` | `constant-true-guard-dominance` | Constant-true guards are treated as unguarded for dominance. | [section](https://docs.oracle.com/javase/specs/jls/se27/html/jls-14.html#jls-14.11.1) |
| `reference-patterns` | `unconditional-pattern-plus-default` | Unconditional type pattern cannot coexist with an additional default label. | [section](https://docs.oracle.com/javase/specs/jls/se27/html/jls-14.html#jls-14.11.1) |
| `reference-patterns` | `object-pattern-does-not-handle-null` | Exhaustive Object type pattern still requires explicit handling for a null selector. | [section](https://docs.oracle.com/javase/specs/jls/se27/html/jls-14.html#jls-14.11.1.2) |
| `reference-patterns` | `combined-null-default-label` | Combined null/default label explicitly covers both missing and unmatched reference values. | [section](https://docs.oracle.com/javase/specs/jls/se27/html/jls-14.html#jls-14.11.1.2) |
| `reference-patterns` | `pattern-name-outside-rule` | Pattern variable is scoped to its applicable rule rather than exported from switch. | [section](https://docs.oracle.com/javase/specs/jls/se27/html/jls-6.html#jls-6.3.1.6) |
| `reference-patterns` | `constant-false-guard-invalid` | A constant-false guard is rejected rather than treated as a runtime filter. | [section](https://docs.oracle.com/javase/specs/jls/se27/html/jls-14.html#jls-14.11.1) |
| `reference-patterns` | `type-pattern-dominates-string-constant` | Dominance also applies from an unguarded type pattern to a covered constant label. | [section](https://docs.oracle.com/javase/specs/jls/se27/html/jls-14.html#jls-14.11.1) |

## Current remaining gaps after depth batch 2

| Concept | Authored cards | Remaining scope |
| --- | ---: | --- |
| `branching` | 14 | Applied validation/guard repair choices with overlapping conditions and boundary values; unfamiliar requirements-to-predicate scenarios. |
| `for-boundaries` | 14 | Overflow-sensitive termination, omitted update contrasts and reverse/stride repair choices; array mutation/iteration design belongs partly in Arrays. |
| `while-do` | 9 | Empty/single-item sentinel repairs, progress invariants and short-circuit boundary exhaustion; use bounded verifier scenarios. |
| `break-continue` | 9 | Practical skip/exit repair decisions in nested switch/loop scans, ensuring progress on every continue path; finally interactions belong mainly in Exceptions. |
| `nested-labels` | 8 | Applied search exit choices and nearest-target contrasts across different loop kinds; avoid renamed outer-continue traces. |
| `switch-classic` | 13 | Repairs for accidental fall-through versus intentional accumulation; legal mixed-layout/label constraints not yet covered. |
| `switch-expression` | 14 | Mixed result-type/target contexts beyond numeric promotion, nested yield targets and exhaustive enhanced statements. Sealed exhaustiveness coordinates with Objects. |
| `scope-reachability` | 11 | Definite assignment across multiple loop exit paths; pattern flow scope in while/do/basic-for; safe runtime-versus-constant condition repairs. |
| `reference-patterns` | 12 | Ordering guarded constant/type cases, effective-final guard locals, enhanced statement exhaustiveness, pattern fall-through restrictions and reference cast compatibility. Record/deconstruction/sealed hierarchy cases coordinate with Objects; exclude primitive preview patterns. |

Next authoring decision: residual Control flow repair/edge-case batch, then
Methods and scope (still no structured coverage); do not infer completion from
104 cards. Foundations still needs Methods, Arrays and Strings packs and the
residual Types audit. Depth and mastery are separate from question counts.

## Depth batch 2 verification and delivery status

- 40/40 new snippets passed JDK 25.0.2, --release 21, no preview flags.
  Exact output, compiler diagnostic substring and exception class checks.
- Six focused tests passed across both Control flow packs because their SQL
  generator changed. Previous SQL bytes unchanged; no full app regression or
  old Java snippet suite rerun. All 40 stable keys and normalized snippets are
  unique against prior structured content and four legacy packs. Semantic
  review includes intentional contrasts (mutation/reassignment, target typing,
  pattern &&/||, switch statement/expression), not arbitrary renamed repeats.
- Official Java 27 JLS sources reviewed; Java 27 execution unverified.
- SQL generated and statically validated only; no PostgreSQL/Supabase execution,
  live schema inspection, credentials or connection.
- Authored: yes. Baseline validated: yes. SQL supplied: yes.
  User import reported: pending. User practice accepted: pending.

All structured packs total **18 concepts / 200 authored MC questions**:
Types 9/96; Control flow 9/104. Neither topic nor Foundations is complete.

[Import instructions and testing steps](../../../supabase/seeds/JAVA_CONTROL_FLOW_DEPTH_2.md).

## Teaching progression audit — 2026-10-04

User identified a learning gap: detailed edge cases were overrepresented before
novice instruction. Re-sequenced all 104 existing cards without replacing them
and added thirty distinct introductory teaching steps. The nine existing IDs
remain subtopic bundles with clearer default labels. Cross-cutting scope stays
a final bundle; no reviewed cards/concepts were merged or relinked.

Source pack: `java_control_flow_progression_1.json` (30 new cards).
Sequence: `java_control_flow_sequence.json` (134 explicit positions).
Consolidated teaching view: `java_control_flow_curriculum.json` (134 cards).
SQL: `supabase/seeds/java_control_flow_progression_1.sql`.

| Bundle | New introductory steps | Cumulative cards |
| --- | --- | ---: |
| If/else | Condition syntax, false skip, two alternatives, else-if and block grouping | 19 |
| For/enhanced-for | Header lifecycle, values visited, repetition and ordinary array traversal | 18 |
| While/do | Progress, reevaluation, do syntax and positive-input contrast | 13 |
| Break/continue | Exit, skip and choosing between them | 12 |
| Nested loops/labels | Ordinary nested visits and label meaning before transfers | 10 |
| Switch statements | Matching, default, break boundary and arrow statement | 17 |
| Switch expressions | Result assignment, block yield and default result coverage | 17 |
| Reference patterns | Basic instanceof binding and successful when guard | 14 |
| Scope/reachability | Block-local use, outer-local assignment and method return | 14 |

New questions have exact verification snippets, teaching feedback and official
Java 27 section links. Existing packs/SQL remain unchanged. This update adds
internal positions and guarded default-title changes, not a new difficulty UI.
All Foundations packs total 18 concepts / 230 authored questions (Types 9/96,
Control flow 9/134). User import/practice checks pending.

Remaining rule gaps in the preceding audit still apply. Task-form audit:
output prediction and compiler-error recognition remain common; future batches
should add more code completion, minimal-repair and requirement-to-code/design
choices. New introductory cards include syntax/meaning explanations and ordinary
contrasts. Do not dilute coverage with renamed traces or infer independent coding
ability from MC results. Future concepts must have a complete introductory route
before adding advanced cases. New-vs-review ordering is separate from scheduling.

[Progression import and acceptance steps](../../../supabase/seeds/JAVA_CONTROL_FLOW_PROGRESSION.md).

Validation result: 30/30 new snippets passed JDK 25.0.2 --release 21, without
previews. All 57 Knowledge tests passed, including the 10 focused progression/
queue/content checks; the strengthened consolidated-view check also passed in
the final focused rerun. Production build and targeted ESLint passed. Build
retains existing large-bundle/stale Browserslist warnings. Java 27 execution,
SQL execution against PostgreSQL/Supabase and browser/mobile behavior remain
unverified. No live database connection or credentials were used.
