# LitmusAI Frontend — Implementation Reference

> **Stack decision:** React + Vite SPA (no SSR). All rendering is client-side. No Next.js compute costs. The backend is the single source of truth; the frontend calls it directly using `Authorization: Bearer <token>` (bearer auth migration is complete on the backend).

---

## 1. Tech Stack

| Layer | Technology | Rationale |
|---|---|---|
| Framework | React 18 + Vite 5 | Pure SPA, zero server compute, fast HMR |
| Routing | React Router v6 | Declarative nested routes, loader guards |
| Styling | Tailwind CSS 3 | Semantic token system, no external CSS framework |
| UI primitives | shadcn/ui (Radix-based) | Accessible headless components, ships with Lucide |
| Icons | Lucide React | Ships with shadcn/ui, clean SVG strokes, React-native, tree-shakeable |
| Fonts | Space Grotesk + Inter + JetBrains Mono | Editorial contrast system (see §2.3) |
| API client | Typed fetch wrappers in `src/lib/api/` | No additional HTTP library needed |
| Realtime | Native `EventSource` | SSE stream from backend |
| State | React Context (auth only) + local state per page | No Redux, no Zustand |
| Charts | Recharts | Tailwind-friendly, lightweight |
| Canvas animation | Raw Canvas 2D API | Persona orb ring; no WebGL dependency |

---

## 2. Design System

### 2.0 Philosophy — "The Observational Engine"

This is a **high-precision workspace for behavioral AI analysis** — a digital laboratory that feels clinical and visionary simultaneously. The aesthetic is defined by three rules:

**Tonal Architecture over lines.** Depth and hierarchy are communicated through background color shifts, not borders. A card sitting on a darker panel surface is enough to define it. Never use 1px solid borders to section content.

**Status colors are sacred.** `pass` (emerald) and `fail` (red) appear *only* when something has genuinely passed or failed. Overusing them destroys their psychological impact — the PASSED verdict should feel meaningful because you've never seen that green anywhere else on the screen.

**Editorial contrast.** Pair huge metric numbers (Space Grotesk, 3.5rem) with tiny technical labels (Inter, 0.625rem, uppercase, tracked). This editorial scale contrast is what makes the tool feel designed, not just populated with data.

---

### 2.1 Color Tokens (Tailwind config)

Semantic names that map directly to the stitch palette hex values. Same colors, readable code.

```js
// tailwind.config.js — colors block
colors: {
  // ── Surfaces (tonal layers, light-to-dark) ──────────────────
  canvas:   "#0b1326",   // page background — the deepest layer
  surface:  "#131b2e",   // sidebars, panels, secondary regions
  panel:    "#171f33",   // slightly lifted groupings
  card:     "#222a3d",   // interactive card backgrounds
  overlay:  "#2d3449",   // modals, sheets, highest interactive layer
  bright:   "#31394d",   // hover state surface lift

  // ── Text ────────────────────────────────────────────────────
  "text-base":   "#dae2fd",   // primary text — on dark surfaces
  "text-muted":  "#c2c6d6",   // secondary text, labels
  "text-subtle": "#8c909f",   // placeholder, dimmed
  "text-dim":    "#424754",   // very low contrast — decorative only

  // ── Accent (blue — interactive, primary actions) ─────────────
  accent:        "#adc6ff",   // interactive accents, links, active states
  "accent-deep": "#4d8eff",   // CTA button fill, gradient endpoint
  "accent-on":   "#002e6a",   // text on filled accent buttons
  "accent-glow": "rgba(173,198,255,0.12)",

  // ── Pass (emerald — PASSED, success, green preflight) ────────
  pass:          "#4edea3",   // SACRED — only for genuine pass states
  "pass-deep":   "#00a572",   // gradient endpoint for pass indicators
  "pass-on":     "#003824",   // text on filled pass elements
  "pass-glow":   "rgba(78,222,163,0.12)",

  // ── Fail (red — FAILED, critical, red preflight) ─────────────
  fail:          "#ffb4ab",   // SACRED — only for genuine fail states
  "fail-deep":   "#93000a",   // error container fill
  "fail-on":     "#690005",   // text on filled fail elements
  "fail-glow":   "rgba(255,180,171,0.12)",

  // ── Persona / secondary (violet — persona badges, p2 orb) ────
  persona:       "#d0bcff",
  "persona-deep":"#571bc1",
  "persona-on":  "#3c0091",

  // ── Ghost border (the ONLY border permitted for containers) ──
  // Use: border border-edge  (translucent, never opaque)
  edge: "rgba(255,255,255,0.06)",
}
```

