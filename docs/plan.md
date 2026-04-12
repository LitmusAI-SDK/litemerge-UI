# LitmusAI Frontend — Implementation Plan (Phase 7)

## 1. Overview

This document is the authoritative implementation plan for the LitmusAI Next.js dashboard. It is structured for direct use with UI-focused coding agents. Each session section is a discrete, self-contained prompt target.

**Tech Stack**
| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Styling | Tailwind CSS |
| Component library | shadcn/ui |
| Canvas / animation | WebGL via `three.js` or raw canvas API |
| API client | Typed fetch wrappers in `/lib/api/` |
| Realtime | Server-Sent Events via `EventSource` |
| State | React Context + `useState`/`useReducer` (no Redux) |
| Auth | HTTP-only session cookie set by backend `/v1/auth/login` |
| Icons | Lucide React (ships with shadcn) |
| Charts | Recharts (lightweight, Tailwind-friendly) |

---

## 2. Folder Structure

```
./
├── app/
│   ├── layout.tsx                  # Root layout — font, ThemeProvider
│   ├── page.tsx                    # Redirect → /dashboard or /login
│   ├── login/
│   │   └── page.tsx                # Login page
│   ├── dashboard/
│   │   ├── layout.tsx              # Sidebar nav + top bar shell
│   │   └── page.tsx                # Dashboard: projects + recent runs tabs
│   ├── projects/
│   │   └── [projectId]/
│   │       └── page.tsx            # Single project detail (runs history)
│   ├── runs/
│   │   └── [runId]/
│   │       ├── page.tsx            # Live simulation view (canvas)
│   │       └── report/
│   │           └── page.tsx        # Post-run report view
│   └── api/                        # Next.js Route Handlers (proxy layer)
│       ├── auth/login/route.ts
│       └── [...path]/route.ts      # Generic proxy to backend API
├── components/
│   ├── ui/                         # shadcn/ui primitives (auto-generated)
│   ├── layout/
│   │   ├── Sidebar.tsx
│   │   └── TopBar.tsx
│   ├── projects/
│   │   ├── ProjectCard.tsx         # Card with score badge + preflight dot + Run btn
│   │   ├── ProjectGrid.tsx         # Responsive grid of ProjectCards
│   │   ├── NewProjectForm.tsx      # Inline create form (accordion/sheet)
│   │   └── PreflightBadge.tsx      # green/amber/red status dot + latency
│   ├── runs/
│   │   ├── RunLaunchModal.tsx      # Suite picker + threshold + launch button
│   │   ├── RunHistoryTable.tsx     # Table of past runs with score + status
│   │   └── RunStatusBadge.tsx      # queued/running/evaluating/complete/failed
│   ├── simulation/
│   │   ├── SimulationCanvas.tsx    # WebGL/canvas persona orb animation
│   │   ├── PersonaSidebar.tsx      # Per-persona progress list
│   │   ├── LiveFeedLog.tsx         # Scrolling event log
│   │   ├── StatsBar.tsx            # Conversations / issues counters
│   │   └── ScoreRevealOverlay.tsx  # Spinner → animated score → cert badge
│   └── reports/
│       ├── ScoreRing.tsx           # SVG donut ring — color-coded score
│       ├── DimensionBreakdown.tsx  # Per-dimension bar rows
│       ├── FindingCard.tsx         # Expandable finding: prompt / response / severity
│       ├── FindingsList.tsx        # Sorted list of FindingCards
│       └── ReportHeader.tsx        # Run metadata + download buttons
├── hooks/
│   ├── useSimulationSSE.ts         # EventSource consumer → dispatch events
│   ├── useRunStatus.ts             # Polling fallback for GET /v1/runs/{id}
│   ├── usePreflight.ts             # Trigger + poll preflight per project
│   └── useProjects.ts              # Fetch + cache project list
├── lib/
│   ├── api/
│   │   ├── client.ts               # Base fetch wrapper (auth headers, error handling)
│   │   ├── projects.ts             # createProject, listProjects, patchProject, preflight
│   │   ├── runs.ts                 # createRun, getRunStatus
│   │   └── reports.ts             # getReport
│   └── utils.ts                    # cn(), scoreToColor(), formatDuration()
├── types/
│   └── api.ts                      # TypeScript mirrors of backend Pydantic schemas
└── public/
    └── litmusai-logo.svg
```

---

## 3. API Client Contract

All frontend → backend calls go through typed functions in `lib/api/`. These call the Next.js proxy route (`/api/[...path]`) which forwards to the backend with the session cookie. **Never call the backend directly from client components.**

