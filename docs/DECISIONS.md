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