> All color usage in the app must come from this table. Do not use Tailwind's built-in slate/blue/green/red palette — only these tokens.

---

### 2.2 Border Radius

```js
// tailwind.config.js — borderRadius block
borderRadius: {
  sm:      "4px",
  DEFAULT: "8px",    // most elements (inputs, badges, small cards)
  md:      "8px",
  lg:      "12px",   // cards, panels
  xl:      "16px",   // large modals, sheets
  full:    "9999px", // pills, avatar
}
```

---

### 2.3 Typography

**Three fonts, three roles — never cross them:**

| Font | Role | Usage |
|---|---|---|
| Space Grotesk | Display + Headlines | Logo wordmark, score numbers, section titles, major metrics |
| Inter | Body + Labels + UI | Everything else — nav, descriptions, form labels, table text |
| JetBrains Mono | Technical + Code | Trace IDs, run IDs, log entries, API endpoints, code blocks |

```js
// tailwind.config.js — fontFamily block
fontFamily: {
  display:  ['"Space Grotesk"', "sans-serif"],
  body:     ["Inter", "sans-serif"],
  mono:     ['"JetBrains Mono"', "monospace"],
}
```

In `index.html`:
```html
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet"/>
```

**The editorial contrast rule:**
```
Score number    → font-display text-[3.5rem] font-bold tracking-tighter
Score label     → font-body text-[0.625rem] font-semibold uppercase tracking-[0.15em] text-text-muted
Run ID          → font-mono text-sm text-accent
Body paragraph  → font-body text-sm leading-relaxed
```

---

### 2.4 Depth System

No drop shadows on cards. Depth is tonal.

```
Layer 0 — canvas (#0b1326)      Page background
Layer 1 — surface (#131b2e)     Sidebar, persistent panels  
Layer 2 — panel (#171f33)       Content groupings
Layer 3 — card (#222a3d)        Interactive cards, table rows on hover
Layer 4 — overlay (#2d3449)     Active/focused card, selected state
```

**When a floating element must visually lift** (dropdown, modal, tooltip):
```css
/* Ambient shadow — always tinted with canvas color */
box-shadow: 0 24px 48px -12px rgba(6, 14, 32, 0.5);
/* + glassmorphism for modals and sheets only */
background: rgba(45, 52, 73, 0.75);
backdrop-filter: blur(16px);
```

**Ghost border — accessibility-only fallback:**
```html
<!-- Only when tonal contrast alone is insufficient for an interactive boundary -->
<div class="border border-edge rounded-lg">
```

---

### 2.5 Component Patterns

**CTA Button (primary action):**
```html
<button class="bg-gradient-to-br from-accent to-accent-deep text-accent-on
               px-5 py-2.5 rounded font-body font-semibold text-sm
               hover:opacity-90 active:scale-[0.98]
               transition-all shadow-lg shadow-[rgba(173,198,255,0.08)]">
```

**Secondary / ghost button:**
```html
<button class="border border-edge text-accent px-5 py-2.5 rounded font-body font-semibold text-sm
               hover:bg-overlay hover:border-[rgba(173,198,255,0.15)]
               transition-all">
```

**Card:**
```html
<div class="bg-card rounded-lg p-6 hover:bg-overlay transition-colors
            shadow-[0_24px_48px_-12px_rgba(6,14,32,0.4)]">
```

**Input:**
```html
<input class="w-full bg-surface border border-edge rounded
              px-3 py-2.5 text-sm font-body text-text-base
              placeholder:text-text-dim
              focus:outline-none focus:border-accent/60 focus:ring-2 focus:ring-[rgba(173,198,255,0.12)]
              transition-all">
```

**Active nav item (sidebar):**
```html
<a class="flex items-center gap-3 px-4 py-2.5 rounded-l-lg
          text-accent font-semibold
          border-r-2 border-accent bg-overlay/50">
```

