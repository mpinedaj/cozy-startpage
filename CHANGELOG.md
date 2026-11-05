# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

## [1.1.0] - 2026-11-05

Visual redesign: full-screen layered scenes, time-of-day palettes and accessible pixel dialogs.

### Added

- Full-screen pixel-art backdrop: a 320×180 canvas scaled by the smallest integer factor that covers
  the viewport, centred and cropped, never stretched.
- Layered scene system with 3–4 depths, pre-rendered layers, parallax and a 12 FPS loop that pauses
  when the tab is hidden.
- Four new scenes: rainy window, forest dusk, cafe interior and mountain lake, each with 14-colour
  palettes for dawn, day, dusk and night, plus pixel discs and crescents for suns and moons.
- Time-of-day selection (`auto`, `dawn`, `day`, `dusk`, `night`) in settings, stored as `sceneTime`.
- Optional image layers loaded from `public/assets/scenes/<id>/manifest.json`; invalid or missing
  manifests fall back to the procedural art.
- `CREDITS.md` and an asset policy in `CONTRIBUTING.md`.
- Accessible pixel dialogs for editing a link, confirming a delete and showing messages, with
  labelled fields, inline validation, a focus trap, Escape handling and focus restoration.

### Changed

- Link editing and destructive actions no longer use `prompt()`, `alert()` or `confirm()`; every
  dialog is a themed `<dialog>` element.
- The UI now sits on translucent pixel panels over the scene: clock, greeting and search centred,
  links on the left, weather and tasks on the right, stacked on phones.
- Config format is version 2. v1 configs and v1 backups are migrated automatically, including the
  legacy scene ids.
- Screenshots regenerated, with a new scene contact sheet in `docs/screenshots/scenes.png`.

### Fixed

- Gradient bands no longer dither across their full height (which read as noise); dithering is
  limited to the transitions between flat bands.
- Lamp light cones are drawn as sparse motes instead of a checkerboard block.
- Night moons are clipped crescents, so the bite cannot paint over the sky.
- The mountain-lake campfire moved out from behind the widget column.
- Restored the edit/close/reorder glyphs that had been mangled by a text encoding round-trip.

## [1.0.0] - 2026-11-04

First release.

### Added

- Project scaffold (Vite + TypeScript), tooling, CI/deploy workflows, docs skeleton.
- Config, storage with migrations, live clock, greeting and search bar.
- Links CRUD with validation and reorder.
- Scene engine with four single-motif pixel scenes and four themes.
- Dashboard grid with a compact scene widget and reserved Weather / To-do slots.
- Settings dialog with name, language, clock format, ambient particles and motion preference; all
  values persist to the versioned storage key.
- Live localisation: English and Spanish strings for the whole page, switched without a reload.
- Ambient dust motes in the scene side bands, toggled by the effects setting.
- To-do widget with add, toggle, delete, clear done and an empty state, persisted with the rest of
  the config.
- Optional weather card powered by Open-Meteo geocoding and current conditions, with off / no-city /
  loading / error / ready states and a retry action.
- Config backup: export the whole config to a dated JSON file and import one back with validation.
- `tf()` interpolation helper for translated strings with placeholders.
- Playwright end-to-end suite covering links, tasks, language, weather, backup and reduced motion,
  plus a CI job that runs it against the production build.

### Fixed

- Scene art is now drawn from character matrices using only the four theme colors; integer canvas
  scaling and hard pixel edges verified.
- Auto scene now matches the active theme.
- Canvas no longer overpowers the page: fixed 320x180 at 1x and moved all layout/spacing into
  external CSS (no inline styles).
- Scene colors now come from the active theme's CSS variables and update immediately on theme change.
- Reduced motion now freezes the scene on a single painted frame instead of an empty canvas.
- Settings dialog keeps its header and "Done" button fixed while the fields scroll, so the primary
  action stays reachable on short screens.
- Checked checkboxes use the foreground color, so they stay visible on the night theme.
- The CSP now allows the Open-Meteo geocoding host, which previously blocked every weather lookup.
- Secondary text meets WCAG AA contrast: hints, widget metadata and completed tasks no longer fade
  below 4.5:1.
