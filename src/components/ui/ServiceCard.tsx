import React from 'react';
import { Pressable, Text, View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import type { ServiceCategory } from '@/constants/services';

type ServiceCardProps = {
  service: ServiceCategory;
  onPress: (service: ServiceCategory) => void;
};

export default function ServiceCard({ service, onPress }: ServiceCardProps) {
  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress(service);
  };

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [
        styles.card,
        pressed && styles.cardPressed,
      ]}
    >
      <View style={[styles.iconBox, { backgroundColor: service.color + '20' }]}>
        <Ionicons name={service.icon} size={24} color={service.color} />
      </View>
      <Text style={styles.name}>{service.name}</Text>
      <Text style={styles.description} numberOfLines={1}>
        {service.description}
      </Text>
      <Text style={styles.price}>From ₹{service.startingPrice}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 16,
    minHeight: 140,
    minWidth: '45%',
  },
  cardPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.95 }],
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  name: {
    color: '#F8FAFC',
    fontWeight: '700',
    fontSize: 16,
    marginBottom: 4,
  },
  description: {
    color: '#94A3B8',
    fontSize: 12,
    marginBottom: 8,
  },
  price: {
    color: '#60A5FA',
    fontSize: 14,
    fontWeight: '600',
  },
});