**Pass badge:**
```html
<span class="bg-[rgba(78,222,163,0.1)] text-pass px-2.5 py-1
             rounded-full text-xs font-semibold font-body
             flex items-center gap-1.5">
  <CheckCircle size={12} /> Passed
</span>
```

**Fail badge:**
```html
<span class="bg-[rgba(255,180,171,0.1)] text-fail px-2.5 py-1
             rounded-full text-xs font-semibold font-body
             flex items-center gap-1.5">
  <XCircle size={12} /> Failed
</span>
```

**Live pulse dot:**
```html
<!-- Green: endpoint reachable -->
<span class="w-2 h-2 rounded-full bg-pass animate-pulse
             shadow-[0_0_8px_rgba(78,222,163,0.6)]">
```

**Skeleton loader:**
```html
<div class="h-4 bg-card rounded animate-pulse" />
```

---

### 2.6 Score Color Utilities

```ts
// src/lib/utils.ts
export function scoreToTextColor(score: number): string {
  if (score >= 70) return "text-pass";
  if (score >= 50) return "text-[#F59E0B]";
  return "text-fail";
}

export function scoreToGlowClass(score: number): string {
  if (score >= 70) return "shadow-[0_0_32px_rgba(78,222,163,0.2)]";
  if (score >= 50) return "shadow-[0_0_32px_rgba(245,158,11,0.2)]";
  return "shadow-[0_0_32px_rgba(255,180,171,0.2)]";
}

export function scoreToHex(score: number): string {
  if (score >= 70) return "#4edea3";
  if (score >= 50) return "#F59E0B";
  return "#ffb4ab";
}
```

---

### 2.7 Global CSS

```css
/* src/index.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  font-family: 'Inter', sans-serif;
  background-color: #0b1326;
  color: #dae2fd;
  -webkit-font-smoothing: antialiased;
}

/* Scrollbar — thin, tonal */
::-webkit-scrollbar       { width: 4px; height: 4px; }
::-webkit-scrollbar-track  { background: #131b2e; }
::-webkit-scrollbar-thumb  { background: #2d3449; border-radius: 10px; }
::-webkit-scrollbar-thumb:hover { background: #31394d; }

/* Selection */
::selection { background: rgba(173,198,255,0.2); color: #f1f5f9; }

/* Focus ring — global override for keyboard navigation */
:focus-visible {
  outline: 2px solid rgba(173,198,255,0.5);
  outline-offset: 2px;
}
```

---

## 3. Folder Structure

```
./
├── index.html
├── vite.config.ts
├── tailwind.config.js
├── postcss.config.js
├── tsconfig.json
├── .env
└── src/
    ├── main.tsx                      # ReactDOM.createRoot, BrowserRouter
    ├── App.tsx                       # Route tree
    ├── index.css                     # Tailwind directives + global CSS
    │
    ├── context/
    │   └── AuthContext.tsx           # Token: memory + sessionStorage rehydration
    │
    ├── pages/
    │   ├── Login.tsx                 # /login
    │   ├── Dashboard.tsx             # /dashboard — Projects + Run History tabs
    │   ├── RunView.tsx               # /runs/:runId — Live simulation
    │   └── ReportView.tsx            # /runs/:runId/report
    │
    ├── components/
    │   ├── layout/
    │   │   ├── AppShell.tsx          # Sidebar + Outlet wrapper
    │   │   ├── Sidebar.tsx
    │   │   └── TopBar.tsx
    │   ├── projects/
    │   │   ├── ProjectCard.tsx
    │   │   ├── ProjectGrid.tsx
    │   │   ├── NewProjectSheet.tsx   # Right-side Sheet (create + edit)
    │   │   └── PreflightBadge.tsx
    │   ├── runs/
    │   │   ├── RunLaunchModal.tsx
    │   │   ├── RunHistoryTable.tsx
    │   │   └── RunStatusBadge.tsx
    │   ├── simulation/
    │   │   ├── SimulationCanvas.tsx  # Canvas 2D orb ring
    │   │   ├── PersonaSidebar.tsx
    │   │   ├── LiveFeedLog.tsx
    │   │   ├── StatsBar.tsx
    │   │   └── ScoreRevealOverlay.tsx
    │   └── reports/
    │       ├── ScoreRing.tsx
    │       ├── DimensionBreakdown.tsx
    │       ├── FindingCard.tsx
    │       ├── FindingsList.tsx
    │       └── ReportHeader.tsx
    │
    ├── hooks/
    │   ├── useSimulationSSE.ts
    │   ├── useRunStatus.ts
    │   ├── usePreflight.ts
    │   └── useProjects.ts
    │
    ├── lib/
    │   ├── api/
    │   │   ├── client.ts             # Base fetch (Bearer token, error handling)
    │   │   ├── auth.ts
    │   │   ├── projects.ts
    │   │   ├── runs.ts
    │   │   └── reports.ts
    │   └── utils.ts                  # cn(), score helpers, formatDuration()
    │
    └── types/
        └── api.ts                    # TypeScript mirrors of backend schemas
```

