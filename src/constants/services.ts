import { Ionicons } from '@expo/vector-icons';

export type ServiceCategory = {
  id: string;
  name: string;
  icon: keyof typeof Ionicons.glyphMap;
  startingPrice: number;
  color: string;
  description: string;
};

export const SERVICES: ServiceCategory[] = [
  {
    id: 'plumber',
    name: 'Plumber',
    icon: 'water',
    startingPrice: 199,
    color: '#3B82F6',
    description: 'Leaks, pipes, taps & drainage',
  },
  {
    id: 'electrician',
    name: 'Electrician',
    icon: 'flash',
    startingPrice: 149,
    color: '#F59E0B',
    description: 'Wiring, switches & appliances',
  },
  {
    id: 'carpenter',
    name: 'Carpenter',
    icon: 'hammer',
    startingPrice: 249,
    color: '#A855F7',
    description: 'Furniture, doors & fittings',
  },
  {
    id: 'painter',
    name: 'Painter',
    icon: 'color-palette',
    startingPrice: 299,
    color: '#EC4899',
    description: 'Walls, doors & touch-ups',
  },
  {
    id: 'cleaner',
    name: 'Cleaner',
    icon: 'sparkles',
    startingPrice: 179,
    color: '#14B8A6',
    description: 'Deep clean, kitchen & bathroom',
  },
  {
    id: 'ac-repair',
    name: 'AC Repair',
    icon: 'snow',
    startingPrice: 349,
    color: '#06B6D4',
    description: 'Service, gas refill & repair',
  },
];

export const CONSULTATION_FEE = 60;
