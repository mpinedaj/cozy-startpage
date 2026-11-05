# Decisions (ADR-style)

## 0001 — TypeScript ~5.9 instead of 7.x

Context: Vite scaffold shipped TypeScript ~7.0; typescript-eslint peer range is <6.1.
Decision: Pin TypeScript to ~5.9.3.
Consequences: Loses TS 7 features; gains lint compatibility. Revisit when typescript-eslint supports TS 7.

## 0002 — Single-motif scenes drawn from character matrices

Context: The first scene pass used flat bands and tiny props, invented colors and no focal point.
Decision: Each scene is one centered motif stored as a 2D character matrix. Only the four theme colors are allowed (`cream`, `coffee`, `moss`, `rose`), mapped to `bg`, `ink`, `accent`, `secondary`. Sprites are rendered with `fillRect` at integer scales; no anti-aliasing.
Consequences: Scenes read clearly at a glance and stay tied to the theme. Less environmental variety, but far more intentional art. Adding a scene means adding one matrix file.

## 0003 — Auto scene follows the theme

Context: A steaming mug belongs to the cafe theme, a tree to forest, a candle to lavender and a moon to night. Time-of-day still drives the greeting and will drive ambient effects.
Decision: `scene: 'auto'` selects the motif from the active theme instead of the hour.
Consequences: The page stays coherent when the user switches themes. Time-of-day scene switching is replaced by theme-driven switching; documented here because it differs from the original brief.

## 0004 — Dashboard grid with a compact scene widget

Context: A full-width canvas dominated the page and pushed the clock, search and links into a single vertical stack with no room reserved for Phase 2 widgets.
Decision: Layout is a two-column CSS Grid (hero + links on the left, a 360px sidebar on the right). The sidebar holds the scene card plus dashed Weather and To-do placeholder slots. The canvas buffer stays 320x180 and is displayed at exactly 1x inside the card, with `box-sizing: content-box` so borders never shrink the content to a fractional scale. On narrow screens the grid stacks and links move above the widgets. All layout lives in `src/styles/base.css`; no element receives an inline `style`.
Consequences: The scene reads as a compact widget, the dashboard has obvious reserved space for Phase 2, and pixel art stays integer-crisp at every breakpoint.

## 0005 — Settings live in a native dialog, applied on change

Context: Milestone 4 needs name, language, clock format, effects and motion settings without adding a framework or a second storage key.
Decision: Use a native `<dialog>` element with `showModal()`, built with DOM APIs in `src/main.ts`. Each control writes to `config`, calls `saveConfig()` and applies its effect immediately; there is no "Save" button, only "Done". Localisation uses `data-i18n`, `data-i18n-placeholder` and `data-i18n-aria` attributes so `applyLanguage()` can re-localise the whole page without a reload. `margin: auto` is set explicitly on the dialog because the global margin reset overrides the UA centring.
Consequences: Settings are one interaction away and never lost mid-edit, and the dialog traps focus for free. The trade-off is a small amount of manual DOM wiring, which keeps the bundle framework-free.

## 0006 — Weather is opt-in, stateless and never trusted

Context: The weather widget needs a city and a forecast without an API key, an account, or a backend, and the page must stay privacy-friendly.
Decision: Use Open-Meteo geocoding plus the current-conditions endpoint, both called from the browser. The stored config keeps only `weather.enabled` and the city name; forecast values live in memory and are refreshed when the page loads, when the setting changes, or on an explicit retry. Responses are parsed through shape guards instead of being trusted, and only two hosts are added to the CSP `connect-src`. Weather is off by default, so a fresh install makes no third-party request.
Consequences: The first paint after enabling weather needs a network round trip and can fail, which is why the widget has explicit off / no-city / loading / error / ready states. Stale responses are dropped by comparing request ids. Nothing about the forecast is persisted, so the exported config stays small and portable.

## 0007 — Import goes through the storage normaliser

Context: Importing a JSON file is the easiest way to corrupt a config: unknown fields, wrong types, or a file written by a future version.
Decision: `importConfig()` rejects malformed JSON, non-objects and files whose `version` is newer than `CONFIG_VERSION`, then hands the object to the same `migrate()` used for `localStorage`. The UI replaces the live config with the result and re-applies theme, scene, motion, language and widgets in one place.
Consequences: A hand-edited file behaves exactly like old stored data: unknown fields are ignored and invalid links or tasks are filtered out. Import can never crash the page, and future migrations only have to be written once.

## 0008 — End-to-end tests run against the production build

