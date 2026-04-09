'use client';

import { useState } from 'react';
import { runPreflight } from '@/lib/api/projects';
import type { PreflightResponse } from '@/types/api';

interface PreflightState {
  status: 'idle' | 'loading' | 'done';
  result: PreflightResponse | null;
  error: string | null;
  checkedAt: Date | null;
}

export function usePreflight(projectId: string) {
  const [state, setState] = useState<PreflightState>({
    status: 'idle',
    result: null,
    error: null,
    checkedAt: null,
  });

  async function check() {
    setState((s) => ({ ...s, status: 'loading', error: null }));
    try {
      const result = await runPreflight(projectId);
      setState({ status: 'done', result, error: null, checkedAt: new Date() });
      return result;
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Preflight failed';
      setState({ status: 'done', result: null, error: msg, checkedAt: new Date() });
      return null;
    }
  }

  return { ...state, check };
}
