import * as Location from 'expo-location';
import { ArrowDownLeft, ArrowRight, ArrowUpRight, BadgeCheck, Bookmark, CalendarDays, Check, ChevronRight, Clock3, Droplets, Hammer, House, MapPin, Mic, Paintbrush, Search, ShieldCheck, SlidersHorizontal, Sparkles, Star, Wallet, Wind, Zap, LogOut, type LucideIcon } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { Image, Pressable, RefreshControl, ScrollView, Switch, TextInput, View, useWindowDimensions } from 'react-native';
import { Shell, type Tab } from '../components/Shell';
import { Avatar, Badge, Button, Copy, EmptyState, Field, Heading, IconButton, Notice, Panel, Reveal, RoleBadge, SOSButton, Sheet, TextLink, Timeline } from '../components/ui';
import { professionals } from '../data/demo';
import { DEFAULT_LOCATION, canViewJob, distanceKm, money, statusLabels, type Category, type Job, type Professional } from '../domain/marketplace';
import { fetchProfessionals } from '../lib/api';
import { errorMessage, requireSupabase } from '../lib/supabase';
import { useAuth } from '../stores/auth';
import { useBookings } from '../stores/bookings';

const problemServices = [
  { name: 'Plumbing' as Category, title: 'Plumbing & Water Issues', tagline: 'Tap leaks, pipe damage, toilet flush, blocked drains', rate: 350, icon: Droplets, color: 'bg-sky', ink: '#6487B4', commonIssues: ['Kitchen tap dripping constantly', 'Water pipe leakage under sink', 'Blocked bathroom drain', 'Flush tank not working'] },
  { name: 'Electrical' as Category, title: 'Electrical Problems', tagline: 'Switches, wiring faults, tripped MCB, ceiling fans', rate: 400, icon: Zap, color: 'bg-peach', ink: '#BA9368', commonIssues: ['Switchboard sparking / burning smell', 'Ceiling fan stopped running', 'Main MCB tripping repeatedly', 'Power socket not working'] },
  { name: 'Cleaning' as Category, title: 'Deep Home Cleaning', tagline: 'Bathroom scrubbing, kitchen grease, floor sanitizing', rate: 300, icon: Sparkles, color: 'bg-lilac', ink: '#A08BBE', commonIssues: ['Full bathroom deep clean & descaling', 'Kitchen countertop & chimney degrease', 'Full home floor scrub & mop', 'Window sill & balcony wash'] },
  { name: 'Carpentry' as Category, title: 'Carpentry & Woodwork', tagline: 'Door locks, loose hinges, furniture fix, shelving', rate: 450, icon: Hammer, color: 'bg-mint', ink: '#679783', commonIssues: ['Main door lock jammed or stuck', 'Loose wardrobe or cupboard hinge', 'Wooden chair / bed frame wobble', 'Curtain rod or wall shelf install'] },
  { name: 'Painting' as Category, title: 'Wall Painting & Patches', tagline: 'Wall touch-ups, damp patch painting, water damage', rate: 350, icon: Paintbrush, color: 'bg-rose', ink: '#B87980', commonIssues: ['Damp wall patch scraped and repainted', 'Single bedroom wall touch-up', 'Ceiling water mark coverage', 'Door frame enamel paint'] },
  { name: 'Appliances' as Category, title: 'Appliance Repair', tagline: 'AC not cooling, washing machine vibration, fridge cooling', rate: 400, icon: Wind, color: 'bg-sky', ink: '#6487B4', commonIssues: ['Split AC water leaking or not cooling', 'Washing machine not spinning / draining', 'Refrigerator not freezing properly', 'Geyser not heating water'] },
];

