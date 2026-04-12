import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { listRuns } from "../../lib/api/runs";
import RunStatusBadge from "./RunStatusBadge";
import type { Run, RunStatus, TestSuite } from "../../types/api";
import { scoreToHex } from "../../lib/utils";

const SUITE_COLORS: Record<TestSuite, { bg: string; text: string; border: string }> = {
  standard:   { bg: "rgba(45,52,73,0.8)",      text: "#c2c6d6", border: "rgba(66,71,84,0.2)" },
  adversarial:{ bg: "rgba(87,27,193,0.15)",    text: "#d0bcff", border: "rgba(87,27,193,0.3)" },
  full:       { bg: "rgba(173,198,255,0.1)",   text: "#adc6ff", border: "rgba(173,198,255,0.25)" },
};

export default function RunHistoryTable() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [runs, setRuns] = useState<Run[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<RunStatus | "all">("all");

  useEffect(() => {
    if (!token) return;
    listRuns(token)
      .then(setRuns)
      .catch(() => setRuns([]))
      .finally(() => setLoading(false));
  }, [token]);

  const filtered = statusFilter === "all"
    ? runs
    : runs.filter((r) => r.status === statusFilter);

  if (loading) {
    return (
      <div className="space-y-2">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-16 rounded-lg animate-pulse" style={{ backgroundColor: "#171f33" }} />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header + filters */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <h2 className="text-4xl font-space-grotesk font-bold tracking-tight" style={{ color: "#dae2fd" }}>
            Run History
          </h2>
          <p className="text-sm" style={{ color: "#8c909f" }}>
            Audit and monitor all behavioral AI execution traces.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div
            className="flex items-center p-1 rounded-xl"
            style={{ backgroundColor: "#131b2e" }}
          >
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
              className="bg-transparent border-none text-sm focus:ring-0 cursor-pointer py-2 px-4 outline-none"
              style={{ color: "#dae2fd" }}
            >
              <option value="all">Status: All</option>
              <option value="complete">Complete</option>
              <option value="running">Running</option>
              <option value="evaluating">Evaluating</option>
              <option value="failed">Failed</option>
              <option value="queued">Queued</option>
            </select>
          </div>
        </div>
      </section>

      {/* Table */}
      <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: "#131b2e" }}>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr
                className="text-[11px] tracking-[0.2em] font-bold uppercase"
                style={{ backgroundColor: "rgba(34,42,61,0.5)", color: "#8c909f" }}
              >
                <th className="py-5 px-6 font-space-grotesk">Run ID</th>
                <th className="py-5 px-6 font-space-grotesk">Suite</th>
                <th className="py-5 px-6 font-space-grotesk">Score</th>
                <th className="py-5 px-6 font-space-grotesk">Status</th>
                <th className="py-5 px-6 font-space-grotesk">Date</th>
                <th className="py-5 px-6 font-space-grotesk text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-sm" style={{ color: "#8c909f" }}>
                    No runs found.
                  </td>
                </tr>
              ) : (
                filtered.map((run) => {
                  const suiteKey = (run as unknown as { test_suite?: TestSuite }).test_suite ?? "standard";
                  const suiteStyle = SUITE_COLORS[suiteKey] ?? SUITE_COLORS.standard;
                  return (
                    <tr
                      key={run.run_id}
                      className="group transition-colors cursor-pointer"
                      style={{ borderTop: "1px solid rgba(66,71,84,0.1)" }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#2d3449")}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                      onClick={() => navigate(`/runs/${run.run_id}`)}
                    >
                      <td className="py-5 px-6 font-mono text-sm" style={{ color: "#adc6ff" }}>
                        #{run.run_id.slice(0, 8)}
                      </td>
                      <td className="py-5 px-6">
                        <span
                          className="px-2 py-1 rounded text-[11px] font-bold uppercase tracking-wider"
                          style={{ backgroundColor: suiteStyle.bg, color: suiteStyle.text, border: `1px solid ${suiteStyle.border}` }}
                        >
                          {suiteKey}
                        </span>
                      </td>
                      <td className="py-5 px-6">
                        {run.score != null ? (
                          <div className="flex items-center gap-2">
                            <span
                              className="text-lg font-space-grotesk font-bold"
                              style={{ color: scoreToHex(run.score) }}
                            >
                              {run.score.toFixed(1)}
                            </span>
                            <span
                              className="text-[10px] px-1.5 py-0.5 rounded font-black uppercase tracking-tighter"
                              style={{
                                color: run.passed ? "#4edea3" : "#ffb4ab",
                                backgroundColor: run.passed ? "rgba(78,222,163,0.1)" : "rgba(255,180,171,0.1)",
                                border: `1px solid ${run.passed ? "rgba(78,222,163,0.2)" : "rgba(255,180,171,0.2)"}`,
                              }}
                            >
                              {run.passed ? "Pass" : "Fail"}
                            </span>
                          </div>
                        ) : (
                          <span className="text-sm italic" style={{ color: "#64748b" }}>
                            {run.status === "queued" ? "Pending…" : "Calculating…"}
                          </span>
                        )}
                      </td>
                      <td className="py-5 px-6">
                        <RunStatusBadge status={run.status} />
                      </td>
                      <td className="py-5 px-6 text-sm" style={{ color: "#94a3b8" }}>
                        {new Date((run as unknown as { created_at?: string }).created_at ?? Date.now()).toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                      </td>
                      <td className="py-5 px-6 text-right">
                        <span
                          className="material-symbols-outlined transition-colors"
                          style={{ color: "#475569" }}
                        >
                          open_in_new
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div
          className="flex items-center justify-between px-8 py-6"
          style={{ backgroundColor: "rgba(34,42,61,0.2)", borderTop: "1px solid rgba(66,71,84,0.1)" }}
        >
          <p className="text-sm" style={{ color: "#64748b" }}>
            Showing <span style={{ color: "#dae2fd", fontWeight: 700 }}>{filtered.length}</span> runs
          </p>
        </div>
      </div>
    </div>
  );
}
