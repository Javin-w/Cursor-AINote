# AGENTS.md

## Cursor Cloud specific instructions

### Overview

Cursor-AINote is a full-stack note-taking and task management app (React + Express + SQLite). See `README.md` for standard commands (`npm run dev`, `npm run build`, etc.).

### Services

| Service | Port | Command |
|---------|------|---------|
| Backend (Express + SQLite) | 3001 | `npm run dev:server` |
| Frontend (Vite + React) | 3000 | `npm run dev:client` |
| Both simultaneously | 3000 + 3001 | `npm run dev` |

### Non-obvious caveats

- **No ESLint config file**: The client `package.json` lists ESLint deps and a `lint` script, but no `.eslintrc` config file exists. Running `npm run lint` in `client/` will fail.
- **Client production build fails**: `npm run build:client` fails due to unused imports in `src/pages/Home.tsx` (unused `Clock`) and `src/utils/date.ts` (unused `zhCN`). The Vite dev server (`npm run dev:client`) works fine regardless.
- **Server build works**: `npm run build:server` compiles without errors.
- **SQLite database**: The database file is at `server/data/app.db` and is auto-created on first server start. The `server/data/` directory is created automatically by the server entry point.
- **No automated tests**: Neither server nor client has test suites configured (both have placeholder `test` scripts).
- **Demo data**: Run `./demo-data.sh` after starting the server to seed a demo account (`demo@example.com` / `123456`) with sample notes and tasks.
- **JWT secret**: The server uses a hardcoded JWT secret (no `.env` file needed for dev).
