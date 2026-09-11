import { Access } from '@/components/web/AppShell';
import { Slot } from 'expo-router';
export default function VerificationLayout() { return <Access role="worker" verified={false}><Slot /></Access>; }