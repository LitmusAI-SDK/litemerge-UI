import { MessageSquare, AlertTriangle, Users } from 'lucide-react';

interface StatsBarProps {
  conversations: number;
  issues: number;
  completedPersonas: number;
  totalPersonas: number;
}

export default function StatsBar({ conversations, issues, completedPersonas, totalPersonas }: StatsBarProps) {
  return (
    <div className="flex items-center gap-6 px-4 py-2 bg-slate-800 border-b border-slate-700 text-sm">
      <Stat icon={<MessageSquare size={14} />} label="Conversations" value={conversations} />
      <Stat icon={<AlertTriangle size={14} />} label="Issues Found" value={issues} color={issues > 0 ? 'text-amber-400' : undefined} />
      <Stat icon={<Users size={14} />} label="Personas" value={`${completedPersonas}/${totalPersonas}`} />
    </div>
  );
}

function Stat({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  color?: string;
}) {
  return (
    <div className="flex items-center gap-1.5 text-slate-400">
      {icon}
      <span className="text-xs">{label}:</span>
      <span className={`text-sm font-semibold text-white ${color ?? ''}`}>{value}</span>
    </div>
  );
}
