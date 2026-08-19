# litemerge-UI

Frontend dashboard for LitmusAI behavioral testing — configure projects, launch simulation runs, and review reports.

Built with React 19, Vite, TypeScript, Tailwind CSS v4, React Router, and Recharts.

## Getting started

```bash
npm install
npm run dev
```

The dev server prints a local URL (Vite defaults to port 5173). A running LitmusAI backend is required.

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite dev server |
| `npm run build` | Type-check (`tsc -b`) and build to `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | Run ESLint |

## Configuration

Set the backend base URL in `.env`:

```bash
VITE_API_URL=http://localhost:8080
```

Falls back to `http://localhost:8000` if unset.

## Routes

| Path | Page |
| --- | --- |
| `/login` | Authentication |
| `/dashboard` | Overview |
| `/projects` | Project management |
| `/history` | Past runs |
| `/runs/:runId` | Live run view |
| `/runs/:runId/report` | Run report |

All routes except `/login` require a token and redirect there when missing.

## Auth

Login returns a bearer token, held in `AuthContext` and persisted to `sessionStorage` under `litmusai_token`. `apiFetch` attaches it as an `Authorization: Bearer` header; streaming endpoints pass it as a `token` query parameter via `sseUrl`.

## Layout

```
src/
  pages/       route components
  components/  layout, projects, runs, reports, simulation
  lib/api/     client + auth, projects, runs, reports
  context/     AuthContext
  hooks/       shared hooks
docs/          design and implementation notes
```

> **Note:** `app/`, `components/`, and `proxy.ts` are leftovers from an earlier Next.js structure and are not used by the Vite build, which is rooted at `index.html` → `src/main.tsx`.

## License

See [LICENSE](LICENSE).
