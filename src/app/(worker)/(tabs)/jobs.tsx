import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';

const MOCK_WORKER_JOBS = [
  { id: 'wj1', serviceName: 'Plumber', customerName: 'Priya Sharma', earned: 510, date: '2026-08-17T10:30:00Z' },
  { id: 'wj2', serviceName: 'Plumber', customerName: 'Amit Patel', earned: 360, date: '2026-08-17T08:15:00Z' },
  { id: 'wj3', serviceName: 'Electrician', customerName: 'Sneha Reddy', earned: 670, date: '2026-08-16T14:00:00Z' },
  { id: 'wj4', serviceName: 'Plumber', customerName: 'Ravi Kumar', earned: 290, date: '2026-08-16T09:45:00Z' },
];

export default function WorkerJobsScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.flex} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Job History</Text>
        {MOCK_WORKER_JOBS.map((job, index) => (
          <Animated.View key={job.id} entering={FadeInDown.delay(index * 100).duration(400)}>
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>{job.serviceName}</Text>
                <Text style={styles.earned}>+₹{job.earned}</Text>
              </View>
              <View style={styles.infoRow}>
                <Ionicons name="person" size={14} color="#94A3B8" />
                <Text style={styles.infoText}>{job.customerName}</Text>
              </View>
              <Text style={styles.dateText}>
                {new Date(job.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
              </Text>
            </View>
          </Animated.View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FFFFFF' },
  flex: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 24 },
  title: { color: '#1A1A1A', fontSize: 24, fontWeight: '700', paddingVertical: 24 },
  card: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 16, padding: 16, marginBottom: 12 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  cardTitle: { color: '#1A1A1A', fontWeight: '700', fontSize: 16 },
  earned: { color: '#16A34A', fontWeight: '700' },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  infoText: { color: '#6B7280', fontSize: 14, marginLeft: 8 },
  dateText: { color: '#9CA3AF', fontSize: 12 },
});
