'use client';

import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import type { FeedEntry } from '@/hooks/useSimulationSSE';

interface LiveFeedLogProps {
  entries: FeedEntry[];
}

const COLOR_MAP: Record<FeedEntry['color'], string> = {
  green: 'text-emerald-400',
  red: 'text-red-400',
  blue: 'text-blue-400',
  amber: 'text-amber-400',
  default: 'text-slate-400',
};

export default function LiveFeedLog({ entries }: LiveFeedLogProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [entries.length]);

  return (
    <div className="flex flex-col h-full bg-slate-900 border-l border-slate-700">
      <div className="px-3 py-2 border-b border-slate-700">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Live Feed</p>
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-0.5 font-mono text-xs">
        {entries.length === 0 && (
          <p className="text-slate-600 text-xs">Waiting for events…</p>
        )}
        {entries.map((entry) => (
          <div key={entry.id} className="flex gap-2">
            <span className="text-slate-600 flex-shrink-0">{entry.timestamp}</span>
            <span className={cn(COLOR_MAP[entry.color])}>{entry.label}</span>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
