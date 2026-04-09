import { useEffect, useRef } from "react";
import type { SSEEvent } from "../../types/api";

interface LogLine {
  ts: number;
  event: string;
  text: string;
  color: string;
  borderColor?: string;
}

function eventToLine(evt: SSEEvent): LogLine {
  const ts = Date.now();

  switch (evt.event) {
    case "session_started":
      return { ts, event: "SESSION_START", text: `Persona ${evt.persona_type ?? evt.persona_id} session started.`, color: "#adc6ff", borderColor: "#adc6ff" };
    case "turn_completed":
      return { ts, event: "TURN_COMPLETED", text: `Persona ${evt.persona_type ?? evt.persona_id} completed turn ${(evt.turn_index ?? 0) + 1}.`, color: "#c2c6d6", borderColor: "#adc6ff" };
    case "session_completed":
      return { ts, event: "SESSION_DONE", text: `Persona ${evt.persona_type ?? evt.persona_id} session completed.`, color: "#4edea3", borderColor: "#4edea3" };
    case "session_failed":
      return { ts, event: "SESSION_FAILED", text: `Persona ${evt.persona_type ?? evt.persona_id} session failed.`, color: "#ffb4ab", borderColor: "#ffb4ab" };
    case "evaluation_started":
      return { ts, event: "EVAL_START", text: "Evaluation engine started. Analyzing behavioral patterns…", color: "#d0bcff", borderColor: "#d0bcff" };
    case "run_complete":
      return { ts, event: "RUN_COMPLETE", text: `Run ${evt.run_id} completed with status: ${evt.status}.`, color: "#4edea3", borderColor: "#4edea3" };
    default:
    {
      const eventName = String(evt.event).toUpperCase();
      return { ts, event: eventName, text: JSON.stringify(evt), color: "#8c909f" };
    }
  }
}

interface LiveFeedLogProps {
  events: SSEEvent[];
  connected: boolean;
}

export default function LiveFeedLog({ events, connected }: LiveFeedLogProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [events.length]);

  const lines = events.slice(-200).map(eventToLine);

  return (
    <aside
      className="w-80 flex flex-col shrink-0"
      style={{ backgroundColor: "#131b2e", borderLeft: "1px solid rgba(66,71,84,0.05)" }}
    >
      {/* Header */}
      <div
        className="p-4 flex items-center justify-between"
        style={{ borderBottom: "1px solid rgba(66,71,84,0.1)", backgroundColor: "rgba(34,42,61,0.4)", backdropFilter: "blur(12px)" }}
      >
        <h2 className="text-xs font-bold uppercase tracking-widest flex items-center gap-2" style={{ color: "#adc6ff" }}>
          <span className="material-symbols-outlined text-sm">terminal</span>
          Live Feed
        </h2>
        <span className="text-[10px] font-mono" style={{ color: "#64748b" }}>
          {connected ? "SSE: CONNECTED" : "SSE: POLLING"}
        </span>
      </div>

      {/* Log */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "11px", lineHeight: "1.6" }}>
        {lines.length === 0 && (
          <p style={{ color: "#424754" }}>Waiting for events…</p>
        )}
        {lines.map((line, i) => (
          <div
            key={i}
            className="space-y-0.5 pl-3"
            style={{ borderLeft: line.borderColor ? `2px solid ${line.borderColor}40` : "none" }}
          >
            <div className="flex justify-between opacity-60 text-[10px]" style={{ color: line.color }}>
              <span>[{new Date(line.ts).toLocaleTimeString("en-US", { hour12: false })}]</span>
              <span>{line.event}</span>
            </div>
            <p style={{ color: line.color }}>{line.text}</p>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Footer */}
      <div
        className="p-4"
        style={{ borderTop: "1px solid rgba(66,71,84,0.1)", backgroundColor: "rgba(45,52,73,0.2)" }}
      >
        <div className="flex gap-2">
          <div
            className="flex-1 h-8 rounded flex items-center px-3"
            style={{ backgroundColor: "#131b2e", border: "1px solid rgba(66,71,84,0.3)" }}
          >
            <span className="text-[11px] font-mono opacity-50" style={{ color: "#8c909f" }}>Filter logs…</span>
          </div>
          <button
            className="w-8 h-8 rounded flex items-center justify-center transition-colors hover:bg-[#2d3449]"
            style={{ backgroundColor: "#222a3d", border: "1px solid rgba(66,71,84,0.3)", color: "#8c909f" }}
          >
            <span className="material-symbols-outlined text-sm">download</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
