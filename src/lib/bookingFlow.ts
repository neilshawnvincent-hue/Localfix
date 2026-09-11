export type BookingStatus = 'requested' | 'accepted' | 'en_route' | 'arrived' | 'quoted' | 'in_progress' | 'completed' | 'cancelled';
export type BookingDraft = {
  serviceId: string;
  description: string;
  address: string;
  date: string;
  time: string;
};
export type Booking = BookingDraft & {
  id: string;
  customerName: string;
  serviceName: string;
  startingPrice: number;
  visitFee: number;
  status: BookingStatus;
  quote: number | null;
  paid: boolean;
  rating: number;
  createdAt: string;
};
export type BookingAction = 'accept' | 'travel' | 'arrive' | 'quote' | 'approve' | 'complete' | 'cancel' | 'pay' | 'rate';

export const STATUS_LABELS: Record<BookingStatus, string> = {
  requested: 'Finding a professional',
  accepted: 'Professional assigned',
  en_route: 'On the way',
  arrived: 'Professional arrived',
  quoted: 'Quote ready',
  in_progress: 'Work in progress',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

export function localDate(date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export function validateDraft(draft: BookingDraft, now = new Date()): string | null {
  if (!draft.serviceId) return 'Choose a service first.';
  if (draft.description.trim().length < 10) return 'Add at least 10 characters about the work needed.';
  if (draft.address.trim().length < 10) return 'Enter a complete service address (at least 10 characters).';
  if (!/^\d{4}-\d{2}-\d{2}$/.test(draft.date) || !['09:00', '12:00', '15:00', '18:00'].includes(draft.time)) return 'Choose a valid date and appointment time.';
  const appointment = new Date(`${draft.date}T${draft.time}:00`);
  if (!Number.isFinite(appointment.getTime()) || localDate(appointment) !== draft.date || appointment <= now) return 'Choose an appointment in the future.';
  const lastDay = new Date(now);
  lastDay.setDate(lastDay.getDate() + 30);
  if (draft.date > localDate(lastDay)) return 'Appointments can be booked up to 30 days ahead.';
  return null;
}

export function transitionBooking(booking: Booking, action: BookingAction, amount?: number): Booking {
  const transitions: Partial<Record<BookingAction, [BookingStatus, BookingStatus]>> = {
    accept: ['requested', 'accepted'],
    travel: ['accepted', 'en_route'],
    arrive: ['en_route', 'arrived'],
    quote: ['arrived', 'quoted'],
    approve: ['quoted', 'in_progress'],
    complete: ['in_progress', 'completed'],
  };
  if (action === 'cancel') {
    if (['in_progress', 'completed', 'cancelled'].includes(booking.status)) throw new Error('This booking can no longer be cancelled.');
    return { ...booking, status: 'cancelled' };
  }
  if (action === 'pay') {
    if (booking.status !== 'completed' || booking.quote === null || booking.paid) throw new Error('Payment is not available for this booking.');
    return { ...booking, paid: true };
  }
  if (action === 'rate') {
    if (!booking.paid || !Number.isInteger(amount) || amount! < 1 || amount! > 5) throw new Error('Complete payment and choose a rating from 1 to 5.');
    return { ...booking, rating: amount! };
  }
  const transition = transitions[action];
  if (!transition || booking.status !== transition[0]) throw new Error('This action is not available at the current job stage.');
  if (action === 'quote' && (!Number.isFinite(amount) || amount! <= 0 || amount! > 100000 || Number(amount!.toFixed(2)) !== amount)) throw new Error('Enter a quote between Rs 0.01 and Rs 100,000, with at most two decimal places.');
  return { ...booking, status: transition[1], ...(action === 'quote' ? { quote: amount! } : {}) };
}