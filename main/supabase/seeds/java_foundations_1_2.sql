-- Java 27 foundations, topics 1 and 2: 16 concepts, 48 authored MC cards.
-- Generated from cards/pathways/java_foundations_1_2.json. Run in Supabase SQL Editor.
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
  "id": "java-foundations-v1",
  "version": 1,
  "java_release": 27,
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
              "key": "primitive-copy",
              "question": "Java 27: What happens when this code is used inside main?\n\n```java\nint original = 5;\nint copy = original;\ncopy = 9;\nSystem.out.print(original + \" \" + copy);\n```",
              "correct_option": "It prints 5 9.",
              "distractors": [
                "It prints 9 9.",
                "It prints 5 5.",
                "It prints 9 5."
              ],
              "explanation": "Primitive assignment copies the value. Updating copy does not update original; the alternatives treat the variables as aliases or ignore the assignment.",
              "source": "https://docs.oracle.com/javase/specs/jls/se27/html/jls-4.html#jls-4.12.1",
              "card_type": "multiple_choice",
              "is_code": true
            },
            {
              "key": "reference-copy",
              "question": "Java 27: What happens when this code is used inside main?\n\n```java\nclass Box { int value = 5; }\nBox a = new Box();\nBox b = a;\nb.value = 9;\nSystem.out.print(a.value + \" \" + b.value);\n```",
              "correct_option": "It prints 9 9.",
              "distractors": [
                "It prints 5 9.",
                "It prints 5 5.",
                "It prints 9 5."
              ],
              "explanation": "Both reference variables point to the same Box. Assignment does not clone the object, so changing its field is visible through both references.",
              "source": "https://docs.oracle.com/javase/specs/jls/se27/html/jls-4.html#jls-4.12.2",
              "card_type": "multiple_choice",
              "is_code": true
            },
            {
              "key": "unsigned-char",
              "question": "Java 27: What happens when this code is used inside main?\n\n```java\nchar value = (char) -1;\nSystem.out.print((int) value);\n```",
              "correct_option": "It prints 65535.",
              "distractors": [
                "It prints -1.",
                "It prints 32767.",
                "It prints 255."
              ],
              "explanation": "char is an unsigned 16-bit integral type. Narrowing keeps the low 16 bits of -1, which represent 65535; it is neither signed short nor unsigned byte.",
              "source": "https://docs.oracle.com/javase/specs/jls/se27/html/jls-4.html#jls-4.2.1",
              "card_type": "multiple_choice",
              "is_code": true
            }
          ]
        },
        {
          "key": "literals-inference",
          "title": "Literals and local type inference",
          "objective": "Choose valid numeric literal forms and understand that var infers a fixed static type.",
          "cards": [
            {
              "key": "long-literal",
              "question": "Java 27: What happens when this code is used inside main?\n\n```java\nlong total = 3_000_000_000;\nSystem.out.print(total);\n```",
              "correct_option": "Compilation fails: the unsuffixed integer literal is too large.",
              "distractors": [
                "It prints 3000000000 after widening the literal to long.",
                "It prints -1294967296 after wrapping the literal as int.",
                "It throws ArithmeticException when the literal is assigned."
              ],
              "explanation": "A decimal integer literal without L must fit int. A long destination does not change the literal type; use 3_000_000_000L. The error precedes assignment.",
              "source": "https://docs.oracle.com/javase/specs/jls/se27/html/jls-3.html#jls-3.10.1",
              "card_type": "multiple_choice",
              "is_code": true
            },
            {
              "key": "var-fixed-type",
              "question": "Java 27: What happens when this code is used inside main?\n\n```java\nvar number = 1;\nnumber = 1.5;\nSystem.out.print(number);\n```",
              "correct_option": "Compilation fails: number is int and cannot accept this double.",
              "distractors": [
                "It prints 1.5 because var changes type on reassignment.",
                "It prints 1 because assignment silently narrows the double.",
                "It prints 1.5 because var always infers numeric values as double."
              ],
              "explanation": "var infers int from the initial literal and does not make the variable dynamically typed. Reassignment cannot perform an implicit double-to-int narrowing conversion.",
              "source": "https://docs.oracle.com/javase/specs/jls/se27/html/jls-14.html#jls-14.4.1",
              "card_type": "multiple_choice",
              "is_code": true
            },
            {
              "key": "var-null",
              "question": "Java 27: What happens when this code is used inside main?\n\n```java\nvar value = null;\nSystem.out.print(value);\n```",
              "correct_option": "Compilation fails: null alone cannot supply the inferred type.",
              "distractors": [
                "It prints null because var infers Object from a null initializer.",
                "It prints null because var declares a variable of the null type.",
                "It throws NullPointerException while inferring the initializer type."
              ],
              "explanation": "A var declaration cannot infer its type from null alone. Declare a reference type explicitly, such as Object value = null; no runtime inference occurs.",
              "source": "https://docs.oracle.com/javase/specs/jls/se27/html/jls-14.html#jls-14.4.1",
              "card_type": "multiple_choice",
              "is_code": true
            }
          ]
        },
        {
          "key": "initialization",
          "title": "Initialization and definite assignment",
          "objective": "Distinguish default-initialized fields from local variables that must be assigned on every reachable path.",
          "cards": [
            {
              "key": "local-unassigned",
              "question": "Java 27: What happens when this code is used inside main?\n\n```java\nint count;\nSystem.out.print(count);\n```",
              "correct_option": "Compilation fails: the local variable may be uninitialized.",
              "distractors": [
                "It prints 0 because all int variables receive a default value.",
                "It prints an unspecified value left in the local stack slot.",
                "It throws NullPointerException when count is read."
              ],
              "explanation": "Local variables must be definitely assigned before use. Default initialization applies to fields and array elements, not local variables; Java does not expose an uninitialized stack value.",
              "source": "https://docs.oracle.com/javase/specs/jls/se27/html/jls-4.html#jls-4.12.5",
              "card_type": "multiple_choice",
              "is_code": true
            },
            {
              "key": "field-defaults",
              "question": "Java 27: What happens when this code is used inside main?\n\n```java\nclass Defaults { int count; boolean active; String name; }\nDefaults d = new Defaults();\nSystem.out.print(d.count + \" \" + d.active + \" \" + d.name);\n```",
              "correct_option": "It prints 0 false null.",
              "distractors": [
                "It prints 0 true null.",
                "It prints 0 false empty.",
                "It prints null false null."
              ],
              "explanation": "Instance fields have defaults: zero for int, false for boolean and null for references. A String field is not initialized to an empty string.",
              "source": "https://docs.oracle.com/javase/specs/jls/se27/html/jls-4.html#jls-4.12.5",
              "card_type": "multiple_choice",
              "is_code": true
            },
            {
              "key": "conditional-assignment",
              "question": "Java 27: What happens when this code is used inside main?\n\n```java\nint score;\nif (args.length > 0) score = 10;\nSystem.out.print(score);\n```",
              "correct_option": "Compilation fails: the false branch leaves score unassigned.",
              "distractors": [
                "It prints 0 when args is empty because score gets a default.",
                "It prints 10 even when args is empty because the assignment is checked.",
                "It compiles, then throws an exception only when args is empty."
              ],
              "explanation": "The compiler cannot assume args.length is positive. There is a reachable path without assignment, so reading score fails definite-assignment analysis; this is not deferred to runtime.",
              "source": "https://docs.oracle.com/javase/specs/jls/se27/html/jls-16.html",
              "card_type": "multiple_choice",
              "is_code": true
            }
          ]
        },
        {
          "key": "promotion",
          "title": "Numeric promotion and narrowing assignments",
          "objective": "Predict promoted arithmetic types, constant-expression narrowing and compound-assignment conversions.",
          "cards": [
            {
              "key": "byte-promotion",
              "question": "Java 27: What happens when this code is used inside main?\n\n```java\nbyte a = 10;\nbyte b = 20;\nbyte sum = a + b;\nSystem.out.print(sum);\n```",
              "correct_option": "Compilation fails: adding these byte variables produces int.",
              "distractors": [
                "It prints 30 because adding two bytes always produces byte.",
                "It prints 30 because the compiler narrows any in-range result.",
                "It throws ArithmeticException because byte arithmetic is forbidden."
              ],
              "explanation": "Binary numeric promotion converts these byte operands to int. Their sum is not a constant expression, and assignment cannot implicitly narrow the result merely because its runtime value fits.",
              "source": "https://docs.oracle.com/javase/specs/jls/se27/html/jls-5.html#jls-5.6",
              "card_type": "multiple_choice",
              "is_code": true
            },
            {
              "key": "compound-narrowing",
              "question": "Java 27: What happens when this code is used inside main?\n\n```java\nbyte value = 127;\nvalue += 1;\nSystem.out.print(value);\n```",
              "correct_option": "It prints -128.",
              "distractors": [
                "It prints 128.",
                "It prints 127.",
                "It throws ArithmeticException."
              ],
              "explanation": "Compound assignment includes conversion back to the left-hand type. The int result 128 narrows to byte -128; Java does not throw on this integer overflow.",
              "source": "https://docs.oracle.com/javase/specs/jls/se27/html/jls-15.html#jls-15.26.2",
              "card_type": "multiple_choice",
              "is_code": true
            },
            {
              "key": "constant-range",
              "question": "Java 27: What happens when this code is used inside main?\n\n```java\nbyte low = 127;\nbyte high = 128;\nSystem.out.print(low + \" \" + high);\n```",
              "correct_option": "Compilation fails: 128 is outside the byte assignment range.",
              "distractors": [
                "It prints 127 -128 because every int literal silently narrows.",
                "It prints 127 128 because byte widens to hold this initializer.",
                "It throws ArithmeticException while assigning high."
              ],
              "explanation": "An int constant expression may narrow in assignment only when its value fits the destination type. 127 fits byte; 128 does not. An explicit cast would be a different program.",
              "source": "https://docs.oracle.com/javase/specs/jls/se27/html/jls-5.html#jls-5.2",
              "card_type": "multiple_choice",
              "is_code": true
            }
          ]
        },
        {
          "key": "integer-arithmetic",
          "title": "Integer overflow, division and remainder",
          "objective": "Identify arithmetic overflow before widening and predict division/remainder for negative integers.",
          "cards": [
            {
              "key": "int-wrap",
              "question": "Java 27: What happens when this code is used inside main?\n\n```java\nint value = Integer.MAX_VALUE;\nSystem.out.print(value + 1);\n```",
              "correct_option": "It prints -2147483648.",
              "distractors": [
                "It prints 2147483648.",
                "It prints 2147483647.",
                "It throws ArithmeticException."
              ],
              "explanation": "int addition wraps when the mathematical result is outside its signed 32-bit range. It does not saturate, automatically widen or throw ArithmeticException.",
              "source": "https://docs.oracle.com/javase/specs/jls/se27/html/jls-4.html#jls-4.2.2",
              "card_type": "multiple_choice",
              "is_code": true
            },
            {
              "key": "overflow-before-long",
              "question": "Java 27: What happens when this code is used inside main?\n\n```java\nlong result = 50_000 * 50_000;\nSystem.out.print(result);\n```",
              "correct_option": "It prints -1794967296.",
              "distractors": [
                "It prints 2500000000.",
                "It prints 2147483647.",
                "It prints -2500000000."
              ],
              "explanation": "Both operands are int, so multiplication overflows before assignment widens the result to long. Use 50_000L * 50_000 to calculate in long arithmetic.",
              "source": "https://docs.oracle.com/javase/specs/jls/se27/html/jls-5.html#jls-5.6",
              "card_type": "multiple_choice",
              "is_code": true
            },
            {
              "key": "negative-division",
              "question": "Java 27: What happens when this code is used inside main?\n\n```java\nSystem.out.print((-7 / 3) + \" \" + (-7 % 3));\n```",
              "correct_option": "It prints -2 -1.",
              "distractors": [
                "It prints -3 2.",
                "It prints -2 1.",
                "It prints -3 -1."
              ],
              "explanation": "Integer division truncates toward zero. The remainder satisfies dividend = quotient * divisor + remainder and has the dividend sign when nonzero. These rules give -2 and -1.",
              "source": "https://docs.oracle.com/javase/specs/jls/se27/html/jls-15.html#jls-15.17.2",
              "card_type": "multiple_choice",
              "is_code": true
            }
          ]
        },
        {
          "key": "floating-point",
          "title": "Floating-point special values and precision",
          "objective": "Recognize NaN, infinity and limits of binary floating-point equality.",
          "cards": [
            {
              "key": "nan-equality",
              "question": "Java 27: What happens when this code is used inside main?\n\n```java\ndouble value = 0.0 / 0.0;\nSystem.out.print(value == value);\n```",
              "correct_option": "It prints false.",
              "distractors": [
                "It prints true.",
                "It throws ArithmeticException.",
                "It fails to compile."
              ],
              "explanation": "Floating-point zero divided by zero produces NaN. NaN is unequal even to itself. Unlike integer division by zero, this floating-point operation does not throw ArithmeticException.",
              "source": "https://docs.oracle.com/javase/specs/jls/se27/html/jls-15.html#jls-15.21.1",
              "card_type": "multiple_choice",
              "is_code": true
            },
            {
              "key": "floating-zero",
              "question": "Java 27: What happens when this code is used inside main?\n\n```java\ndouble value = 1.0 / 0.0;\nSystem.out.print(value);\n```",
              "correct_option": "It prints Infinity.",
              "distractors": [
                "It prints NaN.",
                "It prints 0.0.",
                "It throws ArithmeticException."
              ],
              "explanation": "A positive finite nonzero double divided by positive zero gives positive infinity. Zero divided by zero instead gives NaN; integer divide-by-zero exception rules do not apply.",
              "source": "https://docs.oracle.com/javase/specs/jls/se27/html/jls-15.html#jls-15.17.2",
              "card_type": "multiple_choice",
              "is_code": true
            },
            {
              "key": "decimal-equality",
              "question": "Java 27: What happens when this code is used inside main?\n\n```java\nSystem.out.print((0.1 + 0.2) == 0.3);\n```",
              "correct_option": "It prints false.",
              "distractors": [
                "It prints true.",
                "It throws ArithmeticException.",
                "It fails to compile."
              ],
              "explanation": "These decimal fractions are approximated in binary floating point; the rounded sum differs from the representation of 0.3. Use a suitable tolerance or decimal arithmetic when the domain requires it.",
              "source": "https://docs.oracle.com/javase/specs/jls/se27/html/jls-4.html#jls-4.2.3",
              "card_type": "multiple_choice",
              "is_code": true
            }
          ]
        },
        {
          "key": "equality-unboxing",
          "title": "Equality, boxing and null unboxing",
          "objective": "Distinguish value comparisons from reference identity and detect null unboxing.",
          "cards": [
            {
              "key": "primitive-comparison",
              "question": "Java 27: What happens when this code is used inside main?\n\n```java\nInteger value = 1000;\nSystem.out.print(value == 1000);\n```",
              "correct_option": "It prints true.",
              "distractors": [
                "It prints false.",
                "It throws NullPointerException.",
                "It fails to compile."
              ],
              "explanation": "The other operand is primitive int, so value is unboxed and numeric equality compares 1000 with 1000. This does not compare two boxed references or depend on an Integer cache.",
              "source": "https://docs.oracle.com/javase/specs/jls/se27/html/jls-15.html#jls-15.21.1",
              "card_type": "multiple_choice",
              "is_code": true
            },
            {
              "key": "null-unboxing",
              "question": "Java 27: What happens when this code is used inside main?\n\n```java\nInteger value = null;\nint count = value;\nSystem.out.print(count);\n```",
              "correct_option": "It throws NullPointerException.",
              "distractors": [
                "It prints the primitive default 0.",
                "It prints the reference value null.",
                "It fails because Integer cannot hold null."
              ],
              "explanation": "Integer is a reference type and can hold null. Assigning it to int requires unboxing, which throws for null; no primitive default substitutes for the missing object.",
              "source": "https://docs.oracle.com/javase/specs/jls/se27/html/jls-5.html#jls-5.1.8",
              "card_type": "multiple_choice",
              "is_code": true
            },
            {
              "key": "reference-equality",
              "question": "Java 27: What happens when this code is used inside main?\n\n```java\nString a = new String(\"java\");\nString b = new String(\"java\");\nSystem.out.print((a == b) + \" \" + a.equals(b));\n```",
              "correct_option": "It prints false true.",
              "distractors": [
                "It prints true true.",
                "It prints false false.",
                "It prints true false."
              ],
              "explanation": "The two new expressions create distinct objects, so reference identity is false. String.equals compares their equal contents. Reference identity and value equality are separate operations.",
              "source": "https://docs.oracle.com/javase/specs/jls/se27/html/jls-15.html#jls-15.21.3",
              "card_type": "multiple_choice",
              "is_code": true
            }
          ]
        },
        {
          "key": "evaluation",
          "title": "Evaluation order and short-circuit operators",
          "objective": "Predict left-to-right side effects, skipped boolean operands and string concatenation.",
          "cards": [
            {
              "key": "increment-order",
              "question": "Java 27: What happens when this code is used inside main?\n\n```java\nint value = 2;\nSystem.out.print(value++ + \" \" + ++value);\n```",
              "correct_option": "It prints 2 4.",
              "distractors": [
                "It prints 3 4.",
                "It prints 2 3.",
                "It prints 3 3."
              ],
              "explanation": "The left operand is evaluated first. Post-increment contributes 2 then sets value to 3; pre-increment sets it to 4 before contributing its value.",
              "source": "https://docs.oracle.com/javase/specs/jls/se27/html/jls-15.html#jls-15.7.1",
              "card_type": "multiple_choice",
              "is_code": true
            },
            {
              "key": "short-circuit",
              "question": "Java 27: What happens when this code is used inside main?\n\n```java\nint count = 0;\nboolean result = false && ++count > 0;\nSystem.out.print(count + \" \" + result);\n```",
              "correct_option": "It prints 0 false.",
              "distractors": [
                "It prints 1 false.",
                "It prints 1 true.",
                "It prints 0 true."
              ],
              "explanation": "When the left operand of && is false, Java skips the right operand. count is therefore not incremented and the result is false. Single & would evaluate both operands.",
              "source": "https://docs.oracle.com/javase/specs/jls/se27/html/jls-15.html#jls-15.23",
              "card_type": "multiple_choice",
              "is_code": true
            },
            {
              "key": "concatenation-order",
              "question": "Java 27: What happens when this code is used inside main?\n\n```java\nSystem.out.print(\"sum=\" + 1 + 2);\n```",
              "correct_option": "It prints sum=12.",
              "distractors": [
                "It prints sum=3.",
                "It prints sum=21.",
                "It prints sum=1+2."
              ],
              "explanation": "The additions associate left to right. Once a String is involved, + concatenates: sum= plus 1, then plus 2. Parenthesize 1 + 2 to obtain numeric addition first.",
              "source": "https://docs.oracle.com/javase/specs/jls/se27/html/jls-15.html#jls-15.18.1",
              "card_type": "multiple_choice",
              "is_code": true
            }
          ]
        }
      ]
    },
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
              "key": "nonboolean-condition",
              "question": "Java 27: What happens when this code is used inside main?\n\n```java\nint score = 0;\nif (score = 1) System.out.print(\"yes\");\nelse System.out.print(\"no\");\n```",
              "correct_option": "Compilation fails: the assignment expression has type int.",
              "distractors": [
                "It prints yes because assigning 1 makes the condition truthy.",
                "It prints no because assignment expressions are always false.",
                "It compiles but throws because assignments are forbidden at runtime."
              ],
              "explanation": "Java if conditions require boolean or Boolean. Assigning 1 to an int produces an int, not a truth value; this is not the score == 1 comparison.",
              "source": "https://docs.oracle.com/javase/specs/jls/se27/html/jls-14.html#jls-14.9",
              "card_type": "multiple_choice",
              "is_code": true
            },
            {
              "key": "dangling-else",
              "question": "Java 27: What happens when this code is used inside main?\n\n```java\nboolean outer = true;\nboolean inner = false;\nif (outer)\n    if (inner) System.out.print(\"A\");\n    else System.out.print(\"B\");\n```",
              "correct_option": "It prints B.",
              "distractors": [
                "It prints A.",
                "It prints nothing.",
                "It fails to compile."
              ],
              "explanation": "Without braces, the else belongs to the nearest eligible if: if (inner). outer is true, inner is false, so its else prints B; indentation does not change binding.",
              "source": "https://docs.oracle.com/javase/specs/jls/se27/html/jls-14.html#jls-14.9",
              "card_type": "multiple_choice",
              "is_code": true
            },
            {
              "key": "boxed-condition",
              "question": "Java 27: What happens when this code is used inside main?\n\n```java\nBoolean allowed = null;\nif (allowed) System.out.print(\"yes\");\nelse System.out.print(\"no\");\n```",
              "correct_option": "It throws NullPointerException.",
              "distractors": [
                "It prints no because null means false.",
                "It prints yes because the reference exists.",
                "It fails because Boolean is not a condition type."
              ],
              "explanation": "Boolean is allowed as a condition but must be unboxed. A null reference throws before either branch runs; null does not act as a false primitive boolean.",
              "source": "https://docs.oracle.com/javase/specs/jls/se27/html/jls-14.html#jls-14.9",
              "card_type": "multiple_choice",
              "is_code": true
            }
          ]
        },
        {
          "key": "for-boundaries",
          "title": "For-loop boundaries and empty bodies",
          "objective": "Count iterations accurately and distinguish a loop body from a trailing empty statement.",
          "cards": [
            {
              "key": "exclusive-bound",
              "question": "Java 27: What happens when this code is used inside main?\n\n```java\nint total = 0;\nfor (int i = 0; i < 3; i++) total += i;\nSystem.out.print(total);\n```",
              "correct_option": "It prints 3.",
              "distractors": [
                "It prints 6.",
                "It prints 2.",
                "It prints 4."
              ],
              "explanation": "The body runs for i = 0, 1 and 2. The exclusive upper bound excludes 3, and the sum is 3; counting iterations is not the same as summing the index.",
              "source": "https://docs.oracle.com/javase/specs/jls/se27/html/jls-14.html#jls-14.14.1",
              "card_type": "multiple_choice",
              "is_code": true
            },
            {
              "key": "inclusive-bound",
              "question": "Java 27: What happens when this code is used inside main?\n\n```java\nint total = 0;\nfor (int i = 1; i <= 3; i++) total += i;\nSystem.out.print(total);\n```",
              "correct_option": "It prints 6.",
              "distractors": [
                "It prints 3.",
                "It prints 5.",
                "It prints 10."
              ],
              "explanation": "The inclusive bound includes i = 3, so the body adds 1 + 2 + 3. Omitting the final iteration or including 4 gives the incorrect alternatives.",
              "source": "https://docs.oracle.com/javase/specs/jls/se27/html/jls-14.html#jls-14.14.1",
              "card_type": "multiple_choice",
              "is_code": true
            },
            {
              "key": "empty-body",
              "question": "Java 27: What happens when this code is used inside main?\n\n```java\nint i = 0;\nfor (; i < 3; i++);\nSystem.out.print(i);\n```",
              "correct_option": "It prints 3 once.",
              "distractors": [
                "It prints 012 during the loop.",
                "It prints 0123 during the loop.",
                "It prints 0 once."
              ],
              "explanation": "The semicolon is the entire empty loop body. The loop still increments i until its condition fails at 3; the following print is executed once outside the loop.",
              "source": "https://docs.oracle.com/javase/specs/jls/se27/html/jls-14.html#jls-14.6",
              "card_type": "multiple_choice",
              "is_code": true
            }
          ]
        },
        {
          "key": "while-do",
          "title": "While and do-while evaluation",
          "objective": "Distinguish pre-tested/post-tested loops and include side effects from the final failed test.",
          "cards": [
            {
              "key": "while-zero",
              "question": "Java 27: What happens when this code is used inside main?\n\n```java\nint count = 0;\nwhile (count < 0) count++;\nSystem.out.print(count);\n```",
              "correct_option": "It prints 0.",
              "distractors": [
                "It prints 1.",
                "It prints -1.",
                "It does not terminate."
              ],
              "explanation": "while checks the condition before the body. count < 0 is initially false, so the increment never runs; a loop does not guarantee one iteration.",
              "source": "https://docs.oracle.com/javase/specs/jls/se27/html/jls-14.html#jls-14.12",
              "card_type": "multiple_choice",
              "is_code": true
            },
            {
              "key": "do-once",
              "question": "Java 27: What happens when this code is used inside main?\n\n```java\nint count = 0;\ndo { count++; } while (count < 0);\nSystem.out.print(count);\n```",
              "correct_option": "It prints 1.",
              "distractors": [
                "It prints 0.",
                "It prints -1.",
                "It does not terminate."
              ],
              "explanation": "do-while executes its body before checking the condition. The increment runs once, then 1 < 0 is false; it differs from the corresponding while loop.",
              "source": "https://docs.oracle.com/javase/specs/jls/se27/html/jls-14.html#jls-14.13",
              "card_type": "multiple_choice",
              "is_code": true
            },
            {
              "key": "failed-test-side-effect",
              "question": "Java 27: What happens when this code is used inside main?\n\n```java\nint i = 0;\nwhile (i++ < 2) { }\nSystem.out.print(i);\n```",
              "correct_option": "It prints 3.",
              "distractors": [
                "It prints 2.",
                "It prints 1.",
                "It does not terminate."
              ],
              "explanation": "The comparison uses the old value and then increments i. Tests with old values 0 and 1 pass; the final test with old value 2 fails but still increments i to 3.",
              "source": "https://docs.oracle.com/javase/specs/jls/se27/html/jls-14.html#jls-14.12",
              "card_type": "multiple_choice",
              "is_code": true
            }
          ]
        },
        {
          "key": "break-continue",
          "title": "Break, continue and for-loop updates",
          "objective": "Distinguish exiting a loop from skipping its current body and understand for updates after continue.",
          "cards": [
            {
              "key": "continue-sum",
              "question": "Java 27: What happens when this code is used inside main?\n\n```java\nint total = 0;\nfor (int i = 1; i <= 4; i++) {\n    if (i == 2) continue;\n    total += i;\n}\nSystem.out.print(total);\n```",
              "correct_option": "It prints 8.",
              "distractors": [
                "It prints 10.",
                "It prints 1.",
                "It prints 6."
              ],
              "explanation": "continue skips only the rest of the current iteration. The loop still visits 3 and 4, adding 1 + 3 + 4; it neither adds 2 nor exits the loop.",
              "source": "https://docs.oracle.com/javase/specs/jls/se27/html/jls-14.html#jls-14.16",
              "card_type": "multiple_choice",
              "is_code": true
            },
            {
              "key": "break-sum",
              "question": "Java 27: What happens when this code is used inside main?\n\n```java\nint total = 0;\nfor (int i = 1; i <= 4; i++) {\n    if (i == 3) break;\n    total += i;\n}\nSystem.out.print(total);\n```",
              "correct_option": "It prints 3.",
              "distractors": [
                "It prints 7.",
                "It prints 10.",
                "It prints 6."
              ],
              "explanation": "break exits the loop when i is 3, before that value is added. Only 1 and 2 contribute; it does not merely skip the third iteration.",
              "source": "https://docs.oracle.com/javase/specs/jls/se27/html/jls-14.html#jls-14.15",
              "card_type": "multiple_choice",
              "is_code": true
            },
            {
              "key": "continue-update",
              "question": "Java 27: What happens when this code is used inside main?\n\n```java\nint i = 0;\nint visits = 0;\nfor (; i < 3; i++) {\n    if (i == 1) continue;\n    visits++;\n}\nSystem.out.print(i + \" \" + visits);\n```",
              "correct_option": "It prints 3 2.",
              "distractors": [
                "It prints 2 2.",
                "It prints 3 3.",
                "It does not terminate."
              ],
              "explanation": "A continue targeting a basic for loop proceeds to its update expressions. i advances past 1, so the loop terminates at 3 and visits is incremented for 0 and 2 only.",
              "source": "https://docs.oracle.com/javase/specs/jls/se27/html/jls-14.html#jls-14.14.1.3",
              "card_type": "multiple_choice",
              "is_code": true
            }
          ]
        },
        {
          "key": "nested-labels",
          "title": "Nested loops and labeled transfers",
          "objective": "Identify the loop targeted by unlabeled/labeled break and continue without skipping or inventing iterations.",
          "cards": [
            {
              "key": "break-outer",
              "question": "Java 27: What happens when this code is used inside main?\n\n```java\nint visits = 0;\nouter: for (int i = 0; i < 3; i++) {\n    for (int j = 0; j < 3; j++) {\n        visits++;\n        break outer;\n    }\n}\nSystem.out.print(visits);\n```",
              "correct_option": "It prints 1.",
              "distractors": [
                "It prints 3.",
                "It prints 9.",
                "It prints 0."
              ],
              "explanation": "break outer exits the labeled outer loop immediately after the first increment. An unlabeled break would exit only the inner loop and allow later outer iterations.",
              "source": "https://docs.oracle.com/javase/specs/jls/se27/html/jls-14.html#jls-14.15",
              "card_type": "multiple_choice",
              "is_code": true
            },
            {
              "key": "break-inner",
              "question": "Java 27: What happens when this code is used inside main?\n\n```java\nint visits = 0;\nfor (int i = 0; i < 3; i++) {\n    for (int j = 0; j < 3; j++) {\n        if (j == 1) break;\n        visits++;\n    }\n}\nSystem.out.print(visits);\n```",
              "correct_option": "It prints 3.",
              "distractors": [
                "It prints 1.",
                "It prints 6.",
                "It prints 9."
              ],
              "explanation": "The unlabeled break targets the inner loop. Each of the three outer iterations increments visits at j = 0, then breaks at j = 1; the outer loop continues.",
              "source": "https://docs.oracle.com/javase/specs/jls/se27/html/jls-14.html#jls-14.15",
              "card_type": "multiple_choice",
              "is_code": true
            },
            {
              "key": "continue-outer",
              "question": "Java 27: What happens when this code is used inside main?\n\n```java\nint visits = 0;\nouter: for (int i = 0; i < 3; i++) {\n    for (int j = 0; j < 3; j++) {\n        if (j == 1) continue outer;\n        visits++;\n    }\n}\nSystem.out.print(visits);\n```",
              "correct_option": "It prints 3.",
              "distractors": [
                "It prints 6.",
                "It prints 9.",
                "It prints 1."
              ],
              "explanation": "continue outer ends the current outer iteration when j = 1 and executes the outer for update. Each outer iteration therefore increments visits only at j = 0.",
              "source": "https://docs.oracle.com/javase/specs/jls/se27/html/jls-14.html#jls-14.16",
              "card_type": "multiple_choice",
              "is_code": true
            }
          ]
        },
        {
          "key": "switch-classic",
          "title": "Colon switch groups and fall-through",
          "objective": "Trace colon-style case groups, missing matches and null selectors.",
          "cards": [
            {
              "key": "switch-fallthrough",
              "question": "Java 27: What happens when this code is used inside main?\n\n```java\nString result = \"\";\nswitch (2) {\n    case 1: result += \"A\";\n    case 2: result += \"B\";\n    case 3: result += \"C\"; break;\n    default: result += \"D\";\n}\nSystem.out.print(result);\n```",
              "correct_option": "It prints BC.",
              "distractors": [
                "It prints B.",
                "It prints ABC.",
                "It prints BCD."
              ],
              "explanation": "Execution begins at matching case 2 and falls through into case 3. Its break prevents default from running; earlier case 1 is not revisited.",
              "source": "https://docs.oracle.com/javase/specs/jls/se27/html/jls-14.html#jls-14.11.3",
              "card_type": "multiple_choice",
              "is_code": true
            },
            {
              "key": "switch-no-match",
              "question": "Java 27: What happens when this code is used inside main?\n\n```java\nswitch (6) {\n    case 1: System.out.print(\"one \"); break;\n}\nSystem.out.print(\"done\");\n```",
              "correct_option": "It prints done.",
              "distractors": [
                "It prints one done.",
                "It prints default done.",
                "It fails to compile."
              ],
              "explanation": "This ordinary int switch statement may omit default. With no matching case, none of its body runs and execution continues after the switch. Switch expressions have different exhaustiveness requirements.",
              "source": "https://docs.oracle.com/javase/specs/jls/se27/html/jls-14.html#jls-14.11.3",
              "card_type": "multiple_choice",
              "is_code": true
            },
            {
              "key": "switch-null",
              "question": "Java 27: What happens when this code is used inside main?\n\n```java\nString command = null;\nswitch (command) {\n    case \"go\": System.out.print(\"go\"); break;\n    default: System.out.print(\"other\");\n}\n```",
              "correct_option": "It throws NullPointerException.",
              "distractors": [
                "It prints other via the default case.",
                "It prints go after converting null to text.",
                "It fails because String selectors are unsupported."
              ],
              "explanation": "A null String selector is not handled by default. With no explicit case null, selection throws NullPointerException; String selectors themselves are supported.",
              "source": "https://docs.oracle.com/javase/specs/jls/se27/html/jls-14.html#jls-14.11.3",
              "card_type": "multiple_choice",
              "is_code": true
            }
          ]
        },
        {
          "key": "switch-expression",
          "title": "Arrow switch rules, yield and exhaustiveness",
          "objective": "Predict non-falling-through arrow rules and return values from exhaustive switch expressions.",
          "cards": [
            {
              "key": "arrow-no-fallthrough",
              "question": "Java 27: What happens when this code is used inside main?\n\n```java\nString result = switch (2) {\n    case 1 -> \"one\";\n    case 2 -> \"two\";\n    default -> \"other\";\n};\nSystem.out.print(result);\n```",
              "correct_option": "It prints two.",
              "distractors": [
                "It prints twoother.",
                "It prints onetwo.",
                "It prints other."
              ],
              "explanation": "An arrow rule supplies its value without falling through into later rules. The matching rule yields two; no break statement is necessary.",
              "source": "https://docs.oracle.com/javase/specs/jls/se27/html/jls-15.html#jls-15.28.2",
              "card_type": "multiple_choice",
              "is_code": true
            },
            {
              "key": "block-yield",
              "question": "Java 27: What happens when this code is used inside main?\n\n```java\nint result = switch (2) {\n    case 2 -> { int value = 20; yield value * 2; }\n    default -> 0;\n};\nSystem.out.print(result);\n```",
              "correct_option": "It prints 40.",
              "distractors": [
                "It prints 20.",
                "It prints 2.",
                "It prints 0."
              ],
              "explanation": "yield supplies the value of the enclosing switch expression. The local value is 20 and the yielded expression is value * 2; yield is not a method return.",
              "source": "https://docs.oracle.com/javase/specs/jls/se27/html/jls-14.html#jls-14.21",
              "card_type": "multiple_choice",
              "is_code": true
            },
            {
              "key": "exhaustive-expression",
              "question": "Java 27: What happens when this code is used inside main?\n\n```java\nint selector = 1;\nint result = switch (selector) {\n    case 1 -> 10;\n};\nSystem.out.print(result);\n```",
              "correct_option": "Compilation fails: the switch expression is not exhaustive.",
              "distractors": [
                "It prints 10 because selector currently contains 1.",
                "It prints 0 because unmatched values receive an implicit default.",
                "It throws only if selector contains a value other than 1."
              ],
              "explanation": "A switch expression must cover all possible selector values. A non-final int variable initialized to 1 does not limit its static domain; add a default rule for this int expression.",
              "source": "https://docs.oracle.com/javase/specs/jls/se27/html/jls-15.html#jls-15.28.1",
              "card_type": "multiple_choice",
              "is_code": true
            }
          ]
        },
        {
          "key": "scope-reachability",
          "title": "Scope and statement reachability",
          "objective": "Respect for-variable scope and distinguish Java reachability rules for while and if.",
          "cards": [
            {
              "key": "for-scope",
              "question": "Java 27: What happens when this code is used inside main?\n\n```java\nfor (int i = 0; i < 2; i++) { }\nSystem.out.print(i);\n```",
              "correct_option": "Compilation fails: i is outside its declared scope.",
              "distractors": [
                "It prints 2 because the loop variable survives afterward.",
                "It prints 1 because the final body iteration used that value.",
                "It prints 0 because the loop variable is reinitialized afterward."
              ],
              "explanation": "The for initializer variable is scoped to the loop, including its condition/update/body. It cannot be named after the loop; declare it outside when its final value is needed.",
              "source": "https://docs.oracle.com/javase/specs/jls/se27/html/jls-6.html#jls-6.3",
              "card_type": "multiple_choice",
              "is_code": true
            },
            {
              "key": "while-false-unreachable",
              "question": "Java 27: What happens when this code is used inside main?\n\n```java\nwhile (false) { System.out.print(\"never\"); }\nSystem.out.print(\"done\");\n```",
              "correct_option": "Compilation fails: the while body is unreachable.",
              "distractors": [
                "It prints done because every false branch is allowed.",
                "It prints neverdone because the body runs before its test.",
                "It prints nothing because the loop prevents later execution."
              ],
              "explanation": "A while with constant false has an unreachable body, which Java rejects. This differs from the special reachability rules allowing if (false) bodies and from post-tested do-while.",
              "source": "https://docs.oracle.com/javase/specs/jls/se27/html/jls-14.html#jls-14.22",
              "card_type": "multiple_choice",
              "is_code": true
            },
            {
              "key": "if-false-reachable",
              "question": "Java 27: What happens when this code is used inside main?\n\n```java\nif (false) { System.out.print(\"never\"); }\nSystem.out.print(\"done\");\n```",
              "correct_option": "It prints done.",
              "distractors": [
                "It prints neverdone.",
                "It prints nothing.",
                "It fails to compile."
              ],
              "explanation": "Java permits an if (false) body under its special reachability rules, supporting conditional compilation patterns. The branch is not executed, and the later print runs normally.",
              "source": "https://docs.oracle.com/javase/specs/jls/se27/html/jls-14.html#jls-14.22",
              "card_type": "multiple_choice",
              "is_code": true
            }
          ]
        }
      ]
    }
  ],
  "preview_features": false
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
    -- Prefer a previously seeded ID so a name edit does not create a duplicate.
    SELECT d.id INTO v_topic_id FROM public.decks d WHERE d.id = seeded_id AND d.project_id = v_project_id;
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
      SELECT c.id INTO v_concept_id FROM public.concepts c WHERE c.id = seeded_id AND c.deck_id = v_topic_id;
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
          (card->>'correct_option') || E'\n\n' || (card->>'explanation') || E'\n\nSource: [Java 27 language specification](' || (card->>'source') || ').',
          'multiple_choice', ARRAY(SELECT jsonb_array_elements_text(card->'distractors')),
          true, 0, 2.5, 0, now()
        ) ON CONFLICT (id) DO NOTHING;
        GET DIAGNOSTICS affected = ROW_COUNT;
        cards_added := cards_added + affected;
      END LOOP;
    END LOOP;
  END LOOP;
  RAISE NOTICE 'Java project %: added % topics, % concepts, % questions. Existing data was preserved.', v_project_id, decks_added, concepts_added, cards_added;
END;
$seed$;
COMMIT;

-- Summary of the two topics (includes any questions that were already present).
SELECT p.name AS project, d.name AS topic,
       count(DISTINCT c.id) AS concepts, count(DISTINCT q.id) AS questions
FROM public.projects p JOIN public.decks d ON d.project_id = p.id
LEFT JOIN public.concepts c ON c.deck_id = d.id
LEFT JOIN public.cards q ON q.deck_id = d.id AND q.concept_id = c.id
WHERE regexp_replace(lower(trim(p.name)), '[^a-z0-9]+', '', 'g') IN ('java', 'java21', 'java27', 'javafundamentals')
  AND regexp_replace(lower(trim(d.name)), '[^a-z0-9]+', '', 'g') IN (
    'typesvariablesandoperators', 'variables', 'typesandvariables', 'variablesdatatypes',
    'controlflow', 'loopsandconditionals'
  )
GROUP BY p.id, p.name, d.id, d.name ORDER BY p.name, d.name;
