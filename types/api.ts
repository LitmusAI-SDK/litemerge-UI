// Projects
export interface AuthConfigInput {
  type: 'bearer' | 'apikey' | 'basic' | 'none';
  value?: string;
  header_name?: string;
  username?: string;
  password?: string;
}

export interface AuthConfigPublic {
  type: 'bearer' | 'apikey' | 'basic' | 'none';
  header_name?: string | null;
  has_value: boolean;
}

export interface SchemaHints {
  caller_type?: string;
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
  last_run_score?: number | null;
  last_run_passed?: boolean | null;
  last_run_at?: string | null;
  last_run_suite?: string | null;
  preflight_status?: 'green' | 'amber' | 'red' | null;
  preflight_latency_ms?: number | null;
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
  project_id?: string;
  project_name?: string;
  test_suite?: TestSuite;
  fail_threshold?: number;
  status: RunStatus;
  score?: number | null;
  passed?: boolean | null;
  report_url?: string | null;
  summary?: RunSummary | null;
  session_statuses: SessionStatus[];
  created_at?: string;
}

export interface CreateRunRequest {
  project_id: string;
  test_suite: TestSuite;
  fail_threshold: number;
  notify_webhook?: string;
}

export interface CreateRunResponse {
  run_id: string;
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
  project_id?: string;
  project_name?: string;
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
