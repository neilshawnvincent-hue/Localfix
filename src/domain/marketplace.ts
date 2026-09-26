export type Role = 'customer' | 'worker';
export type VerificationStatus = 'unverified' | 'pending' | 'verified';
export type JobStatus = 'requested' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';
export type Category = 'All services' | 'Plumbing' | 'Electrical' | 'Cleaning' | 'Carpentry' | 'Painting' | 'Appliances';

export interface Coordinates { latitude: number; longitude: number }
export interface Profile {
  id: string;
  name: string;
  phone: string;
  role: Role;
  verification: VerificationStatus;
}
export interface Professional {
  id: string;
  name: string;
  category: Category;
  title: string;
  rating: number;
  reviews: number;
  hourlyRate: number;
  distance: number;
  image: string;
  available: boolean;
  coordinates: Coordinates;
}
export interface Job {
  id: string;
  customerId: string;
  workerId: string;
  customerName: string;
  workerName: string;
  category: Category;
  title: string;
  description: string;
  address: string;
  scheduledAt: string;
  amount: number;
  status: JobStatus;
  createdAt: string;
  escrowStatus: 'demo_held' | 'unfunded' | 'held' | 'released' | 'refunded';
}

export const DEFAULT_LOCATION: Coordinates = { latitude: 12.9784, longitude: 77.6408 };
export const statusLabels: Record<JobStatus, string> = {
  requested: 'Booking requested', accepted: 'On the way', in_progress: 'In progress', completed: 'Completed', cancelled: 'Cancelled',
};
export function distanceKm(origin: Coordinates, target: Coordinates): number {
  const radians = (degrees: number) => degrees * Math.PI / 180;
  const latitudeDelta = radians(target.latitude - origin.latitude);
  const longitudeDelta = radians(target.longitude - origin.longitude);
  const arc = Math.sin(latitudeDelta / 2) ** 2 + Math.cos(radians(origin.latitude)) * Math.cos(radians(target.latitude)) * Math.sin(longitudeDelta / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(arc), Math.sqrt(1 - arc));
}
export function generateStartCode(randomValues: (array: Uint32Array) => Uint32Array): string {
  const sample = new Uint32Array(1);
  do { randomValues(sample); } while (sample[0]! >= 4294960000);
  return (sample[0]! % 10000).toString().padStart(4, '0');
}
export function canStartJob(job: Job, workerId: string, enteredCode: string, actualCode: string): boolean {
  return job.workerId === workerId && job.status === 'accepted' && (job.escrowStatus === 'held' || job.escrowStatus === 'demo_held') && /^\d{4}$/.test(enteredCode) && enteredCode === actualCode;
}
export function canViewJob(job: Job, profile: Profile): boolean {
  return profile.role === 'customer' ? job.customerId === profile.id : job.workerId === profile.id;
}
export function validateIdentity(aadhaar: string, eshram: string): string | null {
  if (!/^[2-9]\d{11}$/.test(aadhaar)) return 'Enter a valid 12-digit Aadhaar number.';
  if (!/^\d{12}$/.test(eshram)) return 'Enter your 12-digit e-Shram UAN.';
  return null;
}
export function normalizeMobile(value: string): string | null {
  const compact = value.replace(/[\s()-]/g, '');
  const national = compact.replace(/^(?:\+91|91)(?=\d{10}$)/, '');
  return /^[6-9]\d{9}$/.test(national) ? `+91${national}` : null;
}
export const money = (amount: number): string => `\u20b9${amount.toLocaleString('en-IN')}`;