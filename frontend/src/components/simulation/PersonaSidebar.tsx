import type { SessionStatus } from "../../types/api";

const PERSONA_COLORS: Record<string, string> = {
  p1_low_literacy:      "#3B82F6",
  p2_non_native:        "#8B5CF6",
  p3_adversarial:       "#EF4444",
  p4_distressed:        "#F59E0B",
  p5_domain_expert:     "#10B981",
  p6_ambiguous:         "#06B6D4",
  p7_multi_turn_drift:  "#F97316",
  p8_extra_adversarial: "#F43F5E",
};

const DEFAULT_TURNS = 8;

interface PersonaSidebarProps {
  sessions: SessionStatus[];
}

function statusChip(status: SessionStatus["status"]) {
  if (status === "in_progress") return { label: "Running",   bg: "rgba(78,222,163,0.1)",   color: "#4edea3" };
  if (status === "completed")   return { label: "Complete",  bg: "rgba(78,222,163,0.08)",  color: "#4edea3" };
  return                               { label: "Failed",    bg: "rgba(255,180,171,0.1)",  color: "#ffb4ab" };
}

export default function PersonaSidebar({ sessions }: PersonaSidebarProps) {
  return (
    <aside
      className="w-72 flex flex-col p-4 gap-4 overflow-y-auto shrink-0"
      style={{ backgroundColor: "#131b2e", borderRight: "1px solid rgba(66,71,84,0.05)" }}
    >
      <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] px-2" style={{ color: "#8c909f" }}>
        Active Personas
      </h2>

      {sessions.length === 0 && (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-xs text-center" style={{ color: "#424754" }}>Waiting for sessions to start…</p>
        </div>
      )}

      {sessions.map((s) => {
        const color = PERSONA_COLORS[s.persona_type ?? ""] ?? "#adc6ff";
        const chip = statusChip(s.status);
        const pct = Math.round((s.turns_completed / DEFAULT_TURNS) * 100);
        const isFailed = s.status === "failed";

        return (
          <div
            key={s.persona_id}
            className="p-4 rounded-xl space-y-3 transition-all"
            style={{
              backgroundColor: "#2d3449",
              opacity: s.status === "completed" ? 0.7 : 1,
              border: isFailed ? "1px solid rgba(255,180,171,0.3)" : "1px solid transparent",
              boxShadow: isFailed ? "0 0 0 4px rgba(255,180,171,0.05)" : "none",
            }}
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="font-space-grotesk font-bold text-sm" style={{ color: "#d0bcff" }}>
                  {s.persona_name ?? s.persona_id}
                </p>
                <p className="text-[10px] font-mono mt-0.5" style={{ color: "#64748b" }}>
                  {s.persona_type ?? s.persona_id}
                </p>
              </div>
              <span
                className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-tighter"
                style={{ backgroundColor: chip.bg, color: chip.color }}
              >
                {chip.label}
              </span>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-[10px] font-mono" style={{ color: "#8c909f" }}>
                <span>Turn {s.turns_completed}/{DEFAULT_TURNS}</span>
                {isFailed
                  ? <span style={{ color: "#ffb4ab" }}>Failed</span>
                  : <span>{pct}%</span>
                }
              </div>
              <div className="h-1 rounded-full overflow-hidden" style={{ backgroundColor: "#0b1326" }}>
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${pct}%`,
                    backgroundColor: isFailed ? "#ffb4ab" : color,
                    boxShadow: isFailed ? "none" : `0 0 8px ${color}80`,
                  }}
                />
              </div>
            </div>
          </div>
        );
      })}
    </aside>
  );
}
