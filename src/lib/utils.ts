export function cn(...classes: (string | undefined | false | null)[]): string {
  return classes.filter(Boolean).join(" ");
}

export function scoreToTextColor(score: number): string {
  if (score >= 70) return "text-pass";
  if (score >= 50) return "text-[#F59E0B]";
  return "text-fail";
}

export function scoreToGlowClass(score: number): string {
  if (score >= 70) return "shadow-[0_0_32px_rgba(78,222,163,0.2)]";
  if (score >= 50) return "shadow-[0_0_32px_rgba(245,158,11,0.2)]";
  return "shadow-[0_0_32px_rgba(255,180,171,0.2)]";
}

export function scoreToHex(score: number): string {
  if (score >= 70) return "#4edea3";
  if (score >= 50) return "#F59E0B";
  return "#ffb4ab";
}

export function formatDuration(startIso: string, endIso?: string | null): string {
  const start = new Date(startIso).getTime();
  const end = endIso ? new Date(endIso).getTime() : Date.now();
  const secs = Math.floor((end - start) / 1000);
  if (secs < 60) return `${secs}s`;
  const mins = Math.floor(secs / 60);
  const rem = secs % 60;
  return `${mins}m ${rem}s`;
}
