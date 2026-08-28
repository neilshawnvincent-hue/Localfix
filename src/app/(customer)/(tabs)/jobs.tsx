import { View, Text, ScrollView, StyleSheet, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { MOCK_JOB_HISTORY } from '@/constants/mockData';
import StatusBadge from '@/components/ui/StatusBadge';
import StarRating from '@/components/ui/StarRating';
import { useRatingStore } from '@/store/ratingStore';
import type { JobStatus } from '@/constants/mockData';
import Animated, { FadeInDown } from 'react-native-reanimated';

export default function CustomerJobsScreen() {
  const router = useRouter();
  const ratings = useRatingStore((s) => s.ratings);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.flex} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>My Jobs</Text>
        {MOCK_JOB_HISTORY.map((job, index) => {
          const rating = ratings[job.id] ?? job.rating ?? 0;
          return (
            <Animated.View key={job.id} entering={FadeInDown.delay(index * 100).duration(400)}>
              <Pressable
                onPress={() => router.push({ pathname: '/(customer)/job-detail', params: { id: job.id } })}
                style={({ pressed }) => [styles.historyItem, pressed && styles.historyItemPressed]}
                accessibilityRole="button"
                accessibilityLabel={`View details for ${job.serviceName} job`}
              >
                <View style={styles.historyIconBox}>
                  <Ionicons name="construct-outline" size={24} color="#1A1A1A" />
                </View>
                <View style={styles.historyContent}>
                  <Text style={styles.historyId}>{job.serviceName}</Text>
                  <Text style={styles.historyDesc}>
                    {job.workerName ? `${job.workerName} • ` : ''}
                    {new Date(job.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                  </Text>
                  {rating > 0 ? (
                    <View style={styles.ratingRow}>
                      <StarRating value={rating} size={14} readOnly />
                    </View>
                  ) : (
                    <Text style={styles.rateHint}>Tap to rate</Text>
                  )}
                </View>
                <View style={styles.trailing}>
                  <StatusBadge status={job.status as JobStatus} />
                  <Ionicons name="chevron-forward" size={18} color="#9CA3AF" style={styles.chevron} />
                </View>
              </Pressable>
            </Animated.View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FFFFFF' },
  flex: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 24 },
  title: { color: '#111827', fontSize: 24, fontWeight: '700', paddingVertical: 24 },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderRadius: 16,
  },
  historyItemPressed: {
    backgroundColor: '#F9FAFB',
  },
  historyIconBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  historyContent: {
    flex: 1,
  },
  historyId: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  historyDesc: {
    fontSize: 13,
    color: '#6B7280',
  },
  ratingRow: {
    marginTop: 6,
    marginLeft: -4,
  },
  rateHint: {
    marginTop: 6,
    fontSize: 12,
    fontWeight: '600',
    color: '#2563EB',
  },
  trailing: {
    alignItems: 'flex-end',
  },
  chevron: {
    marginTop: 8,
  },
});
