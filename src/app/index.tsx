import { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { useAuthStore } from '@/store/authStore';

export default function SplashScreen() {
  const router = useRouter();
  const { isLoggedIn } = useAuthStore();
  const logoScale = useSharedValue(0.3);
  const logoOpacity = useSharedValue(0);
  const taglineOpacity = useSharedValue(0);

  useEffect(() => {
    logoOpacity.value = withTiming(1, { duration: 600, easing: Easing.out(Easing.cubic) });
    logoScale.value = withSequence(
      withTiming(1.1, { duration: 500, easing: Easing.out(Easing.cubic) }),
      withTiming(1, { duration: 200 })
    );
    taglineOpacity.value = withDelay(400, withTiming(1, { duration: 500 }));

    const timeout = setTimeout(() => {
      if (!isLoggedIn) {
        router.replace('/(auth)/role-select');
      }
    }, 2000);

    return () => clearTimeout(timeout);
  }, []);

  const logoAnimStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ scale: logoScale.value }],
  }));

  const taglineAnimStyle = useAnimatedStyle(() => ({
    opacity: taglineOpacity.value,
  }));

  return (
    <View style={styles.container}>
      <Animated.View style={[logoAnimStyle, styles.logoSection]}>
        <View style={styles.logoBox}>
          <Ionicons name="construct" size={48} color="white" />
        </View>
        <Text style={styles.title}>
          Local<Text style={styles.titleAccent}>Fix</Text>
        </Text>
      </Animated.View>

      <Animated.View style={[taglineAnimStyle, styles.taglineSection]}>
        <Text style={styles.tagline}>Trusted help, minutes away</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoSection: {
    alignItems: 'center',
  },
  logoBox: {
    width: 96,
    height: 96,
    backgroundColor: '#2563EB',
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  title: {
    color: '#F8FAFC',
    fontSize: 36,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  titleAccent: {
    color: '#60A5FA',
  },
  taglineSection: {
    marginTop: 16,
  },
  tagline: {
    color: '#94A3B8',
    fontSize: 16,
    fontWeight: '500',
  },
});
