import React from 'react';
import { Pressable, Text, ActivityIndicator, View, StyleSheet, Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'success' | 'ghost';

type ButtonProps = {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  style?: any;
};

const variantBg: Record<ButtonVariant, string> = {
  primary: 'transparent', // Uses LinearGradient
  secondary: '#FFFFFF',
  danger: '#EF4444',
  success: '#10B981',
  ghost: 'transparent',
};

const variantTextColor: Record<ButtonVariant, string> = {
  primary: '#FFFFFF',
  secondary: '#475569',
  danger: '#FFFFFF',
  success: '#FFFFFF',
  ghost: '#6366F1',
};

const sizeHeight = { sm: 40, md: 48, lg: 56 };
const sizePx = { sm: 16, md: 20, lg: 24 };
const sizeFont = { sm: 14, md: 16, lg: 18 };
const sizeRadius = { sm: 20, md: 24, lg: 28 };

export default function Button({
  title,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  icon,
  size = 'lg',
  className = '',
  style,
}: ButtonProps) {
  const handlePress = () => {
    if (!disabled && !loading) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      onPress();
    }
  };

  const isPrimary = variant === 'primary';

  const innerContent = (
    <>
      {loading ? (
        <ActivityIndicator color={variantTextColor[variant]} size="small" />
      ) : (
        <View style={styles.content}>
          {icon}
          <Text
            style={[
              styles.text,
              {
                color: variantTextColor[variant],
                fontSize: sizeFont[size],
              },
            ]}
          >
            {title}
          </Text>
        </View>
      )}
    </>
  );

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.button,
        {
          minHeight: sizeHeight[size],
          borderRadius: sizeRadius[size],
          opacity: disabled ? 0.5 : pressed ? 0.85 : 1,
          transform: [{ scale: pressed ? 0.98 : 1 }],
          backgroundColor: isPrimary ? 'transparent' : variantBg[variant],
        },
        variant === 'secondary' && styles.secondaryBorder,
        !isPrimary && variant !== 'ghost' && styles.shadow,
        style,
      ]}
    >
      {isPrimary ? (
        <LinearGradient
          colors={['#6366F1', '#8B5CF6']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[
            StyleSheet.absoluteFill,
            { borderRadius: sizeRadius[size], alignItems: 'center', justifyContent: 'center' }
          ]}
        >
          {innerContent}
        </LinearGradient>
      ) : (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: sizePx[size] }}>
          {innerContent}
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    justifyContent: 'center',
    overflow: 'hidden', // to keep gradient inside radius
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  text: {
    fontWeight: '700',
  },
  secondaryBorder: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  shadow: {
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
      },
      android: {
        elevation: 4,
      },
      web: {
        boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
      }
    }),
  }
});
