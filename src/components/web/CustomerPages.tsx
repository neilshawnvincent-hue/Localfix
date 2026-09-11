import { CONSULTATION_FEE, SERVICES } from '@/constants/services';
import { STATUS_LABELS, localDate, validateDraft, type Booking, type BookingAction, type BookingStatus } from '@/lib/bookingFlow';
import { useAuthStore } from '@/store/authStore';
import { useWebStore } from '@/store/webStore';
import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';
import { useDeferredValue, useRef, useState } from 'react';
import { Action, EmptyState, Heading, Icon, NavLink, Notice, Status, appointment, money, serviceImages, serviceTitles } from './ui';

export function ServicesPage() {
  const router = useRouter();
  const auth = useAuthStore();
  const store = useWebStore();
  const [query, setQuery] = useState('');
  const deferredQuery = useDeferredValue(query);
  const [category, setCategory] = useState('all');
  const [sort, setSort] = useState('recommended');
  const groups: Record<string, string[]> = { all: SERVICES.map((service) => service.id), repairs: ['plumber', 'electrician', 'ac-repair'], improvements: ['carpenter', 'painter'], cleaning: ['cleaner'] };
  const filtered = SERVICES.filter((service) => groups[category].includes(service.id) && `${service.name} ${serviceTitles[service.id]} ${service.description}`.toLowerCase().includes(deferredQuery.trim().toLowerCase()));
  if (sort === 'price') filtered.sort((first, second) => first.startingPrice - second.startingPrice);
  const active = store.bookings.find((booking) => !['completed', 'cancelled'].includes(booking.status));
  function book(serviceId: string) {
    store.selectService(serviceId);
    router.push(auth.isLoggedIn && auth.role === 'customer' ? '/(customer)/booking' : '/(auth)/role-select');
  }
  return <>
    <Heading eyebrow="A better day starts at home" title={auth.isLoggedIn && auth.role === 'customer' ? `At your service, ${auth.userName.split(' ')[0]}.` : 'Home services, sorted.'}>A leaking tap or a fresh start. Find the right help for your home.</Heading>
    {auth.isLoggedIn && auth.role === 'customer' && active && <div className="lf-active-strip"><Icon name="calendar-outline" size={25} /><div><strong>{serviceTitles[active.serviceId]} appointment</strong><p>{STATUS_LABELS[active.status]} · {appointment(active.date, active.time)}</p></div><NavLink href={{ pathname: '/(customer)/active-job', params: { id: active.id } }} className="lf-button secondary small">View booking<Icon name="arrow-forward" size={16} /></NavLink></div>}
    <div className="lf-toolbar"><div className="lf-search"><Icon name="search-outline" /><input type="search" aria-label="Search services" placeholder="What can we help you with?" value={query} onChange={(event) => setQuery(event.target.value)} />{query && <button aria-label="Clear search" onClick={() => setQuery('')}><Icon name="close-outline" /></button>}</div><select aria-label="Sort services" value={sort} onChange={(event) => setSort(event.target.value)}><option value="recommended">Recommended</option><option value="price">Price: low to high</option></select></div>
    <div className="lf-filters" aria-label="Service categories">{[{ id: 'all', label: 'All services', icon: 'apps-outline' }, { id: 'repairs', label: 'Repairs & maintenance', icon: 'construct-outline' }, { id: 'improvements', label: 'Home improvements', icon: 'color-palette-outline' }, { id: 'cleaning', label: 'Cleaning', icon: 'sparkles-outline' }].map((item) => <button key={item.id} className={`lf-filter ${category === item.id ? 'selected' : ''}`} aria-pressed={category === item.id} onClick={() => setCategory(item.id)}>{item.label}</button>)}</div>
    <div className="lf-section-heading"><h2>{query ? 'Search results' : 'A little care for every corner'}</h2><span aria-live="polite">{filtered.length} services</span></div>
    {filtered.length ? <div className="lf-service-grid">{filtered.map((service) => <article className="lf-service" key={service.id}><img className="lf-service-photo" src={serviceImages[service.id]} alt={`${serviceTitles[service.id]} service`} /><div className="lf-service-body"><div className="lf-service-title"><Icon name={service.icon} size={18} /><h3>{serviceTitles[service.id]}</h3></div><p>{service.description}</p><div className="lf-service-bottom"><div className="lf-service-price"><small>From</small>{money(service.startingPrice)}<span>+ {money(CONSULTATION_FEE)} visit fee</span></div><button className="lf-service-book" title={`Book ${serviceTitles[service.id]}`} aria-label={`Book ${serviceTitles[service.id]}`} onClick={() => book(service.id)}><Icon name="arrow-forward" size={18} /></button></div></div></article>)}</div> : <EmptyState icon="search-outline" title="No services found">Try a different search or choose another category.<br /><Action variant="quiet" onClick={() => { setQuery(''); setCategory('all'); }}>Clear filters</Action></EmptyState>}
    <section className="lf-assurance" aria-label="Service details"><div><Icon name="receipt-outline" size={23} /><div><strong>Know the cost first</strong><p>A visit fee of {money(CONSULTATION_FEE)}. Approve the work quote separately.</p></div></div><div><Icon name="calendar-outline" size={23} /><div><strong>On your schedule</strong><p>Appointments from 9 am to 6 pm, up to 30 days ahead.</p></div></div><div><Icon name="chatbubble-ellipses-outline" size={23} /><div><strong>Every step, in one place</strong><p>Keep your appointments, quotes and receipts together.</p></div></div></section>
  </>;
}

