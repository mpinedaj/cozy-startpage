# Plan — cozy-startpage

## Milestones

- [x] 0. chore/project-setup
- [x] 1. feat/core-clock-search
- [x] 2. feat/links
- [x] 3. feat/scene-engine-themes
- [x] 4. feat/settings-effects
- [x] 5. feat/extras
- [x] 6. chore/polish-release

## Milestone 0 tasks

- [x] Scaffold Vite + TS
- [x] Tooling (eslint, prettier, vitest, playwright)
- [x] CI + deploy workflows
- [x] AGENTS.md, docs skeleton, .editorconfig
- [x] Base styles and theme variables

## Milestone 5 tasks

- [x] To-do widget: add, toggle, delete, clear done, empty state
- [x] Weather widget: Open-Meteo geocoding + current conditions
- [x] Weather settings: enable flag and city
- [x] Config export to JSON
- [x] Config import with validation and version guard
- [x] EN/ES strings for both widgets and backup

## Milestone 6 tasks

- [x] Playwright e2e suite against the production build
- [x] e2e job in CI, traces uploaded on failure
- [x] README with screenshots, privacy notes and local setup
- [x] Accessibility pass: page heading, weather live region, AA contrast for secondary text
- [x] Version 1.0.0, changelog and release tag

# Phase 2 — from 1.0 to 1.3

## Version 1.1 — Visual redesign

- [x] 7. `feat/fullscreen-scene`

  - [x] Full-viewport canvas background, integer cover scaling, no non-uniform stretch
  - [x] Layered scene system with parallax (3+ depths), 12–16 colour palettes, dithering, ramps
  - [x] Time-of-day palette variants (dawn / day / dusk / night) with auto mode
  - [x] Four new full scenes: window with rain, forest dusk, cafe interior, mountain lake
  - [x] Optional image layers from `public/assets/scenes/<id>/manifest.json`, procedural fallback
  - [x] `CREDITS.md` and ASSETS policy in CONTRIBUTING (CC0 / CC-BY only, credited)
  - [x] UI as pixel panels over the scene: centred clock/search, links and widgets as panels
  - [x] Visual review with Playwright screenshots across scene × time × theme, desktop and phone

- [ ] 8. `feat/pixel-dialogs`

  - [ ] Accessible pixel dialogs for editing a link, confirmations and messages
  - [ ] Focus trap, Esc, labelled fields, no `prompt()` / `alert()` / `confirm()` left
  - [ ] e2e coverage for every dialog flow

- [ ] Release `v1.1.0`: README screenshots, CHANGELOG, tag and release.

## Version 1.2 — Personalization

- [ ] 9. `feat/backgrounds`

  - [ ] Background source: built-in scene, solid colour, user image or GIF
  - [ ] Uploads in IndexedDB (8 MB cap, png / jpg / webp / gif validation, remove option)
  - [ ] GIF through an `<img>` layer, static images through CSS/canvas with pixelated rendering
  - [ ] Readability overlay / dim slider; exports never include uploads (stated in the UI)

- [ ] 10. `feat/themes-fonts`

  - [ ] Custom theme editor with derived shadow and live preview
  - [ ] WCAG AA contrast warning; several saved custom themes; export/import one theme
  - [ ] New built-in themes: sakura, ocean, sunset
  - [ ] Optional auto theme by time of day
  - [ ] Font selector (Pixelify Sans, Press Start 2P, VT323, Silkscreen) and clock size M/L/XL

- [ ] 11. `feat/layout-widgets`

  - [ ] Show/hide and reorder widgets; layout presets (centred, sidebar left, sidebar right)
  - [ ] Focus mode implemented (scene + clock only) with a toggle
  - [ ] Keyboard shortcuts (focus search, settings, focus mode) and a help dialog
  - [ ] Shortcuts never fire while typing in inputs

- [ ] 12. `feat/links-v2`

  - [ ] Link groups / folders
  - [ ] Custom icons: emoji or a built-in pixel icon set drawn in code
  - [ ] Import browser bookmarks (HTML export) with validation
  - [ ] Custom search engines from a validated https URL template
  - [ ] Drag-and-drop ordering that keeps the up/down buttons for keyboard users

- [ ] 13. `feat/extra-widgets`

  - [ ] Quick notes widget
  - [ ] Pomodoro with configurable focus/break lengths, countdown in the title, opt-in sound
  - [ ] Temperature unit toggle (°C / °F)

- [ ] 14. `feat/presets`

  - [ ] Named presets for theme, background reference, layout, widgets and fonts
  - [ ] Import/export presets as JSON
  - [ ] `presets/` folder with three example presets and contribution docs
  - [ ] v1 → v2 migration covered by a real v1 backup fixture

- [ ] Release `v1.2.0`: README, CHANGELOG, screenshots, tag and release.

## Version 1.3 — Extension and polish

- [ ] 15. `feat/browser-extension`

  - [ ] Second build target `npm run build:extension` → `dist-extension/`
  - [ ] Manifest V3 with `chrome_url_overrides.newtab`, minimum permissions, extension CSP
  - [ ] Chrome / Edge / Brave and Firefox fields, zip script
  - [ ] Sideloading documented in the README; nothing published to any store

- [ ] 16. `chore/polish-release`

  - [ ] Accessibility, performance (idle CPU, large backgrounds, load time) and docs pass
  - [ ] Animation audits, break-UI pass (huge/empty data, bad imports, tiny screens, keyboard, storage off)
  - [ ] Final README with screenshots/GIF, CHANGELOG, tag and release `v1.3.0`
