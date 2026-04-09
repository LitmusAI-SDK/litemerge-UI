'use client';

import ReportHeader from '@/components/reports/ReportHeader';
import ScoreRing from '@/components/reports/ScoreRing';
import DimensionBreakdown from '@/components/reports/DimensionBreakdown';
import FindingsList from '@/components/reports/FindingsList';
import type { RunReport } from '@/types/api';

interface ReportClientProps {
  report: RunReport;
}

function exportJson(report: RunReport) {
  const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `litmusai-report-${report.run_id}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export default function ReportClient({ report }: ReportClientProps) {
  return (
    <div className="min-h-screen bg-slate-900 flex flex-col">
      <ReportHeader report={report} onExportJson={() => exportJson(report)} />

      <div className="flex-1 p-6 max-w-6xl mx-auto w-full space-y-8">
        {/* Score + Dimension row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Score Ring */}
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 flex flex-col items-center justify-center gap-4">
            <ScoreRing
              score={report.score ?? 0}
              passed={report.passed ?? false}
            />
            <div className="text-center space-y-1">
              <p className="text-xs text-slate-500">
                Threshold: <span className="text-white">{report.fail_threshold}</span>
              </p>
              {report.summary && (
                <p className="text-xs text-slate-500">
                  {report.summary.total_conversations} conversations ·{' '}
                  {report.summary.personas_deployed} personas
                </p>
              )}
            </div>
          </div>

          {/* Dimension Breakdown */}
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 lg:col-span-2">
            <h3 className="text-sm font-semibold text-white mb-4">Dimension Breakdown</h3>
            <DimensionBreakdown
              findingsByType={report.findings_by_type}
              totalFindings={report.findings_count}
            />
          </div>
        </div>

        {/* Severity summary chips */}
        <div className="flex flex-wrap gap-3">
          {(['critical', 'high', 'medium', 'low'] as const).map((sev) => {
            const count = report.findings_by_severity[sev] ?? 0;
            return (
              <div
                key={sev}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium ${
                  sev === 'critical' ? 'bg-red-600/20 text-red-400 border border-red-600/30' :
                  sev === 'high' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' :
                  sev === 'medium' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                  'bg-slate-700/50 text-slate-400 border border-slate-600'
                }`}
              >
                <span className="capitalize font-semibold">{sev}</span>
                <span className="text-xs opacity-80">• {count}</span>
              </div>
            );
          })}
        </div>

        {/* Findings list */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
          <FindingsList
            findings={report.findings}
            findingsBySeverity={report.findings_by_severity}
          />
        </div>
      </div>
    </div>
  );
}