---

## 4. Routing

```tsx
// src/App.tsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import AppShell from "./components/layout/AppShell";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import RunView from "./pages/RunView";
import ReportView from "./pages/ReportView";

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { token } = useAuth();
  return token ? <>{children}</> : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route element={<PrivateRoute><AppShell /></PrivateRoute>}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/runs/:runId" element={<RunView />} />
          <Route path="/runs/:runId/report" element={<ReportView />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
```

---

## 5. Auth Strategy

**No cookies. No localStorage.** Token lives in React context (in-memory) + `sessionStorage` for same-tab refresh survival.

```tsx
// src/context/AuthContext.tsx
interface AuthState {
  token: string | null;
  login: (token: string) => void;
  logout: () => void;
}
```

- On mount: `AuthProvider` reads `sessionStorage.getItem("litmusai_token")` to rehydrate.
- `login(token)` — sets state + `sessionStorage.setItem`.
- `logout()` — clears state + `sessionStorage.removeItem`, navigates to `/login`.

**Login flow:**
1. User submits email + API key.
2. `POST /v1/auth/login` with `{ email, api_key }` → `{ token }`.
3. `login(token)` called → all API calls now send `Authorization: Bearer <token>`.

> **Interim:** If `/v1/auth/login` isn't implemented yet, Login page skips the API call and directly stores the raw API key as the bearer token. Handled in `src/lib/api/auth.ts` with a feature flag comment.

---

## 6. API Client

```ts
// src/lib/api/client.ts
const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
  token?: string
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Request failed" }));
    throw new Error(err.detail ?? `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}
```

---

## 7. Type Definitions

```ts
// src/types/api.ts

// ─── Projects ──────────────────────────────────────────────────
export interface AuthConfigInput {
  type: "bearer" | "apikey" | "basic" | "none";
  value?: string;
  header_name?: string;
}
export interface AuthConfigPublic {
  type: "bearer" | "apikey" | "basic" | "none";
  header_name?: string | null;
  has_value: boolean;
}
export interface SchemaHints {
  message?: string;
  session_id?: string;
  conversation_history?: string;
  reply?: string;
}
export interface Project {
  id: string;
  name: string;
  agent_endpoint: string;
  auth_config: AuthConfigPublic;
  owner_id: string;
  schema_hints?: SchemaHints | null;
  created_at: string;
  updated_at: string;
}
export interface PreflightResponse {
  status: "green" | "amber" | "red";
  latency_ms: number;
  error?: string | null;
}

// ─── Runs ───────────────────────────────────────────────────────
export type TestSuite = "standard" | "adversarial" | "full";
export type RunStatus = "queued" | "running" | "evaluating" | "complete" | "failed";
export interface RunSummary {
  total_conversations: number;
  personas_deployed: number;
  issues_flagged: number;
}
export interface SessionStatus {
  persona_id: string;
  persona_name?: string | null;
  persona_type?: string | null;
  status: "in_progress" | "completed" | "failed";
  turns_completed: number;
}
export interface Run {
  run_id: string;
  status: RunStatus;
  score?: number | null;
  passed?: boolean | null;
  report_url?: string | null;
  summary?: RunSummary | null;
  session_statuses: SessionStatus[];
}

