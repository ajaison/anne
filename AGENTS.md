# Project Anne agent context

Read `main/PROJECT_TRACKER.md` before working on this repository. It is the
canonical project context and roadmap; keep that filename and update it when
significant features, architecture, or priorities change.

For Knowledge work, also read `main/KNOWLEDGE_DESIGN.md`, which records the
2026-10-04 code inspection and proposed developer mastery design. Proposed
features in that document are not implemented features.

For Java curriculum/content authoring, also read
`main/JAVA_CURRICULUM_AUTHORING.md`. It defines the content-first priority,
topic ledger, multiple-choice standards, Java 27 sources, and safe SQL workflow.

- The application and npm scripts live in `main/`; run commands there.
- Anne is a personal mini-app hub for desktop and mobile. The current priority
  is the Knowledge app: Java, React, and TypeScript learning through retrieval,
  varied practical exercises, and spaced repetition.
- Keep app-specific code in `main/src/apps/<app>/`; use `src/shared/` only for
  intentionally shared code. Preserve the existing React/TypeScript/Vite,
  Supabase, Dexie, vanilla CSS, and Framer Motion architecture where practical.
- Extend existing decks and study flows incrementally. Avoid large rewrites.
- Distinguish curriculum coverage, demonstrated mastery, and exam readiness.
  A card count, XP total, or one correct answer is not evidence of mastery.
- Inspect persistence, scheduling, and grading before relying on progress
  metrics. Preserve existing content and learning records during migrations.
