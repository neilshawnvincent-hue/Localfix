import { ArrowRight, Check, CheckCheck, House, Phone, ShieldCheck, Siren, X, type LucideIcon } from 'lucide-react-native';
import { useState, type ReactNode } from 'react';
import { ActivityIndicator, Image, Linking, Modal, Pressable, ScrollView, Text, TextInput, View, type TextInputProps } from 'react-native';
import Animated, { FadeInDown, ReduceMotion } from 'react-native-reanimated';
import type { Job, Role } from '../domain/marketplace';

export function Copy({ children, className = '', ...props }: React.ComponentProps<typeof Text>) {
  return <Text {...props} className={`font-sans text-[14px] leading-[22px] text-ink ${className}`}>{children}</Text>;
}
export function Heading({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <Text accessibilityRole="header" className={`font-display text-[22px] leading-[30px] text-ink ${className}`}>{children}</Text>;
}
export function Logo({ light = false }: { light?: boolean }) {
  return <View className="flex-row items-center gap-2.5"><View className={`h-10 w-10 items-center justify-center rounded-lg ${light ? 'bg-white/20' : 'bg-primary'}`}><House size={24} color="white" strokeWidth={2.2} /></View><Text className={`font-displaybold text-[26px] ${light ? 'text-white' : 'text-ink'}`}>Local<Text className={light ? 'text-white' : 'text-primary'}>Fix</Text><Text className="text-primary">.</Text></Text></View>;
}
export function Button({ label, onPress, icon: Icon, variant = 'primary', loading = false, disabled = false, className = '', testID }: { label: string; onPress: () => void; icon?: LucideIcon; variant?: 'primary' | 'secondary' | 'ghost' | 'danger'; loading?: boolean; disabled?: boolean; className?: string; testID?: string }) {
  const [hover, setHover] = useState(false);
  const filled = variant === 'primary' || variant === 'danger';
  return <Pressable testID={testID} accessibilityRole="button" accessibilityLabel={label} accessibilityState={{ disabled: disabled || loading, busy: loading }} disabled={disabled || loading} onPress={onPress} onHoverIn={() => setHover(true)} onHoverOut={() => setHover(false)} className={`min-h-12 flex-row items-center justify-center gap-2 rounded-lg px-5 py-3 ${variant === 'primary' ? 'bg-primary' : variant === 'danger' ? 'bg-red-700' : variant === 'secondary' ? 'border border-line bg-white' : 'bg-transparent'} ${disabled || loading ? 'opacity-50' : hover ? 'opacity-80' : ''} ${className}`}>
    {loading ? <ActivityIndicator size="small" color={filled ? '#FFFFFF' : '#287454'} /> : Icon ? <Icon size={18} color={filled ? '#FFFFFF' : '#287454'} /> : null}<Text className={`font-semibold text-[14px] ${filled ? 'text-white' : 'text-primary'}`}>{label}</Text>
  </Pressable>;
}
export function IconButton({ icon: Icon, label, onPress, active = false, danger = false }: { icon: LucideIcon; label: string; onPress: () => void; active?: boolean; danger?: boolean }) {
  const [hover, setHover] = useState(false);
  return <View className="relative"><Pressable accessibilityRole="button" accessibilityLabel={label} onPress={onPress} onHoverIn={() => setHover(true)} onHoverOut={() => setHover(false)} className={`h-11 w-11 items-center justify-center rounded-lg ${active ? 'bg-mint' : 'bg-transparent'}`}><Icon size={20} color={danger ? '#B44148' : active ? '#287454' : '#64766D'} fill={active ? '#EAF3ED' : 'none'} /></Pressable>{hover && <View pointerEvents="none" className="absolute right-0 top-12 z-50 min-w-28 rounded bg-ink px-3 py-1"><Copy className="text-center text-xs text-white">{label}</Copy></View>}</View>;
}
export function Field({ label, error, className = '', ...props }: TextInputProps & { label: string; error?: string }) {
  return <View className="gap-2"><Copy className="font-semibold text-[13px]">{label}</Copy><TextInput accessibilityLabel={label} placeholderTextColor="#96A19B" {...props} className={`min-h-12 rounded-lg border ${error ? 'border-red-400' : 'border-line'} bg-white px-4 py-3 font-sans text-[14px] text-ink ${className}`} />{error && <Copy accessibilityRole="alert" className="text-xs text-red-700">{error}</Copy>}</View>;
}
export function Notice({ message, kind = 'error' }: { message: string | null; kind?: 'error' | 'info' | 'success' }) {
  if (!message) return null;
  return <View accessibilityRole="alert" className={`rounded-lg p-3 ${kind === 'error' ? 'bg-rose' : 'bg-mint'}`}><Copy className={`text-[13px] ${kind === 'error' ? 'text-red-800' : 'text-primary'}`}>{message}</Copy></View>;
}
export function Badge({ label, tone = 'green', icon = false }: { label: string; tone?: 'green' | 'amber' | 'gray' | 'purple'; icon?: boolean }) {
  return <View className={`self-start flex-row items-center gap-1 rounded px-2 py-1 ${tone === 'green' ? 'bg-mint' : tone === 'amber' ? 'bg-peach' : tone === 'purple' ? 'bg-lilac' : 'bg-canvas'}`}>{icon && <ShieldCheck size={12} color="#287454" />}<Text className={`font-medium text-[11px] ${tone === 'amber' ? 'text-amber-800' : tone === 'purple' ? 'text-violet-700' : tone === 'gray' ? 'text-muted' : 'text-primary'}`}>{label}</Text></View>;
}
export function RoleBadge({ role }: { role: Role }) { return <Badge label={role === 'customer' ? 'Customer' : 'Service partner'} tone={role === 'customer' ? 'green' : 'purple'} />; }
export function Avatar({ uri, name, large = false }: { uri?: string; name: string; large?: boolean }) {
  return uri ? <Image accessibilityLabel={name} source={{ uri }} className={`${large ? 'h-16 w-16' : 'h-11 w-11'} rounded-full bg-mint`} /> : <View className={`${large ? 'h-16 w-16' : 'h-11 w-11'} items-center justify-center rounded-full bg-peach`}><Text className="font-display text-lg text-ink">{name.split(' ').map(word => word[0]).slice(0, 2).join('')}</Text></View>;
}
export function Panel({ children, className = '' }: { children: ReactNode; className?: string }) { return <View className={`rounded-lg border border-line bg-white ${className}`}>{children}</View>; }
export function Reveal({ children }: { children: ReactNode }) { return <Animated.View entering={FadeInDown.duration(280).reduceMotion(ReduceMotion.System)}>{children}</Animated.View>; }
export function EmptyState({ title, description, action }: { title: string; description: string; action?: ReactNode }) {
  return <View className="items-center gap-3 py-16"><View className="mb-2 h-14 w-14 items-center justify-center rounded-full bg-mint"><House size={26} color="#287454" /></View><Heading className="text-lg">{title}</Heading><Copy className="max-w-sm text-center text-muted">{description}</Copy>{action}</View>;
}
export function Sheet({ visible, title, children, onClose }: { visible: boolean; title: string; children: ReactNode; onClose: () => void }) {
  return <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}><View className="flex-1 items-center justify-center bg-black/40 p-4"><View accessibilityViewIsModal className="max-h-[92%] w-full max-w-xl rounded-lg bg-canvas"><View className="flex-row items-center justify-between border-b border-line px-6 py-4"><Heading className="flex-1 text-xl">{title}</Heading><IconButton label="Close dialog" icon={X} onPress={onClose} /></View><ScrollView keyboardShouldPersistTaps="handled" contentContainerClassName="gap-5 p-6">{children}</ScrollView></View></View></Modal>;
}
export function Timeline({ job }: { job: Job }) {
  const steps = ['Requested', 'Confirmed', 'In progress', 'Completed'];
  const current = ['requested', 'accepted', 'in_progress', 'completed'].indexOf(job.status);
  return <View className="gap-0">{steps.map((step, index) => <View key={step} className="flex-row gap-3"><View className="items-center"><View className={`h-7 w-7 items-center justify-center rounded-full ${index <= current ? 'bg-primary' : 'border border-line bg-white'}`}>{index < current ? <Check size={14} color="white" /> : <Text className={`font-semibold text-xs ${index === current ? 'text-white' : 'text-muted'}`}>{index + 1}</Text>}</View>{index < 3 && <View className={`my-1 h-6 w-px ${index < current ? 'bg-primary' : 'bg-line'}`} />}</View><View className="pt-0.5"><Copy className={`text-[13px] ${index === current ? 'font-bold' : index < current ? 'text-primary' : 'text-muted'}`}>{step}</Copy></View></View>)}</View>;
}
export function SOSButton({ jobId, demo, onRecord }: { jobId: string; demo: boolean; onRecord: () => Promise<void> }) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const send = async () => { setBusy(true); try { await onRecord(); setMessage(demo ? 'Demo alert recorded locally. No emergency services have been contacted.' : 'Safety alert recorded. For immediate danger, call 112.'); } catch { setMessage('The alert could not be sent. For immediate danger, call 112.'); } finally { setBusy(false); } };
  return <><Pressable accessibilityRole="button" accessibilityLabel="SOS emergency help" onPress={() => setOpen(true)} className="min-h-11 flex-row items-center justify-center gap-2 rounded-lg border border-red-200 bg-rose px-4 py-2"><Siren color="#B44148" size={18} /><Copy className="font-semibold text-[13px] text-red-800">SOS emergency help</Copy></Pressable><Sheet visible={open} title="Your safety comes first" onClose={() => setOpen(false)}><Copy>Booking {jobId}. If you are in immediate danger, call India&apos;s emergency helpline.</Copy><Button label="Call 112" icon={Phone} variant="danger" onPress={() => { void Linking.openURL('tel:112').catch(() => setMessage('Please dial 112 from your phone.')); }} /><Button label={demo ? 'Simulate safety alert' : 'Send safety alert'} icon={Siren} variant="secondary" loading={busy} onPress={() => void send()} /><Notice message={message} kind="info" /></Sheet></>;
}
export function TextLink({ label, onPress }: { label: string; onPress: () => void }) { return <Pressable accessibilityRole="button" accessibilityLabel={label} onPress={onPress} className="min-h-11 flex-row items-center gap-2"><Copy className="font-semibold text-[13px] text-primary">{label}</Copy><ArrowRight size={15} color="#287454" /></Pressable>; }
export function TrustLine() { return <View className="flex-row flex-wrap items-center justify-center gap-4"><View className="flex-row items-center gap-1"><ShieldCheck size={14} color="#7A8981" /><Copy className="text-xs text-muted">Verified neighbors</Copy></View><View className="flex-row items-center gap-1"><CheckCheck size={14} color="#7A8981" /><Copy className="text-xs text-muted">Secure bookings</Copy></View></View>; }