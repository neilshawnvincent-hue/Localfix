import { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, TextInput, KeyboardAvoidingView, Platform, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '@/store/authStore';
import { useTranslation } from 'react-i18next';
import Button from '@/components/ui/Button';
import BackButton from '@/components/ui/BackButton';
import OTPInput, { OTPInputHandle } from '@/components/ui/OTPInput';
import Animated, { FadeInDown } from 'react-native-reanimated';

const RESEND_COOLDOWN_SECONDS = 30;

export default function OTPLoginScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const [phone, setPhone] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  
  const login = useAuthStore((s) => s.login);
  const role = useAuthStore((s) => s.pendingRole ?? s.role);
  const otpInputRef = useRef<OTPInputHandle>(null);
  const cooldownTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Clean up cooldown timer on unmount
  useEffect(() => {
    return () => {
      if (cooldownTimerRef.current) {
        clearInterval(cooldownTimerRef.current);
      }
    };
  }, []);

  const startCooldownTimer = useCallback(() => {
    setResendCooldown(RESEND_COOLDOWN_SECONDS);

    if (cooldownTimerRef.current) {
      clearInterval(cooldownTimerRef.current);
    }

    cooldownTimerRef.current = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          if (cooldownTimerRef.current) {
            clearInterval(cooldownTimerRef.current);
            cooldownTimerRef.current = null;
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  const handleSendOTP = async () => {
    if (phone.length < 10) return;
    setLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      setOtpSent(true);
      startCooldownTimer();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (resendCooldown > 0) return;
    setLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      otpInputRef.current?.reset();
      startCooldownTimer();
      Alert.alert('OTP Sent', `A new code has been sent to +91 ${phone}`);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (code: string) => {
    if (code.length !== 6) {
      Alert.alert('Invalid Code', 'The code you entered is incorrect. Please try again.');
      otpInputRef.current?.reset();
      return;
    }

    setLoading(true);

    try {
      // Mock network request
      await new Promise(resolve => setTimeout(resolve, 800));
      login(phone);
      
      const currentRole = useAuthStore.getState().role;
      if (currentRole === 'customer') {
        router.replace('/(customer)/(tabs)/home');
      } else {
        router.replace('/(kyc)/verification');
      }
    } catch (err: any) {
      Alert.alert('Login failed', err?.message || 'Network error.');
      otpInputRef.current?.reset();
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.inner}>
        <View style={styles.topBar}>
          <BackButton />
        </View>
        <Animated.View entering={FadeInDown.duration(500)}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.iconBox}>
              <Ionicons
                name={role === 'worker' ? 'briefcase' : 'phone-portrait'}
                size={32}
                color="#3B82F6"
              />
            </View>
            <Text style={styles.title}>
              {otpSent ? t('enter_mobile').replace('mobile number', 'OTP') : t('enter_mobile')}
            </Text>
            <Text style={styles.subtitle}>
              {otpSent
                ? `${t('otp_sent_to')} +91 ${phone}`
                : t('mobile_desc')}
            </Text>
          </View>

          {!otpSent ? (
            <View>
              {/* Phone Input */}
              <View style={styles.phoneRow}>
                <Text style={styles.countryCode}>+91</Text>
                <View style={styles.divider} />
                <TextInput
                  value={phone}
                  onChangeText={(t) => setPhone(t.replace(/[^0-9]/g, ''))}
                  placeholder={t('enter_mobile')}
                  placeholderTextColor="#64748B"
                  keyboardType="phone-pad"
                  maxLength={10}
                  style={styles.phoneInput}
                />
              </View>

              <Button
                title={t('get_otp')}
                onPress={handleSendOTP}
                loading={loading}
                disabled={phone.length < 10}
                icon={<Ionicons name="arrow-forward" size={20} color="white" />}
              />
            </View>
          ) : (
            <View style={styles.otpSection}>
              <OTPInput
                ref={otpInputRef}
                onComplete={handleVerifyOTP}
                label={t('verify_otp')}
              />

              <View style={styles.resendSection}>
                {resendCooldown > 0 ? (
                  <Text style={styles.cooldownText}>
                    {t('resend_in')} {resendCooldown}s
                  </Text>
                ) : (
                  <>
                    <Text style={styles.resendText}>
                      {t('didnt_receive')}
                    </Text>
                    <Button
                      title={t('resend_otp')}
                      variant="ghost"
                      size="sm"
                      onPress={handleResendOTP}
                      loading={loading}
                    />
                  </>
                )}
              </View>
            </View>
          )}
        </Animated.View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  inner: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  topBar: {
    position: 'absolute',
    top: 60,
    left: 24,
    zIndex: 10,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  iconBox: {
    width: 64,
    height: 64,
    backgroundColor: '#EFF6FF',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    color: '#0F172A',
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 8,
  },
  subtitle: {
    color: '#64748B',
    fontSize: 15,
    textAlign: 'center',
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 12 },
      android: { elevation: 2 },
      web: { boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.05)' }
    }),
  },
  countryCode: {
    color: '#64748B',
    fontSize: 18,
    fontWeight: '600',
    marginRight: 8,
  },
  divider: {
    width: 1,
    height: 32,
    backgroundColor: '#E2E8F0',
    marginRight: 12,
  },
  phoneInput: {
    flex: 1,
    color: '#0F172A',
    fontSize: 18,
    paddingVertical: 16,
    fontWeight: '600',
  },
  otpSection: {
    alignItems: 'center',
  },
  resendSection: {
    marginTop: 32,
    alignItems: 'center',
  },
  resendText: {
    color: '#64748B',
    fontSize: 14,
    marginBottom: 4,
  },
  cooldownText: {
    color: '#64748B',
    fontSize: 14,
    fontWeight: '500',
  },
});
