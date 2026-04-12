import { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getReport } from "../lib/api/reports";
import { getRunSessions } from "../lib/api/runs";
import type { RunReport } from "../types/api";
import type { SessionLog } from "../lib/api/runs";
import ReportHeader from "../components/reports/ReportHeader";
import ScoreRing from "../components/reports/ScoreRing";
import DimensionBreakdown from "../components/reports/DimensionBreakdown";
import FindingsList from "../components/reports/FindingsList";
import ConversationLogs from "../components/reports/ConversationLogs";

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2
      className="font-body text-[10px] font-semibold uppercase tracking-[0.15em] mb-5"
      style={{ color: "#8c909f" }}
    >
      {children}
    </h2>
  );
}

function StatBlock({ label, value, color = "#dae2fd" }: { label: string; value: string | number; color?: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span
        className="font-display font-bold"
        style={{ fontSize: "2rem", lineHeight: 1, color }}
      >
        {value}
      </span>
      <span
        className="font-body text-[10px] font-semibold uppercase tracking-[0.15em]"
        style={{ color: "#8c909f" }}
      >
        {label}
      </span>
    </div>
  );
}

export default function ReportView() {
  const { runId } = useParams<{ runId: string }>();
  const { token } = useAuth();

  const [report, setReport] = useState<RunReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sessions, setSessions] = useState<SessionLog[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(true);

  useEffect(() => {
    if (!runId || !token) return;
    setLoading(true);
    setError(null);
    getReport(runId, token)
      .then(setReport)
      .catch((e) => setError(e.message ?? "Failed to load report"))
      .finally(() => setLoading(false));

    setSessionsLoading(true);
    getRunSessions(runId, token)
      .then(setSessions)
      .catch(() => setSessions([]))
      .finally(() => setSessionsLoading(false));
  }, [runId, token]);

  const handleExportJson = useCallback(() => {
    if (!report) return;
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `litmus-report-${report.run_id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [report]);

  // ── Loading state ─────────────────────────────────────────────
  if (loading) {
    return (
      <div className="px-8 pt-8 pb-12 max-w-6xl mx-auto">
        {/* Header skeleton */}
        <div className="h-4 w-24 rounded animate-pulse mb-6" style={{ backgroundColor: "#222a3d" }} />
        <div className="h-10 w-96 rounded animate-pulse mb-4" style={{ backgroundColor: "#222a3d" }} />
        <div className="h-4 w-64 rounded animate-pulse mb-10" style={{ backgroundColor: "#171f33" }} />

        {/* Two-column skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="rounded-lg animate-pulse" style={{ backgroundColor: "#171f33", height: 280 }} />
          <div className="lg:col-span-2 rounded-lg animate-pulse" style={{ backgroundColor: "#171f33", height: 280 }} />
        </div>
        <div className="mt-8 rounded-lg animate-pulse" style={{ backgroundColor: "#171f33", height: 400 }} />
      </div>
    );
  }

  // ── Error state ───────────────────────────────────────────────
  if (error || !report) {
    return (
      <div className="px-8 pt-8 max-w-6xl mx-auto">
        <p className="font-body text-sm" style={{ color: "#ffb4ab" }}>
          {error ?? "Report not found."}
        </p>
      </div>
    );
  }

  const score = report.score ?? 0;
  const bySeverity = report.findings_by_severity ?? {};
  const criticalCount = bySeverity["critical"] ?? 0;
  const highCount = bySeverity["high"] ?? 0;
  const issuesFlagged = report.summary?.issues_flagged ?? report.findings_count;

  return (
    <div className="px-8 pt-8 pb-16 max-w-6xl mx-auto" style={{ backgroundColor: "#0b1326" }}>
      <ReportHeader report={report} onExportJson={handleExportJson} />

      {/* ── Top section: Score ring + Stats ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">

        {/* Score ring card */}
        <div
          className="rounded-lg p-8 flex flex-col items-center justify-center gap-6"
          style={{ backgroundColor: "#131b2e" }}
        >
          <ScoreRing score={score} size={180} />
          <div className="text-center">
            <p className="font-body text-xs font-semibold uppercase tracking-[0.15em]" style={{ color: "#8c909f" }}>
              Fail threshold
            </p>
            <p className="font-mono text-sm mt-1" style={{ color: "#424754" }}>
              {report.fail_threshold}
            </p>
          </div>
        </div>

        {/* Stats panel */}
        <div
          className="lg:col-span-2 rounded-lg p-8 grid grid-cols-2 sm:grid-cols-3 gap-8"
          style={{ backgroundColor: "#131b2e" }}
        >
          <StatBlock
            label="Total Sessions"
            value={report.summary?.total_conversations ?? "—"}
          />
          <StatBlock
            label="Personas Deployed"
            value={report.summary?.personas_deployed ?? "—"}
          />
          <StatBlock
            label="Issues Flagged"
            value={issuesFlagged}
            color={issuesFlagged > 0 ? "#F59E0B" : "#4edea3"}
          />
          <StatBlock
            label="Critical"
            value={criticalCount}
            color={criticalCount > 0 ? "#ffb4ab" : "#dae2fd"}
          />
          <StatBlock
            label="High"
            value={highCount}
            color={highCount > 0 ? "#F97316" : "#dae2fd"}
          />
          <StatBlock
            label="Total Findings"
            value={report.findings_count}
          />
        </div>
      </div>

      {/* ── Dimension Breakdown ── */}
      {report.findings_by_type.length > 0 && (
        <div
          className="rounded-lg p-8 mb-8"
          style={{ backgroundColor: "#131b2e" }}
        >
          <SectionTitle>Dimension Breakdown</SectionTitle>
          <DimensionBreakdown findingsByType={report.findings_by_type} />
        </div>
      )}

      {/* ── Findings List ── */}
      <div
        className="rounded-lg p-8 mb-8"
        style={{ backgroundColor: "#131b2e" }}
      >
        <SectionTitle>Findings ({report.findings_count})</SectionTitle>
        {report.findings.length === 0 ? (
          <p className="font-body text-sm" style={{ color: "#424754" }}>
            No findings recorded for this run.
          </p>
        ) : (
          <FindingsList findings={report.findings} />
        )}
      </div>

      {/* ── Conversation Logs ── */}
      <div
        className="rounded-lg p-8"
        style={{ backgroundColor: "#131b2e" }}
      >
        <SectionTitle>Conversation Logs ({sessions.length} session{sessions.length !== 1 ? "s" : ""})</SectionTitle>
        <ConversationLogs sessions={sessions} loading={sessionsLoading} />
      </div>
    </div>
  );
}
