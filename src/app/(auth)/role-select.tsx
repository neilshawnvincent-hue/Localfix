import { View, Text, Pressable, StyleSheet, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '@/store/authStore';
import { useTranslation } from 'react-i18next';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  FadeInDown,
  FadeInUp,
} from 'react-native-reanimated';

export default function RoleSelectScreen() {
  const router = useRouter();
  const setRole = useAuthStore((s) => s.setRole);
  const { t } = useTranslation();

  const selectRole = (role: 'customer' | 'worker') => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setRole(role);
    router.push('/(auth)/otp-login');
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#EEF2FF', '#FFFFFF']}
        style={StyleSheet.absoluteFill}
      />
      
      {/* Header */}
      <Animated.View entering={FadeInUp.duration(500)} style={styles.header}>
        <View style={styles.logoBox}>
          <LinearGradient
            colors={['#6366F1', '#8B5CF6']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[StyleSheet.absoluteFill, { borderRadius: 24 }]}
          />
          <Ionicons name="construct" size={32} color="white" />
        </View>
        <Text style={styles.title}>
          {t('welcome_to')}<Text style={styles.titleAccent}>{t('app_name_accent')}</Text>
        </Text>
        <Text style={styles.subtitle}>{t('how_to_use')}</Text>
      </Animated.View>

      {/* Cards */}
      <Animated.View entering={FadeInDown.delay(200).duration(500)} style={styles.cardsWrapper}>
        {/* Customer Card */}
        <Pressable
          onPress={() => selectRole('customer')}
          style={({ pressed }) => [
            styles.card,
            styles.shadow,
            pressed && styles.cardPressed,
          ]}
        >
          <View style={styles.cardRow}>
            <View style={[styles.iconBox, { backgroundColor: '#EFF6FF' }]}>
              <Ionicons name="home" size={28} color="#3B82F6" />
            </View>
            <View style={styles.cardTextContainer}>
              <Text style={styles.cardTitle}>{t('i_need_service')}</Text>
              <Text style={styles.cardSubtitle}>{t('find_workers')}</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#64748B" />
          </View>
          <View style={styles.tagRow}>
            <View style={styles.tag}>
              <Text style={styles.tagText}>{t('quick_booking')}</Text>
            </View>
            <View style={styles.tag}>
              <Text style={styles.tagText}>{t('verified_pros')}</Text>
            </View>
          </View>
        </Pressable>

        {/* Worker Card */}
        <Pressable
          onPress={() => selectRole('worker')}
          style={({ pressed }) => [
            styles.card,
            styles.shadow,
            pressed && styles.cardPressedWorker,
          ]}
        >
          <View style={styles.cardRow}>
            <View style={[styles.iconBox, { backgroundColor: '#F5F3FF' }]}>
              <Ionicons name="briefcase" size={28} color="#8B5CF6" />
            </View>
            <View style={styles.cardTextContainer}>
              <Text style={styles.cardTitle}>{t('i_want_to_work')}</Text>
              <Text style={styles.cardSubtitle}>{t('earn_money')}</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#64748B" />
          </View>
          <View style={styles.tagRow}>
            <View style={styles.tag}>
              <Text style={styles.tagText}>{t('guaranteed_fee')}</Text>
            </View>
            <View style={styles.tag}>
              <Text style={styles.tagText}>{t('work_nearby')}</Text>
            </View>
          </View>
        </Pressable>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 56,
  },
  logoBox: {
    width: 72,
    height: 72,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#6366F1',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
      },
      android: { elevation: 8 },
      web: { boxShadow: '0px 8px 24px rgba(99, 102, 241, 0.3)' }
    }),
  },
  title: {
    color: '#0F172A',
    fontSize: 32,
    fontWeight: '900',
    marginBottom: 12,
    textAlign: 'center',
  },
  titleAccent: {
    color: '#6366F1',
  },
  subtitle: {
    color: '#64748B',
    fontSize: 16,
    textAlign: 'center',
  },
  cardsWrapper: {
    gap: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  shadow: {
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.05,
        shadowRadius: 16,
      },
      android: { elevation: 4 },
      web: { boxShadow: '0px 6px 24px rgba(0, 0, 0, 0.05)' }
    }),
  },
  cardPressed: {
    borderColor: '#3B82F6',
    backgroundColor: '#FAFAF9',
    transform: [{ scale: 0.98 }],
  },
  cardPressedWorker: {
    borderColor: '#8B5CF6',
    backgroundColor: '#FAFAF9',
    transform: [{ scale: 0.98 }],
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconBox: {
    width: 56,
    height: 64,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  cardTextContainer: {
    flex: 1,
  },
  cardTitle: {
    color: '#0F172A',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  cardSubtitle: {
    color: '#64748B',
    fontSize: 14,
  },
  tagRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 20,
  },
  tag: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  tagText: {
    color: '#475569',
    fontSize: 12,
  },
});
