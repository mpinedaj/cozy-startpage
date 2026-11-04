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
