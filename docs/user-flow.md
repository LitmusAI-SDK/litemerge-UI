# LitmusAI — User Flow Diagram

## Full User Journey (Mermaid)

```mermaid
flowchart TD
    START([User opens app]) --> AUTH{Authenticated?}
    AUTH -- No --> LOGIN["/login\nLogin Page"]
    AUTH -- Yes --> DASH

    LOGIN -- Enter API key + email --> SUBMIT_LOGIN[POST /v1/auth/login]
    SUBMIT_LOGIN -- Success --> DASH
    SUBMIT_LOGIN -- Failure --> LOGIN_ERR[Show error message]
    LOGIN_ERR --> LOGIN

    DASH["/dashboard\nDashboard - Projects Tab"]

    DASH --> HAS_PROJECTS{Has projects?}
    HAS_PROJECTS -- No --> NEW_PROJ_CTA[Click + New Project]
    HAS_PROJECTS -- Yes --> VIEW_CARDS[View project cards]

    NEW_PROJ_CTA --> NEW_PROJ_FORM[Open New Project Sheet\nName + Endpoint + Auth config]
    NEW_PROJ_FORM -- Fill form --> SAVE_PROJECT[POST /v1/projects]
    SAVE_PROJECT -- Success --> REFRESH_GRID[Refresh project grid\nShow toast: 'Project created']
    SAVE_PROJECT -- Error --> PROJ_ERR[Inline validation error]
    PROJ_ERR --> NEW_PROJ_FORM
    REFRESH_GRID --> VIEW_CARDS

    VIEW_CARDS --> PREFLIGHT_CHECK{Preflight checked?}
    PREFLIGHT_CHECK -- No --> RUN_PREFLIGHT[Click Check on card]
    PREFLIGHT_CHECK -- Yes, green/amber --> READY_TO_RUN[Run button enabled]
    PREFLIGHT_CHECK -- Yes, red --> BLOCKED[Run button disabled\nTooltip: Endpoint unreachable]
    BLOCKED --> EDIT_PROJECT[Click Edit project\nFix endpoint or auth]
    EDIT_PROJECT --> NEW_PROJ_FORM

    RUN_PREFLIGHT --> POST_PREFLIGHT[POST /v1/projects/:id/preflight]
    POST_PREFLIGHT -- green/amber --> READY_TO_RUN
    POST_PREFLIGHT -- red --> BLOCKED

    READY_TO_RUN --> CLICK_RUN[Click Run Simulation]
    CLICK_RUN --> LAUNCH_MODAL[Open Run Launch Modal\nSuite picker + threshold]
    LAUNCH_MODAL -- Cancel --> VIEW_CARDS
    LAUNCH_MODAL -- Click Launch --> POST_RUN[POST /v1/runs]
    POST_RUN -- Error --> LAUNCH_ERR[Show error in modal]
    LAUNCH_ERR --> LAUNCH_MODAL
    POST_RUN -- 202 Accepted (run_id) --> NAVIGATE_SIM

    NAVIGATE_SIM[Navigate to /runs/:runId\nLive Simulation View]

    NAVIGATE_SIM --> OPEN_SSE[Open SSE stream\nGET /v1/runs/:id/stream]
    OPEN_SSE --> WATCH_SIM[Watch persona orbs animate\n+ PersonaSidebar + LiveFeedLog]

    WATCH_SIM --> SSE_EVENTS{SSE events}
    SSE_EVENTS -- session_started --> ORB_SPAWN[Orb brightens + orbits]
    SSE_EVENTS -- turn_completed --> ORB_PULSE[Orb pulses, counter increments]
    SSE_EVENTS -- session_completed --> ORB_FADE[Orb fades, sidebar row = completed]
    SSE_EVENTS -- session_failed --> ORB_FAIL[Orb turns gray, sidebar row = failed]

    ORB_SPAWN --> WATCH_SIM
    ORB_PULSE --> WATCH_SIM
    ORB_FADE --> WATCH_SIM
    ORB_FAIL --> WATCH_SIM

    SSE_EVENTS -- run_complete + evaluating --> EVAL_SPINNER[Show evaluating spinner overlay]
    EVAL_SPINNER --> POLL_STATUS[Poll GET /v1/runs/:id every 5s]
    POLL_STATUS -- status=complete, score arrived --> SCORE_REVEAL

    SCORE_REVEAL[Score Reveal Overlay\nCount-up animation 0 -> score\nPASSED / FAILED badge]

    SCORE_REVEAL --> SCORE_DECISION{User choice}
    SCORE_DECISION -- View Full Report --> REPORT_PAGE
    SCORE_DECISION -- Back to Dashboard --> DASH

    REPORT_PAGE["/runs/:runId/report\nReport View\nGET /v1/reports/:id"]

    REPORT_PAGE --> VIEW_REPORT[See ScoreRing + Dimension breakdown\n+ Findings list]
    VIEW_REPORT --> EXPAND_FINDINGS[Expand FindingCards\nSee prompt vectors + responses]
    VIEW_REPORT --> FILTER_FINDINGS[Filter by severity / finding type]
    VIEW_REPORT --> EXPORT_JSON[Export JSON Artifact\nclient-side download]
    VIEW_REPORT --> DOWNLOAD_PDF[Download PDF Report\nGET /v1/reports/:id/pdf]
    VIEW_REPORT --> BACK_DASH[Back to Dashboard]
    BACK_DASH --> DASH

    DASH --> RUN_HISTORY_TAB[Click Run History tab]
    RUN_HISTORY_TAB --> VIEW_HISTORY[View RunHistoryTable\nAll past runs]
    VIEW_HISTORY -- Click running row --> NAVIGATE_SIM
    VIEW_HISTORY -- Click complete row --> REPORT_PAGE
    VIEW_HISTORY -- Back --> DASH
```

