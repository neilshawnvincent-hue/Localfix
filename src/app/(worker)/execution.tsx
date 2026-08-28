import { useState, useEffect } from 'react';
import { View, Text, TextInput, ScrollView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useJobStore } from '@/store/jobStore';
import { MOCK_ACTIVE_JOB } from '@/constants/mockData';
import Button from '@/components/ui/Button';
import OTPInput from '@/components/ui/OTPInput';
import MapPlaceholder from '@/components/ui/MapPlaceholder';
import BackButton from '@/components/ui/BackButton';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';

type ExecutionStep = 'navigate' | 'arrival_otp' | 'quote' | 'wait_approval' | 'working' | 'completion_otp' | 'done';

const STEPS: ExecutionStep[] = ['navigate', 'arrival_otp', 'quote', 'wait_approval', 'working', 'completion_otp', 'done'];

export default function ExecutionScreen() {
  const router = useRouter();
  const { activeJob, updateJobStatus, submitQuote, clearJob } = useJobStore();
  const [step, setStep] = useState<ExecutionStep>('navigate');
  const [quoteAmount, setQuoteAmount] = useState('');
  const [issueFound, setIssueFound] = useState('');
  const [elapsedMinutes, setElapsedMinutes] = useState(0);

  const handleArrivalOTPComplete = (_code: string) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    updateJobStatus('arrived');
    setStep('quote');
  };

  const handleSubmitQuote = () => {
    if (!quoteAmount || !issueFound) return;
    submitQuote(parseInt(quoteAmount));
    setStep('wait_approval');
  };

  // Watch for customer approval
  useEffect(() => {
    let mockAcceptTimeout: NodeJS.Timeout;
    
    if (step === 'wait_approval') {
      // Auto-accept after 4 seconds for standalone worker demo
      mockAcceptTimeout = setTimeout(() => {
        if (activeJob?.status !== 'in_progress') {
          updateJobStatus('in_progress');
        }
      }, 4000);
    }

    if (step === 'wait_approval' && activeJob?.status === 'in_progress') {
      setStep('working');
      const interval = setInterval(() => { setElapsedMinutes((prev) => prev + 1); }, 3000);
      // Wait 15 seconds to simulate work, then ask for completion OTP
      setTimeout(() => { clearInterval(interval); setStep('completion_otp'); }, 15000);
    }
    
    return () => clearTimeout(mockAcceptTimeout);
  }, [activeJob?.status, step]);

  const handleCompletionOTPComplete = (_code: string) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    updateJobStatus('completed');
    setStep('done');
  };

  const handleDone = () => { clearJob(); router.replace('/(worker)/(tabs)/home'); };

  const currentStepIndex = STEPS.indexOf(step);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.flex} contentContainerStyle={styles.scrollContent}>
        <BackButton color="#6B7280" />
        {/* Progress bar */}
        <View style={styles.progressRow}>
          {STEPS.map((s, i) => (
            <View key={s} style={[styles.progressDot, i <= currentStepIndex ? styles.progressActive : styles.progressInactive]} />
          ))}
        </View>

        {/* Step: Navigate */}
        {step === 'navigate' && (
          <Animated.View entering={FadeInDown.duration(400)}>
            <Text style={styles.stepTitle}>Navigate to Customer</Text>
            <Text style={styles.stepSub}>Head to the customer's location. Tap "I've Arrived" when you reach.</Text>
            <MapPlaceholder height={250} />
            <View style={styles.infoCard}>
              <View style={styles.infoRow}>
                <Ionicons name="navigate" size={18} color="#3B82F6" />
                <Text style={styles.infoText}>{MOCK_ACTIVE_JOB.distance} • ETA {MOCK_ACTIVE_JOB.eta}</Text>
              </View>
              <View style={styles.infoRow}>
                <Ionicons name="person" size={18} color="#94A3B8" />
                <Text style={styles.infoText}>{MOCK_ACTIVE_JOB.customerName}</Text>
              </View>
            </View>
            <Button title="I've Arrived" variant="success" onPress={() => { updateJobStatus('arrived'); setStep('arrival_otp'); }}
              icon={<Ionicons name="checkmark-circle" size={20} color="white" />} />
          </Animated.View>
        )}

        {/* Step: Arrival OTP */}
        {step === 'arrival_otp' && (
          <Animated.View entering={FadeInDown.duration(400)}>
            <View style={styles.stepHeader}>
              <View style={[styles.stepIcon, { backgroundColor: 'rgba(124,58,237,0.15)' }]}>
                <Ionicons name="key" size={32} color="#7C3AED" />
              </View>
              <Text style={styles.stepTitle}>Arrival OTP</Text>
              <Text style={styles.stepSubCenter}>Ask the customer for their 4-digit{'\n'}Arrival OTP to verify your identity.</Text>
            </View>
            <OTPInput length={4} onComplete={handleArrivalOTPComplete} label="Enter the customer's OTP" />
            <View style={styles.noteCard}>
              <Ionicons name="information-circle" size={18} color="#F59E0B" />
              <Text style={styles.noteText}>The OTP ensures the right worker reaches the right customer.</Text>
            </View>
          </Animated.View>
        )}

        {/* Step: Quote */}
        {step === 'quote' && (
          <Animated.View entering={FadeInDown.duration(400)}>
            <Text style={styles.stepTitle}>Diagnose & Quote</Text>
            <Text style={styles.stepSub}>Inspect the issue and provide a repair estimate.</Text>

            <Text style={styles.label}>Issue Found</Text>
            <TextInput value={issueFound} onChangeText={setIssueFound}
              placeholder="E.g., Corroded pipe joint needs replacement..."
              placeholderTextColor="#4B5563" multiline numberOfLines={3} textAlignVertical="top"
              style={styles.textArea} />

            <Text style={styles.label}>Estimated Repair Cost (₹)</Text>
            <View style={styles.quoteRow}>
              <Text style={styles.rupee}>₹</Text>
              <TextInput value={quoteAmount} onChangeText={(t) => setQuoteAmount(t.replace(/[^0-9]/g, ''))}
                placeholder="Enter amount" placeholderTextColor="#4B5563" keyboardType="number-pad"
                style={styles.quoteInput} />
            </View>
            <Text style={styles.hint}>This excludes the ₹60 consultation fee already paid.</Text>

            <Text style={styles.label}>Parts Needed (optional)</Text>
            <TextInput placeholder="E.g., PVC elbow joint, Teflon tape" placeholderTextColor="#4B5563"
              style={styles.singleInput} />

            <View style={{ height: 24 }} />
            <Button title="Submit Quote to Customer" onPress={handleSubmitQuote}
              disabled={!quoteAmount || !issueFound} icon={<Ionicons name="send" size={18} color="white" />} />
          </Animated.View>
        )}

        {/* Step: Wait Approval */}
        {step === 'wait_approval' && (
          <Animated.View entering={FadeInDown.duration(400)} style={styles.centerSection}>
            <View style={[styles.stepIcon, { backgroundColor: 'rgba(59,130,246,0.15)', marginBottom: 20 }]}>
              <Ionicons name="time" size={32} color="#3B82F6" />
            </View>
            <Text style={styles.stepTitle}>Waiting for Approval</Text>
            <Text style={styles.stepSub}>The customer is reviewing your repair quote. You can start working as soon as they accept.</Text>
            
            <View style={styles.summaryCard}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Quoted Amount</Text>
                <Text style={styles.summaryValue}>₹{quoteAmount}</Text>
              </View>
            </View>
          </Animated.View>
        )}

        {/* Step: Working */}
        {step === 'working' && (
          <Animated.View entering={FadeIn.duration(400)} style={styles.centerSection}>
            <View style={styles.workIcon}>
              <Ionicons name="construct" size={48} color="#06B6D4" />
            </View>
            <Text style={styles.stepTitle}>Work in Progress</Text>
            <Text style={styles.stepSub}>Quote accepted. Complete the repair.</Text>

            <View style={styles.timerCard}>
              <Text style={styles.timerLabel}>Elapsed Time</Text>
              <Text style={styles.timerValue}>{elapsedMinutes} min</Text>
            </View>

            <View style={styles.summaryCard}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Consultation</Text>
                <Text style={styles.summaryValue}>₹60</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Repair Quote</Text>
                <Text style={styles.summaryValue}>₹{quoteAmount}</Text>
              </View>
              <View style={styles.summaryDivider} />
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryValue, { fontSize: 16 }]}>Total</Text>
                <Text style={styles.totalGreen}>₹{60 + parseInt(quoteAmount || '0')}</Text>
              </View>
            </View>
          </Animated.View>
        )}

        {/* Step: Completion OTP */}
        {step === 'completion_otp' && (
          <Animated.View entering={FadeInDown.duration(400)}>
            <View style={styles.stepHeader}>
              <View style={[styles.stepIcon, { backgroundColor: 'rgba(22,163,74,0.15)' }]}>
                <Ionicons name="checkmark-done" size={32} color="#16A34A" />
              </View>
              <Text style={styles.stepTitle}>Completion OTP</Text>
              <Text style={styles.stepSubCenter}>Ask the customer for the Completion OTP{'\n'}to confirm the job is done.</Text>
            </View>
            <OTPInput length={4} onComplete={handleCompletionOTPComplete} label="Enter the completion code" />
          </Animated.View>
        )}

        {/* Step: Done */}
        {step === 'done' && (
          <Animated.View entering={FadeIn.duration(500)} style={styles.centerSection}>
            <View style={styles.doneIcon}>
              <Ionicons name="checkmark-circle" size={64} color="#16A34A" />
            </View>
            <Text style={styles.stepTitle}>Job Complete! 🎉</Text>
            <Text style={styles.stepSub}>Great work! Payment has been credited to your wallet.</Text>

            <View style={styles.earnedCard}>
              <Text style={styles.earnedLabel}>You Earned</Text>
              <Text style={styles.earnedAmount}>₹{60 + parseInt(quoteAmount || '0')}</Text>
            </View>

            <Button title="Back to Home" onPress={handleDone} icon={<Ionicons name="home" size={20} color="white" />} />
          </Animated.View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FFFFFF' },
  flex: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 24 },
  progressRow: { flexDirection: 'row', gap: 6, paddingVertical: 24 },
  progressDot: { flex: 1, height: 6, borderRadius: 3 },
  progressActive: { backgroundColor: '#6366F1' },
  progressInactive: { backgroundColor: '#E5E7EB' },
  stepTitle: { color: '#1A1A1A', fontSize: 24, fontWeight: '700', marginBottom: 8 },
  stepSub: { color: '#6B7280', fontSize: 15, marginBottom: 24 },
  stepSubCenter: { color: '#6B7280', textAlign: 'center', fontSize: 15 },
  stepHeader: { alignItems: 'center', marginBottom: 32 },
  stepIcon: { width: 64, height: 64, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  infoCard: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 16, padding: 16, marginTop: 16, marginBottom: 24, gap: 8 },
  infoRow: { flexDirection: 'row', alignItems: 'center' },
  infoText: { color: '#4B5563', fontSize: 14, marginLeft: 8 },
  noteCard: { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: '#FEF3C7', borderWidth: 1, borderColor: '#FDE68A', borderRadius: 16, padding: 16, marginTop: 24 },
  noteText: { color: '#D97706', fontSize: 13, marginLeft: 8, flex: 1 },
  label: { color: '#4B5563', fontSize: 14, fontWeight: '600', marginBottom: 8, marginTop: 16 },
  textArea: { backgroundColor: '#FFFFFF', borderRadius: 16, paddingHorizontal: 16, paddingVertical: 16, color: '#1A1A1A', fontSize: 16, minHeight: 100, borderWidth: 1, borderColor: '#E5E7EB', textAlignVertical: 'top' },
  quoteRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 16, paddingHorizontal: 16, borderWidth: 1, borderColor: '#E5E7EB' },
  rupee: { color: '#9CA3AF', fontSize: 24, fontWeight: '700', marginRight: 8 },
  quoteInput: { flex: 1, color: '#1A1A1A', fontSize: 24, fontWeight: '700', paddingVertical: 16 },
  hint: { color: '#9CA3AF', fontSize: 12, marginTop: 8 },
  singleInput: { backgroundColor: '#FFFFFF', borderRadius: 16, paddingHorizontal: 16, paddingVertical: 16, color: '#1A1A1A', fontSize: 16, borderWidth: 1, borderColor: '#E5E7EB' },
  centerSection: { alignItems: 'center', paddingTop: 40 },
  workIcon: { width: 96, height: 96, backgroundColor: '#ECFEFF', borderRadius: 48, alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
  timerCard: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 16, padding: 24, width: '100%', alignItems: 'center', marginBottom: 16, marginTop: 16 },
  timerLabel: { color: '#6B7280', fontSize: 14 },
  timerValue: { color: '#1A1A1A', fontSize: 36, fontWeight: '900', marginTop: 4 },
  summaryCard: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 16, padding: 16, width: '100%' },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  summaryLabel: { color: '#6B7280', fontSize: 14 },
  summaryValue: { color: '#1A1A1A', fontWeight: '700' },
  summaryDivider: { borderTopWidth: 1, borderTopColor: '#E5E7EB', marginVertical: 8 },
  totalGreen: { color: '#16A34A', fontWeight: '900', fontSize: 18 },
  doneIcon: { width: 96, height: 96, backgroundColor: '#F0FDF4', borderRadius: 48, alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
  earnedCard: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 16, padding: 24, width: '100%', alignItems: 'center', marginBottom: 24, marginTop: 16 },
  earnedLabel: { color: '#6B7280', fontSize: 14 },
  earnedAmount: { color: '#16A34A', fontSize: 36, fontWeight: '900', marginTop: 4 },
});
