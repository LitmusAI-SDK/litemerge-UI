import { apiFetch } from "./client";
import type { RunReport } from "../../types/api";

export function getReport(runId: string, token: string): Promise<RunReport> {
  return apiFetch<RunReport>(`/v1/reports/${runId}`, {}, token);
}
