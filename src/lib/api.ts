import type { Category, Coordinates, Job, Professional } from '../domain/marketplace';
import { requireSupabase } from './supabase';

interface JobRow {
  id: string; customer_id: string; worker_id: string; customer_name: string; worker_name: string;
  category: Category; title: string; description: string; address: string; scheduled_at: string;
  amount: number; status: Job['status']; created_at: string; escrow_status: Job['escrowStatus'];
}
export const fromJobRow = (row: JobRow): Job => ({ id: row.id, customerId: row.customer_id, workerId: row.worker_id, customerName: row.customer_name, workerName: row.worker_name, category: row.category, title: row.title, description: row.description, address: row.address, scheduledAt: row.scheduled_at, amount: row.amount, status: row.status, createdAt: row.created_at, escrowStatus: row.escrow_status });
export async function fetchJobs(): Promise<Job[]> {
  const { data, error } = await requireSupabase().from('jobs').select('*').order('created_at', { ascending: false }).returns<JobRow[]>();
  if (error) throw error;
  return (data ?? []).map(fromJobRow);
}
export async function fetchProfessionals(location: Coordinates): Promise<Professional[]> {
  const { data, error } = await requireSupabase().rpc('nearby_workers', { latitude: location.latitude, longitude: location.longitude });
  if (error) throw error;
  return (data ?? []) as Professional[];
}
export async function jobAction(action: 'accept_job' | 'start_job' | 'complete_job' | 'cancel_job', jobId: string, code?: string): Promise<void> {
  const { error } = await requireSupabase().rpc(action, { booking_id: jobId, ...(action === 'start_job' ? { start_code: code } : {}) });
  if (error) throw error;
}