import { cn } from '@/lib/utils';
import type { RunStatus } from '@/types/api';

interface RunStatusBadgeProps {
  status: RunStatus;
  className?: string;
}

const STATUS_CONFIG: Record<RunStatus, { label: string; classes: string }> = {
  queued: {
    label: 'Queued',
    classes: 'bg-slate-700 text-slate-300',
  },
  running: {
    label: 'Running',
    classes: 'bg-blue-500/20 text-blue-400 animate-pulse',
  },
  evaluating: {
    label: 'Evaluating',
    classes: 'bg-amber-500/20 text-amber-400 animate-pulse',
  },
  complete: {
    label: 'Complete',
    classes: 'bg-emerald-500/20 text-emerald-400',
  },
  failed: {
    label: 'Failed',
    classes: 'bg-red-500/20 text-red-400',
  },
};

export default function RunStatusBadge({ status, className }: RunStatusBadgeProps) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.failed;
  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
        cfg.classes,
        className
      )}
    >
      {cfg.label}
    </span>
  );
}
