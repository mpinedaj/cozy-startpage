# Contributing

## Run locally
```
npm install
npm run dev
```

## Quality gates
```
npm run typecheck
npm run lint
npm run test
npm run build
```

## Add a theme
Add a `[data-theme="name"]` block in `src/styles/themes.css` with the four palette variables.

## Add a scene
Create a file in `src/scene/scenes/` implementing the `Scene` interface and register it in `src/scene/scenes/index.ts`.
