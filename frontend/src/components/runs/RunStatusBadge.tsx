import type { RunStatus } from "../../types/api";

const STATUS_CONFIG: Record<RunStatus, { icon: string; label: string; color: string; fill?: boolean; pulse?: boolean }> = {
  queued:     { icon: "schedule",      label: "Queued",     color: "#94a3b8" },
  running:    { icon: "wifi_tethering",label: "Running",    color: "#adc6ff", pulse: true },
  evaluating: { icon: "analytics",     label: "Evaluating", color: "#d0bcff" },
  complete:   { icon: "check_circle",  label: "Complete",   color: "#4edea3", fill: true },
  failed:     { icon: "error",         label: "Failed",     color: "#ffb4ab", fill: true },
};

export default function RunStatusBadge({ status }: { status: RunStatus }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.queued;

  return (
    <div className="flex items-center gap-2">
      {status === "running" ? (
        <span
          className="w-2 h-2 rounded-full status-pulse"
          style={{ backgroundColor: cfg.color }}
        />
      ) : (
        <span
          className="material-symbols-outlined text-lg"
          style={{ color: cfg.color, fontVariationSettings: cfg.fill ? "'FILL' 1" : "'FILL' 0" }}
        >
          {cfg.icon}
        </span>
      )}
      <span className="text-sm font-bold" style={{ color: cfg.color }}>
        {cfg.label}
      </span>
    </div>
  );
}
