import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { preflight } from "../../lib/api/projects";
import type { PreflightResponse } from "../../types/api";

interface PreflightBadgeProps {
  projectId: string;
}

export default function PreflightBadge({ projectId }: PreflightBadgeProps) {
  const { token } = useAuth();
  const [result, setResult] = useState<PreflightResponse | null>(null);
  const [loading, setLoading] = useState(false);

  async function run() {
    if (!token || loading) return;
    setLoading(true);
    try {
      const res = await preflight(projectId, token);
      setResult(res);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <button onClick={run} className="flex items-center gap-1.5 text-xs" style={{ color: "#8c909f" }}>
        <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>
        Checking…
      </button>
    );
  }

  if (!result) {
    return (
      <button
        onClick={run}
        className="flex items-center gap-1.5 text-xs font-mono transition-colors hover:opacity-80"
        style={{ color: "#8c909f" }}
      >
        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: "#424754" }} />
        Probe
      </button>
    );
  }

  const color = result.status === "green" ? "#4edea3" : result.status === "amber" ? "#F59E0B" : "#ffb4ab";
  const glow = result.status === "green"
    ? "0 0 8px rgba(78,222,163,0.6)"
    : result.status === "amber"
    ? "0 0 8px rgba(245,158,11,0.6)"
    : "0 0 8px rgba(255,180,171,0.6)";

  return (
    <button onClick={run} className="flex items-center gap-2 text-xs font-mono transition-opacity hover:opacity-80">
      <span
        className="w-2 h-2 rounded-full"
        style={{ backgroundColor: color, boxShadow: glow }}
      />
      <span style={{ color }}>{Math.round(result.latency_ms)}ms</span>
      {result.error && (
        <span style={{ color: "#ffb4ab" }}>{result.error.slice(0, 20)}</span>
      )}
    </button>
  );
}
