import { apiFetch } from "./client";
import type { Run, TestSuite } from "../../types/api";

export interface CreateRunPayload {
  project_id: string;
  test_suite: TestSuite;
  fail_threshold: number;
  notify_webhook?: string;
  persona_ids?: string[];
  turns_per_session?: number;
}

export interface RunCreateResponse {
  run_id: string;
  status: string;
  status_url: string;
  estimated_duration_s: number;
}

export function createRun(payload: CreateRunPayload, token: string): Promise<RunCreateResponse> {
  return apiFetch<RunCreateResponse>("/v1/runs", { method: "POST", body: JSON.stringify(payload) }, token);
}

export function getRun(runId: string, token: string): Promise<Run> {
  return apiFetch<Run>(`/v1/runs/${runId}`, {}, token);
}

export function listRuns(token: string, projectId?: string): Promise<Run[]> {
  const qs = projectId ? `?project_id=${projectId}` : "";
  return apiFetch<Run[]>(`/v1/runs${qs}`, {}, token);
}

export interface ConversationTurn {
  turn_index: number;
  persona_message: string;
  agent_response: string;
}

export interface SessionLog {
  persona_id: string;
  persona_name: string | null;
  persona_type: string | null;
  status: "in_progress" | "completed" | "failed";
  turns_completed: number;
  turns: ConversationTurn[];
}

export function getRunSessions(runId: string, token: string): Promise<SessionLog[]> {
  return apiFetch<SessionLog[]>(`/v1/runs/${runId}/sessions`, {}, token);
}
