import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function MapPlaceholder({ height = 300 }: { height?: number }) {
  return (
    <View style={[styles.container, { height }]}>
      {/* Grid lines */}
      <View style={styles.gridOverlay}>
        {Array.from({ length: 8 }).map((_, i) => (
          <View
            key={`h-${i}`}
            style={[styles.gridLineH, { top: (i + 1) * (height / 9) }]}
          />
        ))}
        {Array.from({ length: 6 }).map((_, i) => (
          <View
            key={`v-${i}`}
            style={[styles.gridLineV, { left: `${(i + 1) * 14.28}%` as any }]}
          />
        ))}
      </View>

      {/* Center marker */}
      <View style={styles.markerContainer}>
        <View style={styles.marker}>
          <Ionicons name="location" size={24} color="white" />
        </View>
        <View style={styles.markerShadow} />
      </View>

      <Text style={styles.label}>Live Map View</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  gridOverlay: {
    ...StyleSheet.absoluteFill as object,
    opacity: 0.1,
  },
  gridLineH: {
    position: 'absolute',
    left: 0,
    right: 0,
    borderTopWidth: 1,
    borderTopColor: '#9CA3AF',
  },
  gridLineV: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    borderLeftWidth: 1,
    borderLeftColor: '#9CA3AF',
  },
  markerContainer: {
    alignItems: 'center',
  },
  marker: {
    width: 48,
    height: 48,
    backgroundColor: '#2563EB',
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  markerShadow: {
    width: 16,
    height: 16,
    backgroundColor: 'rgba(37,99,235,0.3)',
    borderRadius: 8,
  },
  label: {
    color: '#64748B',
    fontSize: 12,
    marginTop: 16,
    fontWeight: '500',
  },
});
