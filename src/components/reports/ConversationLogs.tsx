import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import type { SessionLog, ConversationTurn } from "../../lib/api/runs";

const STATUS_COLORS: Record<string, string> = {
  completed: "#4edea3",
  failed: "#ffb4ab",
  in_progress: "#adc6ff",
};

function TurnRow({ turn, sessionId, defaultOpen = false }: { turn: ConversationTurn; sessionId: string; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  const toggleId = `turn-toggle-${sessionId}-${turn.turn_index}`;
  const panelId = `turn-panel-${sessionId}-${turn.turn_index}`;

  return (
    <div
      className="rounded-lg overflow-hidden"
      style={{ border: "1px solid rgba(66,71,84,0.15)" }}
    >
      <button
        id={toggleId}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={panelId}
        className="w-full flex items-center justify-between px-4 py-2.5 transition-colors text-left"
        style={{ backgroundColor: open ? "rgba(45,52,73,0.5)" : "rgba(34,42,61,0.4)" }}
        onMouseEnter={(e) => { if (!open) e.currentTarget.style.backgroundColor = "rgba(45,52,73,0.3)"; }}
        onMouseLeave={(e) => { if (!open) e.currentTarget.style.backgroundColor = "rgba(34,42,61,0.4)"; }}
      >
        <span className="font-mono text-xs font-bold" style={{ color: "#64748b" }}>
          Turn {turn.turn_index + 1}
        </span>
        <span className="text-xs truncate max-w-xs mx-4 flex-1 text-left" style={{ color: "#8c909f" }}>
          {turn.persona_message.slice(0, 80)}{turn.persona_message.length > 80 ? "…" : ""}
        </span>
        {open ? <ChevronUp size={14} style={{ color: "#424754", flexShrink: 0 }} /> : <ChevronDown size={14} style={{ color: "#424754", flexShrink: 0 }} />}
      </button>

      {open && (
        <div id={panelId} role="region" aria-labelledby={toggleId} className="px-4 py-4 space-y-4" style={{ backgroundColor: "#0b1326" }}>
          {/* Persona message */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: "#424754" }}>
              Persona
            </p>
            <pre
              className="font-mono text-xs rounded-lg px-4 py-3 overflow-x-auto whitespace-pre-wrap break-words"
              style={{ backgroundColor: "#131b2e", color: "#c2c6d6", border: "1px solid rgba(66,71,84,0.1)" }}
            >
              {turn.persona_message || <span style={{ color: "#424754" }}>(empty)</span>}
            </pre>
          </div>

          {/* Agent response */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: "#424754" }}>
              Agent Response
            </p>
            <pre
              className="font-mono text-xs rounded-lg px-4 py-3 overflow-x-auto whitespace-pre-wrap break-words"
              style={{ backgroundColor: "#131b2e", color: "#adc6ff", border: "1px solid rgba(66,71,84,0.1)" }}
            >
              {turn.agent_response || <span style={{ color: "#424754" }}>(empty)</span>}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}

function SessionBlock({ session }: { session: SessionLog }) {
  const [open, setOpen] = useState(false);
  const statusColor = STATUS_COLORS[session.status] ?? "#94a3b8";
  const personaLabel = session.persona_name ?? session.persona_type ?? session.persona_id;
  const toggleId = `session-toggle-${session.persona_id}`;
  const panelId = `session-panel-${session.persona_id}`;

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{ border: "1px solid rgba(66,71,84,0.2)", backgroundColor: "#131b2e" }}
    >
      {/* Session header */}
      <button
        id={toggleId}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={panelId}
        className="w-full flex items-center gap-4 px-5 py-4 transition-colors text-left"
        style={{ backgroundColor: open ? "rgba(45,52,73,0.5)" : "transparent" }}
        onMouseEnter={(e) => { if (!open) e.currentTarget.style.backgroundColor = "rgba(45,52,73,0.25)"; }}
        onMouseLeave={(e) => { if (!open) e.currentTarget.style.backgroundColor = "transparent"; }}
      >
        {/* Status dot */}
        <span
          className="w-2 h-2 rounded-full shrink-0"
          style={{ backgroundColor: statusColor }}
        />

        {/* Persona name */}
        <span className="font-space-grotesk font-bold text-sm flex-1 truncate" style={{ color: "#dae2fd" }}>
          {personaLabel}
        </span>

        {/* Persona type chip */}
        {session.persona_type && (
          <span
            className="font-mono text-[10px] px-2 py-0.5 rounded shrink-0"
            style={{ backgroundColor: "rgba(45,52,73,0.8)", color: "#94a3b8" }}
          >
            {session.persona_type}
          </span>
        )}

        {/* Turn count */}
        <span className="font-mono text-xs shrink-0" style={{ color: "#64748b" }}>
          {session.turns_completed} turn{session.turns_completed !== 1 ? "s" : ""}
        </span>

        {/* Status label */}
        <span className="text-xs font-semibold shrink-0 capitalize" style={{ color: statusColor }}>
          {session.status.replace("_", " ")}
        </span>

        {open ? <ChevronUp size={16} style={{ color: "#424754", flexShrink: 0 }} /> : <ChevronDown size={16} style={{ color: "#424754", flexShrink: 0 }} />}
      </button>

      {/* Turns list */}
      {open && (
        <div id={panelId} role="region" aria-labelledby={toggleId} className="px-5 pb-5 space-y-2" style={{ borderTop: "1px solid rgba(66,71,84,0.15)" }}>
          {session.turns.length === 0 ? (
            <p className="text-sm py-4 text-center" style={{ color: "#424754" }}>No turns recorded.</p>
          ) : (
            <div className="pt-4 space-y-2">
              {session.turns.map((turn) => (
                <TurnRow key={turn.turn_index} turn={turn} sessionId={session.persona_id} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

interface ConversationLogsProps {
  sessions: SessionLog[];
  loading: boolean;
}

export default function ConversationLogs({ sessions, loading }: ConversationLogsProps) {
  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-14 rounded-xl animate-pulse" style={{ backgroundColor: "#171f33" }} />
        ))}
      </div>
    );
  }

  if (sessions.length === 0) {
    return (
      <p className="font-body text-sm" style={{ color: "#424754" }}>
        No conversation logs available for this run.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {sessions.map((session) => (
        <SessionBlock key={session.persona_id} session={session} />
      ))}
    </div>
  );
}
