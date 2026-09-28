import { ArrowLeft, ArrowRight, BriefcaseBusiness, Check, House, MessageSquare, ShieldCheck, Sparkles } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { ImageBackground, KeyboardAvoidingView, Platform, Pressable, ScrollView, View, useWindowDimensions } from 'react-native';
import { Avatar, Badge, Button, Copy, Field, Heading, Logo, Notice, RoleBadge, TrustLine } from '../components/ui';
import type { Role } from '../domain/marketplace';
import { demoEnabled } from '../lib/supabase';
import { useAuth } from '../stores/auth';

export function AuthScreen({ signup: _signup = false, onSwitch: _onSwitch, onWelcome: _onWelcome }: { signup?: boolean; onSwitch: () => void; onWelcome: () => void }) {
  const { width } = useWindowDimensions();
  const wide = width >= 1000;
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [mobile, setMobile] = useState('9876543210');
  const [token, setToken] = useState('0000');
  const [localError, setLocalError] = useState<string | null>(null);
  const { busy, error, loginDemo } = useAuth();

  const handleLogin = () => {
    if (token !== '0000') {
      setLocalError('Invalid OTP. Please use 0000 for the prototype.');
      return;
    }
    setLocalError(null);
    if (selectedRole) {
      void loginDemo(selectedRole);
    }
  };

  return <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1 bg-canvas"><View className="flex-1 flex-row">
    {wide && <ImageBackground source={{ uri: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1500&auto=format&fit=crop&q=85' }} className="w-[47%] bg-primary" resizeMode="cover"><View className="flex-1 justify-between bg-black/35 p-12"><Logo light /><View className="gap-6"><View className="self-start rounded border border-white/40 bg-white/10 px-3 py-1"><Copy className="font-medium text-xs text-white">INTERACTIVE PROTOTYPE</Copy></View><Heading className="max-w-lg text-[48px] leading-[58px] text-white">Good help.{ '\n' }Close to home.</Heading><Copy className="max-w-sm text-[17px] leading-7 text-white/90">A cross-platform hyperlocal gig services app. Instant problem matching, dual identity verification, and OTP-driven escrow payments.</Copy><View className="mt-3 flex-row items-center gap-3"><View className="flex-row"><Avatar name="Customer" /><Avatar name="Worker" /></View><View><Copy className="font-semibold text-white">5 km Geofence Matching</Copy><Copy className="text-xs text-white/80">Select a role below to start.</Copy></View></View></View><View className="flex-row items-center gap-2"><ShieldCheck size={17} color="white" /><Copy className="text-xs text-white/90">SIH 2026 Prototype</Copy></View></View></ImageBackground>}
    <ScrollView className="flex-1" keyboardShouldPersistTaps="handled" contentContainerClassName="flex-grow justify-center px-6 py-8 md:px-12"><View className="mx-auto w-full max-w-[440px] gap-6">
      <View className="mb-2"><Logo /></View>
      <View className="gap-2">
        <View className="flex-row items-center gap-2"><Sparkles size={16} color="#287454" /><Copy className="font-semibold text-xs text-primary">LOCALFIX DEMO MODE</Copy></View>
        <Heading className="text-[24px] leading-[30px] md:text-[32px] md:leading-[40px]">{selectedRole ? `Sign in as ${selectedRole === 'customer' ? 'Customer' : 'Worker'}` : 'Select your role to begin'}</Heading>
        <Copy className="text-muted">{selectedRole ? 'Enter your mobile number to receive an OTP.' : 'Explore the end-to-end prototype from either perspective:'}</Copy>
      </View>

      {!selectedRole ? (
        <View className="gap-4">
          <Pressable accessibilityRole="button" onPress={() => setSelectedRole('customer')} className="rounded-xl border border-line bg-white p-4 hover:border-primary transition-all md:p-5">
              <View className="flex-row items-center gap-2.5 md:gap-3">
                <View className="h-10 w-10 items-center justify-center rounded-lg bg-primary md:h-12 md:w-12">
                  <House size={20} color="white" />
              </View>
                <View className="flex-1">
                  <Heading className="text-base md:text-lg">Demo Customer</Heading>
                  <Copy className="text-[10px] text-muted md:text-xs">Click a problem & hire a local verified worker</Copy>
                </View>
                <ArrowRight size={18} color="#287454" />
              </View>
          </Pressable>

          <Pressable accessibilityRole="button" onPress={() => setSelectedRole('worker')} className="rounded-xl border border-line bg-white p-4 hover:border-primary transition-all md:p-5">
              <View className="flex-row items-center gap-2.5 md:gap-3">
                <View className="h-10 w-10 items-center justify-center rounded-lg bg-[#EAEFEA] md:h-12 md:w-12">
                  <BriefcaseBusiness size={20} color="#287454" />
              </View>
                <View className="flex-1">
                  <Heading className="text-base md:text-lg">Demo Worker</Heading>
                  <Copy className="text-[10px] text-muted md:text-xs">Accept assigned jobs & unlock with start code</Copy>
                </View>
                <ArrowRight size={18} color="#7A8981" />
              </View>
          </Pressable>
        </View>
      ) : (
        <View className="gap-4">
          <Field label="Mobile number" placeholder="Enter mobile number" value={mobile} onChangeText={setMobile} keyboardType="phone-pad" />
          <Field label="OTP Code" placeholder="Enter OTP (0000)" value={token} onChangeText={setToken} keyboardType="number-pad" />
          <Notice kind="info" message="For this prototype, please use OTP: 0000" />
          <Button label="Login securely" loading={busy} onPress={handleLogin} />
          <Button label="Back to role selection" variant="ghost" onPress={() => setSelectedRole(null)} />
        </View>
      )}

      <Notice message={error || localError} />

      <TrustLine />
    </View></ScrollView>
  </View></KeyboardAvoidingView>;
}

export function WelcomeScreen({ onContinue }: { onContinue: () => void }) {
  return <ImageBackground className="flex-1 bg-primary" source={{ uri: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1800&auto=format&fit=crop&q=85' }}><View className="flex-1 justify-between bg-black/40 p-6 md:p-16"><Logo light /><View className="max-w-xl gap-4 md:gap-6"><Heading className="text-[30px] leading-[38px] text-white md:text-[42px] md:leading-[52px]">LocalFix</Heading><Copy className="text-base text-white md:text-xl">A good neighbor for every home.</Copy><Copy className="text-[13px] leading-6 text-white/90 md:text-base md:leading-7">Find skilled local professionals within 5 kilometers. A helping hand, a fair opportunity, and a community that grows together.</Copy><Button label="Enter Demo" icon={ArrowRight} onPress={onContinue} /></View><Copy className="text-[12px] text-white/80 md:text-[14px]">Rooted in trust. Powered by people.</Copy></View></ImageBackground>;
}

export function VerificationScreen() {
  const { profile, mode, busy, error, verify, logout } = useAuth();
  const [aadhaar, setAadhaar] = useState('234567890123');
  const [eshram, setEshram] = useState('123456789012');
  const [consent, setConsent] = useState(true);
  const submit = async () => { await verify(aadhaar, eshram); };
  return <KeyboardAvoidingView className="flex-1 bg-canvas" behavior={Platform.OS === 'ios' ? 'padding' : undefined}><ScrollView keyboardShouldPersistTaps="handled" contentContainerClassName="flex-grow items-center justify-center p-6"><View className="w-full max-w-lg gap-6"><Logo /><View className="mt-4 flex-row items-center justify-between"><RoleBadge role="worker" /><Badge label={mode === 'demo' ? 'DEMO VERIFICATION' : 'IDENTITY CHECK'} tone="amber" /></View><View className="h-16 w-16 items-center justify-center rounded-lg bg-mint"><ShieldCheck size={32} color="#287454" /></View><View className="gap-2"><Heading className="text-[30px] leading-10">Worker Verification</Heading><Copy className="text-muted">Hi {profile?.name.split(' ')[0]}. In this prototype, any Aadhaar and e-Shram number is accepted.</Copy></View>
    <Field label="Aadhaar number" placeholder="Any number (e.g. 234567890123)" value={aadhaar} onChangeText={setAadhaar} keyboardType="number-pad" />
    <Field label="UAM / e-Shram number (UAN)" placeholder="Any number (e.g. 123456789012)" value={eshram} onChangeText={setEshram} keyboardType="number-pad" />
    <Pressable accessibilityRole="checkbox" accessibilityState={{ checked: consent }} onPress={() => setConsent(!consent)} className="flex-row items-start gap-3 py-2"><View className={`h-5 w-5 items-center justify-center rounded border ${consent ? 'border-primary bg-primary' : 'border-muted'}`}>{consent && <Check size={14} color="white" />}</View><Copy className="flex-1 text-xs leading-5 text-muted">I consent to this prototype identity check.</Copy></Pressable>
    <Button label={busy ? 'Verifying...' : 'Verify & Continue to Dashboard'} icon={ShieldCheck} loading={busy} onPress={() => void submit()} />
    <Notice message={error} /><Button label="Back to sign in" variant="ghost" icon={ArrowLeft} onPress={() => void logout()} /></View></ScrollView></KeyboardAvoidingView>;
}