function Steps({ current }: { current: number }) {
  return <nav className="lf-stepper" aria-label="Booking progress">{['Service', 'Details', 'Review'].map((label, index) => <span key={label} className={index <= current ? 'current' : ''} aria-current={index === current ? 'step' : undefined}><b>{index < current ? <Icon name="checkmark" size={12} /> : index + 1}</b>{label}{index < 2 && <i />}</span>)}</nav>;
}

function Summary({ serviceId }: { serviceId: string }) {
  const service = SERVICES.find((item) => item.id === serviceId);
  if (!service) return null;
  return <aside className="lf-summary"><img src={serviceImages[service.id]} alt={serviceTitles[service.id]} /><h3>{serviceTitles[service.id]}</h3><p>{service.description}</p><div className="lf-price-line"><span>Service estimate</span><strong>From {money(service.startingPrice)}</strong></div><div className="lf-price-line"><span>Visit & consultation</span><strong>{money(CONSULTATION_FEE)}</strong></div><div className="lf-price-line total"><span>Due to book</span><strong>{money(CONSULTATION_FEE)}</strong></div><p className="lf-price-note">The service price is an estimate, not a final quote. Your professional will assess the work before you approve the cost. The visit fee is separate.</p><Notice>Demo booking. No money will be collected.</Notice></aside>;
}

