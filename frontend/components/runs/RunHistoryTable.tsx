'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import RunStatusBadge from './RunStatusBadge';
import { cn, formatDate, scoreToBg } from '@/lib/utils';
import type { Run, RunStatus } from '@/types/api';

interface RunHistoryTableProps {
  runs: Run[];
  loading: boolean;
}

export default function RunHistoryTable({ runs, loading }: RunHistoryTableProps) {
  const [projectFilter, setProjectFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sort, setSort] = useState<'newest' | 'oldest'>('newest');

  const projects = Array.from(new Set(runs.map((r) => r.project_name).filter(Boolean)));

  const filtered = runs
    .filter((r) => projectFilter === 'all' || r.project_name === projectFilter)
    .filter((r) => statusFilter === 'all' || r.status === statusFilter)
    .sort((a, b) => {
      const aTime = new Date(a.created_at ?? 0).getTime();
      const bTime = new Date(b.created_at ?? 0).getTime();
      return sort === 'newest' ? bTime - aTime : aTime - bTime;
    });

  if (loading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-12 bg-slate-800 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  if (runs.length === 0) {
    return (
      <div className="text-center py-16 text-slate-500">
        <p className="text-sm">No runs yet. Launch a simulation to see history.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <Select value={projectFilter} onValueChange={(v) => v != null && setProjectFilter(v)}>
          <SelectTrigger className="bg-slate-800 border-slate-700 text-slate-300 w-40 text-xs h-8">
            <SelectValue placeholder="All Projects" />
          </SelectTrigger>
          <SelectContent className="bg-slate-800 border-slate-700 text-white">
            <SelectItem value="all">All Projects</SelectItem>
            {projects.map((p) => (
              <SelectItem key={p} value={p!}>{p}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={(v) => v != null && setStatusFilter(v)}>
          <SelectTrigger className="bg-slate-800 border-slate-700 text-slate-300 w-36 text-xs h-8">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent className="bg-slate-800 border-slate-700 text-white">
            <SelectItem value="all">All Statuses</SelectItem>
            {(['queued', 'running', 'evaluating', 'complete', 'failed'] as RunStatus[]).map((s) => (
              <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={sort} onValueChange={(v) => v != null && setSort(v as 'newest' | 'oldest')}>
          <SelectTrigger className="bg-slate-800 border-slate-700 text-slate-300 w-32 text-xs h-8">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-slate-800 border-slate-700 text-white">
            <SelectItem value="newest">Newest</SelectItem>
            <SelectItem value="oldest">Oldest</SelectItem>
          </SelectContent>
        </Select>

        <span className="text-xs text-slate-500 ml-auto">
          Showing {filtered.length} of {runs.length} runs
        </span>
      </div>

      {/* Table */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-700 text-xs text-slate-500 uppercase tracking-wider">
              <th className="text-left px-4 py-3">Run ID</th>
              <th className="text-left px-4 py-3">Project</th>
              <th className="text-left px-4 py-3">Suite</th>
              <th className="text-left px-4 py-3">Score</th>
              <th className="text-left px-4 py-3">Status</th>
              <th className="text-left px-4 py-3">Date</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {filtered.map((run) => {
              const href =
                run.status === 'running' || run.status === 'evaluating' || run.status === 'queued'
                  ? `/runs/${run.run_id}`
                  : `/runs/${run.run_id}/report`;

              return (
                <tr
                  key={run.run_id}
                  className="border-b border-slate-700/50 last:border-0 hover:bg-slate-700/30 transition-colors cursor-pointer group"
                >
                  <td className="px-4 py-3">
                    <Link href={href} className="font-mono text-xs text-slate-300 hover:text-white">
                      {run.run_id.slice(0, 12)}…
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-slate-300 text-xs">
                    {run.project_name ?? '—'}
                  </td>
                  <td className="px-4 py-3 text-slate-400 text-xs capitalize">
                    {run.test_suite ?? '—'}
                  </td>
                  <td className="px-4 py-3">
                    {run.score != null ? (
                      <span
                        className={cn(
                          'inline-block px-1.5 py-0.5 rounded text-xs font-bold text-white',
                          scoreToBg(run.score)
                        )}
                      >
                        {run.score} {run.passed ? '✓' : '✗'}
                      </span>
                    ) : (
                      <span className="text-slate-500 text-xs">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <RunStatusBadge status={run.status} />
                  </td>
                  <td className="px-4 py-3 text-slate-500 text-xs">
                    {run.created_at ? formatDate(run.created_at) : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <Link href={href}>
                      <ChevronRight
                        size={14}
                        className="text-slate-600 group-hover:text-slate-300 transition-colors"
                      />
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
