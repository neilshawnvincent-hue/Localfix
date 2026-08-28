import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { JobStatus } from '@/constants/mockData';

const statusConfig: Record<
  JobStatus,
  { label: string; bgColor: string; textColor: string }
> = {
  searching: { label: 'Searching', bgColor: 'rgba(245,158,11,0.15)', textColor: '#FBBF24' },
  assigned: { label: 'Assigned', bgColor: 'rgba(59,130,246,0.15)', textColor: '#60A5FA' },
  en_route: { label: 'En Route', bgColor: 'rgba(37,99,235,0.15)', textColor: '#60A5FA' },
  arrived: { label: 'Arrived', bgColor: 'rgba(168,85,247,0.15)', textColor: '#C084FC' },
  in_progress: { label: 'In Progress', bgColor: 'rgba(6,182,212,0.15)', textColor: '#22D3EE' },
  completed: { label: 'Completed', bgColor: 'rgba(34,197,94,0.15)', textColor: '#4ADE80' },
  cancelled: { label: 'Cancelled', bgColor: 'rgba(239,68,68,0.15)', textColor: '#F87171' },
};

export default function StatusBadge({ status }: { status: JobStatus }) {
  const config = statusConfig[status];
  return (
    <View style={[styles.badge, { backgroundColor: config.bgColor }]}>
      <Text style={[styles.text, { color: config.textColor }]}>{config.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 100,
  },
  text: {
    fontSize: 12,
    fontWeight: '700',
  },
});