export function BookingPage() {
  const router = useRouter();
  const { draft, setDraft } = useWebStore();
  const [error, setError] = useState('');
  const service = SERVICES.find((item) => item.id === draft.serviceId);
  if (!service) return <EmptyState title="Start with a service" href="/" label="Browse services">Choose the kind of help you need before scheduling an appointment.</EmptyState>;
  const lastDay = new Date();
  lastDay.setDate(lastDay.getDate() + 30);
  return <><Steps current={1} /><Heading eyebrow="Make room for a little help" title="Tell us what needs fixing.">A few details now make for a smoother visit later.</Heading><div className="lf-form-layout"><form onSubmit={(event) => { event.preventDefault(); const issue = validateDraft(draft); if (issue) { setError(issue); return; } router.push('/(customer)/checkout'); }}>
    <section className="lf-form-section"><h2>01. The job</h2><label className="lf-field">Service<select value={draft.serviceId} onChange={(event) => setDraft({ serviceId: event.target.value })}>{SERVICES.map((item) => <option key={item.id} value={item.id}>{serviceTitles[item.id]}</option>)}</select></label><label className="lf-field">What do you need help with?<textarea required minLength={10} maxLength={1000} value={draft.description} onChange={(event) => setDraft({ description: event.target.value })} placeholder="For example, the pipe under my kitchen sink is leaking." /><small>{draft.description.length}/1000 characters</small></label></section>
    <section className="lf-form-section"><h2>02. Where & when</h2><label className="lf-field">Service address<textarea required minLength={10} maxLength={300} value={draft.address} onChange={(event) => setDraft({ address: event.target.value })} placeholder="Flat or house number, street, neighbourhood, Bengaluru and PIN code" autoComplete="street-address" /></label><div className="lf-form-row"><label className="lf-field">Appointment date<input required type="date" min={localDate()} max={localDate(lastDay)} value={draft.date} onChange={(event) => setDraft({ date: event.target.value })} /></label><label className="lf-field">Arrival time<select required value={draft.time} onChange={(event) => setDraft({ time: event.target.value })}><option value="">Choose a time</option>{['09:00', '12:00', '15:00', '18:00'].map((time) => <option key={time} value={time} disabled={!!draft.date && new Date(`${draft.date}T${time}:00`) <= new Date()}>{({ '09:00': '9:00 am', '12:00': '12:00 pm', '15:00': '3:00 pm', '18:00': '6:00 pm' })[time]}</option>)}</select></label></div></section>
    {error && <Notice error>{error}</Notice>}<div className="lf-form-actions"><NavLink href="/" className="lf-button quiet"><Icon name="arrow-back" size={17} />Services</NavLink><Action type="submit" icon="arrow-forward">Review booking</Action></div>
  </form><Summary serviceId={draft.serviceId} /></div></>;
}

export function CheckoutPage() {
  const router = useRouter();
  const store = useWebStore();
  const auth = useAuthStore();
  const [accepted, setAccepted] = useState(false);
  const [error, setError] = useState('');
  const submitting = useRef(false);
  const { draft } = store;
  if (!draft.serviceId) return <EmptyState title="No booking to review" href="/" label="Browse services">Your confirmed bookings are available in My bookings.</EmptyState>;
  const issue = validateDraft(draft);
  return <><Steps current={2} /><Heading eyebrow="One last look" title="Everything look right?">Review your appointment before confirming the visit.</Heading><div className="lf-form-layout"><div><section className="lf-form-section"><h2>{serviceTitles[draft.serviceId]}</h2><p>{draft.description}</p><div className="lf-inline-details"><div><small>Service address</small><p>{draft.address}</p></div><div><small>Appointment</small><p>{draft.date && draft.time ? appointment(draft.date, draft.time) : 'Not selected'}</p></div></div></section><section className="lf-form-section"><h2>Payment & cancellation</h2><p className="lf-lead">The {money(CONSULTATION_FEE)} visit fee is recorded as a demo payment on confirmation. The work quote is paid separately after completion. You can cancel before work begins; the visit fee is not refunded in this demo.</p><label className="lf-check"><input type="checkbox" checked={accepted} onChange={(event) => setAccepted(event.target.checked)} /><span>I have reviewed the appointment, visit fee and cancellation terms.</span></label></section>{(issue || error) && <Notice error>{issue || error}</Notice>}<div className="lf-form-actions"><NavLink href="/(customer)/booking" className="lf-button secondary"><Icon name="create-outline" size={17} />Edit details</NavLink><Action disabled={!accepted || !!issue} icon="checkmark" onClick={() => {
    if (submitting.current) return;
    submitting.current = true;
    try { const id = store.createBooking(auth.userName); router.replace({ pathname: '/(customer)/active-job', params: { id } }); } catch (caught) { setError(caught instanceof Error ? caught.message : 'Unable to create booking.'); submitting.current = false; }
  }}>Confirm demo booking</Action></div></div><Summary serviceId={draft.serviceId} /></div></>;
}

