'use client';

import { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import FindingCard from './FindingCard';
import type { Finding } from '@/types/api';

const SEVERITY_ORDER: Record<string, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
};

const SEVERITY_COLOR: Record<string, string> = {
  critical: 'bg-red-600/20 text-red-400 border-red-600/30',
  high: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  medium: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  low: 'bg-slate-700/50 text-slate-400 border-slate-600',
};

interface FindingsListProps {
  findings: Finding[];
  findingsBySeverity: Record<string, number>;
}

export default function FindingsList({ findings, findingsBySeverity }: FindingsListProps) {
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const findingTypes = useMemo(
    () => Array.from(new Set(findings.map((f) => f.finding_type))),
    [findings]
  );

  const filtered = useMemo(() => {
    return findings
      .filter((f) => severityFilter === 'all' || f.severity === severityFilter)
      .filter((f) => typeFilter === 'all' || f.finding_type === typeFilter)
      .sort((a, b) => (SEVERITY_ORDER[a.severity] ?? 9) - (SEVERITY_ORDER[b.severity] ?? 9));
  }, [findings, severityFilter, typeFilter]);

  return (
    <div className="space-y-4">
      {/* Filter chips */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-semibold text-white">{findings.length} Findings</span>

        <button
          onClick={() => setSeverityFilter('all')}
          className={cn(
            'px-2.5 py-1 rounded-full text-xs font-medium border transition-colors',
            severityFilter === 'all'
              ? 'bg-slate-600 text-white border-slate-500'
              : 'bg-transparent text-slate-500 border-slate-700 hover:border-slate-500 hover:text-slate-300'
          )}
        >
          All
        </button>

        {(['critical', 'high', 'medium', 'low'] as const).map((sev) => {
          const count = findingsBySeverity[sev] ?? 0;
          if (count === 0) return null;
          return (
            <button
              key={sev}
              onClick={() => setSeverityFilter(sev === severityFilter ? 'all' : sev)}
              className={cn(
                'px-2.5 py-1 rounded-full text-xs font-medium border transition-colors capitalize',
                severityFilter === sev
                  ? SEVERITY_COLOR[sev]
                  : 'bg-transparent text-slate-500 border-slate-700 hover:border-slate-500 hover:text-slate-300'
              )}
            >
              {sev} • {count}
            </button>
          );
        })}

        {typeFilter !== 'all' && (
          <button
            onClick={() => setTypeFilter('all')}
            className="px-2.5 py-1 rounded-full text-xs font-medium border bg-slate-700 text-slate-300 border-slate-600 hover:bg-slate-600"
          >
            {typeFilter.replace(/_/g, ' ')} ✕
          </button>
        )}
      </div>

      {/* Cards */}
      <div className="space-y-2">
        {filtered.length === 0 ? (
          <p className="text-sm text-slate-500 py-4">No findings match the selected filters.</p>
        ) : (
          filtered.map((f) => <FindingCard key={f.id} finding={f} />)
        )}
      </div>
    </div>
  );
}
