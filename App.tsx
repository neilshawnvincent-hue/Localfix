import { DMSans_400Regular, DMSans_500Medium, DMSans_600SemiBold, DMSans_700Bold, useFonts } from '@expo-google-fonts/dm-sans';
import { Manrope_700Bold, Manrope_800ExtraBold } from '@expo-google-fonts/manrope';
import { NavigationContainer, type LinkingOptions, type NavigatorScreenParams } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { Component, useEffect, useState, type ErrorInfo, type ReactNode } from 'react';
import { ActivityIndicator, AppState, Platform, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Button, Copy, Heading, Logo, Notice } from './src/components/ui';
import { errorMessage, supabase } from './src/lib/supabase';
import { ActiveJob } from './src/screens/ActiveJob';
import { AuthScreen, VerificationScreen, WelcomeScreen } from './src/screens/AuthScreens';
import { Dashboard } from './src/screens/Dashboard';
import { useAuth } from './src/stores/auth';
import { useBookings } from './src/stores/bookings';

type WorkspaceRoutes = { Home: undefined; ActiveJob: { jobId: string } };
type RootRoutes = { Login: undefined; Signup: undefined; Welcome: undefined; Verify: undefined; Customer: NavigatorScreenParams<WorkspaceRoutes>; Worker: NavigatorScreenParams<WorkspaceRoutes> };
const Root = createNativeStackNavigator<RootRoutes>();
const Customer = createNativeStackNavigator<WorkspaceRoutes>();
const Worker = createNativeStackNavigator<WorkspaceRoutes>();
const linking: LinkingOptions<RootRoutes> = {
  prefixes: ['localfix://', ...(Platform.OS === 'web' && typeof window !== 'undefined' ? [window.location.origin] : [])],
  config: { screens: { Login: '', Signup: 'signup', Welcome: 'welcome', Verify: 'verify', Customer: { path: 'customer', screens: { Home: '', ActiveJob: 'bookings/:jobId' } }, Worker: { path: 'worker', screens: { Home: '', ActiveJob: 'jobs/:jobId' } } } },
};
function CustomerFlow() {
  return <Customer.Navigator screenOptions={{ headerShown: false, animation: 'fade' }}><Customer.Screen name="Home">{({ navigation }) => <Dashboard onJob={jobId => navigation.navigate('ActiveJob', { jobId })} />}</Customer.Screen><Customer.Screen name="ActiveJob">{({ route, navigation }) => <ActiveJob jobId={route.params.jobId} onBack={() => navigation.navigate('Home')} />}</Customer.Screen></Customer.Navigator>;
}
function WorkerFlow() {
  return <Worker.Navigator screenOptions={{ headerShown: false, animation: 'fade' }}><Worker.Screen name="Home">{({ navigation }) => <Dashboard onJob={jobId => navigation.navigate('ActiveJob', { jobId })} />}</Worker.Screen><Worker.Screen name="ActiveJob">{({ route, navigation }) => <ActiveJob jobId={route.params.jobId} onBack={() => navigation.navigate('Home')} />}</Worker.Screen></Worker.Navigator>;
}
function Application() {
  const [fontsLoaded, fontError] = useFonts({ DMSans_400Regular, DMSans_500Medium, DMSans_600SemiBold, DMSans_700Bold, Manrope_700Bold, Manrope_800ExtraBold });
  const { initialize, profile, mode, ready } = useAuth();
  const [syncError, setSyncError] = useState<string | null>(null);
  useEffect(() => initialize(), [initialize]);
  useEffect(() => {
    const listener = AppState.addEventListener('change', next => { if (next === 'active') supabase?.auth.startAutoRefresh(); else supabase?.auth.stopAutoRefresh(); });
    return () => listener.remove();
  }, []);
  useEffect(() => {
    useBookings.getState().clearLive();
    setSyncError(null);
    let active = true;
    if (mode === 'demo') {
      void useBookings.getState().seedDemo().catch(cause => { if (active) setSyncError(errorMessage(cause)); });
      const onStorage = (event: StorageEvent) => { if (event.key?.includes('localfix-demo-bookings')) void useBookings.persist.rehydrate(); };
      if (Platform.OS === 'web') window.addEventListener('storage', onStorage);
      return () => { active = false; if (Platform.OS === 'web') window.removeEventListener('storage', onStorage); };
    }
    if (!profile || !supabase || (profile.role === 'worker' && profile.verification !== 'verified')) return;
    const reload = () => { void useBookings.getState().refresh().then(() => { if (active) setSyncError(null); }).catch(cause => { if (active) setSyncError(errorMessage(cause)); }); };
    reload();
    const column = profile.role === 'customer' ? 'customer_id' : 'worker_id';
    const channel = supabase.channel(`bookings:${profile.id}`).on('postgres_changes', { event: '*', schema: 'public', table: 'jobs', filter: `${column}=eq.${profile.id}` }, reload).subscribe(state => { if (active && state === 'CHANNEL_ERROR') setSyncError('Live updates are disconnected. Pull down on the dashboard to refresh.'); });
    const foreground = AppState.addEventListener('change', state => { if (state === 'active') reload(); });
    return () => { active = false; foreground.remove(); void supabase?.removeChannel(channel); useBookings.getState().clearLive(); };
  }, [mode, profile]);
  if ((!fontsLoaded && !fontError) || !ready) return <View className="flex-1 items-center justify-center gap-5 bg-canvas"><Logo /><ActivityIndicator color="#287454" /><Copy className="text-xs text-muted">Getting your neighborhood ready...</Copy></View>;
  return <SafeAreaView className="flex-1 bg-white" edges={['top', 'bottom']}><StatusBar style="dark" />{syncError && <Notice message={syncError} />}<NavigationContainer key={`${mode ?? 'public'}:${profile?.id ?? 'guest'}:${profile?.verification ?? ''}`} linking={linking}><Root.Navigator screenOptions={{ headerShown: false, animation: 'fade' }}>{!profile ? <><Root.Screen name="Login">{({ navigation }) => <AuthScreen onSwitch={() => navigation.navigate('Signup')} onWelcome={() => navigation.navigate('Welcome')} />}</Root.Screen><Root.Screen name="Signup">{({ navigation }) => <AuthScreen signup onSwitch={() => navigation.navigate('Login')} onWelcome={() => navigation.navigate('Welcome')} />}</Root.Screen><Root.Screen name="Welcome">{({ navigation }) => <WelcomeScreen onContinue={() => navigation.navigate('Login')} />}</Root.Screen></> : profile.role === 'worker' && profile.verification !== 'verified' ? <Root.Screen name="Verify" component={VerificationScreen} /> : profile.role === 'customer' ? <Root.Screen name="Customer" component={CustomerFlow} /> : <Root.Screen name="Worker" component={WorkerFlow} />}</Root.Navigator></NavigationContainer></SafeAreaView>;
}
class ErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch(_error: Error, _info: ErrorInfo) {}
  render() { return this.state.failed ? <View className="flex-1 items-center justify-center gap-4 bg-canvas p-8"><Heading>Let&apos;s try that again.</Heading><Copy className="text-center text-muted">LocalFix could not display this screen. Your bookings have not been changed.</Copy><Button label="Return to sign in" onPress={() => { void useAuth.getState().logout(); this.setState({ failed: false }); }} /></View> : this.props.children; }
}
export default function App() { return <GestureHandlerRootView className="flex-1"><SafeAreaProvider><ErrorBoundary><Application /></ErrorBoundary></SafeAreaProvider></GestureHandlerRootView>; }