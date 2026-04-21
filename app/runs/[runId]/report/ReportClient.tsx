'use client';

import { useState } from 'react';
import { FileJson, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ReportHeader from '@/components/reports/ReportHeader';
import ScoreRing from '@/components/reports/ScoreRing';
import DimensionBreakdown from '@/components/reports/DimensionBreakdown';
import FindingsList from '@/components/reports/FindingsList';
import { downloadPersonaExport } from '@/lib/api/runs';
import type { RunReport, ReportSessionStatus } from '@/types/api';

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

function formatPersonaType(raw: string | null | undefined): string {
  if (!raw) return 'Unknown';
  return raw.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function PersonaExportPanel({ report }: { report: RunReport }) {
  const sessions = report.session_statuses ?? [];
  const [selected, setSelected] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const selectedSession: ReportSessionStatus | undefined = sessions.find(
    (s) => s.persona_id === selected
  );

  async function handleExport() {
    if (!selected) return;
    setLoading(true);
    try {
      const label = selectedSession?.persona_name ?? selected;
      await downloadPersonaExport(selected, label);
    } finally {
      setLoading(false);
    }
  }

  if (sessions.length === 0) return null;

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 space-y-4">
      <div className="flex items-center gap-2">
        <Users size={15} className="text-slate-400" />
        <h3 className="text-sm font-semibold text-white">Export Conversations by Persona</h3>
      </div>

      <p className="text-xs text-slate-400">
        Pick a persona — the export includes every conversation that persona has had
        across <span className="text-white">all runs and all projects</span>, with each
        project&apos;s company context included so you know what domain was being tested.
      </p>

      {/* Persona pills */}
      <div className="flex flex-wrap gap-2">
        {sessions.map((s) => (
          <button
            key={s.persona_id}
            onClick={() => setSelected(s.persona_id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              selected === s.persona_id
                ? 'bg-indigo-600 border-indigo-500 text-white'
                : 'bg-slate-700/50 border-slate-600 text-slate-300 hover:border-slate-400 hover:text-white'
            }`}
          >
            {s.persona_name
              ? `${s.persona_name} · ${formatPersonaType(s.persona_type)}`
              : formatPersonaType(s.persona_type)}
            <span className="ml-1.5 opacity-60">{s.turns_completed}t</span>
          </button>
        ))}
      </div>

      {/* Export button */}
      <div className="flex items-center gap-3">
        <Button
          size="sm"
          onClick={handleExport}
          disabled={loading || !selected}
          className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <FileJson size={13} />
          {loading
            ? 'Preparing…'
            : selected
            ? `Export ${selectedSession?.persona_name ?? selected} — all runs`
            : 'Select a persona above'}
        </Button>

        {selected && (
          <span className="text-xs text-slate-500">
            All runs · JSON
          </span>
        )}
      </div>
    </div>
  );
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

        {/* Persona conversation export */}
        <PersonaExportPanel report={report} />

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
