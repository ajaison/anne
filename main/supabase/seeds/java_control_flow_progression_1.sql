-- Java 27 Control flow teaching progression: 30 NEW introductory MC cards.
-- With starter + both depth packs: 9 concepts / 134 questions.
-- Adds nullable learning_order metadata; preserves all existing study records.
-- Generated from cards/pathways/java_control_flow_progression_1.json. Run in Supabase SQL Editor.
-- Requires the already-installed concept-tracking migration. Only guarded curriculum metadata updates; no deletes.
-- Repeated runs preserve all existing card edits, IDs, links and review schedules.
BEGIN;
SELECT pg_advisory_xact_lock(20261004, 12);
-- Metadata only: null preserves the behavior of decks without a teaching order.
ALTER TABLE public.cards ADD COLUMN IF NOT EXISTS learning_order integer;
ALTER TABLE public.concepts ADD COLUMN IF NOT EXISTS learning_order integer;
DO $seed$
DECLARE
  -- Leave NULL to find/create the single Java project. If several exist, paste
  -- the desired project UUID here, e.g. '...'::uuid, and run the whole script.
  requested_project_id uuid := NULL;
  v_project_id uuid;
  v_topic_id uuid;
  v_concept_id uuid;
  v_card_id uuid;
  seeded_id uuid;
  matches integer;
  affected integer;
  decks_added integer := 0;
  concepts_added integer := 0;
  cards_added integer := 0;
  topic jsonb;
  concept jsonb;
  card jsonb;
  pack jsonb := $java_pack$
{
  "id": "java-control-flow-progression-1",
  "version": 1,
  "java_release": 27,
  "preview_features": false,
  "topics": [
    {
      "key": "control-flow",
      "title": "Control flow",
      "aliases": [
        "Loops and conditionals"
      ],
      "objective": "Reason about branches, loops, switch expressions and execution order.",
      "concepts": [
        {
          "key": "branching",
          "title": "Boolean conditions and branch binding",
          "objective": "Require boolean conditions, detect unboxing in branches and understand which if owns an else.",
          "cards": [
            {
              "key": "if-condition-syntax",
              "question": "Java 27 without preview features. An if statement tests a boolean condition before its body. Which part of this statement is the condition? The code runs inside standard main(String[] args), with no command-line arguments.\n\n```java\nboolean ready = true;\nif (ready) {\n  System.out.print(\"start\");\n}\n```",
              "correct_option": "`ready` inside `(ready)`",
              "distractors": [
                "`if`",
                "`System.out.print(\"start\")`",
                "The braces `{ }`"
              ],
              "explanation": "The parenthesized ready expression is the boolean condition. if introduces the statement, the print call belongs to its body, and braces group the body. The condition is checked first; here true permits the body to print start. The syntax is if (condition) followed by a statement or block.",
              "source": "https://docs.oracle.com/javase/specs/jls/se27/html/jls-14.html#jls-14.9.1",
              "card_type": "multiple_choice",
              "is_code": true,
              "coverage_gap": "Introductory step: An if statement tests a boolean condition before its body. Which part of this statement is the condition?"
            },
            {
              "key": "if-false-following-statement",
              "question": "Java 27 without preview features. What runs when a simple if condition is false? The code runs inside standard main(String[] args), with no command-line arguments.\n\n```java\nboolean ready = false;\nif (ready) {\n  System.out.print(\"start\");\n}\nSystem.out.print(\"finish\");\n```",
              "correct_option": "Prints: finish",
              "distractors": [
                "Prints: startfinish",
                "Prints: start",
                "Prints nothing."
              ],
              "explanation": "A false condition skips only the if body, then execution continues at the following statement. finish therefore prints. startfinish assumes the condition is true, start also skips the following unconditional call, and nothing assumes a false if exits the method. An if is optional execution, not a loop or method exit.",
              "source": "https://docs.oracle.com/javase/specs/jls/se27/html/jls-14.html#jls-14.9.1",
              "card_type": "multiple_choice",
              "is_code": true,
              "coverage_gap": "Introductory step: What runs when a simple if condition is false?"
            },
            {
              "key": "if-else-two-paths",
              "question": "Java 27 without preview features. An else supplies the alternative when the condition is false. Which message is selected? The code runs inside standard main(String[] args), with no command-line arguments.\n\n```java\nint age = 15;\nif (age >= 18) {\n  System.out.print(\"adult\");\n} else {\n  System.out.print(\"minor\");\n}\n```",
              "correct_option": "Prints: minor",
              "distractors": [
                "Prints: adult",
                "Prints: adultminor",
                "Prints nothing."
              ],
              "explanation": "The age comparison is false, so only the else body prints minor. adult chooses the true path, adultminor treats the alternatives as independent statements, and nothing ignores the else. A completed if/else chooses one of its two paths; it does not execute both bodies in sequence.",
              "source": "https://docs.oracle.com/javase/specs/jls/se27/html/jls-14.html#jls-14.9.2",
              "card_type": "multiple_choice",
              "is_code": true,
              "coverage_gap": "Introductory step: An else supplies the alternative when the condition is false. Which message is selected?"
            },
            {
              "key": "else-if-selects-middle-band",
              "question": "Java 27 without preview features. An else-if chain tests later conditions only after earlier conditions fail. Which band applies? The code runs inside standard main(String[] args), with no command-line arguments.\n\n```java\nint score = 65;\nif (score >= 80) {\n  System.out.print(\"high\");\n} else if (score >= 50) {\n  System.out.print(\"middle\");\n} else {\n  System.out.print(\"low\");\n}\n```",
              "correct_option": "Prints: middle",
              "distractors": [
                "Prints: high",
                "Prints: middlelow",
                "Prints: low"
              ],
              "explanation": "The first comparison fails and the second succeeds, selecting middle. high uses the wrong threshold, middlelow ignores that the final else is skipped after a match, and low ignores the successful middle test. else if is an if nested as the preceding else; write the highest threshold first for these descending score bands.",
              "source": "https://docs.oracle.com/javase/specs/jls/se27/html/jls-14.html#jls-14.9.2",
              "card_type": "multiple_choice",
              "is_code": true,
              "coverage_gap": "Introductory step: An else-if chain tests later conditions only after earlier conditions fail. Which band applies?"
            },
            {
              "key": "if-block-groups-work",
              "question": "Java 27 without preview features. Braces make several statements one branch body. Which actions happen here? The code runs inside standard main(String[] args), with no command-line arguments.\n\n```java\nboolean paid = true;\nif (paid) {\n  System.out.print(\"receipt \");\n  System.out.print(\"ship\");\n}\n```",
              "correct_option": "Prints: receipt ship",
              "distractors": [
                "Prints: receipt",
                "Prints: ship",
                "Compilation fails: if permits only one statement."
              ],
              "explanation": "Both calls are inside one block and run in order because paid is true. receipt and ship each omit one statement. An if accepts a block as its body, so the multiple statements are legal. Group related conditional actions with braces so their shared condition is visible.",
              "source": "https://docs.oracle.com/javase/specs/jls/se27/html/jls-14.html#jls-14.2",
              "card_type": "multiple_choice",
              "is_code": true,
              "coverage_gap": "Introductory step: Braces make several statements one branch body. Which actions happen here?"
            }
          ],
          "identity_card_keys": [
            "nonboolean-condition",
            "dangling-else",
            "boxed-condition",
            "else-if-first-match",
            "independent-if-both-run",
            "else-if-skips-condition-effects",
            "null-guard-early-return",
            "nullable-boolean-safe-enable",
            "ordered-null-and-empty-guard",
            "braces-change-else-owner",
            "guard-order-before-work",
            "pattern-and-binding-in-predicate",
            "permission-parentheses-change-policy",
            "three-state-boolean-retains-unknown"
          ]
        },
        {
          "key": "for-boundaries",
          "title": "For-loop boundaries and empty bodies",
          "objective": "Count iterations accurately and distinguish a loop body from a trailing empty statement.",
          "cards": [
            {
              "key": "for-header-three-parts",
              "question": "Java 27 without preview features. Which description correctly identifies the three header parts? The code runs inside standard main(String[] args), with no command-line arguments.\n\n```java\nfor (int step = 0; step < 2; step++) {\n  System.out.print(step);\n}\n```",
              "correct_option": "Initialize step once; test before each body; increment after each body.",
              "distractors": [
                "Initialize step before every body; test after each body; increment first.",
                "Test once; initialize after testing; increment before the body.",
                "All three header parts run only once."
              ],
              "explanation": "The initializer creates step as zero once. The test admits bodies at zero and one; the update increments after each normal body; the final test at two fails. This prints 01. Reinitializing each visit would erase progress, testing only once would not bound iteration, and executing every clause once ignores repeated testing and updates.",
              "source": "https://docs.oracle.com/javase/specs/jls/se27/html/jls-14.html#jls-14.14.1",
              "card_type": "multiple_choice",
              "is_code": true,
              "coverage_gap": "Introductory step: Which description correctly identifies the three header parts?"
            },
            {
              "key": "for-counter-used-in-body",
              "question": "Java 27 without preview features. The loop variable can be used in the body. What values are visited? The code runs inside standard main(String[] args), with no command-line arguments.\n\n```java\nString trace = \"\";\nfor (int item = 2; item <= 4; item++) {\n  trace += item;\n}\nSystem.out.print(trace);\n```",
              "correct_option": "Prints: 234",
              "distractors": [
                "Prints: 23",
                "Prints: 345",
                "Prints: 222"
              ],
              "explanation": "Initialization gives two, each successful test permits the current value to be appended, and the update moves to the next value. The inclusive test includes four. 23 treats <= as <, 345 updates before the first body, and 222 assumes the initializer reruns. This builds a trace rather than relying on a memorized iteration count.",
              "source": "https://docs.oracle.com/javase/specs/jls/se27/html/jls-14.html#jls-14.14.1.2",
              "card_type": "multiple_choice",
              "is_code": true,
              "coverage_gap": "Introductory step: The loop variable can be used in the body. What values are visited?"
            },
            {
              "key": "for-repeat-fixed-action",
              "question": "Java 27 without preview features. A counter can control repetition even when its value is not printed. How many marks appear? The code runs inside standard main(String[] args), with no command-line arguments.\n\n```java\nfor (int count = 0; count < 3; count++) {\n  System.out.print(\"x\");\n}\n```",
              "correct_option": "Prints: xxx",
              "distractors": [
                "Prints: xx",
                "Prints: xxxx",
                "Prints: 012"
              ],
              "explanation": "Bodies run for count zero, one and two, printing one mark each. Two marks drops a valid visit, four includes the failing test at three, and 012 confuses the counter with the body output. The condition controls whether the body runs; the body determines what gets printed.",
              "source": "https://docs.oracle.com/javase/specs/jls/se27/html/jls-14.html#jls-14.14.1.2",
              "card_type": "multiple_choice",
              "is_code": true,
              "coverage_gap": "Introductory step: A counter can control repetition even when its value is not printed. How many marks appear?"
            },
            {
              "key": "enhanced-for-read-sequence",
              "question": "Java 27 without preview features. The enhanced-for form reads successive elements without an explicit index. What does this traversal produce? The code runs inside standard main(String[] args), with no command-line arguments.\n\n```java\nint[] prices = {3, 7};\nint total = 0;\nfor (int price : prices) {\n  total += price;\n}\nSystem.out.print(total);\n```",
              "correct_option": "Prints: 10",
              "distractors": [
                "Prints: 3",
                "Prints: 7",
                "Prints: 2"
              ],
              "explanation": "The colon separates the iteration-variable declaration from the array being traversed. price receives three then seven, and the body accumulates ten. Three stops after the first element, seven replaces rather than accumulates total, and two counts elements instead of their values. Mutation and hidden-conversion details come after understanding this ordinary traversal.",
              "source": "https://docs.oracle.com/javase/specs/jls/se27/html/jls-14.html#jls-14.14.2",
              "card_type": "multiple_choice",
              "is_code": true,
              "coverage_gap": "Introductory step: The enhanced-for form reads successive elements without an explicit index. What does this traversal produce?"
            }
          ],
          "identity_card_keys": [
            "exclusive-bound",
            "inclusive-bound",
            "empty-body",
            "reverse-array-full-range",
            "paired-index-meeting-stop",
            "stride-odd-length",
            "empty-input-inclusive-bound",
            "omitted-for-condition-break",
            "enhanced-primitive-copy-not-array-write",
            "enhanced-object-mutation-visible",
            "enhanced-reference-reassignment-not-slot-write",
            "enhanced-loop-hidden-unboxing",
            "enhanced-array-expression-once",
            "dependent-for-updates-left-to-right"
          ]
        },
        {
          "key": "while-do",
          "title": "While and do-while evaluation",
          "objective": "Distinguish pre-tested/post-tested loops and include side effects from the final failed test.",
          "cards": [
            {
              "key": "while-basic-progress",
              "question": "Java 27 without preview features. A while loop repeats while its condition stays true. What sequence is produced? The code runs inside standard main(String[] args), with no command-line arguments.\n\n```java\nint remaining = 3;\nwhile (remaining > 0) {\n  System.out.print(remaining);\n  remaining--;\n}\n```",
              "correct_option": "Prints: 321",
              "distractors": [
                "Prints: 32",
                "Prints: 3210",
                "Prints: 333"
              ],
              "explanation": "Each body prints the current positive value and decreases it. At zero the pre-body test fails, so 321 prints. 32 stops too soon, 3210 includes a value excluded by the test, and 333 ignores the state update. Identify both the condition and the progress step to explain termination.",
              "source": "https://docs.oracle.com/javase/specs/jls/se27/html/jls-14.html#jls-14.12",
              "card_type": "multiple_choice",
              "is_code": true,
              "coverage_gap": "Introductory step: A while loop repeats while its condition stays true. What sequence is produced?"
            },
            {
              "key": "while-condition-rechecked",
              "question": "Java 27 without preview features. Does while keep using only its original condition value? The code runs inside standard main(String[] args), with no command-line arguments.\n\n```java\nboolean keepGoing = true;\nint visits = 0;\nwhile (keepGoing) {\n  visits++;\n  keepGoing = false;\n}\nSystem.out.print(visits);\n```",
              "correct_option": "Prints: 1",
              "distractors": [
                "Prints: 0",
                "Prints: 2",
                "The loop never terminates."
              ],
              "explanation": "The first test is true, the body runs once, and the next test reads the changed false value. Zero ignores the initial true value, two grants a body after a failed test, and nontermination assumes the original value was cached. while reevaluates its condition before every possible body visit.",
              "source": "https://docs.oracle.com/javase/specs/jls/se27/html/jls-14.html#jls-14.12",
              "card_type": "multiple_choice",
              "is_code": true,
              "coverage_gap": "Introductory step: Does while keep using only its original condition value?"
            },
            {
              "key": "do-while-basic-syntax",
              "question": "Java 27 without preview features. In this do-while form, which step happens first? The code runs inside standard main(String[] args), with no command-line arguments.\n\n```java\nint value = 0;\ndo {\n  value++;\n} while (value < 2);\nSystem.out.print(value);\n```",
              "correct_option": "The body increments value before the first condition test.",
              "distractors": [
                "The condition is tested before the body.",
                "The trailing semicolon creates a second loop.",
                "The body runs once and never repeats."
              ],
              "explanation": "do places the body before the condition, and the trailing semicolon is part of this statement syntax. The first increment produces one, the true test repeats the body, and the next increment/test ends at two. The first alternative describes while, a second loop is not introduced, and do can repeat beyond its mandatory first body.",
              "source": "https://docs.oracle.com/javase/specs/jls/se27/html/jls-14.html#jls-14.13",
              "card_type": "multiple_choice",
              "is_code": true,
              "coverage_gap": "Introductory step: In this do-while form, which step happens first?"
            },
            {
              "key": "choose-loop-test-position",
              "question": "Java 27 without preview features. Both loops have progress. Why are their final values equal for this input? The code runs inside standard main(String[] args), with no command-line arguments.\n\n```java\nint a = 0;\nwhile (a < 2) { a++; }\nint b = 0;\ndo { b++; } while (b < 2);\nSystem.out.print(a + \" \" + b);\n```",
              "correct_option": "Both perform two increments: prints 2 2.",
              "distractors": [
                "while performs none, do performs one: prints 0 1.",
                "do never rechecks: prints 2 1.",
                "while includes one extra body: prints 3 2."
              ],
              "explanation": "The initial while test succeeds, so both forms increment twice until their counters reach two. The pre-test/post-test distinction matters when the initial condition is false, not on every input. 0/1 applies that different initial case here, 2/1 suppresses a true do test, and 3/2 adds a while body after its false test.",
              "source": "https://docs.oracle.com/javase/specs/jls/se27/html/jls-14.html#jls-14.13",
              "card_type": "multiple_choice",
              "is_code": true,
              "coverage_gap": "Introductory step: Both loops have progress. Why are their final values equal for this input?"
            }
          ],
          "identity_card_keys": [
            "while-zero",
            "do-once",
            "failed-test-side-effect",
            "do-continue-runs-condition",
            "sentinel-and-bound-check",
            "bounded-retry-short-circuit",
            "continue-skips-required-progress",
            "runtime-false-loop-reachable-source",
            "do-body-establishes-local-assignment"
          ]
        },
        {
          "key": "break-continue",
          "title": "Break, continue and for-loop updates",
          "objective": "Distinguish exiting a loop from skipping its current body and understand for updates after continue.",
          "cards": [
            {
              "key": "break-exits-before-tail",
              "question": "Java 27 without preview features. A break exits its containing loop immediately. Which code remains reachable at runtime? The code runs inside standard main(String[] args), with no command-line arguments.\n\n```java\nwhile (true) {\n  System.out.print(\"found \");\n  break;\n}\nSystem.out.print(\"done\");\n```",
              "correct_option": "Prints: found done",
              "distractors": [
                "Prints: found",
                "Prints: done",
                "The loop never terminates."
              ],
              "explanation": "The first body prints found, then break exits the loop and the following print runs. found alone treats break as a method return, done skips the admitted body, and nontermination ignores break. A true loop condition does not imply an infinite run when a reachable break supplies an exit.",
              "source": "https://docs.oracle.com/javase/specs/jls/se27/html/jls-14.html#jls-14.15",
              "card_type": "multiple_choice",
              "is_code": true,
              "coverage_gap": "Introductory step: A break exits its containing loop immediately. Which code remains reachable at runtime?"
            },
            {
              "key": "continue-skips-body-tail",
              "question": "Java 27 without preview features. A continue skips the rest of the current iteration. Which markers are suppressed? The code runs inside standard main(String[] args), with no command-line arguments.\n\n```java\nString trace = \"\";\nfor (int value = 1; value <= 3; value++) {\n  if (value == 2) { continue; }\n  trace += \"x\";\n}\nSystem.out.print(trace);\n```",
              "correct_option": "Prints: xx",
              "distractors": [
                "Prints: xxx",
                "Prints: x",
                "The loop never terminates."
              ],
              "explanation": "The body appends at values one and three, while continue skips the append at two. The for update still executes after that continue. xxx ignores the skip, x treats continue as break, and an endless loop incorrectly skips the for update. This introduces skip versus exit before nested target cases.",
              "source": "https://docs.oracle.com/javase/specs/jls/se27/html/jls-14.html#jls-14.16",
              "card_type": "multiple_choice",
              "is_code": true,
              "coverage_gap": "Introductory step: A continue skips the rest of the current iteration. Which markers are suppressed?"
            },
            {
              "key": "break-versus-continue-decision",
              "question": "Java 27 without preview features. Two scans meet the same marker. How do exit and skip differ? The code runs inside standard main(String[] args), with no command-line arguments.\n\n```java\nint exited = 0;\nfor (int n = 1; n <= 3; n++) {\n  if (n == 2) break;\n  exited++;\n}\nint skipped = 0;\nfor (int n = 1; n <= 3; n++) {\n  if (n == 2) continue;\n  skipped++;\n}\nSystem.out.print(exited + \" \" + skipped);\n```",
              "correct_option": "Prints: 1 2",
              "distractors": [
                "Prints: 2 2",
                "Prints: 1 1",
                "Prints: 2 1"
              ],
              "explanation": "break ends the first scan at two, leaving only its first visit counted. continue skips counting two but permits three, so the second count is two. 2/2 gives break a skip-only meaning, 1/1 turns continue into exit, and 2/1 reverses the rules. Choose break when no later elements should be considered, continue when only the current one is unsuitable.",
              "source": "https://docs.oracle.com/javase/specs/jls/se27/html/jls-14.html#jls-14.16",
              "card_type": "multiple_choice",
              "is_code": true,
              "coverage_gap": "Introductory step: Two scans meet the same marker. How do exit and skip differ?"
            }
          ],
          "identity_card_keys": [
            "continue-sum",
            "break-sum",
            "continue-update",
            "switch-break-keeps-loop-running",
            "switch-continue-targets-loop",
            "break-skips-for-update",
            "do-break-skips-condition",
            "outer-while-continue-skips-inner-for-update",
            "break-without-enclosing-target"
          ]
        },
        {
          "key": "nested-labels",
          "title": "Nested loops and labeled transfers",
          "objective": "Identify the loop targeted by unlabeled/labeled break and continue without skipping or inventing iterations.",
          "cards": [
            {
              "key": "nested-loop-ordinary-visits",
              "question": "Java 27 without preview features. Nested loops complete inner visits for each outer visit. How many body visits occur? The code runs inside standard main(String[] args), with no command-line arguments.\n\n```java\nint visits = 0;\nfor (int row = 0; row < 2; row++) {\n  for (int column = 0; column < 3; column++) {\n    visits++;\n  }\n}\nSystem.out.print(visits);\n```",
              "correct_option": "Prints: 6",
              "distractors": [
                "Prints: 5",
                "Prints: 3",
                "Prints: 2"
              ],
              "explanation": "For each of two rows, a freshly initialized inner loop performs three visits: six total. Five adds loop lengths rather than composing repetitions, three counts one row, and two counts outer visits rather than inner bodies. Learn the unmodified nested traversal before tracing breaks or labels that interrupt it.",
              "source": "https://docs.oracle.com/javase/specs/jls/se27/html/jls-14.html#jls-14.14.1",
              "card_type": "multiple_choice",
              "is_code": true,
              "coverage_gap": "Introductory step: Nested loops complete inner visits for each outer visit. How many body visits occur?"
            },
            {
              "key": "label-names-statement",
              "question": "Java 27 without preview features. What does the label before this block do when no transfer refers to it? The code runs inside standard main(String[] args), with no command-line arguments.\n\n```java\nphase: {\n  System.out.print(\"A\");\n}\nSystem.out.print(\"B\");\n```",
              "correct_option": "It names the block; ordinary execution still prints AB.",
              "distractors": [
                "It repeats the block: prints AAB.",
                "It skips the block: prints B.",
                "It creates a variable named phase."
              ],
              "explanation": "A label names the immediately following statement as a possible transfer target. By itself it neither repeats nor skips execution, so the block then the following print produce AB. Labels are not variables and do not create stored values. Labeled break/continue examples build on this basic meaning.",
              "source": "https://docs.oracle.com/javase/specs/jls/se27/html/jls-14.html#jls-14.7",
              "card_type": "multiple_choice",
              "is_code": true,
              "coverage_gap": "Introductory step: What does the label before this block do when no transfer refers to it?"
            }
          ],
          "identity_card_keys": [
            "break-outer",
            "break-inner",
            "continue-outer",
            "break-labeled-block",
            "continue-block-label-invalid",
            "inner-label-continue-update",
            "label-out-of-scope",
            "duplicate-enclosing-label-invalid"
          ]
        },
        {
          "key": "switch-classic",
          "title": "Colon switch groups and fall-through",
          "objective": "Trace colon-style case groups, missing matches and null selectors.",
          "cards": [
            {
              "key": "switch-matching-case-basic",
              "question": "Java 27 without preview features. A switch selector chooses a matching case label. Which command runs? The code runs inside standard main(String[] args), with no command-line arguments.\n\n```java\nint action = 2;\nswitch (action) {\n  case 1: System.out.print(\"save\"); break;\n  case 2: System.out.print(\"open\"); break;\n  default: System.out.print(\"unknown\");\n}\n```",
              "correct_option": "Prints: open",
              "distractors": [
                "Prints: save",
                "Prints: saveopen",
                "Prints: unknown"
              ],
              "explanation": "The selector value two matches case 2, so execution starts there and break exits the switch. save starts at the wrong label, saveopen assumes all labels run from the top, and unknown ignores the match. Labels select an entry point; they are not independent if conditions evaluated as separate bodies.",
              "source": "https://docs.oracle.com/javase/specs/jls/se27/html/jls-14.html#jls-14.11.3",
              "card_type": "multiple_choice",
              "is_code": true,
              "coverage_gap": "Introductory step: A switch selector chooses a matching case label. Which command runs?"
            },
            {
              "key": "switch-default-basic",
              "question": "Java 27 without preview features. What is the ordinary role of default when no constant case matches? The code runs inside standard main(String[] args), with no command-line arguments.\n\n```java\nint action = 9;\nswitch (action) {\n  case 1: System.out.print(\"save\"); break;\n  case 2: System.out.print(\"open\"); break;\n  default: System.out.print(\"unknown\");\n}\n```",
              "correct_option": "Prints: unknown",
              "distractors": [
                "Prints nothing.",
                "Prints: saveopenunknown",
                "Throws IllegalArgumentException."
              ],
              "explanation": "No case constant equals nine, so default supplies the fallback body. Nothing overlooks default, concatenating all bodies ignores entry selection and the breaks, and no language rule creates IllegalArgumentException for an unmatched constant here. An absent default would give different behavior for a traditional statement.",
              "source": "https://docs.oracle.com/javase/specs/jls/se27/html/jls-14.html#jls-14.11.3",
              "card_type": "multiple_choice",
              "is_code": true,
              "coverage_gap": "Introductory step: What is the ordinary role of default when no constant case matches?"
            },
            {
              "key": "switch-break-exits-only-switch",
              "question": "Java 27 without preview features. After a matched case breaks, does ordinary execution continue? The code runs inside standard main(String[] args), with no command-line arguments.\n\n```java\nint command = 1;\nswitch (command) {\n  case 1: System.out.print(\"A\"); break;\n  default: System.out.print(\"D\");\n}\nSystem.out.print(\"Z\");\n```",
              "correct_option": "Prints: AZ",
              "distractors": [
                "Prints: A",
                "Prints: ADZ",
                "Prints: Z"
              ],
              "explanation": "break exits this switch, then Z prints. A alone treats break as return from main, ADZ ignores break and falls through, and Z skips the matched case. This establishes the basic target before a switch is nested in a loop, where choosing the correct containing target becomes harder.",
              "source": "https://docs.oracle.com/javase/specs/jls/se27/html/jls-14.html#jls-14.15",
              "card_type": "multiple_choice",
              "is_code": true,
              "coverage_gap": "Introductory step: After a matched case breaks, does ordinary execution continue?"
            },
            {
              "key": "switch-arrow-statement-basic",
              "question": "Java 27 without preview features. Arrow rules select a body without colon-style fall-through. What runs? The code runs inside standard main(String[] args), with no command-line arguments.\n\n```java\nint command = 1;\nswitch (command) {\n  case 1 -> System.out.print(\"save\");\n  case 2 -> System.out.print(\"open\");\n  default -> System.out.print(\"unknown\");\n}\n```",
              "correct_option": "Prints: save",
              "distractors": [
                "Prints: saveopenunknown",
                "Compilation fails: every rule needs break.",
                "Compilation fails: every arrow switch must return a value."
              ],
              "explanation": "The matching arrow rule executes its print call and completes the statement without entering later rules. No break is required for arrow-rule fall-through prevention, and a switch statement need not produce a value. The concatenated option applies colon fall-through behavior to arrows. This is a statement because its selected call is executed for its effect.",
              "source": "https://docs.oracle.com/javase/specs/jls/se27/html/jls-14.html#jls-14.11.3",
              "card_type": "multiple_choice",
              "is_code": true,
              "coverage_gap": "Introductory step: Arrow rules select a body without colon-style fall-through. What runs?"
            }
          ],
          "identity_card_keys": [
            "switch-fallthrough",
            "switch-no-match",
            "switch-null",
            "default-middle-falls-forward",
            "shared-case-group",
            "selector-once-no-rematch",
            "duplicate-folded-case-label",
            "nonconstant-case-label",
            "string-case-content-matching",
            "matched-later-case-skips-default",
            "boxed-byte-selector-unboxing",
            "case-constant-outside-byte-range",
            "fallthrough-local-not-assigned-on-direct-entry"
          ]
        },
        {
          "key": "switch-expression",
          "title": "Arrow switch rules, yield and exhaustiveness",
          "objective": "Predict non-falling-through arrow rules and return values from exhaustive switch expressions.",
          "cards": [
            {
              "key": "switch-expression-result-assignment",
              "question": "Java 27 without preview features. A switch expression produces a result. Where is the selected value stored? The code runs inside standard main(String[] args), with no command-line arguments.\n\n```java\nint code = 1;\nString label = switch (code) {\n  case 1 -> \"ready\";\n  default -> \"other\";\n};\nSystem.out.print(label);\n```",
              "correct_option": "In label: prints ready.",
              "distractors": [
                "In code: prints 1.",
                "Both alternatives are combined: prints readyother.",
                "Compilation fails: switch cannot initialize a variable."
              ],
              "explanation": "This switch is used as the initializer for label. Case one selects ready, which is stored and printed. The selector is not replaced by the result, alternatives are selected rather than concatenated, and switch expressions are legal initializers. The semicolon ends the surrounding variable declaration.",
              "source": "https://docs.oracle.com/javase/specs/jls/se27/html/jls-15.html#jls-15.28.1",
              "card_type": "multiple_choice",
              "is_code": true,
              "coverage_gap": "Introductory step: A switch expression produces a result. Where is the selected value stored?"
            },
            {
              "key": "yield-block-result-basic",
              "question": "Java 27 without preview features. A multi-statement rule can compute a value and yield it. What is the result? The code runs inside standard main(String[] args), with no command-line arguments.\n\n```java\nint code = 1;\nint price = switch (code) {\n  case 1 -> {\n    int base = 4;\n    yield base + 2;\n  }\n  default -> 0;\n};\nSystem.out.print(price);\n```",
              "correct_option": "Prints: 6",
              "distractors": [
                "Prints: 4",
                "Prints: 0",
                "Compilation fails: yield is only for loops."
              ],
              "explanation": "The selected rule computes base and yield supplies six as the switch-expression value. Four ignores the added two, zero chooses the unselected default, and yield is specifically a result transfer for an enclosing switch expression rather than a loop construct. A rule block needs a result-producing or permitted abrupt path.",
              "source": "https://docs.oracle.com/javase/specs/jls/se27/html/jls-14.html#jls-14.21",
              "card_type": "multiple_choice",
              "is_code": true,
              "coverage_gap": "Introductory step: A multi-statement rule can compute a value and yield it. What is the result?"
            },
            {
              "key": "switch-expression-default-covers-rest",
              "question": "Java 27 without preview features. Why does this expression supply a value for code 7? The code runs inside standard main(String[] args), with no command-line arguments.\n\n```java\nint code = 7;\nint price = switch (code) {\n  case 1 -> 10;\n  default -> 20;\n};\nSystem.out.print(price);\n```",
              "correct_option": "default covers the unmatched value: prints 20.",
              "distractors": [
                "Java invents a zero result: prints 0.",
                "The first case is used as a fallback: prints 10.",
                "Compilation fails: every int must have its own case."
              ],
              "explanation": "default handles every otherwise unmatched non-null int value, selecting twenty here and making this expression exhaustive. There is no invented zero or first-case fallback. Listing each possible int separately is unnecessary when default covers the remainder. Exhaustiveness and advanced reference/null rules build on this ordinary result guarantee.",
              "source": "https://docs.oracle.com/javase/specs/jls/se27/html/jls-14.html#jls-14.11.1.1",
              "card_type": "multiple_choice",
              "is_code": true,
              "coverage_gap": "Introductory step: Why does this expression supply a value for code 7?"
            }
          ],
          "identity_card_keys": [
            "arrow-no-fallthrough",
            "block-yield",
            "exhaustive-expression",
            "explicit-null-switch-case",
            "grouped-arrow-labels",
            "selected-throw-arm",
            "block-missing-yield",
            "enum-exhaustive-without-default",
            "yield-exits-enclosing-expression",
            "statement-arrow-not-arbitrary-value",
            "arrow-statement-nonexhaustive",
            "return-cannot-exit-switch-expression",
            "standalone-switch-numeric-common-type",
            "object-target-switch-boxes-selected-type"
          ]
        },
        {
          "key": "scope-reachability",
          "title": "Scope and statement reachability",
          "objective": "Respect for-variable scope and distinguish Java reachability rules for while and if.",
          "cards": [
            {
              "key": "block-local-visible-inside",
              "question": "Java 27 without preview features. A block groups work and limits local scope. What value is visible within this block? The code runs inside standard main(String[] args), with no command-line arguments.\n\n```java\n{\n  int local = 8;\n  System.out.print(local);\n}\n```",
              "correct_option": "Prints: 8",
              "distractors": [
                "Prints: 0",
                "Compilation fails: a block cannot contain local declarations.",
                "Throws NullPointerException."
              ],
              "explanation": "local is declared and initialized before its use in the same block, so eight prints. Zero invents a different initial value, local declarations are allowed in blocks, and reading this primitive int cannot dereference null. Later questions test where this local stops being visible and whether every path initializes it.",
              "source": "https://docs.oracle.com/javase/specs/jls/se27/html/jls-14.html#jls-14.2",
              "card_type": "multiple_choice",
              "is_code": true,
              "coverage_gap": "Introductory step: A block groups work and limits local scope. What value is visible within this block?"
            },
            {
              "key": "outer-local-updated-in-branch",
              "question": "Java 27 without preview features. An outer local can be updated inside a branch. What survives after the block? The code runs inside standard main(String[] args), with no command-line arguments.\n\n```java\nint selected = 0;\nif (true) {\n  selected = 8;\n}\nSystem.out.print(selected);\n```",
              "correct_option": "Prints: 8",
              "distractors": [
                "Prints: 0",
                "Compilation fails: selected is only visible inside if.",
                "Compilation fails: a branch cannot assign outer locals."
              ],
              "explanation": "selected is declared outside the branch and remains in scope after it. The true branch assigns eight to that same variable. Zero ignores assignment, branch-only visibility would describe a declaration inside the block, and ordinary mutable locals can be assigned from a nested block. Declaration location and assignment location are different.",
              "source": "https://docs.oracle.com/javase/specs/jls/se27/html/jls-14.html#jls-14.2",
              "card_type": "multiple_choice",
              "is_code": true,
              "coverage_gap": "Introductory step: An outer local can be updated inside a branch. What survives after the block?"
            },
            {
              "key": "return-ends-method-body",
              "question": "Java 27 without preview features. A return exits the current method. What happens to a later reachable statement on this path? The code runs inside standard main(String[] args), with no command-line arguments.\n\n```java\nboolean stop = true;\nif (stop) {\n  System.out.print(\"stop\");\n  return;\n}\nSystem.out.print(\"continue\");\n```",
              "correct_option": "Prints: stop",
              "distractors": [
                "Prints: stopcontinue",
                "Prints: continue",
                "Compilation fails: main cannot use return without a value."
              ],
              "explanation": "stop is true, so the body prints and returns from void main before the final call. stopcontinue treats return as leaving only the if block, continue ignores the selected body, and a void method permits return without a value. The ordinary boolean local keeps the final statement statically reachable even though this execution does not reach it.",
              "source": "https://docs.oracle.com/javase/specs/jls/se27/html/jls-14.html#jls-14.17",
              "card_type": "multiple_choice",
              "is_code": true,
              "coverage_gap": "Introductory step: A return exits the current method. What happens to a later reachable statement on this path?"
            }
          ],
          "identity_card_keys": [
            "for-scope",
            "while-false-unreachable",
            "if-false-reachable",
            "statement-after-unconditional-return",
            "infinite-while-no-exit-reachability",
            "loop-break-definite-assignment",
            "colon-case-shared-local-scope",
            "or-does-not-prove-pattern-match",
            "negated-pattern-return-enables-following-scope",
            "break-cannot-cross-switch-expression",
            "case-blocks-separate-local-names"
          ]
        },
        {
          "key": "reference-patterns",
          "title": "Reference patterns, guards and dominance",
          "objective": "Match reference types with final pattern syntax, apply guards, reason about dominance/null handling and respect pattern-variable scope.",
          "identity_card_keys": [
            "type-pattern-binds-value",
            "failed-guard-next-same-type",
            "guard-skipped-on-type-mismatch",
            "nullable-guard-unboxes",
            "wider-pattern-dominates-narrower",
            "constant-true-guard-dominance",
            "unconditional-pattern-plus-default",
            "object-pattern-does-not-handle-null",
            "combined-null-default-label",
            "pattern-name-outside-rule",
            "constant-false-guard-invalid",
            "type-pattern-dominates-string-constant"
          ],
          "cards": [
            {
              "key": "instanceof-binding-basic",
              "question": "Java 27 without preview features. An instanceof type pattern checks a type and names the matched value. Which branch runs? The code runs inside standard main(String[] args), with no command-line arguments.\n\n```java\nObject value = \"ok\";\nif (value instanceof String text) {\n  System.out.print(text);\n} else {\n  System.out.print(\"not text\");\n}\n```",
              "correct_option": "Prints: ok",
              "distractors": [
                "Prints: not text",
                "Compilation fails: Object variables cannot hold Strings.",
                "Throws ClassCastException."
              ],
              "explanation": "The actual object is a String, so the pattern succeeds and binds text to it in the true branch. Object can refer to a String, and this safe type test is not an unchecked cast. not text chooses the failed-match branch. Begin with type-check plus binding before studying switch guards, dominance and more subtle flow scope.",
              "source": "https://docs.oracle.com/javase/specs/jls/se27/html/jls-14.html#jls-14.30.2",
              "card_type": "multiple_choice",
              "is_code": true,
              "coverage_gap": "Introductory step: An instanceof type pattern checks a type and names the matched value. Which branch runs?"
            },
            {
              "key": "when-guard-basic",
              "question": "Java 27 without preview features. A when guard adds a boolean requirement after matching a type. Which rule applies? The code runs inside standard main(String[] args), with no command-line arguments.\n\n```java\nObject value = \"long\";\nString result = switch (value) {\n  case String text when text.length() >= 3 -> \"long text\";\n  default -> \"other\";\n};\nSystem.out.print(result);\n```",
              "correct_option": "Prints: long text",
              "distractors": [
                "Prints: other",
                "Prints: long",
                "Compilation fails: a guard cannot use its pattern variable."
              ],
              "explanation": "The String type test succeeds, binding text before its guard runs. The length test is also true, so the rule supplies long text. other ignores a satisfied guard, long confuses the original selector with the rule result, and the bound variable is available to this guard. Later variants change match/guard outcomes separately and test ordering restrictions.",
              "source": "https://docs.oracle.com/javase/specs/jls/se27/html/jls-14.html#jls-14.11.1",
              "card_type": "multiple_choice",
              "is_code": true,
              "coverage_gap": "Introductory step: A when guard adds a boolean requirement after matching a type. Which rule applies?"
            }
          ]
        }
      ]
    }
  ]
}
$java_pack$::jsonb;
BEGIN
  -- The lock covers this pack's setup across simultaneous SQL runs, including
  -- project creation. It does not lock unrelated ordinary app authoring.
  PERFORM pg_advisory_xact_lock(20261004, 12);
  IF requested_project_id IS NOT NULL THEN
    SELECT p.id INTO v_project_id FROM public.projects p WHERE p.id = requested_project_id
      AND regexp_replace(lower(trim(p.name)), '[^a-z0-9]+', '', 'g') IN ('java', 'java21', 'java27', 'javafundamentals');
    IF v_project_id IS NULL THEN RAISE EXCEPTION 'The requested Java project UUID was not found or its name is not recognized by the pathway.'; END IF;
  ELSE
    SELECT count(*) INTO matches FROM public.projects p
      WHERE regexp_replace(lower(trim(p.name)), '[^a-z0-9]+', '', 'g') IN ('java', 'java21', 'java27', 'javafundamentals');
    IF matches > 1 THEN RAISE EXCEPTION 'Several Java projects exist. Set requested_project_id near the top of this seed.'; END IF;
    SELECT p.id INTO v_project_id FROM public.projects p
      WHERE regexp_replace(lower(trim(p.name)), '[^a-z0-9]+', '', 'g') IN ('java', 'java21', 'java27', 'javafundamentals');
    IF v_project_id IS NULL THEN
      INSERT INTO public.projects (id, name, description)
        VALUES (gen_random_uuid(), 'Java', 'Java learning pathway: concepts, practice and spaced repetition.')
        RETURNING id INTO v_project_id;
    END IF;
  END IF;

  FOR topic IN SELECT value FROM jsonb_array_elements(pack->'topics') LOOP
    seeded_id := md5(v_project_id::text || ':java-foundations-v1:topic:' || (topic->>'key'))::uuid;
    IF EXISTS (SELECT 1 FROM public.decks d WHERE d.id = seeded_id AND d.project_id <> v_project_id) THEN
      RAISE EXCEPTION 'The seeded topic was moved to another project. No changes were committed.';
    END IF;
    IF EXISTS (
      SELECT 1 FROM public.cards q JOIN public.decks d ON d.id = q.deck_id
      WHERE d.project_id <> v_project_id AND EXISTS (
        SELECT 1 FROM jsonb_array_elements(topic->'concepts') group_item,
          jsonb_array_elements_text(group_item->'identity_card_keys' ||
            (SELECT jsonb_agg(item->>'key') FROM jsonb_array_elements(group_item->'cards') item)) item(key)
        WHERE q.id = md5(v_project_id::text || ':java-foundations-v1:card:' ||
          (topic->>'key') || ':' || (group_item->>'key') || ':' || item.key)::uuid
      )
    ) THEN RAISE EXCEPTION 'Known questions were moved outside the selected project. No changes were committed.'; END IF;
    -- Prefer a previously seeded ID so a name edit does not create a duplicate.
    SELECT d.id INTO v_topic_id FROM public.decks d WHERE d.id = seeded_id AND d.project_id = v_project_id;
    IF v_topic_id IS NULL THEN
      -- Recover an adopted deck after a rename using known starter/batch IDs.
      SELECT count(DISTINCT q.deck_id) INTO matches FROM public.cards q
      JOIN public.decks d ON d.id = q.deck_id AND d.project_id = v_project_id
      WHERE EXISTS (
        SELECT 1 FROM jsonb_array_elements(topic->'concepts') group_item,
          jsonb_array_elements_text(group_item->'identity_card_keys' ||
            (SELECT jsonb_agg(item->>'key') FROM jsonb_array_elements(group_item->'cards') item)) item(key)
        WHERE q.id = md5(v_project_id::text || ':java-foundations-v1:card:' ||
          (topic->>'key') || ':' || (group_item->>'key') || ':' || item.key)::uuid
      );
      IF matches > 1 THEN RAISE EXCEPTION 'Known topic questions are spread over multiple decks. Resolve manually; no data was changed.'; END IF;
      IF matches = 1 THEN
        SELECT DISTINCT q.deck_id INTO v_topic_id FROM public.cards q
        JOIN public.decks d ON d.id = q.deck_id AND d.project_id = v_project_id
        WHERE EXISTS (
          SELECT 1 FROM jsonb_array_elements(topic->'concepts') group_item,
            jsonb_array_elements_text(group_item->'identity_card_keys' ||
              (SELECT jsonb_agg(item->>'key') FROM jsonb_array_elements(group_item->'cards') item)) item(key)
          WHERE q.id = md5(v_project_id::text || ':java-foundations-v1:card:' ||
            (topic->>'key') || ':' || (group_item->>'key') || ':' || item.key)::uuid
        );
      END IF;
    END IF;
    IF v_topic_id IS NULL THEN
      SELECT count(*) INTO matches FROM public.decks d WHERE d.project_id = v_project_id AND EXISTS (
        SELECT 1 FROM jsonb_array_elements_text((topic->'aliases') || jsonb_build_array(topic->>'title')) alias(name)
        WHERE regexp_replace(lower(trim(d.name)), '[^a-z0-9]+', '', 'g') = regexp_replace(lower(trim(alias.name)), '[^a-z0-9]+', '', 'g')
      );
      IF matches > 1 THEN RAISE EXCEPTION 'Several decks match topic %. Resolve duplicate topic names before seeding.', topic->>'title'; END IF;
      SELECT d.id INTO v_topic_id FROM public.decks d WHERE d.project_id = v_project_id AND EXISTS (
        SELECT 1 FROM jsonb_array_elements_text((topic->'aliases') || jsonb_build_array(topic->>'title')) alias(name)
        WHERE regexp_replace(lower(trim(d.name)), '[^a-z0-9]+', '', 'g') = regexp_replace(lower(trim(alias.name)), '[^a-z0-9]+', '', 'g')
      );
      IF v_topic_id IS NULL THEN
        INSERT INTO public.decks (id, project_id, name, description)
          VALUES (seeded_id, v_project_id, topic->>'title', topic->>'objective') RETURNING id INTO v_topic_id;
        decks_added := decks_added + 1;
      END IF;
    END IF;

    FOR concept IN SELECT value FROM jsonb_array_elements(topic->'concepts') LOOP
      -- A complete seeded group needs no parent lookup or insert. This also
      -- preserves renamed/reassigned concepts rather than adding empty copies.
      SELECT count(*) INTO matches FROM public.cards c WHERE c.deck_id = v_topic_id AND EXISTS (
        SELECT 1 FROM jsonb_array_elements(concept->'cards') item
        WHERE c.id = md5(v_project_id::text || ':java-foundations-v1:card:' || (topic->>'key') || ':' || (concept->>'key') || ':' || (item->>'key'))::uuid
      );
      IF matches = jsonb_array_length(concept->'cards') THEN CONTINUE; END IF;
      seeded_id := md5(v_topic_id::text || ':java-foundations-v1:concept:' || (concept->>'key'))::uuid;
      IF EXISTS (SELECT 1 FROM public.concepts c WHERE c.id = seeded_id AND c.deck_id <> v_topic_id) THEN
        RAISE EXCEPTION 'The seeded concept was moved to another deck. No changes were committed.';
      END IF;
      SELECT c.id INTO v_concept_id FROM public.concepts c WHERE c.id = seeded_id AND c.deck_id = v_topic_id;
      IF v_concept_id IS NULL THEN
        SELECT count(DISTINCT c.concept_id) INTO matches FROM public.cards c
        JOIN public.concepts parent ON parent.id = c.concept_id AND parent.deck_id = v_topic_id
        WHERE c.deck_id = v_topic_id AND EXISTS (
          SELECT 1 FROM jsonb_array_elements_text(
            COALESCE(concept->'identity_card_keys', '[]'::jsonb) ||
            (SELECT jsonb_agg(item->>'key') FROM jsonb_array_elements(concept->'cards') item)
          ) item(key)
          WHERE c.id = md5(v_project_id::text || ':java-foundations-v1:card:' ||
            (topic->>'key') || ':' || (concept->>'key') || ':' || item.key)::uuid
        );
        IF matches > 1 THEN RAISE EXCEPTION 'Existing questions for concept % have multiple parents. Resolve manually; no data was changed.', concept->>'title'; END IF;
        IF matches = 1 THEN
          SELECT DISTINCT c.concept_id INTO v_concept_id FROM public.cards c
          JOIN public.concepts parent ON parent.id = c.concept_id AND parent.deck_id = v_topic_id
          WHERE c.deck_id = v_topic_id AND EXISTS (
            SELECT 1 FROM jsonb_array_elements_text(
              COALESCE(concept->'identity_card_keys', '[]'::jsonb) ||
              (SELECT jsonb_agg(item->>'key') FROM jsonb_array_elements(concept->'cards') item)
            ) item(key)
            WHERE c.id = md5(v_project_id::text || ':java-foundations-v1:card:' ||
              (topic->>'key') || ':' || (concept->>'key') || ':' || item.key)::uuid
          );
        END IF;
      END IF;
      IF v_concept_id IS NULL THEN
        SELECT count(*) INTO matches FROM public.concepts c WHERE c.deck_id = v_topic_id AND lower(trim(c.title)) = lower(trim(concept->>'title'));
        IF matches > 1 THEN RAISE EXCEPTION 'Several concepts match %. Resolve duplicates before seeding.', concept->>'title'; END IF;
        SELECT c.id INTO v_concept_id FROM public.concepts c WHERE c.deck_id = v_topic_id AND lower(trim(c.title)) = lower(trim(concept->>'title'));
        IF v_concept_id IS NULL THEN
          INSERT INTO public.concepts (id, deck_id, title, objective)
            VALUES (seeded_id, v_topic_id, concept->>'title', concept->>'objective') RETURNING id INTO v_concept_id;
          concepts_added := concepts_added + 1;
        END IF;
      END IF;

      FOR card IN SELECT value FROM jsonb_array_elements(concept->'cards') LOOP
        v_card_id := md5(v_project_id::text || ':java-foundations-v1:card:' || (topic->>'key') || ':' || (concept->>'key') || ':' || (card->>'key'))::uuid;
        IF EXISTS (SELECT 1 FROM public.cards c WHERE c.id = v_card_id AND c.deck_id <> v_topic_id) THEN
          RAISE EXCEPTION 'A seeded question now belongs to another deck. No changes were committed.';
        END IF;
        INSERT INTO public.cards (
          id, deck_id, concept_id, question, answer, card_type, distractors,
          is_code, interval, ease_factor, repetitions, next_review
        ) VALUES (
          v_card_id, v_topic_id, v_concept_id, card->>'question',
          (card->>'correct_option') || E'\n\n' || (card->>'explanation') || E'\n\nSource: [Official Java 27 reference](' || (card->>'source') || ').',
          'multiple_choice', ARRAY(SELECT jsonb_array_elements_text(card->'distractors')),
          (card->>'is_code')::boolean, 0, 2.5, 0, now()
        ) ON CONFLICT (id) DO NOTHING;
        GET DIAGNOSTICS affected = ROW_COUNT;
        cards_added := cards_added + affected;
      END LOOP;
    END LOOP;
  END LOOP;
  RAISE NOTICE 'Java project %: added % topics, % concepts, % questions. Existing data was preserved.', v_project_id, decks_added, concepts_added, cards_added;
  PERFORM set_config('anne.control_flow_batch_project', v_project_id::text, true);
  PERFORM set_config('anne.control_flow_batch_deck', v_topic_id::text, true);
  PERFORM set_config('anne.control_flow_batch_payload', pack::text, true);
