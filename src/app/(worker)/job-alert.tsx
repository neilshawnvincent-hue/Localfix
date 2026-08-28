import { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useJobStore } from '@/store/jobStore';
import { CONSULTATION_FEE } from '@/constants/services';
import { MOCK_ACTIVE_JOB } from '@/constants/mockData';
import Button from '@/components/ui/Button';
import * as Haptics from 'expo-haptics';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

export default function JobAlertScreen() {
  const router = useRouter();
  const { acceptJob, declineJob } = useJobStore();
  const [countdown, setCountdown] = useState(30);

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) { clearInterval(interval); handleDecline(); return 0; }
        return prev - 1;
      });
    }, 1000);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    return () => clearInterval(interval);
  }, []);

  const handleAccept = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    acceptJob();
    router.replace('/(worker)/execution');
  };

  const handleDecline = () => {
    declineJob();
    router.back();
  };

  return (
    <SafeAreaView style={styles.safe}>
      <Animated.View entering={FadeIn.duration(400)} style={styles.inner}>
        {/* Countdown */}
        <View style={styles.countdownSection}>
          <View style={styles.countdownRing}>
            <Text style={styles.countdownText}>{countdown}</Text>
          </View>
          <Text style={styles.countdownLabel}>seconds to respond</Text>
        </View>

        {/* Job Card */}
        <View style={styles.card}>
          <View style={styles.alertBadge}>
            <Text style={styles.alertBadgeText}>NEW JOB ALERT</Text>
          </View>
          <Text style={styles.jobTitle}>{MOCK_ACTIVE_JOB.serviceName}</Text>

          <View style={styles.detailsList}>
            <View style={styles.detailRow}>
              <Ionicons name="location" size={18} color="#94A3B8" />
              <Text style={styles.detailText}>{MOCK_ACTIVE_JOB.distance} away</Text>
            </View>
            <View style={styles.detailRow}>
              <Ionicons name="time" size={18} color="#94A3B8" />
              <Text style={styles.detailText}>ETA: {MOCK_ACTIVE_JOB.eta}</Text>
            </View>
            <View style={styles.detailRow}>
              <Ionicons name="document-text" size={18} color="#94A3B8" />
              <Text style={styles.detailText} numberOfLines={2}>{MOCK_ACTIVE_JOB.description}</Text>
            </View>
          </View>

          <View style={styles.feeCard}>
            <Text style={styles.feeLabel}>Guaranteed Fee</Text>
            <Text style={styles.feeAmount}>₹{CONSULTATION_FEE}</Text>
            <Text style={styles.feeSub}>+ repair charges after diagnosis</Text>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <Button title="Accept Job" variant="success" onPress={handleAccept}
            icon={<Ionicons name="checkmark-circle" size={22} color="white" />} />
          <View style={{ height: 12 }} />
          <Button title="Decline" variant="ghost" onPress={handleDecline}
            icon={<Ionicons name="close-circle" size={20} color="#60A5FA" />} />
        </View>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FFFFFF' },
  inner: { flex: 1, justifyContent: 'center', paddingHorizontal: 20 },
  countdownSection: { alignItems: 'center', marginBottom: 24 },
  countdownRing: { width: 80, height: 80, borderRadius: 40, borderWidth: 4, borderColor: '#F59E0B', alignItems: 'center', justifyContent: 'center' },
  countdownText: { color: '#D97706', fontSize: 30, fontWeight: '900' },
  countdownLabel: { color: '#6B7280', fontSize: 14, marginTop: 8 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 24, padding: 24, marginBottom: 24, borderWidth: 1, borderColor: '#E5E7EB' },
  alertBadge: { alignSelf: 'center', backgroundColor: '#FAF5FF', paddingHorizontal: 16, paddingVertical: 6, borderRadius: 100, marginBottom: 12 },
  alertBadgeText: { color: '#9333EA', fontSize: 11, fontWeight: '700', letterSpacing: 1 },
  jobTitle: { color: '#1A1A1A', fontSize: 24, fontWeight: '900', textAlign: 'center', marginBottom: 16 },
  detailsList: { gap: 12, marginBottom: 16 },
  detailRow: { flexDirection: 'row', alignItems: 'center' },
  detailText: { color: '#4B5563', fontSize: 14, marginLeft: 12, flex: 1 },
  feeCard: { backgroundColor: '#F0FDF4', borderWidth: 1, borderColor: '#BBF7D0', borderRadius: 16, padding: 16, alignItems: 'center' },
  feeLabel: { color: '#16A34A', fontSize: 14, fontWeight: '500' },
  feeAmount: { color: '#1A1A1A', fontSize: 30, fontWeight: '900', marginTop: 4 },
  feeSub: { color: '#6B7280', fontSize: 12, marginTop: 4 },
  actions: {},
});