### types/api.ts — canonical type mirrors

```typescript
// Projects
export interface AuthConfigInput {
  type: 'bearer' | 'apikey' | 'basic' | 'none';
  value?: string;
  header_name?: string;
}
export interface AuthConfigPublic {
  type: 'bearer' | 'apikey' | 'basic' | 'none';
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
  status: 'green' | 'amber' | 'red';
  latency_ms: number;
  error?: string | null;
}

// Runs
export type TestSuite = 'standard' | 'adversarial' | 'full';
export type RunStatus = 'queued' | 'running' | 'evaluating' | 'complete' | 'failed';
export interface RunSummary {
  total_conversations: number;
  personas_deployed: number;
  issues_flagged: number;
}
export interface SessionStatus {
  persona_id: string;
  persona_name?: string | null;
  persona_type?: string | null;
  status: 'in_progress' | 'completed' | 'failed';
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

// Reports
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
  severity: 'critical' | 'high' | 'medium' | 'low';
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

// SSE Events
export type SSEEventType =
  | 'session_started'
  | 'turn_completed'
  | 'session_completed'
  | 'session_failed'
  | 'evaluation_started'
  | 'run_complete';
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

## 4. Session Breakdown

### Session 7A — Dashboard + Project Setup

**Goal:** Working dashboard shell with project listing, project creation, and preflight status.

**Deliverable:** User can log in, see their projects as cards, create a new project, and trigger a preflight check.

**Tasks:**
1. Scaffold Next.js 14 app with Tailwind + shadcn/ui init (`npx shadcn-ui@latest init`)
2. Login page — email/password form, POST to `/api/auth/login`, redirect to `/dashboard`
3. Dashboard page — two tabs: "Projects" and "Run History"
4. `ProjectCard` — shows name, endpoint truncated, last score badge (gray if none), preflight indicator dot, "Run" button
5. `NewProjectForm` — collapsible form with: name, endpoint URL, auth type select, conditional auth value field, optional schema hints accordion
6. `PreflightBadge` — calls `POST /v1/projects/{id}/preflight`, shows spinner → colored dot + latency ms
7. `useProjects` hook — fetch `GET /v1/projects`, SWR or manual state, refresh after create/patch

**Components to build:** `Sidebar`, `TopBar`, `ProjectCard`, `ProjectGrid`, `NewProjectForm`, `PreflightBadge`

**API calls used:**
- `GET /v1/projects`
- `POST /v1/projects`
- `PATCH /v1/projects/{id}`
- `POST /v1/projects/{id}/preflight`

---

### Session 7B — Simulation Launch + Live Canvas View

**Goal:** User can launch a run, watch live persona orbs animate, and see a score reveal when complete.

**Deliverable:** Clicking "Run" opens the launch modal → navigates to `/runs/{id}` → live canvas view streams SSE events → score overlays on completion.

**Tasks:**
1. `RunLaunchModal` — suite picker (standard/adversarial/full), fail threshold slider (0–100), optional webhook URL, "Launch Simulation" button → `POST /v1/runs` → navigate to `/runs/{run_id}`
2. `/runs/[runId]/page.tsx` — SSE consumer via `useSimulationSSE`, layout: canvas center + sidebar right + stats bar top + live feed bottom
3. `SimulationCanvas` — canvas element, 7–8 persona orbs spawn on `session_started` events, orbit/pulse on `turn_completed`, fade on `session_completed`/`session_failed`. Color by persona type (see color map below)
4. `PersonaSidebar` — list of active personas, each with: icon, name, status chip, turns progress bar (turns_completed / 8)
5. `StatsBar` — live counters: "Conversations: N", "Issues Found: N", "Personas Active: N/7"
6. `LiveFeedLog` — scrolling log of SSE events formatted as human-readable strings
7. `ScoreRevealOverlay` — activates on `run_complete` event: spinner (evaluating) → animated count-up to score → PASSED/FAILED badge → "View Report" button
8. `useSimulationSSE` hook — opens `EventSource` to `GET /v1/runs/{id}/stream`, dispatches events to local state, closes on terminal event
9. `useRunStatus` hook — polling fallback every 5s via `GET /v1/runs/{id}` for cases where SSE reconnects

**Persona color map (for canvas orbs):**
```
p1 low_literacy      → blue   (#3B82F6)
p2 non_native        → violet (#8B5CF6)
p3 adversarial       → red    (#EF4444)
p4 distressed        → amber  (#F59E0B)
p5 domain_expert     → green  (#10B981)
p6 ambiguous         → cyan   (#06B6D4)
p7 multi_turn_drift  → orange (#F97316)
p8 extra adversarial → rose   (#F43F5E)
```

**Components to build:** `RunLaunchModal`, `SimulationCanvas`, `PersonaSidebar`, `LiveFeedLog`, `StatsBar`, `ScoreRevealOverlay`

**API calls used:**
- `POST /v1/runs`
- `GET /v1/runs/{id}` (polling fallback)
- `GET /v1/runs/{id}/stream` (SSE)

---

### Session 7C — Report View

**Goal:** Full post-run report with score ring, per-dimension breakdown, and expandable findings.

**Deliverable:** `/runs/{id}/report` shows a complete evaluation report. User can download PDF and export JSON artifact.

**Tasks:**
1. `/runs/[runId]/report/page.tsx` — fetch `GET /v1/reports/{run_id}` server-side, render report layout
2. `ReportHeader` — run metadata: run ID, project name, date, suite, threshold, PASSED/FAILED chip, elapsed time
3. `ScoreRing` — SVG donut, fill arc proportional to score, color: green ≥70, amber 50–69, red <50. Center text = score number
4. `DimensionBreakdown` — horizontal bar rows per finding type, color-coded by worst severity in that type, sorted highest count first
5. `FindingCard` — expandable card: header = severity chip + finding_type + persona_type; expanded = full prompt_vector + agent_response_excerpt code blocks
6. `FindingsList` — renders `FindingCard[]` sorted critical → high → medium → low. Filter chips by severity and finding_type
7. Download PDF button — calls `GET /v1/reports/{run_id}/pdf` (Phase 8 endpoint, show disabled state until available)
8. Export JSON button — downloads the raw `RunReport` JSON as a file client-side

**Components to build:** `ReportHeader`, `ScoreRing`, `DimensionBreakdown`, `FindingCard`, `FindingsList`

**API calls used:**
- `GET /v1/reports/{run_id}`

---

## 5. Authentication Strategy

- Backend issues an HTTP-only session cookie on `POST /v1/auth/login`
- Next.js middleware (`middleware.ts`) checks cookie presence; redirects to `/login` if absent
- All API calls from client components go to Next.js `/api/[...path]` Route Handlers which forward the cookie to the backend
- No JWT stored in localStorage

---

## 6. Realtime Architecture

```
Browser (EventSource)
    │
    ▼ GET /v1/runs/{id}/stream
Next.js Route Handler (proxy)
    │
    ▼ forwards SSE stream
FastAPI SSE endpoint
    │ subscribes to
    ▼
Redis pub/sub channel "run:{run_id}"
    │ published by
    ▼
SimulationRun (Celery worker)
```

The `useSimulationSSE` hook must handle:
- Reconnect on disconnect (max 3 retries with backoff)
- `run_complete` event closes the connection
- Falls back to `useRunStatus` polling if SSE fails after all retries

---

## 7. Score Color Logic

Used across multiple components (ring, badges, table rows):

```typescript
export function scoreToColor(score: number): string {
  if (score >= 70) return 'text-emerald-500';  // passed
  if (score >= 50) return 'text-amber-500';    // borderline
  return 'text-red-500';                        // failed
}
export function scoreToBg(score: number): string {
  if (score >= 70) return 'bg-emerald-500';
  if (score >= 50) return 'bg-amber-500';
  return 'bg-red-500';
}
```

---

## 8. Key Design Constraints

1. **No framework auth libraries** — session cookie managed manually via Route Handlers
2. **No global state manager** — React Context only for auth state; per-page local state for everything else
3. **shadcn/ui only for primitives** — Button, Input, Select, Badge, Card, Tabs, Accordion, Dialog, Sheet, Slider, Progress, Separator
4. **Canvas animation is progressive enhancement** — if WebGL unavailable, degrade to a simple progress list layout; the `PersonaSidebar` always works without canvas
5. **Mobile is secondary** — desktop-first layout (min 1024px), responsive but not mobile-optimized
6. **No mock data** — all data from real API calls or the SSE stream; use skeleton loaders for loading states

---

## 9. Development Environment

```bash
# From repository root
npx create-next-app@latest . --typescript --tailwind --app --src-dir=no --import-alias="@/*"
npx shadcn-ui@latest init
npm run dev    # http://localhost:3000

# Backend must be running at http://localhost:8000
# Set in .env.local:
NEXT_PUBLIC_API_URL=http://localhost:8000
```

The Next.js proxy route (`/api/[...path]`) forwards all `/api/*` calls to `NEXT_PUBLIC_API_URL`, adding the session cookie automatically.
