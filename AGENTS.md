# AGENTS.md — cozy-startpage

## Project

Customizable browser start page / new-tab page with a cozy ASCII terminal look. No backend, no analytics, no tracking, no accounts. Hosted on GitHub Pages.

## Stack

- Vite + TypeScript (vanilla-ts), strict mode, ES modules. No frameworks.
- DOM for UI. The backdrop is a full-viewport `<pre>` holding a 120×32 character grid (the centre 64 columns on phones), sized to the viewport and centred.
- Plain CSS with custom properties. Four dark terminal themes via `data-theme` on `<body>`. Square corners, 1px solid/dashed rules, bracket buttons and headings.
- Scene art is printable ASCII generated in `src/scene/ascii.ts` for every time of day. Do not paint scene art with theme colours; the theme only colours the glyphs.
- System monospace font stack; no webfont dependency.
- Storage: `localStorage`, one versioned key, wrapped in try/catch.
- Optional weather: Open-Meteo (no API key).
- Tooling: ESLint (typescript-eslint), Prettier, Vitest, Playwright, GitHub Actions.

## Commands

- `npm run dev` — dev server
- `npm run typecheck` — `tsc --noEmit`
- `npm run lint` — eslint
- `npm run test` — vitest run
- `npm run build` — tsc && vite build
- `npm run e2e` — playwright test
- `npm run format` — prettier write
- `npm run format:check` — prettier check

## Quality gates (all must pass before every PR)

`npm run format:check`, `npm run typecheck`, `npm run lint`, `npm run test`, `npm run build`, `npm run e2e`.

## Conventions

- Never commit/push directly to `main`. One branch per milestone.
- Conventional Commits.
- No `any`. No dead code. No unnecessary deps (justify in docs/DECISIONS.md).
- Never insert user data with innerHTML (use textContent/DOM APIs).
- Never use `prompt()`, `alert()` or `confirm()`; use `src/ui/dialog.ts` for messages, confirmations and forms.
- Sanitize link URLs (http/https only).
- Validate imported JSON.
- ASCII art created in code or original; credit third-party assets.

## Structure

`src/core`, `src/features`, `src/scene`, `src/ui`, `src/i18n`, `src/styles`.
