import { apiFetch } from "./client";
import type { Project, PreflightResponse } from "../../types/api";

export interface CreateProjectPayload {
  name: string;
  agent_endpoint: string;
  owner_id: string;
  auth_config: {
    type: "bearer" | "apikey" | "basic" | "none";
    value?: string;
    header_name?: string;
  };
  schema_hints?: Record<string, string>;
  company_context?: string;
  max_message_chars?: number;
}

export function getProjects(token: string): Promise<{ items: Project[] }> {
  return apiFetch<{ items: Project[] }>("/v1/projects", {}, token);
}

export function createProject(payload: CreateProjectPayload, token: string): Promise<Project> {
  return apiFetch<Project>("/v1/projects", { method: "POST", body: JSON.stringify(payload) }, token);
}

export function patchProject(id: string, payload: Partial<CreateProjectPayload>, token: string): Promise<Project> {
  return apiFetch<Project>(`/v1/projects/${id}`, { method: "PATCH", body: JSON.stringify(payload) }, token);
}

export function deleteProject(id: string, token: string): Promise<void> {
  return apiFetch<void>(`/v1/projects/${id}`, { method: "DELETE" }, token);
}

export function preflight(id: string, token: string): Promise<PreflightResponse> {
  return apiFetch<PreflightResponse>(`/v1/projects/${id}/preflight`, { method: "POST" }, token);
}