export function Dashboard({ onJob }: { onJob: (id: string) => void }) {
  const { profile, mode, logout, loginDemo } = useAuth();
  const { demoJobs, liveJobs, refresh, receiveDemoJob } = useBookings();
  const { width } = useWindowDimensions();
  const [tab, setTab] = useState<Tab>('home');
  const [category, setCategory] = useState<Category>('All services');
  const [query, setQuery] = useState('');
  const [selectedService, setSelectedService] = useState<typeof problemServices[0] | null>(null);
  const [locationLabel] = useState('Indiranagar, Bengaluru (5 km radius)');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [available, setAvailable] = useState(false);
  const worker = profile?.role === 'worker';
  const demo = mode === 'demo';
  const jobs = (demo ? demoJobs : liveJobs).filter(job => profile && canViewJob(job, profile));
  const activeJobs = jobs.filter(job => !['completed', 'cancelled'].includes(job.status));
  const completedJobs = jobs.filter(job => job.status === 'completed');
  const activeJob = activeJobs[0];

  const reload = async () => {
    if (demo) return;
    setLoading(true);
    try { await refresh(); setError(null); } catch (cause) { setError(errorMessage(cause)); } finally { setLoading(false); }
  };

  useEffect(() => {
    if (worker && demo && available) {
      const timer = setTimeout(() => {
        if (!activeJobs.some(j => j.status === 'requested')) {
          receiveDemoJob();
        }
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [worker, demo, available, receiveDemoJob, activeJobs]);

  const filteredServices = problemServices.filter(s =>
    (category === 'All services' || s.name === category) &&
    (`${s.title} ${s.name} ${s.tagline} ${s.commonIssues.join(' ')}`.toLowerCase().includes(query.toLowerCase()))
  );

  if (!profile) return null;
  const title = tab === 'home' ? (worker ? 'Your work dashboard.' : 'State your problem. Get instant help.') : tab === 'explore' ? (worker ? 'Your local job feed.' : 'Select a service problem & hire.') : tab === 'bookings' ? (worker ? 'Your jobs, all in one place.' : 'Your service requests & bookings.') : 'Your corner of LocalFix.';

  return <Shell tab={tab} onTab={setTab} jobs={jobs} onJob={onJob} location={locationLabel}>
    <ScrollView refreshControl={<RefreshControl refreshing={loading} onRefresh={() => void reload()} tintColor="#287454" />} contentContainerClassName="px-4 pb-8 pt-5 md:px-9 md:pb-10 md:pt-8"><View className="mx-auto w-full max-w-[1280px] gap-5 md:gap-7">
      <Reveal><View className="flex-row flex-wrap items-center justify-between gap-3 md:gap-4"><View className="gap-1 md:gap-1.5"><Copy className="font-medium text-[11px] text-muted md:text-[13px]">Hello, {profile.name.split(' ')[0]} <Copy className="text-primary">/</Copy> {worker ? 'Worker Workspace' : 'Customer Workspace'}</Copy><Heading className="text-[20px] leading-[26px] md:text-[30px] md:leading-[40px]">{title}</Heading></View><View className="flex-row items-center gap-2 md:gap-3">{worker ? <>
        <Badge label={available ? 'Available for jobs' : 'Offline'} /><Switch accessibilityLabel="Available for jobs" value={available} onValueChange={setAvailable} trackColor={{ false: '#DDE5DF', true: '#287454' }} />
      </> : <View className="flex-row items-center gap-1.5 rounded-full border border-line bg-white px-2.5 py-1.5 md:gap-2 md:px-3 md:py-2"><View className="h-1.5 w-1.5 rounded-full bg-primary" /><Copy className="font-medium text-[10px] md:text-[11px]">5 km Verified Local Matching</Copy></View>}
      <Button label="Sign out" variant="ghost" icon={LogOut} onPress={() => void logout()} />
      </View></View></Reveal>
      <Notice message={error} />

      {tab === 'account' ? <View className="max-w-2xl gap-6"><View className="flex-row items-center gap-5 border-b border-line pb-6"><Avatar name={profile.name} large /><View className="gap-2"><Heading>{profile.name}</Heading><RoleBadge role={profile.role} /></View></View><Field label="Mobile number" value={profile.phone} editable={false} /><View className="flex-row items-center gap-3"><ShieldCheck size={22} color="#287454" /><Copy>Identity: Verified</Copy></View><Copy className="text-muted">{locationLabel}</Copy><Notice kind="info" message="This is an interactive prototype. Bookings persist locally on this browser. You can freely switch roles below." /><Button label={`Switch to demo ${worker ? 'customer' : 'worker'}`} variant="secondary" onPress={() => void loginDemo(worker ? 'customer' : 'worker')} /><Button label="Sign out" variant="secondary" onPress={() => void logout()} /></View> : tab === 'earnings' ? <View className="gap-7"><View className="flex-row flex-wrap gap-4"><Metric title="Total earned" value={money(completedJobs.reduce((total, job) => total + job.amount, 0))} icon={Wallet} tint="bg-mint" /><Metric title="Awaiting completion" value={money(activeJobs.reduce((total, job) => total + job.amount, 0))} icon={Clock3} tint="bg-peach" /><Metric title="Jobs completed" value={String(completedJobs.length).padStart(2, '0')} icon={BadgeCheck} tint="bg-lilac" /></View><Heading className="text-lg">Payment history</Heading>{completedJobs.length ? completedJobs.map(job => <Panel key={job.id} className="flex-row items-center gap-4 p-5"><View className="h-11 w-11 items-center justify-center rounded-lg bg-mint"><ArrowDownLeft size={21} color="#287454" /></View><View className="flex-1"><Copy className="font-semibold">{job.title}</Copy><Copy className="text-xs text-muted">{job.customerName} · Simulated payout</Copy></View><Copy className="font-bold text-primary">+{money(job.amount)}</Copy></Panel>) : <EmptyState title="Your first earnings are ahead" description="Completed, confirmed jobs will appear here." />}</View> : tab === 'bookings' ? <View className="gap-4">{jobs.length ? jobs.map(job => <JobRow key={job.id} job={job} worker={worker} onPress={() => onJob(job.id)} />) : <EmptyState title="No bookings yet" description="Click on a problem on the home screen to hire a local verified worker." action={!worker ? <Button label="Browse service problems" onPress={() => setTab('home')} /> : undefined} />}</View> : worker ? <>
        {tab === 'home' && <View className="flex-row flex-wrap gap-4"><Metric title="Assigned jobs" value={String(activeJobs.length).padStart(2, '0')} icon={CalendarDays} tint="bg-sky" /><Metric title="Your earnings" value={money(completedJobs.reduce((total, job) => total + job.amount, 0))} icon={Wallet} tint="bg-mint" /><Metric title="Verification" value="Verified" icon={ShieldCheck} tint="bg-peach" /></View>}
        <View className="flex-row flex-wrap gap-7"><View className="min-w-[260px] flex-1 gap-5"><View className="flex-row items-center justify-between"><Heading className="text-xl">Your Assigned Job Requests</Heading><Badge label={`${activeJobs.length} ACTIVE`} /></View>{activeJobs.length ? activeJobs.map(job => <JobRow key={job.id} job={job} worker onPress={() => onJob(job.id)} />) : <EmptyState title="No active job requests" description="When a customer requests help in your category, the job will appear here." />}</View><View className="w-full md:w-[300px] gap-5"><View className="gap-4 rounded-lg bg-mint p-6"><ShieldCheck size={30} color="#287454" /><Heading className="text-lg">Prototype Worker Workspace</Heading><Copy className="text-[13px] text-muted">To start a job, open it and enter any number (e.g. 1212). The start code unlocks the job and puts it in progress.</Copy><Badge label="Dual-ID Verified" icon /></View></View></View>
      </> : <>
        <View className="flex-row items-center gap-2 md:gap-3"><View className="min-h-11 flex-1 flex-row items-center gap-2 rounded-lg border border-line bg-white px-3 md:min-h-14 md:gap-3 md:px-4"><Search size={18} color="#7A8981" /><TextInput accessibilityLabel="Search problems" placeholder="Search your problem (e.g. tap leaking, fan broken...)" placeholderTextColor="#8A978F" value={query} onChangeText={setQuery} className="min-h-11 flex-1 font-sans text-[12px] text-ink md:min-h-14 md:text-[14px]" /><View className="hidden sm:flex"><MapPin size={15} color="#287454" /></View></View></View>

        {tab === 'home' && <View className="overflow-hidden rounded-lg bg-[#E8F0E8]"><View className="flex-row"><View className="flex-1 gap-1.5 p-4 md:gap-2 md:p-7"><View className="mb-0.5 flex-row items-center gap-1.5 md:mb-1 md:gap-2"><View className="h-1.5 w-1.5 rounded-full bg-primary" /><Copy className="font-bold text-[9px] text-primary md:text-[10px]">INSTANT PROBLEM MATCHING</Copy></View><Heading className="text-[18px] leading-[24px] md:text-[25px] md:leading-[33px]">Have a problem at home?{ '\n' }Hire a verified worker in seconds.</Heading><Copy className="max-w-[420px] text-[10px] text-muted md:text-xs">Select your issue below, describe what is needed, and our system automatically matches you with a qualified local technician within 5 km.</Copy></View>{width >= 650 && <Image accessibilityLabel="A bright neighborhood home" source={{ uri: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=700&auto=format&fit=crop&q=80' }} className="w-[36%] bg-mint" resizeMode="cover" />}</View></View>}

        <View className="gap-3 md:gap-4">
          <View className="flex-row items-center justify-between">
            <Heading className="text-base md:text-lg">What needs fixing today?</Heading>
            {category !== 'All services' && <TextLink label="Show all" onPress={() => setCategory('All services')} />}
          </View>
          <View className="flex-row flex-wrap gap-2 md:gap-3">
            {problemServices.map(({ name, icon: Icon, color, ink }) => <Pressable key={name} accessibilityRole="button" accessibilityLabel={name} accessibilityState={{ selected: category === name }} onPress={() => setCategory(category === name ? 'All services' : name)} className={`min-w-[72px] flex-1 items-center gap-2 rounded-lg border px-1.5 py-3 md:min-w-[88px] md:gap-3 md:px-2 md:py-4 ${category === name ? 'border-primary bg-mint' : 'border-line bg-white'}`}><View className={`h-9 w-9 items-center justify-center rounded-lg md:h-11 md:w-11 ${color}`}><Icon size={20} color={ink} strokeWidth={1.7} /></View><Copy className="font-medium text-[10px] text-center md:text-xs">{name}</Copy></Pressable>)}
          </View>
        </View>

        <View className="flex-col md:flex-row gap-4 md:gap-6">
          <View className="flex-1 gap-3 md:gap-4">
            <View className="flex-row items-center justify-between">
              <Heading className="text-base md:text-lg">Select a Problem to Hire a Worker</Heading>
              <Badge label={`${filteredServices.length} CATEGORIES`} />
            </View>

            <View className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
              {filteredServices.map(service => {
                const Icon = service.icon;
                return <Panel key={service.name} className="gap-3 p-4 hover:border-primary transition-all md:gap-4 md:p-5">
                  <View className="flex-row items-start gap-2.5 md:gap-3">
                    <View className={`h-10 w-10 items-center justify-center rounded-lg md:h-12 md:w-12 ${service.color}`}>
                      <Icon size={20} color={service.ink} />
                    </View>
                    <View className="flex-1 gap-0.5 md:gap-1">
                      <Heading className="text-[14px] md:text-base">{service.title}</Heading>
                      <Copy className="text-[10px] text-muted md:text-xs">{service.tagline}</Copy>
                    </View>
                  </View>

                  <View className="flex-row flex-wrap gap-1 py-0.5 md:gap-1.5 md:py-1">
                    {service.commonIssues.slice(0, 2).map(issue => (
                      <View key={issue} className="rounded bg-mint px-1.5 py-0.5 md:px-2 md:py-1">
                        <Copy className="text-[9px] text-primary md:text-[11px]">{issue}</Copy>
                      </View>
                    ))}
                  </View>

                  <View className="flex-row items-center justify-end border-t border-line pt-2.5 md:pt-3">
                    <Button label="State problem & Request" icon={ArrowRight} onPress={() => setSelectedService(service)} />
                  </View>
                </Panel>;
              })}
            </View>
          </View>

          {tab === 'home' && <View className="w-full md:w-[320px] gap-4 md:gap-5">
            <View className="flex-row items-center justify-between"><Heading className="text-base md:text-lg">Your Active Booking</Heading><CalendarDays size={16} color="#7A8981" /></View>
            {activeJob ? <Panel className="gap-3 p-4 md:gap-4 md:p-5">
              <View className="flex-row items-center justify-between"><Badge label={statusLabels[activeJob.status]} tone="amber" /><Copy className="text-[10px] text-muted">{activeJob.id}</Copy></View>
              <Heading className="text-[17px]">{activeJob.title}</Heading>
              <View className="gap-1">
                <Copy className="font-semibold text-xs text-primary">Assigned {activeJob.category} Technician</Copy>
                <Copy className="text-[11px] text-muted">{activeJob.address}</Copy>
              </View>
              <View className="flex-row items-center gap-2 border-y border-line py-3"><Clock3 size={15} color="#7A8981" /><Copy className="text-xs">{new Date(activeJob.scheduledAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })} · {new Date(activeJob.scheduledAt).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' })}</Copy></View>
              <Timeline job={activeJob} />
              <Button label="View details & Start Code" icon={ArrowRight} variant="secondary" onPress={() => onJob(activeJob.id)} />
            </Panel> : <Panel className="gap-2.5 p-4 md:gap-3 md:p-6"><CalendarDays size={22} color="#7A8981" /><Copy className="font-semibold text-[13px] md:text-[14px]">No active service requests.</Copy><Copy className="text-[10px] text-muted md:text-xs">Click any problem category on the left to hire a worker.</Copy></Panel>}

            <View className="gap-2.5 rounded-lg border border-[#CDDCD0] bg-mint p-4 md:gap-3 md:p-5">
              <View className="flex-row items-center gap-2">
                <ShieldCheck size={18} color="#287454" />
                <Heading className="text-[13px] md:text-sm">How LocalFix Works</Heading>
              </View>
              <Copy className="text-[10px] leading-4 text-muted md:text-xs md:leading-5">1. Select your problem category</Copy>
              <Copy className="text-[10px] leading-4 text-muted md:text-xs md:leading-5">2. State the issue & your address</Copy>
              <Copy className="text-[10px] leading-4 text-muted md:text-xs md:leading-5">3. Verified local worker is automatically matched</Copy>
              <Copy className="text-[10px] leading-4 text-muted md:text-xs md:leading-5">4. Share your 4-digit code when worker arrives</Copy>
            </View>
          </View>}
        </View>
      </>}

      <View className="mt-1 flex-row flex-wrap items-center justify-between gap-2 border-t border-line pt-4 md:mt-2 md:gap-3 md:pt-5"><View className="flex-row items-center gap-1.5 md:gap-2"><House size={12} color="#8B9A90" /><Copy className="text-[9px] text-muted md:text-[11px]">LocalFix Prototype · 5 km Hyperlocal Gig Services</Copy></View><Copy className="text-[8px] text-muted md:text-[10px]">DEMO MODE ACTIVE</Copy></View>
    </View></ScrollView>

    {selectedService && <HireWorkerSheet service={selectedService} onClose={() => setSelectedService(null)} onBooked={id => { setSelectedService(null); onJob(id); }} />}
  </Shell>;
}

function Metric({ title, value, icon: Icon, tint }: { title: string; value: string; icon: LucideIcon; tint: string }) { return <Panel className="min-w-[170px] flex-1 gap-5 p-5"><View className="flex-row items-center justify-between"><Copy className="text-xs text-muted">{title}</Copy><View className={`h-9 w-9 items-center justify-center rounded-lg ${tint}`}><Icon size={18} color="#287454" /></View></View><Heading className="text-[26px]">{value}</Heading></Panel>; }
function JobRow({ job, worker, onPress }: { job: Job; worker: boolean; onPress: () => void }) {
  return <Pressable accessibilityRole="button" accessibilityLabel={`Open ${job.title}`} onPress={onPress}>
    <Panel className="gap-4 p-5">
      <View className="flex-row items-center justify-between gap-3"><Badge label={statusLabels[job.status]} tone={job.status === 'requested' || job.status === 'accepted' ? 'amber' : 'green'} /><Copy className="font-bold">{money(job.amount)}</Copy></View>
      <View className="flex-row items-center gap-3">
        <View className="flex-1 gap-1">
          <Heading className="text-lg">{job.title}</Heading>
          <Copy className="text-xs text-muted">{worker ? job.customerName : `Assigned ${job.category} Technician`} · {job.category}</Copy>
          <Copy className="text-xs text-muted">{job.address}</Copy>
        </View>
        <ChevronRight size={20} color="#287454" />
      </View>
    </Panel>
  </Pressable>;
}

function HireWorkerSheet({ service, onClose, onBooked }: { service: typeof problemServices[0]; onClose: () => void; onBooked: (id: string) => void }) {
  const { profile, mode } = useAuth();
  const book = useBookings(state => state.book);
  const [title, setTitle] = useState(service.commonIssues[0] || `${service.name} issue`);
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('24, 12th Main Road, Indiranagar, Bengaluru');
  const [day, setDay] = useState(0);
  const [busy, setBusy] = useState(false);
  const [listening, setListening] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const simulateVoice = () => {
    setListening(true);
    setTimeout(() => {
      setDescription(prev => prev + (prev ? ' ' : '') + "I need someone to come quickly, it's quite urgent and I don't have the right tools to fix it.");
      setListening(false);
    }, 1500);
  };

  const submit = async () => {
    if (!profile) return;
    setBusy(true);
    try {
      const assignedWorker: Professional = professionals.find(p => p.category === service.name) ?? professionals[0]!;
      const id = await book({
        worker: { ...assignedWorker, hourlyRate: service.rate },
        title,
        description,
        address,
        scheduledAt: new Date(Date.now() + (day * 24 + 1) * 3600000).toISOString()
      }, profile, mode === 'demo');
      onBooked(id);
    } catch (cause) {
      setError(errorMessage(cause));
    } finally {
      setBusy(false);
    }
  };

  const Icon = service.icon;

  return <Sheet visible title="State Problem & Hire Worker" onClose={onClose}>
    <View className="flex-row items-center gap-3 rounded-lg bg-mint p-4">
      <View className={`h-11 w-11 items-center justify-center rounded-lg ${service.color}`}>
        <Icon size={22} color={service.ink} />
      </View>
      <View className="flex-1">
        <Heading className="text-base">{service.title}</Heading>
        <Copy className="text-xs text-muted">A verified local technician within 5 km will be assigned</Copy>
      </View>
    </View>

    <View className="gap-2">
      <Copy className="font-semibold text-xs text-muted">COMMON PROBLEMS (CLICK TO SELECT):</Copy>
      <View className="flex-row flex-wrap gap-2">
        {service.commonIssues.map(issue => (
          <Pressable key={issue} accessibilityRole="button" onPress={() => setTitle(issue)} className={`rounded-lg border px-3 py-1.5 ${title === issue ? 'border-primary bg-mint' : 'border-line bg-white'}`}>
            <Copy className={`text-xs ${title === issue ? 'font-bold text-primary' : 'text-muted'}`}>{issue}</Copy>
          </Pressable>
        ))}
      </View>
    </View>

    <Field label="State your problem" placeholder="e.g. Kitchen sink tap is leaking constantly" value={title} onChangeText={setTitle} maxLength={100} />
    
    <View className="gap-2">
      <Field label="Additional details (optional)" placeholder="e.g. Need quick repair, tap is dripping into bucket" value={description} onChangeText={setDescription} multiline maxLength={1000} className="min-h-20" />
      <View className="self-start">
        <Button label={listening ? 'Listening...' : 'Voice Input (Demo)'} icon={Mic} variant="secondary" loading={listening} onPress={simulateVoice} />
      </View>
    </View>
    <Field label="Service address" placeholder="House/Flat number, Street, Neighborhood" value={address} onChangeText={setAddress} maxLength={300} />

    <View className="flex-row gap-3">
      {['Today (within 1 hr)', 'Tomorrow'].map((label, index) => (
        <Button key={label} label={label} variant={day === index ? 'primary' : 'secondary'} className="flex-1" onPress={() => setDay(index)} />
      ))}
    </View>

    <Notice kind="info" message="Automatic worker assignment: Once you request a worker, a verified 5 km local technician will accept your request, travel to your location, and provide a quote." />
    
    <View className="rounded-lg border border-[#CDDCD0] bg-white p-4">
      <View className="flex-row items-center justify-between">
        <Copy className="font-semibold">Convenience Fee</Copy>
        <Copy className="font-bold text-primary">₹50</Copy>
      </View>
      <Copy className="mt-1 text-[11px] text-muted">A non-refundable fee of ₹50 is required to dispatch a worker to your location.</Copy>
    </View>

    <Notice message={error} />

    <Button label="Pay ₹50 & Request Worker" icon={ArrowRight} loading={busy} onPress={() => void submit()} />
  </Sheet>;
}