// ─── Reports ────────────────────────────────────────────────────
export interface FindingTypeSummary {
  finding_type: string;
  count: number;
  by_severity: Record<string, number>;
}
export interface Finding {
  id: string;
  project_id: string;
  run_id: string;
  persona_type: string;
  finding_type: string;
  severity: "critical" | "high" | "medium" | "low";
  prompt_vector: string;
  agent_response_excerpt: string;
  created_at: string;
}
export interface RunReport {
  run_id: string;
  status: RunStatus;
  score?: number | null;
  passed?: boolean | null;
  fail_threshold: number;
  test_suite: TestSuite;
  created_at: string;
  completed_at?: string | null;
  summary?: RunSummary | null;
  findings_count: number;
  findings_by_severity: Record<string, number>;
  findings_by_type: FindingTypeSummary[];
  findings: Finding[];
}

// ─── SSE Events ─────────────────────────────────────────────────
export type SSEEventType =
  | "session_started"
  | "turn_completed"
  | "session_completed"
  | "session_failed"
  | "evaluation_started"
  | "run_complete";

export interface SSEEvent {
  event: SSEEventType;
  run_id: string;
  persona_id?: string;
  persona_type?: string;
  turn_index?: number;
  status?: RunStatus;
}
```

---

## 8. Session Breakdown

### Session A — Bootstrap + Login + Dashboard Shell

**Deliverable:** Vite scaffolded, design system wired, user can sign in and see the app shell.

1. `npm create vite@latest frontend -- --template react-ts`
2. Install deps: `tailwindcss postcss autoprefixer react-router-dom lucide-react recharts`
3. `tailwind.config.js` — full color/font/radius system from §2.
4. `src/index.css` — global CSS from §2.7.
5. `AuthContext.tsx` — in-memory token + sessionStorage rehydration.
6. `App.tsx` — route tree with `PrivateRoute`.
7. `AppShell.tsx` — `<Sidebar /> + <TopBar /> + <Outlet />` inside a `flex h-screen` container.

**Sidebar (`bg-surface w-64 flex flex-col py-8 px-4 fixed h-screen`):**
- LitmusAI wordmark: `font-display text-2xl font-bold text-accent tracking-tighter`
- Sub-label: `text-[10px] uppercase tracking-[0.2em] text-text-subtle font-semibold`
- Nav links: inactive = `text-text-muted hover:text-accent hover:bg-overlay rounded-lg`; active = `text-accent font-semibold border-r-2 border-accent bg-overlay/50 rounded-l-lg`
- Sign out at bottom, separated by a ghost border top

**TopBar (`bg-canvas/70 backdrop-blur-xl h-16 fixed top-0 flex items-center px-8`):**
- Breadcrumb in `font-mono text-sm` for run/project context pages
- Icon buttons: Lucide `Key` and `Bell` — `hover:bg-overlay rounded-lg p-2`
- Avatar circle with ghost border

**Login page (`bg-canvas min-h-screen flex items-center justify-center`):**
- Background decoration: two soft radial gradients (`bg-accent/5 blur-[120px]`) — `fixed inset-0 pointer-events-none`
- Card: `glassmorphism rounded-xl p-10 max-w-[420px] border border-edge shadow-[0_24px_48px_-12px_rgba(6,14,32,0.5)]`
- Lucide `FlaskConical` icon (not Material Symbols) in the logo mark
- Sign-in CTA: gradient accent button, full width
- Bottom-right decoration: three concentric spinning `border-edge` rings with a Lucide `Network` icon at center (low opacity, decorative)

---

### Session B — Projects Dashboard

**Deliverable:** Projects tab with live cards, preflight, and New Project sheet.

1. `useProjects.ts` — `GET /v1/projects`, local state, manual refresh trigger.
2. `ProjectGrid.tsx` — `grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5`.
3. `ProjectCard.tsx`:
   - Container: `bg-card rounded-lg p-6 flex flex-col gap-5 hover:bg-overlay transition-colors shadow-[0_24px_48px_-12px_rgba(6,14,32,0.4)] group`
   - Name: `font-display text-lg font-bold text-text-base group-hover:text-accent transition-colors`
   - Endpoint: `font-mono text-xs text-text-subtle truncate`
   - Score badge: `bg-[rgba(78,222,163,0.1)] text-pass` if passed; `bg-[rgba(255,180,171,0.1)] text-fail` if failed; `bg-panel text-text-subtle` if no runs
   - Preflight dot: `w-2 h-2 rounded-full bg-pass shadow-[0_0_8px_rgba(78,222,163,0.6)]` for green
   - "Run Simulation" CTA: gradient accent button, full width
4. `NewProjectSheet.tsx` — right-side Sheet; conditional auth type fields; Schema Hints Accordion; validates on submit; success toast.
5. `PreflightBadge.tsx` — `POST /v1/projects/{id}/preflight`; spinner → colored dot + latency.
6. `RunHistoryTable.tsx` — filter/sort controls with `RunStatusBadge`.

**Score badge variants from §2.5 — use the pass/fail badge pattern exactly.**

---

### Session C — Run Launch + Live Simulation

**Deliverable:** Run launched → live canvas with orbs → score reveal overlay.

1. `RunLaunchModal.tsx` — Dialog; suite picker (three `bg-panel hover:bg-card border border-edge` option cards, selected = `border-accent bg-overlay`); Slider for threshold; optional webhook Accordion; CTA → `POST /v1/runs` → navigate.
2. `RunView.tsx` — 3-column layout: `w-72 bg-surface` (left) + `flex-1 bg-canvas` (center) + `w-80 bg-surface` (right); `StatsBar` at top.
3. `SimulationCanvas.tsx` — Canvas 2D:
   - Orbs arranged in a ring, radius ~200px from canvas center
   - Each orb: 48px, `shadowBlur: 20`, glow color from persona color map
   - State machine per orb driven by SSE events
   - Orbit: slow circular path at unique angular velocity per orb
   - `session_started` → orb brightens + begins orbit
   - `turn_completed` → brief scale pulse (1.0 → 1.3 → 1.0 in 300ms)
   - `session_completed` → fade to 30% opacity, orbit slows to stop
   - `session_failed` → desaturate to gray, opacity 20%
   - Degrade: if canvas unavailable, render PersonaSidebar fullscreen
4. `PersonaSidebar.tsx` — per-persona row: colored dot + name + progress bar + status chip; `bg-surface`; scroll overflow
5. `StatsBar.tsx` — three counters: `font-display font-bold text-xl text-accent` for the numbers; `font-body text-[10px] uppercase tracking-[0.15em] text-text-muted` for labels
6. `LiveFeedLog.tsx` — auto-scroll; `font-mono text-xs`; color-coded lines; max 200 entries; no virtualization needed at this scale
7. `ScoreRevealOverlay.tsx`:
   - Full-screen glassmorphism overlay: `fixed inset-0 bg-canvas/90 backdrop-blur-md flex items-center justify-center`
   - Phase 1 (evaluating): Lucide `LoaderCircle` spinning, pulsing "Evaluating results..." text
   - Phase 2 (score): `ScoreRing` SVG with count-up animation (0 → score in 1.5s, ease-out); `font-display text-[5rem] font-bold tracking-tighter`; PASSED/FAILED badge
   - Phase 3 (actions): summary stats + two buttons
8. `useSimulationSSE.ts` — max 3 retries, delays [1s, 2s, 4s]; token via `?token=` query param; close on `run_complete`
9. `useRunStatus.ts` — 5s polling fallback

**Persona color map (for canvas orbs and sidebar dots):**
```ts
export const PERSONA_COLORS: Record<string, string> = {
  p1_low_literacy:      "#3B82F6",  // blue
  p2_non_native:        "#8B5CF6",  // violet
  p3_adversarial:       "#EF4444",  // red
  p4_distressed:        "#F59E0B",  // amber
  p5_domain_expert:     "#10B981",  // emerald
  p6_ambiguous:         "#06B6D4",  // cyan
  p7_multi_turn_drift:  "#F97316",  // orange
  p8_extra_adversarial: "#F43F5E",  // rose
};
```

---

### Session D — Report View

**Deliverable:** Full post-run report with score ring, dimension breakdown, expandable findings, and JSON export.

1. `ReportView.tsx` — fetch `GET /v1/reports/{run_id}` on mount; skeleton state.
2. `ReportHeader.tsx` — `font-display text-4xl font-bold tracking-tight` for run ID; metadata row in `font-body text-sm text-text-muted flex items-center gap-2`; PASSED/FAILED badge; back button.
3. `ScoreRing.tsx` — SVG donut, `viewBox="0 0 160 160"`, `r=64 strokeWidth=16`; background circle `stroke="#222a3d"`; animated arc fill using `stroke-dashoffset` on mount; color via `scoreToHex(score)`.
4. `DimensionBreakdown.tsx` — horizontal bar rows; finding_type → display dimension mapping; sorted by count desc; bar color = worst severity in that type.
5. `FindingCard.tsx` — severity chip + left `border-l-2` in severity color; expanded: `<pre className="font-mono text-xs bg-surface rounded-lg p-4 overflow-x-auto">` for prompt_vector and agent_response_excerpt.
6. `FindingsList.tsx` — filter chips (severity + type); sorted critical → low.
7. PDF button — disabled state: `cursor-not-allowed opacity-40` + Tooltip "PDF export coming soon".
8. JSON export — `URL.createObjectURL(new Blob([JSON.stringify(report, null, 2)]))` → `<a>` download.

**Finding severity colors:**
```
critical → text-fail    border-fail    bg-[rgba(255,180,171,0.06)]
high     → text-[#F97316]  border-[#F97316]  bg-[rgba(249,115,22,0.06)]
medium   → text-[#F59E0B]  border-[#F59E0B]  bg-[rgba(245,158,11,0.06)]
low      → text-text-muted border-text-dim    bg-panel
```

---

## 9. Environment Variables

```env
# .env
VITE_API_URL=http://localhost:8000
```

---

## 10. Development Setup

```bash
npm create vite@latest frontend -- --template react-ts
cd frontend
npm install

# Tailwind
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# App deps
npm install react-router-dom lucide-react recharts

# shadcn (after tailwind configured)
npx shadcn-ui@latest init
# → TypeScript: yes, baseColor: slate, CSS vars: yes

# shadcn components used in this project
npx shadcn-ui@latest add button input select badge card tabs accordion \
  dialog sheet slider progress separator toast tooltip

npm run dev   # http://localhost:5173
```

---

## 11. Key Constraints

1. **Bearer auth** — `Authorization: Bearer <token>` on all calls. `x-api-key` is dead.
2. **No SSR** — pure client SPA, never add server logic or API routes.
3. **Tonal architecture** — no 1px solid borders for sectioning. Use background color shifts.
4. **Status colors are sacred** — `text-pass` and `text-fail` appear only for actual pass/fail states. Never for decoration.
5. **Token table is sealed** — use only the colors from §2.1. No Tailwind built-in slate/blue/green/red.
6. **Icons are Lucide** — not Material Symbols. No icon fonts.
7. **Glassmorphism is scoped** — only on modals, sheets, and floating overlays. Not on regular cards.
8. **No mock data** — skeleton loaders for loading states, real API data only.
9. **Desktop-first** — min 1024px, responsive but not mobile-optimized.

---

## 12. Backend Auth Notes

Bearer migration is complete. Frontend contract:
- Send `Authorization: Bearer <token>` on every protected request.
- `x-api-key` is rejected — do not reference it anywhere.
- `EventSource` for SSE cannot set headers — pass token as `?token=<token>` query param. Backend accepts this on the stream endpoint.

---

## 13. Realtime Architecture

```
Browser EventSource
    │  GET /v1/runs/{id}/stream?token=<token>
    ▼
FastAPI SSE endpoint   ← direct call, no proxy
    │  subscribes to
    ▼
Redis pub/sub  "run:{run_id}"
    │  published by
    ▼
SimulationRun (Celery worker)
```

`useSimulationSSE` reconnect behavior:
- Retry delays: [1000ms, 2000ms, 4000ms]
- Terminal event `run_complete` → close connection, do one final `useRunStatus` poll for authoritative score
- All retries exhausted → permanently fall back to `useRunStatus` polling every 5s
