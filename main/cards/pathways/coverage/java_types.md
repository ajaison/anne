# Topic 1 coverage audit: Types, variables and operators

Updated 2026-10-04. **Incomplete**. Local authored content, not live counts or
mastery. Starter audit found 8 broad concepts × 3 variants (24 cards), each
covering only a small subset of the objective. Depth batch 1 added 32 independent
rule/scenario variants and one missing atomic concept; depth batch 2 adds 40
conversion/evaluation/assignment variants. Cumulative: 9 concepts / 96 cards. No original keys, questions or source files were changed.

## Batch ledger

| Batch | JSON | SQL | Concepts | New cards | Topic cumulative cards | State |
| --- | --- | --- | --- | ---: | ---: | --- |
| Starter | `cards/pathways/java_foundations_1_2.json` | `supabase/seeds/java_foundations_1_2.sql` | 8 for Topic 1 | 24 | 24 | Authored, baseline validated, SQL supplied; import/practice not reported |
| Depth 1 | `cards/pathways/java_types_depth_1.json` | `supabase/seeds/java_types_depth_1.sql` | 8 reused + 1 new | 32 | 56 | Authored, baseline validated, SQL supplied; import/practice pending |
| Depth 2 | `cards/pathways/java_types_depth_2.json` | `supabase/seeds/java_types_depth_2.sql` | 6 reused + 0 new | 40 | 96 | Authored, baseline validated, SQL supplied; import/practice pending |

Namespace for all three batches: `java-foundations-v1`. Topic UUID = md5(project UUID +
`:java-foundations-v1:topic:types`); concept UUID = md5(actual deck UUID +
`:java-foundations-v1:concept:` + concept key); card UUID = md5(project UUID +
`:java-foundations-v1:card:types:` + concept key + `:` + card key).
`identity_card_keys` records earlier question keys for renamed-parent recovery; it is
generator metadata, not an app column or a new UUID namespace.

## Inventory and gaps

Prerequisites: standard main-method context, basic class/field notation and
reading expressions. Prediction/debugging/edge-case reasoning is MC throughout.
Implementation-from-memory, concurrency scheduling and GC guarantees are N/A
for this batch; no mastery or execution assessment beyond listed snippets.
Practical scenarios include configuration literals, mutable settings, decoded
payloads, numeric identifiers, counters, percentages, sensor NaN and permissions.

| Stable concept | Objective | Starter / depth 1 / depth 2 / cumulative | Remaining rules or scenarios |
| --- | --- | --- | --- |
| `values` — Primitive values and references | Distinguish copied primitive values from shared object references and understand char values. | 3 / 3 / 2 / 8 | Boolean versus numeric separation; char/UTF-16 versus code points. Pass-by-value → Methods; covariance → Arrays. |
| `literals-inference` — Literals and local type inference | Choose valid numeric literal forms and understand that var infers a fixed static type. | 3 / 4 / 2 / 9 | Hex/binary two-complement boundary literals; minimum decimal literal; hexadecimal floating literals; var self-reference, missing initializer, brackets; Unicode escapes. Text blocks → Strings. |
| `initialization` — Initialization and definite assignment | Distinguish default-initialized fields from local variables that must be assigned on every reachable path. | 3 / 3 / 8 / 14 | Nested conditionals and separate complementary if statements; loop exit/break assignment; practical repair choices; default array values → Arrays, field initialization order → Objects. |
| `promotion` — Numeric promotion and narrowing assignments | Predict promoted arithmetic types, constant-expression narrowing and compound-assignment conversions. | 3 / 5 / 10 / 18 | Casting sequences (including floating-to-small-integral stages), safe narrowing/checked arithmetic repair choices, constant-expression representability contrasts. Invocation overloading phases → Methods. |
| `integer-arithmetic` — Integer overflow, division and remainder | Identify arithmetic overflow before widening and predict division/remainder for negative integers. | 3 / 3 / 0 / 6 | Overflow-safe multiplication/Math exact APIs; remainder versus floorMod with negative operands; runtime long boundaries; repair-choice arithmetic scenarios. |
| `floating-point` — Floating-point special values and precision | Recognize NaN, infinity and limits of binary floating-point equality. | 3 / 3 / 0 / 6 | Underflow/subnormals; overflow; remainder/infinity combinations; explicit finite/NaN checks; decimal-money decisions with API sources. |
| `equality-unboxing` — Equality, boxing and null unboxing | Distinguish value comparisons from reference identity and detect null unboxing. | 3 / 3 / 4 / 10 | Wrapper identity beyond guaranteed constant range stays unspecified; Boolean unboxing guards; boxed increments/compound reassignment; practical null-safe repair choices. |
| `evaluation` — Evaluation order and short-circuit operators | Predict left-to-right side effects, skipped boolean operands and string concatenation. | 3 / 4 / 14 / 21 | Additional Boolean/bitwise precedence contrasts; safe null guards versus eager evaluation; numeric conditional out-of-range constant contrasts; exception priority repair decisions. |
| `bits-shifts` — Bit masks and shift operators | Apply integral bit masks, signed and unsigned shifts, and masked shift distances. | 0 / 4 / 0 / 4 | Negative distances; long masking at 64; unsigned byte masks; signed shift versus division for negative odd values; setting/toggling/testing masks and precedence. |

