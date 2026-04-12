import { useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle, XCircle, Clock } from "lucide-react";
import type { RunReport } from "../../types/api";

interface ReportHeaderProps {
  report: RunReport;
  onExportJson: () => void;
}

export default function ReportHeader({ report, onExportJson }: ReportHeaderProps) {
  const navigate = useNavigate();

  const formattedDate = new Date(report.created_at).toLocaleString("en-US", {
    month: "short", day: "numeric", year: "numeric",
    hour: "2-digit", minute: "2-digit", hour12: false,
  });

  const duration = report.completed_at
    ? Math.round((new Date(report.completed_at).getTime() - new Date(report.created_at).getTime()) / 1000)
    : null;

  return (
    <div className="mb-10">
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 mb-6 text-sm transition-colors hover:opacity-80"
        style={{ color: "#8c909f" }}
      >
        <ArrowLeft size={16} />
        <span className="font-body">Back</span>
      </button>

      <div className="flex items-start justify-between gap-6">
        <div className="flex-1 min-w-0">
          {/* Run ID */}
          <p className="font-mono text-xs mb-2" style={{ color: "#adc6ff" }}>
            RUN REPORT
          </p>
          <h1
            className="font-display text-4xl font-bold tracking-tight mb-4 truncate"
            style={{ color: "#dae2fd" }}
          >
            {report.run_id}
          </h1>

          {/* Metadata row */}
          <div className="flex items-center gap-4 flex-wrap">
            <span className="flex items-center gap-1.5 font-body text-sm" style={{ color: "#8c909f" }}>
              <Clock size={14} />
              {formattedDate}
            </span>
            {duration !== null && (
              <span className="font-mono text-xs" style={{ color: "#424754" }}>
                {duration}s duration
              </span>
            )}
            <span className="font-mono text-xs px-2 py-0.5 rounded" style={{ backgroundColor: "#131b2e", color: "#8c909f" }}>
              {report.test_suite}
            </span>
            {report.summary && (
              <>
                <span className="font-body text-sm" style={{ color: "#8c909f" }}>
                  {report.summary.total_conversations} sessions
                </span>
                <span className="font-body text-sm" style={{ color: "#8c909f" }}>
                  {report.summary.personas_deployed} personas
                </span>
              </>
            )}
          </div>
        </div>

        {/* Right side: verdict badge + actions */}
        <div className="flex flex-col items-end gap-3 shrink-0">
          {report.passed === true && (
            <span
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold font-body"
              style={{ backgroundColor: "rgba(78,222,163,0.1)", color: "#4edea3" }}
            >
              <CheckCircle size={14} /> PASSED
            </span>
          )}
          {report.passed === false && (
            <span
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold font-body"
              style={{ backgroundColor: "rgba(255,180,171,0.1)", color: "#ffb4ab" }}
            >
              <XCircle size={14} /> FAILED
            </span>
          )}

          <div className="flex gap-2">
            {/* JSON export */}
            <button
              onClick={onExportJson}
              className="flex items-center gap-2 px-4 py-2 rounded text-sm font-semibold font-body transition-all"
              style={{
                border: "1px solid rgba(255,255,255,0.06)",
                color: "#adc6ff",
                backgroundColor: "transparent",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#2d3449";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
              }}
            >
              Export JSON
            </button>

            {/* PDF — disabled */}
            <div className="relative group">
              <button
                disabled
                className="flex items-center gap-2 px-4 py-2 rounded text-sm font-semibold font-body cursor-not-allowed opacity-40"
                style={{
                  border: "1px solid rgba(255,255,255,0.06)",
                  color: "#8c909f",
                }}
              >
                Export PDF
              </button>
              <div
                className="absolute bottom-full right-0 mb-2 px-2.5 py-1.5 rounded text-xs font-body whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                style={{
                  backgroundColor: "#2d3449",
                  color: "#c2c6d6",
                  boxShadow: "0 8px 24px -4px rgba(6,14,32,0.5)",
                }}
              >
                PDF export coming soon
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
