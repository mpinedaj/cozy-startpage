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

## 2026-11-03 — Fix: dashboard layout and compact scene

- Restructured the page as a CSS Grid dashboard: clock/search and links on the left, a 360px sidebar with the scene card and two reserved Phase 2 slots (Weather, To-do).
- Shrank the canvas to a compact 320x180 widget at exactly 1x; `box-sizing: content-box` keeps borders from producing a fractional scale.
- Moved all layout and spacing into `src/styles/base.css`; no inline styles are emitted anywhere in the DOM.
- Scenes now read `--bg`, `--fg`, `--accent` and `--muted` from the active `data-theme`, so switching themes repaints the canvas immediately.
- Motifs scaled up inside the compact canvas, with time-of-day details (steam, leaves/fireflies, flame speed, stars).
- Responsive: stacks at 820px, links first on mobile; verified no horizontal overflow at 390px.
- Next: Milestone 4 settings and effects.

## 2026-11-03 — Milestone 4: settings and effects

- Added a native `<dialog>` settings panel (name, language, clock format, ambient particles, motion) opened from a button above the scene card. Every change saves immediately to the single versioned key.
- Added live localisation: EN/ES strings for the dashboard, scene controls, links and dialog; switching language re-localises the DOM, links and clock without a reload.
- Added `prefersReducedMotion()` helper plus tests; the engine now paints one static frame when motion is reduced and resumes when it is not.
- Added optional ambient dust motes drawn in the scene side bands, controlled by the "Ambient particles" setting.
- All layout and control styling lives in `src/styles/base.css`; verified no inline styles, no horizontal overflow, and a dialog that fits a 390px viewport.
- Next: Milestone 5 extras (weather, to-do).
