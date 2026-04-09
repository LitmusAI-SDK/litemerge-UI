import { api } from './client';
import type { Project, PreflightResponse, AuthConfigInput, SchemaHints } from '@/types/api';

export interface CreateProjectPayload {
  name: string;
  agent_endpoint: string;
  auth_config: AuthConfigInput;
  schema_hints?: SchemaHints | null;
}

export function listProjects(): Promise<Project[]> {
  return api.get<{ items: Project[] }>('/v1/projects').then((r) => r.items);
}

export function createProject(payload: CreateProjectPayload): Promise<Project> {
  return api.post<Project>('/v1/projects', payload);
}

export function patchProject(id: string, payload: Partial<CreateProjectPayload>): Promise<Project> {
  return api.patch<Project>(`/v1/projects/${id}`, payload);
}

export function runPreflight(id: string): Promise<PreflightResponse> {
  return api.post<PreflightResponse>(`/v1/projects/${id}/preflight`);
}
