import { api } from './client';
import type { RunReport } from '@/types/api';

export function getReport(runId: string): Promise<RunReport> {
  return api.get<RunReport>(`/v1/reports/${runId}`);
}
