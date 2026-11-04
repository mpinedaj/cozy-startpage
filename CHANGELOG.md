# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

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
