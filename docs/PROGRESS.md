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

## 2026-11-03 — Milestone 5: weather, to-do and backup

- Replaced the reserved sidebar slots with real widgets: a to-do list (add, toggle, delete, clear done, empty state) and an opt-in weather card.
- Weather uses Open-Meteo geocoding plus the current-conditions endpoint. Only the city and the on/off flag are stored; the forecast is fetched on demand with an 8s timeout and a retry button.
- Added the geocoding host to the CSP `connect-src`, which was silently blocking the lookup.
- Added config export to a dated JSON file and import with the same normaliser used for storage, plus a guard against files from a newer version.
- Moved the settings dialog to a fixed header and footer with a scrollable body, so "Done" stays reachable on small screens.
- Fixed the checked checkbox fill: it used `--accent`, which was nearly invisible on the night theme; it now uses `--fg`.
- Tests: tasks, weather URL builders and parsers, portable config, i18n interpolation (62 total).
- Next: Milestone 6 polish and release.

## 2026-11-04 — Milestone 6: polish and release

- Added a Playwright suite (12 specs) that runs against the production build: links, tasks, language switching, weather (mocked, including the failure path), export/import, reduced motion and the phone layout.
- Added an `e2e` job to CI that installs Chromium and uploads traces when it fails.
- Rewrote the README: what it does, live demo, privacy, how to run it, where to customise, commands, structure and screenshots. Screenshots are committed under `docs/screenshots/`.
- Accessibility pass: hidden `<h1>` for the page, `aria-live` on the weather message, and secondary text moved from 0.7/0.75 opacity to 0.85 so hints, widget metadata and completed tasks clear WCAG AA contrast.
- First release: version 1.0.0, changelog folded into a dated section, tag pushed.

## 2026-11-05 — Milestone 7: full-screen layered scenes

- Replaced the compact scene widget with a full-viewport backdrop canvas. It keeps a 320×180 logical buffer, scales by the smallest integer factor that covers the viewport (`coverScale`), centres the result and crops the overflow. No non-uniform stretch, `image-rendering: pixelated` keeps every edge hard.
- New scene system: 3–4 layers painted once into offscreen canvases with a 40 px bleed, depth-based horizontal parallax capped at 10 px, a 12 FPS accumulator, and a single static frame when motion is reduced. The loop pauses while the tab is hidden.
- Four new full scenes replace the v1 motifs: `rainy-window`, `forest-dusk`, `cafe-interior` and `mountain-lake`. Each ships a 14-colour palette for dawn, day, dusk and night, independent from the UI theme; the theme only applies a 6% `--scene-tint` so the art keeps its own light.
- Suns and moons are pixel discs; night variants use a clipped crescent so the bite never paints into the sky. Gradient bands use a 4×4 Bayer dither only inside a narrow transition window (`edge = 0.08`); the rest of each band stays flat.
- Config v2: new `sceneTime` (`auto | dawn | day | dusk | night`), `normalizeScene()` accepts the new ids and maps the legacy motifs (`mug`→`cafe-interior`, `tree`→`forest-dusk`, `candle`→`rainy-window`, `moon`→`mountain-lake`). Stored v1 configs and v1 imports are migrated in place.
- Optional image layers: `public/assets/scenes/<id>/manifest.json` is validated (safe file names, depth 0..1, frames 1..64, fps 0..24, at most 8 layers) and falls back to the procedural art. No third-party assets are shipped.
- UI reworked as translucent pixel panels (93% panel background) over the scene: clock, greeting and search centred; links on the left; weather and tasks on the right. Mobile stacks hero → links → widgets.
- Settings dialog now selects scene and time of day as well as theme; changes apply immediately and persist.
- Visual review: rendered every scene × time of day × theme combination at 1280×900 and 390×844 (64 frames each) as contact sheets, plus full-size frames. Fixes that came out of it: full-height dithered gradients read as noise (now narrow transitions), lamp light cones were checkerboards (now sparse dust motes), crescent moons painted their bite into the sky (now clipped), the mountain campfire sat behind the widget column (moved left), and the UI hint glyphs had been UTF-8 mangled.
- Tests: 76 unit tests (config migration, palettes, `coverScale`, manifest validation, scene lookup) and 16 Playwright specs (viewport coverage, scene/time/theme switching, auto mode, v1 import, reduced motion, phone layout).
- Next: Milestone 8 pixel dialogs.
