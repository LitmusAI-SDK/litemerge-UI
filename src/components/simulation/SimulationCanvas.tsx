import { useEffect, useRef, useCallback } from "react";
import type { SessionStatus, SSEEvent } from "../../types/api";

const PERSONA_COLORS: Record<string, string> = {
  p1_low_literacy:      "#3B82F6",
  p2_non_native:        "#8B5CF6",
  p3_adversarial:       "#EF4444",
  p4_distressed:        "#F59E0B",
  p5_domain_expert:     "#10B981",
  p6_ambiguous:         "#06B6D4",
  p7_multi_turn_drift:  "#F97316",
  p8_extra_adversarial: "#F43F5E",
};

interface OrbState {
  id: string;
  type: string;
  color: string;
  angle: number;
  angularVel: number;
  radius: number;
  scale: number;
  targetScale: number;
  opacity: number;
  targetOpacity: number;
  pulsing: boolean;
  failed: boolean;
}

interface SimulationCanvasProps {
  sessions: SessionStatus[];
  lastEvent: SSEEvent | null;
}

export default function SimulationCanvas({ sessions, lastEvent }: SimulationCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const orbsRef = useRef<Map<string, OrbState>>(new Map());
  const animFrameRef = useRef<number>(0);
  const lastEventRef = useRef<SSEEvent | null>(null);

  // Sync sessions → orbs
  useEffect(() => {
    sessions.forEach((s, i) => {
      if (!orbsRef.current.has(s.persona_id)) {
        const color = PERSONA_COLORS[s.persona_type ?? ""] ?? "#adc6ff";
        const angle = (i / Math.max(sessions.length, 1)) * Math.PI * 2;
        orbsRef.current.set(s.persona_id, {
          id: s.persona_id,
          type: s.persona_type ?? "",
          color,
          angle,
          angularVel: 0.003 + Math.random() * 0.002,
          radius: 160,
          scale: 0.6,
          targetScale: 1.0,
          opacity: 0.4,
          targetOpacity: 0.85,
          pulsing: false,
          failed: false,
        });
      }
      const orb = orbsRef.current.get(s.persona_id)!;
      if (s.status === "completed") { orb.targetOpacity = 0.3; orb.angularVel *= 0.1; }
      if (s.status === "failed") { orb.failed = true; orb.targetOpacity = 0.2; }
    });
  }, [sessions]);

  // React to SSE events
  useEffect(() => {
    if (!lastEvent || lastEvent === lastEventRef.current) return;
    lastEventRef.current = lastEvent;
    const orb = lastEvent.persona_id ? orbsRef.current.get(lastEvent.persona_id) : null;
    if (!orb) return;

    if (lastEvent.event === "session_started") {
      orb.targetOpacity = 0.9;
      orb.targetScale = 1.0;
    } else if (lastEvent.event === "turn_completed") {
      orb.pulsing = true;
      orb.targetScale = 1.3;
      setTimeout(() => { orb.targetScale = 1.0; orb.pulsing = false; }, 300);
    } else if (lastEvent.event === "session_completed") {
      orb.targetOpacity = 0.3;
      orb.angularVel *= 0.05;
    } else if (lastEvent.event === "session_failed") {
      orb.failed = true;
      orb.targetOpacity = 0.2;
    }
  }, [lastEvent]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const W = canvas.width;
    const H = canvas.height;
    const cx = W / 2;
    const cy = H / 2;

    ctx.clearRect(0, 0, W, H);

    // Background grid dots
    ctx.fillStyle = "rgba(173,198,255,0.04)";
    for (let x = 0; x < W; x += 40) {
      for (let y = 0; y < H; y += 40) {
        ctx.beginPath();
        ctx.arc(x, y, 1, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Orbit ring
    ctx.beginPath();
    ctx.arc(cx, cy, 160, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(173,198,255,0.06)";
    ctx.setLineDash([4, 8]);
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.setLineDash([]);

    // Center core
    const coreGlow = ctx.createRadialGradient(cx, cy, 0, cx, cy, 50);
    coreGlow.addColorStop(0, "rgba(173,198,255,0.25)");
    coreGlow.addColorStop(1, "rgba(173,198,255,0)");
    ctx.beginPath();
    ctx.arc(cx, cy, 50, 0, Math.PI * 2);
    ctx.fillStyle = coreGlow;
    ctx.fill();

    // Lerp and draw orbs
    orbsRef.current.forEach((orb) => {
      orb.angle += orb.angularVel;
      orb.scale += (orb.targetScale - orb.scale) * 0.15;
      orb.opacity += (orb.targetOpacity - orb.opacity) * 0.08;

      const x = cx + Math.cos(orb.angle) * orb.radius;
      const y = cy + Math.sin(orb.angle) * orb.radius;
      const r = 24 * orb.scale;

      ctx.save();
      ctx.globalAlpha = orb.opacity;

      if (orb.failed) {
        // Desaturate: draw grey
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fillStyle = "#424754";
        ctx.fill();
      } else {
        // Glow
        const glow = ctx.createRadialGradient(x, y, 0, x, y, r * 2);
        glow.addColorStop(0, orb.color + "cc");
        glow.addColorStop(1, orb.color + "00");
        ctx.beginPath();
        ctx.arc(x, y, r * 2, 0, Math.PI * 2);
        ctx.fillStyle = glow;
        ctx.fill();

        // Orb
        const grad = ctx.createRadialGradient(x - r * 0.3, y - r * 0.3, 0, x, y, r);
        grad.addColorStop(0, orb.color + "ff");
        grad.addColorStop(1, orb.color + "88");
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.shadowBlur = 20;
        ctx.shadowColor = orb.color;
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      ctx.restore();
    });

    animFrameRef.current = requestAnimationFrame(draw);
  }, []);

  useEffect(() => {
    animFrameRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [draw]);

  // Resize canvas to fill container
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ro = new ResizeObserver(() => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    });
    ro.observe(canvas.parentElement!);
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    return () => ro.disconnect();
  }, []);

  return (
    <section className="flex-1 relative flex items-center justify-center overflow-hidden" style={{ backgroundColor: "#0b1326" }}>
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
    </section>
  );
}
