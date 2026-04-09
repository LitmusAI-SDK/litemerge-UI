import { api } from './client';
import type { Run, CreateRunRequest, CreateRunResponse } from '@/types/api';

export function createRun(payload: CreateRunRequest): Promise<CreateRunResponse> {
  return api.post<CreateRunResponse>('/v1/runs', payload);
}

export function getRunStatus(runId: string): Promise<Run> {
  return api.get<Run>(`/v1/runs/${runId}`);
}

export function listRuns(): Promise<Run[]> {
  return api.get<Run[]>('/v1/runs');
}
