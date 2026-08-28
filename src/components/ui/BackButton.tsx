import { Pressable, Text, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

interface BackButtonProps {
  color?: string;
  label?: string;
  style?: StyleProp<ViewStyle>;
}

export default function BackButton({ color = '#94A3B8', label = 'Back', style }: BackButtonProps) {
  const router = useRouter();

  if (!router.canGoBack()) {
    return null; // Don't show if there's no history to go back to
  }

  return (
    <Pressable onPress={() => router.back()} style={[styles.backBtn, style]}>
      <Ionicons name="arrow-back" size={24} color={color} />
      {label ? <Text style={[styles.backText, { color }]}>{label}</Text> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    marginBottom: 8,
  },
  backText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '500',
  },
});
