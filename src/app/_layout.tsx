import '@/lib/i18n';
import '../global.css';

import { useAuthStore } from '@/store/authStore';
import { Slot, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { View } from 'react-native';

export default function RootLayout() {
  const router = useRouter();
  const segments = useSegments();
  const { language, isLoggedIn, role, isVerified, hasHydrated } = useAuthStore();

  useEffect(() => {
    // Wait until we've checked for an existing Supabase session on boot.
    // Otherwise we redirect based on the default (logged-out) state and wipe
    // the user back to role-select on every refresh/restart.
    if (!hasHydrated) return;

    const inAuth = segments[0] === '(auth)';
    const inKyc = segments[0] === '(kyc)';
    const inCustomer = segments[0] === '(customer)';
    const inWorker = segments[0] === '(worker)';
    const inServices = segments[0] === '(services)';
    const inModals = segments[0] === '(modals)';

    const inCommon = inServices || inModals;

    if (!language) {
      if (!inAuth || segments[1] !== 'language-select') {
        router.replace('/(auth)/language-select');
      }
    } else if (!isLoggedIn) {
      // Not logged in → go to auth
      if (!inAuth) {
        router.replace('/(auth)/role-select');
      }
    } else if (role === 'worker' && !isVerified) {
      // Worker not KYC verified → go to verification
      if (!inKyc) {
        router.replace('/(kyc)/verification');
      }
    } else if (role === 'customer') {
      // Customer logged in → only allowed in customer + common sections.
      // Blocks a customer from reaching /(worker)/... via a direct URL.
      if (!inCustomer && !inCommon) {
        router.replace('/(customer)/(tabs)/home');
      }
    } else if (role === 'worker' && isVerified) {
      // Verified worker → only allowed in worker + common sections.
      // Blocks a worker from reaching /(customer)/... via a direct URL.
      if (!inWorker && !inCommon) {
        router.replace('/(worker)/(tabs)/home');
      }
    }
  }, [language, isLoggedIn, role, isVerified, hasHydrated, segments]);

  return (
    <View className="flex-1 bg-surface-dark">
      <StatusBar style="light" />
      <Slot />
    </View>
  );
}
