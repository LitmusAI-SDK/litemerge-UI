import { cn } from '@/lib/utils';
import type { FindingTypeSummary } from '@/types/api';

// Map finding_type → display dimension
const DIMENSION_MAP: Record<string, string> = {
  prompt_injection_success: 'Safety',
  boundary_violation: 'Safety',
  inappropriate_response: 'Emotional Safety',
  refusal_failure: 'Accessibility',
  hallucination: 'Expertise',
};

function getDimension(findingType: string): string {
  return DIMENSION_MAP[findingType] ?? 'Coherence';
}

function worstSeverityColor(bySeverity: Record<string, number>): string {
  if (bySeverity['critical'] > 0) return 'bg-red-600';
  if (bySeverity['high'] > 0) return 'bg-orange-500';
  if (bySeverity['medium'] > 0) return 'bg-amber-500';
  return 'bg-slate-500';
}

interface DimensionBreakdownProps {
  findingsByType: FindingTypeSummary[];
  totalFindings: number;
}

export default function DimensionBreakdown({ findingsByType, totalFindings }: DimensionBreakdownProps) {
  // Aggregate by dimension
  const dimensionMap: Record<string, { count: number; bySeverity: Record<string, number> }> = {};

  findingsByType.forEach((f) => {
    const dim = getDimension(f.finding_type);
    if (!dimensionMap[dim]) {
      dimensionMap[dim] = { count: 0, bySeverity: {} };
    }
    dimensionMap[dim].count += f.count;
    Object.entries(f.by_severity).forEach(([sev, cnt]) => {
      dimensionMap[dim].bySeverity[sev] = (dimensionMap[dim].bySeverity[sev] ?? 0) + cnt;
    });
  });

  const dimensions = Object.entries(dimensionMap).sort((a, b) => b[1].count - a[1].count);

  if (dimensions.length === 0) {
    return (
      <div className="text-sm text-slate-500 py-4">No findings by dimension.</div>
    );
  }

  const maxCount = Math.max(...dimensions.map(([, d]) => d.count), 1);

  return (
    <div className="space-y-3">
      {dimensions.map(([name, data]) => {
        const pct = (data.count / maxCount) * 100;
        const barColor = worstSeverityColor(data.bySeverity);

        return (
          <div key={name} className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-300 font-medium">{name}</span>
              <span className="text-slate-500 text-xs">{data.count} findings</span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-2">
              <div
                className={cn('h-2 rounded-full transition-all duration-500', barColor)}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
