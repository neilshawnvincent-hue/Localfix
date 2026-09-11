import { CONSULTATION_FEE, SERVICES } from '@/constants/services';
import { transitionBooking, validateDraft, type Booking, type BookingAction, type BookingDraft } from '@/lib/bookingFlow';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

const emptyDraft: BookingDraft = { serviceId: '', description: '', address: '', date: '', time: '' };

type WebState = {
  hydrated: boolean;
  draft: BookingDraft;
  bookings: Booking[];
  online: boolean;
  savedAddress: string;
  setDraft: (draft: Partial<BookingDraft>) => void;
  selectService: (serviceId: string) => void;
  createBooking: (name: string) => string;
  act: (id: string, action: BookingAction, amount?: number) => void;
  setOnline: (online: boolean) => void;
  saveAddress: (address: string) => void;
  reset: () => void;
};

export const useWebStore = create<WebState>()(persist((set, get) => ({
  hydrated: false,
  draft: emptyDraft,
  bookings: [],
  online: false,
  savedAddress: '',
  setDraft: (draft) => set((state) => ({ draft: { ...state.draft, ...draft } })),
  selectService: (serviceId) => set((state) => ({ draft: { ...state.draft, serviceId, address: state.draft.address || state.savedAddress } })),
  createBooking: (name) => {
    const { draft } = get();
    const error = validateDraft(draft);
    if (error) throw new Error(error);
    const service = SERVICES.find((item) => item.id === draft.serviceId);
    if (!service) throw new Error('This service is not available.');
    const id = `LF-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
    const booking: Booking = {
      ...draft, id, customerName: name, serviceName: service.name,
      startingPrice: service.startingPrice, visitFee: CONSULTATION_FEE,
      status: 'requested', quote: null, paid: false, rating: 0, createdAt: new Date().toISOString(),
    };
    set((state) => ({ bookings: [booking, ...state.bookings], draft: { ...emptyDraft, address: state.savedAddress } }));
    return id;
  },
  act: (id, action, amount) => {
    const booking = get().bookings.find((item) => item.id === id);
    if (!booking) throw new Error('Booking not found.');
    const updated = transitionBooking(booking, action, amount);
    set((state) => ({ bookings: state.bookings.map((item) => item.id === id ? updated : item) }));
  },
  setOnline: (online) => set({ online }),
  saveAddress: (savedAddress) => set({ savedAddress }),
  reset: () => set({ draft: emptyDraft, bookings: [], online: false, savedAddress: '' }),
}), {
  name: 'localfix-web-workspace-v1',
  storage: createJSONStorage(() => AsyncStorage),
  skipHydration: typeof window === 'undefined',
  partialize: ({ draft, bookings, online, savedAddress }) => ({ draft, bookings, online, savedAddress }),
  onRehydrateStorage: () => () => useWebStore.setState({ hydrated: true }),
}));