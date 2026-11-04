# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Added

- Project scaffold (Vite + TypeScript), tooling, CI/deploy workflows, docs skeleton.
- Config, storage with migrations, live clock, greeting and search bar.
- Links CRUD with validation and reorder.
- Scene engine with four single-motif pixel scenes and four themes.
- Dashboard grid with a compact scene widget and reserved Weather / To-do slots.
- Settings dialog with name, language, clock format, ambient particles and motion preference; all values persist to the versioned storage key.
- Live localisation: English and Spanish strings for the whole page, switched without a reload.
- Ambient dust motes in the scene side bands, toggled by the effects setting.

### Fixed

- Scene art is now drawn from character matrices using only the four theme colors; integer canvas scaling and hard pixel edges verified.
- Auto scene now matches the active theme.
- Canvas no longer overpowers the page: fixed 320x180 at 1x and moved all layout/spacing into external CSS (no inline styles).
- Scene colors now come from the active theme's CSS variables and update immediately on theme change.
- Reduced motion now freezes the scene on a single painted frame instead of an empty canvas.
