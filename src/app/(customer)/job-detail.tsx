import { useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import BackButton from '@/components/ui/BackButton';
import StatusBadge from '@/components/ui/StatusBadge';
import StarRating from '@/components/ui/StarRating';
import { getHistoryJobById, type JobStatus } from '@/constants/mockData';
import { useRatingStore } from '@/store/ratingStore';

function formatDate(iso?: string) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function formatTime(iso?: string) {
  if (!iso) return '—';
  return new Date(iso).toLocaleTimeString('en-IN', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

function formatDuration(startIso?: string, endIso?: string) {
  if (!startIso || !endIso) return '—';
  const ms = new Date(endIso).getTime() - new Date(startIso).getTime();
  if (ms <= 0) return '—';
  const totalMinutes = Math.round(ms / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours === 0) return `${minutes} min`;
  if (minutes === 0) return `${hours} hr`;
  return `${hours} hr ${minutes} min`;
}

function InfoRow({
  icon,
  label,
  value,
  iconColor = '#2563EB',
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  iconColor?: string;
}) {
  return (
    <View style={styles.infoRow}>
      <View style={[styles.infoIconBox, { backgroundColor: `${iconColor}1A` }]}>
        <Ionicons name={icon} size={18} color={iconColor} />
      </View>
      <View style={styles.infoTextWrap}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
      </View>
    </View>
  );
}

export default function JobDetailScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const job = useMemo(() => getHistoryJobById(id), [id]);

  const storedRating = useRatingStore((s) => (job ? s.ratings[job.id] : undefined));
  const setRating = useRatingStore((s) => s.setRating);

  if (!job) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <BackButton color="#111827" />
        </View>
        <View style={styles.emptyWrap}>
          <Ionicons name="alert-circle-outline" size={48} color="#9CA3AF" />
          <Text style={styles.emptyText}>This job could not be found.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const currentRating = storedRating ?? job.rating ?? 0;
  const consultationFee = job.consultationFee ?? 0;
  const finalQuote = job.finalQuote ?? 0;
  const total = consultationFee + finalQuote;

  const handleRate = (stars: number) => {
    setRating(job.id, stars);
    Alert.alert('Thank you!', `You rated this ${job.serviceName} job ${stars} star${stars > 1 ? 's' : ''}.`);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <BackButton color="#111827" />
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Service header */}
        <Animated.View entering={FadeInDown.duration(400)} style={styles.titleRow}>
          <View style={styles.serviceIconBox}>
            <Ionicons name="construct" size={28} color="#2563EB" />
          </View>
          <View style={styles.titleTextWrap}>
            <Text style={styles.serviceName}>{job.serviceName}</Text>
            {job.workerName ? <Text style={styles.workerName}>with {job.workerName}</Text> : null}
          </View>
          <StatusBadge status={job.status as JobStatus} />
        </Animated.View>

        {job.description ? (
          <Animated.View entering={FadeInDown.delay(80).duration(400)}>
            <Text style={styles.description}>{job.description}</Text>
          </Animated.View>
        ) : null}

        {/* Timings card */}
        <Animated.View entering={FadeInDown.delay(140).duration(400)} style={styles.card}>
          <Text style={styles.cardTitle}>Timings</Text>
          <InfoRow icon="calendar-outline" label="Booked on" value={formatDate(job.createdAt)} />
          <InfoRow icon="time-outline" label="Booked at" value={formatTime(job.createdAt)} iconColor="#7C3AED" />
          <InfoRow icon="play-circle-outline" label="Work started" value={formatTime(job.startedAt)} iconColor="#059669" />
          <InfoRow icon="checkmark-circle-outline" label="Work finished" value={formatTime(job.completedAt)} iconColor="#DC2626" />
          <InfoRow
            icon="hourglass-outline"
            label="Total duration"
            value={formatDuration(job.startedAt, job.completedAt)}
            iconColor="#D97706"
          />
        </Animated.View>

        {/* Payment card */}
        <Animated.View entering={FadeInDown.delay(200).duration(400)} style={styles.card}>
          <Text style={styles.cardTitle}>Payment</Text>
          <View style={styles.payRow}>
            <Text style={styles.payLabel}>Consultation fee</Text>
            <Text style={styles.payValue}>₹{consultationFee}</Text>
          </View>
          <View style={styles.payRow}>
            <Text style={styles.payLabel}>Service charges</Text>
            <Text style={styles.payValue}>₹{finalQuote}</Text>
          </View>
          <View style={[styles.payRow, styles.payTotalRow]}>
            <Text style={styles.payTotalLabel}>Total paid</Text>
            <Text style={styles.payTotalValue}>₹{total}</Text>
          </View>
        </Animated.View>

        {/* Rating card */}
        <Animated.View entering={FadeInDown.delay(260).duration(400)} style={styles.card}>
          <Text style={styles.cardTitle}>Rate this service</Text>
          <Text style={styles.rateSubtitle}>
            {currentRating > 0
              ? 'Tap a star to update your rating'
              : 'How was your experience? Tap to rate.'}
          </Text>
          <View style={styles.starWrap}>
            <StarRating value={currentRating} onChange={handleRate} size={40} />
          </View>
          {currentRating > 0 ? (
            <Text style={styles.ratingConfirm}>You rated {currentRating} out of 5</Text>
          ) : null}
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { paddingHorizontal: 20, paddingTop: 8 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 40 },
  emptyWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  emptyText: { fontSize: 16, color: '#6B7280', fontWeight: '500' },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 12,
  },
  serviceIconBox: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: 'rgba(37,99,235,0.10)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  titleTextWrap: { flex: 1 },
  serviceName: { fontSize: 22, fontWeight: '800', color: '#111827' },
  workerName: { fontSize: 14, color: '#6B7280', marginTop: 2 },
  description: {
    fontSize: 14,
    lineHeight: 20,
    color: '#374151',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 14,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  infoIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  infoTextWrap: { flex: 1 },
  infoLabel: { fontSize: 13, color: '#6B7280' },
  infoValue: { fontSize: 15, fontWeight: '600', color: '#111827', marginTop: 1 },
  payRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  payLabel: { fontSize: 14, color: '#6B7280' },
  payValue: { fontSize: 14, fontWeight: '600', color: '#374151' },
  payTotalRow: {
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 12,
    marginBottom: 0,
  },
  payTotalLabel: { fontSize: 15, fontWeight: '700', color: '#111827' },
  payTotalValue: { fontSize: 18, fontWeight: '800', color: '#059669' },
  rateSubtitle: { fontSize: 13, color: '#6B7280', marginTop: -6, marginBottom: 14 },
  starWrap: { alignItems: 'center', marginVertical: 4 },
  ratingConfirm: {
    textAlign: 'center',
    marginTop: 12,
    fontSize: 14,
    fontWeight: '600',
    color: '#D97706',
  },
});