## Exact question inventory and official sections

Every new card was checked for a single defensible option, distinct alternatives,
feedback addressing each alternative, and context-sensitive type/runtime behavior.
Keys below plus the structured JSON make subrule coverage traceable. All new
cards carry the exact learner-visible snippet in verification metadata.

| Concept | Existing starter keys | New key → source section |
| --- | --- | --- |
| `values` | `primitive-copy`, `reference-copy`, `unsigned-char` | `final-reference-mutation` → [reference](https://docs.oracle.com/javase/specs/jls/se27/html/jls-4.html#jls-4.12.4)<br>`reference-cast-runtime` → [reference](https://docs.oracle.com/javase/specs/jls/se27/html/jls-5.html#jls-5.1.6.3)<br>`null-cast-safe` → [reference](https://docs.oracle.com/javase/specs/jls/se27/html/jls-5.html#jls-5.1.6.3) |
| `literals-inference` | `long-literal`, `var-fixed-type`, `var-null` | `radix-leading-zero` → [reference](https://docs.oracle.com/javase/specs/jls/se27/html/jls-3.html#jls-3.10.1)<br>`underscore-prefix` → [reference](https://docs.oracle.com/javase/specs/jls/se27/html/jls-3.html#jls-3.10.1)<br>`float-literal-suffix` → [reference](https://docs.oracle.com/javase/specs/jls/se27/html/jls-3.html#jls-3.10.2)<br>`var-byte-inference` → [reference](https://docs.oracle.com/javase/specs/jls/se27/html/jls-14.html#jls-14.4) |
| `initialization` | `local-unassigned`, `field-defaults`, `conditional-assignment` | `final-constant-versus-local` → [reference](https://docs.oracle.com/javase/specs/jls/se27/html/jls-5.html#jls-5.2)<br>`blank-final-branches` → [reference](https://docs.oracle.com/javase/specs/jls/se27/html/jls-16.html#jls-16)<br>`final-not-constant-expression` → [reference](https://docs.oracle.com/javase/specs/jls/se27/html/jls-4.html#jls-4.12.4) |
| `promotion` | `byte-promotion`, `compound-narrowing`, `constant-range` | `widening-loses-integer-precision` → [reference](https://docs.oracle.com/javase/specs/jls/se27/html/jls-5.html#jls-5.1.2)<br>`float-to-int-boundaries` → [reference](https://docs.oracle.com/javase/specs/jls/se27/html/jls-5.html#jls-5.1.3)<br>`compound-fraction-loss` → [reference](https://docs.oracle.com/javase/specs/jls/se27/html/jls-15.html#jls-15.26.2)<br>`boxing-no-widen-then-box` → [reference](https://docs.oracle.com/javase/specs/jls/se27/html/jls-5.html#jls-5.2)<br>`unbox-then-widen` → [reference](https://docs.oracle.com/javase/specs/jls/se27/html/jls-5.html#jls-5.2) |
| `integer-arithmetic` | `int-wrap`, `overflow-before-long`, `negative-division` | `minimum-divided-negative-one` → [reference](https://docs.oracle.com/javase/specs/jls/se27/html/jls-15.html#jls-15.17.2)<br>`cast-before-division` → [reference](https://docs.oracle.com/javase/specs/jls/se27/html/jls-15.html#jls-15.17.2)<br>`runtime-zero-divisor` → [reference](https://docs.oracle.com/javase/specs/jls/se27/html/jls-15.html#jls-15.17.2) |
| `floating-point` | `nan-equality`, `floating-zero`, `decimal-equality` | `signed-zero-reciprocals` → [reference](https://docs.oracle.com/javase/specs/jls/se27/html/jls-4.html#jls-4.2.3)<br>`nan-ordering` → [reference](https://docs.oracle.com/javase/specs/jls/se27/html/jls-15.html#jls-15.20.1)<br>`small-addition-disappears` → [reference](https://docs.oracle.com/javase/specs/jls/se27/html/jls-15.html#jls-15.18.2) |
| `equality-unboxing` | `primitive-comparison`, `null-unboxing`, `reference-equality` | `cached-constant-boxing` → [reference](https://docs.oracle.com/javase/specs/jls/se27/html/jls-5.html#jls-5.1.7)<br>`different-wrapper-values` → [reference](https://docs.oracle.com/en/java/javase/27/docs/api/java.base/java/lang/Integer.html#equals(java.lang.Object))<br>`ternary-null-unboxing` → [reference](https://docs.oracle.com/javase/specs/jls/se27/html/jls-15.html#jls-15.25) |
| `evaluation` | `increment-order`, `short-circuit`, `concatenation-order` | `eager-boolean-and` → [reference](https://docs.oracle.com/javase/specs/jls/se27/html/jls-15.html#jls-15.22.2)<br>`boolean-xor` → [reference](https://docs.oracle.com/javase/specs/jls/se27/html/jls-15.html#jls-15.22.2)<br>`conditional-only-selected-branch` → [reference](https://docs.oracle.com/javase/specs/jls/se27/html/jls-15.html#jls-15.25)<br>`compound-left-once` → [reference](https://docs.oracle.com/javase/specs/jls/se27/html/jls-15.html#jls-15.26.2) |
| `bits-shifts` | None | `signed-versus-unsigned-shift` → [reference](https://docs.oracle.com/javase/specs/jls/se27/html/jls-15.html#jls-15.19)<br>`masked-int-shift-distance` → [reference](https://docs.oracle.com/javase/specs/jls/se27/html/jls-15.html#jls-15.19)<br>`byte-shift-promotes` → [reference](https://docs.oracle.com/javase/specs/jls/se27/html/jls-15.html#jls-15.19)<br>`clear-one-mask-bit` → [reference](https://docs.oracle.com/javase/specs/jls/se27/html/jls-15.html#jls-15.22.1) |

## Depth batch 2: exact gap mapping

40 new questions reuse six existing concepts. All questions carry
`coverage_gap` in source JSON. That note identifies a distinct rule/boundary
rather than a renamed or renumbered repeat. Source links and verification
metadata are per question. The following inventory complements the original
starter/depth-1 inventory above.

| Concept | New card key | Gap filled | Official source |
| --- | --- | --- | --- |
| `values` | `reassign-alias-detaches` | Reference reassignment separates a former alias instead of mutating the shared object. | [section](https://docs.oracle.com/javase/specs/jls/se27/html/jls-4.html#jls-4.12.2) |
| `values` | `null-instanceof-false` | Null reference instanceof is false without dereferencing. | [section](https://docs.oracle.com/javase/specs/jls/se27/html/jls-15.html#jls-15.20.2) |
| `literals-inference` | `var-multiple-declarators` | Var restriction on multiple declarators. | [section](https://docs.oracle.com/javase/specs/jls/se27/html/jls-14.html#jls-14.4) |
| `literals-inference` | `var-array-initializer-no-target` | Var restriction on target-dependent shorthand array initializer. | [section](https://docs.oracle.com/javase/specs/jls/se27/html/jls-14.html#jls-14.4) |
| `initialization` | `and-true-path-definite-assignment` | Definite assignment conditional on && evaluating true. | [section](https://docs.oracle.com/javase/specs/jls/se27/html/jls-16.html#jls-16.1.2) |
| `initialization` | `or-true-path-not-definitely-assigned` | A true // path can bypass the assigning operand. | [section](https://docs.oracle.com/javase/specs/jls/se27/html/jls-16.html#jls-16.1.3) |
| `initialization` | `nonconstant-true-not-flow-proof` | Ordinary true-valued local versus constant-expression flow proof. | [section](https://docs.oracle.com/javase/specs/jls/se27/html/jls-16.html#jls-16.2.7) |
| `initialization` | `abrupt-else-proves-assignment` | Abrupt completion removes an unassigned path to a later read. | [section](https://docs.oracle.com/javase/specs/jls/se27/html/jls-16.html#jls-16.2.7) |
| `initialization` | `blank-final-second-assignment` | Definite unassignment prevents a second blank-final write. | [section](https://docs.oracle.com/javase/specs/jls/se27/html/jls-16.html#jls-16) |
| `initialization` | `blank-final-loop-repeat` | Blank-final assignment across a potentially repeating loop. | [section](https://docs.oracle.com/javase/specs/jls/se27/html/jls-16.html#jls-16.2.12) |
| `initialization` | `conditional-both-operands-assign` | Definite assignment after both conditional-expression alternatives assign. | [section](https://docs.oracle.com/javase/specs/jls/se27/html/jls-16.html#jls-16.1.5) |
| `initialization` | `short-circuit-assignment-not-after` | Assignment inside && does not necessarily establish assignment afterward. | [section](https://docs.oracle.com/javase/specs/jls/se27/html/jls-16.html#jls-16.1.2) |
| `promotion` | `argument-no-constant-narrowing` | Invocation versus assignment constant narrowing. | [section](https://docs.oracle.com/javase/specs/jls/se27/html/jls-5.html#jls-5.3) |
| `promotion` | `argument-no-narrow-and-box` | Narrowing-plus-boxing differs between assignment and invocation. | [section](https://docs.oracle.com/javase/specs/jls/se27/html/jls-5.html#jls-5.3) |
| `promotion` | `unary-plus-promotes-byte` | Unary promotion versus direct initializer inference. | [section](https://docs.oracle.com/javase/specs/jls/se27/html/jls-15.html#jls-15.15.3) |
| `promotion` | `char-short-mixed-promotion` | Mixed unsigned char and signed short arithmetic. | [section](https://docs.oracle.com/javase/specs/jls/se27/html/jls-5.html#jls-5.6) |
| `promotion` | `char-short-same-bits-different-value` | Char-to-short narrowing and different widening rules. | [section](https://docs.oracle.com/javase/specs/jls/se27/html/jls-5.html#jls-5.1.3) |
| `promotion` | `compound-saves-value-before-rhs` | Compound assignment saves old value when RHS mutates LHS. | [section](https://docs.oracle.com/javase/specs/jls/se27/html/jls-15.html#jls-15.26.2) |
| `promotion` | `float-rounded-before-double` | Float rounding persists after widening to double. | [section](https://docs.oracle.com/javase/specs/jls/se27/html/jls-5.html#jls-5.1.2) |
| `promotion` | `boxing-then-reference-widening` | Boxing followed by widening reference conversion. | [section](https://docs.oracle.com/javase/specs/jls/se27/html/jls-5.html#jls-5.2) |
| `promotion` | `long-plus-float-result-type` | Long/float promotion chooses floating type rather than widest bit width. | [section](https://docs.oracle.com/javase/specs/jls/se27/html/jls-5.html#jls-5.6) |
| `promotion` | `boxed-compound-fraction-rejected` | Primitive compound narrowing does not automatically extend to boxed targets. | [section](https://docs.oracle.com/javase/specs/jls/se27/html/jls-15.html#jls-15.26.2) |
| `equality-unboxing` | `objects-equals-null-safe` | Null-safe value equality without unboxing. | [section](https://docs.oracle.com/en/java/javase/27/docs/api/java.base/java/util/Objects.html#equals(java.lang.Object,java.lang.Object)) |
| `equality-unboxing` | `two-null-wrappers-versus-primitive` | Equality operator changes from reference comparison to unboxing with primitive operand. | [section](https://docs.oracle.com/javase/specs/jls/se27/html/jls-15.html#jls-15.21.1) |
| `equality-unboxing` | `unrelated-wrapper-reference-equality` | Unrelated wrapper reference == can fail compilation rather than compare values. | [section](https://docs.oracle.com/javase/specs/jls/se27/html/jls-15.html#jls-15.21.3) |
| `equality-unboxing` | `mixed-float-equality-rounding` | Mixed numeric equality can merge distinct integers through floating conversion. | [section](https://docs.oracle.com/javase/specs/jls/se27/html/jls-15.html#jls-15.21.1) |
| `evaluation` | `precedence-not-operand-order` | Operator precedence versus left-to-right evaluation trace. | [section](https://docs.oracle.com/javase/specs/jls/se27/html/jls-15.html#jls-15.7.3) |
| `evaluation` | `chained-assignment-right-associative` | Chained assignment associativity and expression value. | [section](https://docs.oracle.com/javase/specs/jls/se27/html/jls-15.html#jls-15.26) |
| `evaluation` | `postincrement-assignment-overwrites` | Assignment can overwrite a post-increment side effect. | [section](https://docs.oracle.com/javase/specs/jls/se27/html/jls-15.html#jls-15.14.2) |
| `evaluation` | `boolean-assignment-in-condition` | Boolean assignment in conditions is legal and changes state. | [section](https://docs.oracle.com/javase/specs/jls/se27/html/jls-15.html#jls-15.26.1) |
| `evaluation` | `equality-before-assignment` | Equality/assignment precedence and comparison without mutation. | [section](https://docs.oracle.com/javase/specs/jls/se27/html/jls-15.html#jls-15.26) |
| `evaluation` | `arguments-left-to-right` | Method argument evaluation order with shared side effects. | [section](https://docs.oracle.com/javase/specs/jls/se27/html/jls-15.html#jls-15.7.4) |
| `evaluation` | `binary-abrupt-left-stops-right` | Abrupt left operand suppresses later binary operand effects. | [section](https://docs.oracle.com/javase/specs/jls/se27/html/jls-15.html#jls-15.7.1) |
| `evaluation` | `argument-failure-stops-call` | Argument failure suppresses later arguments and method invocation. | [section](https://docs.oracle.com/javase/specs/jls/se27/html/jls-15.html#jls-15.7.4) |
| `evaluation` | `null-array-index-effect` | Array access checks null after evaluating the index. | [section](https://docs.oracle.com/javase/specs/jls/se27/html/jls-15.html#jls-15.10.4) |
| `evaluation` | `simple-array-assignment-rhs-first` | Simple array assignment evaluates RHS before bounds failure. | [section](https://docs.oracle.com/javase/specs/jls/se27/html/jls-15.html#jls-15.26.1) |
| `evaluation` | `compound-array-assignment-checks-first` | Compound array assignment fails bounds check before RHS; intentional contrast to simple assignment. | [section](https://docs.oracle.com/javase/specs/jls/se27/html/jls-15.html#jls-15.26.2) |
| `evaluation` | `nested-conditional-associativity` | Nested conditional right associativity. | [section](https://docs.oracle.com/javase/specs/jls/se27/html/jls-15.html#jls-15.25) |
| `evaluation` | `conditional-representable-int-keeps-byte` | Conditional typing retains narrow type for representable int constants. | [section](https://docs.oracle.com/javase/specs/jls/se27/html/jls-15.html#jls-15.25.2) |
| `evaluation` | `boolean-conditional-wrapper-pair` | Both-wrapper Boolean conditional preserves reference type instead of unboxing. | [section](https://docs.oracle.com/javase/specs/jls/se27/html/jls-15.html#jls-15.25.1) |

### Duplicate/contrast audit

Compared against both earlier pathway packs, all four legacy flat packs and
the Collections pilot. Automated checks detect identical normalized snippets
and stable key collisions; semantic review handles cases that differ in text.
No new question is justified only by different names or numbers. Intentional
contrasts include simple versus compound array-assignment bounds timing,
assignment versus invocation narrowing, && versus || definite assignment,
and both-wrapper conditional versus primitive/wrapper unboxing. The legacy
constant-true assignment example contrasts with this batch's ordinary Boolean
local, which does not establish a constant-expression proof.

Legacy content is excluded from structured curriculum totals. Its Integer-128
identity example assumes false without stating the implementation dependency;
if that legacy card is in use, it needs a separate content-only correction
preserving learner edits. This batch does not overwrite it.

## Verification state

- Authored and manually reviewed against official Java 27 JLS/API sources.
- Depth 1: 32/32 snippets pass output/compile-error/runtime-exception checks using
  Homebrew javac/java 25.0.2, `--release 21`, no preview; 48/48 starter checks
  also pass after the verifier gained optional pack selection.
- Depth 2: 40/40 snippets pass exact output/compiler-error checks on the same
  JDK 25.0.2 / --release 21 baseline. Caught-exception output traces are executed.
- 41 Knowledge tests pass: content compatibility, unique/disjoint identity keys,
  matching snippet metadata, stable concept reuse and deterministic additive SQL.
- Java 27 execution: **not verified**, JDK 27 unavailable locally.
- SQL: generated/static checks only; no PostgreSQL executable available, no
  Supabase connection, credentials or live schema inspection.
- User import reported: **pending**. User practice accepted: **pending**.

## Next batch after feedback

Continue Topic 1 with the remaining literal/var, character, checked arithmetic,
floating-point and bitmask boundaries; include practical repair-choice variants.
Then re-audit remaining gaps before deepening Control flow. Do not declare this
topic complete at 96 cards or advance solely because this batch was delivered.

Unmapped pathway audit: enums/records/sealed types → Objects; reference pattern
matching → Objects/Control flow (exclude preview primitive patterns); modules,
annotations and reflection require explicit scope mapping, likely an outline
extension later. Modern concurrency → Concurrency. No pathway UI changes here.

Import counts, schema assumptions and user testing are documented in
[depth 1 instructions](../../../supabase/seeds/JAVA_TYPES_DEPTH_1.md) and
[depth 2 instructions](../../../supabase/seeds/JAVA_TYPES_DEPTH_2.md).
