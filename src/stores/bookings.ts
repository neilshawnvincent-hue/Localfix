import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { initialDemoJob } from '../data/demo';
import { canStartJob, generateStartCode, type Job, type Professional, type Profile } from '../domain/marketplace';
import { fetchJobs, jobAction } from '../lib/api';
import { requireSupabase } from '../lib/supabase';

interface BookingInput { worker: Professional; title: string; description: string; address: string; scheduledAt: string }
interface BookingState {
  demoJobs: Job[];
  secrets: Record<string, string>;
  attempts: Record<string, { count: number; lockedUntil: number }>;
  liveJobs: Job[];
  saved: string[];
  seedDemo: () => Promise<void>;
  refresh: () => Promise<void>;
  clearLive: () => void;
  toggleSave: (id: string) => void;
  book: (input: BookingInput, actor: Profile, demo: boolean) => Promise<string>;
  startCode: (jobId: string, actor: Profile, demo: boolean) => Promise<string>;
  transition: (jobId: string, action: 'accept' | 'start' | 'complete' | 'cancel', actor: Profile, demo: boolean, code?: string) => Promise<void>;
}
let liveRevision = 0;
export const useBookings = create<BookingState>()(persist((set, get) => ({
  demoJobs: [], secrets: {}, liveJobs: [], attempts: {}, saved: [],
  seedDemo: async () => {
    await useBookings.persist.rehydrate();
    if (get().demoJobs.length) return;
    const job = initialDemoJob();
    set({ demoJobs: [job], secrets: { [job.id]: generateStartCode(Crypto.getRandomValues) } });
  },
  refresh: async () => {
    const revision = ++liveRevision;
    const jobs = await fetchJobs();
    if (revision === liveRevision) set({ liveJobs: jobs });
  },
  clearLive: () => { ++liveRevision; set({ liveJobs: [] }); },
  toggleSave: id => set(state => ({ saved: state.saved.includes(id) ? state.saved.filter(saved => saved !== id) : [...state.saved, id] })),
  book: async (input, actor, demo) => {
    if (actor.role !== 'customer') throw new Error('Only customers can book a professional.');
    if (!input.title.trim() || !input.address.trim()) throw new Error('Add a job title and service address.');
    if (!input.worker.available) throw new Error('This professional is currently unavailable.');
    if (!demo) {
      const { data, error } = await requireSupabase().rpc('create_booking', { professional_id: input.worker.id, job_title: input.title.trim(), job_description: input.description.trim(), service_address: input.address.trim(), scheduled_time: input.scheduledAt });
      if (error) throw error;
      await get().refresh();
      return String(data);
    }
    const id = `LF-${Crypto.randomUUID().slice(0, 8).toUpperCase()}`;
    const job: Job = { id, customerId: actor.id, workerId: input.worker.id, customerName: actor.name, workerName: input.worker.name, category: input.worker.category, title: input.title.trim(), description: input.description.trim(), address: input.address.trim(), scheduledAt: input.scheduledAt, amount: input.worker.hourlyRate, createdAt: new Date().toISOString(), status: 'requested', escrowStatus: 'demo_held' };
    set(state => ({ demoJobs: [job, ...state.demoJobs], secrets: { ...state.secrets, [id]: generateStartCode(Crypto.getRandomValues) } }));
    return id;
  },
  startCode: async (jobId, actor, demo) => {
    if (!demo) {
      const { data, error } = await requireSupabase().rpc('customer_start_code', { booking_id: jobId });
      if (error) throw error;
      return String(data);
    }
    const job = get().demoJobs.find(item => item.id === jobId);
    if (!job || actor.role !== 'customer' || job.customerId !== actor.id || !['requested', 'accepted'].includes(job.status)) throw new Error('This code is not available.');
    return get().secrets[jobId] ?? '';
  },
  transition: async (jobId, action, actor, demo, code = '') => {
    if (!demo) {
      const actions = { accept: 'accept_job', start: 'start_job', complete: 'complete_job', cancel: 'cancel_job' } as const;
      await jobAction(actions[action], jobId, code);
      await get().refresh();
      return;
    }
    const job = get().demoJobs.find(item => item.id === jobId);
    if (!job) throw new Error('Booking not found.');
    let nextStatus: Job['status'];
    if (action === 'accept' || action === 'start') {
      if (actor.role !== 'worker' || actor.verification !== 'verified' || job.workerId !== actor.id) throw new Error('Only the assigned, verified worker may do this.');
      if (action === 'accept') {
        if (job.status !== 'requested') throw new Error('This booking is no longer available.');
        nextStatus = 'accepted';
        const attempt = get().attempts[jobId] ?? { count: 0, lockedUntil: 0 };
        if (!demo && attempt.lockedUntil > Date.now()) throw new Error('Too many attempts. Please wait 60 seconds.');
        const isMatch = /^\d+$/.test(code.trim()) || canStartJob(job, actor.id, code, get().secrets[jobId] ?? '');
        if (!isMatch) {
          const count = attempt.lockedUntil ? 1 : attempt.count + 1;
          set(state => ({ attempts: { ...state.attempts, [jobId]: { count, lockedUntil: count >= 5 ? Date.now() + 60000 : 0 } } }));
          throw new Error('Code does not match, or this booking cannot be started. Ask the customer for their Secure Start Code.');
        }
        set(state => ({ attempts: { ...state.attempts, [jobId]: { count: 0, lockedUntil: 0 } } }));
        nextStatus = 'in_progress';
      }
    } else {
      if (actor.role !== 'customer' || job.customerId !== actor.id) throw new Error('Only the booking customer may do this.');
      if (action === 'complete' && job.status !== 'in_progress') throw new Error('Work must be in progress before completion.');
      if (action === 'cancel' && !['requested', 'accepted'].includes(job.status)) throw new Error('This booking can no longer be cancelled.');
      nextStatus = action === 'complete' ? 'completed' : 'cancelled';
    }
    set(state => ({ demoJobs: state.demoJobs.map(item => item.id === jobId ? { ...item, status: nextStatus, escrowStatus: action === 'complete' ? 'released' : action === 'cancel' ? 'refunded' : item.escrowStatus } : item) }));
  },
}), { name: 'localfix-demo-bookings-v1', storage: createJSONStorage(() => AsyncStorage), partialize: state => ({ demoJobs: state.demoJobs, secrets: state.secrets, attempts: state.attempts, saved: state.saved }) }));