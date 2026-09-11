import AppShell from '@/components/web/AppShell';
import '@/components/web/web.css';
import { Slot } from 'expo-router';

export default function WebLayout() {
  return <AppShell><Slot /></AppShell>;
}