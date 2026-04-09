import { useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useRunStatus } from "../hooks/useRunStatus";
import { useSimulationSSE } from "../hooks/useSimulationSSE";
import StatsBar from "../components/simulation/StatsBar";
import PersonaSidebar from "../components/simulation/PersonaSidebar";
import SimulationCanvas from "../components/simulation/SimulationCanvas";
import LiveFeedLog from "../components/simulation/LiveFeedLog";
import ScoreRevealOverlay from "../components/simulation/ScoreRevealOverlay";
import type { SSEEvent } from "../types/api";

export default function RunView() {
  const { runId } = useParams<{ runId: string }>();
  const { token } = useAuth();
  const navigate = useNavigate();

  const [events, setEvents] = useState<SSEEvent[]>([]);
  const [lastEvent, setLastEvent] = useState<SSEEvent | null>(null);

  const handleEvent = useCallback((evt: SSEEvent) => {
    setEvents((prev) => [...prev.slice(-199), evt]);
    setLastEvent(evt);
  }, []);

  // SSE stream — primary
  const { connected } = useSimulationSSE(
    runId ?? "",
    token ?? "",
    handleEvent,
    !!runId && !!token
  );

  // Polling fallback (always active, becomes sole source when SSE exhausted)
  const run = useRunStatus(runId ?? "", !!runId);

  if (!run) {
    return (
      <div className="h-full flex items-center justify-center" style={{ backgroundColor: "#0b1326" }}>
        <div className="flex flex-col items-center gap-4">
          <div
            className="w-10 h-10 rounded-full border-2 animate-spin"
            style={{ borderColor: "rgba(173,198,255,0.2)", borderTopColor: "#adc6ff" }}
          />
          <p className="text-sm font-mono" style={{ color: "#64748b" }}>Loading run…</p>
        </div>
      </div>
    );
  }

  const isTerminal = run.status === "complete" || run.status === "failed";
  const showOverlay = run.status === "evaluating" || isTerminal;

  return (
    <div className="flex flex-col h-full overflow-hidden" style={{ backgroundColor: "#0b1326" }}>
      {/* Stats bar — back button + counters */}
      <div className="flex items-center gap-2 px-6 shrink-0" style={{ height: "4rem", borderBottom: "1px solid rgba(66,71,84,0.1)", backgroundColor: "rgba(11,19,38,0.7)", backdropFilter: "blur(20px)" }}>
        <button
          onClick={() => navigate("/dashboard")}
          className="p-2 rounded-lg transition-all hover:bg-[#2d3449]"
          style={{ color: "#adc6ff" }}
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <div className="flex-1">
          <StatsBar run={run} connected={connected} />
        </div>
      </div>

      {/* 3-column layout */}
      <main className="flex flex-1 overflow-hidden">
        <PersonaSidebar sessions={run.session_statuses} />
        <SimulationCanvas sessions={run.session_statuses} lastEvent={lastEvent} />
        <LiveFeedLog events={events} connected={connected} />
      </main>

      {/* Score reveal overlay */}
      {showOverlay && <ScoreRevealOverlay run={run} />}
    </div>
  );
}
