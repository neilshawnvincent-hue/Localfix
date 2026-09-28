import { ArrowLeft, ArrowUpRight, CalendarDays, CheckCheck, LockKeyhole, MapPin, ShieldCheck, Wallet, Volume2 } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { Linking, ScrollView, Text, TextInput, View } from 'react-native';
import { Avatar, Badge, Button, Copy, EmptyState, Heading, Logo, Notice, Panel, Sheet, SOSButton, Timeline } from '../components/ui';
import { professionals } from '../data/demo';
import { canViewJob, money, statusLabels } from '../domain/marketplace';
import { errorMessage, requireSupabase } from '../lib/supabase';
import { useAuth } from '../stores/auth';
import { useBookings } from '../stores/bookings';

export function ActiveJob({ jobId, onBack }: { jobId: string; onBack: () => void }) {
  const { profile, mode } = useAuth();
  const { demoJobs, liveJobs, startCode, endCode, transition } = useBookings();
  const demo = mode === 'demo';
  const job = (demo ? demoJobs : liveJobs).find(item => item.id === jobId);
  const [code, setCode] = useState('');
  const [eCode, setECode] = useState('');
  const [entered, setEntered] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [confirm, setConfirm] = useState<'complete' | 'cancel' | null>(null);
  const customer = profile?.role === 'customer';
  useEffect(() => {
    let alive = true;
    setCode('');
    if (profile && customer && job && ['approved'].includes(job.status)) startCode(job.id, profile, demo).then(value => { if (alive) setCode(value); }).catch(cause => { if (alive) setError(errorMessage(cause)); });
    if (profile && customer && job && ['in_progress'].includes(job.status)) endCode(job.id, profile, demo).then(value => { if (alive) setECode(value); }).catch(cause => { if (alive) setError(errorMessage(cause)); });
    return () => { alive = false; };
  }, [job, customer, profile, demo, startCode, endCode]);
  if (!profile || !job || !canViewJob(job, profile)) return <View className="flex-1 justify-center bg-canvas p-6"><EmptyState title="Booking unavailable" description="This booking does not exist or is not assigned to your account." action={<Button label="Back to overview" onPress={onBack} />} /></View>;
  const active = !['completed', 'cancelled'].includes(job.status);
  const runAction = async (action: 'accept' | 'start' | 'complete' | 'cancel' | 'quote' | 'customer_accept' | 'simulate_worker_start' | 'simulate_worker_end', amount?: number) => {
    setBusy(true); setError(null);
    try { await transition(job.id, action, profile, demo, entered, amount); setEntered(''); setConfirm(null); } catch (cause) { setError(errorMessage(cause)); } finally { setBusy(false); }
  };
  const recordSOS = async () => { if (!demo) { const { error: failure } = await requireSupabase().from('safety_alerts').insert({ job_id: job.id, user_id: profile.id }); if (failure) throw failure; } };
  const playAudio = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const text = `Job: ${job.title}. Location: ${job.address}. Description: ${job.description || 'No additional details'}.`;
      const utterance = new window.SpeechSynthesisUtterance(text);
      window.speechSynthesis.speak(utterance);
    } else {
      setError('Text-to-speech is not supported on this device.');
    }
  };
  return <View className="flex-1 bg-canvas"><View className="flex-row items-center justify-between border-b border-line bg-white px-4 py-3 md:px-10 md:py-4"><Logo /><Button label="Overview" variant="ghost" icon={ArrowLeft} onPress={onBack} /></View><ScrollView keyboardShouldPersistTaps="handled" contentContainerClassName="px-4 py-5 md:px-10 md:py-8"><View className="mx-auto w-full max-w-[1000px] gap-4 md:gap-6"><View className="flex-row flex-wrap items-center justify-between gap-2 md:gap-3"><View className="gap-1 md:gap-2"><Copy className="text-[10px] text-muted md:text-xs">YOUR BOOKING / {job.id}</Copy><Heading className="text-[22px] leading-[28px] md:text-[30px] md:leading-10">{job.title}</Heading></View><Badge label={statusLabels[job.status]} tone={job.status === 'accepted' ? 'amber' : 'green'} /></View>
    <View className="flex-col gap-4 md:flex-row md:gap-6"><View className="flex-1 gap-4 md:gap-5"><Panel className="gap-4 p-4 md:gap-5 md:p-6"><View className="flex-row items-center gap-3 md:gap-4"><Avatar large name={customer ? 'Technician' : job.customerName} /><View className="flex-1 gap-0.5 md:gap-1"><Heading className="text-base md:text-xl">{customer ? `Assigned ${job.category} Technician` : job.customerName}</Heading><Copy className="text-[11px] text-muted md:text-xs">{customer ? 'Verified 5 km local professional' : 'Your customer'}</Copy>{customer && <Badge label={demo ? 'Demo verified' : 'Identity verified'} icon />}</View></View><View className="gap-3 border-t border-line pt-4 md:gap-4 md:pt-5"><View className="flex-row items-start gap-2 md:gap-3"><MapPin size={16} color="#7A8981" /><Copy className="flex-1 text-[12px] md:text-[14px]">{job.address}</Copy></View><View className="flex-row items-center gap-2 md:gap-3"><CalendarDays size={16} color="#7A8981" /><Copy className="text-[12px] md:text-[14px]">{new Date(job.scheduledAt).toLocaleString('en-IN', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}</Copy></View><Copy className="text-[12px] text-muted md:text-[14px]">{job.description || 'No additional details provided.'}</Copy>{!customer && <View className="flex-row flex-wrap items-center gap-2"><Button label="Read Aloud (TTS)" variant="secondary" icon={Volume2} onPress={playAudio} /><Button label="Open directions" variant="secondary" icon={ArrowUpRight} onPress={() => { void Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(job.address)}`).catch(() => setError('Unable to open maps. Please use the address above.')); }} /></View>}</View></Panel>
    {active && <View className="gap-3 rounded-lg border border-[#CDDCD0] bg-mint p-4 md:gap-4 md:p-6">
      
      {job.status === 'requested' && (customer ? <>
        <View className="flex-row items-center gap-2"><CalendarDays size={18} color="#287454" /><Heading className="text-base md:text-lg">Waiting for worker</Heading></View>
        <Copy className="text-[12px] text-muted md:text-[13px]">Your request has been sent. The non-refundable ₹50 convenience fee has been paid. Waiting for the professional to accept and travel to your location.</Copy>
        <View className="border-t border-[#CDDCD0] pt-4"><Button label="Simulate Worker Acceptance" variant="secondary" loading={busy} onPress={() => void runAction('accept')} /></View>
      </> : <>
        <View className="flex-row items-center gap-2"><CalendarDays size={18} color="#287454" /><Heading className="text-base md:text-lg">New Request</Heading></View>
        <Copy className="text-[12px] text-muted md:text-[13px]">Review this request. If you are available, accept it and start traveling to the customer's location.</Copy>
        <Button label="Accept Job & Start Travel" loading={busy} onPress={() => void runAction('accept')} />
      </>)}

      {job.status === 'accepted' && (customer ? <>
        <View className="flex-row items-center gap-2"><MapPin size={18} color="#287454" /><Heading className="text-base md:text-lg">Worker on the way</Heading></View>
        <Copy className="text-[12px] text-muted md:text-[13px]">The professional has accepted your request and is heading to your location. They will inspect the problem and provide a quote.</Copy>
        <View className="border-t border-[#CDDCD0] pt-4"><Button label="Simulate Worker Arrival & Quote" variant="secondary" loading={busy} onPress={() => void runAction('quote', 400)} /></View>
      </> : <>
        <View className="flex-row items-center gap-2"><MapPin size={18} color="#287454" /><Heading className="text-base md:text-lg">You are on the way</Heading></View>
        <Copy className="text-[12px] text-muted md:text-[13px]">Travel to the customer's location. Once you arrive and inspect the problem, provide a service quote.</Copy>
        <Button label="Arrived: Provide Quote" loading={busy} onPress={() => void runAction('quote', 400)} />
      </>)}

      {job.status === 'quoted' && (customer ? <>
        <View className="flex-row items-center gap-2"><Wallet size={18} color="#287454" /><Heading className="text-base md:text-lg">Quote received</Heading></View>
        <Copy className="text-[12px] md:text-[13px]">The worker has inspected the problem and quoted <Copy className="font-bold text-primary">{money(job.amount)}</Copy> for this job.</Copy>
        <Button label="Approve Quote & Hire" loading={busy} onPress={() => void runAction('customer_accept')} />
      </> : <>
        <View className="flex-row items-center gap-2"><Wallet size={18} color="#287454" /><Heading className="text-base md:text-lg">Quote sent</Heading></View>
        <Copy className="text-[12px] text-muted md:text-[13px]">Waiting for customer to accept your quote of {money(job.amount)}.</Copy>
      </>)}

      {job.status === 'approved' && (customer ? <>
        <View className="flex-row items-center gap-2"><LockKeyhole size={18} color="#287454" /><Heading className="text-base md:text-lg">Your Secure Start Code</Heading></View>
        <Copy className="text-[11px] text-muted md:text-[13px]">Share this code with your technician so they can begin the work.</Copy>
        <View testID="start-code" accessibilityLabel={`Secure Start Code ${code}`} className="flex-row justify-center gap-2 py-2 md:gap-3 md:py-3">{(code || '1234').split('').map((digit, index) => <View key={index} className="h-[56px] w-[44px] items-center justify-center rounded-lg border border-[#CDDCD0] bg-white md:h-[72px] md:w-[56px]"><Text className="font-displaybold text-[26px] text-primary md:text-[34px]">{digit}</Text></View>)}</View>
        <View className="flex-row items-center justify-center gap-2"><ShieldCheck size={13} color="#287454" /><Copy className="text-[10px] text-primary md:text-xs">Work stays locked until your code is confirmed.</Copy></View>
        <View className="border-t border-[#CDDCD0] pt-4"><Button label="Simulate Worker Start" variant="secondary" loading={busy} onPress={() => void runAction('simulate_worker_start')} /></View>
      </> : <>
        <View className="flex-row items-center gap-2"><LockKeyhole size={18} color="#287454" /><Heading className="text-base md:text-lg">Secure job start</Heading></View>
        <Copy className="text-[11px] text-muted md:text-[13px]">The quote is approved! Enter the customer's Secure Start Code (any number works in this prototype) to begin work:</Copy>
        <TextInput testID="worker-start-code" accessibilityLabel="Customer Secure Start Code" placeholder="Enter code (e.g. 1212)" placeholderTextColor="#AAB9AE" value={entered} onChangeText={setEntered} keyboardType="number-pad" autoComplete="off" className="h-[56px] rounded-lg border border-[#CDDCD0] bg-white px-4 text-center font-displaybold text-[24px] text-primary md:h-[72px] md:px-5 md:text-[32px]" />
        <Button label="Verify code & start job" icon={LockKeyhole} loading={busy} onPress={() => void runAction('start')} />
      </>)}

      {job.status === 'in_progress' && (customer ? <>
        <View className="flex-row items-center gap-2"><CheckCheck size={18} color="#287454" /><Heading className="text-base md:text-lg">Your Completion Code</Heading></View>
        <Copy className="text-[11px] text-muted md:text-[13px]">Work is underway. Share this Completion Code when the work is fully completed to your satisfaction.</Copy>
        <View testID="end-code" accessibilityLabel={`Completion Code ${eCode}`} className="flex-row justify-center gap-2 py-2 md:gap-3 md:py-3">{(eCode || '5678').split('').map((digit, index) => <View key={index} className="h-[56px] w-[44px] items-center justify-center rounded-lg border border-[#CDDCD0] bg-white md:h-[72px] md:w-[56px]"><Text className="font-displaybold text-[26px] text-primary md:text-[34px]">{digit}</Text></View>)}</View>
        <View className="border-t border-[#CDDCD0] pt-4"><Button label="Confirm Work Completed" variant="secondary" loading={busy} onPress={() => void runAction('simulate_worker_end')} /></View>
      </> : <>
        <View className="flex-row items-center gap-2"><CheckCheck size={18} color="#287454" /><Heading className="text-base md:text-lg">Work is underway</Heading></View>
        <Copy className="text-[11px] text-muted md:text-[13px]">When work is complete, enter the customer's Completion Code to release payment.</Copy>
        <TextInput testID="worker-end-code" accessibilityLabel="Customer Completion Code" placeholder="Enter code (e.g. 5678)" placeholderTextColor="#AAB9AE" value={entered} onChangeText={setEntered} keyboardType="number-pad" autoComplete="off" className="h-[56px] rounded-lg border border-[#CDDCD0] bg-white px-4 text-center font-displaybold text-[24px] text-primary md:h-[72px] md:px-5 md:text-[32px]" />
        <Button label="Verify completion & finish" icon={CheckCheck} loading={busy} onPress={() => void runAction('complete')} />
      </>)}
    </View>}
      {!active && <Notice message={job.status === 'completed' ? `This job is complete. ${demo ? 'The demo payment was released.' : 'The payment release has been queued for processing.'}` : 'This booking was cancelled.'} kind="success" />}<Notice message={error} />
    </View><View className="w-full gap-4 md:w-[300px] md:gap-5"><Panel className="gap-4 p-4 md:gap-5 md:p-6"><Heading className="text-base md:text-lg">Booking timeline</Heading><Timeline job={job} /></Panel><Panel className="gap-3 p-4 md:gap-4 md:p-6"><View className="flex-row items-center gap-2"><Wallet size={17} color="#287454" /><Heading className="text-base md:text-lg">Payment summary</Heading></View><View className="flex-row justify-between"><Copy className="text-muted">Service estimate</Copy><Copy className="font-semibold">{job.amount > 0 ? money(job.amount) : 'Pending Quote'}</Copy></View><View className="border-t border-line pt-3 md:pt-4"><Badge label={demo ? `Demo escrow · ${job.escrowStatus.replace('demo_', '')}` : `Escrow · ${job.escrowStatus}`} tone={job.escrowStatus === 'unfunded' ? 'amber' : 'green'} /></View><Copy className="text-[10px] text-muted md:text-xs">{demo ? 'Simulation only. No money is collected or transferred.' : job.escrowStatus === 'unfunded' ? 'Payment is not funded. Starting work is blocked until the payment provider confirms funding.' : 'Payment release is processed after the customer confirms completion.'}</Copy></Panel>{customer && ['requested', 'accepted', 'quoted', 'approved'].includes(job.status) && <Button label="Cancel booking" variant="ghost" onPress={() => setConfirm('cancel')} />}</View></View>
  </View></ScrollView>
    {active && <View className="border-t border-line bg-white px-5 py-3"><View className="mx-auto w-full max-w-[1000px] flex-row items-center justify-between gap-3"><View className="hidden flex-1 md:flex"><Copy className="text-xs text-muted">Your safety always comes first.</Copy></View><View className="flex-1 md:max-w-[260px]"><SOSButton jobId={job.id} demo={demo} onRecord={recordSOS} /></View></View></View>}
    <Sheet visible={confirm !== null} title={confirm === 'complete' ? 'Everything looking good?' : 'Cancel this booking?'} onClose={() => setConfirm(null)}><Copy>{confirm === 'complete' ? `Confirm that the work is complete. This authorizes ${demo ? 'a simulated' : 'the'} payment release of ${money(job.amount)} to ${job.workerName}.` : 'This action cancels the booking before work starts. Any funded payment will be queued for a refund.'}</Copy><Notice message={error} /><Button label={confirm === 'complete' ? 'Confirm & release payment' : 'Yes, cancel booking'} loading={busy} variant={confirm === 'cancel' ? 'danger' : 'primary'} onPress={() => { if (confirm) void runAction(confirm); }} /><Button label="Keep booking open" variant="ghost" onPress={() => setConfirm(null)} /></Sheet>
  </View>;
}