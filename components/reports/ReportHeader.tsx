import Link from 'next/link';
import { ArrowLeft, Download, FileJson } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn, formatDate, formatDuration } from '@/lib/utils';
import type { RunReport } from '@/types/api';

interface ReportHeaderProps {
  report: RunReport;
  onExportJson: () => void;
}

export default function ReportHeader({ report, onExportJson }: ReportHeaderProps) {
  return (
    <div className="bg-slate-800 border-b border-slate-700 px-6 py-4 flex-shrink-0">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-3 text-sm text-slate-400">
        <Link href="/dashboard" className="hover:text-white transition-colors flex items-center gap-1">
          <ArrowLeft size={14} /> Dashboard
        </Link>
        <span>/</span>
        <Link href={`/runs/${report.run_id}`} className="hover:text-white transition-colors">
          {report.run_id.slice(0, 16)}…
        </Link>
        <span>/</span>
        <span className="text-white">Report</span>
      </div>

      {/* Main header row */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-lg font-semibold text-white">
              {report.project_name ?? 'Run Report'}
            </h1>
            <span className="text-xs text-slate-500 font-mono">
              {report.run_id}
            </span>
            <span className="text-xs text-slate-500 capitalize">
              {report.test_suite}
            </span>
            {report.created_at && (
              <span className="text-xs text-slate-500">
                {formatDate(report.created_at)}
              </span>
            )}
            {report.created_at && (
              <span className="text-xs text-slate-500">
                {formatDuration(report.created_at, report.completed_at)}
              </span>
            )}
          </div>

          {/* Pass/fail + threshold */}
          <div className="flex items-center gap-3">
            <span
              className={cn(
                'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-bold',
                report.passed
                  ? 'bg-emerald-500/20 text-emerald-400'
                  : 'bg-red-500/20 text-red-400'
              )}
            >
              {report.passed ? '✓ PASSED' : '✗ FAILED'}
            </span>
            <span className="text-xs text-slate-500">
              Threshold: {report.fail_threshold}
            </span>
          </div>
        </div>

        {/* Download buttons */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <Tooltip>
            <TooltipTrigger render={<span />}>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled
                  className="text-slate-500 border border-slate-700 text-xs gap-1.5"
                >
                  <Download size={13} />
                  PDF Report
                </Button>
            </TooltipTrigger>
            <TooltipContent className="bg-slate-700 border-slate-600 text-white text-xs">
              PDF export coming soon
            </TooltipContent>
          </Tooltip>

          <Button
            variant="ghost"
            size="sm"
            onClick={onExportJson}
            className="text-slate-300 hover:text-white border border-slate-700 hover:border-slate-500 text-xs gap-1.5"
          >
            <FileJson size={13} />
            Export JSON
          </Button>
        </div>
      </div>
    </div>
  );
}
