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

Add a `[data-theme="name"]` block in `src/styles/themes.css` with `--bg`, `--fg`, `--accent`, `--muted`, `--line`, `--danger` and `--scene`. Keep normal text at WCAG AA contrast against `--bg` and frame lines at 3:1 or better.

## Add a scene

Write a painter in `src/scene/ascii.ts` and register its id in `src/scene/scenes/index.ts`. The grid is 120×32 printable ASCII; `put`, `text`, `hline`, `vline` and `box` are the primitives. Painters receive the time of day and a frame number, and two frames are rendered for ambient motion. Art must be deterministic, printable ASCII only, and composed so the centre 64 columns still read on phones.

## Assets

- Only **CC0** or **CC-BY** assets (or your own work). Do not download third-party art into the repo
  without a compatible license.
- Credit every asset in [`CREDITS.md`](CREDITS.md): title, author, source URL and license.
- Scenes and the favicon are drawn in code; no image files are shipped.
