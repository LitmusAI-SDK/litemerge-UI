import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useProjects } from "../hooks/useProjects";
import ProjectCard from "../components/projects/ProjectCard";
import NewProjectSheet from "../components/projects/NewProjectSheet";
import RunLaunchModal from "../components/runs/RunLaunchModal";
import type { Project } from "../types/api";

export default function ProjectsPage() {
  const { projects, loading, error, refresh } = useProjects();
  const navigate = useNavigate();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editProject, setEditProject] = useState<Project | null>(null);
  const [launchProject, setLaunchProject] = useState<Project | null>(null);

  function openNew() {
    setEditProject(null);
    setSheetOpen(true);
  }

  function openEdit(project: Project) {
    setEditProject(project);
    setSheetOpen(true);
  }

  return (
    <div className="min-h-full px-8 pt-8 pb-12" style={{ backgroundColor: "#0b1326" }}>
      {/* Page header */}
      <div
        className="mb-10 flex items-end justify-between pb-6"
        style={{ borderBottom: "1px solid rgba(66,71,84,0.1)" }}
      >
        <div>
          <h2 className="text-4xl font-space-grotesk font-bold tracking-tight" style={{ color: "#dae2fd" }}>
            Projects
          </h2>
          <p className="text-sm mt-1" style={{ color: "#8c909f" }}>
            Configure and manage your AI agent test targets.
          </p>
        </div>
        <span className="text-xs font-mono uppercase tracking-widest pb-1" style={{ color: "#64748b" }}>
          {projects.length} project{projects.length !== 1 ? "s" : ""}
        </span>
      </div>

      {error && (
        <p className="text-sm mb-6" style={{ color: "#ffb4ab" }}>{error}</p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {/* New Project card */}
        <button
          onClick={openNew}
          className="group relative min-h-[220px] flex flex-col items-center justify-center gap-4 rounded-xl transition-all duration-300"
          style={{ border: "2px dashed rgba(66,71,84,0.3)" }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "rgba(173,198,255,0.5)";
            e.currentTarget.style.backgroundColor = "rgba(173,198,255,0.05)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "rgba(66,71,84,0.3)";
            e.currentTarget.style.backgroundColor = "transparent";
          }}
        >
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center"
            style={{ backgroundColor: "#131b2e", color: "#94a3b8" }}
          >
            <span className="material-symbols-outlined text-3xl">add</span>
          </div>
          <div className="text-center">
            <p className="font-space-grotesk font-bold" style={{ color: "#dae2fd" }}>New Project</p>
            <p className="text-xs mt-1" style={{ color: "#64748b" }}>Initiate behavioral analysis</p>
          </div>
        </button>

        {/* Skeleton loaders */}
        {loading && [...Array(2)].map((_, i) => (
          <div
            key={i}
            className="rounded-xl p-6 animate-pulse"
            style={{ backgroundColor: "#171f33", minHeight: "220px" }}
          />
        ))}

        {/* Project cards */}
        {!loading && projects.map((project) => (
          <ProjectCard
            key={project.id}
            project={project}
            onRunSimulation={setLaunchProject}
            onEdit={openEdit}
          />
        ))}
      </div>

      <NewProjectSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        onSaved={refresh}
        editProject={editProject}
      />

      {launchProject && (
        <RunLaunchModal
          project={launchProject}
          onClose={() => setLaunchProject(null)}
        />
      )}
    </div>
  );
}
