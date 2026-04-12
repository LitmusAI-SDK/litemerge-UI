import type { Run } from "../../types/api";

interface StatsBarProps {
  run: Run;
  connected: boolean;
}

export default function StatsBar({ run, connected }: StatsBarProps) {
  const conversations = run.summary?.total_conversations ?? 0;
  const issues = run.summary?.issues_flagged ?? 0;
  const total = run.session_statuses.length;
  const active = run.session_statuses.filter((s) => s.status === "in_progress").length;

  return (
    <header
      className="h-16 px-6 flex items-center justify-between shrink-0 z-50"
      style={{ backgroundColor: "rgba(11,19,38,0.7)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(66,71,84,0.1)" }}
    >
      <div className="flex items-center gap-6">
        {/* Run ID + live badge */}
        <div className="flex flex-col">
          <div className="flex items-center gap-3">
            <h1 className="font-space-grotesk font-bold text-lg tracking-tight" style={{ color: "#dae2fd" }}>
              Run: <span style={{ color: "#adc6ff" }}>{run.run_id.slice(0, 12).toUpperCase()}</span>
            </h1>
            {(run.status === "running" || run.status === "evaluating") && (
              <span
                className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5"
                style={{ backgroundColor: "#93000a", color: "#ffb4ab" }}
              >
                <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: "#ffb4ab" }} />
                {run.status === "evaluating" ? "Evaluating" : "Live Simulation"}
              </span>
            )}
          </div>
          <p className="text-xs" style={{ color: "#8c909f" }}>
            Status: {run.status} · {total} persona{total !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-8 pr-6" style={{ borderRight: "1px solid rgba(66,71,84,0.2)" }}>
        {[
          { label: "Conversations", value: conversations, color: "#adc6ff" },
          { label: "Issues Found", value: issues, color: "#ffb4ab" },
          { label: "Personas Active", value: `${active}/${total}`, color: "#4edea3" },
        ].map((s) => (
          <div key={s.label} className="text-right">
            <p className="text-[10px] uppercase tracking-widest" style={{ color: "#8c909f" }}>{s.label}</p>
            <p className="font-space-grotesk font-bold text-xl" style={{ color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* SSE indicator */}
      <div className="flex items-center gap-2 pl-6">
        <span
          className="w-2 h-2 rounded-full"
          style={{ backgroundColor: connected ? "#4edea3" : "#424754", boxShadow: connected ? "0 0 6px rgba(78,222,163,0.6)" : "none" }}
        />
        <span className="text-[10px] font-mono uppercase tracking-widest" style={{ color: "#64748b" }}>
          {connected ? "SSE: CONNECTED" : "SSE: POLLING"}
        </span>
      </div>
    </header>
  );
}
