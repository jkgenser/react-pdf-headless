# Repository Guidelines

This guide helps you contribute effectively to react-pdf-headless.

## Project Structure & Module Organization
- Library source lives in `src/` (TypeScript/React): core `src/Reader.tsx`, `src/Page.tsx`, hooks (`src/use*.ts`), helpers (`src/util.ts`), and types (`src/types.ts`). Public API is re-exported via `src/index.ts`.
- Demo app for local development sits in `demo/` and `index.html` at the repo root.
- Build output is written to `src/dist/` (see `vite.config.ts`). Published entry points: `main: ./dist/index.js`, `types: ./dist/index.d.ts`.

## Build, Test, and Development Commands
- `yarn dev` — Start Vite dev server at `http://localhost:5174` using the demo.
- `yarn build` — Build the library with Vite (output in `src/dist/`).
- `yarn preview` — Serve the built demo for quick verification.
- `yarn lint` — Run ESLint on TS/TSX files; zero warnings required.

## Coding Style & Naming Conventions
- Language: TypeScript + React 18, ES modules.
- Indentation: 2 spaces; include semicolons; prefer const/let over var.
- Components: PascalCase files (e.g., `Reader.tsx`, `Page.tsx`).
- Hooks/utilities: camelCase, hooks prefixed with `use` (e.g., `useZoom.ts`).
- Exports: Public surface via `src/index.ts` (prefer named exports; default export for `Reader` is accepted).
- Linting: ESLint with `@typescript-eslint` and React Hooks plugins. Fix issues before committing (`yarn lint`).

## Testing Guidelines
- No test runner is configured yet. If adding tests, propose Vitest + React Testing Library.
- Place tests near sources or under `src/__tests__/`. Name files `*.test.ts` or `*.test.tsx`.
- Keep tests deterministic and fast; include real-world PDF cases where feasible (small fixtures in `demo/` or a dedicated `test-assets/`).

## Commit & Pull Request Guidelines
- Prefer Conventional Commits: `feat:`, `fix:`, `build:`, `chore:`, `docs:`, `refactor:`, `perf:`, `test:` (e.g., `fix(reader): correct zoom anchor offset`).
- PRs must: describe the change and rationale, link issues, include before/after notes or GIFs for behavior changes, update demo usage if relevant, and pass `yarn lint` and `yarn build` locally.

## Security & Configuration Tips
- Environment: Node 18+ and Yarn 4 (Berry). Avoid committing `node_modules/`; use the lockfile.
- PDF rendering uses `react-pdf`/`pdfjs-dist`; keep versions pinned and test large documents to validate virtualization performance.

