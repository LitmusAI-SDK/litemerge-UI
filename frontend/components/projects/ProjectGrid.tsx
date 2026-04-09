'use client';

import { Plus } from 'lucide-react';
import ProjectCard from './ProjectCard';
import type { Project } from '@/types/api';

interface ProjectGridProps {
  projects: Project[];
  onEdit: (project: Project) => void;
  onRun: (project: Project) => void;
  onNew: () => void;
}

export default function ProjectGrid({ projects, onEdit, onRun, onNew }: ProjectGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {projects.map((project) => (
        <ProjectCard
          key={project.id}
          project={project}
          onEdit={onEdit}
          onRun={onRun}
        />
      ))}

      {/* Add new project card */}
      <button
        onClick={onNew}
        className="bg-slate-800/50 border border-dashed border-slate-700 rounded-xl p-4 flex flex-col items-center justify-center gap-2 text-slate-500 hover:text-slate-300 hover:border-slate-500 hover:bg-slate-800 transition-all min-h-[160px]"
      >
        <div className="w-8 h-8 rounded-full border border-current flex items-center justify-center">
          <Plus size={16} />
        </div>
        <span className="text-sm font-medium">New Project</span>
        <span className="text-xs text-slate-600">Click to create</span>
      </button>
    </div>
  );
}
