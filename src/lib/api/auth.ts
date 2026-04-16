import { apiFetch } from "./client";

export async function login(_email: string, apiKey: string): Promise<string> {
  // Probe a real protected endpoint to validate the key against the backend.
  // GET /v1/projects returns 401 for a bad key, 200 for a valid one.
  await apiFetch<unknown>("/v1/projects", {}, apiKey);
  return apiKey;
}
