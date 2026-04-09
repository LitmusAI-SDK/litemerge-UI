import { apiFetch } from "./client";
import type { Run, TestSuite } from "../../types/api";

export interface CreateRunPayload {
  project_id: string;
  test_suite: TestSuite;
  fail_threshold: number;
  notify_webhook?: string;
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
