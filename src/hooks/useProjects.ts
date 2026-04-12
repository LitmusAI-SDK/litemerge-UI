import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { getProjects } from "../lib/api/projects";
import type { Project } from "../types/api";

export function useProjects() {
  const { token } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const res = await getProjects(token);
      setProjects(res.items);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load projects");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { refresh(); }, [refresh]);

  return { projects, loading, error, refresh };
}