Context: Unit tests cover the pure logic, but the settings dialog, the widgets and the storage wiring only exist in the DOM. Testing them against `vite dev` would exercise different module loading and CSS than what ships.
Decision: Playwright starts `npm run build && npm run preview` (its `webServer` config) and drives the real bundle on port 4173. Third-party calls are mocked with `page.route`, so the suite never touches the network. Every test seeds a config into `localStorage`, reloads, then asserts both the UI and the stored value. CI runs the same command in a separate job.
Consequences: The suite catches integration bugs that unit tests cannot (it found the file input being wiped by re-localisation), at the cost of one browser download in CI.

## 0009 — Full-bleed layered scenes with their own palettes

Context: v1 drew one small motif per scene with only the four UI theme colours. It read as a widget, had no depth, and every scene inherited the theme's flat palette. Phase 2 asks for a full-screen backdrop, parallax, dithering and time-of-day variants without making the UI unreadable.

Decision:

- The canvas is a fixed, full-viewport backdrop behind the panels. It keeps a 320×180 logical buffer and is scaled by the smallest integer factor that covers the viewport (`coverScale`), then centred and cropped. It never stretches non-uniformly; `image-rendering: pixelated` keeps every pixel hard.
- Scenes are built from 3–4 layers painted once into offscreen canvases of 320×180 plus a 40 px bleed on each side. Each layer declares a depth and drifts up to 10 px horizontally at different rates. The engine runs on a 12 FPS accumulator, paints a single frame when motion is reduced, and pauses when the tab is hidden.
- Every scene ships a 14-colour palette per time of day (`dawn`, `day`, `dusk`, `night`), independent from the UI theme. The theme only applies a 6% `--scene-tint` overlay, so the art keeps its own light while the page stays coherent.
- Gradients use a 4×4 Bayer matrix, but only inside a narrow transition window; the rest of each band stays flat. This avoids the full-height checkerboard that made the first pass look like noise.
- The four v1 motif scenes were removed. Their ids are mapped to the closest new scene (`mug`→`cafe-interior`, `tree`→`forest-dusk`, `candle`→`rainy-window`, `moon`→`mountain-lake`) so old configs keep working.
- Image layers are optional and procedural art is always the fallback: `public/assets/scenes/<id>/manifest.json` is validated before any file is requested (safe file names, depth 0..1, frames 1..64, fps 0..24, at most 8 layers). Missing or invalid manifests resolve to an empty list.

Consequences: Art code is larger, but there is no new dependency and no external request. Scenes must compose for a crop-safe centre (at 1280×900 the outer 32 buffer pixels are cropped) and for panels covering the middle band. Adding a scene means one file with four palettes and layers; themes can change without redrawing any art.

## 0010 — Config v2: scene ids and time of day

Context: v1 stored a motif scene id and had no way to choose a time of day. Changing the scene shapes required a storage format change.

Decision: Bump `CONFIG_VERSION` to 2. `scene` stays `'auto' | SceneId`, and a new `sceneTime` field is `'auto' | 'dawn' | 'day' | 'dusk' | 'night'`. `normalizeScene()` accepts v2 ids, translates the four legacy motif ids, and falls back to `auto` for anything else. The same normaliser runs for `localStorage` and imported JSON, so a v1 backup is migrated on import and rewritten at the next save. Tests cover a full v1 backup, every legacy id, unknown values and invalid `sceneTime`.

Consequences: Old backups keep working without a second code path, and future scenes need no new config fields. Export files now say `"version": 2`; files from a newer version are still rejected.

## 0011 — Native `<dialog>` behind a small dialog module

Context: v1 edited links with `prompt()` and reported errors with `alert()`. Those block the page, cannot be styled, ignore the pixel-art direction and behave differently in every browser. The settings panel already uses `<dialog>`, so the platform primitive is proven in this codebase.

Decision: A single module (`src/ui/dialog.ts`) builds `<dialog>` elements on demand and opens them with `showModal()`. Form dialogs resolve `Promise<Record<string, string> | null>`, message dialogs resolve `void` and confirm dialogs resolve `boolean`. Validation runs in the submit handler and writes an inline `role="alert"` message, so a bad URL keeps the dialog open instead of opening a second one. A keydown handler wraps Tab/Shift+Tab across the dialog's controls, `cancel` (Escape) resolves as a cancel, and closing removes the element; the browser restores focus to the opener. Every label, button and message is created with DOM APIs and `data-i18n`, so live language switching also relabels an open dialog.

Consequences: No dependency, no blocking native popups, and the visuals follow the theme. Dialogs are created per use, which is cheap and avoids stale values. Future flows (task confirmation, font picker, background upload) can reuse the module instead of adding another one-off overlay.
