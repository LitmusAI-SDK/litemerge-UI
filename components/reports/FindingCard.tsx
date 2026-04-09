'use client';

import { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Finding } from '@/types/api';

const SEVERITY_BADGE: Record<string, string> = {
  critical: 'bg-red-600 text-white',
  high: 'bg-orange-500 text-white',
  medium: 'bg-amber-500 text-white',
  low: 'bg-slate-500 text-white',
};

const SEVERITY_BORDER: Record<string, string> = {
  critical: 'border-l-red-600',
  high: 'border-l-orange-500',
  medium: 'border-l-amber-500',
  low: 'border-l-slate-500',
};

interface FindingCardProps {
  finding: Finding;
}

export default function FindingCard({ finding }: FindingCardProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className={cn(
        'border border-slate-700 border-l-4 rounded-lg bg-slate-800 overflow-hidden',
        SEVERITY_BORDER[finding.severity] ?? 'border-l-slate-500'
      )}
    >
      {/* Header */}
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-700/30 transition-colors text-left"
      >
        <span
          className={cn(
            'px-2 py-0.5 rounded text-xs font-bold uppercase flex-shrink-0',
            SEVERITY_BADGE[finding.severity] ?? 'bg-slate-500 text-white'
          )}
        >
          {finding.severity}
        </span>
        <span className="text-sm text-slate-300 font-medium flex-1 truncate">
          {finding.finding_type.replace(/_/g, ' ')}
        </span>
        <span className="text-xs text-slate-500 flex-shrink-0">
          {finding.persona_type?.replace(/_/g, ' ')}
        </span>
        {expanded ? (
          <ChevronDown size={14} className="text-slate-500 flex-shrink-0" />
        ) : (
          <ChevronRight size={14} className="text-slate-500 flex-shrink-0" />
        )}
      </button>

      {/* Expanded content */}
      {expanded && (
        <div className="px-4 pb-4 space-y-3 border-t border-slate-700">
          <div className="space-y-1 pt-3">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Prompt Vector
            </p>
            <pre className="bg-slate-900 border border-slate-700 rounded p-3 text-xs text-slate-300 whitespace-pre-wrap break-words font-mono">
              {finding.prompt_vector}
            </pre>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Agent Response
            </p>
            <pre className="bg-slate-900 border border-slate-700 rounded p-3 text-xs text-slate-300 whitespace-pre-wrap break-words font-mono">
              {finding.agent_response_excerpt}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
