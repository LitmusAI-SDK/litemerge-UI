import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useProjects } from "../hooks/useProjects";
import ProjectCard from "../components/projects/ProjectCard";
import NewProjectSheet from "../components/projects/NewProjectSheet";
import RunLaunchModal from "../components/runs/RunLaunchModal";
import RunHistoryTable from "../components/runs/RunHistoryTable";
import type { Project } from "../types/api";

type Tab = "projects" | "history";

export default function Dashboard() {
  const { projects, loading, error, refresh } = useProjects();
  const [searchParams, setSearchParams] = useSearchParams();
  const rawTab = searchParams.get("tab");
  const tab: Tab = rawTab === "history" ? "history" : "projects";

  function setTab(t: Tab) {
    setSearchParams({ tab: t }, { replace: true });
  }
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
    <div className="min-h-full" style={{ backgroundColor: "#0b1326" }}>
      <main className="px-8 pt-8 pb-12">
        {/* Tab bar */}
        <div
          className="mb-10 flex items-end justify-between"
          style={{ borderBottom: "1px solid rgba(66,71,84,0.1)" }}
        >
          <div className="flex gap-8">
            {(["projects", "history"] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className="pb-4 px-1 font-space-grotesk font-medium text-lg capitalize transition-colors"
                style={{
                  color: tab === t ? "#adc6ff" : "#94a3b8",
                  borderBottom: tab === t ? "2px solid #adc6ff" : "2px solid transparent",
                }}
              >
                {t === "projects" ? "Projects" : "Run History"}
              </button>
            ))}
          </div>
          {tab === "projects" && (
            <div className="pb-4">
              <span className="text-xs font-mono uppercase tracking-widest" style={{ color: "#64748b" }}>
                {projects.length} project{projects.length !== 1 ? "s" : ""}
              </span>
            </div>
          )}
        </div>

        {/* Projects tab */}
        {tab === "projects" && (
          <>
            {error && (
              <p className="text-sm mb-6" style={{ color: "#ffb4ab" }}>{error}</p>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {/* New Project card */}
              <button
                onClick={openNew}
                className="group relative min-h-[220px] flex flex-col items-center justify-center gap-4 rounded-xl transition-all duration-300"
                style={{
                  border: "2px dashed rgba(66,71,84,0.3)",
                }}
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
                  className="w-12 h-12 rounded-full flex items-center justify-center transition-colors"
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

            {/* Capacity section — shown only once runs exist (populated in Phase C/D) */}
            {false && !loading && projects.length > 0 && (
              <section className="mt-12 grid grid-cols-1 lg:grid-cols-4 gap-8">
                <div
                  className="lg:col-span-3 rounded-xl p-8 overflow-hidden relative group"
                  style={{ backgroundColor: "#131b2e" }}
                >
                  <div className="relative z-10">
                    <h4 className="font-space-grotesk text-2xl font-bold mb-2" style={{ color: "#dae2fd" }}>
                      Computational Capacity
                    </h4>
                    <p className="text-sm max-w-lg mb-6" style={{ color: "#94a3b8" }}>
                      Current engine utilization is optimized for high-concurrency behavioral testing.
                    </p>
                    <div className="flex gap-4">
                      {[
                        { label: "CPU Load", value: "14.2%", color: "#adc6ff" },
                        { label: "Mem Pool", value: "2.8 GB", color: "#d0bcff" },
                      ].map((stat) => (
                        <div
                          key={stat.label}
                          className="px-4 py-2 rounded"
                          style={{ backgroundColor: "#2d3449", border: "1px solid rgba(66,71,84,0.1)" }}
                        >
                          <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: "#64748b" }}>
                            {stat.label}
                          </p>
                          <p className="font-mono" style={{ color: stat.color }}>{stat.value}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div
                  className="rounded-xl p-6"
                  style={{ backgroundColor: "#2d3449", border: "1px solid rgba(66,71,84,0.05)" }}
                >
                  <h5 className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: "#64748b" }}>
                    Quick Stats
                  </h5>
                  <div className="space-y-6">
                    {[
                      { label: "Success Rate", value: "94%", pct: 94, color: "#4edea3" },
                      { label: "Anomalies Detected", value: "12", pct: 15, color: "#ffb4ab" },
                    ].map((stat) => (
                      <div key={stat.label}>
                        <div className="flex justify-between text-xs mb-2">
                          <span style={{ color: "#c2c6d6" }}>{stat.label}</span>
                          <span style={{ color: stat.color }}>{stat.value}</span>
                        </div>
                        <div className="h-1 w-full rounded-full overflow-hidden" style={{ backgroundColor: "#131b2e" }}>
                          <div className="h-full rounded-full" style={{ width: `${stat.pct}%`, backgroundColor: stat.color }} />
                        </div>
                      </div>
                    ))}
                    <div className="pt-4" style={{ borderTop: "1px solid rgba(66,71,84,0.1)" }}>
                      <button
                        className="w-full py-2 flex items-center justify-between text-xs font-bold transition-transform hover:translate-x-1"
                        style={{ color: "#adc6ff" }}
                        onClick={() => setTab("history")}
                      >
                        View Full Metrics
                        <span className="material-symbols-outlined text-sm">arrow_forward</span>
                      </button>
                    </div>
                  </div>
                </div>
              </section>
            )}
          </>
        )}

        {/* Run History tab */}
        {tab === "history" && <RunHistoryTable />}
      </main>

      {/* New / Edit project sheet */}
      <NewProjectSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        onSaved={refresh}
        editProject={editProject}
      />

      {/* Run launch modal */}
      {launchProject && (
        <RunLaunchModal
          project={launchProject}
          onClose={() => setLaunchProject(null)}
        />
      )}
    </div>
  );
}
