'use client';

import { useEffect, useRef } from 'react';
import type { SessionStatus } from '@/types/api';

const PERSONA_COLORS: Record<string, string> = {
  low_literacy: '#3B82F6',
  non_native: '#8B5CF6',
  adversarial: '#EF4444',
  distressed: '#F59E0B',
  domain_expert: '#10B981',
  ambiguous: '#06B6D4',
  multi_turn_drift: '#F97316',
};

const DEFAULT_COLOR = '#F43F5E';

interface OrbState {
  x: number;
  y: number;
  baseX: number;
  baseY: number;
  radius: number;
  color: string;
  angle: number;
  orbitRadius: number;
  orbitSpeed: number;
  alpha: number;
  targetAlpha: number;
  pulseScale: number;
  pulseFade: number;
  status: 'waiting' | 'active' | 'completed' | 'failed';
  personaType: string;
  label: string;
}

interface SimulationCanvasProps {
  sessions: Record<string, SessionStatus>;
  isComplete: boolean;
}

export default function SimulationCanvas({ sessions, isComplete }: SimulationCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const orbsRef = useRef<Record<string, OrbState>>({});
  const animFrameRef = useRef<number | null>(null);
  const prevSessionsRef = useRef<Record<string, SessionStatus>>({});

  // Sync session changes to orb states
  useEffect(() => {
    const prev = prevSessionsRef.current;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const sessionList = Object.values(sessions);
    const total = Math.max(sessionList.length, 1);

    sessionList.forEach((session, idx) => {
      const angle = (idx / total) * Math.PI * 2 - Math.PI / 2;
      const ringR = Math.min(cx, cy) * 0.55;
      const bx = cx + Math.cos(angle) * ringR;
      const by = cy + Math.sin(angle) * ringR;

      const existing = orbsRef.current[session.persona_id];
      const color = PERSONA_COLORS[session.persona_type ?? ''] ?? DEFAULT_COLOR;
      const label = (session.persona_type ?? session.persona_id).replace('_', ' ').slice(0, 3).toUpperCase();

      if (!existing) {
        // Spawn new orb
        orbsRef.current[session.persona_id] = {
          x: bx,
          y: by,
          baseX: bx,
          baseY: by,
          radius: 18,
          color,
          angle: 0,
          orbitRadius: 0,
          orbitSpeed: 0.008 + Math.random() * 0.004,
          alpha: 0.3,
          targetAlpha: 0.9,
          pulseScale: 1,
          pulseFade: 0,
          status: 'active',
          personaType: session.persona_type ?? '',
          label,
        };
      } else {
        const prevSession = prev[session.persona_id];
        // Check for turn_completed to trigger pulse
        if (prevSession && session.turns_completed > prevSession.turns_completed) {
          existing.pulseFade = 1;
          existing.pulseScale = 1.5;
        }

        if (session.status === 'completed') {
          existing.status = 'completed';
          existing.targetAlpha = 0.25;
          existing.orbitRadius = 0;
        } else if (session.status === 'failed') {
          existing.status = 'failed';
          existing.targetAlpha = 0.2;
          existing.orbitRadius = 0;
        } else if (session.status === 'in_progress') {
          existing.status = 'active';
          existing.targetAlpha = 0.9;
          existing.orbitRadius = 6;
        }
      }
    });

    if (isComplete) {
      Object.values(orbsRef.current).forEach((orb) => {
        orb.targetAlpha = 0.15;
        orb.orbitRadius = 0;
      });
    }

    prevSessionsRef.current = { ...sessions };
  }, [sessions, isComplete]);

  // Canvas animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    function resize() {
      if (!canvas) return;
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctx!.scale(window.devicePixelRatio, window.devicePixelRatio);
    }
    resize();
    window.addEventListener('resize', resize);

    function drawOrb(orb: OrbState) {
      const w = canvas!.offsetWidth;
      const h = canvas!.offsetHeight;

      // Orbit motion
      orb.angle += orb.orbitSpeed;
      const ox = orb.baseX + Math.cos(orb.angle) * orb.orbitRadius;
      const oy = orb.baseY + Math.sin(orb.angle) * orb.orbitRadius;
      orb.x = ox;
      orb.y = oy;

      // Smoothly approach target alpha
      orb.alpha += (orb.targetAlpha - orb.alpha) * 0.05;

      // Pulse decay
      if (orb.pulseFade > 0) {
        orb.pulseFade -= 0.04;
        orb.pulseScale = 1 + orb.pulseFade * 0.5;
      } else {
        orb.pulseScale = 1;
      }

      const r = orb.radius * orb.pulseScale;

      // Glow
      const grd = ctx!.createRadialGradient(ox, oy, 0, ox, oy, r * 2);
      grd.addColorStop(0, orb.color + Math.round(orb.alpha * 255).toString(16).padStart(2, '0'));
      grd.addColorStop(1, orb.color + '00');
      ctx!.beginPath();
      ctx!.arc(ox, oy, r * 2, 0, Math.PI * 2);
      ctx!.fillStyle = grd;
      ctx!.fill();

      // Orb body
      ctx!.beginPath();
      ctx!.arc(ox, oy, r, 0, Math.PI * 2);
      ctx!.fillStyle = orb.color + Math.round(orb.alpha * 200).toString(16).padStart(2, '0');
      ctx!.fill();

      // Border
      ctx!.beginPath();
      ctx!.arc(ox, oy, r, 0, Math.PI * 2);
      ctx!.strokeStyle = orb.color + 'cc';
      ctx!.lineWidth = 1.5;
      ctx!.stroke();

      // Failed X
      if (orb.status === 'failed') {
        ctx!.strokeStyle = '#EF444488';
        ctx!.lineWidth = 2;
        ctx!.beginPath();
        ctx!.moveTo(ox - 6, oy - 6);
        ctx!.lineTo(ox + 6, oy + 6);
        ctx!.moveTo(ox + 6, oy - 6);
        ctx!.lineTo(ox - 6, oy + 6);
        ctx!.stroke();
      }

      // Label below orb
      ctx!.fillStyle = `rgba(148,163,184,${orb.alpha * 0.8})`;
      ctx!.font = `bold 9px system-ui`;
      ctx!.textAlign = 'center';
      ctx!.fillText(orb.label, ox, oy + r + 12);
    }

    function draw() {
      if (!canvas) return;
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      ctx!.clearRect(0, 0, w, h);

      // Center ring guide (subtle)
      const cx = w / 2;
      const cy = h / 2;
      const ringR = Math.min(cx, cy) * 0.55;
      ctx!.beginPath();
      ctx!.arc(cx, cy, ringR, 0, Math.PI * 2);
      ctx!.strokeStyle = 'rgba(51,65,85,0.3)';
      ctx!.lineWidth = 1;
      ctx!.stroke();

      // Center LitmusAI label
      const orbs = Object.values(orbsRef.current);
      if (orbs.length === 0) {
        ctx!.fillStyle = 'rgba(100,116,139,0.4)';
        ctx!.font = '13px system-ui';
        ctx!.textAlign = 'center';
        ctx!.fillText('Waiting for personas…', cx, cy);
      }

      orbs.forEach(drawOrb);
      animFrameRef.current = requestAnimationFrame(draw);
    }

    draw();

    return () => {
      window.removeEventListener('resize', resize);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full"
      style={{ display: 'block' }}
    />
  );
}
