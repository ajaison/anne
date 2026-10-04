-- Java 27 Control flow depth batch 1: 40 NEW MC cards, 8 reused concepts.
-- After the starter: Control flow has 8 concepts / 64 questions.
-- This batch alone on an empty topic: 8 concepts / 40 questions.
-- Generated from cards/pathways/java_control_flow_depth_1.json. Run in Supabase SQL Editor.
-- Requires the already-installed concept-tracking migration. No deletes or updates.
-- Repeated runs preserve all existing card edits, IDs, links and review schedules.
BEGIN;
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
  "id": "java-control-flow-depth-batch-1",
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
              "key": "else-if-first-match",
              "question": "Java 27, no preview features. Two thresholds match a score. Which branch runs? This code is inside a standard main(String[] args) method with no command-line arguments. No imports are required.\n\n```java\nint score = 95;\nString band;\nif (score >= 60) band = \"pass\";\nelse if (score >= 90) band = \"distinction\";\nelse band = \"fail\";\nSystem.out.print(band);\n```",
              "correct_option": "Prints: pass",
              "distractors": [
                "Prints: distinction",
                "Prints: fail",
                "Compilation fails: overlapping conditions are forbidden."
              ],
              "explanation": "An else-if chain chooses its first matching branch. The >=60 condition succeeds, so the >=90 test is never reached. Java does not select the most specific or largest threshold automatically, and overlapping conditions are legal. fail ignores the successful first test. To award distinction here, test >=90 before >=60.",
              "source": "https://docs.oracle.com/javase/specs/jls/se27/html/jls-14.html#jls-14.9.2",
              "card_type": "multiple_choice",
              "is_code": true,
              "coverage_gap": "Overlapping else-if thresholds depend on branch order."
            },
            {
              "key": "independent-if-both-run",
              "question": "Java 27, no preview features. Two notifications use separate if statements. What happens? This code is inside a standard main(String[] args) method with no command-line arguments. No imports are required.\n\n```java\nint stock = 0;\nif (stock <= 5) System.out.print(\"low \");\nif (stock == 0) System.out.print(\"empty\");\n```",
              "correct_option": "Prints: low empty",
              "distractors": [
                "Prints: low ",
                "Prints: empty",
                "Compilation fails: both conditions can be true."
              ],
              "explanation": "Separate if statements are evaluated independently. Both conditions hold at zero stock, so both messages print in source order. Printing only low treats the second statement as an else-if, while empty alone skips a true earlier branch. Java permits overlapping conditions; use else-if when only one notification should be selected.",
              "source": "https://docs.oracle.com/javase/specs/jls/se27/html/jls-14.html#jls-14.9.1",
              "card_type": "multiple_choice",
              "is_code": true,
              "coverage_gap": "Independent if statements differ from exclusive else-if chains."
            },
            {
              "key": "else-if-skips-condition-effects",
              "question": "Java 27, no preview features. A later branch test changes a counter. What is printed? This code is inside a standard main(String[] args) method with no command-line arguments. No imports are required.\n\n```java\nboolean cached = true;\nint lookups = 0;\nif (cached) System.out.print(\"cache \");\nelse if (++lookups > 0) System.out.print(\"lookup \");\nSystem.out.print(lookups);\n```",
              "correct_option": "Prints: cache 0",
              "distractors": [
                "Prints: cache 1",
                "Prints: cache lookup 1",
                "Prints: lookup 1"
              ],
              "explanation": "The else statement is reached only when cached is false. Because the first branch runs, even the later condition is skipped and lookups stays zero. cache 1 evaluates a skipped test, cache lookup 1 wrongly runs both alternatives, and lookup 1 ignores the true first condition. Side effects in branch tests follow control flow.",
              "source": "https://docs.oracle.com/javase/specs/jls/se27/html/jls-14.html#jls-14.9.2",
              "card_type": "multiple_choice",
              "is_code": true,
              "coverage_gap": "A successful branch suppresses later else-if condition side effects."
            },
            {
              "key": "null-guard-early-return",
              "question": "Java 27, no preview features. A guard clause handles a missing customer name. What happens? This code is inside a standard main(String[] args) method with no command-line arguments. No imports are required.\n\n```java\nclass Labels {\n  String label(String name) {\n    if (name == null) return \"guest\";\n    return name.toUpperCase(java.util.Locale.ROOT);\n  }\n}\nSystem.out.print(new Labels().label(null));\n```",
              "correct_option": "Prints: guest",
              "distractors": [
                "Throws NullPointerException.",
                "Prints: null",
                "Compilation fails: a method cannot contain two return statements."
              ],
              "explanation": "The guard returns guest before the dereferencing call is reached. Return exits that method invocation immediately, so a missing name does not reach toUpperCase. Printing null assumes the argument is returned unchanged; NullPointerException ignores the guard; multiple return statements on different paths are legal. Locale.ROOT makes the non-null path independent of default locale.",
              "source": "https://docs.oracle.com/javase/specs/jls/se27/html/jls-14.html#jls-14.17",
              "card_type": "multiple_choice",
              "is_code": true,
              "coverage_gap": "Early-return null guard prevents later dereference."
            },
            {
              "key": "nullable-boolean-safe-enable",
              "question": "Java 27, no preview features. A missing Boolean setting should mean disabled. What happens? This code is inside a standard main(String[] args) method with no command-line arguments. No imports are required.\n\n```java\nBoolean enabled = null;\nif (Boolean.TRUE.equals(enabled)) System.out.print(\"on\");\nelse System.out.print(\"off\");\n```",
              "correct_option": "Prints: off",
              "distractors": [
                "Prints: on",
                "Throws NullPointerException.",
                "Compilation fails: equals returns Boolean rather than boolean."
              ],
              "explanation": "Boolean.TRUE is non-null; its equals method returns primitive false for a null argument. The else prints off without unboxing enabled. on incorrectly treats missing as true, the exception option assumes if directly tests enabled, and equals returns a primitive boolean accepted by if. This explicitly implements null-as-disabled semantics.",
              "source": "https://docs.oracle.com/en/java/javase/27/docs/api/java.base/java/lang/Boolean.html#equals(java.lang.Object)",
              "card_type": "multiple_choice",
              "is_code": true,
              "coverage_gap": "Null-safe Boolean decision instead of directly unboxing a nullable condition."
            },
            {
              "key": "ordered-null-and-empty-guard",
              "question": "Java 27, no preview features. A text check must handle null before using its length. What happens? This code is inside a standard main(String[] args) method with no command-line arguments. No imports are required.\n\n```java\nString input = null;\nif (input != null && !input.isEmpty()) System.out.print(\"text\");\nelse System.out.print(\"missing\");\n```",
              "correct_option": "Prints: missing",
              "distractors": [
                "Throws NullPointerException.",
                "Prints: text",
                "Compilation fails: && cannot combine a reference check and a method result."
              ],
              "explanation": "The left comparison is false, so && skips isEmpty. Both operands have boolean type, and the branch selects missing. The exception option overlooks short-circuiting, text overlooks the failed guard, and mixing two kinds of boolean-producing expressions is legal. Reversing their order would dereference null before checking it.",
              "source": "https://docs.oracle.com/javase/specs/jls/se27/html/jls-15.html#jls-15.23",
              "card_type": "multiple_choice",
              "is_code": true,
              "coverage_gap": "Practical guard order prevents nullable text dereference."
            },
            {
              "key": "braces-change-else-owner",
              "question": "Java 27, no preview features. Explicit braces group an inner condition. Which message appears? This code is inside a standard main(String[] args) method with no command-line arguments. No imports are required.\n\n```java\nboolean loggedIn = true;\nboolean admin = false;\nif (loggedIn) {\n  if (admin) System.out.print(\"admin\");\n} else {\n  System.out.print(\"guest\");\n}\nSystem.out.print(\"done\");\n```",
              "correct_option": "Prints: done",
              "distractors": [
                "Prints: guestdone",
                "Prints: admindone",
                "Compilation fails: the else has no matching if."
              ],
              "explanation": "The braces make the entire inner block the outer if body, so else belongs to loggedIn. loggedIn is true and admin is false; neither message is printed before done. guestdone binds else to the inner if despite the closing brace, admindone ignores admin=false, and the outer if is a valid match for else.",
              "source": "https://docs.oracle.com/javase/specs/jls/se27/html/jls-14.html#jls-14.9.2",
              "card_type": "multiple_choice",
              "is_code": true,
              "coverage_gap": "Explicit blocks alter branch grouping relative to dangling-else starter."
            },
            {
              "key": "guard-order-before-work",
              "question": "Java 27, no preview features. A validation return precedes an expensive step. What is printed? This code is inside a standard main(String[] args) method with no command-line arguments. No imports are required.\n\n```java\nclass Checkout {\n  int calls;\n  String submit(int quantity) {\n    if (quantity <= 0) return \"invalid\";\n    calls++;\n    return \"saved\";\n  }\n}\nCheckout checkout = new Checkout();\nSystem.out.print(checkout.submit(0) + \" \" + checkout.calls);\n```",
              "correct_option": "Prints: invalid 0",
              "distractors": [
                "Prints: invalid 1",
                "Prints: saved 1",
                "Compilation fails: return prevents any following statement from being reachable."
              ],
              "explanation": "The invalid branch returns before calls++ for this invocation. Other inputs can take the false branch and reach the work, so the statements after the conditional are reachable. invalid 1 performs work after a returned invocation, saved 1 ignores the validation, and the compile-error option confuses conditional return with unconditional return.",
              "source": "https://docs.oracle.com/javase/specs/jls/se27/html/jls-14.html#jls-14.17",
              "card_type": "multiple_choice",
              "is_code": true,
              "coverage_gap": "Guard clauses suppress downstream work while leaving valid paths reachable."
            }
          ],
          "identity_card_keys": [
            "nonboolean-condition",
            "dangling-else",
            "boxed-condition"
          ]
        },
        {
          "key": "for-boundaries",
          "title": "For-loop boundaries and empty bodies",
          "objective": "Count iterations accurately and distinguish a loop body from a trailing empty statement.",
          "cards": [
            {
              "key": "reverse-array-full-range",
              "question": "Java 27, no preview features. A reverse traversal starts at the last valid index. What is printed? This code is inside a standard main(String[] args) method with no command-line arguments. No imports are required.\n\n```java\nint[] values = {4, 7, 9};\nfor (int i = values.length - 1; i >= 0; i--) {\n  System.out.print(values[i]);\n}\n```",
              "correct_option": "Prints: 974",
              "distractors": [
                "Prints: 97",
                "Prints: 479",
                "Throws ArrayIndexOutOfBoundsException."
              ],
              "explanation": "The loop visits indices 2, 1 and 0, printing 9, 7 and 4. >=0 includes the first element; using >0 would omit it. Forward output reverses the specified direction, and length-1 is a valid initial index. On an empty array it starts at -1 and performs no access.",
              "source": "https://docs.oracle.com/javase/specs/jls/se27/html/jls-14.html#jls-14.14.1.2",
              "card_type": "multiple_choice",
              "is_code": true,
              "coverage_gap": "Reverse traversal includes index zero and starts at length minus one."
            },
            {
              "key": "paired-index-meeting-stop",
              "question": "Java 27, no preview features. Two indices scan inward. Which pairs are visited? This code is inside a standard main(String[] args) method with no command-line arguments. No imports are required.\n\n```java\nint size = 4;\nfor (int left = 0, right = size - 1; left < right; left++, right--) {\n  System.out.print(left + \":\" + right + \" \");\n}\n```",
              "correct_option": "Prints: \"0:3 1:2 \"",
              "distractors": [
                "Prints: \"0:3 1:2 2:1 \"",
                "Prints: \"0:3 1:3 2:3 \"",
                "Prints: \"0:3 \""
              ],
              "explanation": "Each iteration advances left and decreases right; the condition is retested after both updates. The pairs are 0:3 and 1:2, then 2<1 is false. Visiting 2:1 ignores termination, fixed right values omit its update, and one pair stops too early. The condition expresses crossing rather than an array length boundary.",
              "source": "https://docs.oracle.com/javase/specs/jls/se27/html/jls-14.html#jls-14.14.1.2",
              "card_type": "multiple_choice",
              "is_code": true,
              "coverage_gap": "Multiple indices update together and stop when an inward scan crosses."
            },
            {
              "key": "stride-odd-length",
              "question": "Java 27, no preview features. A sampling loop visits every other element. What is printed? This code is inside a standard main(String[] args) method with no command-line arguments. No imports are required.\n\n```java\nint[] readings = {5, 6, 7, 8, 9};\nfor (int i = 0; i < readings.length; i += 2) {\n  System.out.print(readings[i] + \" \");\n}\n```",
              "correct_option": "Prints: \"5 7 9 \"",
              "distractors": [
                "Prints: \"5 7 \"",
                "Prints: \"6 8 \"",
                "Throws ArrayIndexOutOfBoundsException after printing 9."
              ],
              "explanation": "Starting at zero with step two visits indices 0, 2 and 4. The next index is 6, but the condition fails before accessing it. Omitting nine incorrectly rounds the iteration count down, 6/8 starts at index one, and the exception option treats an invalid future index as an executed access.",
              "source": "https://docs.oracle.com/javase/specs/jls/se27/html/jls-14.html#jls-14.14.1.2",
              "card_type": "multiple_choice",
              "is_code": true,
              "coverage_gap": "Non-unit stride with an odd-sized input and a pre-access bound test."
            },
            {
              "key": "empty-input-inclusive-bound",
              "question": "Java 27, no preview features. A traversal uses <= instead of < on an empty input. What happens? This code is inside a standard main(String[] args) method with no command-line arguments. No imports are required.\n\n```java\nint[] readings = {};\nfor (int i = 0; i <= readings.length; i++) {\n  System.out.print(readings[i]);\n}\n```",
              "correct_option": "Throws ArrayIndexOutOfBoundsException.",
              "distractors": [
                "Prints nothing and completes normally.",
                "Prints: 0",
                "Compilation fails: an empty array initializer is invalid."
              ],
              "explanation": "length is zero, so i<=length admits i=0, but an empty array has no valid indices. The access throws before printing. Zero is not a valid default element, empty initializers are legal, and the normally-empty traversal requires i<length. This boundary bug occurs even before considering nonempty inputs.",
              "source": "https://docs.oracle.com/javase/specs/jls/se27/html/jls-14.html#jls-14.14.1.2",
              "card_type": "multiple_choice",
              "is_code": true,
              "coverage_gap": "Inclusive traversal bound fails on empty input rather than skipping the body."
            },
            {
              "key": "omitted-for-condition-break",
              "question": "Java 27, no preview features. An intentionally unbounded loop has a terminating guard. What is printed? This code is inside a standard main(String[] args) method with no command-line arguments. No imports are required.\n\n```java\nint batch = 0;\nfor (;;) {\n  if (++batch == 3) break;\n  System.out.print(batch);\n}\nSystem.out.print(\" done\");\n```",
              "correct_option": "Prints: 12 done",
              "distractors": [
                "Prints: 123 done",
                "Prints: 012 done",
                "Compilation fails: a for loop requires a condition."
              ],
              "explanation": "An omitted for condition permits repeated execution until an explicit transfer exits it. The pre-increment reaches three before printing, so break skips that print and exits. 123 prints after the terminating guard, 012 treats pre-increment as post-increment, and Java permits the empty condition. This is a termination design example, not a claim that every unbounded loop is safe.",
              "source": "https://docs.oracle.com/javase/specs/jls/se27/html/jls-14.html#jls-14.14.1.3",
              "card_type": "multiple_choice",
              "is_code": true,
              "coverage_gap": "Omitted for condition can be safely bounded by an explicit guard/break."
            }
          ],
          "identity_card_keys": [
            "exclusive-bound",
            "inclusive-bound",
            "empty-body"
          ]
        },
        {
          "key": "while-do",
          "title": "While and do-while evaluation",
          "objective": "Distinguish pre-tested/post-tested loops and include side effects from the final failed test.",
          "cards": [
            {
              "key": "do-continue-runs-condition",
              "question": "Java 27, no preview features. A continue skips the remaining do body. What is printed? This code is inside a standard main(String[] args) method with no command-line arguments. No imports are required.\n\n```java\nint attempts = 0;\nint tests = 0;\ndo {\n  attempts++;\n  if (attempts < 3) continue;\n  System.out.print(\"work \");\n} while (++tests < 2);\nSystem.out.print(attempts + \" \" + tests);\n```",
              "correct_option": "Prints: 2 2",
              "distractors": [
                "Prints: work 3 3",
                "Prints: 3 0",
                "Prints: 1 1"
              ],
              "explanation": "A do-loop continue still evaluates the condition. Each of the first two bodies increments attempts and continues; the second condition test ends the loop. No work text appears. Skipping the condition would give the wrong counts, reaching work assumes a third iteration that never occurs, and one iteration ignores the true first test.",
              "source": "https://docs.oracle.com/javase/specs/jls/se27/html/jls-14.html#jls-14.13.1",
              "card_type": "multiple_choice",
              "is_code": true,
              "coverage_gap": "Continue in do-while transfers to its condition, including condition effects."
            },
            {
              "key": "sentinel-and-bound-check",
              "question": "Java 27, no preview features. A scanner stops at a sentinel or the input boundary. What is printed? This code is inside a standard main(String[] args) method with no command-line arguments. No imports are required.\n\n```java\nint[] readings = {2, 4, 0, 9};\nint index = 0;\nint total = 0;\nwhile (index < readings.length && readings[index] != 0) {\n  total += readings[index++];\n}\nSystem.out.print(total + \" \" + index);\n```",
              "correct_option": "Prints: 6 2",
              "distractors": [
                "Prints: 15 4",
                "Prints: 6 3",
                "Throws ArrayIndexOutOfBoundsException."
              ],
              "explanation": "Only the two values before the zero sentinel are added. index advances in the body, so it remains two when the condition sees zero. 15/4 ignores the sentinel, 6/3 consumes it despite the failed test, and checking the bound first with && also prevents an out-of-range access if no sentinel exists.",
              "source": "https://docs.oracle.com/javase/specs/jls/se27/html/jls-14.html#jls-14.12",
              "card_type": "multiple_choice",
              "is_code": true,
              "coverage_gap": "Sentinel scanning combines boundary protection and stopping without consuming sentinel."
            },
            {
              "key": "bounded-retry-short-circuit",
              "question": "Java 27, no preview features. A retry loop stops when its service reports ready. What is printed? This code is inside a standard main(String[] args) method with no command-line arguments. No imports are required.\n\n```java\nclass Service { int calls; boolean ready() { return ++calls >= 3; } }\nService service = new Service();\nint attempts = 0;\nwhile (attempts < 5 && !service.ready()) {\n  attempts++;\n}\nSystem.out.print(attempts + \" \" + service.calls);\n```",
              "correct_option": "Prints: 2 3",
              "distractors": [
                "Prints: 3 3",
                "Prints: 5 5",
                "Prints: 2 2"
              ],
              "explanation": "The first two readiness tests fail and each executes the body. The third succeeds, so !ready is false and no third body increment occurs. attempts counts failed bodies, while calls counts tests, including the final successful test. 3/3 conflates those counts, 5/5 ignores early success, and 2/2 omits the terminating test.",
              "source": "https://docs.oracle.com/javase/specs/jls/se27/html/jls-14.html#jls-14.12",
              "card_type": "multiple_choice",
              "is_code": true,
              "coverage_gap": "Retry body count differs from service test count at early success."
            }
          ],
          "identity_card_keys": [
            "while-zero",
            "do-once",
            "failed-test-side-effect"
          ]
        },
        {
          "key": "break-continue",
          "title": "Break, continue and for-loop updates",
          "objective": "Distinguish exiting a loop from skipping its current body and understand for updates after continue.",
          "cards": [
            {
              "key": "switch-break-keeps-loop-running",
              "question": "Java 27, no preview features. What does an unlabeled break inside this switch exit? This code is inside a standard main(String[] args) method with no command-line arguments. No imports are required.\n\n```java\nfor (int i = 0; i < 2; i++) {\n  switch (i) {\n    case 0: System.out.print(\"A\"); break;\n    default: System.out.print(\"B\");\n  }\n  System.out.print(\"X\");\n}\n```",
              "correct_option": "Prints: AXBX",
              "distractors": [
                "Prints: A",
                "Prints: ABX",
                "Prints: AXB"
              ],
              "explanation": "break targets the nearest enclosing switch here, not the loop. The first iteration prints A then X, and the second prints B then X. A exits too far, ABX omits the first post-switch step, and AXB omits the second. A loop-targeting labeled break would be needed to exit that outer loop directly.",
              "source": "https://docs.oracle.com/javase/specs/jls/se27/html/jls-14.html#jls-14.15",
              "card_type": "multiple_choice",
              "is_code": true,
              "coverage_gap": "Unlabeled switch break does not exit its containing loop."
            },
            {
              "key": "switch-continue-targets-loop",
              "question": "Java 27, no preview features. A switch branch executes continue. What is printed? This code is inside a standard main(String[] args) method with no command-line arguments. No imports are required.\n\n```java\nfor (int i = 0; i < 3; i++) {\n  switch (i) {\n    case 1: continue;\n    default: System.out.print(i);\n  }\n  System.out.print(\"X\");\n}\n```",
              "correct_option": "Prints: 0X2X",
              "distractors": [
                "Prints: 0X1X2X",
                "Prints: 0XX2X",
                "Compilation fails: continue is forbidden inside a switch."
              ],
              "explanation": "A switch is not a continue target; the enclosing loop is. At i=1 the rest of that loop body is skipped, including X, and the for update still runs. Printing one ignores continue, the extra X treats continue like switch break, and the nested continue is legal because a loop encloses it.",
              "source": "https://docs.oracle.com/javase/specs/jls/se27/html/jls-14.html#jls-14.16",
              "card_type": "multiple_choice",
              "is_code": true,
              "coverage_gap": "Continue inside switch targets the enclosing loop rather than the switch."
            },
            {
              "key": "break-skips-for-update",
              "question": "Java 27, no preview features. A break exits before the next for update. What is printed? This code is inside a standard main(String[] args) method with no command-line arguments. No imports are required.\n\n```java\nint i = 0;\nint updates = 0;\nfor (; i < 3; i++, updates++) {\n  if (i == 1) break;\n}\nSystem.out.print(i + \" \" + updates);\n```",
              "correct_option": "Prints: 1 1",
              "distractors": [
                "Prints: 2 2",
                "Prints: 1 2",
                "Prints: 3 3"
              ],
              "explanation": "The i=0 body completes and runs both update expressions once. The i=1 body breaks, so neither update runs again. 2/2 updates after break, 1/2 runs only one of the updates without justification, and 3/3 ignores termination. This contrasts with continue, which proceeds to a for-loop update.",
              "source": "https://docs.oracle.com/javase/specs/jls/se27/html/jls-14.html#jls-14.14.1.3",
              "card_type": "multiple_choice",
              "is_code": true,
              "coverage_gap": "Break suppresses the for update rather than merely skipping the body tail."
            },
            {
              "key": "do-break-skips-condition",
              "question": "Java 27, no preview features. Does a do-loop break evaluate its trailing condition? This code is inside a standard main(String[] args) method with no command-line arguments. No imports are required.\n\n```java\nint tests = 0;\ndo {\n  System.out.print(\"body \");\n  break;\n} while (++tests < 3);\nSystem.out.print(tests);\n```",
              "correct_option": "Prints: body 0",
              "distractors": [
                "Prints: body 1",
                "Prints: body body body 3",
                "Compilation fails: break cannot exit a do loop."
              ],
              "explanation": "break completes the loop abruptly and skips its condition, so tests remains zero. body 1 incorrectly evaluates the trailing test, repeated bodies ignore break, and do loops are valid break targets. Unlike the do-continue example, this transfer exits rather than returning to the test.",
              "source": "https://docs.oracle.com/javase/specs/jls/se27/html/jls-14.html#jls-14.13.1",
              "card_type": "multiple_choice",
              "is_code": true,
              "coverage_gap": "Do-loop break skips the trailing test; intentional contrast to continue."
            }
          ],
          "identity_card_keys": [
            "continue-sum",
            "break-sum",
            "continue-update"
          ]
        },
        {
          "key": "nested-labels",
          "title": "Nested loops and labeled transfers",
          "objective": "Identify the loop targeted by unlabeled/labeled break and continue without skipping or inventing iterations.",
          "cards": [
            {
              "key": "break-labeled-block",
              "question": "Java 27, no preview features. A label names an ordinary block. What happens? This code is inside a standard main(String[] args) method with no command-line arguments. No imports are required.\n\n```java\nsearch: {\n  System.out.print(\"A\");\n  if (args.length == 0) break search;\n  System.out.print(\"B\");\n}\nSystem.out.print(\"C\");\n```",
              "correct_option": "Prints: AC",
              "distractors": [
                "Prints: ABC",
                "Prints: A",
                "Compilation fails: a break label must name a loop."
              ],
              "explanation": "A labeled break may exit an enclosing labeled statement, including a block. With no arguments it skips B and resumes after the block, printing C. ABC ignores the transfer, A treats it as a method return, and break does not require a loop label. Continue has the stricter loop-target requirement.",
              "source": "https://docs.oracle.com/javase/specs/jls/se27/html/jls-14.html#jls-14.15",
              "card_type": "multiple_choice",
              "is_code": true,
              "coverage_gap": "Labeled break can exit an ordinary block rather than only a loop."
            },
            {
              "key": "continue-block-label-invalid",
              "question": "Java 27, no preview features. A continue targets a label on a block. What happens? This code is inside a standard main(String[] args) method with no command-line arguments. No imports are required.\n\n```java\nretry: {\n  if (args.length == 0) continue retry;\n  System.out.print(\"work\");\n}\n```",
              "correct_option": "Compilation fails: continue must target a labeled loop, not a block.",
              "distractors": [
                "Prints: work",
                "Completes normally without printing.",
                "Repeats the block forever."
              ],
              "explanation": "A continue target must be an enclosing while, do or for statement. retry labels a block, so the code is rejected. It cannot jump to the block start, silently skip it or fall through and print work. A labeled break could exit the block, but a continue cannot turn it into a loop.",
              "source": "https://docs.oracle.com/javase/specs/jls/se27/html/jls-14.html#jls-14.16",
              "card_type": "multiple_choice",
              "is_code": true,
              "coverage_gap": "Continue label target must be a loop even though break permits blocks."
            },
            {
              "key": "inner-label-continue-update",
              "question": "Java 27, no preview features. A labeled continue targets the inner for loop. What is printed? This code is inside a standard main(String[] args) method with no command-line arguments. No imports are required.\n\n```java\nint skipped = 0;\nint updates = 0;\nfor (int row = 0; row < 2; row++) {\n  inner: for (int col = 0; col < 2; col++, updates++) {\n    skipped++;\n    continue inner;\n  }\n}\nSystem.out.print(skipped + \" \" + updates);\n```",
              "correct_option": "Prints: 4 4",
              "distractors": [
                "Prints: 2 2",
                "Prints: 4 0",
                "Compilation fails: a label cannot target the nearest loop."
              ],
              "explanation": "continue inner selects the inner for update and next test. Its two iterations run for each of two rows, giving four body visits and four updates. 2/2 jumps to the outer loop instead, 4/0 skips required for updates, and labels can explicitly identify the nearest enclosing loop. Labels do not inherently mean an outer-loop transfer.",
              "source": "https://docs.oracle.com/javase/specs/jls/se27/html/jls-14.html#jls-14.16",
              "card_type": "multiple_choice",
              "is_code": true,
              "coverage_gap": "A labeled inner continue preserves that loop update and does not skip outer iterations."
            },
            {
              "key": "label-out-of-scope",
              "question": "Java 27, no preview features. A transfer tries to use a label after its statement has ended. What happens? This code is inside a standard main(String[] args) method with no command-line arguments. No imports are required.\n\n```java\nfinished: { System.out.print(\"A\"); }\nfor (int i = 0; i < 1; i++) {\n  break finished;\n}\n```",
              "correct_option": "Compilation fails: finished does not label an enclosing statement at the break.",
              "distractors": [
                "Prints: A",
                "Prints: AA",
                "Loops forever after printing A."
              ],
              "explanation": "A labeled break must refer to a label on a statement that encloses the break. The finished block has ended before the loop, so its label is unavailable as a transfer target. Compilation prevents any output; Java labels are not arbitrary goto destinations and cannot re-enter a completed block or create repetition.",
              "source": "https://docs.oracle.com/javase/specs/jls/se27/html/jls-14.html#jls-14.15",
              "card_type": "multiple_choice",
              "is_code": true,
              "coverage_gap": "Label availability depends on enclosing statement, not prior declaration order."
            }
          ],
          "identity_card_keys": [
            "break-outer",
            "break-inner",
            "continue-outer"
          ]
        },
        {
          "key": "switch-classic",
          "title": "Colon switch groups and fall-through",
          "objective": "Trace colon-style case groups, missing matches and null selectors.",
          "cards": [
            {
              "key": "default-middle-falls-forward",
              "question": "Java 27, no preview features. No case matches, and default is in the middle. What is printed? This code is inside a standard main(String[] args) method with no command-line arguments. No imports are required.\n\n```java\nint command = 9;\nswitch (command) {\n  case 1: System.out.print(\"A\"); break;\n  default: System.out.print(\"D\");\n  case 2: System.out.print(\"B\"); break;\n}\n```",
              "correct_option": "Prints: DB",
              "distractors": [
                "Prints: D",
                "Prints: ADB",
                "Prints: B"
              ],
              "explanation": "With no matching case, execution starts at default, wherever it appears. It then falls through to the later case group until break. D assumes default implicitly stops, ADB incorrectly executes earlier groups, and B skips the default body. Source placement changes fall-through, not matching priority.",
              "source": "https://docs.oracle.com/javase/specs/jls/se27/html/jls-14.html#jls-14.11.3",
              "card_type": "multiple_choice",
              "is_code": true,
              "coverage_gap": "Middle default location determines forward fall-through for an unmatched selector."
            },
            {
              "key": "shared-case-group",
              "question": "Java 27, no preview features. Two colon labels share one statement group. What is printed? This code is inside a standard main(String[] args) method with no command-line arguments. No imports are required.\n\n```java\nint mode = 2;\nswitch (mode) {\n  case 1:\n  case 2:\n    System.out.print(\"small\");\n    break;\n  default:\n    System.out.print(\"other\");\n}\n```",
              "correct_option": "Prints: small",
              "distractors": [
                "Prints: smallsmall",
                "Prints: other",
                "Compilation fails: each case label needs its own body."
              ],
              "explanation": "A statement group may have multiple labels. Either one or two enters the same body once, and break exits. smallsmall treats matching multiple labels as duplicated execution, other ignores the matching label, and labels need not each have independent statements. This is intentional sharing rather than missing-break fall-through between populated groups.",
              "source": "https://docs.oracle.com/javase/specs/jls/se27/html/jls-14.html#jls-14.11.1",
              "card_type": "multiple_choice",
              "is_code": true,
              "coverage_gap": "Multiple colon labels can intentionally share one body."
            },
            {
              "key": "selector-once-no-rematch",
              "question": "Java 27, no preview features. The selected case changes the selector variable. What happens? This code is inside a standard main(String[] args) method with no command-line arguments. No imports are required.\n\n```java\nint command = 1;\nswitch (command++) {\n  case 1: command = 3; System.out.print(\"one \"); break;\n  case 3: System.out.print(\"three \"); break;\n  default: System.out.print(\"other \");\n}\nSystem.out.print(command);\n```",
              "correct_option": "Prints: one 3",
              "distractors": [
                "Prints: three 3",
                "Prints: one three 3",
                "Prints: other 2"
              ],
              "explanation": "The selector expression is evaluated once and post-increment yields one, so case one is selected. Its assignment stores three without re-running matching, and break exits. three 3 uses the later value to choose the initial case, one three 3 rematches after mutation, and other 2 ignores the yielded selector and explicit assignment.",
              "source": "https://docs.oracle.com/javase/specs/jls/se27/html/jls-14.html#jls-14.11.3",
              "card_type": "multiple_choice",
              "is_code": true,
              "coverage_gap": "Selector evaluation happens once; mutations do not rematch cases."
            },
            {
              "key": "duplicate-folded-case-label",
              "question": "Java 27, no preview features. Two case expressions have the same constant value. What happens? This code is inside a standard main(String[] args) method with no command-line arguments. No imports are required.\n\n```java\nint command = 2;\nswitch (command) {\n  case 1 + 1: System.out.print(\"A\"); break;\n  case 2: System.out.print(\"B\"); break;\n}\n```",
              "correct_option": "Compilation fails: the two case constants both equal 2.",
              "distractors": [
                "Prints: A",
                "Prints: B",
                "Prints: AB"
              ],
              "explanation": "Case constants are compared by value after constant-expression evaluation. 1+1 and 2 are duplicate values, which is a compile-time error. Java does not choose the first, choose the later one, or treat the textually different expressions as two runnable cases. Replace the duplicate with a distinct value or share one label/body.",
              "source": "https://docs.oracle.com/javase/specs/jls/se27/html/jls-14.html#jls-14.11.1",
              "card_type": "multiple_choice",
              "is_code": true,
              "coverage_gap": "Duplicate case detection uses evaluated constant values rather than spelling."
            },
            {
              "key": "nonconstant-case-label",
              "question": "Java 27, no preview features. A runtime local is used as a case constant. What happens? This code is inside a standard main(String[] args) method with no command-line arguments. No imports are required.\n\n```java\nint expected = 2;\nint command = 2;\nswitch (command) {\n  case expected: System.out.print(\"match\"); break;\n  default: System.out.print(\"other\");\n}\n```",
              "correct_option": "Compilation fails: expected is not a constant expression usable as this case label.",
              "distractors": [
                "Prints: match",
                "Prints: other",
                "Throws IllegalArgumentException because the case is dynamic."
              ],
              "explanation": "An ordinary int local is not a constant variable even when initialized by a literal. Traditional constant case labels require constant expressions. This fails compilation before matching or printing, and no runtime rejection occurs. A final int initialized with a constant expression can qualify; a dynamic comparison belongs in other branching logic.",
              "source": "https://docs.oracle.com/javase/specs/jls/se27/html/jls-14.html#jls-14.11.1",
              "card_type": "multiple_choice",
              "is_code": true,
              "coverage_gap": "Runtime locals cannot substitute for constant case labels."
            },
            {
              "key": "string-case-content-matching",
              "question": "Java 27, no preview features. A String selector is a newly allocated object. What happens? This code is inside a standard main(String[] args) method with no command-line arguments. No imports are required.\n\n```java\nString command = new String(\"go\");\nswitch (command) {\n  case \"go\": System.out.print(\"run\"); break;\n  default: System.out.print(\"other\");\n}\n```",
              "correct_option": "Prints: run",
              "distractors": [
                "Prints: other",
                "Compilation fails: String selectors must be literals.",
                "Throws ClassCastException."
              ],
              "explanation": "String constant cases match using String content equality, not object identity. The new String contains go and therefore selects run. other applies ==-style identity reasoning, the compiler-error choice invents a literal-only selector restriction, and both selector and label are String, so no cast failure is involved.",
              "source": "https://docs.oracle.com/javase/specs/jls/se27/html/jls-14.html#jls-14.11.1.2",
              "card_type": "multiple_choice",
              "is_code": true,
              "coverage_gap": "String switch matching uses contents even for a non-interned selector."
            }
          ],
          "identity_card_keys": [
            "switch-fallthrough",
            "switch-no-match",
            "switch-null"
          ]
        },
        {
          "key": "switch-expression",
          "title": "Arrow switch rules, yield and exhaustiveness",
          "objective": "Predict non-falling-through arrow rules and return values from exhaustive switch expressions.",
          "cards": [
            {
              "key": "explicit-null-switch-case",
              "question": "Java 27, no preview features. An expression includes an explicit null case. What happens? This code is inside a standard main(String[] args) method with no command-line arguments. No imports are required.\n\n```java\nString command = null;\nString result = switch (command) {\n  case null -> \"missing\";\n  case \"go\" -> \"run\";\n  default -> \"other\";\n};\nSystem.out.print(result);\n```",
              "correct_option": "Prints: missing",
              "distractors": [
                "Throws NullPointerException.",
                "Prints: other",
                "Compilation fails: null cases require preview features."
              ],
              "explanation": "An explicit case null handles this null selector, so the expression yields missing. default alone would not handle null, but it is not the selected label here. Null handling in reference switch is available without preview for this Java target. The exception choice ignores the explicit handler, and other wrongly chooses default.",
              "source": "https://docs.oracle.com/javase/specs/jls/se27/html/jls-15.html#jls-15.28.2",
              "card_type": "multiple_choice",
              "is_code": true,
              "coverage_gap": "Explicit null case changes behavior compared with starter null selector without handler."
            },
            {
              "key": "grouped-arrow-labels",
              "question": "Java 27, no preview features. Several constants share one arrow rule. What is printed? This code is inside a standard main(String[] args) method with no command-line arguments. No imports are required.\n\n```java\nint code = 3;\nString group = switch (code) {\n  case 1, 2, 3 -> \"small\";\n  default -> \"large\";\n};\nSystem.out.print(group);\n```",
              "correct_option": "Prints: small",
              "distractors": [
                "Prints: smallsmallsmall",
                "Prints: large",
                "Compilation fails: arrow rules cannot have multiple case constants."
              ],
              "explanation": "A comma-separated list of constants labels one arrow rule. Matching three evaluates its expression once and yields small. It does not execute once for every constant, skip the matching rule, or require separate arrows. Grouping provides shared behavior without colon-style fall-through.",
              "source": "https://docs.oracle.com/javase/specs/jls/se27/html/jls-15.html#jls-15.28.1",
              "card_type": "multiple_choice",
              "is_code": true,
              "coverage_gap": "Grouped arrow constants select one result once."
            },
            {
              "key": "selected-throw-arm",
              "question": "Java 27, no preview features. An exhaustive expression selects a throwing rule. What happens? This code is inside a standard main(String[] args) method with no command-line arguments. No imports are required.\n\n```java\nint code = -1;\nint result = switch (code) {\n  case -1 -> throw new IllegalStateException(\"invalid\");\n  default -> 10;\n};\nSystem.out.print(result);\n```",
              "correct_option": "Throws IllegalStateException.",
              "distractors": [
                "Prints: 10",
                "Prints: -1",
                "Compilation fails: every switch rule must yield a value."
              ],
              "explanation": "A switch-expression rule may throw rather than produce a value. When selected, it completes the expression abruptly and the assignment/print are not reached. Ten would select the unchosen default, minus one confuses selector with result, and the compile-error choice excludes a legal throwing rule. Exhaustiveness does not imply every execution completes normally.",
              "source": "https://docs.oracle.com/javase/specs/jls/se27/html/jls-15.html#jls-15.28.2",
              "card_type": "multiple_choice",
              "is_code": true,
              "coverage_gap": "Switch expression arms may terminate by throwing instead of yielding."
            },
            {
              "key": "block-missing-yield",
              "question": "Java 27, no preview features. One switch-expression block reaches its end without a value. What happens? This code is inside a standard main(String[] args) method with no command-line arguments. No imports are required.\n\n```java\nint code = 1;\nint result = switch (code) {\n  case 1 -> { int local = 7; }\n  default -> 0;\n};\nSystem.out.print(result);\n```",
              "correct_option": "Compilation fails: the selected rule block can complete normally without yielding.",
              "distractors": [
                "Prints: 7",
                "Prints: 0",
                "Throws IllegalStateException because no value was produced."
              ],
              "explanation": "Coverage of all selectors does not fix a block that reaches its end without yielding a value. The local declaration is not an implicit result. Java rejects this path at compile time; it neither returns seven automatically, substitutes the default zero, nor delays detection to an exception. Add an appropriate yield or throwing path.",
              "source": "https://docs.oracle.com/javase/specs/jls/se27/html/jls-15.html#jls-15.28.1",
              "card_type": "multiple_choice",
              "is_code": true,
              "coverage_gap": "Exhaustive labels and value-producing rule blocks are separate requirements."
            },
            {
              "key": "enum-exhaustive-without-default",
              "question": "Java 27, no preview features. Every enum constant has a rule. Is a default required? This code is inside a standard main(String[] args) method with no command-line arguments. No imports are required.\n\n```java\nenum State { OPEN, CLOSED }\nState state = State.CLOSED;\nint result = switch (state) {\n  case OPEN -> 1;\n  case CLOSED -> 0;\n};\nSystem.out.print(result);\n```",
              "correct_option": "Prints: 0",
              "distractors": [
                "Prints: 1",
                "Compilation fails: all switch expressions require a default label.",
                "Throws NullPointerException."
              ],
              "explanation": "Listing every constant of this enum establishes exhaustiveness without default. CLOSED selects zero. One selects the wrong constant, a mandatory-default rule is too strong, and state is not null. This checks source-level coverage for the shown enum; separately compiled changes to enum definitions require additional compatibility reasoning.",
              "source": "https://docs.oracle.com/javase/specs/jls/se27/html/jls-15.html#jls-15.28.1",
              "card_type": "multiple_choice",
              "is_code": true,
              "coverage_gap": "Complete enum constant coverage can make an expression exhaustive without default."
            },
            {
              "key": "yield-exits-enclosing-expression",
              "question": "Java 27, no preview features. A yield executes inside a loop in a switch-expression rule. What is printed? This code is inside a standard main(String[] args) method with no command-line arguments. No imports are required.\n\n```java\nint result = switch (1) {\n  default -> {\n    for (int i = 0; i < 4; i++) {\n      if (i == 2) yield i * 10;\n    }\n    yield -1;\n  }\n};\nSystem.out.print(result);\n```",
              "correct_option": "Prints: 20",
              "distractors": [
                "Prints: -1",
                "Prints: 2",
                "Compilation fails: yield cannot occur inside a loop."
              ],
              "explanation": "yield transfers the value to the enclosing switch expression and exits the rule, including the nested loop. At i=2 it supplies twenty; the later yield is not executed. Minus one treats yield as only a loop transfer, two ignores multiplication, and the nested yield is legal when its target is this enclosing switch expression.",
              "source": "https://docs.oracle.com/javase/specs/jls/se27/html/jls-14.html#jls-14.21",
              "card_type": "multiple_choice",
              "is_code": true,
              "coverage_gap": "Yield exits an enclosing switch expression through a nested loop."
            }
          ],
          "identity_card_keys": [
            "arrow-no-fallthrough",
            "block-yield",
            "exhaustive-expression"
          ]
        },
        {
          "key": "scope-reachability",
          "title": "Scope and statement reachability",
          "objective": "Respect for-variable scope and distinguish Java reachability rules for while and if.",
          "cards": [
            {
              "key": "statement-after-unconditional-return",
              "question": "Java 27, no preview features. A method has work after an unconditional return. What happens? This code is inside a standard main(String[] args) method with no command-line arguments. No imports are required.\n\n```java\nclass Handler {\n  int handle() {\n    return 1;\n    System.out.print(\"late\");\n  }\n}\nSystem.out.print(new Handler().handle());\n```",
              "correct_option": "Compilation fails: the print statement after return is unreachable.",
              "distractors": [
                "Prints: 1",
                "Prints: late1",
                "Prints: 1late"
              ],
              "explanation": "An unconditional return cannot complete normally, leaving the following statement unreachable under Java rules. The method is rejected even though a human can predict a returned value. Neither one nor any late output occurs; the compiler does not silently discard this unreachable statement. A conditional return can have a reachable continuation on its other path.",
              "source": "https://docs.oracle.com/javase/specs/jls/se27/html/jls-14.html#jls-14.22",
              "card_type": "multiple_choice",
              "is_code": true,
              "coverage_gap": "Unconditional method return makes the following statement unreachable."
            },
            {
              "key": "infinite-while-no-exit-reachability",
              "question": "Java 27, no preview features. A constant infinite loop has no exit. What happens? This code is inside a standard main(String[] args) method with no command-line arguments. No imports are required.\n\n```java\nwhile (true) { }\nSystem.out.print(\"done\");\n```",
              "correct_option": "Compilation fails: the statement after the loop is unreachable.",
              "distractors": [
                "Runs forever without printing.",
                "Prints: done",
                "Compilation fails: empty while bodies are forbidden."
              ],
              "explanation": "A while with constant true condition and no reachable break cannot complete normally. The following print is therefore unreachable and compilation fails. Running forever would describe the loop in isolation, but ignores the rejected following statement. done assumes an exit that is absent; empty bodies themselves are legal.",
              "source": "https://docs.oracle.com/javase/specs/jls/se27/html/jls-14.html#jls-14.22",
              "card_type": "multiple_choice",
              "is_code": true,
              "coverage_gap": "Constant infinite loop without break makes later code unreachable."
            },
            {
              "key": "loop-break-definite-assignment",
              "question": "Java 27, no preview features. A local is assigned before the only loop exit. What happens? This code is inside a standard main(String[] args) method with no command-line arguments. No imports are required.\n\n```java\nint limit;\nwhile (true) {\n  limit = 7;\n  break;\n}\nSystem.out.print(limit);\n```",
              "correct_option": "Prints: 7",
              "distractors": [
                "Compilation fails: loop assignments never establish definite assignment.",
                "Compilation fails: code after while(true) is always unreachable.",
                "Prints: 0"
              ],
              "explanation": "The reachable break allows this constant-true loop to complete normally. Every path that exits through that break has assigned limit, so the subsequent read is definitely assigned. Loop assignments can count, a reachable break changes reachability after while(true), and locals do not default to zero. The guaranteed exit matters more than the appearance of an infinite condition.",
              "source": "https://docs.oracle.com/javase/specs/jls/se27/html/jls-16.html#jls-16.2.10",
              "card_type": "multiple_choice",
              "is_code": true,
              "coverage_gap": "Reachable break from while(true) proves both exit and local assignment."
            },
            {
              "key": "colon-case-shared-local-scope",
              "question": "Java 27, no preview features. Separate colon cases declare the same local name. What happens? This code is inside a standard main(String[] args) method with no command-line arguments. No imports are required.\n\n```java\nint code = 1;\nswitch (code) {\n  case 1:\n    int value = 10;\n    System.out.print(value);\n    break;\n  case 2:\n    int value = 20;\n    System.out.print(value);\n    break;\n}\n```",
              "correct_option": "Compilation fails: colon case labels do not create separate scopes for value.",
              "distractors": [
                "Prints: 10",
                "Prints: 20",
                "Throws IllegalStateException because value has two declarations."
              ],
              "explanation": "A case label alone does not start a new block scope. The two local declarations conflict within the switch block, regardless of which selector value executes at runtime. Neither ten nor twenty prints, and duplicate-local detection is compile-time rather than a runtime exception. Put each case body in its own braces when independent locals are needed.",
              "source": "https://docs.oracle.com/javase/specs/jls/se27/html/jls-14.html#jls-14.11.1",
              "card_type": "multiple_choice",
              "is_code": true,
              "coverage_gap": "Colon case groups share local scope unless explicit blocks separate declarations."
            }
          ],
          "identity_card_keys": [
            "for-scope",
            "while-false-unreachable",
            "if-false-reachable"
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

-- Read-only summary, scoped to the project and deck resolved above.
-- Uses transaction-local seed context so renamed topics and explicit overrides
-- are counted correctly. Counts include pre-existing/user-authored content.
SELECT p.id AS project_id, p.name AS project, d.id AS deck_id, d.name AS topic,
       (SELECT count(*) FROM public.concepts c WHERE c.deck_id = d.id) AS concepts,
       (SELECT count(*) FROM public.cards q WHERE q.deck_id = d.id) AS questions,
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
