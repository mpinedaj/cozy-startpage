# Progress log

## 2026-11-03 — Milestone 0: project setup
- Scaffolded Vite + TypeScript (vanilla-ts).
- Added ESLint, Prettier, Vitest, Playwright.
- Created AGENTS.md, docs skeleton, CI/deploy workflows, PR/issue templates, .editorconfig.
- Downgraded TypeScript to ~5.9 for typescript-eslint compatibility.
- Next: Milestone 1 core clock/search.

## 2026-11-03 — Milestone 1: core clock + search
- Config model, storage + migrations, URL validation, time-of-day, greeting, search bar.
- Tests: storage, validation, time-of-day, greeting.
- Next: Milestone 2 links.

## 2026-11-03 — Milestone 2: links
- Added links CRUD (add, edit, delete, reorder) with http/https validation and persistence.
- Tests for add/update/remove/move and invalid URLs.
- Next: Milestone 3 scene engine and themes.

## 2026-11-03 — Milestone 3: scene engine and themes
- Added scene engine (12 FPS cap, pause when hidden, reduced-motion static frame), 4 themes, time-of-day logic.
- First scene pass shipped 3 scenes; later replaced by the motif pass below.
- Next: review the scene look.

## 2026-11-03 — Fix: scene art direction
- Replaced banded landscapes with four single-motif scenes (mug, tree, candle, moon), each drawn from a character matrix.
- Restricted scene colors to the four theme roles: cream, coffee, moss, rose. Removed invented colors.
- Auto scene now follows the theme (cafe→mug, forest→tree, lavender→candle, night→moon).
- Enforced integer canvas scaling: 320x180 buffer at exactly 3x on desktop, 1x on mobile. Verified `image-rendering: pixelated` and hard edges.
- Added sprite matrix tests (rectangular, allowed symbols) and basic page styling so the scene reads in context.
- Next: Milestone 4 settings and effects.