END;
$seed$;


-- Apply ordering to known cards without editing content, links or learning data.
DO $ordering$
DECLARE
  sequence jsonb := $learning_sequence$
{
  "id": "java-control-flow-teaching-sequence-1",
  "topic_key": "control-flow",
  "namespace": "java-foundations-v1",
  "concepts": [
    {
      "key": "branching",
      "title": "If, else-if and else",
      "learning_order": 1000,
      "cards": [
        {
          "key": "if-condition-syntax",
          "learning_order": 1010
        },
        {
          "key": "if-false-following-statement",
          "learning_order": 1020
        },
        {
          "key": "if-else-two-paths",
          "learning_order": 1030
        },
        {
          "key": "else-if-selects-middle-band",
          "learning_order": 1040
        },
        {
          "key": "if-block-groups-work",
          "learning_order": 1050
        },
        {
          "key": "else-if-first-match",
          "learning_order": 1060
        },
        {
          "key": "independent-if-both-run",
          "learning_order": 1070
        },
        {
          "key": "braces-change-else-owner",
          "learning_order": 1080
        },
        {
          "key": "nonboolean-condition",
          "learning_order": 1090
        },
        {
          "key": "dangling-else",
          "learning_order": 1100
        },
        {
          "key": "else-if-skips-condition-effects",
          "learning_order": 1110
        },
        {
          "key": "null-guard-early-return",
          "learning_order": 1120
        },
        {
          "key": "guard-order-before-work",
          "learning_order": 1130
        },
        {
          "key": "nullable-boolean-safe-enable",
          "learning_order": 1140
        },
        {
          "key": "three-state-boolean-retains-unknown",
          "learning_order": 1150
        },
        {
          "key": "ordered-null-and-empty-guard",
          "learning_order": 1160
        },
        {
          "key": "permission-parentheses-change-policy",
          "learning_order": 1170
        },
        {
          "key": "boxed-condition",
          "learning_order": 1180
        },
        {
          "key": "pattern-and-binding-in-predicate",
          "learning_order": 1190
        }
      ],
      "original_title": "Boolean conditions and branch binding",
      "original_objective": "Require boolean conditions, detect unboxing in branches and understand which if owns an else."
    },
    {
      "key": "for-boundaries",
      "title": "For and enhanced-for loops",
      "learning_order": 2000,
      "cards": [
        {
          "key": "for-header-three-parts",
          "learning_order": 2010
        },
        {
          "key": "for-counter-used-in-body",
          "learning_order": 2020
        },
        {
          "key": "for-repeat-fixed-action",
          "learning_order": 2030
        },
        {
          "key": "enhanced-for-read-sequence",
          "learning_order": 2040
        },
        {
          "key": "exclusive-bound",
          "learning_order": 2050
        },
        {
          "key": "inclusive-bound",
          "learning_order": 2060
        },
        {
          "key": "reverse-array-full-range",
          "learning_order": 2070
        },
        {
          "key": "stride-odd-length",
          "learning_order": 2080
        },
        {
          "key": "paired-index-meeting-stop",
          "learning_order": 2090
        },
        {
          "key": "dependent-for-updates-left-to-right",
          "learning_order": 2100
        },
        {
          "key": "omitted-for-condition-break",
          "learning_order": 2110
        },
        {
          "key": "empty-body",
          "learning_order": 2120
        },
        {
          "key": "empty-input-inclusive-bound",
          "learning_order": 2130
        },
        {
          "key": "enhanced-primitive-copy-not-array-write",
          "learning_order": 2140
        },
        {
          "key": "enhanced-object-mutation-visible",
          "learning_order": 2150
        },
        {
          "key": "enhanced-reference-reassignment-not-slot-write",
          "learning_order": 2160
        },
        {
          "key": "enhanced-array-expression-once",
          "learning_order": 2170
        },
        {
          "key": "enhanced-loop-hidden-unboxing",
          "learning_order": 2180
        }
      ],
      "original_title": "For-loop boundaries and empty bodies",
      "original_objective": "Count iterations accurately and distinguish a loop body from a trailing empty statement."
    },
    {
      "key": "while-do",
      "title": "While and do-while loops",
      "learning_order": 3000,
      "cards": [
        {
          "key": "while-basic-progress",
          "learning_order": 3010
        },
        {
          "key": "while-condition-rechecked",
          "learning_order": 3020
        },
        {
          "key": "do-while-basic-syntax",
          "learning_order": 3030
        },
        {
          "key": "choose-loop-test-position",
          "learning_order": 3040
        },
        {
          "key": "while-zero",
          "learning_order": 3050
        },
        {
          "key": "do-once",
          "learning_order": 3060
        },
        {
          "key": "runtime-false-loop-reachable-source",
          "learning_order": 3070
        },
        {
          "key": "do-continue-runs-condition",
          "learning_order": 3080
        },
        {
          "key": "continue-skips-required-progress",
          "learning_order": 3090
        },
        {
          "key": "sentinel-and-bound-check",
          "learning_order": 3100
        },
        {
          "key": "bounded-retry-short-circuit",
          "learning_order": 3110
        },
        {
          "key": "failed-test-side-effect",
          "learning_order": 3120
        },
        {
          "key": "do-body-establishes-local-assignment",
          "learning_order": 3130
        }
      ],
      "original_title": "While and do-while evaluation",
      "original_objective": "Distinguish pre-tested/post-tested loops and include side effects from the final failed test."
    },
    {
      "key": "break-continue",
      "title": "Break and continue",
      "learning_order": 4000,
      "cards": [
        {
          "key": "break-exits-before-tail",
          "learning_order": 4010
        },
        {
          "key": "continue-skips-body-tail",
          "learning_order": 4020
        },
        {
          "key": "break-versus-continue-decision",
          "learning_order": 4030
        },
        {
          "key": "break-sum",
          "learning_order": 4040
        },
        {
          "key": "continue-sum",
          "learning_order": 4050
        },
        {
          "key": "continue-update",
          "learning_order": 4060
        },
        {
          "key": "break-skips-for-update",
          "learning_order": 4070
        },
        {
          "key": "do-break-skips-condition",
          "learning_order": 4080
        },
        {
          "key": "switch-break-keeps-loop-running",
          "learning_order": 4090
        },
        {
          "key": "switch-continue-targets-loop",
          "learning_order": 4100
        },
        {
          "key": "break-without-enclosing-target",
          "learning_order": 4110
        },
        {
          "key": "outer-while-continue-skips-inner-for-update",
          "learning_order": 4120
        }
      ],
      "original_title": "Break, continue and for-loop updates",
      "original_objective": "Distinguish exiting a loop from skipping its current body and understand for updates after continue."
    },
    {
      "key": "nested-labels",
      "title": "Nested loops and labels",
      "learning_order": 5000,
      "cards": [
        {
          "key": "nested-loop-ordinary-visits",
          "learning_order": 5010
        },
        {
          "key": "label-names-statement",
          "learning_order": 5020
        },
        {
          "key": "break-inner",
          "learning_order": 5030
        },
        {
          "key": "break-outer",
          "learning_order": 5040
        },
        {
          "key": "continue-outer",
          "learning_order": 5050
        },
        {
          "key": "break-labeled-block",
          "learning_order": 5060
        },
        {
          "key": "inner-label-continue-update",
          "learning_order": 5070
        },
        {
          "key": "continue-block-label-invalid",
          "learning_order": 5080
        },
        {
          "key": "label-out-of-scope",
          "learning_order": 5090
        },
        {
          "key": "duplicate-enclosing-label-invalid",
          "learning_order": 5100
        }
      ],
      "original_title": "Nested loops and labeled transfers",
      "original_objective": "Identify the loop targeted by unlabeled/labeled break and continue without skipping or inventing iterations."
    },
    {
      "key": "switch-classic",
      "title": "Switch statements and case labels",
      "learning_order": 6000,
      "cards": [
        {
          "key": "switch-matching-case-basic",
          "learning_order": 6010
        },
        {
          "key": "switch-default-basic",
          "learning_order": 6020
        },
        {
          "key": "switch-break-exits-only-switch",
          "learning_order": 6030
        },
        {
          "key": "switch-arrow-statement-basic",
          "learning_order": 6040
        },
        {
          "key": "string-case-content-matching",
          "learning_order": 6050
        },
        {
          "key": "shared-case-group",
          "learning_order": 6060
        },
        {
          "key": "switch-no-match",
          "learning_order": 6070
        },
        {
          "key": "switch-fallthrough",
          "learning_order": 6080
        },
        {
          "key": "default-middle-falls-forward",
          "learning_order": 6090
        },
        {
          "key": "matched-later-case-skips-default",
          "learning_order": 6100
        },
        {
          "key": "selector-once-no-rematch",
          "learning_order": 6110
        },
        {
          "key": "boxed-byte-selector-unboxing",
          "learning_order": 6120
        },
        {
          "key": "switch-null",
          "learning_order": 6130
        },
        {
          "key": "nonconstant-case-label",
          "learning_order": 6140
        },
        {
          "key": "duplicate-folded-case-label",
          "learning_order": 6150
        },
        {
          "key": "case-constant-outside-byte-range",
          "learning_order": 6160
        },
        {
          "key": "fallthrough-local-not-assigned-on-direct-entry",
          "learning_order": 6170
        }
      ],
      "original_title": "Colon switch groups and fall-through",
      "original_objective": "Trace colon-style case groups, missing matches and null selectors."
    },
    {
      "key": "switch-expression",
      "title": "Switch expressions and yield",
      "learning_order": 7000,
      "cards": [
        {
          "key": "switch-expression-result-assignment",
          "learning_order": 7010
        },
        {
          "key": "yield-block-result-basic",
          "learning_order": 7020
        },
        {
          "key": "switch-expression-default-covers-rest",
          "learning_order": 7030
        },
        {
          "key": "arrow-no-fallthrough",
          "learning_order": 7040
        },
        {
          "key": "grouped-arrow-labels",
          "learning_order": 7050
        },
        {
          "key": "block-yield",
          "learning_order": 7060
        },
        {
          "key": "exhaustive-expression",
          "learning_order": 7070
        },
        {
          "key": "enum-exhaustive-without-default",
          "learning_order": 7080
        },
        {
          "key": "selected-throw-arm",
          "learning_order": 7090
        },
        {
          "key": "block-missing-yield",
          "learning_order": 7100
        },
        {
          "key": "arrow-statement-nonexhaustive",
          "learning_order": 7110
        },
        {
          "key": "statement-arrow-not-arbitrary-value",
          "learning_order": 7120
        },
        {
          "key": "explicit-null-switch-case",
          "learning_order": 7130
        },
        {
          "key": "yield-exits-enclosing-expression",
          "learning_order": 7140
        },
        {
          "key": "return-cannot-exit-switch-expression",
          "learning_order": 7150
        },
        {
          "key": "standalone-switch-numeric-common-type",
          "learning_order": 7160
        },
        {
          "key": "object-target-switch-boxes-selected-type",
          "learning_order": 7170
        }
      ],
      "original_title": "Arrow switch rules, yield and exhaustiveness",
      "original_objective": "Predict non-falling-through arrow rules and return values from exhaustive switch expressions."
    },
    {
      "key": "reference-patterns",
      "title": "Reference patterns and guards",
      "learning_order": 8000,
      "cards": [
        {
          "key": "instanceof-binding-basic",
          "learning_order": 8010
        },
        {
          "key": "type-pattern-binds-value",
          "learning_order": 8020
        },
        {
          "key": "when-guard-basic",
          "learning_order": 8030
        },
        {
          "key": "failed-guard-next-same-type",
          "learning_order": 8040
        },
        {
          "key": "guard-skipped-on-type-mismatch",
          "learning_order": 8050
        },
        {
          "key": "combined-null-default-label",
          "learning_order": 8060
        },
        {
          "key": "pattern-name-outside-rule",
          "learning_order": 8070
        },
        {
          "key": "nullable-guard-unboxes",
          "learning_order": 8080
        },
        {
          "key": "wider-pattern-dominates-narrower",
          "learning_order": 8090
        },
        {
          "key": "type-pattern-dominates-string-constant",
          "learning_order": 8100
        },
        {
          "key": "constant-true-guard-dominance",
          "learning_order": 8110
        },
        {
          "key": "unconditional-pattern-plus-default",
          "learning_order": 8120
        },
        {
          "key": "object-pattern-does-not-handle-null",
          "learning_order": 8130
        },
        {
          "key": "constant-false-guard-invalid",
          "learning_order": 8140
        }
      ],
      "original_title": "Reference patterns, guards and dominance",
      "original_objective": "Match reference types with final pattern syntax, apply guards, reason about dominance/null handling and respect pattern-variable scope."
    },
    {
      "key": "scope-reachability",
      "title": "Scope and reachable paths",
      "learning_order": 9000,
      "cards": [
        {
          "key": "block-local-visible-inside",
          "learning_order": 9010
        },
        {
          "key": "outer-local-updated-in-branch",
          "learning_order": 9020
        },
        {
          "key": "return-ends-method-body",
          "learning_order": 9030
        },
        {
          "key": "for-scope",
          "learning_order": 9040
        },
        {
          "key": "case-blocks-separate-local-names",
          "learning_order": 9050
        },
        {
          "key": "colon-case-shared-local-scope",
          "learning_order": 9060
        },
        {
          "key": "statement-after-unconditional-return",
          "learning_order": 9070
        },
        {
          "key": "if-false-reachable",
          "learning_order": 9080
        },
        {
          "key": "while-false-unreachable",
          "learning_order": 9090
        },
        {
          "key": "infinite-while-no-exit-reachability",
          "learning_order": 9100
        },
        {
          "key": "loop-break-definite-assignment",
          "learning_order": 9110
        },
        {
          "key": "negated-pattern-return-enables-following-scope",
          "learning_order": 9120
        },
        {
          "key": "or-does-not-prove-pattern-match",
          "learning_order": 9130
        },
        {
          "key": "break-cannot-cross-switch-expression",
          "learning_order": 9140
        }
      ],
      "original_title": "Scope and statement reachability",
      "original_objective": "Respect for-variable scope and distinguish Java reachability rules for while and if."
    }
  ]
}
$learning_sequence$::jsonb;
  v_project uuid := current_setting('anne.control_flow_batch_project')::uuid;
  v_deck uuid := current_setting('anne.control_flow_batch_deck')::uuid;
  group_item jsonb;
  item jsonb;
  v_card uuid;
  v_concept uuid;
  v_parents integer;
