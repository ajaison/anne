# 🤖 Master LLM Flashcard Generator & Topic Tracker

Use this document to generate high-quality, edge-case-heavy flashcards for **Project Anne Knowledge App**.

---

## 📌 Master Prompt (Copy & Paste to AI)

Copy everything in the block below and paste it into ChatGPT, Claude, or Gemini when you want to generate cards for a new topic. Simply fill in `[INSERT TOPIC HERE]` and list any subtopics.

```text
Create 10-15 carefully reviewed multiple-choice questions for [INSERT TOPIC HERE].
Target a working Java/React/TypeScript engineer. Specify the relevant language
or framework version. Test concepts, edge cases, code behavior, and realistic
misconceptions; do not generate typed-answer cards.

Return only a valid JSON array. Each item must have:
- question: Markdown question; fenced code is allowed.
- correct_option: the complete correct option in one paragraph or compact code
  block, with no blank lines. Do not include explanatory feedback here.
- distractors: exactly three different, convincing wrong options.
- explanation: why the correct option works and why each alternative fails;
  link official sources and state assumptions when needed.
- card_type: "multiple_choice".
- is_code: true if the question contains code, otherwise false.

Make all four options comparable in length, detail, specificity, grammar, and
formatting. Wrong options should reflect real mistakes, not unrelated answers
or generic compiler/runtime errors unless those are plausible for this question.
Exactly one option must be correct. Avoid "all of the above", "none of the
above", silly distractors, length clues, and references to option letters: the
app shuffles options. Use escaped newlines in JSON strings. Avoid duplicates
of the supplied deck context. Review correctness against official documentation.
```

Example shape:

```json
[
  {
    "question": "A focused conceptual or code-behavior question",
    "correct_option": "The correct explanation or predicted result",
    "distractors": ["A plausible misconception", "Another plausible misconception", "A third plausible misconception"],
    "explanation": "Why the correct option works and each alternative fails. Include official references.",
    "card_type": "multiple_choice",
    "is_code": false
  }
]
```

The app stores correct_option and explanation together in the existing answer
column, separated by a blank line. Older JSON using answer (correct option,
blank line, explanation) is still accepted. Three distinct authored distractors
are required for new multiple-choice imports. Existing incomplete cards are
flagged in the deck and can be repaired with Edit card; they are not given
automatic filler options.

A four-card Java Collections pilot is in
`cards/pilots/java_collections_choices.json`. This is a content sample, not a
complete curriculum or certification assessment.

---

## 📚 Topic Tracker Matrix

The older counts below are historical notes, not verified live imports. The four original local packs contain 20 cards each. Update counts as content is reviewed/imported:

| Topic / Category | Subtopics Covered | Status | Card Count | Last Updated |
| :--- | :--- | :--- | :--- | :--- |
| **Java Syntax & Variables** | Primitive types, Byte overflow, Compound assignment, `var`, Numeric promotion, Integer cache, Floating-point division | 🟢 Completed | 30 | 2026-08-09 |
| **Control Flow & Loops** | Labeled break/continue, Switch expressions (`yield`, `->`), `do-while`, Unreachable code, Floating-point loop counters | 🟢 Completed | 24 | 2026-08-09 |
| **Arrays & Data Structures** | Array covariance, `ArrayStoreException`, `Arrays.equals` vs `deepEquals`, Binary search, Ragged arrays, `array.length` | 🟢 Completed | 20 | 2026-08-09 |
| **Strings & String Pool** | Immutability, String Pool (`.intern()`), `final` constant folding, Text blocks (`"""`), `StringBuilder` capacity & mutability | 🟢 Completed | 23 | 2026-08-09 |
| **OOP & Polymorphism** | Method overloading/overriding, `super`, Virtual method invocation | ⚪ Planned | 0 | - |
| **Exceptions & Try-With-Resources** | Checked vs Unchecked, Suppressed exceptions, `AutoCloseable` | ⚪ Planned | 0 | - |
| **Java Memory Model & Garbage Collection** | Stack vs Heap, GC roots, Generational GC | ⚪ Planned | 0 | - |
| **Collections pilot** | Equality/hash contract, collisions, null lookup, mutable keys | Pilot ready for testing | 4 | 2026-10-04 |
| **Java Concurrency & Threads** | `volatile`, `synchronized`, ReentrantLock, Thread Pool Executors | ⚪ Planned | 0 | - |
| **Streams & Lambdas** | Lazy evaluation, Short-circuiting, Primitive streams | ⚪ Planned | 0 | - |

---

## ⚡ Quick Copy Workflow

1. Open **`CARD_GENERATION_PROMPT.md`**.
2. Copy the **Master Prompt** block above.
3. Replace `[INSERT TOPIC HERE]` with the topic you want next (e.g., *Java Concurrency & Multithreading*).
4. Paste the resulting JSON straight into the deck's **⚡ Bulk Import** panel in the Knowledge App.
5. Update the **Topic Tracker Matrix** table above.
