import { ServicesPage } from '@/components/web/CustomerPages';
import { useAuthStore } from '@/store/authStore';
import { Redirect } from 'expo-router';

export default function Index() {
  const auth = useAuthStore();
  if (!auth.hasHydrated) return <div className="lf-loading" role="status">Opening LocalFix...</div>;
  return auth.isLoggedIn && auth.role === 'worker' ? <Redirect href="/(worker)/(tabs)/home" /> : <ServicesPage />;
}