BEGIN
  FOR group_item IN SELECT value FROM jsonb_array_elements(sequence->'concepts') LOOP
    -- Prefer stable concept IDs; only infer an adopted parent when unambiguous.
    SELECT id INTO v_concept FROM public.concepts
      WHERE id = md5(v_deck::text || ':java-foundations-v1:concept:' || (group_item->>'key'))::uuid AND deck_id = v_deck;
    IF v_concept IS NULL THEN
      SELECT count(DISTINCT q.concept_id) INTO v_parents FROM public.cards q
        JOIN public.concepts c ON c.id = q.concept_id AND c.deck_id = v_deck
        WHERE q.deck_id = v_deck AND q.id IN (
          SELECT md5(v_project::text || ':java-foundations-v1:card:control-flow:' ||
            (group_item->>'key') || ':' || (x->>'key'))::uuid
          FROM jsonb_array_elements(group_item->'cards') x);
      IF v_parents = 1 THEN
        SELECT DISTINCT q.concept_id INTO v_concept FROM public.cards q
          JOIN public.concepts c ON c.id = q.concept_id AND c.deck_id = v_deck
          WHERE q.deck_id = v_deck AND q.id IN (
            SELECT md5(v_project::text || ':java-foundations-v1:card:control-flow:' ||
              (group_item->>'key') || ':' || (x->>'key'))::uuid
            FROM jsonb_array_elements(group_item->'cards') x);
      END IF;
    END IF;
    UPDATE public.concepts SET learning_order = (group_item->>'learning_order')::integer
      WHERE id = v_concept AND deck_id = v_deck AND learning_order IS NULL;
    -- Rename only untouched authored labels; custom titles/objectives survive.
    UPDATE public.concepts SET title = group_item->>'title'
      WHERE id = v_concept AND deck_id = v_deck
        AND title = group_item->>'original_title' AND objective = group_item->>'original_objective';
    FOR item IN SELECT value FROM jsonb_array_elements(group_item->'cards') LOOP
      v_card := md5(v_project::text || ':java-foundations-v1:card:control-flow:' ||
        (group_item->>'key') || ':' || (item->>'key'))::uuid;
      UPDATE public.cards SET learning_order = (item->>'learning_order')::integer
        WHERE id = v_card AND deck_id = v_deck AND concept_id = v_concept AND learning_order IS NULL;
    END LOOP;
  END LOOP;
