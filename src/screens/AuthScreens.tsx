import { ArrowLeft, ArrowRight, BriefcaseBusiness, Check, House, MessageSquare, ShieldCheck, Sparkles } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { ImageBackground, KeyboardAvoidingView, Platform, Pressable, ScrollView, View, useWindowDimensions } from 'react-native';
import { Avatar, Badge, Button, Copy, Field, Heading, Logo, Notice, RoleBadge, TrustLine } from '../components/ui';
import type { Role } from '../domain/marketplace';
import { demoEnabled } from '../lib/supabase';
import { useAuth } from '../stores/auth';

export function AuthScreen({ signup = false, onSwitch, onWelcome }: { signup?: boolean; onSwitch: () => void; onWelcome: () => void }) {
  const { width } = useWindowDimensions();
  const wide = width >= 1000;
  const [mobile, setMobile] = useState('');
  const [token, setToken] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<Role>('customer');
  const [message, setMessage] = useState<string | null>(null);
  const [now, setNow] = useState(Date.now());
  const { busy, error, pendingPhone, resendAt, requestOtp, verifyOtp, resetOtp, loginDemo, clearError } = useAuth();
  const remaining = Math.max(0, Math.ceil((resendAt - now) / 1000));
  useEffect(() => {
    if (!resendAt) return;
    setNow(Date.now());
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [resendAt]);
  const sendCode = async () => {
    setMessage(null); clearError();
    const sent = await requestOtp(pendingPhone ?? mobile, signup ? { name, role } : undefined);
    if (sent) { setToken(''); setMessage('OTP sent by SMS.'); }
  };
  const submit = async () => {
    if (pendingPhone) { setMessage(null); clearError(); await verifyOtp(token); }
    else await sendCode();
  };
  return <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1 bg-canvas"><View className="flex-1 flex-row">
    {wide && <ImageBackground source={{ uri: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1500&auto=format&fit=crop&q=85' }} className="w-[47%] bg-primary" resizeMode="cover"><View className="flex-1 justify-between bg-black/35 p-12"><Logo light /><View className="gap-6"><View className="self-start rounded border border-white/40 bg-white/10 px-3 py-1"><Copy className="font-medium text-xs text-white">YOUR NEIGHBORHOOD. YOUR PEOPLE.</Copy></View><Heading className="max-w-lg text-[48px] leading-[58px] text-white">A little help.{ '\n' }A lot closer.</Heading><Copy className="max-w-sm text-[17px] leading-7 text-white/90">Good homes are built on good connections. Find yours, right around the corner.</Copy><View className="mt-3 flex-row items-center gap-3"><View className="flex-row"><Avatar name="Rajesh" uri="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=faces" /><Avatar name="Meera" uri="https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&h=100&fit=crop&crop=faces" /></View><View><Copy className="font-semibold text-white">Local skills. Shared trust.</Copy><Copy className="text-xs text-white/80">A stronger community starts at home.</Copy></View></View></View><View className="flex-row items-center gap-2"><ShieldCheck size={17} color="white" /><Copy className="text-xs text-white/90">Community-first. Always.</Copy></View></View></ImageBackground>}
    <ScrollView className="flex-1" keyboardShouldPersistTaps="handled" contentContainerClassName="flex-grow justify-center px-6 py-8 md:px-12"><View className="mx-auto w-full max-w-[420px] gap-6">
      {!wide && <View className="mb-4"><Logo /></View>}
      <View className="gap-2"><Copy className="font-semibold text-xs text-primary">GOOD HELP, CLOSE TO HOME</Copy><Heading className="text-[32px] leading-[42px]">{signup ? 'Make yourself at home.' : 'Welcome to the neighborhood.'}</Heading><Copy className="text-muted">{signup ? 'Join a community that looks out for each other.' : 'Sign in. Your community is here for you.'}</Copy></View>
      {signup && !pendingPhone && <View className="gap-4"><Field label="Full name" placeholder="Your full name" autoComplete="name" value={name} onChangeText={setName} editable={!busy} /><View className="flex-row gap-3">{(['customer', 'worker'] as const).map(option => <Pressable key={option} accessibilityRole="radio" accessibilityState={{ checked: role === option, disabled: busy }} disabled={busy} onPress={() => setRole(option)} className={`flex-1 flex-row items-center justify-center gap-2 rounded-lg border p-3 ${role === option ? 'border-primary bg-mint' : 'border-line bg-white'}`}><Copy className="font-semibold text-[13px]">{option === 'customer' ? 'Find help' : 'Offer services'}</Copy>{role === option && <Check size={14} color="#287454" />}</Pressable>)}</View></View>}
      {pendingPhone ? <View className="gap-4"><Copy className="font-semibold">{pendingPhone}</Copy><Field label="SMS OTP" placeholder="6-digit code" autoComplete="sms-otp" textContentType="oneTimeCode" keyboardType="number-pad" value={token} onChangeText={value => setToken(value.replace(/\D/g, '').slice(0, 6))} maxLength={6} editable={!busy} onSubmitEditing={() => void submit()} /><Button label="Change mobile number" variant="ghost" icon={ArrowLeft} disabled={busy} onPress={() => { resetOtp(); setToken(''); setMessage(null); }} /></View> : <Field label="Mobile number (+91)" placeholder="10-digit mobile number" autoComplete="tel" textContentType="telephoneNumber" keyboardType="phone-pad" value={mobile} onChangeText={setMobile} maxLength={20} editable={!busy} onSubmitEditing={() => void submit()} />}
      <Notice message={error} /><Notice message={message} kind="success" />
      <Button label={pendingPhone ? 'Verify OTP & continue' : remaining ? `Send OTP in ${remaining}s` : 'Send OTP'} icon={pendingPhone ? ShieldCheck : MessageSquare} loading={busy} disabled={pendingPhone ? token.length !== 6 : remaining > 0} onPress={() => void submit()} />
      {pendingPhone && <Button label={remaining ? `Resend OTP in ${remaining}s` : 'Resend OTP'} variant="secondary" disabled={busy || remaining > 0} onPress={() => void sendCode()} />}
      <View className="flex-row flex-wrap items-center justify-center gap-1"><Copy className="text-[13px] text-muted">{signup ? 'Already a neighbor?' : 'New around here?'}</Copy><Pressable accessibilityRole="button" disabled={busy} accessibilityState={{ disabled: busy }} onPress={() => { resetOtp(); setToken(''); setMessage(null); onSwitch(); }} className="min-h-11 justify-center"><Copy className="font-semibold text-[13px] text-primary">{signup ? 'Sign in' : 'Create an account'}</Copy></Pressable></View>
      {!signup && demoEnabled && <View className="gap-4 border-t border-line pt-5"><View className="flex-row items-center justify-between"><View className="flex-row items-center gap-2"><Sparkles size={16} color="#287454" /><Copy className="font-bold text-[13px]">Hackathon Demo Mode</Copy></View><Badge label="NO SIGNUP" /></View><View className="flex-row gap-3"><Button testID="demo-customer" label="Demo customer" icon={House} variant="secondary" className="flex-1 px-2" onPress={() => void loginDemo('customer')} /><Button testID="demo-worker" label="Demo worker" icon={BriefcaseBusiness} variant="secondary" className="flex-1 px-2" onPress={() => void loginDemo('worker')} /></View><Copy className="text-center text-[11px] leading-4 text-muted">Sample accounts. Simulated verification and payments.</Copy></View>}
      <TrustLine /><Pressable accessibilityRole="button" disabled={busy} onPress={() => { resetOtp(); onWelcome(); }}><Copy className="text-center text-xs text-muted underline">Meet LocalFix</Copy></Pressable>
    </View></ScrollView>
  </View></KeyboardAvoidingView>;
}

export function WelcomeScreen({ onContinue }: { onContinue: () => void }) {
  return <ImageBackground className="flex-1 bg-primary" source={{ uri: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1800&auto=format&fit=crop&q=85' }}><View className="flex-1 justify-between bg-black/40 p-8 md:p-16"><Logo light /><View className="max-w-xl gap-6"><Heading className="text-[42px] leading-[52px] text-white">LocalFix</Heading><Copy className="text-xl text-white">A good neighbor for every home.</Copy><Copy className="text-base leading-7 text-white/90">Find skilled local professionals within 5 kilometers. A helping hand, a fair opportunity, and a community that grows together.</Copy><Button label="Join the neighborhood" icon={ArrowRight} onPress={onContinue} /></View><Copy className="text-white/80">Rooted in trust. Powered by people.</Copy></View></ImageBackground>;
}

export function VerificationScreen() {
  const { profile, mode, busy, error, verify, logout, refreshProfile } = useAuth();
  const [aadhaar, setAadhaar] = useState('');
  const [eshram, setEshram] = useState('');
  const [consent, setConsent] = useState(false);
  const submit = async () => { await verify(aadhaar, eshram); setAadhaar(''); setEshram(''); };
  return <KeyboardAvoidingView className="flex-1 bg-canvas" behavior={Platform.OS === 'ios' ? 'padding' : undefined}><ScrollView keyboardShouldPersistTaps="handled" contentContainerClassName="flex-grow items-center justify-center p-6"><View className="w-full max-w-lg gap-6"><Logo /><View className="mt-4 flex-row items-center justify-between"><RoleBadge role="worker" /><Badge label={mode === 'demo' ? 'DEMO VERIFICATION' : 'IDENTITY CHECK'} tone="amber" /></View><View className="h-16 w-16 items-center justify-center rounded-lg bg-mint"><ShieldCheck size={32} color="#287454" /></View><View className="gap-2"><Heading className="text-[30px] leading-10">A community built on trust.</Heading><Copy className="text-muted">Hi {profile?.name.split(' ')[0]}. Verify your identity before accepting your first job.</Copy></View>
    {profile?.verification === 'pending' ? <><Notice message="Your identity review is pending. You will gain dashboard access only after approval." kind="info" /><Button label="Check verification status" onPress={() => void refreshProfile()} loading={busy} /></> : <><Field label="Aadhaar number" placeholder="12-digit Aadhaar number" value={aadhaar} onChangeText={value => setAadhaar(value.replace(/\D/g, '').slice(0, 12))} secureTextEntry keyboardType="number-pad" maxLength={12} /><Field label="UAM / e-Shram number (UAN)" placeholder="12-digit e-Shram UAN" value={eshram} onChangeText={value => setEshram(value.replace(/\D/g, '').slice(0, 12))} keyboardType="number-pad" maxLength={12} /><Copy className="text-xs text-muted">e-Shram issues a 12-digit UAN. This is different from a business Udyog Aadhaar Memorandum (UAM).</Copy>{mode === 'demo' && <Notice kind="info" message="Simulation only. Use Aadhaar 234567890123 and e-Shram 123456789012. Do not enter real government IDs in this demo." />}<Pressable accessibilityRole="checkbox" accessibilityState={{ checked: consent }} onPress={() => setConsent(!consent)} className="flex-row items-start gap-3 py-2"><View className={`h-5 w-5 items-center justify-center rounded border ${consent ? 'border-primary bg-primary' : 'border-muted'}`}>{consent && <Check size={14} color="white" />}</View><Copy className="flex-1 text-xs leading-5 text-muted">I consent to this identity check. My identifiers will not be saved on this device.</Copy></Pressable><Button label={busy ? 'Checking identity...' : 'Verify my identity'} icon={ShieldCheck} disabled={!consent || aadhaar.length !== 12 || eshram.length !== 12} loading={busy} onPress={() => void submit()} /></>}
    <Notice message={error} /><Button label="Back to sign in" variant="ghost" icon={ArrowLeft} onPress={() => void logout()} /></View></ScrollView></KeyboardAvoidingView>;
}