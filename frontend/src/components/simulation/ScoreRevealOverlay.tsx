import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Run } from "../../types/api";
import { scoreToHex } from "../../lib/utils";

interface ScoreRevealOverlayProps {
  run: Run;
}

export default function ScoreRevealOverlay({ run }: ScoreRevealOverlayProps) {
  const navigate = useNavigate();
  const [displayScore, setDisplayScore] = useState(0);
  const [phase, setPhase] = useState<"evaluating" | "reveal">(
    run.status === "evaluating" ? "evaluating" : "reveal"
  );
  const animRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Transition from evaluating → reveal when status changes
  useEffect(() => {
    if (run.status === "complete" || run.status === "failed") {
      setPhase("reveal");
    }
  }, [run.status]);

  // Count-up animation when revealing
  useEffect(() => {
    if (phase !== "reveal" || run.score == null) return;
    const target = run.score;
    const duration = 1500;
    const steps = 60;
    const increment = target / steps;
    let current = 0;

    animRef.current = setInterval(() => {
      current = Math.min(current + increment, target);
      setDisplayScore(Math.round(current));
      if (current >= target && animRef.current) {
        clearInterval(animRef.current);
      }
    }, duration / steps);

    return () => { if (animRef.current) clearInterval(animRef.current); };
  }, [phase, run.score]);

  const scoreColor = run.score != null ? scoreToHex(run.score) : "#adc6ff";
  const passed = run.passed;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-6"
      style={{ backgroundColor: "rgba(11,19,38,0.85)", backdropFilter: "blur(16px)" }}
    >
      {/* Ambient glows */}
      <div className="fixed top-0 right-0 w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{ background: "rgba(173,198,255,0.05)", filter: "blur(120px)", transform: "translate(50%,-50%)" }} />
      <div className="fixed bottom-0 left-0 w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{ background: "rgba(208,188,255,0.05)", filter: "blur(120px)", transform: "translate(-50%,50%)" }} />

      <div
        className="relative w-full max-w-2xl rounded-2xl p-12 text-center"
        style={{
          backgroundColor: "#131b2e",
          border: "1px solid rgba(66,71,84,0.1)",
          boxShadow: "0 32px 64px rgba(6,14,32,0.6)",
        }}
      >
        {/* Trace metadata watermark */}
        <div className="absolute top-4 left-4 text-left opacity-10 font-mono text-[10px]" style={{ color: "#adc6ff" }}>
          RUN_ID: {run.run_id.slice(0, 12)}<br />
          STATUS: {run.status.toUpperCase()}
        </div>
        <div className="absolute bottom-4 right-4 text-right opacity-10 font-mono text-[10px]" style={{ color: "#adc6ff" }}>
          VERIFIED_BY: LITMUS_CORE<br />
          ENGINE: v1.0
        </div>

        {/* Phase: Evaluating */}
        {phase === "evaluating" && (
          <div className="flex flex-col items-center">
            <div
              className="w-20 h-20 rounded-full border-4 mb-8 animate-spin"
              style={{ borderColor: "rgba(173,198,255,0.2)", borderTopColor: "#adc6ff" }}
            />
            <h2 className="text-3xl font-space-grotesk font-bold mb-2" style={{ color: "#dae2fd" }}>
              Evaluating results…
            </h2>
            <p style={{ color: "#64748b" }}>Finalizing behavioral alignment metrics</p>
          </div>
        )}

        {/* Phase: Reveal */}
        {phase === "reveal" && (
          <div className="flex flex-col items-center">
            {/* Score ring */}
            <div className="relative flex items-center justify-center mb-10">
              <div
                className="absolute w-48 h-48 rounded-full"
                style={{
                  animation: "pulse-border 2s infinite",
                  backgroundColor: `${scoreColor}0d`,
                }}
              />
              <div
                className="w-48 h-48 rounded-full border-[6px] flex flex-col items-center justify-center relative z-10"
                style={{
                  borderColor: scoreColor,
                  backgroundColor: "rgba(45,52,73,0.5)",
                }}
              >
                {run.score != null ? (
                  <>
                    <span
                      className="font-space-grotesk font-bold tracking-tighter"
                      style={{ fontSize: "4.5rem", lineHeight: 1, color: "#dae2fd", textShadow: `0 0 32px ${scoreColor}80` }}
                    >
                      {displayScore}
                    </span>
                    <span
                      className="text-[10px] font-bold tracking-widest uppercase mt-1"
                      style={{ color: scoreColor }}
                    >
                      Metric Score
                    </span>
                  </>
                ) : (
                  <span className="text-lg font-space-grotesk" style={{ color: "#8c909f" }}>—</span>
                )}
              </div>
            </div>

            {/* Pass / fail badge */}
            {passed != null && (
              <div
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6"
                style={{
                  backgroundColor: passed ? "rgba(78,222,163,0.1)" : "rgba(255,180,171,0.1)",
                  border: `1px solid ${passed ? "rgba(78,222,163,0.3)" : "rgba(255,180,171,0.3)"}`,
                }}
              >
                <span
                  className="material-symbols-outlined text-sm"
                  style={{
                    color: passed ? "#4edea3" : "#ffb4ab",
                    fontVariationSettings: "'FILL' 1",
                  }}
                >
                  {passed ? "check_circle" : "cancel"}
                </span>
                <span
                  className="font-bold tracking-widest text-xs"
                  style={{ color: passed ? "#4edea3" : "#ffb4ab" }}
                >
                  {passed ? "PASSED" : "FAILED"}
                </span>
              </div>
            )}

            <h2 className="text-3xl font-space-grotesk font-bold mb-3" style={{ color: "#dae2fd" }}>
              Simulation Complete
            </h2>
            <p className="max-w-sm mx-auto mb-12" style={{ color: "#64748b" }}>
              {run.summary
                ? `${run.summary.total_conversations} conversations · ${run.summary.personas_deployed} personas · ${run.summary.issues_flagged} issues flagged.`
                : "Behavioral analysis complete."}
            </p>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
              <button
                onClick={() => navigate(`/runs/${run.run_id}/report`)}
                className="flex-1 px-8 py-4 rounded-lg font-bold transition-all active:scale-95 flex items-center justify-center gap-2"
                style={{
                  background: "linear-gradient(135deg, #adc6ff, #4d8eff)",
                  color: "#002e6a",
                  boxShadow: "0 4px 16px rgba(173,198,255,0.2)",
                }}
              >
                <span className="material-symbols-outlined text-sm">visibility</span>
                View Full Report
              </button>
              <button
                onClick={() => navigate("/dashboard")}
                className="flex-1 px-8 py-4 rounded-lg font-bold transition-all active:scale-95 flex items-center justify-center gap-2 hover:bg-[#2d3449]"
                style={{
                  backgroundColor: "transparent",
                  border: "1px solid rgba(66,71,84,0.3)",
                  color: "#c2c6d6",
                }}
              >
                <span className="material-symbols-outlined text-sm">grid_view</span>
                Back to Dashboard
              </button>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes pulse-border {
          0%   { box-shadow: 0 0 0 0   rgba(173,198,255,0.4); }
          70%  { box-shadow: 0 0 0 20px rgba(173,198,255,0); }
          100% { box-shadow: 0 0 0 0   rgba(173,198,255,0); }
        }
      `}</style>
    </div>
  );
}
