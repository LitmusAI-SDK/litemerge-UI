'use client';

import { useState } from 'react';
import { Loader2, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { usePreflight } from '@/hooks/usePreflight';
import type { PreflightResponse } from '@/types/api';

interface PreflightBadgeProps {
  projectId: string;
  initialResult?: PreflightResponse | null;
  onResult?: (result: PreflightResponse | null) => void;
}

export default function PreflightBadge({ projectId, initialResult, onResult }: PreflightBadgeProps) {
  const { status, result: hookResult, checkedAt, check } = usePreflight(projectId);
  const result = hookResult ?? initialResult;

  async function handleCheck() {
    const r = await check();
    onResult?.(r);
  }

  const isLoading = status === 'loading';
  const isDone = status === 'done' || (status === 'idle' && initialResult != null);

  if (isLoading) {
    return (
      <div className="flex items-center gap-1.5 text-xs text-slate-400">
        <Loader2 size={10} className="animate-spin text-slate-400" />
        Checking…
      </div>
    );
  }

  if (!isDone || !result) {
    return (
      <button
        onClick={handleCheck}
        className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition-colors"
      >
        <span className="w-2 h-2 rounded-full border border-slate-500 inline-block" />
        Not checked{' '}
        <span className="text-emerald-500 hover:text-emerald-400">Check ↗</span>
      </button>
    );
  }

  const dotColor =
    result.status === 'green'
      ? 'bg-emerald-500'
      : result.status === 'amber'
      ? 'bg-amber-500'
      : 'bg-red-500';

  const latencyText =
    result.status === 'red'
      ? `Error${result.error ? `: ${result.error}` : ''}`
      : `${result.latency_ms} ms`;

  const checkedAtStr = checkedAt
    ? checkedAt.toLocaleTimeString('en-US', { hour12: false })
    : '';

  return (
    <Tooltip>
      <TooltipTrigger
          onClick={handleCheck}
          className="flex items-center gap-1.5 text-xs transition-colors group bg-transparent border-none p-0 cursor-pointer"
        >
          <span className={cn('w-2 h-2 rounded-full flex-shrink-0', dotColor)} />
          <span
            className={cn(
              result.status === 'green'
                ? 'text-emerald-400'
                : result.status === 'amber'
                ? 'text-amber-400'
                : 'text-red-400'
            )}
          >
            {latencyText}
          </span>
          <RefreshCw
            size={10}
            className="text-slate-600 group-hover:text-slate-400 transition-colors ml-0.5"
          />
      </TooltipTrigger>
      <TooltipContent className="bg-slate-700 border-slate-600 text-white text-xs p-3 space-y-1">
        {checkedAtStr && <p className="text-slate-400">Last checked: {checkedAtStr}</p>}
        <p>Endpoint reachable: {result.status !== 'red' ? 'Yes' : 'No'}</p>
        {result.status !== 'red' && <p>Latency: {result.latency_ms} ms</p>}
        {result.error && <p className="text-red-400">{result.error}</p>}
        <p className="text-emerald-400 mt-1">Click to re-check</p>
      </TooltipContent>
    </Tooltip>
  );
}
