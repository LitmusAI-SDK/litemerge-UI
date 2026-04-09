'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import TopBar from '@/components/layout/TopBar';
import ProjectGrid from '@/components/projects/ProjectGrid';
import NewProjectForm from '@/components/projects/NewProjectForm';
import RunHistoryTable from '@/components/runs/RunHistoryTable';
import RunLaunchModal from '@/components/runs/RunLaunchModal';
import { useProjects } from '@/hooks/useProjects';
import { useRuns } from '@/hooks/useRuns';
import type { Project } from '@/types/api';

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="flex-1 bg-slate-900" />}>
      <DashboardContent />
    </Suspense>
  );
}

function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tab = searchParams.get('tab') === 'history' ? 'history' : 'projects';

  const { projects, loading: projLoading, refresh: refreshProjects } = useProjects();
  const { runs, loading: runsLoading, refresh: refreshRuns } = useRuns();

  const [formOpen, setFormOpen] = useState(false);
  const [editProject, setEditProject] = useState<Project | null>(null);
  const [runProject, setRunProject] = useState<Project | null>(null);

  function handleEdit(project: Project) {
    setEditProject(project);
    setFormOpen(true);
  }

  function handleNew() {
    setEditProject(null);
    setFormOpen(true);
  }

  function handleRun(project: Project) {
    setRunProject(project);
  }

  function handleTabChange(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === 'history') {
      params.set('tab', 'history');
    } else {
      params.delete('tab');
    }
    router.replace(`/dashboard?${params.toString()}`);
    if (value === 'history') refreshRuns();
  }

  return (
    <>
      <TopBar title="Dashboard">
        <Button
          onClick={handleNew}
          size="sm"
          className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs gap-1.5"
        >
          <Plus size={14} />
          New Project
        </Button>
      </TopBar>

      <div className="flex-1 overflow-y-auto p-6">
        <Tabs value={tab} onValueChange={handleTabChange}>
          <TabsList className="bg-slate-800 border border-slate-700 mb-6">
            <TabsTrigger value="projects" className="data-[state=active]:bg-slate-700 data-[state=active]:text-white text-slate-400">
              Projects {!projLoading && `(${projects.length})`}
            </TabsTrigger>
            <TabsTrigger value="history" className="data-[state=active]:bg-slate-700 data-[state=active]:text-white text-slate-400">
              Run History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="projects">
            {projLoading ? (
              <ProjectSkeleton />
            ) : (
              <ProjectGrid
                projects={projects}
                onEdit={handleEdit}
                onRun={handleRun}
                onNew={handleNew}
              />
            )}
          </TabsContent>

          <TabsContent value="history">
            <RunHistoryTable runs={runs} loading={runsLoading} />
          </TabsContent>
        </Tabs>
      </div>

      <NewProjectForm
        open={formOpen}
        onOpenChange={setFormOpen}
        editProject={editProject}
        onSuccess={refreshProjects}
      />

      {runProject && (
        <RunLaunchModal
          project={runProject}
          open={!!runProject}
          onOpenChange={(open) => !open && setRunProject(null)}
          onLaunched={(runId) => {
            setRunProject(null);
            router.push(`/runs/${runId}`);
          }}
        />
      )}
    </>
  );
}

function ProjectSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="bg-slate-800 border border-slate-700 rounded-xl p-4 space-y-3 animate-pulse">
          <div className="h-4 bg-slate-700 rounded w-3/4" />
          <div className="h-3 bg-slate-700 rounded w-1/2" />
          <div className="h-3 bg-slate-700 rounded w-1/3" />
          <div className="h-8 bg-slate-700 rounded" />
        </div>
      ))}
    </div>
  );
}
