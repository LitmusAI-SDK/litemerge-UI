import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import type { Finding } from "../../types/api";

type Sev = Finding["severity"];

const SEV_STYLES: Record<Sev, { text: string; border: string; bg: string; label: string }> = {
  critical: { text: "#ffb4ab",  border: "#ffb4ab",  bg: "rgba(255,180,171,0.06)", label: "Critical" },
  high:     { text: "#F97316",  border: "#F97316",  bg: "rgba(249,115,22,0.06)",  label: "High" },
  medium:   { text: "#F59E0B",  border: "#F59E0B",  bg: "rgba(245,158,11,0.06)",  label: "Medium" },
  low:      { text: "#8c909f",  border: "#424754",  bg: "#171f33",                label: "Low" },
};

function formatType(t: string): string {
  return t.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function FindingCard({ finding }: { finding: Finding }) {
  const [expanded, setExpanded] = useState(false);
  const styles = SEV_STYLES[finding.severity];

  return (
    <div
      className="rounded-lg pl-4 pr-5 py-4"
      style={{
        borderLeft: `2px solid ${styles.border}`,
        backgroundColor: styles.bg,
      }}
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span
              className="font-body text-xs font-semibold uppercase tracking-wider px-2 py-0.5 rounded"
              style={{ color: styles.text, backgroundColor: `${styles.border}18` }}
            >
              {styles.label}
            </span>
            <span className="font-body text-xs" style={{ color: "#8c909f" }}>
              {formatType(finding.finding_type)}
            </span>
            <span className="font-mono text-[10px]" style={{ color: "#424754" }}>
              {finding.persona_type}
            </span>
          </div>
          <p className="font-body text-sm leading-relaxed line-clamp-2" style={{ color: "#c2c6d6" }}>
            {finding.agent_response_excerpt}
          </p>
        </div>

        <button
          onClick={() => setExpanded((v) => !v)}
          className="shrink-0 p-1 rounded transition-colors"
          style={{ color: "#424754" }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#adc6ff")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "#424754")}
        >
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
      </div>

      {/* Expanded detail */}
      {expanded && (
        <div className="mt-4 space-y-3">
          <div>
            <p className="font-body text-[10px] font-semibold uppercase tracking-widest mb-1.5" style={{ color: "#424754" }}>
              Prompt Vector
            </p>
            <pre
              className="font-mono text-xs rounded-lg p-4 overflow-x-auto whitespace-pre-wrap break-words"
              style={{ backgroundColor: "#131b2e", color: "#c2c6d6" }}
            >
              {finding.prompt_vector}
            </pre>
          </div>
          <div>
            <p className="font-body text-[10px] font-semibold uppercase tracking-widest mb-1.5" style={{ color: "#424754" }}>
              Agent Response
            </p>
            <pre
              className="font-mono text-xs rounded-lg p-4 overflow-x-auto whitespace-pre-wrap break-words"
              style={{ backgroundColor: "#131b2e", color: "#c2c6d6" }}
            >
              {finding.agent_response_excerpt}
            </pre>
          </div>
          <p className="font-mono text-[10px]" style={{ color: "#424754" }}>
            {finding.id} · {new Date(finding.created_at).toLocaleString()}
          </p>
        </div>
      )}
    </div>
  );
}
