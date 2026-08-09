# 🤖 Master LLM Flashcard Generator & Topic Tracker

Use this document to generate high-quality, edge-case-heavy flashcards for **Project Anne Knowledge App**.

---

## 📌 Master Prompt (Copy & Paste to AI)

Copy everything in the block below and paste it into ChatGPT, Claude, or Gemini when you want to generate cards for a new topic. Simply fill in `[INSERT TOPIC HERE]` and list any subtopics.

````markdown
You are a Principal Java Architect and FAANG Senior Technical Interviewer creating high-impact flashcards for a software engineer striving for Java mastery.

### Task:
Generate a JSON array of 10-15 high-quality, challenging flashcards on the topic: **[INSERT TOPIC HERE]**.

### Guidelines & Rules:

1. **Senior Developer & Career Mastery Focus:**
   - Focus on senior-level concepts: JVM memory model (stack, heap, escape analysis), Concurrency & Thread Safety (happens-before, volatile, CAS), Type System traps (erasure, covariance vs invariance, numeric promotion), and Modern Java 17/21 (Virtual Threads, Records, Sealed Classes, Switch Pattern Matching).

2. **Multiple Choice Distractor Matching (CRITICAL):**
   - Distractors MUST match the EXACT format, length, and structural tone of the correct answer. Never pair a 2-word answer with multi-sentence distractors.
   - For code output questions, distractors MUST be plausible alternative outputs, off-by-one results, or realistic compiler error messages (e.g. `Compiler Error: incompatible types`, `Throws NullPointerException at runtime`).
   - NEVER use silly, obvious, or unrelated options.

3. **Explanations with Production Context ("Why It Matters"):**
   - The `answer` field must state the direct result AND provide a 2-3 sentence architectural explanation of the underlying JVM/language specification rule and its impact on production code (preventing memory leaks, race conditions, or performance bottlenecks).

4. **Card Variety:**
   - `multiple_choice`: Tricky code output, evaluation order, or edge case choices.
   - `type_answer`: Exact method names, short output numbers, or precise keyword answers.
   - `fill_in_the_blank`: Missing syntax or key keywords in code snippets.
   - `classic`: Deep architectural questions and JVM internal explanations.

5. **Code Formatting:**
   - Format code using triple backticks: ```java ... ```. Set `"is_code": true` whenever code is present.

6. **JSON Output Format ONLY:**
   Return ONLY a valid JSON array without surrounding commentary:

```json
[
  {
    "question": "Markdown formatted question with ```java code blocks if applicable",
    "answer": "Direct Answer.\n\nDeep architectural explanation of the JVM/compiler rule and production impact.",
    "card_type": "multiple_choice | type_answer | fill_in_the_blank | classic",
    "distractors": ["Plausible wrong option 1", "Plausible wrong option 2", "Plausible wrong option 3"],
    "is_code": true
  }
]
```
````

---

## 📚 Topic Tracker Matrix

Keep track of which topics have flashcards generated in your deck:

| Topic / Category | Subtopics Covered | Status | Card Count | Last Updated |
| :--- | :--- | :--- | :--- | :--- |
| **Java Syntax & Variables** | Primitive types, Byte overflow, Compound assignment, `var`, Numeric promotion, Integer cache, Floating-point division | 🟢 Completed | 30 | 2026-08-09 |
| **Control Flow & Loops** | Labeled break/continue, Switch expressions (`yield`, `->`), `do-while`, Unreachable code, Floating-point loop counters | 🟢 Completed | 24 | 2026-08-09 |
| **Arrays & Data Structures** | Array covariance, `ArrayStoreException`, `Arrays.equals` vs `deepEquals`, Binary search, Ragged arrays, `array.length` | 🟢 Completed | 20 | 2026-08-09 |
| **Strings & String Pool** | Immutability, String Pool (`.intern()`), `final` constant folding, Text blocks (`"""`), `StringBuilder` capacity & mutability | 🟢 Completed | 23 | 2026-08-09 |
| **OOP & Polymorphism** | Method overloading/overriding, `super`, Virtual method invocation | ⚪ Planned | 0 | - |
| **Exceptions & Try-With-Resources** | Checked vs Unchecked, Suppressed exceptions, `AutoCloseable` | ⚪ Planned | 0 | - |
| **Java Memory Model & Garbage Collection** | Stack vs Heap, GC roots, Generational GC | ⚪ Planned | 0 | - |
| **Collections Framework** | `HashMap` bucket collisions, `ConcurrentModificationException`, `Fail-fast` vs `Fail-safe` | ⚪ Planned | 0 | - |
| **Java Concurrency & Threads** | `volatile`, `synchronized`, ReentrantLock, Thread Pool Executors | ⚪ Planned | 0 | - |
| **Streams & Lambdas** | Lazy evaluation, Short-circuiting, Primitive streams | ⚪ Planned | 0 | - |

---

## ⚡ Quick Copy Workflow

1. Open **`CARD_GENERATION_PROMPT.md`**.
2. Copy the **Master Prompt** block above.
3. Replace `[INSERT TOPIC HERE]` with the topic you want next (e.g., *Java Concurrency & Multithreading*).
4. Paste the resulting JSON straight into the deck's **⚡ Bulk Import** panel in the Knowledge App.
5. Update the **Topic Tracker Matrix** table above.
