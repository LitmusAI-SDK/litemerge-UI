'use client';

import { useState } from 'react';
import { Edit2, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn, formatRelativeTime, truncate, scoreToBg } from '@/lib/utils';
import PreflightBadge from './PreflightBadge';
import type { Project, PreflightResponse } from '@/types/api';

interface ProjectCardProps {
  project: Project;
  onEdit: (project: Project) => void;
  onRun: (project: Project) => void;
}

export default function ProjectCard({ project, onEdit, onRun }: ProjectCardProps) {
  const [preflightResult, setPreflightResult] = useState<PreflightResponse | null>(
    project.preflight_status
      ? {
          status: project.preflight_status,
          latency_ms: project.preflight_latency_ms ?? 0,
        }
      : null
  );

  const canRun = preflightResult?.status === 'green' || preflightResult?.status === 'amber';
  const preflightBlocking = preflightResult?.status === 'red';

  const score = project.last_run_score;

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 flex flex-col gap-3 hover:border-slate-600 transition-colors">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="font-semibold text-white text-sm truncate">{project.name}</h3>
          <p className="text-xs text-slate-500 truncate mt-0.5">
            {truncate(project.agent_endpoint, 40)}
          </p>
        </div>
        <button
          onClick={() => onEdit(project)}
          className="text-slate-500 hover:text-slate-300 flex-shrink-0 p-1 rounded transition-colors"
          title="Edit project"
        >
          <Edit2 size={13} />
        </button>
      </div>

      {/* Preflight */}
      <PreflightBadge
        projectId={project.id}
        initialResult={preflightResult}
        onResult={setPreflightResult}
      />

      {/* Score */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-slate-500">Score</span>
        {score != null ? (
          <span
            className={cn(
              'text-xs font-bold px-2 py-0.5 rounded text-white',
              scoreToBg(score)
            )}
          >
            {score}
          </span>
        ) : (
          <span className="text-xs px-2 py-0.5 rounded bg-slate-700 text-slate-400 font-medium">
            --
          </span>
        )}
        {project.last_run_suite && (
          <span className="text-xs text-slate-500">{project.last_run_suite}</span>
        )}
        {project.last_run_at && (
          <span className="text-xs text-slate-600 ml-auto">
            {formatRelativeTime(project.last_run_at)}
          </span>
        )}
        {!project.last_run_at && (
          <span className="text-xs text-slate-600 ml-auto">Never run</span>
        )}
      </div>

      {/* Run Button */}
      <Tooltip>
        <TooltipTrigger className="w-full" render={<span />}>
            <Button
              onClick={() => onRun(project)}
              disabled={!canRun && preflightResult != null}
              className={cn(
                'w-full text-sm font-medium',
                canRun
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                  : 'bg-slate-700 text-slate-500 cursor-not-allowed'
              )}
            >
              <Play size={13} className="mr-1.5" />
              Run Simulation
            </Button>
        </TooltipTrigger>
        {preflightBlocking && (
          <TooltipContent className="bg-slate-700 border-slate-600 text-white text-xs">
            Endpoint unreachable — fix the project settings first
          </TooltipContent>
        )}
        {!preflightResult && (
          <TooltipContent className="bg-slate-700 border-slate-600 text-white text-xs">
            Run a preflight check first
          </TooltipContent>
        )}
      </Tooltip>
    </div>
  );
}