---

## Feature Access Map (by screen)

```
Feature                          Screen(s)                        API Call
───────────────────────────────────────────────────────────────────────────────
Create project                   Dashboard (Sheet)                POST /v1/projects
Edit project                     Dashboard (Sheet, edit mode)     PATCH /v1/projects/:id
List projects                    Dashboard (Projects tab)         GET /v1/projects
Run preflight check              Project card (inline)            POST /v1/projects/:id/preflight
Launch simulation run            Run Launch Modal                 POST /v1/runs
Watch live simulation            /runs/:runId                     GET /v1/runs/:id/stream (SSE)
Poll run status (fallback)       /runs/:runId                     GET /v1/runs/:id
View score reveal                /runs/:runId (overlay)           GET /v1/runs/:id (poll)
View full report                 /runs/:runId/report              GET /v1/reports/:id
Filter findings                  Report view (client-side)        —
Export JSON                      Report view (client-side)        —
Download PDF                     Report view                      GET /v1/reports/:id/pdf
View run history                 Dashboard (Run History tab)      GET /v1/projects + GET /v1/runs
Navigate to live run             Run History table row            —
Navigate to completed report     Run History table row            —
```

---

## CI/CD Integration Flow (non-UI, for reference)

```
Developer machine / GitHub Actions
        │
        ▼
POST /v1/runs          ← triggered by litmusai/test-action
        │
        ▼
Poll GET /v1/runs/:id  ← every 30s, max 15 min
        │
        ├── status = complete, passed = true  → exit 0 (CI passes)
        └── status = complete, passed = false → exit 1 (CI fails)
                                              + post score to PR comment
```

---

## State Transitions (Run Lifecycle)

```
         ┌─────────────────────────────────────────────────────┐
         │                    RUN LIFECYCLE                     │
         └─────────────────────────────────────────────────────┘

  [POST /v1/runs]
        │
        ▼
    ┌────────┐
    │ QUEUED │  ← run_doc inserted, Celery task dispatched
    └────────┘
        │  Celery worker picks up task
        ▼
    ┌─────────┐
    │ RUNNING │  ← SimulationRun.execute() starts
    └─────────┘  SSE events: session_started, turn_completed,
        │        session_completed, session_failed
        │  All sessions finish
        ▼
    ┌────────────┐
    │ EVALUATING │  ← EvaluationEngine runs (Phase 6)
    └────────────┘  LLM judge scores each turn, findings written to KB
        │  Scoring complete
        ▼
    ┌──────────┐     ┌────────┐
    │ COMPLETE │     │ FAILED │  ← on unrecoverable error
    └──────────┘     └────────┘
    score set,       score = null
    report ready     error logged

Dashboard UI reflects each state:
  QUEUED      → gray spinner badge in RunHistoryTable
  RUNNING     → blue pulse badge, live canvas accessible
  EVALUATING  → amber pulse badge, evaluating spinner overlay on canvas
  COMPLETE    → green badge with score, report link active
  FAILED      → red badge, no report
```

---

## Error States & Recovery Flows

```
Error                        UI Response                    Recovery Path
────────────────────────────────────────────────────────────────────────────────
Project create fails         Inline form error             Fix fields, resubmit
Preflight returns red        Run btn disabled, red dot      Edit project endpoint/auth
Run create fails             Error in modal                 Fix and retry
SSE disconnects mid-run      Auto-reconnect (3 retries)    Falls back to polling
SSE fails completely         Switch to polling mode         Poll every 5s
Run status = failed          Red badge in history           No recovery, start new run
Report not found             404 page with back button      Navigate to dashboard
```
