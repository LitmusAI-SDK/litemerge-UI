import { apiFetch } from "./client";

interface LoginResponse {
  token: string;
}

export async function login(email: string, apiKey: string): Promise<string> {
  // If /v1/auth/login isn't implemented, use the api_key directly as the bearer token
  try {
    const res = await apiFetch<LoginResponse>("/v1/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, api_key: apiKey }),
    });
    return res.token;
  } catch {
    // Interim fallback: treat api_key as the bearer token directly
    return apiKey;
  }
}
