import { Access } from '@/components/web/AppShell';
import { Slot } from 'expo-router';
export default function CustomerLayout() { return <Access role="customer"><Slot /></Access>; }