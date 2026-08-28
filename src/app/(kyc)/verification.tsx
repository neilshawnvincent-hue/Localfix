import { useState } from 'react';
import { View, Text, TextInput, ScrollView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '@/store/authStore';
import Button from '@/components/ui/Button';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';

export default function VerificationScreen() {
  const router = useRouter();
  const [aadhaar, setAadhaar] = useState('');
  const [uan, setUan] = useState('');
  const [selfieTaken, setSelfieTaken] = useState(false);
  const [loading, setLoading] = useState(false);
  const verify = useAuthStore((s) => s.verify);

  const format12Digits = (text: string) => {
    const digits = text.replace(/\D/g, '').slice(0, 12);
    return digits.replace(/(\d{4})(?=\d)/g, '$1 ');
  };

  const handleTakeSelfie = () => {
    setLoading(true);
    setTimeout(() => { setSelfieTaken(true); setLoading(false); }, 1500);
  };

  const handleVerify = () => {
    setLoading(true);
    setTimeout(() => { 
      verify(); 
      router.replace('/(worker)/(tabs)/home');
    }, 1500);
  };

  const aadhaarDigits = aadhaar.replace(/\s/g, '');
  const uanDigits = uan.replace(/\s/g, '');
  const canVerify = aadhaarDigits.length === 12 && uanDigits.length === 12 && selfieTaken;

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
      <Animated.View entering={FadeInDown.duration(500)}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerIcon}>
            <Ionicons name="shield-checkmark" size={32} color="#7C3AED" />
          </View>
          <Text style={styles.title}>Identity Verification</Text>
          <Text style={styles.subtitle}>Complete KYC to start accepting jobs.{'\n'}This builds trust with customers.</Text>
        </View>

        {/* Step 1: Aadhaar */}
        <View style={styles.card}>
          <View style={styles.stepRow}>
            <View style={styles.stepCircle}>
              <Text style={styles.stepNum}>1</Text>
            </View>
            <Text style={styles.stepLabel}>Aadhaar Number</Text>
            {aadhaarDigits.length === 12 && <Ionicons name="checkmark-circle" size={20} color="#16A34A" />}
          </View>
          <TextInput
            value={aadhaar}
            onChangeText={(t) => setAadhaar(format12Digits(t))}
            placeholder="XXXX XXXX XXXX"
            placeholderTextColor="#64748B"
            keyboardType="number-pad"
            maxLength={14}
            style={styles.inputField}
          />
          <Text style={styles.hint}>Your Aadhaar is encrypted and stored securely.</Text>
        </View>

        {/* Step 2: UAN */}
        <View style={styles.card}>
          <View style={styles.stepRow}>
            <View style={styles.stepCircle}>
              <Text style={styles.stepNum}>2</Text>
            </View>
            <Text style={styles.stepLabel}>UAN Number</Text>
            {uanDigits.length === 12 && <Ionicons name="checkmark-circle" size={20} color="#16A34A" />}
          </View>
          <TextInput
            value={uan}
            onChangeText={(t) => setUan(format12Digits(t))}
            placeholder="XXXX XXXX XXXX"
            placeholderTextColor="#64748B"
            keyboardType="number-pad"
            maxLength={14}
            style={styles.inputField}
          />
          <Text style={styles.hint}>Used for PF verification.</Text>
        </View>

        {/* Step 3: Selfie */}
        <View style={styles.card}>
          <View style={styles.stepRow}>
            <View style={[styles.stepCircle, selfieTaken && { backgroundColor: '#16A34A' }]}>
              <Text style={styles.stepNum}>3</Text>
            </View>
            <Text style={styles.stepLabel}>Live Selfie</Text>
            {selfieTaken && <Ionicons name="checkmark-circle" size={20} color="#16A34A" />}
          </View>

          {selfieTaken ? (
            <Animated.View entering={FadeIn.duration(500)} style={styles.selfieSuccess}>
              <View style={styles.selfieSuccessIcon}>
                <Ionicons name="checkmark-circle" size={48} color="#16A34A" />
              </View>
              <Text style={styles.selfieSuccessText}>Selfie captured!</Text>
              <Text style={styles.selfieConfidence}>Face match: 98% confidence</Text>
            </Animated.View>
          ) : (
            <View style={styles.selfiePrompt}>
              <View style={styles.selfieCircle}>
                <Ionicons name="camera" size={40} color="#64748B" />
              </View>
              <Button title="Take Live Selfie" variant="secondary" onPress={handleTakeSelfie}
                loading={loading && !selfieTaken} icon={<Ionicons name="camera" size={18} color="#E2E8F0" />} size="md" />
            </View>
          )}
        </View>

        {/* Verify */}
        <Button title="Verify & Start Working" onPress={handleVerify} disabled={!canVerify}
          loading={loading && selfieTaken} icon={<Ionicons name="shield-checkmark" size={20} color="white" />} />

        {/* Trust badges */}
        <View style={styles.trustRow}>
          {[
            { icon: 'lock-closed' as const, text: 'Encrypted' },
            { icon: 'eye-off' as const, text: 'Private' },
            { icon: 'shield' as const, text: 'Secure' },
          ].map((item, i) => (
            <View key={i} style={styles.trustItem}>
              <Ionicons name={item.icon} size={16} color="#64748B" />
              <Text style={styles.trustText}>{item.text}</Text>
            </View>
          ))}
        </View>
      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: '#0F172A' },
  scrollContent: { paddingHorizontal: 24, paddingTop: 64, paddingBottom: 40 },
  header: { alignItems: 'center', marginBottom: 40 },
  headerIcon: { width: 64, height: 64, backgroundColor: 'rgba(124,58,237,0.15)', borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  title: { color: '#F8FAFC', fontSize: 24, fontWeight: '700', marginBottom: 8 },
  subtitle: { color: '#94A3B8', textAlign: 'center', fontSize: 14 },
  card: { backgroundColor: '#1E293B', borderRadius: 16, padding: 20, marginBottom: 16 },
  stepRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  stepCircle: { width: 32, height: 32, backgroundColor: '#7C3AED', borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  stepNum: { color: '#FFFFFF', fontWeight: '700', fontSize: 14 },
  stepLabel: { color: '#F8FAFC', fontWeight: '700', fontSize: 16, flex: 1 },
  inputField: { backgroundColor: '#0F172A', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 16, color: '#F8FAFC', fontSize: 20, fontFamily: 'monospace', letterSpacing: 4, borderWidth: 1, borderColor: '#334155' },
  hint: { color: '#64748B', fontSize: 12, marginTop: 8 },
  selfieSuccess: { alignItems: 'center', paddingVertical: 16 },
  selfieSuccessIcon: { width: 80, height: 80, backgroundColor: 'rgba(22,163,74,0.15)', borderRadius: 40, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  selfieSuccessText: { color: '#4ADE80', fontWeight: '700' },
  selfieConfidence: { color: '#94A3B8', fontSize: 14, marginTop: 4 },
  selfiePrompt: { alignItems: 'center', paddingVertical: 16 },
  selfieCircle: { width: 128, height: 128, backgroundColor: '#0F172A', borderRadius: 64, alignItems: 'center', justifyContent: 'center', marginBottom: 16, borderWidth: 2, borderStyle: 'dashed', borderColor: '#475569' },
  trustRow: { flexDirection: 'row', justifyContent: 'center', gap: 24, marginTop: 24 },
  trustItem: { alignItems: 'center' },
  trustText: { color: '#64748B', fontSize: 12, marginTop: 4 },
});