END;
$ordering$;
NOTIFY pgrst, 'reload schema';

-- Read-only summary, scoped to the project and deck resolved above.
-- Uses transaction-local seed context so renamed topics and explicit overrides
-- are counted correctly. Counts include pre-existing/user-authored content.
SELECT p.id AS project_id, p.name AS project, d.id AS deck_id, d.name AS topic,
       (SELECT count(*) FROM public.concepts c WHERE c.deck_id = d.id) AS concepts,
       (SELECT count(*) FROM public.cards q WHERE q.deck_id = d.id) AS questions,
       (SELECT count(*) FROM public.cards q WHERE q.deck_id = d.id AND q.learning_order IS NOT NULL) AS ordered_questions,
       (SELECT count(*) FROM public.cards q WHERE q.deck_id = d.id AND q.id IN (
          SELECT md5(p.id::text || ':java-foundations-v1:card:control-flow:' ||
            (c->>'key') || ':' || (card->>'key'))::uuid
          FROM jsonb_array_elements(current_setting('anne.control_flow_batch_payload')::jsonb->'topics'->0->'concepts') c,
               jsonb_array_elements(c->'cards') card
       )) AS batch_questions_present
FROM public.projects p JOIN public.decks d ON d.project_id = p.id
WHERE p.id = current_setting('anne.control_flow_batch_project')::uuid
  AND d.id = current_setting('anne.control_flow_batch_deck')::uuid;
COMMIT;
