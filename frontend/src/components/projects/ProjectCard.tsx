import type { Project } from "../../types/api";
import PreflightBadge from "./PreflightBadge";

interface ProjectCardProps {
  project: Project;
  onRunSimulation: (project: Project) => void;
  onEdit: (project: Project) => void;
}

export default function ProjectCard({ project, onRunSimulation, onEdit }: ProjectCardProps) {
  return (
    <div
      className="glass-card rounded-xl p-6 flex flex-col gap-5 group cursor-pointer"
      style={{ border: "1px solid rgba(66,71,84,0.05)", boxShadow: "0 20px 40px -12px rgba(6,14,32,0.5)" }}
    >
      {/* Header row */}
      <div className="flex justify-between items-start gap-3">
        <div className="min-w-0">
          <h3
            className="font-space-grotesk text-lg font-bold transition-colors group-hover:text-primary truncate"
            style={{ color: "#dae2fd" }}
            onClick={() => onEdit(project)}
          >
            {project.name}
          </h3>
          <p className="text-xs font-mono mt-1 truncate max-w-[200px]" style={{ color: "#64748b" }}>
            {project.agent_endpoint}
          </p>
        </div>
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
