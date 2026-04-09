import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import ReportClient from './ReportClient';
import type { RunReport } from '@/types/api';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';

async function fetchReport(runId: string): Promise<RunReport | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('litmusai_token')?.value;
  if (!token) return null;

  try {
    const res = await fetch(`${BACKEND_URL}/v1/reports/${runId}`, {
      headers: { 'x-api-key': token },
      cache: 'no-store',
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export default async function ReportPage({
  params,
}: {
  params: Promise<{ runId: string }>;
}) {
  const { runId } = await params;
  const report = await fetchReport(runId);

  if (!report) {
    notFound();
  }

  return <ReportClient report={report} />;
}
