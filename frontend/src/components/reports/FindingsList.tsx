import { useState } from "react";
import type { Finding } from "../../types/api";
import FindingCard from "./FindingCard";

type Sev = Finding["severity"];
const ALL_SEVERITIES: Sev[] = ["critical", "high", "medium", "low"];
const SEV_ORDER: Record<Sev, number> = { critical: 0, high: 1, medium: 2, low: 3 };

function formatType(t: string): string {
  return t.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

interface FindingsListProps {
  findings: Finding[];
}

export default function FindingsList({ findings }: FindingsListProps) {
  const [sevFilter, setSevFilter] = useState<Sev | "all">("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  const uniqueTypes = Array.from(new Set(findings.map((f) => f.finding_type)));

  const filtered = findings
    .filter((f) => sevFilter === "all" || f.severity === sevFilter)
    .filter((f) => typeFilter === "all" || f.finding_type === typeFilter)
    .sort((a, b) => SEV_ORDER[a.severity] - SEV_ORDER[b.severity]);

  const SEV_COLORS: Record<Sev, string> = {
    critical: "#ffb4ab",
    high:     "#F97316",
    medium:   "#F59E0B",
    low:      "#8c909f",
  };

  return (
    <div>
      {/* Filter chips */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {/* Severity chips */}
        <button
          onClick={() => setSevFilter("all")}
          className="px-3 py-1 rounded-full text-xs font-semibold font-body transition-all"
          style={{
            backgroundColor: sevFilter === "all" ? "#adc6ff" : "#222a3d",
            color: sevFilter === "all" ? "#002e6a" : "#8c909f",
          }}
        >
          All
        </button>
        {ALL_SEVERITIES.filter((s) => findings.some((f) => f.severity === s)).map((sev) => (
          <button
            key={sev}
            onClick={() => setSevFilter(sev === sevFilter ? "all" : sev)}
            className="px-3 py-1 rounded-full text-xs font-semibold font-body transition-all capitalize"
            style={{
              backgroundColor: sevFilter === sev ? `${SEV_COLORS[sev]}22` : "#222a3d",
              color: sevFilter === sev ? SEV_COLORS[sev] : "#8c909f",
              border: sevFilter === sev ? `1px solid ${SEV_COLORS[sev]}44` : "1px solid transparent",
            }}
          >
            {sev}
          </button>
        ))}

        {/* Divider */}
        {uniqueTypes.length > 0 && (
          <span className="w-px self-stretch" style={{ backgroundColor: "#222a3d" }} />
        )}

        {/* Type chips */}
        {uniqueTypes.map((t) => (
          <button
            key={t}
            onClick={() => setTypeFilter(t === typeFilter ? "all" : t)}
            className="px-3 py-1 rounded-full text-xs font-semibold font-body transition-all"
            style={{
              backgroundColor: typeFilter === t ? "rgba(173,198,255,0.12)" : "#222a3d",
              color: typeFilter === t ? "#adc6ff" : "#8c909f",
              border: typeFilter === t ? "1px solid rgba(173,198,255,0.2)" : "1px solid transparent",
            }}
          >
            {formatType(t)}
          </button>
        ))}
      </div>

      {/* Count */}
      <p className="font-body text-xs mb-4" style={{ color: "#424754" }}>
        {filtered.length} finding{filtered.length !== 1 ? "s" : ""}
        {sevFilter !== "all" || typeFilter !== "all" ? " (filtered)" : ""}
      </p>

      {/* Cards */}
      {filtered.length === 0 ? (
        <p className="font-body text-sm" style={{ color: "#424754" }}>
          No findings match the current filters.
        </p>
      ) : (
        <div className="space-y-3">
          {filtered.map((f) => (
            <FindingCard key={f.id} finding={f} />
          ))}
        </div>
      )}
    </div>
  );
}
