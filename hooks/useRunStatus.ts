'use client';

import { useState, useEffect, useRef } from 'react';
import { getRunStatus } from '@/lib/api/runs';
import type { Run } from '@/types/api';

const TERMINAL_STATUSES = new Set(['complete', 'failed']);

export function useRunStatus(runId: string, enabled = true, intervalMs = 5000) {
  const [run, setRun] = useState<Run | null>(null);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!enabled) return;

    async function poll() {
      try {
        const data = await getRunStatus(runId);
        setRun(data);
        if (TERMINAL_STATUSES.has(data.status)) {
          clearInterval(intervalRef.current!);
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Polling failed');
      }
    }

    poll();
    intervalRef.current = setInterval(poll, intervalMs);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [runId, enabled, intervalMs]);

  return { run, error };
}
