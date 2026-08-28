export type JobStatus =
  | 'searching'
  | 'assigned'
  | 'en_route'
  | 'arrived'
  | 'quote_provided'
  | 'in_progress'
  | 'completed'
  | 'cancelled';

export type MockJob = {
  id: string;
  serviceId: string;
  serviceName: string;
  customerName: string;
  customerPhone: string;
  workerName: string;
  workerPhone: string;
  workerRating: number;
  workerPhoto: string;
  description: string;
  status: JobStatus;
  consultationFee: number;
  finalQuote: number | null;
  arrivalOtp: string;
  completionOtp: string;
  distance: string;
  eta: string;
  createdAt: string;
  customerLocation: { latitude: number; longitude: number };
  workerLocation: { latitude: number; longitude: number };
};

export const MOCK_WORKER = {
  name: 'Rajesh Kumar',
  phone: '+91 98765 43210',
  rating: 4.8,
  jobsCompleted: 342,
  photo: 'https://i.pravatar.cc/150?img=11',
  aadhaarLast4: '6789',
};

export const MOCK_CUSTOMER = {
  name: 'Priya Sharma',
  phone: '+91 91234 56789',
  address: '42, MG Road, Indiranagar, Bengaluru',
};

export const MOCK_ACTIVE_JOB: MockJob = {
  id: 'job-001',
  serviceId: 'plumber',
  serviceName: 'Plumber',
  customerName: MOCK_CUSTOMER.name,
  customerPhone: MOCK_CUSTOMER.phone,
  workerName: MOCK_WORKER.name,
  workerPhone: MOCK_WORKER.phone,
  workerRating: MOCK_WORKER.rating,
  workerPhoto: MOCK_WORKER.photo,
  description: 'Kitchen sink leaking from the pipe below. Water dripping continuously.',
  status: 'en_route',
  consultationFee: 60,
  finalQuote: null,
  arrivalOtp: '4829',
  completionOtp: '7156',
  distance: '2.3 km',
  eta: '8 min',
  createdAt: new Date().toISOString(),
  customerLocation: { latitude: 12.9716, longitude: 77.5946 },
  workerLocation: { latitude: 12.9756, longitude: 77.5996 },
};

export type MockHistoryJob = Partial<MockJob> & {
  id: string;
  serviceName: string;
  // When the customer booked the job.
  createdAt: string;
  // When the worker actually began the work on site.
  startedAt?: string;
  // When the worker finished the work.
  completedAt?: string;
  // Rating the customer originally left (0 = not yet rated).
  rating?: number;
};

export const MOCK_JOB_HISTORY: MockHistoryJob[] = [
  {
    id: 'job-h1',
    serviceId: 'electrician',
    serviceName: 'Electrician',
    workerName: 'Suresh Yadav',
    description: 'Living room wiring fault, frequent tripping of the main switch.',
    status: 'completed',
    consultationFee: 60,
    finalQuote: 450,
    createdAt: '2026-08-15T10:30:00Z',
    startedAt: '2026-08-15T11:05:00Z',
    completedAt: '2026-08-15T12:20:00Z',
    rating: 0,
  },
  {
    id: 'job-h2',
    serviceId: 'plumber',
    serviceName: 'Plumber',
    workerName: 'Arun Patel',
    description: 'Bathroom tap leaking and slow drainage in the sink.',
    status: 'completed',
    consultationFee: 60,
    finalQuote: 850,
    createdAt: '2026-08-12T14:00:00Z',
    startedAt: '2026-08-12T14:40:00Z',
    completedAt: '2026-08-12T16:10:00Z',
    rating: 0,
  },
  {
    id: 'job-h3',
    serviceId: 'ac-repair',
    serviceName: 'AC Repair',
    workerName: 'Vikram Singh',
    description: 'Split AC not cooling, suspected gas refill and servicing needed.',
    status: 'completed',
    consultationFee: 60,
    finalQuote: 1200,
    createdAt: '2026-08-08T09:15:00Z',
    startedAt: '2026-08-08T09:50:00Z',
    completedAt: '2026-08-08T11:35:00Z',
    rating: 0,
  },
];

export function getHistoryJobById(id?: string | null): MockHistoryJob | undefined {
  if (!id) return undefined;
  return MOCK_JOB_HISTORY.find((job) => job.id === id);
}

export const MOCK_WORKER_EARNINGS = {
  today: 540,
  thisWeek: 3280,
  thisMonth: 14500,
  totalJobs: 342,
  todayJobs: 3,
};
