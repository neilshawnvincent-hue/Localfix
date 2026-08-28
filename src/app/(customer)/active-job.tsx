import { useState, useEffect } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet, Linking, Alert, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useJobStore } from '@/store/jobStore';
import StatusBadge from '@/components/ui/StatusBadge';
import MapPlaceholder from '@/components/ui/MapPlaceholder';
import Button from '@/components/ui/Button';
import type { JobStatus } from '@/constants/mockData';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';

export default function ActiveJobScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { activeJob, updateJobStatus, clearJob } = useJobStore();
  const [showOtp, setShowOtp] = useState(false);

  useEffect(() => {
    if (!activeJob) return;
    const transitions: { from: JobStatus; to: JobStatus; delay: number }[] = [
      { from: 'searching', to: 'assigned', delay: 3000 },
      { from: 'assigned', to: 'en_route', delay: 2000 },
      { from: 'en_route', to: 'arrived', delay: 3000 },
      { from: 'arrived', to: 'in_progress', delay: 3000 },
      { from: 'in_progress', to: 'completed', delay: 15000 },
    ];
    const current = transitions.find((t) => t.from === activeJob.status);
    if (current) {
      const timeout = setTimeout(() => updateJobStatus(current.to), current.delay);
      return () => clearTimeout(timeout);
    }
  }, [activeJob?.status]);

  const handleSOS = async () => {
    try {
      await Linking.openURL('tel:112');
    } catch (err) {
      Alert.alert("SOS Failed", "Unable to open dialer. Please dial 112 manually.");
    }
  };

  if (!activeJob) {
    return (
      <SafeAreaView style={[styles.safe, styles.center]}>
        <Ionicons name="checkmark-circle" size={64} color="#16A34A" />
        <Text style={[styles.white, { fontSize: 20, fontWeight: '700', marginTop: 16 }]}>No active job</Text>
        <View style={{ marginTop: 24, width: '100%', paddingHorizontal: 20 }}>
          <Button title="Go Home" onPress={() => router.replace('/(customer)/(tabs)/home')} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.flex} contentContainerStyle={{ paddingBottom: 24 }}>
        <MapPlaceholder height={280} />

        <View style={styles.content}>
          {/* Status Card */}
          <Animated.View entering={FadeInDown.duration(400)}>
            <View style={styles.card}>
              <View style={styles.statusRow}>
                <Text style={styles.cardTitle}>{activeJob.serviceName}</Text>
                <StatusBadge status={activeJob.status} />
              </View>

              <View style={styles.statusMessage}>
                <Text style={styles.statusText}>
                  {activeJob.status === 'searching' && t('searching_worker')}
                  {activeJob.status === 'assigned' && t('worker_assigned')}
                  {activeJob.status === 'en_route' && `${activeJob.workerName} ${t('heading_to_you')} • ETA ${activeJob.eta}`}
                  {activeJob.status === 'arrived' && t('worker_assigned')}
                  {activeJob.status === 'quote_provided' && 'Please review the repair quote.'}
                  {activeJob.status === 'in_progress' && 'Work in Progress'}
                  {activeJob.status === 'completed' && 'Job Completed'}
                </Text>
              </View>

              {activeJob.status !== 'searching' && (
                <Animated.View entering={FadeIn.duration(400)}>
                  <View style={styles.workerRow}>
                    <View style={styles.workerAvatar}>
                      <Ionicons name="person" size={22} color="#3B82F6" />
                    </View>
                    <View style={styles.flex}>
                      <Text style={styles.workerName}>{activeJob.workerName}</Text>
                      <View style={styles.ratingRow}>
                        <Ionicons name="star" size={14} color="#F59E0B" />
                        <Text style={styles.ratingText}>
                          {activeJob.workerRating} • {activeJob.distance} away
                        </Text>
                      </View>
                    </View>
                    <Pressable style={styles.callBtn}>
                      <Ionicons name="call" size={18} color="#16A34A" />
                    </Pressable>
                  </View>
                </Animated.View>
              )}
            </View>
          </Animated.View>

          {/* Arrival OTP */}
          {(activeJob.status === 'en_route' || activeJob.status === 'arrived') && (
            <Animated.View entering={FadeInDown.delay(200).duration(400)}>
              <View style={styles.card}>
                <Text style={styles.sectionLabel}>{t('arrival_otp')}</Text>
                {showOtp ? (
                  <View style={styles.otpDisplay}>
                    <View style={styles.otpRow}>
                      {activeJob.arrivalOtp.split('').map((digit, i) => (
                        <View key={i} style={styles.otpBox}>
                          <Text style={styles.otpDigit}>{digit}</Text>
                        </View>
                      ))}
                    </View>
                    <Text style={styles.otpHint}>{t('share_code_only')}</Text>
                  </View>
                ) : (
                  <Button
                    title={t('show_otp')}
                    variant="secondary"
                    onPress={() => setShowOtp(true)}
                    icon={<Ionicons name="eye" size={18} color="#E2E8F0" />}
                    size="md"
                  />
                )}
              </View>
            </Animated.View>
          )}

          {/* Quote Approval */}
          {activeJob.status === 'quote_provided' && (
            <Animated.View entering={FadeInDown.delay(100).duration(400)}>
              <View style={[styles.card, { borderColor: '#3B82F6', borderWidth: 2 }]}>
                <View style={[styles.statusRow, { marginBottom: 16 }]}>
                  <Text style={[styles.sectionLabel, { marginBottom: 0 }]}>Repair Quote Received</Text>
                  <Ionicons name="receipt" size={24} color="#3B82F6" />
                </View>
                
                <Text style={{ color: '#0F172A', fontSize: 36, fontWeight: '800', textAlign: 'center', marginBottom: 24 }}>
                  ₹{activeJob.finalQuote}
                </Text>
                
                <Button 
                  title="Accept Quote"
                  onPress={() => updateJobStatus('in_progress')}
                  icon={<Ionicons name="checkmark-circle" size={18} color="white" />}
                />
              </View>
            </Animated.View>
          )}

          {/* In Progress / Completion OTP */}
          {(activeJob.status === 'in_progress' || activeJob.status === 'completed') && (
            <Animated.View entering={FadeInDown.delay(100).duration(400)}>
              <View style={styles.card}>
                <View style={[styles.statusRow, { marginBottom: 16 }]}>
                  <Text style={styles.sectionLabel}>Completion OTP</Text>
                  <View style={{ backgroundColor: '#ECFDF5', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 }}>
                    <Text style={{ color: '#10B981', fontWeight: '700', fontSize: 12 }}>{activeJob.status === 'completed' ? '4 hours' : 'Running...'}</Text>
                  </View>
                </View>
                
                <View style={styles.otpDisplay}>
                  <View style={styles.otpRow}>
                    {activeJob.completionOtp.split('').map((digit, i) => (
                      <View key={i} style={styles.otpBox}>
                        <Text style={styles.otpDigit}>{digit}</Text>
                      </View>
                    ))}
                  </View>
                  <Text style={styles.otpHint}>{t('share_code_only')}</Text>
                </View>
              </View>
            </Animated.View>
          )}

          {/* SOS Feature */}
          {activeJob.status !== 'completed' && (
            <Animated.View entering={FadeInDown.delay(300).duration(400)}>
              <View style={[styles.card, { borderColor: '#EF4444', borderWidth: 1 }]}>
                <View style={styles.guardianHeader}>
                  <Ionicons name="warning" size={20} color="#EF4444" />
                  <Text style={[styles.white, { fontWeight: '700', marginLeft: 8 }]}>{t('emergency_sos')}</Text>
                </View>
                <Text style={styles.guardianDesc}>
                  {t('sos_desc')}
                </Text>
                <Button
                  title={t('dial_112')}
                  variant="danger"
                  onPress={handleSOS}
                  icon={<Ionicons name="call" size={18} color="white" />}
                  size="md"
                />
              </View>
            </Animated.View>
          )}

          {activeJob.status === 'completed' && (
            <Animated.View entering={FadeInDown.delay(100).duration(400)}>
              <Button
                title={t('proceed_payment')}
                onPress={() => router.push('/(customer)/final-payment')}
                icon={<Ionicons name="card" size={18} color="white" />}
              />
            </Animated.View>
          )}

          {activeJob.status === 'searching' && (
            <Button
              title={t('cancel_request')}
              variant="ghost"
              onPress={() => { clearJob(); router.replace('/(customer)/(tabs)/home'); }}
              icon={<Ionicons name="close-circle" size={18} color="#60A5FA" />}
              size="md"
            />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F8FAFC' },
  flex: { flex: 1 },
  center: { alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 },
  white: { color: '#0F172A' },
  content: { paddingHorizontal: 20, marginTop: -24 },
  card: { 
    backgroundColor: '#FFFFFF', 
    borderRadius: 24, 
    padding: 24, 
    marginBottom: 20,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.05, shadowRadius: 16 },
      android: { elevation: 4 },
      web: { boxShadow: '0px 6px 24px rgba(0, 0, 0, 0.05)' }
    }),
  },
  statusRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  cardTitle: { color: '#0F172A', fontWeight: '800', fontSize: 18 },
  statusMessage: { backgroundColor: '#EFF6FF', borderRadius: 12, padding: 12, marginBottom: 16 },
  statusText: { color: '#3B82F6', fontSize: 14, fontWeight: '600', textAlign: 'center' },
  workerRow: { flexDirection: 'row', alignItems: 'center', paddingTop: 16, borderTopWidth: 1, borderTopColor: '#F1F5F9' },
  workerAvatar: { width: 48, height: 48, backgroundColor: '#EFF6FF', borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  workerName: { color: '#0F172A', fontWeight: '700' },
  ratingRow: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  ratingText: { color: '#64748B', fontSize: 13, marginLeft: 4 },
  callBtn: { width: 44, height: 44, backgroundColor: '#ECFDF5', borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  sectionLabel: { color: '#64748B', fontSize: 14, fontWeight: '700', marginBottom: 16, letterSpacing: 0.5 },
  otpDisplay: { alignItems: 'center' },
  otpRow: { flexDirection: 'row', gap: 12 },
  otpBox: { width: 56, height: 64, backgroundColor: '#EFF6FF', borderRadius: 16, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#BFDBFE' },
  otpDigit: { color: '#2563EB', fontSize: 28, fontWeight: '900' },
  otpHint: { color: '#64748B', fontSize: 13, marginTop: 16 },
  guardianHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  guardianDesc: { color: '#64748B', fontSize: 14, marginBottom: 20 },
});
