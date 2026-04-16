import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Project, Run } from "../../types/api";
import PreflightBadge from "./PreflightBadge";
import { listRuns } from "../../lib/api/runs";
import { useAuth } from "../../context/AuthContext";
import RunStatusBadge from "../runs/RunStatusBadge";
import { scoreToHex } from "../../lib/utils";

interface ProjectCardProps {
  project: Project;
  onRunSimulation: (project: Project) => void;
  onEdit: (project: Project) => void;
}

export default function ProjectCard({ project, onRunSimulation, onEdit }: ProjectCardProps) {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [recentRuns, setRecentRuns] = useState<Run[]>([]);

  useEffect(() => {
    if (!token) return;
    listRuns(token, project.id)
      .then((runs) => {
        const sorted = [...runs].sort((a, b) => {
          const aTime = a.created_at ? new Date(a.created_at).getTime() : 0;
          const bTime = b.created_at ? new Date(b.created_at).getTime() : 0;
          return (isNaN(bTime) ? 0 : bTime) - (isNaN(aTime) ? 0 : aTime);
        });
        setRecentRuns(sorted.slice(0, 3));
      })
      .catch(() => setRecentRuns([]));
  }, [token, project.id]);

  return (
    <div
      className="glass-card rounded-xl p-6 flex flex-col gap-5 group"
      style={{ border: "1px solid rgba(66,71,84,0.05)", boxShadow: "0 20px 40px -12px rgba(6,14,32,0.5)" }}
    >
      {/* Header row */}
      <div className="flex justify-between items-start gap-3">
        <button
          type="button"
          className="min-w-0 text-left"
          onClick={() => onEdit(project)}
          aria-label={`Edit ${project.name}`}
        >
          <h3
            className="font-space-grotesk text-lg font-bold transition-colors group-hover:text-primary truncate"
            style={{ color: "#dae2fd" }}
          >
            {project.name}
          </h3>
          <p className="text-xs font-mono mt-1 truncate max-w-[200px]" style={{ color: "#64748b" }}>
            {project.agent_endpoint}
          </p>
        </button>
        {/* Auth type chip */}
        <span
          className="shrink-0 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded font-mono"
          style={{
            backgroundColor: "rgba(45,52,73,0.8)",
            color: "#c2c6d6",
            border: "1px solid rgba(66,71,84,0.2)",
          }}
        >
          {project.auth_config.type}
        </span>
      </div>

      {/* Preflight row */}
      <div className="flex items-center gap-4 py-2" style={{ borderTop: "1px solid rgba(66,71,84,0.1)", borderBottom: "1px solid rgba(66,71,84,0.1)" }}>
        <PreflightBadge projectId={project.id} />
        <div className="text-[10px] uppercase tracking-tighter font-bold pl-4" style={{ color: "#64748b", borderLeft: "1px solid rgba(66,71,84,0.2)" }}>
          {new Date(project.updated_at).toLocaleDateString()}
        </div>
      </div>

      {/* Recent runs */}
      <div className="flex-1">
        <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: "#424754" }}>
          Recent Runs
        </p>
        {recentRuns.length === 0 ? (
          <p className="text-xs italic" style={{ color: "#424754" }}>No runs yet</p>
        ) : (
          <div className="space-y-1.5">
            {recentRuns.map((run) => (
              <button
                key={run.run_id}
                onClick={() => navigate(run.status === "complete" ? `/runs/${run.run_id}/report` : `/runs/${run.run_id}`)}
                className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg transition-colors text-left"
                style={{ backgroundColor: "rgba(45,52,73,0.4)" }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(45,52,73,0.8)")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "rgba(45,52,73,0.4)")}
              >
                <span className="font-mono text-xs" style={{ color: "#adc6ff" }}>
                  #{run.run_id.slice(0, 8)}
                </span>
                <span className="text-[10px] font-mono" style={{ color: "#64748b" }}>
                  {run.test_suite ?? "standard"}
                </span>
                {run.score != null ? (
                  <span className="font-bold text-xs font-mono" style={{ color: scoreToHex(run.score) }}>
                    {run.score.toFixed(0)}
                  </span>
                ) : null}
                <RunStatusBadge status={run.status} />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* CTA */}
      <div className="mt-auto">
        <button
          onClick={() => onRunSimulation(project)}
          className="w-full px-4 py-2.5 rounded-lg font-bold text-sm transition-all active:scale-95"
          style={{
            background: "linear-gradient(135deg, #adc6ff, #4d8eff)",
            color: "#002e6a",
            boxShadow: "0 4px 16px rgba(173,198,255,0.1)",
          }}
        >
          Run Simulation
        </button>
      </div>
    </div>
  );
}
