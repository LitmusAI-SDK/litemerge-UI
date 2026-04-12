'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn, scoreToStroke } from '@/lib/utils';
import type { Run } from '@/types/api';

interface ScoreRevealOverlayProps {
  run: Run;
  runId: string;
}

export default function ScoreRevealOverlay({ run, runId }: ScoreRevealOverlayProps) {
  const [displayScore, setDisplayScore] = useState(0);
  const [phase, setPhase] = useState<'evaluating' | 'reveal' | 'actions'>('evaluating');
  const animRef = useRef<number | null>(null);

  const isEvaluating = run.status === 'evaluating';
  const isComplete = run.status === 'complete';
  const score = run.score ?? 0;
  const passed = run.passed;

  useEffect(() => {
    if (isComplete && score != null) {
      setPhase('reveal');
      // Count-up animation ~1.5s
      const start = Date.now();
      const duration = 1500;
      function animate() {
        const elapsed = Date.now() - start;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
        setDisplayScore(Math.round(eased * score));
        if (progress < 1) {
          animRef.current = requestAnimationFrame(animate);
        } else {
          setPhase('actions');
        }
      }
      animRef.current = requestAnimationFrame(animate);
      return () => {
        if (animRef.current) cancelAnimationFrame(animRef.current);
      };
    }
  }, [isComplete, score]);

  // SVG ring
  const RADIUS = 56;
  const STROKE = 12;
  const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
  const fillFraction = displayScore / 100;
  const dashoffset = CIRCUMFERENCE * (1 - fillFraction);
  const strokeColor = scoreToStroke(displayScore);

  return (
    <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-sm flex items-center justify-center z-10">
      <div className="bg-slate-800 border border-slate-700 rounded-2xl p-8 max-w-sm w-full mx-4 text-center space-y-6">

        {/* Phase 1: Evaluating */}
        {(isEvaluating || phase === 'evaluating') && (
          <>
            <div className="flex flex-col items-center gap-3">
              <Loader2 size={32} className="text-amber-400 animate-spin" />
              <p className="text-lg font-semibold text-white">Evaluating results…</p>
              <p className="text-sm text-slate-400">
                Analyzing {run.summary?.total_conversations ?? 0} conversations
              </p>
            </div>
          </>
        )}

        {/* Phase 2+: Score reveal */}
        {phase !== 'evaluating' && isComplete && (
          <>
            <p className="text-sm font-semibold text-slate-400 uppercase tracking-widest">
              LitmusAI Score
            </p>

            {/* Score ring */}
            <div className="flex justify-center">
              <div className="relative">
                <svg width={140} height={140} className="rotate-[-90deg]">
                  <circle
                    cx={70}
                    cy={70}
                    r={RADIUS}
                    fill="none"
                    stroke="#1F2937"
                    strokeWidth={STROKE}
                  />
                  <circle
                    cx={70}
                    cy={70}
                    r={RADIUS}
                    fill="none"
                    stroke={strokeColor}
                    strokeWidth={STROKE}
                    strokeDasharray={CIRCUMFERENCE}
                    strokeDashoffset={dashoffset}
                    strokeLinecap="round"
                    style={{ transition: 'stroke-dashoffset 0.05s linear' }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span
                    className={cn(
                      'text-3xl font-bold',
                      displayScore >= 70
                        ? 'text-emerald-400'
                        : displayScore >= 50
                        ? 'text-amber-400'
                        : 'text-red-400'
                    )}
                  >
                    {displayScore}
                  </span>
                </div>
              </div>
            </div>

            {/* Pass/Fail badge */}
            <div className="flex flex-col items-center gap-1">
              {passed ? (
                <div className="flex items-center gap-2 text-emerald-400">
                  <CheckCircle2 size={20} />
                  <span className="text-lg font-bold">PASSED</span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-1">
                  <div className="flex items-center gap-2 text-red-400">
                    <XCircle size={20} />
                    <span className="text-lg font-bold">FAILED</span>
                  </div>
                  <p className="text-xs text-slate-500">
                    Score below threshold ({run.fail_threshold ?? 70})
                  </p>
                </div>
              )}
            </div>
          </>
        )}

        {/* Phase 3: Actions */}
        {phase === 'actions' && (
          <>
            <div className="flex justify-center gap-6 text-sm text-slate-400">
              {run.summary && (
                <>
                  <div>
                    <span className="text-white font-semibold">{run.summary.total_conversations}</span>
                    <span className="text-xs ml-1">Conversations</span>
                  </div>
                  <div>
                    <span className="text-white font-semibold">{run.summary.issues_flagged}</span>
                    <span className="text-xs ml-1">Issues</span>
                  </div>
                  <div>
                    <span className="text-white font-semibold">{run.summary.personas_deployed}</span>
                    <span className="text-xs ml-1">Personas</span>
                  </div>
                </>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <Button render={<Link href={`/runs/${runId}/report`} />} className="bg-emerald-600 hover:bg-emerald-500 text-white w-full">
                View Full Report
              </Button>
              <Button render={<Link href="/dashboard" />} variant="ghost" className="text-slate-400 hover:text-white w-full border border-slate-700">
                Back to Dashboard
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
