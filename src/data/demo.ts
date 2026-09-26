import { DEFAULT_LOCATION, type Job, type Professional, type Profile, type Role } from '../domain/marketplace';

export const demoProfiles: Record<Role, Profile> = {
  customer: { id: 'demo-customer', name: 'Ananya Sharma', phone: 'Demo mobile', role: 'customer', verification: 'verified' },
  worker: { id: 'demo-worker', name: 'Rajesh Kumar', phone: 'Demo mobile', role: 'worker', verification: 'unverified' },
};
export const professionals: Professional[] = [
  { id: 'demo-worker', name: 'Rajesh Kumar', category: 'Plumbing', title: 'Your neighborhood plumbing expert', rating: 4.9, reviews: 128, hourlyRate: 350, distance: 0.8, image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=240&h=240&fit=crop&crop=faces', available: true, coordinates: { latitude: 12.9814, longitude: 77.6438 } },
  { id: 'demo-worker-electrical', name: 'Arjun Patel', category: 'Electrical', title: 'Safe fixes. Reliable connections.', rating: 4.8, reviews: 96, hourlyRate: 400, distance: 1.2, image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=240&h=240&fit=crop&crop=faces', available: true, coordinates: { latitude: 12.9864, longitude: 77.6408 } },
  { id: 'demo-worker-cleaning', name: 'Meera Devi', category: 'Cleaning', title: 'A fresh start for every room', rating: 4.9, reviews: 154, hourlyRate: 300, distance: 1.6, image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=240&h=240&fit=crop&crop=faces', available: true, coordinates: { latitude: 12.9684, longitude: 77.6478 } },
  { id: 'demo-worker-carpentry', name: 'Suresh Rao', category: 'Carpentry', title: 'Thoughtful work, built to last', rating: 4.8, reviews: 87, hourlyRate: 450, distance: 2.1, image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=240&h=240&fit=crop&crop=faces', available: false, coordinates: { latitude: 12.9914, longitude: 77.6488 } },
  { id: 'demo-worker-painting', name: 'Vikram Singh', category: 'Painting', title: 'A little color, a whole new home', rating: 4.7, reviews: 62, hourlyRate: 350, distance: 2.7, image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=240&h=240&fit=crop&crop=faces', available: true, coordinates: { latitude: 12.9594, longitude: 77.6408 } },
  { id: 'demo-worker-appliances', name: 'Imran Ali', category: 'Appliances', title: 'Getting everyday essentials running', rating: 4.9, reviews: 113, hourlyRate: 400, distance: 3.1, image: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=240&h=240&fit=crop&crop=faces', available: true, coordinates: { latitude: 12.9544, longitude: 77.6448 } },
];
export function initialDemoJob(): Job {
  return { id: 'LF-2048', customerId: 'demo-customer', workerId: 'demo-worker', customerName: 'Ananya Sharma', workerName: 'Rajesh Kumar', category: 'Plumbing', title: 'Kitchen tap repair', description: 'The kitchen tap has a steady drip. Please check the washer and fittings.', address: '24, 12th Main Road, Indiranagar', scheduledAt: new Date(Date.now() + 3600000).toISOString(), amount: 450, status: 'accepted', createdAt: new Date().toISOString(), escrowStatus: 'demo_held' };
}
export const neighborhood = { label: 'Indiranagar, Bengaluru', coordinates: DEFAULT_LOCATION };