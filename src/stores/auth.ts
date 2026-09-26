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
    const phone = normalizeMobile(mobile);
    if (!phone) { set({ error: 'Enter a valid 10-digit Indian mobile number.' }); return false; }
    if (registration && (registration.name.trim().length < 2 || !['customer', 'worker'].includes(registration.role))) {
      set({ error: 'Enter your full name and choose an account type.' }); return false;
    }
    if (Date.now() < get().resendAt) { set({ error: 'Please wait before requesting another OTP.' }); return false; }
    set({ busy: true, error: null });
    try {
      const { error } = await requireSupabase().auth.signInWithOtp({
        phone,
        options: { channel: 'sms', shouldCreateUser: Boolean(registration), ...(registration ? { data: { name: registration.name.trim(), role: registration.role } } : {}) },
      });
      if (error) throw error;
      set({ pendingPhone: phone, resendAt: Date.now() + 60000 });
      return true;
    } catch (error) { set({ error: errorMessage(error) }); return false; }
    finally { set({ busy: false }); }
  },
  verifyOtp: async token => {
    if (get().busy) return;
    const phone = get().pendingPhone;
    if (!phone) { set({ error: 'Request an OTP for your mobile number first.' }); return; }
    if (!/^\d{6}$/.test(token)) { set({ error: 'Enter the 6-digit OTP from your SMS.' }); return; }
    set({ busy: true, error: null });
    try {
      const { data, error } = await requireSupabase().auth.verifyOtp({ phone, token, type: 'sms' });
      if (error) throw error;
      if (!data.session) throw new Error('Your code could not be verified. Request a new OTP.');
      const profile = await loadProfile(data.session);
      set({ profile, mode: 'live', ready: true, pendingPhone: null, error: null });
    } catch (error) { set({ error: errorMessage(error) }); }
    finally { set({ busy: false }); }
  },
  loginDemo: async role => {
    if (get().busy) return;
    if (!demoEnabled) { set({ error: 'Demo Mode is disabled in this build.' }); return; }
    ++sessionRevision;
    await useAuth.persist.rehydrate();
    set({ profile: { ...demoProfiles[role], verification: role === 'customer' || get().demoVerified ? 'verified' : 'unverified' }, mode: 'demo', ready: true, error: null, pendingPhone: null });
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
      const { data, error } = await requireSupabase().auth.getSession();
      if (error) throw error;
      if (!data.session) throw new Error('Your session expired. Please sign in again.');
      set({ profile: await loadProfile(data.session) });
    } catch (error) { set({ error: errorMessage(error) }); }
    finally { set({ busy: false }); }
  },
  verify: async (aadhaar, eshram) => {
    const validation = validateIdentity(aadhaar, eshram);
    if (validation) { set({ error: validation }); return; }
    set({ busy: true, error: null });
    try {
      const profile = get().profile;
      if (!profile || profile.role !== 'worker') throw new Error('A worker account is required.');
      if (get().mode === 'demo') {
        await new Promise(resolve => setTimeout(resolve, 1600));
        if (get().profile?.id === profile.id && get().mode === 'demo') set({ demoVerified: true, profile: { ...profile, verification: 'verified' } });
      } else {
        const { error } = await requireSupabase().functions.invoke('verify-worker', { body: { aadhaar, eshram } });
        if (error) throw new Error('Verification service is unavailable. Your account remains locked. Please try again later.');
        await get().refreshProfile();
      }
    } catch (error) { set({ error: errorMessage(error) }); }
    finally { set({ busy: false }); }
  },
}), { name: 'localfix-demo-verification', storage: createJSONStorage(() => AsyncStorage), partialize: state => ({ demoVerified: state.demoVerified }) }));