export function BookingRow({ booking, worker = false }: { booking: Booking; worker?: boolean }) {
  return <article className="lf-booking-row"><img src={serviceImages[booking.serviceId]} alt="" /><div className="lf-booking-info"><h3>{serviceTitles[booking.serviceId]}</h3><p>{appointment(booking.date, booking.time)}</p><small>{worker ? booking.customerName : booking.id}</small></div><div className="lf-booking-meta"><Status status={booking.status} /><strong>{booking.quote !== null ? `${money(booking.quote + (worker ? 0 : booking.visitFee))}${worker ? ' work' : ''}` : worker ? 'Quote pending' : `${money(booking.visitFee)} visit fee`}</strong></div><NavLink href={{ pathname: worker ? '/(worker)/execution' : '/(customer)/job-detail', params: { id: booking.id } }} className="lf-icon-button" aria-label={`View ${serviceTitles[booking.serviceId]} booking`}><Icon name="arrow-forward" size={18} /></NavLink></article>;
}

export function JobsPage({ worker = false }: { worker?: boolean }) {
  const bookings = useWebStore((state) => state.bookings);
  const [filter, setFilter] = useState('all');
  const visible = bookings.filter((booking) => filter === 'all' || (filter === 'active' ? !['completed', 'cancelled'].includes(booking.status) : booking.status === filter));
  return <><Heading eyebrow={worker ? 'Your work, organised' : 'Your home, taken care of'} title={worker ? 'My jobs' : 'My bookings'} action={!worker && <NavLink href="/" className="lf-button primary"><Icon name="add" size={18} />Book a service</NavLink>}>Appointments, progress and the little things you got sorted.</Heading><div className="lf-filters" aria-label="Filter bookings">{['all', 'active', 'completed', 'cancelled'].map((value) => <button className={`lf-filter ${filter === value ? 'selected' : ''}`} key={value} aria-pressed={filter === value} onClick={() => setFilter(value)}>{value.charAt(0).toUpperCase() + value.slice(1)}{value === 'all' ? ` (${bookings.length})` : ''}</button>)}</div>{visible.length ? <div className="lf-booking-list">{visible.map((booking) => <BookingRow key={booking.id} booking={booking} worker={worker} />)}</div> : <EmptyState title={bookings.length ? 'Nothing here just yet' : worker ? 'Your next job starts here' : 'A fresh start for your home'} href={worker ? '/(worker)/(tabs)/home' : '/'} label={worker ? 'View workspace' : 'Find a service'}>{bookings.length ? 'No bookings match this filter.' : worker ? 'Accepted and completed jobs will appear here.' : 'When you book a service, all the details will be waiting here.'}</EmptyState>}</>;
}

const timeline: { status: BookingStatus; title: string; detail: string }[] = [
  { status: 'requested', title: 'Booking confirmed', detail: 'Your appointment and visit fee are recorded.' },
  { status: 'accepted', title: 'Professional assigned', detail: 'A professional has accepted the job.' },
  { status: 'en_route', title: 'On the way', detail: 'Your professional is travelling to your address.' },
  { status: 'arrived', title: 'Visit & assessment', detail: 'The job is assessed before a quote is shared.' },
  { status: 'quoted', title: 'Approve your quote', detail: 'Work only begins after your approval.' },
  { status: 'in_progress', title: 'Work in progress', detail: 'Your professional is taking care of the job.' },
  { status: 'completed', title: 'All sorted', detail: 'Review the work, settle the bill and leave a rating.' },
];

