import { Access } from '@/components/web/AppShell';
import { Slot } from 'expo-router';
export default function WorkerLayout() { return <Access role="worker"><Slot /></Access>; }