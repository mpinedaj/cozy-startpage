# Decisions (ADR-style)

## 0001 — TypeScript ~5.9 instead of 7.x
Context: Vite scaffold shipped TypeScript ~7.0; typescript-eslint peer range is <6.1.
Decision: Pin TypeScript to ~5.9.3.
Consequences: Loses TS 7 features; gains lint compatibility. Revisit when typescript-eslint supports TS 7.
