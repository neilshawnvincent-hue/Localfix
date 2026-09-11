import { useAuthStore } from '@/store/authStore';
import { useWebStore } from '@/store/webStore';
import { Redirect, usePathname, useRouter, useSegments, type Href } from 'expo-router';
import Head from 'expo-router/head';
import { useEffect, useRef, type ReactNode } from 'react';
import { Icon, NavLink, type IconName } from './ui';

export function Access({ role, children, verified = true }: { role: 'customer' | 'worker'; children: ReactNode; verified?: boolean }) {
  const auth = useAuthStore();
  const pathname = usePathname();
  const hydrated = useWebStore((state) => state.hydrated);
  if (!auth.hasHydrated || !hydrated) return <div className="lf-loading" role="status">Opening your workspace...</div>;
  if (!auth.isLoggedIn) return <Redirect href="/(auth)/role-select" />;
  if (auth.role !== role) return <Redirect href={auth.role === 'worker'
    ? pathname === '/jobs' ? '/(worker)/(tabs)/jobs' : '/(worker)/(tabs)/home'
    : pathname === '/jobs' ? '/(customer)/(tabs)/jobs' : '/(customer)/(tabs)/home'} />;
  if (role === 'worker' && verified && !auth.isVerified) return <Redirect href="/(kyc)/verification" />;
  return children;
}

export default function AppShell({ children }: { children: ReactNode }) {
  const auth = useAuthStore();
  const pathname = usePathname();
  const segments = useSegments();
  const router = useRouter();
  const mainRef = useRef<HTMLElement>(null);
  const isWorker = auth.isLoggedIn && auth.role === 'worker';
  const isAuth = segments[0] === '(auth)' || segments[0] === '(kyc)';
  const bookings = useWebStore((state) => state.bookings);
  const activeCount = bookings.filter((booking) => !['completed', 'cancelled'].includes(booking.status)).length;
  const navigation: { label: string; href: Href; icon: IconName; active: boolean }[] = isWorker ? [
    { label: 'Overview', href: '/(worker)/(tabs)/home', icon: 'grid-outline', active: pathname.endsWith('/home') },
    { label: 'My jobs', href: '/(worker)/(tabs)/jobs', icon: 'briefcase-outline', active: /jobs|execution|job-alert/.test(pathname) },
    { label: 'Earnings', href: '/(worker)/(tabs)/earnings', icon: 'wallet-outline', active: pathname.endsWith('/earnings') },
    { label: 'Help & support', href: '/(modals)/support', icon: 'chatbubble-ellipses-outline', active: pathname.endsWith('/support') },
  ] : [
    { label: 'Find a service', href: '/', icon: 'grid-outline', active: pathname === '/' || /catalog|home/.test(pathname) },
    { label: 'My bookings', href: '/(customer)/(tabs)/jobs', icon: 'calendar-outline', active: /jobs|active-job|job-detail|final-payment/.test(pathname) },
    { label: 'My account', href: '/(customer)/(tabs)/profile', icon: 'person-outline', active: pathname.endsWith('/profile') },
    { label: 'Help & support', href: '/(modals)/support', icon: 'chatbubble-ellipses-outline', active: pathname.endsWith('/support') },
  ];
  useEffect(() => {
    mainRef.current?.scrollTo(0, 0);
    mainRef.current?.focus({ preventScroll: true });
  }, [pathname]);
  function switchWorkspace() {
    auth.logout();
    router.replace('/(auth)/role-select');
  }
  return <div className="lf-app">
    <Head><title>LocalFix | Home services, sorted.</title><meta name="description" content="Book home repairs, schedule a professional, and manage every step in your LocalFix workspace." /></Head>
    <a className="lf-skip" href="#main-content">Skip to content</a>
    <header className="lf-header">
      <NavLink href={isWorker ? '/(worker)/(tabs)/home' : '/'} className="lf-brand"><span className="lf-brand-mark"><Icon name="construct" size={22} /></span>localfix<span className="lf-brand-dot">.</span></NavLink>
      <div className="lf-location"><Icon name="location-outline" size={18} /><span>Bengaluru <small>Service area</small></span></div>
      <div className="lf-header-right"><span className="lf-demo-label"><span />Demo workspace</span>{auth.isLoggedIn ? <button className="lf-user" onClick={switchWorkspace} title="Switch workspace" aria-label="Switch workspace"><span className="lf-avatar">{auth.userName.slice(0, 1).toUpperCase() || 'U'}</span><span>{auth.userName.split(' ')[0]}<small>{isWorker ? 'Professional' : 'Customer'}</small></span><Icon name="swap-horizontal-outline" size={18} /></button> : <NavLink href="/(auth)/role-select" className="lf-button secondary small">Get started<Icon name="arrow-forward" size={16} /></NavLink>}</div>
    </header>
    <div className={`lf-workspace ${isAuth ? 'account-mode' : ''}`}>
      {!isAuth && <aside className="lf-sidebar"><p className="lf-nav-caption">{isWorker ? 'PROFESSIONAL WORKSPACE' : 'YOUR HOME, TAKEN CARE OF'}</p><nav aria-label="Main navigation">{navigation.map((item) => <NavLink key={item.label} href={item.href} className={`lf-nav-item ${item.active ? 'active' : ''}`} aria-current={item.active ? 'page' : undefined}><Icon name={item.icon} /><span>{item.label}</span>{item.label === 'My bookings' && activeCount > 0 && <span className="lf-count">{activeCount}</span>}</NavLink>)}</nav><div className="lf-sidebar-bottom"><div className="lf-sidebar-art"><Icon name="home-outline" size={40} /><span className="lf-art-star">+</span></div><h3>A little help.<br />A lot more home.</h3><p>Everyday repairs, all in one place.</p><button className="lf-text-button" onClick={switchWorkspace}>{isWorker ? 'Book a home service' : 'Join as a professional'}<Icon name="arrow-forward" size={17} /></button><div className="lf-sidebar-footer">LOCALFIX <span>Made for your neighbourhood</span></div></div></aside>}
      <main id="main-content" ref={mainRef} tabIndex={-1} className="lf-main"><div className="lf-page">{children}</div><footer className="lf-footer"><span>LocalFix. Home services, sorted.</span><span>Demo only. No real bookings or charges.</span></footer></main>
    </div>
  </div>;
}