import { useState } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Button from '@/components/ui/Button';
import BackButton from '@/components/ui/BackButton';
import { CONSULTATION_FEE } from '@/constants/services';
import { useJobStore } from '@/store/jobStore';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';

export default function CheckoutScreen() {
  const router = useRouter();
  const { serviceId, serviceName, description } = useLocalSearchParams<{
    serviceId: string;
    serviceName: string;
    description: string;
  }>();
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card'>('upi');
  const [loading, setLoading] = useState(false);
  const createJob = useJobStore((s) => s.createJob);
  const { t } = useTranslation();

  const handlePay = () => {
    setLoading(true);
    setTimeout(() => {
      createJob(serviceId, serviceName, description);
      router.replace('/(customer)/active-job');
    }, 1500);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.flex} contentContainerStyle={styles.scrollContent}>
        {/* Back */}
        <BackButton />

        <Animated.View entering={FadeInDown.duration(400)}>
          <Text style={styles.title}>{t('confirm_pay')}</Text>

          {/* Order Summary */}
          <View style={styles.card}>
            <Text style={styles.cardLabel}>{t('order_summary')}</Text>
            <View style={styles.orderRow}>
              <View style={styles.orderIcon}>
                <Ionicons name="construct" size={22} color="#3B82F6" />
              </View>
              <View style={styles.flex}>
                <Text style={styles.orderTitle}>{t(serviceName as TranslationKey, serviceName)}</Text>
                <Text style={styles.orderDesc} numberOfLines={1}>{description}</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>{t('consultation_fee')}</Text>
              <Text style={styles.priceValue}>₹{CONSULTATION_FEE}</Text>
            </View>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>{t('platform_fee')}</Text>
              <Text style={styles.priceFree}>{t('free')}</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.priceRow}>
              <Text style={styles.totalLabel}>{t('total')}</Text>
              <Text style={styles.totalValue}>₹{CONSULTATION_FEE}</Text>
            </View>
          </View>

          {/* Refund note */}
          <View style={styles.refundNote}>
            <Ionicons name="information-circle" size={20} color="#F59E0B" />
            <Text style={styles.refundText}>
              {t('refund_note')}
            </Text>
          </View>

          {/* Payment Method */}
          <Text style={styles.cardLabel}>{t('payment_method')}</Text>
          <View style={styles.methodsWrapper}>
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

            <Pressable
              onPress={() => setPaymentMethod('card')}
              style={[styles.methodCard, paymentMethod === 'card' && styles.methodActive]}
            >
              <View style={[styles.methodIcon, { backgroundColor: 'rgba(59,130,246,0.15)' }]}>
                <Ionicons name="card" size={20} color="#3B82F6" />
              </View>
              <View style={styles.flex}>
                <Text style={styles.methodTitle}>Debit / Credit Card</Text>
                <Text style={styles.methodDesc}>Visa, Mastercard, RuPay</Text>
              </View>
              {paymentMethod === 'card' && (
                <Ionicons name="checkmark-circle" size={24} color="#3B82F6" />
              )}
            </Pressable>
          </View>

          {/* Pay Button */}
          <Button
            title={t('pay_find_worker')}
            onPress={handlePay}
            loading={loading}
            icon={<Ionicons name="lock-closed" size={18} color="white" />}
          />

          <Text style={styles.secureText}>{t('secure_payment')}</Text>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0F172A' },
  flex: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 24 },
  title: { color: '#F8FAFC', fontSize: 24, fontWeight: '700', marginBottom: 24 },
  card: { backgroundColor: '#1E293B', borderRadius: 16, padding: 20, marginBottom: 16 },
  cardLabel: { color: '#94A3B8', fontSize: 11, fontWeight: '600', letterSpacing: 1, marginBottom: 12 },
  orderRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  orderIcon: {
    width: 48, height: 48, backgroundColor: 'rgba(37,99,235,0.15)',
    borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 12,
  },
  orderTitle: { color: '#F8FAFC', fontWeight: '700', fontSize: 16 },
  orderDesc: { color: '#94A3B8', fontSize: 14 },
  divider: { borderTopWidth: 1, borderTopColor: '#334155', paddingTop: 12, marginBottom: 4 },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  priceLabel: { color: '#94A3B8', fontSize: 14 },
  priceValue: { color: '#F8FAFC', fontWeight: '700' },
  priceFree: { color: '#4ADE80', fontWeight: '700', fontSize: 14 },
  totalLabel: { color: '#F8FAFC', fontWeight: '700', fontSize: 18 },
  totalValue: { color: '#F8FAFC', fontWeight: '900', fontSize: 20 },
  refundNote: {
    flexDirection: 'row', alignItems: 'flex-start',
    backgroundColor: 'rgba(245,158,11,0.1)', borderWidth: 1,
    borderColor: 'rgba(245,158,11,0.3)', borderRadius: 16, padding: 16, marginBottom: 24,
  },
  refundText: { color: '#FCD34D', fontSize: 13, marginLeft: 8, flex: 1 },
  methodsWrapper: { gap: 12, marginBottom: 32 },
  methodCard: {
    backgroundColor: '#1E293B', borderRadius: 16, padding: 16,
    flexDirection: 'row', alignItems: 'center', borderWidth: 2, borderColor: 'transparent',
  },
  methodActive: { borderColor: '#3B82F6' },
  methodIcon: {
    width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 12,
  },
  rupeeIcon: { fontSize: 18, fontWeight: '700', color: '#4ADE80' },
  methodTitle: { color: '#F8FAFC', fontWeight: '700' },
  methodDesc: { color: '#94A3B8', fontSize: 13 },
  secureText: { color: '#64748B', fontSize: 12, textAlign: 'center', marginTop: 16 },
});