export function JobPage({ worker = false }: { worker?: boolean }) {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const store = useWebStore();
  const booking = id ? store.bookings.find((item) => item.id === id) : store.bookings.find((item) => !['completed', 'cancelled'].includes(item.status));
  const [error, setError] = useState('');
  const [quote, setQuote] = useState('');
  const [cancelOpen, setCancelOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [message, setMessage] = useState('');
  if (!booking) return <EmptyState title={id ? 'Booking not found' : 'No active booking'} href={worker ? '/(worker)/(tabs)/jobs' : '/(customer)/(tabs)/jobs'} label="View all bookings">This booking may have been cleared from this browser. Your other bookings are still available in your workspace.</EmptyState>;
  const currentIndex = timeline.findIndex((step) => step.status === booking.status);
  function act(action: BookingAction, amount?: number) {
    try { store.act(booking!.id, action, amount); setError(''); setCancelOpen(false); } catch (caught) { setError(caught instanceof Error ? caught.message : 'Unable to update booking.'); }
  }
  const progressAction: Partial<Record<BookingStatus, { action: BookingAction; label: string }>> = {
    requested: { action: 'accept', label: worker ? 'Accept job' : 'Simulate assignment' },
    accepted: { action: 'travel', label: worker ? 'Start travelling' : 'Simulate departure' },
    en_route: { action: 'arrive', label: worker ? 'Mark arrived' : 'Simulate arrival' },
    arrived: { action: 'quote', label: worker ? 'Send quote' : 'Simulate quote' },
    in_progress: { action: 'complete', label: worker ? 'Complete work' : 'Simulate completion' },
  };
  const progress = progressAction[booking.status];
  const bill = `LocalFix - DEMO RECEIPT\nBooking: ${booking.id}\nCustomer: ${booking.customerName}\nService: ${serviceTitles[booking.serviceId]}\nVisit fee: INR ${booking.visitFee}\nWork: INR ${booking.quote ?? 0}\nTotal: INR ${booking.visitFee + (booking.quote ?? 0)}\nPayment: Simulated only; no real charge.\n`;
  return <>
    <NavLink href={worker ? '/(worker)/(tabs)/jobs' : '/(customer)/(tabs)/jobs'} className="lf-text-button"><Icon name="arrow-back" size={16} />All {worker ? 'jobs' : 'bookings'}</NavLink>
    <div style={{ marginTop: 22 }}><Heading eyebrow={booking.id} title={booking.status === 'cancelled' ? 'Booking cancelled.' : booking.status === 'completed' ? 'One more thing, sorted.' : 'Your appointment, at a glance.'}>{appointment(booking.date, booking.time)}</Heading></div>
    {error && <Notice error>{error}</Notice>}{message && <Notice>{message}</Notice>}
    <div className="lf-detail-grid"><div><div className="lf-detail-header"><img src={serviceImages[booking.serviceId]} alt={serviceTitles[booking.serviceId]} /><div><h2>{serviceTitles[booking.serviceId]}</h2><p>{booking.customerName}</p><Status status={booking.status} /></div></div>
      {booking.status !== 'cancelled' && <ol className="lf-timeline">{timeline.map((step, index) => <li key={step.status} className={index < currentIndex ? 'done' : index === currentIndex ? 'current' : ''} aria-current={index === currentIndex ? 'step' : undefined}><span>{index < currentIndex ? <Icon name="checkmark" size={14} /> : index + 1}</span><div><strong>{step.title}</strong><p>{step.detail}</p></div></li>)}</ol>}
      <section className="lf-detail-section"><h3>Job details</h3><p>{booking.description}</p><div className="lf-inline-details"><div><small>Address</small><p>{booking.address}</p></div><div><small>Professional</small><p>{booking.status === 'requested' || booking.status === 'cancelled' ? 'Not assigned' : 'LocalFix demo professional'}</p></div></div></section>
      {booking.status === 'completed' && booking.paid && !worker && <section className="lf-detail-section"><h3>{booking.rating ? 'Thanks for your feedback.' : 'How did it go?'}</h3><div className="lf-stars" role="group" aria-label="Rate this service">{[1, 2, 3, 4, 5].map((value) => <button key={value} aria-label={`${value} star${value > 1 ? 's' : ''}`} aria-pressed={(rating || booking.rating) === value} onClick={() => setRating(value)}><Icon name={value <= (rating || booking.rating) ? 'star' : 'star-outline'} size={28} /></button>)}</div><Action disabled={!rating} icon="checkmark" onClick={() => { act('rate', rating); setMessage('Your rating has been saved.'); setRating(0); }}>{booking.rating ? 'Update rating' : 'Submit rating'}</Action></section>}
      {!worker && !['in_progress', 'completed', 'cancelled'].includes(booking.status) && <section className="lf-detail-section">{cancelOpen ? <div className="lf-confirm"><h3>Cancel this appointment?</h3><p>The visit fee remains recorded. No real money was collected.</p><div><Action variant="secondary" onClick={() => setCancelOpen(false)}>Keep booking</Action><Action variant="danger" onClick={() => act('cancel')}>Cancel appointment</Action></div></div> : <Action variant="quiet" icon="close-circle-outline" onClick={() => setCancelOpen(true)}>Cancel booking</Action>}</section>}
    </div><aside className="lf-summary"><h3>Cost breakdown</h3><div className="lf-price-line"><span>Visit fee (demo paid)</span><strong>{money(booking.visitFee)}</strong></div><div className="lf-price-line"><span>Work quote</span><strong>{booking.quote !== null ? money(booking.quote) : 'After assessment'}</strong></div><div className="lf-price-line total"><span>{booking.quote === null ? 'Visit total' : 'Total'}</span><strong>{money(booking.visitFee + (booking.quote ?? 0))}</strong></div><p className="lf-price-note">{booking.status === 'cancelled' ? 'Cancelled. No work payment is due.' : booking.paid ? 'Paid in demo mode. No real charge.' : booking.status === 'quoted' ? 'Review the quote before work begins.' : 'Work payment is due after completion.'}</p>
      {booking.status === 'quoted' && !worker && <><Notice>Your work quote is {money(booking.quote!)}. The {money(booking.visitFee)} visit fee is separate.</Notice><Action icon="checkmark" onClick={() => act('approve')}>Approve {money(booking.quote!)}</Action></>}
      {booking.status === 'completed' && !booking.paid && !worker && <><Notice>The work is complete. Outstanding demo payment: {money(booking.quote!)}.</Notice><Action icon="wallet-outline" onClick={() => act('pay')}>Pay {money(booking.quote!)} in demo</Action></>}
      {booking.paid && <a href={`data:text/plain;charset=utf-8,${encodeURIComponent(bill)}`} download={`${booking.id}-receipt.txt`} className="lf-button secondary" style={{ marginTop: 18 }}><Icon name="download-outline" size={18} />Download receipt</a>}
      {progress && <section className="lf-simulator"><span>{worker ? 'Professional actions' : 'Demo controls'}</span><p>{worker ? 'Update the job when you reach the next stage.' : 'This appointment uses a simulated professional.'}</p>{worker && booking.status === 'requested' && !store.online && <Notice>Go online in Overview before accepting a job.</Notice>}{worker && booking.status === 'arrived' && <label className="lf-field">Work quote (INR)<input required type="number" min="0.01" max="100000" step="0.01" value={quote} onChange={(event) => setQuote(event.target.value)} placeholder="Amount excluding visit fee" /></label>}<Action variant="secondary" disabled={worker && ((booking.status === 'requested' && !store.online) || (booking.status === 'arrived' && !quote))} icon="arrow-forward" onClick={() => act(progress.action, progress.action === 'quote' ? worker ? Number(quote) : booking.startingPrice : undefined)}>{progress.label}</Action></section>}
      {worker && booking.status === 'quoted' && <section className="lf-simulator"><span>Demo controls</span><p>The customer must approve this quote before work begins.</p><Action variant="secondary" onClick={() => act('approve')}>Simulate customer approval</Action></section>}
      {worker && booking.status === 'completed' && !booking.paid && <section className="lf-simulator"><span>Demo controls</span><p>The customer payment is outstanding.</p><Action variant="secondary" onClick={() => act('pay')}>Simulate customer payment</Action></section>}
      <div style={{ marginTop: 22 }}><NavLink href="/(modals)/support" className="lf-text-button"><Icon name="chatbubble-ellipses-outline" size={18} />Need a hand?</NavLink></div>
    </aside></div>
  </>;
}

export function WorkerJobPage() { return <JobPage worker />; }
export function WorkerJobsPage() { return <JobsPage worker />; }
export function TrackPage() {
  const auth = useAuthStore();
  return <Redirect href={auth.role === 'worker' ? '/(worker)/(tabs)/jobs' : '/(customer)/(tabs)/jobs'} />;
}