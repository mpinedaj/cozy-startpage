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
