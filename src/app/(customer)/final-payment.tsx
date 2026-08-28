import { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useJobStore } from '@/store/jobStore';
import Button from '@/components/ui/Button';
import { useTranslation } from 'react-i18next';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Platform } from 'react-native';

export default function FinalPaymentScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { activeJob, clearJob } = useJobStore();
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'cash'>('upi');
  const [showRating, setShowRating] = useState(false);
  const [rating, setRating] = useState(0);

  // If there's no job or it wasn't mocked properly, default to 350
  const finalQuote = activeJob?.finalQuote || 350; 
  
  const discountAmount = paymentMethod === 'upi' ? Math.round(finalQuote * 0.05) : 0;
  const totalAmount = finalQuote - discountAmount;

  const handlePayment = () => {
    setShowRating(true);
  };

  const submitRating = () => {
    if (Platform.OS === 'web') {
      window.alert(`Paid ₹${totalAmount} via ${paymentMethod.toUpperCase()} and rated ${rating} stars!`);
      clearJob();
      router.replace('/(customer)/(tabs)/home');
    } else {
      Alert.alert(
        t('job_completed', 'Job Completed'),
        `Paid ₹${totalAmount} via ${paymentMethod.toUpperCase()} and rated ${rating} stars!`,
        [
          {
            text: "OK",
            onPress: () => {
              clearJob();
              router.replace('/(customer)/(tabs)/home');
            }
          }
        ]
      );
    }
  };

  if (showRating) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={[styles.flex, { alignItems: 'center', justifyContent: 'center', padding: 24 }]}>
          <View style={styles.workerAvatarLg}>
            <Ionicons name="person" size={48} color="#3B82F6" />
          </View>
          <Text style={styles.ratingHeader}>Rate the Worker</Text>
          <Text style={styles.ratingSub}>How was your experience with {activeJob?.workerName}?</Text>
          
          <View style={styles.starsContainer}>
            {[1, 2, 3, 4, 5].map((star) => (
              <Pressable key={star} onPress={() => setRating(star)} style={{ padding: 8 }}>
                <Ionicons name={rating >= star ? "star" : "star-outline"} size={40} color={rating >= star ? "#F59E0B" : "#CBD5E1"} />
              </Pressable>
            ))}
          </View>
          
          <View style={{ width: '100%', marginTop: 32 }}>
            <Button title="Submit Rating" onPress={submitRating} disabled={rating === 0} />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn} accessibilityRole="button">
          <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
        </Pressable>
        <Text style={styles.headerTitle}>{t('final_payment')}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.flex} contentContainerStyle={styles.scrollContent}>
        <Animated.View entering={FadeInDown.duration(400)}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>{t('order_summary')}</Text>
            
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>{t('repair_charges')}</Text>
              <Text style={styles.summaryValue}>₹{finalQuote}</Text>
            </View>
            
            {paymentMethod === 'upi' && (
              <View style={styles.summaryRow}>
                <Text style={styles.discountLabel}>{t('discount_applied')}</Text>
                <Text style={styles.discountValue}>- ₹{discountAmount}</Text>
              </View>
            )}

            <View style={styles.divider} />
            
            <View style={styles.summaryRow}>
              <Text style={styles.totalLabel}>{t('total')}</Text>
              <Text style={styles.totalValue}>₹{totalAmount}</Text>
            </View>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(100).duration(400)}>
          <Text style={styles.sectionTitle}>{t('payment_method')}</Text>
          
          <View style={styles.methodsWrapper}>
            {/* UPI Method */}
            <Pressable
              onPress={() => setPaymentMethod('upi')}
              style={[styles.methodCard, paymentMethod === 'upi' && styles.methodActive]}
            >
              <View style={[styles.methodIcon, { backgroundColor: 'rgba(22,163,74,0.15)' }]}>
                <Text style={styles.rupeeIcon}>₹</Text>
              </View>
              <View style={styles.flex}>
                <Text style={styles.methodTitle}>UPI</Text>
                <Text style={styles.methodDesc}>Google Pay, PhonePe, Paytm</Text>
              </View>
              {paymentMethod === 'upi' && (
                <Ionicons name="checkmark-circle" size={24} color="#3B82F6" />
              )}
            </Pressable>

            {/* Cash Method */}
            <Pressable
              onPress={() => setPaymentMethod('cash')}
              style={[styles.methodCard, paymentMethod === 'cash' && styles.methodActive]}
            >
              <View style={[styles.methodIcon, { backgroundColor: 'rgba(245,158,11,0.15)' }]}>
                <Ionicons name="cash" size={20} color="#F59E0B" />
              </View>
              <View style={styles.flex}>
                <Text style={styles.methodTitle}>Cash</Text>
                <Text style={styles.methodDesc}>Pay directly to the worker</Text>
              </View>
              {paymentMethod === 'cash' && (
                <Ionicons name="checkmark-circle" size={24} color="#3B82F6" />
              )}
            </Pressable>
          </View>
        </Animated.View>
      </ScrollView>

      <View style={styles.footer}>
        <Button 
          title={`${t('pay_now')} ₹${totalAmount}`}
          onPress={handlePayment}
          size="lg"
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FFFFFF' },
  flex: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  summaryCard: {
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
  summaryTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 16,
    letterSpacing: 1,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 15,
    color: '#475569',
  },
  summaryValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  discountLabel: {
    fontSize: 15,
    color: '#16A34A',
    fontWeight: '500',
  },
  discountValue: {
    fontSize: 15,
    fontWeight: '700',
    color: '#16A34A',
  },
  divider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 12,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  totalValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1A1A1A',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 16,
    letterSpacing: 0.5,
  },
  methodsWrapper: {
    gap: 16,
  },
  methodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: 'transparent',
    backgroundColor: '#FFFFFF',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 12 },
      android: { elevation: 2 },
      web: { boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.05)' }
    }),
  },
  methodActive: {
    borderColor: '#3B82F6',
    backgroundColor: '#EFF6FF',
  },
  methodIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  rupeeIcon: {
    fontSize: 18,
    fontWeight: '700',
    color: '#16A34A',
  },
  methodTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  methodDesc: {
    fontSize: 13,
    color: '#64748B',
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    backgroundColor: '#FFFFFF',
  },
  workerAvatarLg: {
    width: 96,
    height: 96,
    backgroundColor: '#EFF6FF',
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  ratingHeader: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 8,
  },
  ratingSub: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 32,
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
});
