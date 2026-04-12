import { useEffect, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { getRun } from "../lib/api/runs";
import type { Run } from "../types/api";

export function useRunStatus(runId: string, active = true) {
  const { token } = useAuth();
  const [run, setRun] = useState<Run | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!active || !token || !runId) return;

    async function poll() {
      if (!token) return;
      try {
        const data = await getRun(runId, token);
        setRun(data);
        if (data.status === "complete" || data.status === "failed") {
          if (intervalRef.current) clearInterval(intervalRef.current);
        }
      } catch {
        // silently ignore poll errors
      }
    }

    poll();
    intervalRef.current = setInterval(poll, 5000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [runId, token, active]);

  return run;
}
