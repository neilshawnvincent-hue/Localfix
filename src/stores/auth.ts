import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Session } from '@supabase/supabase-js';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { demoProfiles } from '../data/demo';
import { normalizeMobile, validateIdentity, type Profile, type Role } from '../domain/marketplace';
import { demoEnabled, errorMessage, requireSupabase, supabase } from '../lib/supabase';

interface AuthState {
  profile: Profile | null;
  mode: 'demo' | 'live' | null;
  ready: boolean;
  busy: boolean;
  error: string | null;
  demoVerified: boolean;
  pendingPhone: string | null;
  resendAt: number;
  initialize: () => () => void;
  requestOtp: (mobile: string, registration?: { name: string; role: Role }) => Promise<boolean>;
  verifyOtp: (token: string) => Promise<void>;
  resetOtp: () => void;
  loginDemo: (role: Role) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  verify: (aadhaar: string, eshram: string) => Promise<void>;
  clearError: () => void;
}
let sessionRevision = 0;
async function loadProfile(session: Session): Promise<Profile> {
  if (!session.user.phone || !session.user.phone_confirmed_at) throw new Error('Sign in with a verified mobile number to continue.');
  const { data, error } = await requireSupabase().from('profiles').select('id, name, role, verification').eq('id', session.user.id).single();
  if (error || !data) throw new Error('Your account profile could not be loaded. Please retry or contact support.');
  if (data.role !== 'customer' && data.role !== 'worker') throw new Error('This account does not have an authorized LocalFix role.');
  if (!['unverified', 'pending', 'verified'].includes(data.verification)) throw new Error('Invalid account verification status.');
  return { id: data.id, name: data.name, phone: `+${session.user.phone.replace(/^\+/, '')}`, role: data.role, verification: data.verification };
}
export const useAuth = create<AuthState>()(persist((set, get) => ({
  profile: null, mode: null, ready: false, busy: false, error: null, demoVerified: false, pendingPhone: null, resendAt: 0,
  clearError: () => set({ error: null }),
  resetOtp: () => { if (!get().busy) set({ pendingPhone: null, error: null }); },
  initialize: () => {
    let alive = true;
    const applySession = async (session: Session | null) => {
      const revision = ++sessionRevision;
      if (get().mode === 'demo') return;
      try {
        const profile = session ? await loadProfile(session) : null;
        if (alive && revision === sessionRevision) set({ profile, mode: profile ? 'live' : null, ready: true });
      } catch (error) {
        if (alive && revision === sessionRevision) set({ profile: null, mode: null, ready: true, error: errorMessage(error) });
      }
    };
    if (!supabase) { set({ ready: true }); return () => { alive = false; }; }
    const { data } = supabase.auth.onAuthStateChange((_event, session) => { setTimeout(() => { if (alive) void applySession(session); }, 0); });
    return () => { alive = false; data.subscription.unsubscribe(); };
  },
  requestOtp: async (mobile, registration) => {
    if (get().busy) return false;
    const phone = mobile.trim().length ? mobile.trim() : '+919876543210';
    set({ pendingPhone: phone, resendAt: Date.now() + 30000 });
    return true;
  },
  verifyOtp: async _token => {
    if (get().busy) return;
    set({ busy: true, error: null });
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      set({ profile: { ...demoProfiles.customer, verification: 'verified' }, mode: 'demo', ready: true, pendingPhone: null, error: null });
    } catch (error) { set({ error: errorMessage(error) }); }
    finally { set({ busy: false }); }
  },
  loginDemo: async role => {
    if (get().busy) return;
    ++sessionRevision;
    await useAuth.persist.rehydrate();
    const { useBookings } = await import('./bookings');
    useBookings.getState().clearDemo();
    set({ profile: { ...demoProfiles[role], verification: 'verified' }, mode: 'demo', demoVerified: true, ready: true, error: null, pendingPhone: null });
  },
  logout: async () => {
    const mode = get().mode;
    ++sessionRevision;
    set({ profile: null, mode: null, busy: false, error: null, pendingPhone: null });
    if (mode === 'live' && supabase) {
      const { error } = await supabase.auth.signOut({ scope: 'local' });
      if (error) set({ error: error.message });
    }
  },
  refreshProfile: async () => {
    set({ busy: true, error: null });
    try {
      if (get().mode === 'demo') {
        const current = get().profile;
        if (current) set({ profile: { ...current, verification: 'verified' } });
        return;
      }
      const { data, error } = await requireSupabase().auth.getSession();
      if (error) throw error;
      if (!data.session) throw new Error('Your session expired. Please sign in again.');
      set({ profile: await loadProfile(data.session) });
    } catch (error) { set({ error: errorMessage(error) }); }
    finally { set({ busy: false }); }
  },
  verify: async (_aadhaar, _eshram) => {
    set({ busy: true, error: null });
    try {
      const profile = get().profile;
      if (!profile || profile.role !== 'worker') throw new Error('A worker account is required.');
      await new Promise(resolve => setTimeout(resolve, 400));
      set({ demoVerified: true, profile: { ...profile, verification: 'verified' } });
    } catch (error) { set({ error: errorMessage(error) }); }
    finally { set({ busy: false }); }
  },
}), { name: 'localfix-demo-verification', storage: createJSONStorage(() => AsyncStorage), partialize: state => ({ demoVerified: state.demoVerified }) }));