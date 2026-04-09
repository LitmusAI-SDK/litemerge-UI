import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import type { SessionStatus } from '@/types/api';

const PERSONA_COLORS: Record<string, string> = {
  low_literacy: 'bg-blue-500',
  non_native: 'bg-violet-500',
  adversarial: 'bg-red-500',
  distressed: 'bg-amber-500',
  domain_expert: 'bg-emerald-500',
  ambiguous: 'bg-cyan-500',
  multi_turn_drift: 'bg-orange-500',
};

const PERSONA_DISPLAY: Record<string, string> = {
  low_literacy: 'Low Digital Literacy',
  non_native: 'Non-Native Speaker',
  adversarial: 'Adversarial User',
  distressed: 'Distressed User',
  domain_expert: 'Domain Expert',
  ambiguous: 'Ambiguous User',
  multi_turn_drift: 'Multi-turn Drift',
};

interface PersonaSidebarProps {
  sessions: Record<string, SessionStatus>;
}

export default function PersonaSidebar({ sessions }: PersonaSidebarProps) {
  const list = Object.values(sessions);

  if (list.length === 0) {
    return (
      <div className="w-48 bg-slate-800 border-l border-slate-700 p-3 flex flex-col gap-1">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Personas</p>
        <p className="text-xs text-slate-600">Waiting for simulation to start…</p>
      </div>
    );
  }

  return (
    <div className="w-48 bg-slate-800 border-l border-slate-700 p-3 flex flex-col gap-3 overflow-y-auto">
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Personas</p>
      {list.map((session) => {
        const dotColor = PERSONA_COLORS[session.persona_type ?? ''] ?? 'bg-slate-500';
        const displayName =
          PERSONA_DISPLAY[session.persona_type ?? ''] ??
          session.persona_name ??
          session.persona_id;
        const progress = Math.round((session.turns_completed / 8) * 100);

        return (
          <div key={session.persona_id} className="space-y-1.5">
            <div className="flex items-center gap-1.5">
              <span
                className={cn(
                  'w-2 h-2 rounded-full flex-shrink-0',
                  session.status === 'failed' ? 'bg-red-500' :
                  session.status === 'completed' ? 'bg-slate-500' :
                  dotColor
                )}
              />
              <span className="text-xs text-slate-300 font-medium truncate leading-tight">
                {displayName}
              </span>
            </div>
            <Progress
              value={progress}
              className="h-1 bg-slate-700"
            />
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500">
                {session.turns_completed}/8 turns
              </span>
              {session.status === 'completed' && (
                <span className="text-xs text-emerald-500">✓</span>
              )}
              {session.status === 'failed' && (
                <span className="text-xs text-red-500">✗</span>
              )}
              {session.status === 'in_progress' && (
                <span className="text-xs text-blue-400 animate-pulse">●</span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
