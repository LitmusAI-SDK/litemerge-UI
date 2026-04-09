'use client';

import { useState } from 'react';
import { Loader2, Zap } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { cn } from '@/lib/utils';
import { createRun } from '@/lib/api/runs';
import type { Project, TestSuite } from '@/types/api';

interface RunLaunchModalProps {
  project: Project;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLaunched: (runId: string) => void;
}

interface SuiteOption {
  id: TestSuite;
  label: string;
  personas: string;
  time: string;
  description: string;
}

const SUITES: SuiteOption[] = [
  { id: 'standard', label: 'Standard', personas: '7 personas', time: '~3 min', description: 'Default CI gate' },
  { id: 'adversarial', label: 'Adversarial', personas: '4 personas', time: '~4 min', description: 'Security-focused' },
  { id: 'full', label: 'Full', personas: '8 personas', time: '~6 min', description: 'Pre-release deep test' },
];

export default function RunLaunchModal({
  project,
  open,
  onOpenChange,
  onLaunched,
}: RunLaunchModalProps) {
  const [suite, setSuite] = useState<TestSuite>('standard');
  const [threshold, setThreshold] = useState(70);
  const [webhook, setWebhook] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const preflightStatus = project.preflight_status;

  async function handleLaunch() {
    setLoading(true);
    setError('');
    try {
      const { run_id } = await createRun({
        project_id: project.id,
        test_suite: suite,
        fail_threshold: threshold,
        notify_webhook: webhook || undefined,
      });
      toast.success('Simulation launched!');
      onLaunched(run_id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to launch simulation');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <Zap size={18} className="text-emerald-400" />
            Launch Simulation
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          {/* Project info */}
          <div className="bg-slate-700/50 rounded-lg p-3 space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-400">Project</span>
              <span className="text-white font-medium">{project.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Endpoint</span>
              <span className="text-slate-300 text-xs truncate max-w-[200px]">
                {project.agent_endpoint}
              </span>
            </div>
            {preflightStatus && (
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Preflight</span>
                <span className="flex items-center gap-1.5">
                  <span
                    className={cn(
                      'w-2 h-2 rounded-full',
                      preflightStatus === 'green'
                        ? 'bg-emerald-500'
                        : preflightStatus === 'amber'
                        ? 'bg-amber-500'
                        : 'bg-red-500'
                    )}
                  />
                  <span
                    className={cn(
                      'text-xs',
                      preflightStatus === 'green'
                        ? 'text-emerald-400'
                        : preflightStatus === 'amber'
                        ? 'text-amber-400'
                        : 'text-red-400'
                    )}
                  >
                    {preflightStatus} {project.preflight_latency_ms != null && `${project.preflight_latency_ms} ms`}
                  </span>
                </span>
              </div>
            )}
          </div>

          {/* Test Suite picker */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Test Suite</label>
            <div className="grid grid-cols-3 gap-2">
              {SUITES.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setSuite(s.id)}
                  className={cn(
                    'flex flex-col items-center p-3 rounded-lg border text-center transition-all',
                    suite === s.id
                      ? 'border-emerald-500 bg-emerald-500/10 text-white'
                      : 'border-slate-700 bg-slate-700/30 text-slate-400 hover:border-slate-500 hover:text-slate-200'
                  )}
                >
                  <span className="text-sm font-semibold">{s.label}</span>
                  <span className="text-xs mt-0.5 opacity-70">{s.personas}</span>
                  <span className="text-xs opacity-60">{s.time}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Fail threshold */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium text-slate-300">Fail Threshold</label>
              <span className="text-sm font-bold text-white">{threshold} / 100</span>
            </div>
            <Slider
              min={0}
              max={100}
              step={1}
              value={[threshold]}
              onValueChange={(v) => { const val = Array.isArray(v) ? v[0] : v; setThreshold(val as number); }}
              className="[&_[role=slider]]:bg-emerald-500 [&_[role=slider]]:border-emerald-500"
            />
            <p className="text-xs text-slate-500">
              Run fails CI if score falls below this threshold
            </p>
          </div>

          {/* Webhook */}
          <Accordion>
            <AccordionItem value="webhook" className="border-slate-700">
              <AccordionTrigger className="text-sm text-slate-400 hover:text-slate-200 py-2">
                Webhook Notification (optional)
              </AccordionTrigger>
              <AccordionContent className="pt-2">
                <Input
                  value={webhook}
                  onChange={(e) => setWebhook(e.target.value)}
                  placeholder="https://hooks.slack.com/..."
                  className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-500 text-sm"
                />
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          {error && (
            <p className="text-sm text-red-400">⚠ {error}</p>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              variant="ghost"
              onClick={() => onOpenChange(false)}
              className="flex-1 text-slate-400 hover:text-white border border-slate-600"
            >
              Cancel
            </Button>
            <Button
              onClick={handleLaunch}
              disabled={loading}
              className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-medium"
            >
              {loading ? (
                <><Loader2 size={14} className="animate-spin mr-2" /> Launching…</>
              ) : (
                <>Launch Simulation →</>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
