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
  endSecrets: Record<string, string>;
  attempts: Record<string, { count: number; lockedUntil: number }>;
  liveJobs: Job[];
  saved: string[];
  seedDemo: () => Promise<void>;
  refresh: () => Promise<void>;
  clearLive: () => void;
  toggleSave: (id: string) => void;
  book: (input: BookingInput, actor: Profile, demo: boolean) => Promise<string>;
  startCode: (jobId: string, actor: Profile, demo: boolean) => Promise<string>;
  endCode: (jobId: string, actor: Profile, demo: boolean) => Promise<string>;
  transition: (jobId: string, action: 'accept' | 'start' | 'complete' | 'cancel' | 'quote' | 'customer_accept' | 'simulate_worker_start' | 'simulate_worker_end', actor: Profile, demo: boolean, code?: string, amount?: number) => Promise<void>;
  receiveDemoJob: () => void;
}
let liveRevision = 0;
export const useBookings = create<BookingState>()(persist((set, get) => ({
  demoJobs: [], secrets: {}, endSecrets: {}, liveJobs: [], attempts: {}, saved: [],
  seedDemo: async () => {
    await useBookings.persist.rehydrate();
  },
  receiveDemoJob: () => {
    const job = initialDemoJob();
    set(state => ({ demoJobs: [job, ...state.demoJobs.filter(j => j.id !== job.id)], secrets: { ...state.secrets, [job.id]: generateStartCode(Crypto.getRandomValues) }, endSecrets: { ...state.endSecrets, [job.id]: generateStartCode(Crypto.getRandomValues) } }));
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
    if (!demo) {
      const { data, error } = await requireSupabase().rpc('create_booking', { professional_id: input.worker.id, job_title: input.title.trim(), job_description: input.description.trim(), service_address: input.address.trim(), scheduled_time: input.scheduledAt });
      if (error) throw error;
      await get().refresh();
      return String(data);
    }
    const id = `LF-${Math.floor(1000 + Math.random() * 9000)}`;
    const job: Job = { id, customerId: actor.id, workerId: input.worker.id, customerName: actor.name, workerName: input.worker.name, category: input.worker.category, title: input.title.trim(), description: input.description.trim() || `Service request for ${input.worker.category}`, address: input.address.trim(), scheduledAt: input.scheduledAt, amount: 0, createdAt: new Date().toISOString(), status: 'requested', escrowStatus: 'demo_held' };
    set(state => ({ demoJobs: [job, ...state.demoJobs.filter(j => j.id !== id)], secrets: { ...state.secrets, [id]: '1234' }, endSecrets: { ...state.endSecrets, [id]: '5678' } }));
    return id;
  },
  startCode: async (jobId, actor, demo) => {
    if (!demo) {
      const { data, error } = await requireSupabase().rpc('customer_start_code', { booking_id: jobId });
      if (error) throw error;
      return String(data);
    }
    return get().secrets[jobId] || '1234';
  },
  endCode: async (jobId, actor, demo) => {
    if (!demo) return '0000'; // Real app logic here if needed
    return get().endSecrets[jobId] || '5678';
  },
  transition: async (jobId, action, actor, demo, code = '', amount = 0) => {
    if (!demo) {
      const actions = { accept: 'accept_job', start: 'start_job', complete: 'complete_job', cancel: 'cancel_job' } as const;
      await jobAction(actions[action], jobId, code);
      await get().refresh();
      return;
    }
    const job = get().demoJobs.find(item => item.id === jobId);
    if (!job) throw new Error('Booking not found.');
    let nextStatus: JobStatus;
    let newAmount = job.amount;
    
    if (action === 'accept') {
      nextStatus = 'accepted';
    } else if (action === 'start' || action === 'simulate_worker_start') {
      set(state => ({ attempts: { ...state.attempts, [jobId]: { count: 0, lockedUntil: 0 } } }));
      nextStatus = 'in_progress';
    } else if (action === 'complete' || action === 'simulate_worker_end') {
      nextStatus = 'completed';
    } else if (action === 'cancel') {
      nextStatus = 'cancelled';
    } else if (action === 'quote') {
      nextStatus = 'quoted';
      newAmount = amount;
    } else if (action === 'customer_accept') {
      nextStatus = 'accepted';
    } else {
      throw new Error('Unsupported action.');
    }
    set(state => ({ demoJobs: state.demoJobs.map(item => item.id === jobId ? { ...item, status: nextStatus, amount: newAmount, escrowStatus: nextStatus === 'completed' ? 'released' : nextStatus === 'cancelled' ? 'refunded' : item.escrowStatus } : item) }));
  },
}), { name: 'localfix-demo-bookings-v1', storage: createJSONStorage(() => AsyncStorage), partialize: state => ({ demoJobs: state.demoJobs, secrets: state.secrets, endSecrets: state.endSecrets, attempts: state.attempts, saved: state.saved }) }));