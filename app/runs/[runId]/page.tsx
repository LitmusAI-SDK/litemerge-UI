'use client';

import { use } from 'react';
import Link from 'next/link';
import { ArrowLeft, Wifi, WifiOff } from 'lucide-react';
import SimulationCanvas from '@/components/simulation/SimulationCanvas';
import PersonaSidebar from '@/components/simulation/PersonaSidebar';
import LiveFeedLog from '@/components/simulation/LiveFeedLog';
import StatsBar from '@/components/simulation/StatsBar';
import ScoreRevealOverlay from '@/components/simulation/ScoreRevealOverlay';
import RunStatusBadge from '@/components/runs/RunStatusBadge';
import { useSimulationSSE } from '@/hooks/useSimulationSSE';
import { useRunStatus } from '@/hooks/useRunStatus';

interface Params {
  runId: string;
}

export default function RunPage({ params }: { params: Promise<Params> }) {
  const { runId } = use(params);
  const { state, sseConnected, sseFailed } = useSimulationSSE(runId);
  // Polling fallback when SSE fails, or to get final run data for overlay
  const { run } = useRunStatus(
    runId,
    sseFailed || state.isComplete || state.isEvaluating,
    5000
  );

  const sessionList = Object.values(state.sessions);
  const completedPersonas = sessionList.filter(
    (s) => s.status === 'completed' || s.status === 'failed'
  ).length;

  const showOverlay =
    (state.isEvaluating || state.isComplete) &&
    run != null &&
    (run.status === 'evaluating' || run.status === 'complete');

  return (
    <div className="flex flex-col h-screen bg-slate-900 overflow-hidden">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-slate-800 border-b border-slate-700 flex-shrink-0">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="text-slate-400 hover:text-white transition-colors">
            <ArrowLeft size={16} />
          </Link>
          <span className="text-sm text-slate-400">Run:</span>
          <span className="text-sm font-mono text-white">{runId}</span>
          {run?.test_suite && (
            <span className="text-xs text-slate-500 capitalize">/ {run.test_suite}</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {sseConnected ? (
            <div className="flex items-center gap-1.5 text-xs text-emerald-400">
              <Wifi size={12} />
              Live
            </div>
          ) : sseFailed ? (
            <div className="flex items-center gap-1.5 text-xs text-amber-400">
              <WifiOff size={12} />
              Polling
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              Connecting…
            </div>
          )}
          {run && <RunStatusBadge status={run.status} />}
        </div>
      </div>

      {/* Stats bar */}
      <StatsBar
        conversations={state.conversations}
        issues={state.issueCount}
        completedPersonas={completedPersonas}
        totalPersonas={sessionList.length || 7}
      />

      {/* Main area */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Persona sidebar */}
        <PersonaSidebar sessions={state.sessions} />

        {/* Canvas */}
        <div className="flex-1 relative overflow-hidden">
          <SimulationCanvas sessions={state.sessions} isComplete={state.isComplete} />

          {/* Score overlay */}
          {showOverlay && run && (
            <ScoreRevealOverlay run={run} runId={runId} />
          )}
        </div>

        {/* Live feed */}
        <div className="w-64 flex-shrink-0 overflow-hidden flex flex-col">
          <LiveFeedLog entries={state.feedLog} />
        </div>
      </div>
    </div>
  );
}
