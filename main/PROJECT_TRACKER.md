# Project Anne - Development Tracker & AI Context

This file serves as a comprehensive guide and long-term context tracker for "Project Anne". It is specifically designed to get new AI coding sessions quickly up to speed on what we are building, where everything is located, and what the roadmap looks like.

## 🎯 Vision & Concept
The purpose of this site is to serve as a **personal hub of small applications** designed to solve personal problems and host personal projects for the user. 
Rather than having multiple disconnected websites, everything is unified under a single dashboard. 

## 🏗️ Architecture & File Structure

The project lives under the `main/` directory and is organized into a modular app structure.

```text
main/
├── src/
│   ├── apps/
│   │   ├── hub/         # The main entry/dashboard that links to other mini-apps
│   │   ├── birthday/    # The girlfriend's birthday game app
│   │   └── knowledge/   # "2nd Brain" - Brainscape/Anki/Notion clone using Supabase
│   ├── shared/          # Shared components, hooks, utilities used across apps
│   ├── App.tsx          # Main React router and app shell configuration
│   ├── main.tsx         # React entry point
│   └── index.css        # Global CSS variables and vanilla CSS styles (No Tailwind)
├── index.html           # HTML template
├── package.json         # Project dependencies and definition
└── vite.config.ts       # Vite bundler configuration
```

### 🧰 Technology Stack
*   **Core:** React 19, TypeScript, Vite
*   **Routing:** React Router v7 (`react-router-dom`)
*   **Styling:** Vanilla CSS (`index.css`) with rich, modern design aesthetics (glassmorphism, vibrant colors, gradients). Tailwind CSS is *not* used.
*   **Animations:** `framer-motion` for micro-interactions and page transitions, prioritizing a dynamic, premium feel. 
*   **Icons:** `lucide-react`
*   **Backend / Database:** Supabase (`@supabase/supabase-js`) is used as our backend-as-a-service (BaaS), specifically managing the relational database for our knowledge tracking app.
*   **PWA:** `vite-plugin-pwa` is configured to enable "Add to Home Screen" on iOS and provide the foundation for offline access.

## 📱 Sub-Applications

### 1. Hub / Dashboard (`src/apps/hub/`)
*   **Purpose:** The central navigation point where all small personal applications can be launched.
*   **Status:** Active/Ongoing

### 2. Birthday Game App (`src/apps/birthday/`)
*   **Purpose:** A birthday-themed application containing several mini-games (Wordle, Trivia, Love Letter, Connections, Balloon Pop, Candle "Make a Wish"). 
*   **Features:** Password-protected entry, progress tracking, background music, memory carousels, and an overarching "reward" system.
*   **Status:** Mostly complete (needs occasional refining).

### 3. Knowledge / "2nd Brain" App (`src/apps/knowledge/`)
*   **Purpose:** A comprehensive Brainscape/Anki/Notion clone designed to store long-term knowledge and assist with learning via Spaced Repetition (SRS).
*   **Backend Integration:** Utilizing a Supabase backend to store entities like Projects, Decks, and Flashcards within a relational database. Memory tracking and spaced repetition algorithms are central to this app.
*   **Current Focus:** Developing study sessions, memory interval tracking, responsive mobile/desktop design, and polishing the UI.
*   **Status:** In Progress. 

---

## 📋 Task Tracker

### To Do (Backlog)
*   [ ] Refine spacing, typography, and responsive layouts across the Knowledge app.
*   [ ] Implement "Download for Offline" logic using IndexedDB to store flashcards locally.
*   [ ] Integrate Spaced Repetition (SRS) algorithms to update card review dates in Supabase.
*   [ ] Ensure flawless mobile experience for the study sessions.

### In Progress
*   (nothing currently — all major items complete)

### Done
*   [x] Initial setup and Github repository connection.
*   [x] Completion of core Birthday Game web app features.
*   [x] Connecting Supabase client and setting up the basic table structure for the Knowledge app.
*   [x] Configured PWA infrastructure for iOS setup.
*   [x] **Advanced SRS Algorithm**: Implemented prioritized review logic (Due -> New -> Cram fallback).
*   [x] **Rich Media Flashcards**: Added Markdown, Prism syntax highlighting, and Image URL support.
*   [x] **AI Workflow**: Implemented "Context Export" and "Bulk Import" features for rapid card generation.
*   [x] **Mobile Optimization**: Fixed Hub Dashboard and Knowledge Hub layout issues for narrow screens.
*   [x] **Interactive Study Modes**: Added 4 study modes to StudySession — Multiple Choice (auto-generated distractors from sibling cards), Fill in the Blank (Java keyword auto-extraction), Type Answer (Levenshtein fuzzy match), Classic flip. Mode is auto-selected per card based on card_type field and session index.
*   [x] **Session Gamification**: XP flash animation (+10/+15 XP), streak badge (🔥), animated Session Summary screen with accuracy %, XP, best streak, and per-card breakdown.
*   [x] **Quick Add Panel**: Floating slide-in panel (⚡ Quick Add button in DeckView) for rapid card creation. Supports Cmd+Enter to save & reset, auto-detects Java code, mode selector dropdown.
*   [x] **Java Syntax Highlighting Upgrade**: vscDarkPlus theme, JetBrains Mono font, java-orange accent border on all code blocks, line numbers, and copy-to-clipboard button.
*   [x] **Supabase Schema**: Added `card_type TEXT DEFAULT 'classic'` and `distractors TEXT[]` columns to cards table. Dexie local schema bumped to v2.
*   [x] **Smart Distractor Fallbacks**: Enhanced `MultipleChoiceCard` to prevent full paragraph sibling answer pull-in; now uses structural length matching and domain-specific fallbacks (Compiler Errors, numeric offsets, boolean pairs).
*   [x] **Paced Study Session Flow**: Removed auto-advance timers on interactive cards; added explicit **Next Question ➔** buttons with `Enter`/`Space` keyboard shortcuts for comfortable self-paced learning.
*   [x] **Session Navigation**: Added **← Prev** button in StudySession header allowing backward/forward card navigation during study sessions.
*   [x] **80 Core Java Mastery Flashcards**: Generated 4 modular JSON card packs (20 cards each across Variables, Control Flow, Arrays, and Strings & String Pool) adhering to senior engineering specs.

---

## 🔮 Future Vision: "The Loom" (Journal + SRS)
A future concept to merge long-form journaling with memory retention.
*   **Concept**: Write thoughts/ideas freely and extract flashcards automatically.
*   **Features**:
    *   Markdown Note Editor with specific SRS tagging syntax.
    *   AI "Memory Extraction" to suggest flashcards from journal entries.
    *   "Incremental Reflection": SRS prompts to review past thoughts/memories, not just facts.
    *   Bidirectional linking between cards and the source notes/journals.

---

## 🤖 Guide for Future AI Sessions

When starting a new session:
1.  **Read this document** entirely to understand the scope and current goals.
2.  **Navigate to the `main/` directory** within the terminal before running any scripts (e.g. `cd main && npm run dev`). 
3.  **Adhere to UI/UX Principles**: 
    *   Maintain a premium, dynamic interface using Vanilla CSS and Framer Motion.
    *   Never use generic designs. Implement modern visual styles (curated harmonious colors, modern typography, glassmorphism).
4.  **Keep it Modular**: Make sure code written for one app stays within its respective directory under `src/apps/` unless it is explicitly intended to be a reusable component in `src/shared/`.
5.  **Update this Tracker**: Any significant architectural changes, new feature additions, or updates to the roadmap must be reflected in this file to keep it accurate.
