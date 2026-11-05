# Contributing

## Run locally

```
npm install
npm run dev
```

## Quality gates

```
npm run format:check
npm run typecheck
npm run lint
npm run test
npm run build
npm run e2e
```

The first e2e run needs browsers: `npx playwright install chromium`.

## Add a theme

Add a `[data-theme="name"]` block in `src/styles/themes.css` with the four palette variables.

## Add a scene

Create a file in `src/scene/scenes/` implementing the `Scene` interface and register it in
`src/scene/scenes/index.ts`. A scene provides 3–4 layers with a `depth` each, and a palette for every
time of day (`dawn`, `day`, `dusk`, `night`) using 14 hex colours. Paint with integer coordinates and
`fillRect`; gradients must go through the Bayer helpers in `src/scene/dither.ts`.

## Assets

- Only **CC0** or **CC-BY** assets (or your own work). Do not download third-party art into the repo
  without a compatible license.
- Credit every asset in [`CREDITS.md`](CREDITS.md): title, author, source URL and license.
- Optional scene image layers belong in `public/assets/scenes/<scene-id>/` next to a `manifest.json`:

  ```json
  {
    "id": "rainy-window",
    "layers": [
      { "file": "sky.png", "depth": 0.1 },
      { "file": "rain.png", "depth": 0.9, "frames": 4, "fps": 8 }
    ]
  }
  ```

  `depth` is `0..1` (parallax strength), `frames` is `1..64`, `fps` is `0..24`, and a manifest may
  declare at most 8 layers. File names must be a single safe name (letters, digits, `_`, `.`, `-`)
  ending in `.png`, `.jpg`, `.jpeg`, `.webp` or `.gif`. The manifest is validated at runtime and the
  procedural art is always the fallback.
