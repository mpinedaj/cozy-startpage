# cozy-startpage

A cozy ASCII terminal start page for your browser: a full-screen character-art scene, a big ASCII
clock, a search box, your links, the weather and a to-do list. No account, no backend, no analytics.

**[Open the live demo →](https://mpinedaj.github.io/cozy-startpage/)**

![cozy-startpage dashboard](docs/screenshots/desktop.png)

## What it does

- **Clock and greeting** that follow the time of day, with 12h or 24h format and an optional name.
- **Search** with DuckDuckGo, Google, Bing or Brave, without leaving the keyboard.
- **Links** with add, edit, delete and reorder. Editing uses an ASCII dialog and deleting asks first.
  URLs are limited to `http` and `https`.
- **Full-screen ASCII scene** behind the page: four hand-coded character scenes (rainy window, forest
  dusk, cafe interior, mountain lake) drawn on a 120×32 grid for dawn, day, dusk and night, with two
  frames of ambient motion. The centre 64 columns are shown on phones.
- **Four dark terminal themes** (cafe, forest, lavender, night) with a scanline overlay; the scene
  takes its colour from the active theme.
- **Weather** from Open-Meteo: current temperature and conditions for the city you choose. Opt-in,
  no API key, no account.
- **To-do list** for the day: add, tick, delete, clear the finished ones.
- **Settings** in a native dialog: name, English/Spanish, clock format, theme, scene, time of day,
  ambient motion and motion. Changes apply instantly and persist.
- **Backup**: export your whole setup to a JSON file and import it back on any device.

## Use it

The simplest option is the hosted build:
**[https://mpinedaj.github.io/cozy-startpage/](https://mpinedaj.github.io/cozy-startpage/)**

- Set it as your browser's **homepage**, or as the page your browser opens on startup.
- For **new tabs**, Chrome and Chromium need an extension such as _New Tab Redirect_; Firefox can use
  _New Tab Override_. Point them at the URL above.

Everything is stored locally, so a shared computer will not see your links or tasks.

## Privacy

- No analytics, no cookies, no accounts, no server of its own.
- All configuration lives in one versioned `localStorage` key: `cozy-startpage:config`.
- Weather is **off by default**. When you enable it, the page asks Open-Meteo for the city you typed
  (geocoding plus current conditions); those two requests are the only third-party traffic.
- The Content Security Policy only allows scripts and styles from the origin, plus those two
  Open-Meteo hosts.

## Run it locally

```bash
npm install
npm run dev
```

Requires Node 20 or newer.

## Make it yours

| What                   | Where                                                            |
| ---------------------- | ---------------------------------------------------------------- |
| Colors and themes      | `src/styles/themes.css` — one block per `data-theme`             |
| Scenes                 | `src/scene/ascii.ts` — painters, registered in `scenes/index.ts` |
| Text and languages     | `src/i18n/messages.ts`                                           |
| Search engines         | `src/features/search/engines.ts`                                 |
| Defaults for new users | `src/core/defaults.ts`                                           |

Adding a theme means adding a block with `--bg`, `--fg`, `--accent`, `--muted`, `--line`, `--danger`
and `--scene`. Keep body and muted text at WCAG AA contrast against `--bg`.

Adding a scene means writing a painter in `src/scene/ascii.ts` with the shared grid helpers (`put`,
`text`, `box`, `hline`, `vline`) and registering its id in `src/scene/scenes/index.ts`; see
[CONTRIBUTING.md](CONTRIBUTING.md). Scenes are plain printable ASCII, deterministic per frame and
composed for a crop-safe centre.

## Development

Built with Vite, TypeScript (strict) and plain CSS. No UI framework and no runtime dependencies.

```bash
npm run dev          # dev server
npm run typecheck    # tsc --noEmit
npm run lint         # eslint
npm run test         # vitest (unit)
npm run e2e          # playwright (needs browsers installed once)
npm run build        # typecheck + production build
npm run format       # prettier
```

CI runs `typecheck`, `lint`, unit tests, `build` and the Playwright suite, and every push to `main`
deploys `dist` to GitHub Pages.

```
src/core        config, storage, migrations, validation, import/export
src/features    clock, search, links, tasks, weather, motion
src/scene       ASCII painter, scene engine and registry
src/ui          ASCII clock, dialogs, task and weather widgets
src/i18n        English and Spanish strings
src/styles      base layout and themes
e2e             Playwright specs against the production build
docs            plan, progress log and architecture decisions
```

## Screenshots

| Settings                                          | Phone                                        |
| ------------------------------------------------- | -------------------------------------------- |
| ![Settings dialog](docs/screenshots/settings.png) | ![Phone layout](docs/screenshots/mobile.png) |

| Link editor                                             | Delete confirmation                                         |
| ------------------------------------------------------- | ----------------------------------------------------------- |
| ![Link editor dialog](docs/screenshots/dialog-edit.png) | ![Delete confirmation](docs/screenshots/dialog-confirm.png) |

The four scenes at their signature time of day: rainy window at night, forest at dusk, cafe at day
and mountain lake at dawn.

![The four ASCII scenes](docs/screenshots/scenes.png)

## Credits

Scene art and the favicon are original. Third-party services are credited in
[CREDITS.md](CREDITS.md). The interface uses a system monospace font stack, so no font is bundled.

## License

MIT — see [LICENSE](LICENSE).
