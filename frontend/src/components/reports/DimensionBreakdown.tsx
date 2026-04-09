import type { FindingTypeSummary } from "../../types/api";

const SEVERITY_ORDER = ["critical", "high", "medium", "low"] as const;
type Sev = typeof SEVERITY_ORDER[number];

const SEV_COLORS: Record<Sev, string> = {
  critical: "#ffb4ab",
  high:     "#F97316",
  medium:   "#F59E0B",
  low:      "#8c909f",
};

function worstSeverityColor(bySeverity: Record<string, number>): string {
  for (const sev of SEVERITY_ORDER) {
    if ((bySeverity[sev] ?? 0) > 0) return SEV_COLORS[sev];
  }
  return SEV_COLORS.low;
}

// Pretty-print finding_type keys
function formatType(t: string): string {
  return t.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

interface DimensionBreakdownProps {
  findingsByType: FindingTypeSummary[];
}

export default function DimensionBreakdown({ findingsByType }: DimensionBreakdownProps) {
  if (findingsByType.length === 0) {
    return (
      <p className="font-body text-sm" style={{ color: "#424754" }}>
        No findings to display.
      </p>
    );
  }

  const sorted = [...findingsByType].sort((a, b) => b.count - a.count);
  const max = sorted[0].count;

  return (
    <div className="space-y-4">
      {sorted.map((item) => {
        const color = worstSeverityColor(item.by_severity);
        const pct = max > 0 ? (item.count / max) * 100 : 0;

        return (
          <div key={item.finding_type}>
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-body text-sm" style={{ color: "#c2c6d6" }}>
                {formatType(item.finding_type)}
              </span>
              <span className="font-mono text-xs" style={{ color }}>
                {item.count}
              </span>
            </div>
            <div className="h-1.5 w-full rounded-full overflow-hidden" style={{ backgroundColor: "#131b2e" }}>
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${pct}%`, backgroundColor: color }}
              />
            </div>
            {/* Severity breakdown pills */}
            <div className="flex gap-2 mt-1.5 flex-wrap">
              {SEVERITY_ORDER.filter((s) => (item.by_severity[s] ?? 0) > 0).map((sev) => (
                <span
                  key={sev}
                  className="font-body text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded"
                  style={{ color: SEV_COLORS[sev], backgroundColor: `${SEV_COLORS[sev]}18` }}
                >
                  {sev} ×{item.by_severity[sev]}
                </span>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
