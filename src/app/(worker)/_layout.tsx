import { Stack } from 'expo-router';
import { useAuthStore } from '@/store/authStore';

export default function WorkerLayout() {
  const { hasHydrated, isLoggedIn, role, isVerified } = useAuthStore();

  // Role guard: block rendering of worker screens for anyone who is not a
  // verified worker. This runs during render (before the root redirect effect),
  // so a customer hitting /(worker)/... via a direct URL never sees the content.
  const isAuthorized = isLoggedIn && role === 'worker' && isVerified;

  if (!hasHydrated || !isAuthorized) {
    return null;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#0F172A' },
        animation: 'slide_from_right',
      }}
    />
  );
}
