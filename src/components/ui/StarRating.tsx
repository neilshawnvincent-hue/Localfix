import { View, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

interface StarRatingProps {
  /** Current rating value, 0..5. */
  value: number;
  /** Called with the new rating when a star is pressed. Omit for read-only. */
  onChange?: (stars: number) => void;
  size?: number;
  /** Disables interaction and renders as a static display. */
  readOnly?: boolean;
  color?: string;
  emptyColor?: string;
}

export default function StarRating({
  value,
  onChange,
  size = 40,
  readOnly = false,
  color = '#FBBF24',
  emptyColor = '#D1D5DB',
}: StarRatingProps) {
  const stars = [1, 2, 3, 4, 5];

  const handlePress = (stars: number) => {
    if (readOnly || !onChange) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onChange(stars);
  };

  return (
    <View style={styles.row}>
      {stars.map((star) => {
        const filled = star <= value;
        return (
          <Pressable
            key={star}
            onPress={() => handlePress(star)}
            disabled={readOnly}
            hitSlop={6}
            style={styles.star}
            accessibilityRole={readOnly ? 'image' : 'button'}
            accessibilityLabel={`${star} star${star > 1 ? 's' : ''}`}
          >
            <Ionicons
              name={filled ? 'star' : 'star-outline'}
              size={size}
              color={filled ? color : emptyColor}
            />
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  star: {
    paddingHorizontal: 4,
  },
});
