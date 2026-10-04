-- Java 27 Topic 1 depth batch 2: 40 NEW MC cards, 6 reused concepts, 0 new concepts.
-- After starter + depth batches 1 and 2: Topic 1 has 9 concepts / 96 questions.
-- This batch alone on an empty project: 1 topic / 6 concepts / 40 questions.
-- Generated from cards/pathways/java_types_depth_2.json. Run in Supabase SQL Editor.
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
  "id": "java-types-depth-batch-2",
  "version": 1,
  "java_release": 27,
  "preview_features": false,
  "topics": [
    {
      "key": "types",
      "title": "Types, variables and operators",
      "aliases": [
        "Variables",
        "Types and variables",
        "Variables & Data Types"
      ],
      "objective": "Understand primitive/reference types, conversions, expressions and operator edge cases.",
      "concepts": [
        {
          "key": "values",
          "title": "Primitive values and references",
          "objective": "Distinguish copied primitive values from shared object references and understand char values.",
          "cards": [
            {
              "key": "reassign-alias-detaches",
              "question": "Java 27 without preview features. A reference alias is reassigned to a new object. What is printed? The code is inside a standard main(String[] args) method; assume no command-line arguments. All required types use java.lang unless fully qualified.\n\n```java\nclass Box { int value; Box(int v) { value = v; } }\nBox original = new Box(3);\nBox alias = original;\nalias = new Box(8);\nalias.value = 9;\nSystem.out.print(original.value + \" \" + alias.value);\n```",
              "correct_option": "Prints: 3 9",
              "distractors": [
                "Prints: 9 9",
                "Prints: 3 8",
                "Prints: 8 9"
              ],
              "explanation": "The initial assignment shares one object, but reassigning alias changes only that variable to reference a newly constructed object. Mutating it no longer affects original. Therefore original stays three and alias becomes nine. 9/9 assumes permanent coupling of variables, 3/8 ignores mutation, and 8/9 incorrectly changes original when a separate reference is reassigned.",
              "source": "https://docs.oracle.com/javase/specs/jls/se27/html/jls-4.html#jls-4.12.2",
              "card_type": "multiple_choice",
              "is_code": true,
              "coverage_gap": "Reference reassignment separates a former alias instead of mutating the shared object."
            },
            {
              "key": "null-instanceof-false",
              "question": "Java 27 without preview features. A nullable Object is tested with instanceof. What happens? The code is inside a standard main(String[] args) method; assume no command-line arguments. All required types use java.lang unless fully qualified.\n\n```java\nObject candidate = null;\nSystem.out.print(candidate instanceof String);\n```",
              "correct_option": "Prints: false",
              "distractors": [
                "Prints: true",
                "Throws NullPointerException.",
                "Compilation fails: Object cannot be tested against String."
              ],
              "explanation": "An ordinary reference instanceof test yields false when its operand is null. It does not dereference candidate, and the Object/String type relationship makes the test legal. true would incorrectly treat a legal null cast as membership in a runtime type; NullPointerException and the compile-error option misstate the test. This makes instanceof useful for type checks that also reject null.",
              "source": "https://docs.oracle.com/javase/specs/jls/se27/html/jls-15.html#jls-15.20.2",
              "card_type": "multiple_choice",
              "is_code": true,
              "coverage_gap": "Null reference instanceof is false without dereferencing."
            }
          ],
          "identity_card_keys": [
            "primitive-copy",
            "reference-copy",
            "unsigned-char",
            "final-reference-mutation",
            "reference-cast-runtime",
            "null-cast-safe"
          ]
        },
        {
          "key": "literals-inference",
          "title": "Literals and local type inference",
          "objective": "Choose valid numeric literal forms and understand that var infers a fixed static type.",
          "cards": [
            {
              "key": "var-multiple-declarators",
              "question": "Java 27 without preview features. A developer combines inferred local declarations. What happens? The code is inside a standard main(String[] args) method; assume no command-line arguments. All required types use java.lang unless fully qualified.\n\n```java\nvar first = 1, second = 2;\nSystem.out.print(first + second);\n```",
              "correct_option": "Compilation fails: a var declaration cannot contain multiple declarators.",
              "distractors": [
                "Prints: 3",
                "Prints: 12",
                "Compilation fails: var cannot infer int from integer literals."
              ],
              "explanation": "A local declaration using var is restricted to one variable declarator. Each literal independently supplies enough type information, but combining them in this syntax is disallowed. Two separate var statements work. There is no sum or concatenation output, and inferring int is not the problem.",
              "source": "https://docs.oracle.com/javase/specs/jls/se27/html/jls-14.html#jls-14.4",
              "card_type": "multiple_choice",
              "is_code": true,
              "coverage_gap": "Var restriction on multiple declarators."
            },
            {
              "key": "var-array-initializer-no-target",
              "question": "Java 27 without preview features. A shorthand array initializer is used with var. What happens? The code is inside a standard main(String[] args) method; assume no command-line arguments. All required types use java.lang unless fully qualified.\n\n```java\nvar points = {1, 2, 3};\nSystem.out.print(points.length);\n```",
              "correct_option": "Compilation fails: an array initializer alone cannot initialize a var local.",
              "distractors": [
                "Prints: 3",
                "Prints: 6",
                "Compilation fails: var can never infer an array type."
              ],
              "explanation": "The shorthand array initializer needs an explicit array target type; it cannot itself be the initializer for var. Use int[] points = {1, 2, 3}, or var points = new int[] {1, 2, 3}. The shown code prints neither length nor sum. Arrays can be inferred with a suitable array-creation expression, so the blanket array prohibition is wrong.",
              "source": "https://docs.oracle.com/javase/specs/jls/se27/html/jls-14.html#jls-14.4",
              "card_type": "multiple_choice",
              "is_code": true,
              "coverage_gap": "Var restriction on target-dependent shorthand array initializer."
            }
          ],
          "identity_card_keys": [
            "long-literal",
            "var-fixed-type",
            "var-null",
            "radix-leading-zero",
            "underscore-prefix",
            "float-literal-suffix",
            "var-byte-inference"
          ]
        },
        {
          "key": "initialization",
          "title": "Initialization and definite assignment",
          "objective": "Distinguish default-initialized fields from local variables that must be assigned on every reachable path.",
          "cards": [
            {
              "key": "and-true-path-definite-assignment",
              "question": "Java 27 without preview features. Does a true && path establish assignment for the body? The code is inside a standard main(String[] args) method; assume no command-line arguments. All required types use java.lang unless fully qualified.\n\n```java\nint parsed;\nboolean supplied = args.length > 0;\nif (supplied && (parsed = 7) > 0) System.out.print(parsed);\nelse System.out.print(\"none\");\n```",
              "correct_option": "Prints: none",
              "distractors": [
                "Compilation fails: parsed is unassigned inside the if body.",
                "Prints: 7",
                "Prints: 0"
              ],
              "explanation": "Entering the true body implies both && operands ran and parsed was assigned. The body is therefore legal even though parsed is not assigned on every overall path. With no arguments supplied is false and the else prints none. Seven assumes the true path is taken, zero assumes a local default, and the compiler-error option ignores path-sensitive assignment.",
              "source": "https://docs.oracle.com/javase/specs/jls/se27/html/jls-16.html#jls-16.1.2",
              "card_type": "multiple_choice",
              "is_code": true,
              "coverage_gap": "Definite assignment conditional on && evaluating true."
            },
            {
              "key": "or-true-path-not-definitely-assigned",
              "question": "Java 27 without preview features. Does a true || path establish assignment for the body? The code is inside a standard main(String[] args) method; assume no command-line arguments. All required types use java.lang unless fully qualified.\n\n```java\nint parsed;\nboolean cached = args.length == 0;\nif (cached || (parsed = 7) > 0) System.out.print(parsed);\n```",
              "correct_option": "Compilation fails: the true branch can be entered without assigning parsed.",
              "distractors": [
                "Prints: 7",
                "Prints: 0",
                "Compiles and prints nothing because the assignment is skipped."
              ],
              "explanation": "When cached is true, || skips the assignment yet still enters the body. parsed is not definitely assigned there, so compilation fails. No local default supplies zero; seven assumes the skipped operand ran; and printing nothing is wrong because the source is rejected rather than becoming a legal empty path.",
              "source": "https://docs.oracle.com/javase/specs/jls/se27/html/jls-16.html#jls-16.1.3",
              "card_type": "multiple_choice",
              "is_code": true,
              "coverage_gap": "A true || path can bypass the assigning operand."
            },
            {
              "key": "nonconstant-true-not-flow-proof",
              "question": "Java 27 without preview features. A local Boolean is initialized to true. Does the compiler treat it as a constant? The code is inside a standard main(String[] args) method; assume no command-line arguments. All required types use java.lang unless fully qualified.\n\n```java\nboolean available = true;\nint quota;\nif (available) quota = 8;\nSystem.out.print(quota);\n```",
              "correct_option": "Compilation fails: available is not a constant expression proving assignment.",
              "distractors": [
                "Prints: 8",
                "Prints: 0",
                "Throws IllegalStateException because quota is uninitialized."
              ],
              "explanation": "Definite assignment does not track an ordinary boolean local as a constant merely from its initializer. The if has a potential false path with no quota assignment, so the later read is rejected. Eight follows runtime intuition but lacks the required compile-time proof, zero invents a default, and uninitialized-local reads are prevented at compilation rather than failing at runtime.",
              "source": "https://docs.oracle.com/javase/specs/jls/se27/html/jls-16.html#jls-16.2.7",
              "card_type": "multiple_choice",
              "is_code": true,
              "coverage_gap": "Ordinary true-valued local versus constant-expression flow proof."
            },
            {
              "key": "abrupt-else-proves-assignment",
              "question": "Java 27 without preview features. An invalid-input branch throws instead of assigning. What happens? The code is inside a standard main(String[] args) method; assume no command-line arguments. All required types use java.lang unless fully qualified.\n\n```java\nint limit;\nif (args.length == 0) limit = 8;\nelse throw new IllegalArgumentException(\"unexpected arguments\");\nSystem.out.print(limit);\n```",
              "correct_option": "Prints: 8",
              "distractors": [
                "Compilation fails: the else branch does not assign limit.",
                "Prints: 0",
                "Throws IllegalArgumentException with no arguments."
              ],
              "explanation": "Only the branch that assigns limit can reach the print; the else completes abruptly by throwing. Definite assignment is therefore satisfied on every path reaching the read. With no arguments it prints eight. The else need not assign before throwing, locals do not default to zero, and the exceptional branch is not selected here.",
              "source": "https://docs.oracle.com/javase/specs/jls/se27/html/jls-16.html#jls-16.2.7",
              "card_type": "multiple_choice",
              "is_code": true,
              "coverage_gap": "Abrupt completion removes an unassigned path to a later read."
            },
            {
              "key": "blank-final-second-assignment",
              "question": "Java 27 without preview features. A blank final local is assigned and then adjusted. What happens? The code is inside a standard main(String[] args) method; assume no command-line arguments. All required types use java.lang unless fully qualified.\n\n```java\nfinal int limit;\nlimit = 8;\nlimit = 9;\nSystem.out.print(limit);\n```",
              "correct_option": "Compilation fails: the second assignment to limit is forbidden.",
              "distractors": [
                "Prints: 9",
                "Prints: 8",
                "Throws IllegalStateException on the second assignment."
              ],
              "explanation": "A blank final local may receive its first value after declaration, but it cannot receive a second value. The second assignment violates definite-unassignment requirements and fails compilation. It is not ignored to keep eight, does not replace the value with nine, and does not rely on a runtime exception to enforce final.",
              "source": "https://docs.oracle.com/javase/specs/jls/se27/html/jls-16.html#jls-16",
              "card_type": "multiple_choice",
              "is_code": true,
              "coverage_gap": "Definite unassignment prevents a second blank-final write."
            },
            {
              "key": "blank-final-loop-repeat",
              "question": "Java 27 without preview features. A final local is assigned in a loop that may repeat. What happens? The code is inside a standard main(String[] args) method; assume no command-line arguments. All required types use java.lang unless fully qualified.\n\n```java\nfinal int limit;\nfor (int i = 0; i < 2; i++) {\n  limit = i;\n}\nSystem.out.print(\"done\");\n```",
              "correct_option": "Compilation fails: loop iterations can assign limit more than once.",
              "distractors": [
                "Prints: done",
                "Compilation fails: final locals must have declaration initializers.",
                "Throws IllegalStateException during the second iteration."
              ],
              "explanation": "A blank final may be assigned separately, but must be definitely unassigned before each write. A loop with a possible later iteration does not satisfy that condition. Compilation therefore fails instead of printing done or throwing at runtime. The issue is repeated assignment, not a blanket requirement for an initializer at declaration.",
              "source": "https://docs.oracle.com/javase/specs/jls/se27/html/jls-16.html#jls-16.2.12",
              "card_type": "multiple_choice",
              "is_code": true,
              "coverage_gap": "Blank-final assignment across a potentially repeating loop."
            },
            {
              "key": "conditional-both-operands-assign",
              "question": "Java 27 without preview features. Both value-producing alternatives assign a local. What happens? The code is inside a standard main(String[] args) method; assume no command-line arguments. All required types use java.lang unless fully qualified.\n\n```java\nint chosen;\nboolean primary = args.length == 0;\nint result = primary ? (chosen = 3) : (chosen = 6);\nSystem.out.print(result + \" \" + chosen);\n```",
              "correct_option": "Prints: 3 3",
              "distractors": [
                "Compilation fails: assignments inside ?: do not count toward definite assignment.",
                "Prints: 3 6",
                "Prints: 6 6"
              ],
              "explanation": "Exactly one alternative runs, and each alternative assigns chosen. It is definitely assigned after the conditional. With no arguments the primary branch assigns and yields three, so both result and chosen are three. Assignment expressions count in flow analysis; the alternatives do not both run; and the fallback is not selected.",
              "source": "https://docs.oracle.com/javase/specs/jls/se27/html/jls-16.html#jls-16.1.5",
              "card_type": "multiple_choice",
              "is_code": true,
              "coverage_gap": "Definite assignment after both conditional-expression alternatives assign."
            },
            {
              "key": "short-circuit-assignment-not-after",
              "question": "Java 27 without preview features. An assignment is inside a short-circuited operand. What happens at the later read? The code is inside a standard main(String[] args) method; assume no command-line arguments. All required types use java.lang unless fully qualified.\n\n```java\nint quota;\nboolean checked = false && (quota = 8) > 0;\nSystem.out.print(quota);\n```",
              "correct_option": "Compilation fails: the skipped operand does not definitely assign quota.",
              "distractors": [
                "Prints: 8",
                "Prints: 0",
                "Compiles and prints false."
              ],
              "explanation": "The left operand is false, so the assigning right operand never runs. Definite assignment after the whole expression cannot rely on that skipped assignment. The subsequent read is rejected. Eight assumes eager evaluation, zero assumes a local default, and false is the value of checked rather than a valid output for the unassigned quota read.",
              "source": "https://docs.oracle.com/javase/specs/jls/se27/html/jls-16.html#jls-16.1.2",
              "card_type": "multiple_choice",
              "is_code": true,
              "coverage_gap": "Assignment inside && does not necessarily establish assignment afterward."
            }
          ],
          "identity_card_keys": [
            "local-unassigned",
            "field-defaults",
            "conditional-assignment",
            "final-constant-versus-local",
            "blank-final-branches",
            "final-not-constant-expression"
          ]
        },
        {
          "key": "promotion",
          "title": "Numeric promotion and narrowing assignments",
          "objective": "Predict promoted arithmetic types, constant-expression narrowing and compound-assignment conversions.",
          "cards": [
            {
              "key": "argument-no-constant-narrowing",
              "question": "Java 27 without preview features. A byte-taking API receives a small literal. What happens? The code is inside a standard main(String[] args) method; assume no command-line arguments. All required types use java.lang unless fully qualified.\n\n```java\nclass Device { void setLevel(byte level) { System.out.print(level); } }\nbyte local = 12;\nnew Device().setLevel(12);\n```",
              "correct_option": "Compilation fails: the method argument cannot implicitly narrow int to byte.",
              "distractors": [
                "Prints: 12",
                "Compilation fails: the local byte initializer cannot narrow int to byte.",
                "Throws ArithmeticException because a cast is missing."
              ],
              "explanation": "The local assignment accepts the representable int constant 12, but invocation conversion does not include this constant narrowing. The call is rejected even though the value fits. The local declaration is legal, no output is produced, and a missing compile-time conversion cannot cause a runtime ArithmeticException. Pass local or explicitly cast the argument after checking its range.",
              "source": "https://docs.oracle.com/javase/specs/jls/se27/html/jls-5.html#jls-5.3",
              "card_type": "multiple_choice",
              "is_code": true,
              "coverage_gap": "Invocation versus assignment constant narrowing."
            },
            {
              "key": "argument-no-narrow-and-box",
              "question": "Java 27 without preview features. A wrapper-taking API receives a literal. What happens? The code is inside a standard main(String[] args) method; assume no command-line arguments. All required types use java.lang unless fully qualified.\n\n```java\nclass Device { void setLevel(Byte level) { System.out.print(level); } }\nByte local = 12;\nnew Device().setLevel(12);\n```",
              "correct_option": "Compilation fails: the int argument cannot narrow and box to Byte in invocation context.",
              "distractors": [
                "Prints: 12",
                "Compilation fails: assigning 12 to local cannot narrow and box to Byte.",
                "Throws ClassCastException while converting Integer to Byte."
              ],
              "explanation": "Assignment can narrow a representable int constant and then box it to Byte, making local legal. A method argument has invocation context, which lacks that narrowing-and-boxing combination. The call therefore fails compilation. There is no print or runtime cast failure, and the legal assignment must not be confused with the method argument.",
              "source": "https://docs.oracle.com/javase/specs/jls/se27/html/jls-5.html#jls-5.3",
              "card_type": "multiple_choice",
              "is_code": true,
              "coverage_gap": "Narrowing-plus-boxing differs between assignment and invocation."
            },
            {
              "key": "unary-plus-promotes-byte",
              "question": "Java 27 without preview features. Does unary plus preserve a byte expression type? The code is inside a standard main(String[] args) method; assume no command-line arguments. All required types use java.lang unless fully qualified.\n\n```java\nbyte delta = 4;\nvar positive = +delta;\nSystem.out.print(((Object) positive).getClass().getSimpleName());\n```",
              "correct_option": "Prints: Integer",
              "distractors": [
                "Prints: Byte",
                "Prints: Short",
                "Compilation fails: unary plus cannot be applied to byte."
              ],
              "explanation": "Unary numeric promotion changes byte to int before unary plus. var therefore infers int; converting that value to Object boxes it as Integer. Byte and Short are incorrect because the promoted type is int, and unary plus is legal. This differs from copying a byte variable directly into var, which preserves the byte type.",
              "source": "https://docs.oracle.com/javase/specs/jls/se27/html/jls-15.html#jls-15.15.3",
              "card_type": "multiple_choice",
              "is_code": true,
              "coverage_gap": "Unary promotion versus direct initializer inference."
            },
            {
              "key": "char-short-mixed-promotion",
              "question": "Java 27 without preview features. A character code and signed offset are added. What happens? The code is inside a standard main(String[] args) method; assume no command-line arguments. All required types use java.lang unless fully qualified.\n\n```java\nchar code = 32768;\nshort offset = -1;\nvar adjusted = code + offset;\nSystem.out.print(((Object) adjusted).getClass().getSimpleName() + \" \" + adjusted);\n```",
              "correct_option": "Prints: Integer 32767",
              "distractors": [
                "Prints: Character 32767",
                "Prints: Short 32767",
                "Prints: Integer -32769"
              ],
              "explanation": "Binary numeric promotion converts both char and short to int. char is unsigned, so its 32768 value remains positive; adding -1 gives 32767. The inferred type is int, boxed as Integer for getClass. Neither Character nor Short is the arithmetic result type, and interpreting char as a negative signed short gives the wrong sum.",
              "source": "https://docs.oracle.com/javase/specs/jls/se27/html/jls-5.html#jls-5.6",
              "card_type": "multiple_choice",
              "is_code": true,
              "coverage_gap": "Mixed unsigned char and signed short arithmetic."
            },
            {
              "key": "char-short-same-bits-different-value",
              "question": "Java 27 without preview features. A char is explicitly narrowed to short. What happens? The code is inside a standard main(String[] args) method; assume no command-line arguments. All required types use java.lang unless fully qualified.\n\n```java\nchar code = 32768;\nshort signed = (short) code;\nSystem.out.print((int) code + \" \" + (int) signed);\n```",
              "correct_option": "Prints: 32768 -32768",
              "distractors": [
                "Prints: 32768 32768",
                "Prints: -32768 -32768",
                "Throws ArithmeticException because the value is outside short range."
              ],
              "explanation": "The explicit cast retains the low 16 bits, which short interprets as a signed two-complement value. The char remains unsigned and widens to 32768, while the short sign-extends to -32768. A cast does not mutate code, does not preserve the out-of-range positive value in short, and does not throw on integral narrowing.",
              "source": "https://docs.oracle.com/javase/specs/jls/se27/html/jls-5.html#jls-5.1.3",
              "card_type": "multiple_choice",
              "is_code": true,
              "coverage_gap": "Char-to-short narrowing and different widening rules."
            },
            {
              "key": "compound-saves-value-before-rhs",
              "question": "Java 27 without preview features. The right side changes the same accumulator. What is printed? The code is inside a standard main(String[] args) method; assume no command-line arguments. All required types use java.lang unless fully qualified.\n\n```java\nint subtotal = 10;\nsubtotal += (subtotal = 3);\nSystem.out.print(subtotal);\n```",
              "correct_option": "Prints: 13",
              "distractors": [
                "Prints: 6",
                "Prints: 3",
                "Prints: 10"
              ],
              "explanation": "Compound assignment remembers the original left-side value, 10, before evaluating the right side. The inner assignment stores and yields 3; the outer addition then stores 13. Reading the changed subtotal again would incorrectly yield 6, leaving the inner assignment alone would yield 3, and ignoring the right side would leave 10. Avoid such expressions in production because the ordering is easy to misread.",
              "source": "https://docs.oracle.com/javase/specs/jls/se27/html/jls-15.html#jls-15.26.2",
              "card_type": "multiple_choice",
              "is_code": true,
              "coverage_gap": "Compound assignment saves old value when RHS mutates LHS."
            },
            {
              "key": "float-rounded-before-double",
              "question": "Java 27 without preview features. Does widening an already rounded float recover a decimal literal? The code is inside a standard main(String[] args) method; assume no command-line arguments. All required types use java.lang unless fully qualified.\n\n```java\ndouble direct = 0.1;\ndouble throughFloat = 0.1f;\nSystem.out.print(direct == throughFloat);\n```",
              "correct_option": "Prints: false",
              "distractors": [
                "Prints: true",
                "Compilation fails: float cannot implicitly widen to double.",
                "Throws ArithmeticException because 0.1 is not exactly representable."
              ],
              "explanation": "The float literal first rounds to a float approximation. Widening preserves that float value exactly as a double, while the unsuffixed literal rounds directly to a different double approximation. Their values differ. Widening is legal but cannot restore discarded precision; finite rounding does not throw ArithmeticException.",
              "source": "https://docs.oracle.com/javase/specs/jls/se27/html/jls-5.html#jls-5.1.2",
              "card_type": "multiple_choice",
              "is_code": true,
              "coverage_gap": "Float rounding persists after widening to double."
            },
            {
              "key": "boxing-then-reference-widening",
              "question": "Java 27 without preview features. An int is assigned to a Number reference. What happens? The code is inside a standard main(String[] args) method; assume no command-line arguments. All required types use java.lang unless fully qualified.\n\n```java\nint incoming = 9;\nNumber stored = incoming;\nSystem.out.print(stored.getClass().getSimpleName() + \" \" + stored);\n```",
              "correct_option": "Prints: Integer 9",
              "distractors": [
                "Prints: Long 9",
                "Prints: Double 9.0",
                "Compilation fails: int cannot be assigned to Number."
              ],
              "explanation": "Assignment boxes int as Integer and then widens that reference to Number. Number is a superclass of Integer; it does not select a different numeric wrapper or convert the magnitude to long/double. Thus Integer 9 is printed, not Long 9 or Double 9.0, and the assignment is legal.",
              "source": "https://docs.oracle.com/javase/specs/jls/se27/html/jls-5.html#jls-5.2",
              "card_type": "multiple_choice",
              "is_code": true,
              "coverage_gap": "Boxing followed by widening reference conversion."
            },
            {
              "key": "long-plus-float-result-type",
              "question": "Java 27 without preview features. A long count is added to a float measurement. Which type results? The code is inside a standard main(String[] args) method; assume no command-line arguments. All required types use java.lang unless fully qualified.\n\n```java\nlong samples = 2L;\nfloat adjustment = 0.5f;\nvar result = samples + adjustment;\nSystem.out.print(((Object) result).getClass().getSimpleName() + \" \" + result);\n```",
              "correct_option": "Prints: Float 2.5",
              "distractors": [
                "Prints: Long 2",
                "Prints: Double 2.5",
                "Compilation fails: long and float cannot be added."
              ],
              "explanation": "Binary numeric promotion chooses float when a float operand is present and neither operand is double. The long is converted to float and the sum is 2.5f, so var infers float and the inspection boxes Float. Bit width does not make long win; double is not automatically chosen for safety, and the mixed operation is legal.",
              "source": "https://docs.oracle.com/javase/specs/jls/se27/html/jls-5.html#jls-5.6",
              "card_type": "multiple_choice",
              "is_code": true,
              "coverage_gap": "Long/float promotion chooses floating type rather than widest bit width."
            },
            {
              "key": "boxed-compound-fraction-rejected",
              "question": "Java 27 without preview features. Does boxed Integer accept the same compound narrowing as int? The code is inside a standard main(String[] args) method; assume no command-line arguments. All required types use java.lang unless fully qualified.\n\n```java\nInteger retries = 3;\nretries += 1.5;\nSystem.out.print(retries);\n```",
              "correct_option": "Compilation fails: the double sum cannot be converted to Integer by this compound assignment.",
              "distractors": [
                "Prints: 4",
                "Prints: 4.5",
                "Throws ClassCastException when boxing 4.5 as Integer."
              ],
              "explanation": "The left variable has type Integer, not primitive int. After unboxing for addition, the double result cannot be converted to Integer by the compound assignment conversion. Primitive int += double permits narrowing to int, but that does not make Integer += double legal. Nothing prints, Integer cannot store 4.5, and no runtime cast is reached.",
              "source": "https://docs.oracle.com/javase/specs/jls/se27/html/jls-15.html#jls-15.26.2",
              "card_type": "multiple_choice",
              "is_code": true,
              "coverage_gap": "Primitive compound narrowing does not automatically extend to boxed targets."
            }
          ],
          "identity_card_keys": [
            "byte-promotion",
            "compound-narrowing",
            "constant-range",
            "widening-loses-integer-precision",
            "float-to-int-boundaries",
            "compound-fraction-loss",
            "boxing-no-widen-then-box",
            "unbox-then-widen"
          ]
        },
        {
          "key": "equality-unboxing",
          "title": "Equality, boxing and null unboxing",
          "objective": "Distinguish value comparisons from reference identity and detect null unboxing.",
          "cards": [
            {
              "key": "objects-equals-null-safe",
              "question": "Java 27 without preview features. A nullable API value is compared using Objects.equals. What happens? The code is inside a standard main(String[] args) method; assume no command-line arguments. All required types use java.lang unless fully qualified.\n\n```java\nInteger missing = null;\nSystem.out.print(java.util.Objects.equals(missing, null) + \" \" + java.util.Objects.equals(missing, 0));\n```",
              "correct_option": "Prints: true false",
              "distractors": [
                "Prints: false false",
                "Prints: true true",
                "Throws NullPointerException because missing is unboxed."
              ],
              "explanation": "Objects.equals returns true for two null references and false when only one is null. The zero argument is boxed, but missing is not unboxed. The first false option denies null/null equality, the true/true option equates null with zero, and the exception option confuses this null-safe reference comparison with numeric ==.",
              "source": "https://docs.oracle.com/en/java/javase/27/docs/api/java.base/java/util/Objects.html#equals(java.lang.Object,java.lang.Object)",
              "card_type": "multiple_choice",
              "is_code": true,
              "coverage_gap": "Null-safe value equality without unboxing."
            },
            {
              "key": "two-null-wrappers-versus-primitive",
              "question": "Java 27 without preview features. A reference comparison is followed by a numeric comparison. What is printed? The code is inside a standard main(String[] args) method; assume no command-line arguments. All required types use java.lang unless fully qualified.\n\n```java\nInteger first = null;\nInteger second = null;\nSystem.out.print((first == second) + \" \");\ntry { System.out.print(first == 0); }\ncatch (NullPointerException failure) { System.out.print(\"NPE\"); }\n```",
              "correct_option": "Prints: true NPE",
              "distractors": [
                "Prints: true false",
                "Prints: false NPE",
                "Prints: false false"
              ],
              "explanation": "Two Integer operands use reference equality, so two null references compare true. Comparing Integer with primitive int requires unboxing, and null throws, caught as NPE. true false incorrectly treats the numeric comparison as a null-safe check; either false first result ignores reference equality of null; null is not numerically zero.",
              "source": "https://docs.oracle.com/javase/specs/jls/se27/html/jls-15.html#jls-15.21.1",
              "card_type": "multiple_choice",
              "is_code": true,
              "coverage_gap": "Equality operator changes from reference comparison to unboxing with primitive operand."
            },
            {
              "key": "unrelated-wrapper-reference-equality",
              "question": "Java 27 without preview features. Two unrelated numeric wrapper references are compared with ==. What happens? The code is inside a standard main(String[] args) method; assume no command-line arguments. All required types use java.lang unless fully qualified.\n\n```java\nInteger small = 1;\nLong wide = 1L;\nSystem.out.print(small == wide);\n```",
              "correct_option": "Compilation fails: Integer and Long references are not comparable by == here.",
              "distractors": [
                "Prints: true",
                "Prints: false",
                "Throws ClassCastException during numeric comparison."
              ],
              "explanation": "With two reference operands, == requires compatible reference types under its comparability rules. Integer and Long are unrelated final classes, so this comparison is rejected. They are not automatically unboxed for mixed numeric equality. Equal magnitudes do not make it true, distinct wrapper types do not merely yield false, and compilation prevents any runtime cast failure.",
              "source": "https://docs.oracle.com/javase/specs/jls/se27/html/jls-15.html#jls-15.21.3",
              "card_type": "multiple_choice",
              "is_code": true,
              "coverage_gap": "Unrelated wrapper reference == can fail compilation rather than compare values."
            },
            {
              "key": "mixed-float-equality-rounding",
              "question": "Java 27 without preview features. An int identifier is compared with a float. What happens? The code is inside a standard main(String[] args) method; assume no command-line arguments. All required types use java.lang unless fully qualified.\n\n```java\nint id = 16_777_217;\nfloat approximate = 16_777_216f;\nSystem.out.print((id == approximate) + \" \" + (id == 16_777_216));\n```",
              "correct_option": "Prints: true false",
              "distractors": [
                "Prints: false false",
                "Prints: true true",
                "Compilation fails: int and float cannot be compared."
              ],
              "explanation": "The mixed comparison promotes id to float, rounding it to 16,777,216, so it compares equal to approximate. The second comparison stays integral and distinguishes the two integers. false/false overlooks promotion loss, true/true extends that loss to int-only equality, and mixed numeric equality is legal. This can hide identifier differences when using floating types.",
              "source": "https://docs.oracle.com/javase/specs/jls/se27/html/jls-15.html#jls-15.21.1",
              "card_type": "multiple_choice",
              "is_code": true,
              "coverage_gap": "Mixed numeric equality can merge distinct integers through floating conversion."
            }
          ],
          "identity_card_keys": [
            "primitive-comparison",
            "null-unboxing",
            "reference-equality",
            "cached-constant-boxing",
            "different-wrapper-values",
            "ternary-null-unboxing"
          ]
        },
        {
          "key": "evaluation",
          "title": "Evaluation order and short-circuit operators",
          "objective": "Predict left-to-right side effects, skipped boolean operands and string concatenation.",
          "cards": [
            {
              "key": "precedence-not-operand-order",
              "question": "Java 27 without preview features. A trace distinguishes arithmetic grouping from evaluation order. What is printed? The code is inside a standard main(String[] args) method; assume no command-line arguments. All required types use java.lang unless fully qualified.\n\n```java\nclass Trace { int value(String label, int n) { System.out.print(label); return n; } }\nTrace trace = new Trace();\nint result = trace.value(\"A\", 1) + trace.value(\"B\", 2) * trace.value(\"C\", 3);\nSystem.out.print(\" \" + result);\n```",
              "correct_option": "Prints: ABC 7",
              "distractors": [
                "Prints: BCA 7",
                "Prints: ABC 9",
                "Prints: CBA 7"
              ],
              "explanation": "Multiplication groups more tightly than addition, giving 1 + (2 * 3), but operands still evaluate from left to right: A, then B, then C. BCA confuses grouping with evaluation order; ABC 9 groups as (1 + 2) * 3; CBA reverses evaluation. Parentheses and precedence determine the computation, while evaluation rules determine side effects.",
              "source": "https://docs.oracle.com/javase/specs/jls/se27/html/jls-15.html#jls-15.7.3",
              "card_type": "multiple_choice",
              "is_code": true,
              "coverage_gap": "Operator precedence versus left-to-right evaluation trace."
            },
            {
              "key": "chained-assignment-right-associative",
              "question": "Java 27 without preview features. A value is stored in two locals through one expression. What happens? The code is inside a standard main(String[] args) method; assume no command-line arguments. All required types use java.lang unless fully qualified.\n\n```java\nint left = 0;\nint right = 0;\nint result = left = right = 5;\nSystem.out.print(left + \" \" + right + \" \" + result);\n```",
              "correct_option": "Prints: 5 5 5",
              "distractors": [
                "Prints: 0 5 5",
                "Prints: 5 0 5",
                "Compilation fails: an assignment does not produce a value."
              ],
              "explanation": "Assignment operators group right to left. right = 5 stores and yields 5; left receives that value, and result receives the value yielded by that assignment. All three become 5. Neither outer nor inner assignment is skipped, and assignment expressions do produce a value, so this is legal.",
              "source": "https://docs.oracle.com/javase/specs/jls/se27/html/jls-15.html#jls-15.26",
              "card_type": "multiple_choice",
              "is_code": true,
              "coverage_gap": "Chained assignment associativity and expression value."
            },
            {
              "key": "postincrement-assignment-overwrites",
              "question": "Java 27 without preview features. A counter is assigned its own post-increment result. What happens? The code is inside a standard main(String[] args) method; assume no command-line arguments. All required types use java.lang unless fully qualified.\n\n```java\nint attempts = 4;\nattempts = attempts++;\nSystem.out.print(attempts);\n```",
              "correct_option": "Prints: 4",
              "distractors": [
                "Prints: 5",
                "Prints: 6",
                "Compilation fails: assignment and increment cannot target the same local."
              ],
              "explanation": "Post-increment yields the old value 4 while temporarily storing 5. The surrounding assignment then stores the yielded 4 back into attempts. The final value is 4. Expecting 5 ignores the outer assignment, 6 invents an extra increment, and the operation is legal although usually a bug. Use attempts++ alone to increment the counter.",
              "source": "https://docs.oracle.com/javase/specs/jls/se27/html/jls-15.html#jls-15.14.2",
              "card_type": "multiple_choice",
              "is_code": true,
              "coverage_gap": "Assignment can overwrite a post-increment side effect."
            },
            {
              "key": "boolean-assignment-in-condition",
              "question": "Java 27 without preview features. A feature check accidentally uses assignment. What happens? The code is inside a standard main(String[] args) method; assume no command-line arguments. All required types use java.lang unless fully qualified.\n\n```java\nboolean enabled = true;\nif (enabled = false) System.out.print(\"on \");\nSystem.out.print(enabled);\n```",
              "correct_option": "Prints: false",
              "distractors": [
                "Prints: on true",
                "Prints: on false",
                "Compilation fails: assignment is forbidden in an if condition."
              ],
              "explanation": "The assignment expression has boolean type and yields false after changing enabled. An if accepts a boolean expression, so the code compiles and skips the on branch. on true ignores both assignment and condition value; on false incorrectly enters the branch. Unlike an int assignment in an if condition, this boolean assignment is legal.",
              "source": "https://docs.oracle.com/javase/specs/jls/se27/html/jls-15.html#jls-15.26.1",
              "card_type": "multiple_choice",
              "is_code": true,
              "coverage_gap": "Boolean assignment in conditions is legal and changes state."
            },
            {
              "key": "equality-before-assignment",
              "question": "Java 27 without preview features. A Boolean local receives a comparison. What happens? The code is inside a standard main(String[] args) method; assume no command-line arguments. All required types use java.lang unless fully qualified.\n\n```java\nboolean selected = false;\nint code = 2;\nselected = code == 2;\nSystem.out.print(selected + \" \" + code);\n```",
              "correct_option": "Prints: true 2",
              "distractors": [
                "Prints: false 2",
                "Prints: true 1",
                "Compilation fails: the assignment groups before ==."
              ],
              "explanation": "Equality has higher precedence than assignment, so selected receives the boolean result of code == 2. The comparison is true and does not modify code. false ignores the matching comparison, code does not become one as a C-style truth value, and the expression is not grouped as (selected = code) == 2.",
              "source": "https://docs.oracle.com/javase/specs/jls/se27/html/jls-15.html#jls-15.26",
              "card_type": "multiple_choice",
              "is_code": true,
              "coverage_gap": "Equality/assignment precedence and comparison without mutation."
            },
            {
              "key": "arguments-left-to-right",
              "question": "Java 27 without preview features. Two arguments share a counter. What is printed? The code is inside a standard main(String[] args) method; assume no command-line arguments. All required types use java.lang unless fully qualified.\n\n```java\nclass Log { void pair(int a, int b) { System.out.print(a + \" \" + b); } }\nint sequence = 1;\nnew Log().pair(sequence++, sequence++);\nSystem.out.print(\" \" + sequence);\n```",
              "correct_option": "Prints: 1 2 3",
              "distractors": [
                "Prints: 2 1 3",
                "Prints: 1 1 2",
                "Prints: 2 3 3"
              ],
              "explanation": "Arguments evaluate left to right. The first post-increment yields 1 and stores 2; the second yields 2 and stores 3, then pair runs. Reversed argument order gives the wrong pair; evaluating both from the same old value misses sequencing; using new rather than old values confuses postfix with prefix increment.",
              "source": "https://docs.oracle.com/javase/specs/jls/se27/html/jls-15.html#jls-15.7.4",
              "card_type": "multiple_choice",
              "is_code": true,
              "coverage_gap": "Method argument evaluation order with shared side effects."
            },
            {
              "key": "binary-abrupt-left-stops-right",
              "question": "Java 27 without preview features. A left operand throws while computing a sum. What is printed? The code is inside a standard main(String[] args) method; assume no command-line arguments. All required types use java.lang unless fully qualified.\n\n```java\nclass Trace {\n  int left() { System.out.print(\"L\"); throw new IllegalStateException(); }\n  int right() { System.out.print(\"R\"); return 2; }\n}\nTrace trace = new Trace();\ntry { System.out.print(trace.left() + trace.right()); }\ncatch (IllegalStateException failure) { System.out.print(\" caught\"); }\n```",
              "correct_option": "Prints: L caught",
              "distractors": [
                "Prints: LR caught",
                "Prints: RL caught",
                "Prints: caught"
              ],
              "explanation": "The left operand runs first and completes abruptly. Evaluation of the right operand and the sum stops, so only L precedes the catch text. LR would evaluate the skipped operand, RL reverses the required order, and caught alone omits the side effect that happened before the throw. The catch handles the failure but does not resume the incomplete sum.",
              "source": "https://docs.oracle.com/javase/specs/jls/se27/html/jls-15.html#jls-15.7.1",
              "card_type": "multiple_choice",
              "is_code": true,
              "coverage_gap": "Abrupt left operand suppresses later binary operand effects."
            },
            {
              "key": "argument-failure-stops-call",
              "question": "Java 27 without preview features. The first method argument throws. What is printed? The code is inside a standard main(String[] args) method; assume no command-line arguments. All required types use java.lang unless fully qualified.\n\n```java\nclass Trace {\n  int first() { System.out.print(\"A\"); throw new IllegalArgumentException(); }\n  int second() { System.out.print(\"B\"); return 2; }\n  void send(int a, int b) { System.out.print(\"M\"); }\n}\nTrace trace = new Trace();\ntry { trace.send(trace.first(), trace.second()); }\ncatch (IllegalArgumentException failure) { System.out.print(\" caught\"); }\n```",
              "correct_option": "Prints: A caught",
              "distractors": [
                "Prints: AB caught",
                "Prints: ABM caught",
                "Prints: M caught"
              ],
              "explanation": "Argument evaluation completes before entering send. The first argument prints A and throws, so neither the second argument nor the method body runs. AB would evaluate a later argument after failure; ABM would additionally call a method without complete arguments. M caught wrongly enters the body and omits the first argument effect.",
              "source": "https://docs.oracle.com/javase/specs/jls/se27/html/jls-15.html#jls-15.7.4",
              "card_type": "multiple_choice",
              "is_code": true,
              "coverage_gap": "Argument failure suppresses later arguments and method invocation."
            },
            {
              "key": "null-array-index-effect",
              "question": "Java 27 without preview features. An index expression has a side effect before a null array access. What is printed? The code is inside a standard main(String[] args) method; assume no command-line arguments. All required types use java.lang unless fully qualified.\n\n```java\nint[] readings = null;\nint index = 0;\ntry { int sample = readings[index++]; }\ncatch (NullPointerException failure) { System.out.print(index); }\n```",
              "correct_option": "Prints: 1",
              "distractors": [
                "Prints: 0",
                "Prints: 2",
                "Throws ArrayIndexOutOfBoundsException instead of entering the catch."
              ],
              "explanation": "For an array access, the array-reference expression is evaluated, then the index expression, and then the null check occurs. index++ therefore runs once before NullPointerException. A zero count checks null too early, two counts invent a second evaluation, and a null array cannot reach the bounds check that would throw ArrayIndexOutOfBoundsException.",
              "source": "https://docs.oracle.com/javase/specs/jls/se27/html/jls-15.html#jls-15.10.4",
              "card_type": "multiple_choice",
              "is_code": true,
              "coverage_gap": "Array access checks null after evaluating the index."
            },
            {
              "key": "simple-array-assignment-rhs-first",
              "question": "Java 27 without preview features. A simple array assignment targets an invalid index. What is printed? The code is inside a standard main(String[] args) method; assume no command-line arguments. All required types use java.lang unless fully qualified.\n\n```java\nint[] values = {1};\nint writes = 0;\ntry { values[5] = ++writes; }\ncatch (ArrayIndexOutOfBoundsException failure) { System.out.print(writes); }\n```",
              "correct_option": "Prints: 1",
              "distractors": [
                "Prints: 0",
                "Prints: 2",
                "No exception; stores 1 at index 5."
              ],
              "explanation": "Simple array-component assignment evaluates the array and index, then the right side, before its null/bounds checks. ++writes therefore runs before the invalid index throws. Zero incorrectly uses compound-assignment check timing, two invents duplicate RHS evaluation, and assignment does not grow an array to make index five valid.",
              "source": "https://docs.oracle.com/javase/specs/jls/se27/html/jls-15.html#jls-15.26.1",
              "card_type": "multiple_choice",
              "is_code": true,
              "coverage_gap": "Simple array assignment evaluates RHS before bounds failure."
            },
            {
              "key": "compound-array-assignment-checks-first",
              "question": "Java 27 without preview features. A compound array assignment targets an invalid index. What is printed? The code is inside a standard main(String[] args) method; assume no command-line arguments. All required types use java.lang unless fully qualified.\n\n```java\nint[] values = {1};\nint writes = 0;\ntry { values[5] += ++writes; }\ncatch (ArrayIndexOutOfBoundsException failure) { System.out.print(writes); }\n```",
              "correct_option": "Prints: 0",
              "distractors": [
                "Prints: 1",
                "Prints: 2",
                "No exception; extends the array and stores 2."
              ],
              "explanation": "Compound assignment must locate the array component and read its old value before evaluating the right side. The bounds failure happens first, so ++writes never runs. One incorrectly applies simple-assignment timing, two invents repeated RHS evaluation, and fixed-length arrays are not extended. This explains why replacing = with += can change failure-side effects.",
              "source": "https://docs.oracle.com/javase/specs/jls/se27/html/jls-15.html#jls-15.26.2",
              "card_type": "multiple_choice",
              "is_code": true,
              "coverage_gap": "Compound array assignment fails bounds check before RHS; intentional contrast to simple assignment."
            },
            {
              "key": "nested-conditional-associativity",
              "question": "Java 27 without preview features. An unparenthesized nested conditional selects a status. What happens? The code is inside a standard main(String[] args) method; assume no command-line arguments. All required types use java.lang unless fully qualified.\n\n```java\nboolean ready = true;\nboolean retry = false;\nint status = ready ? 1 : retry ? 2 : 3;\nSystem.out.print(status);\n```",
              "correct_option": "Prints: 1",
              "distractors": [
                "Prints: 2",
                "Prints: 3",
                "Compilation fails: it groups as (ready ? 1 : retry) ? 2 : 3."
              ],
              "explanation": "Conditional expressions associate right to left: ready ? 1 : (retry ? 2 : 3). Because ready is true, status is one and the nested fallback is not evaluated. Two and three wrongly enter the fallback; the compile-error choice assumes left association and combines incompatible operands that the actual grouping does not combine.",
              "source": "https://docs.oracle.com/javase/specs/jls/se27/html/jls-15.html#jls-15.25",
              "card_type": "multiple_choice",
              "is_code": true,
              "coverage_gap": "Nested conditional right associativity."
            },
            {
              "key": "conditional-representable-int-keeps-byte",
              "question": "Java 27 without preview features. A conditional combines a byte and a representable int constant. What happens? The code is inside a standard main(String[] args) method; assume no command-line arguments. All required types use java.lang unless fully qualified.\n\n```java\nbyte supplied = 7;\nboolean useSupplied = args.length > 0;\nvar level = useSupplied ? supplied : 12;\nSystem.out.print(((Object) level).getClass().getSimpleName() + \" \" + level);\n```",
              "correct_option": "Prints: Byte 12",
              "distractors": [
                "Prints: Integer 12",
                "Prints: Short 12",
                "Compilation fails: conditional operands must have the same type."
              ],
              "explanation": "A numeric conditional with byte and a representable int constant has byte type under its special typing rules. Thus var infers byte; with no arguments the value is twelve, which boxes to Byte for inspection. General int promotion would predict Integer but ignores this exception, Short is not selected, and different operand types can be compatible.",
              "source": "https://docs.oracle.com/javase/specs/jls/se27/html/jls-15.html#jls-15.25.2",
              "card_type": "multiple_choice",
              "is_code": true,
              "coverage_gap": "Conditional typing retains narrow type for representable int constants."
            },
            {
              "key": "boolean-conditional-wrapper-pair",
              "question": "Java 27 without preview features. A conditional selects between two Boolean references. What happens? The code is inside a standard main(String[] args) method; assume no command-line arguments. All required types use java.lang unless fully qualified.\n\n```java\nBoolean missing = null;\nBoolean fallback = Boolean.FALSE;\nboolean useMissing = true;\nBoolean selected = useMissing ? missing : fallback;\nSystem.out.print(selected);\n```",
              "correct_option": "Prints: null",
              "distractors": [
                "Prints: false",
                "Throws NullPointerException during conditional evaluation.",
                "Compilation fails: Boolean conditionals cannot contain null-valued references."
              ],
              "explanation": "When both operands are Boolean, the conditional has reference type Boolean and does not unbox the selected reference. selected therefore receives null, and printing it displays null. fallback is unselected, no unboxing triggers NullPointerException, and nullable Boolean references are legal. This deliberately contrasts with primitive/wrapper conditional combinations.",
              "source": "https://docs.oracle.com/javase/specs/jls/se27/html/jls-15.html#jls-15.25.1",
              "card_type": "multiple_choice",
              "is_code": true,
              "coverage_gap": "Both-wrapper Boolean conditional preserves reference type instead of unboxing."
            }
          ],
          "identity_card_keys": [
            "increment-order",
            "short-circuit",
            "concatenation-order",
            "eager-boolean-and",
            "boolean-xor",
            "conditional-only-selected-branch",
            "compound-left-once"
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
  PERFORM set_config('anne.types_batch_project', v_project_id::text, true);
  PERFORM set_config('anne.types_batch_deck', v_topic_id::text, true);
  PERFORM set_config('anne.types_batch_payload', pack::text, true);
END;
$seed$;

-- Read-only summary, scoped to the project and deck resolved above.
-- Uses transaction-local seed context so renamed topics and explicit overrides
-- are counted correctly. Counts include pre-existing/user-authored content.
SELECT p.id AS project_id, p.name AS project, d.id AS deck_id, d.name AS topic,
       (SELECT count(*) FROM public.concepts c WHERE c.deck_id = d.id) AS concepts,
       (SELECT count(*) FROM public.cards q WHERE q.deck_id = d.id) AS questions,
       (SELECT count(*) FROM public.cards q WHERE q.deck_id = d.id AND q.id IN (
          SELECT md5(p.id::text || ':java-foundations-v1:card:types:' ||
            (c->>'key') || ':' || (card->>'key'))::uuid
          FROM jsonb_array_elements(current_setting('anne.types_batch_payload')::jsonb->'topics'->0->'concepts') c,
               jsonb_array_elements(c->'cards') card
       )) AS batch_questions_present
FROM public.projects p JOIN public.decks d ON d.project_id = p.id
WHERE p.id = current_setting('anne.types_batch_project')::uuid
  AND d.id = current_setting('anne.types_batch_deck')::uuid;
COMMIT;
