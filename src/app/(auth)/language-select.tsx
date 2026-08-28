import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore, type Language } from '@/store/authStore';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

export default function LanguageSelectScreen() {
  const router = useRouter();
  const setLanguage = useAuthStore((s) => s.setLanguage);

  const selectLanguage = (lang: Language) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setLanguage(lang);
    router.replace('/(auth)/role-select');
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <Animated.View entering={FadeInUp.duration(500)} style={styles.header}>
        <View style={styles.logoBox}>
          <Ionicons name="language" size={32} color="white" />
        </View>
        <Text style={styles.title}>
          Choose Language
        </Text>
        <Text style={styles.subtitle}>अपनी भाषा चुनें</Text>
      </Animated.View>

      {/* Cards */}
      <Animated.View entering={FadeInDown.delay(200).duration(500)} style={styles.cardsWrapper}>
        
        {/* English */}
        <Pressable
          onPress={() => selectLanguage('en')}
          style={({ pressed }) => [
            styles.card,
            pressed && styles.cardPressed,
          ]}
        >
          <View style={styles.cardRow}>
            <View style={[styles.iconBox, { backgroundColor: 'rgba(59,130,246,0.15)' }]}>
              <Text style={{ fontSize: 24, fontWeight: '700', color: '#3B82F6' }}>A</Text>
            </View>
            <View style={styles.cardTextContainer}>
              <Text style={styles.cardTitle}>English</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#64748B" />
          </View>
        </Pressable>

        {/* Hindi */}
        <Pressable
          onPress={() => selectLanguage('hi')}
          style={({ pressed }) => [
            styles.card,
            pressed && styles.cardPressedWorker,
          ]}
        >
          <View style={styles.cardRow}>
            <View style={[styles.iconBox, { backgroundColor: 'rgba(245,158,11,0.15)' }]}>
              <Text style={{ fontSize: 24, fontWeight: '700', color: '#F59E0B' }}>अ</Text>
            </View>
            <View style={styles.cardTextContainer}>
              <Text style={styles.cardTitle}>हिंदी</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#64748B" />
          </View>
        </Pressable>
        
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logoBox: {
    width: 64,
    height: 64,
    backgroundColor: '#2563EB',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    color: '#F8FAFC',
    fontSize: 28,
    fontWeight: '900',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    color: '#94A3B8',
    fontSize: 18,
    textAlign: 'center',
  },
  cardsWrapper: {
  },
  card: {
    backgroundColor: '#1E293B',
    borderRadius: 24,
    padding: 20,
    borderWidth: 2,
    borderColor: 'transparent',
    marginBottom: 20,
  },
  cardPressed: {
    borderColor: '#3B82F6',
    transform: [{ scale: 0.98 }],
  },
  cardPressedWorker: {
    borderColor: '#F59E0B',
    transform: [{ scale: 0.98 }],
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBox: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  cardTextContainer: {
    flex: 1,
  },
  cardTitle: {
    color: '#F8FAFC',
    fontSize: 20,
    fontWeight: '700',
  },
});
