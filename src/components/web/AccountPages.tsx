import { useAuthStore } from '@/store/authStore';
import { useWebStore } from '@/store/webStore';
import { Redirect, useRouter } from 'expo-router';
import { useState } from 'react';
import { Action, Heading, Icon, NavLink, Notice } from './ui';

export function RolePage() {
  const auth = useAuthStore();
  const router = useRouter();
  const [role, setRole] = useState<'customer' | 'worker'>('customer');
  return <div className="lf-account"><Heading eyebrow="Welcome to LocalFix" title="Make yourself at home.">Choose your workspace to get started.</Heading><div className="lf-role-options">{([{ value: 'customer', title: 'I need a hand', detail: 'Book and manage services for your home.', icon: 'home-outline' }, { value: 'worker', title: 'I am a professional', detail: 'Find jobs, share quotes and manage your work.', icon: 'construct-outline' }] as const).map((item) => <label key={item.value} className="lf-role-option"><span><Icon name={item.icon} size={28} /><input type="radio" name="role" value={item.value} checked={role === item.value} onChange={() => setRole(item.value)} /></span><strong>{item.title}</strong><p>{item.detail}</p></label>)}</div><Action className="full" icon="arrow-forward" onClick={() => { if (auth.isLoggedIn) auth.logout(); auth.setRole(role); auth.setLanguage('en'); router.push('/(auth)/otp-login'); }}>Continue as {role === 'customer' ? 'customer' : 'professional'}</Action><Notice>This is a local demo. Both workspaces share bookings in this browser. No real services, identity checks or payments take place.</Notice><p className="lf-account-foot"><NavLink href="/">Back to services</NavLink></p></div>;
}

export function SignInPage() {
  const auth = useAuthStore();
  const draft = useWebStore((state) => state.draft);
  const router = useRouter();
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  if (!auth.hasHydrated) return <div className="lf-loading">Opening workspace...</div>;
  if (!auth.role) return <Redirect href="/(auth)/role-select" />;
  return <div className="lf-account"><Heading eyebrow={auth.role === 'worker' ? 'Professional workspace' : 'Customer workspace'} title="What should we call you?">A name for your demo appointments.</Heading><form onSubmit={(event) => {
    event.preventDefault();
    if (name.trim().length < 2) { setError('Enter a name with at least two characters.'); return; }
    auth.login(auth.role === 'worker' ? '9000000000' : '9000000001');
    useAuthStore.setState({ userName: name.trim(), isVerified: false });
    router.replace(auth.role === 'worker' ? '/(kyc)/verification' : draft.serviceId ? '/(customer)/booking' : '/(customer)/(tabs)/home');
  }}><label className="lf-field">Your name<input autoComplete="name" required minLength={2} maxLength={60} value={name} onChange={(event) => setName(event.target.value)} placeholder="Enter a demo name" /></label>{error && <Notice error>{error}</Notice>}<Notice>No phone number, password or OTP is needed. This is not a real account; data stays in this browser.</Notice><Action type="submit" className="full" icon="arrow-forward">Open demo workspace</Action></form><p className="lf-account-foot"><NavLink href="/(auth)/role-select">Choose a different role</NavLink></p></div>;
}

export function VerificationPage() {
  const auth = useAuthStore();
  const router = useRouter();
  const [accepted, setAccepted] = useState(false);
  if (auth.isVerified) return <Redirect href="/(worker)/(tabs)/home" />;
  return <div className="lf-account"><Heading eyebrow="Before you begin" title="Your professional workspace.">Appointments, job updates and earnings in one place.</Heading><Notice>Professional verification is not connected. Do not upload identity documents. Entering this workspace does not verify your identity or qualifications.</Notice><label className="lf-check"><input type="checkbox" checked={accepted} onChange={(event) => setAccepted(event.target.checked)} /><span>I understand this is a demo, and that the bookings and payments are simulated.</span></label><Action className="full" disabled={!accepted} icon="arrow-forward" onClick={() => { auth.verify(); router.replace('/(worker)/(tabs)/home'); }}>Enter professional demo</Action></div>;
}

