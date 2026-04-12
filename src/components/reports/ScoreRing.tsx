import { useEffect, useRef, useState } from "react";

function scoreToHex(score: number): string {
  if (score >= 70) return "#4edea3";
  if (score >= 50) return "#F59E0B";
  return "#ffb4ab";
}

interface ScoreRingProps {
  score: number;
  size?: number;
}

const RADIUS = 64;
const STROKE = 16;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const VIEW = 160;

export default function ScoreRing({ score, size = 200 }: ScoreRingProps) {
  const [displayed, setDisplayed] = useState(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const start = performance.now();
    const duration = 1500;

    function tick(now: number) {
      const elapsed = now - start;
      const t = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplayed(Math.round(eased * score));
      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick);
      }
    }

    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [score]);

  const color = scoreToHex(score);
  const fraction = displayed / 100;
  const dashoffset = CIRCUMFERENCE * (1 - fraction);

  return (
    <div style={{ width: size, height: size }}>
      <svg
        viewBox={`0 0 ${VIEW} ${VIEW}`}
        width={size}
        height={size}
        style={{ transform: "rotate(-90deg)" }}
      >
        {/* Track */}
        <circle
          cx={VIEW / 2}
          cy={VIEW / 2}
          r={RADIUS}
          fill="none"
          stroke="#222a3d"
          strokeWidth={STROKE}
        />
        {/* Arc */}
        <circle
          cx={VIEW / 2}
          cy={VIEW / 2}
          r={RADIUS}
          fill="none"
          stroke={color}
          strokeWidth={STROKE}
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={dashoffset}
          style={{ transition: "stroke 0.3s ease" }}
        />
      </svg>

      {/* Center number — positioned absolutely over the SVG */}
      <div
        style={{
          marginTop: -(size),
          height: size,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          pointerEvents: "none",
        }}
      >
        <span
          className="font-display font-bold tracking-tighter"
          style={{ fontSize: size * 0.28, color, lineHeight: 1 }}
        >
          {displayed}
        </span>
        <span
          className="font-body font-semibold uppercase tracking-[0.15em]"
          style={{ fontSize: size * 0.065, color: "#8c909f", marginTop: 4 }}
        >
          score
        </span>
      </div>
    </div>
  );
}
