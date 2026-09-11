import { STATUS_LABELS, type BookingStatus } from '@/lib/bookingFlow';
import { Ionicons } from '@expo/vector-icons';
import { Link, type Href } from 'expo-router';
import type { ButtonHTMLAttributes, ComponentProps, ReactNode } from 'react';

export type IconName = keyof typeof Ionicons.glyphMap;
export function Icon({ name, size = 20 }: { name: IconName; size?: number }) {
  return <span className="lf-icon" aria-hidden="true"><Ionicons name={name} size={size} color="currentColor" /></span>;
}
export function Action({ children, icon, variant = 'primary', className = '', ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { icon?: IconName; variant?: 'primary' | 'secondary' | 'quiet' | 'danger' }) {
  return <button type="button" className={`lf-button ${variant} ${className}`} {...props}>{icon && <Icon name={icon} size={18} />}{children}</button>;
}
function WebAnchor({ onPress: _onPress, ...props }: ComponentProps<'a'> & { onPress?: unknown }) {
  return <a {...props} />;
}
export function NavLink({ href, children, className = '', ...props }: { href: Href; children: ReactNode; className?: string; 'aria-current'?: 'page'; 'aria-label'?: string }) {
  return <Link href={href} asChild><WebAnchor className={className} {...props}>{children}</WebAnchor></Link>;
}
export function Heading({ eyebrow, title, children, action }: { eyebrow: string; title: string; children?: ReactNode; action?: ReactNode }) {
  return <div className="lf-heading"><div><p className="lf-eyebrow">{eyebrow}</p><h1>{title}</h1>{children && <p className="lf-lead">{children}</p>}</div>{action}</div>;
}
export function EmptyState({ icon = 'calendar-outline', title, children, href, label }: { icon?: IconName; title: string; children: ReactNode; href?: Href; label?: string }) {
  return <div className="lf-empty"><span className="lf-empty-icon"><Icon name={icon} size={30} /></span><h2>{title}</h2><p>{children}</p>{href && <NavLink href={href} className="lf-button primary">{label}<Icon name="arrow-forward" size={18} /></NavLink>}</div>;
}
export function Status({ status }: { status: BookingStatus }) {
  return <span className={`lf-status ${status}`}><span />{STATUS_LABELS[status]}</span>;
}
export function Notice({ children, error = false }: { children: ReactNode; error?: boolean }) {
  return <div className={`lf-notice ${error ? 'error' : ''}`} role={error ? 'alert' : 'status'}><Icon name={error ? 'alert-circle-outline' : 'information-circle-outline'} /><span>{children}</span></div>;
}
export const money = (amount: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(amount);
export const appointment = (date: string, time: string) => new Date(`${date}T${time}:00`).toLocaleString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' });
export const serviceImages: Record<string, string> = {
  plumber: '/images/plumbing.jpg', electrician: '/images/electrical.jpg', carpenter: '/images/carpentry.jpg', painter: '/images/painting.jpg', cleaner: '/images/cleaning.jpg', 'ac-repair': '/images/ac-repair.jpg',
};
export const serviceTitles: Record<string, string> = { plumber: 'Plumbing', electrician: 'Electrical', carpenter: 'Carpentry', painter: 'Painting', cleaner: 'Home cleaning', 'ac-repair': 'AC & appliance repair' };