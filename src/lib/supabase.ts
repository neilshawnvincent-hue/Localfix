import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import 'react-native-url-polyfill/auto';

const secureStorage = {
  getItem: async (key: string) => {
    if (Platform.OS === 'web') return typeof sessionStorage !== 'undefined' ? sessionStorage.getItem(key) : null;
    const count = Number(await SecureStore.getItemAsync(`${key}.count`) ?? 0);
    if (!count) return null;
    const chunks = await Promise.all(Array.from({ length: count }, (_, index) => SecureStore.getItemAsync(`${key}.${index}`)));
    return chunks.some(chunk => chunk === null) ? null : chunks.join('');
  },
  setItem: async (key: string, value: string) => {
    if (Platform.OS === 'web') { sessionStorage.setItem(key, value); return; }
    const oldCount = Number(await SecureStore.getItemAsync(`${key}.count`) ?? 0);
    const chunks = value.match(/.{1,1500}/gs) ?? [];
    await Promise.all(chunks.map((chunk, index) => SecureStore.setItemAsync(`${key}.${index}`, chunk)));
    await SecureStore.setItemAsync(`${key}.count`, String(chunks.length));
    await Promise.all(Array.from({ length: Math.max(0, oldCount - chunks.length) }, (_, index) => SecureStore.deleteItemAsync(`${key}.${index + chunks.length}`)));
  },
  removeItem: async (key: string) => {
    if (Platform.OS === 'web') { sessionStorage.removeItem(key); return; }
    const count = Number(await SecureStore.getItemAsync(`${key}.count`) ?? 0);
    await Promise.all(Array.from({ length: count }, (_, index) => SecureStore.deleteItemAsync(`${key}.${index}`)));
    await SecureStore.deleteItemAsync(`${key}.count`);
  },
};

const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const key = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
export const supabase = url && key && /^https:\/\//.test(url)
  ? createClient(url, key, { auth: { storage: secureStorage, persistSession: true, autoRefreshToken: true, detectSessionInUrl: false } })
  : null;
export const demoEnabled = process.env.EXPO_PUBLIC_ENABLE_DEMO !== 'false';
export function requireSupabase() {
  if (!supabase) throw new Error('Mobile OTP sign-in is not configured. Add your Supabase environment variables or use Demo Mode.');
  return supabase;
}
export function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Something went wrong. Please try again.';
}