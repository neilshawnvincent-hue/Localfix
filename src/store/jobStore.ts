import { create } from 'zustand';
import { MOCK_ACTIVE_JOB, type JobStatus, type MockJob } from '@/constants/mockData';

type JobState = {
  activeJob: MockJob | null;
  isOnline: boolean; // worker only
  hasIncomingJob: boolean; // worker only

  // Customer actions
  createJob: (serviceId: string, serviceName: string, description: string) => void;
  updateJobStatus: (status: JobStatus) => void;
  clearJob: () => void;

  // Worker actions
  toggleOnline: () => void;
  triggerJobAlert: () => void;
  acceptJob: () => void;
  declineJob: () => void;
  submitQuote: (amount: number) => void;
};

export const useJobStore = create<JobState>((set, get) => ({
  activeJob: null,
  isOnline: false,
  hasIncomingJob: false,

  createJob: (serviceId, serviceName, description) =>
    set({
      activeJob: {
        ...MOCK_ACTIVE_JOB,
        id: `job-${Date.now()}`,
        serviceId,
        serviceName,
        description,
        status: 'searching',
        createdAt: new Date().toISOString(),
      },
    }),

  updateJobStatus: (status) =>
    set((state) => ({
      activeJob: state.activeJob ? { ...state.activeJob, status } : null,
    })),

  clearJob: () => set({ activeJob: null }),

  toggleOnline: () => set((state) => {
    const nextOnline = !state.isOnline;
    return { 
      isOnline: nextOnline,
      hasIncomingJob: nextOnline ? state.hasIncomingJob : false
    };
  }),

  triggerJobAlert: () => set({ hasIncomingJob: true }),

  acceptJob: () =>
    set({
      hasIncomingJob: false,
      activeJob: {
        ...MOCK_ACTIVE_JOB,
        id: `job-${Date.now()}`,
        status: 'assigned',
      },
    }),

  declineJob: () => set({ hasIncomingJob: false }),

  submitQuote: (amount) =>
    set((state) => ({
      activeJob: state.activeJob
        ? { ...state.activeJob, finalQuote: amount, status: 'quote_provided' }
        : null,
    })),
}));