export function ProfilePage() {
  const auth = useAuthStore();
  const store = useWebStore();
  const router = useRouter();
  const [name, setName] = useState(auth.userName);
  const [address, setAddress] = useState(store.savedAddress);
  const [message, setMessage] = useState('');
  const [confirm, setConfirm] = useState(false);
  return <><Heading eyebrow="The details that make it yours" title="My account">Your profile and saved address, in this browser.</Heading><div style={{ maxWidth: 650 }}><form onSubmit={(event) => { event.preventDefault(); if (name.trim().length < 2) return; useAuthStore.setState({ userName: name.trim() }); store.saveAddress(address.trim()); setMessage('Your profile has been saved.'); }}><section className="lf-form-section"><h2>Profile</h2><label className="lf-field">Your name<input required minLength={2} maxLength={60} value={name} onChange={(event) => setName(event.target.value)} autoComplete="name" /></label><label className="lf-field">Saved address<textarea minLength={10} maxLength={300} value={address} onChange={(event) => setAddress(event.target.value)} autoComplete="street-address" placeholder="Flat or house number, street, Bengaluru and PIN code" /></label><Action type="submit" icon="checkmark">Save changes</Action></section></form>{message && <Notice>{message}</Notice>}<section className="lf-form-section"><h2>Workspace</h2><p className="lf-lead">Bookings are shared between demo roles on this browser, not between real accounts. Signing out keeps your booking history.</p><div className="lf-form-actions" style={{ border: 0 }}><Action variant="secondary" icon="swap-horizontal-outline" onClick={() => { auth.logout(); router.replace('/(auth)/role-select'); }}>Switch workspace</Action><Action variant="quiet" icon="log-out-outline" onClick={() => { auth.logout(); router.replace('/'); }}>Sign out</Action></div></section><section className="lf-form-section"><h2>Demo data</h2>{confirm ? <div className="lf-confirm"><h3>Clear all bookings and saved addresses?</h3><p>This removes both workspaces' local bookings, ratings and earnings. It cannot be undone.</p><div><Action variant="secondary" onClick={() => setConfirm(false)}>Keep data</Action><Action variant="danger" icon="trash-outline" onClick={() => { store.reset(); setAddress(''); setConfirm(false); setMessage('Demo bookings, ratings and addresses have been cleared.'); }}>Clear demo data</Action></div></div> : <Action variant="danger" icon="trash-outline" onClick={() => setConfirm(true)}>Reset demo data</Action>}</section></div></>;
}

export function SupportPage() {
  const questions = [
    ['Is this a live booking service?', 'No. LocalFix currently runs as a demo. No professionals are dispatched, messages sent or payments collected. All job updates are simulated.'],
    ['What does the visit fee cover?', 'The INR 60 visit fee represents the appointment and assessment. The work quote is separate and must be approved before work begins. In this demo the visit fee is recorded when a booking is confirmed, without taking payment.'],
    ['Can I change or cancel an appointment?', 'You can edit the details before confirming. After confirmation, cancel the booking and create a new one if the schedule changes. Cancellation is available until work begins. The demo visit fee remains recorded after cancellation.'],
    ['How does a job move forward?', 'A professional accepts the booking, travels to the address, assesses the work and shares a quote. The customer approves it, the professional completes the work, and the customer makes a demo payment and leaves a rating.'],
    ['Where are my bookings stored?', 'Your demo profile, drafts and bookings are stored locally in this browser. Both roles share the same booking workspace. They are not synced to a server or another device, and clearing browser storage removes them.'],
    ['How can I contact support?', 'Live customer support is not connected in this demo. For a production deployment, a verified support contact and escalation process must be configured before accepting real bookings.'],
  ];
  return <><Heading eyebrow="A little guidance" title="Help & support">Answers about your appointments and demo workspace.</Heading><div style={{ maxWidth: 800 }}>{questions.map(([question, answer]) => <details key={question} className="lf-faq"><summary>{question}</summary><p>{answer}</p></details>)}<Notice>Do not enter sensitive personal or payment information into this demo.</Notice></div></>;
}