import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useProjects } from "../hooks/useProjects";
import { listRuns } from "../lib/api/runs";
import RunStatusBadge from "../components/runs/RunStatusBadge";
import { scoreToHex } from "../lib/utils";
import type { Run, TestSuite } from "../types/api";

const SUITE_COLORS: Record<TestSuite, { bg: string; text: string; border: string }> = {
  standard:    { bg: "rgba(45,52,73,0.8)",     text: "#c2c6d6", border: "rgba(66,71,84,0.2)" },
  adversarial: { bg: "rgba(87,27,193,0.15)",   text: "#d0bcff", border: "rgba(87,27,193,0.3)" },
  full:        { bg: "rgba(173,198,255,0.1)",  text: "#adc6ff", border: "rgba(173,198,255,0.25)" },
};

function StatCard({ label, value, sub, color = "#dae2fd" }: {
  label: string;
  value: string | number;
  sub?: string;
  color?: string;
}) {
  return (
    <div
      className="rounded-xl p-6 flex flex-col gap-2"
      style={{ backgroundColor: "#131b2e" }}
    >
      <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "#64748b" }}>
        {label}
      </p>
      <p className="text-4xl font-space-grotesk font-bold" style={{ color, lineHeight: 1 }}>
        {value}
      </p>
      {sub && (
        <p className="text-xs font-mono" style={{ color: "#424754" }}>{sub}</p>
      )}
    </div>
  );
}

export default function DashboardOverview() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const { projects, loading: projectsLoading } = useProjects();

  const [runs, setRuns] = useState<Run[]>([]);
  const [runsLoading, setRunsLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    listRuns(token)
      .then(setRuns)
      .catch(() => setRuns([]))
      .finally(() => setRunsLoading(false));
  }, [token]);

  const recentRuns = runs.slice(0, 5);
  const lastCompleted = runs.find((r) => r.status === "complete" && r.score != null);
  const activeRuns = runs.filter((r) => r.status === "running" || r.status === "evaluating").length;

  return (
    <div className="min-h-full px-8 pt-8 pb-12" style={{ backgroundColor: "#0b1326" }}>
      {/* Page header */}
      <div
        className="mb-10 pb-6"
        style={{ borderBottom: "1px solid rgba(66,71,84,0.1)" }}
      >
        <h2 className="text-4xl font-space-grotesk font-bold tracking-tight" style={{ color: "#dae2fd" }}>
          Dashboard
        </h2>
        <p className="text-sm mt-1" style={{ color: "#8c909f" }}>
          Behavioral AI observability at a glance.
        </p>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <StatCard
          label="Projects"
          value={projectsLoading ? "—" : projects.length}
          sub="configured targets"
        />
        <StatCard
          label="Total Runs"
          value={runsLoading ? "—" : runs.length}
          sub="all time"
        />
        <StatCard
          label="Last Score"
          value={lastCompleted?.score != null ? lastCompleted.score.toFixed(0) : "—"}
          color={lastCompleted?.score != null ? scoreToHex(lastCompleted.score) : "#424754"}
          sub={lastCompleted?.passed != null ? (lastCompleted.passed ? "passed" : "failed") : undefined}
        />
        <StatCard
          label="Active Runs"
          value={runsLoading ? "—" : activeRuns}
          color={activeRuns > 0 ? "#adc6ff" : "#dae2fd"}
          sub="running now"
        />
      </div>

      {/* Recent runs */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-space-grotesk font-bold text-lg" style={{ color: "#dae2fd" }}>
            Recent Runs
          </h3>
          <button
            onClick={() => navigate("/history")}
            className="flex items-center gap-1 text-xs font-bold transition-all hover:opacity-80"
            style={{ color: "#adc6ff" }}
          >
            View all
            <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </button>
        </div>

        <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: "#131b2e" }}>
          {runsLoading ? (
            <div className="space-y-px">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-16 animate-pulse" style={{ backgroundColor: "#171f33" }} />
              ))}
            </div>
          ) : recentRuns.length === 0 ? (
            <div className="py-12 text-center">
              <span className="material-symbols-outlined text-4xl mb-3 block" style={{ color: "#2d3449" }}>
                history
              </span>
              <p className="text-sm" style={{ color: "#424754" }}>No runs yet. Launch one from a project.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr
                    className="text-[11px] tracking-[0.2em] font-bold uppercase"
                    style={{ backgroundColor: "rgba(34,42,61,0.5)", color: "#8c909f" }}
                  >
                    <th className="py-4 px-6 font-space-grotesk">Run ID</th>
                    <th className="py-4 px-6 font-space-grotesk">Suite</th>
                    <th className="py-4 px-6 font-space-grotesk">Score</th>
                    <th className="py-4 px-6 font-space-grotesk">Status</th>
                    <th className="py-4 px-6 font-space-grotesk">Date</th>
                    <th className="py-4 px-6 font-space-grotesk text-right">Open</th>
                  </tr>
                </thead>
                <tbody>
                  {recentRuns.map((run) => {
                    const suiteKey = run.test_suite ?? "standard";
                    const suiteStyle = SUITE_COLORS[suiteKey] ?? SUITE_COLORS.standard;
                    const target = run.status === "complete"
                      ? `/runs/${run.run_id}/report`
                      : `/runs/${run.run_id}`;
                    return (
                      <tr
                        key={run.run_id}
                        className="group transition-colors cursor-pointer"
                        style={{ borderTop: "1px solid rgba(66,71,84,0.1)" }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#2d3449")}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                        onClick={() => navigate(target)}
                      >
                        <td className="py-4 px-6 font-mono text-sm" style={{ color: "#adc6ff" }}>
                          #{run.run_id.slice(0, 8)}
                        </td>
                        <td className="py-4 px-6">
                          <span
                            className="px-2 py-1 rounded text-[11px] font-bold uppercase tracking-wider"
                            style={{ backgroundColor: suiteStyle.bg, color: suiteStyle.text, border: `1px solid ${suiteStyle.border}` }}
                          >
                            {suiteKey}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          {run.score != null ? (
                            <div className="flex items-center gap-2">
                              <span
                                className="text-lg font-space-grotesk font-bold"
                                style={{ color: scoreToHex(run.score) }}
                              >
                                {run.score.toFixed(0)}
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
                              {run.status === "queued" ? "Pending…" : "—"}
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-6">
                          <RunStatusBadge status={run.status} />
                        </td>
                        <td className="py-4 px-6 text-sm" style={{ color: "#94a3b8" }}>
                          {new Date(run.created_at ?? Date.now()).toLocaleString(undefined, {
                            month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
                          })}
                        </td>
                        <td className="py-4 px-6 text-right">
                          <span className="material-symbols-outlined" style={{ color: "#475569" }}>
                            open_in_new
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Quick actions */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate("/projects")}
          className="flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm transition-all active:scale-95"
          style={{
            background: "linear-gradient(135deg, #adc6ff, #4d8eff)",
            color: "#002e6a",
            boxShadow: "0 4px 16px rgba(173,198,255,0.1)",
          }}
        >
          <span className="material-symbols-outlined text-lg">folder_shared</span>
          View All Projects
        </button>
        <button
          onClick={() => navigate("/history")}
          className="flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm transition-all"
          style={{
            backgroundColor: "rgba(45,52,73,0.6)",
            color: "#adc6ff",
            border: "1px solid rgba(173,198,255,0.15)",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(45,52,73,0.9)")}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "rgba(45,52,73,0.6)")}
        >
          <span className="material-symbols-outlined text-lg">history</span>
          Full Run History
        </button>
      </div>
    </div>
  );
}
