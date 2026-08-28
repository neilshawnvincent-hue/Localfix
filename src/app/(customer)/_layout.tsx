import { Stack } from 'expo-router';
import { useAuthStore } from '@/store/authStore';

export default function CustomerLayout() {
  const { hasHydrated, isLoggedIn, role } = useAuthStore();

  // Role guard: block rendering of customer screens for anyone who is not a
  // logged-in customer. This runs during render (before the root redirect
  // effect), so a worker hitting /(customer)/... via a direct URL never sees
  // the content.
  const isAuthorized = isLoggedIn && role === 'customer';

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
