import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { MOCK_WORKER_EARNINGS, MOCK_WORKER } from '@/constants/mockData';
import { useAuthStore } from '@/store/authStore';
import Button from '@/components/ui/Button';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import { LinearGradient } from 'expo-linear-gradient';
import { Platform } from 'react-native';

export default function WorkerEarningsScreen() {
  const router = useRouter();
  const { logout, language } = useAuthStore();
  const { t } = useTranslation();

  const handleLogout = () => {
    logout();
    router.replace('/(auth)/role-select');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.flex} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>{t('earnings')}</Text>

        <Animated.View entering={FadeInDown.duration(400)}>
          <View style={styles.totalCard}>
            <LinearGradient
              colors={['#10B981', '#059669']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[StyleSheet.absoluteFill, { borderRadius: 24 }]}
            />
            <Text style={styles.totalLabel}>{t('this_month')}</Text>
            <Text style={styles.totalAmount}>₹{MOCK_WORKER_EARNINGS.thisMonth.toLocaleString()}</Text>
            <Text style={styles.totalSub}>{MOCK_WORKER_EARNINGS.totalJobs} {t('jobs_done')}</Text>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(100).duration(400)}>
          <View style={styles.breakdownRow}>
            <View style={styles.breakdownCard}>
              <Ionicons name="today" size={22} color="#F59E0B" />
              <Text style={styles.breakdownValue}>₹{MOCK_WORKER_EARNINGS.today}</Text>
              <Text style={styles.breakdownLabel}>{t('today')}</Text>
            </View>
            <View style={styles.breakdownCard}>
              <Ionicons name="calendar" size={22} color="#3B82F6" />
              <Text style={styles.breakdownValue}>₹{MOCK_WORKER_EARNINGS.thisWeek.toLocaleString()}</Text>
              <Text style={styles.breakdownLabel}>{t('this_week')}</Text>
            </View>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200).duration(400)}>
          <View style={styles.detailCard}>
            <Text style={styles.detailTitle}>{t('breakdown')}</Text>
            {[
              { icon: 'cash' as const, color: '#16A34A', bg: 'rgba(22,163,74,0.15)', label: t('consultation_fee'), value: `₹${MOCK_WORKER_EARNINGS.todayJobs * 60}` },
              { icon: 'construct' as const, color: '#3B82F6', bg: 'rgba(59,130,246,0.15)', label: t('repair_charges'), value: `₹${MOCK_WORKER_EARNINGS.today - MOCK_WORKER_EARNINGS.todayJobs * 60}` },
              { icon: 'star' as const, color: '#F59E0B', bg: 'rgba(245,158,11,0.15)', label: t('tips'), value: '₹0' },
            ].map((item, i) => (
              <View key={i} style={styles.detailRow}>
                <View style={[styles.detailIcon, { backgroundColor: item.bg }]}>
                  <Ionicons name={item.icon} size={16} color={item.color} />
                </View>
                <Text style={styles.detailLabel}>{item.label}</Text>
                <Text style={styles.detailValue}>{item.value}</Text>
              </View>
            ))}
          </View>
        </Animated.View>

        {/* Worker info */}
        <View style={styles.workerCard}>
          <View style={styles.workerRow}>
            <View style={styles.workerAvatar}>
              <Ionicons name="person" size={26} color="#7C3AED" />
            </View>
            <View>
              <Text style={styles.workerName}>{MOCK_WORKER.name}</Text>
              <View style={styles.ratingRow}>
                <Ionicons name="star" size={14} color="#F59E0B" />
                <Text style={styles.ratingText}>{MOCK_WORKER.rating} • {MOCK_WORKER.jobsCompleted} jobs</Text>
              </View>
            </View>
          </View>
          <View style={styles.verifiedRow}>
            <Ionicons name="shield-checkmark" size={14} color="#16A34A" />
            <Text style={styles.verifiedText}>{t('aadhaar_verified')} • ****{MOCK_WORKER.aadhaarLast4}</Text>
          </View>
        </View>

        <Button 
          title={language === 'en' ? 'Switch to Hindi (हिंदी)' : 'Switch to English'} 
          variant="secondary" 
          onPress={() => useAuthStore.getState().setLanguage(language === 'en' ? 'hi' : 'en')} 
          icon={<Ionicons name="language" size={20} color="#64748B" />} 
          style={{ marginBottom: 12 }}
        />

        <Button title={t('logout')} variant="danger" onPress={handleLogout} icon={<Ionicons name="log-out" size={20} color="white" />} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FFFFFF' },
  flex: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 24 },
  title: { color: '#0F172A', fontSize: 28, fontWeight: '900', paddingVertical: 24 },
  totalCard: { 
    borderRadius: 24, 
    padding: 32, 
    alignItems: 'center', 
    marginBottom: 20,
    ...Platform.select({
      ios: { shadowColor: '#10B981', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 16 },
      android: { elevation: 8 },
      web: { boxShadow: '0px 8px 24px rgba(16, 185, 129, 0.3)' }
    }),
  },
  totalLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 16, fontWeight: '600', letterSpacing: 0.5 },
  totalAmount: { color: '#FFFFFF', fontSize: 48, fontWeight: '900', marginTop: 8 },
  totalSub: { color: 'rgba(255,255,255,0.9)', fontSize: 16, marginTop: 8, fontWeight: '500' },
  breakdownRow: { flexDirection: 'row', gap: 16, marginBottom: 24 },
  breakdownCard: { 
    flex: 1, 
    backgroundColor: '#FFFFFF', 
    borderRadius: 24, 
    padding: 20, 
    alignItems: 'center',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.05, shadowRadius: 16 },
      android: { elevation: 4 },
      web: { boxShadow: '0px 6px 24px rgba(0, 0, 0, 0.05)' }
    }),
  },
  breakdownValue: { color: '#0F172A', fontSize: 24, fontWeight: '800', marginTop: 12 },
  breakdownLabel: { color: '#64748B', fontSize: 14, marginTop: 4, fontWeight: '500' },
  detailCard: { 
    backgroundColor: '#FFFFFF', 
    borderRadius: 24, 
    padding: 24, 
    marginBottom: 24,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.05, shadowRadius: 16 },
      android: { elevation: 4 },
      web: { boxShadow: '0px 6px 24px rgba(0, 0, 0, 0.05)' }
    }),
  },
  detailTitle: { color: '#0F172A', fontWeight: '800', fontSize: 18, marginBottom: 20 },
  detailRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  detailIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 16 },
  detailLabel: { color: '#475569', fontSize: 15, flex: 1, fontWeight: '500' },
  detailValue: { color: '#0F172A', fontWeight: '700', fontSize: 16 },
  workerCard: { 
    backgroundColor: '#FFFFFF', 
    borderRadius: 24, 
    padding: 24, 
    marginBottom: 32,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.05, shadowRadius: 16 },
      android: { elevation: 4 },
      web: { boxShadow: '0px 6px 24px rgba(0, 0, 0, 0.05)' }
    }),
  },
  workerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  workerAvatar: { width: 56, height: 56, backgroundColor: '#FAF5FF', borderRadius: 28, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  workerName: { color: '#1A1A1A', fontWeight: '700', fontSize: 16 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  ratingText: { color: '#6B7280', fontSize: 14, marginLeft: 4 },
  verifiedRow: { flexDirection: 'row', alignItems: 'center' },
  verifiedText: { color: '#16A34A', fontSize: 12, fontWeight: '500', marginLeft: 4 },
});
