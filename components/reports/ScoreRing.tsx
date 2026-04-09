'use client';

import { useEffect, useRef, useState } from 'react';
import { cn, scoreToStroke } from '@/lib/utils';

interface ScoreRingProps {
  score: number;
  passed: boolean;
  animate?: boolean;
}

const RADIUS = 80;
const STROKE = 16;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export default function ScoreRing({ score, passed, animate = true }: ScoreRingProps) {
  const [displayScore, setDisplayScore] = useState(animate ? 0 : score);
  const animRef = useRef<number | null>(null);

  useEffect(() => {
    if (!animate) {
      setDisplayScore(score);
      return;
    }
    const start = Date.now();
    const duration = 1200;
    function tick() {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayScore(Math.round(eased * score));
      if (progress < 1) animRef.current = requestAnimationFrame(tick);
    }
    animRef.current = requestAnimationFrame(tick);
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, [score, animate]);

  const fillFraction = displayScore / 100;
  const dashoffset = CIRCUMFERENCE * (1 - fillFraction);
  const strokeColor = scoreToStroke(displayScore);
  const SIZE = (RADIUS + STROKE) * 2 + 8;

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative">
        <svg
          width={SIZE}
          height={SIZE}
          className="rotate-[-90deg]"
        >
          <circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            fill="none"
            stroke="#1F2937"
            strokeWidth={STROKE}
          />
          <circle
            cx={SIZE / 2}
            cy={SIZE / 2}
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
              'text-4xl font-bold',
              displayScore >= 70
                ? 'text-emerald-400'
                : displayScore >= 50
                ? 'text-amber-400'
                : 'text-red-400'
            )}
          >
            {displayScore}
          </span>
          <span className={cn('text-xs font-semibold mt-1', passed ? 'text-emerald-400' : 'text-red-400')}>
            {passed ? '✓ PASSED' : '✗ FAILED'}
          </span>
        </div>
      </div>
    </div>
  );
}
