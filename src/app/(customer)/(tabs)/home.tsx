import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, Image, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '@/store/authStore';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { LinearGradient } from 'expo-linear-gradient';
import { Platform } from 'react-native';

interface CustomerHomeScreenProps {
  activeBookingId?: string;
}

export default function CustomerHomeScreen({ activeBookingId = 'booking-123' }: CustomerHomeScreenProps = {}) {
  const router = useRouter();
  const { t } = useTranslation();
  const [userName, setUserName] = useState<string>('Guest');

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.user_metadata?.full_name) {
        setUserName(user.user_metadata.full_name);
      }
    };
    fetchUser();
  }, []);

  const displayName = userName;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.profileSection}>
            <View style={styles.avatarContainer}>
              <Ionicons name="person" size={24} color="#3B82F6" />
            </View>
            <Text style={styles.userName}>{displayName}</Text>
          </View>
          <View style={styles.headerIcons}>
            <View style={styles.headerIconButton}>
              <Ionicons name="reader-outline" size={22} color="#1A1A1A" />
            </View>
            <View style={styles.headerIconButton}>
              <Ionicons name="notifications-outline" size={22} color="#1A1A1A" />
            </View>
          </View>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={20} color="#6B7280" style={styles.searchIcon} />
          <TextInput
            placeholder={t('search_service')}
            placeholderTextColor="#9CA3AF"
            style={styles.searchInput}
          />
          <Ionicons name="scan-outline" size={20} color="#1A1A1A" style={styles.scanIcon} />
        </View>

        {/* Banner Card */}
        <Pressable 
          style={({ pressed }) => [styles.bannerCard, pressed && { opacity: 0.9, transform: [{ scale: 0.98 }] }]}
          onPress={() => router.push('/(customer)/active-job')}
          accessibilityRole="button"
        >
          <LinearGradient
            colors={['#E0E7FF', '#C7D2FE']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
          <Text style={styles.bannerLabel}>{t('active_booking')}</Text>
          <Text style={styles.trackingId}>Plumbing Repair</Text>
          
          <View style={styles.bannerBottom}>
            <Text style={styles.statusText}>{t('worker_on_way')}</Text>
            <Text style={styles.dateText}>Feb 21</Text>
          </View>

          {/* Handyman Image */}
          <Image 
            source={require('../../../../assets/images/handyman_3d.jpg')} 
            style={styles.workerImage}
            resizeMode="cover"
          />
        </Pressable>

        {/* Action Buttons */}
        <View style={styles.actionGrid}>
          {[
            { icon: 'hammer-outline', label: t('book'), route: '/(services)/catalog' },
            { icon: 'map-outline', label: t('track'), route: '/(customer)/active-job' },
            { icon: 'document-text-outline', label: t('history'), route: '/(tabs)/jobs' },
            { icon: 'chatbox-ellipses-outline', label: t('support'), route: '/(modals)/support' },
          ].map((action, i) => (
            <Pressable 
              key={i} 
              style={styles.actionBtn}
              className="active:opacity-80"
              onPress={() => router.push(action.route as any)}
              accessibilityRole="button"
              accessibilityLabel={action.label}
            >
              <Ionicons name={action.icon as any} size={24} color="#1A1A1A" />
              <Text style={styles.actionLabel}>{action.label}</Text>
            </Pressable>
          ))}
        </View>

        {/* Shipping History Section */}
        <View style={styles.historyHeader}>
          <Text style={styles.historyTitle}>{t('service_history')}</Text>
          <Pressable 
            style={styles.seeAllBtn}
            className="active:opacity-80"
            onPress={() => router.push('/(customer)/(tabs)/jobs')}
            accessibilityRole="button"
          >
            <Text style={styles.seeAllText}>{t('see_all')}</Text>
            <Ionicons name="chevron-forward" size={14} color="#4B5563" />
          </Pressable>
        </View>

        {/* List Items */}
        <View style={styles.historyList}>
          {[
            { id: 'AC Repair', desc: 'Worker arrived on Feb 21', status: 'In Progress', statusColor: '#FFD13B', statusText: '#1A1A1A' },
            { id: 'Electrical Setup', desc: 'Completed on Jan 8', status: 'Completed', statusColor: '#E5E7EB', statusText: '#4B5563' },
            { id: 'Deep Cleaning', desc: 'Completed on Dec 14', status: 'Completed', statusColor: '#E5E7EB', statusText: '#4B5563' },
          ].map((item, i) => (
            <View key={i} style={styles.historyItem}>
              <View style={styles.historyIconBox}>
                <Ionicons name="construct-outline" size={24} color="#1A1A1A" />
              </View>
              <View style={styles.historyContent}>
                <Text style={styles.historyId}>{item.id}</Text>
                <Text style={styles.historyDesc}>{item.desc}</Text>
              </View>
              <View style={[styles.statusPill, { backgroundColor: item.statusColor }]}>
                <Text style={[styles.statusPillText, { color: item.statusText }]}>{item.status}</Text>
              </View>
            </View>
          ))}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  userName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1A1A1A',
  },
  headerIcons: {
    flexDirection: 'row',
    gap: 12,
  },
  headerIconButton: {
    width: 36,
    height: 36,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 52,
    marginBottom: 24,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1A1A1A',
  },
  scanIcon: {
    marginLeft: 12,
  },
  bannerCard: {
    borderRadius: 24,
    padding: 24,
    minHeight: 180,
    marginBottom: 32,
    position: 'relative',
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#6366F1',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 16,
      },
      android: { elevation: 8 },
      web: { boxShadow: '0px 8px 24px rgba(99, 102, 241, 0.2)' }
    }),
  },
  bannerLabel: {
    fontSize: 13,
    color: '#1A1A1A',
    opacity: 0.8,
    marginBottom: 4,
  },
  trackingId: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1A1A1A',
    marginBottom: 32,
    maxWidth: '60%',
    zIndex: 2,
  },
  bannerBottom: {
    marginTop: 'auto',
    zIndex: 2,
  },
  statusText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  dateText: {
    fontSize: 13,
    color: '#1A1A1A',
    opacity: 0.8,
  },
  workerImage: {
    position: 'absolute',
    right: -20,
    bottom: -10,
    width: 150,
    height: 150,
    zIndex: 1,
    borderRadius: 16,
  },
  actionGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 36,
  },
  actionBtn: {
    width: 72,
    height: 72,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
      },
      android: { elevation: 2 },
      web: { boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.05)' }
    }),
  },
  actionLabel: {
    fontSize: 12,
    color: '#4B5563',
    marginTop: 6,
    fontWeight: '500',
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  historyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  seeAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  seeAllText: {
    fontSize: 12,
    color: '#4B5563',
    fontWeight: '500',
    marginRight: 4,
  },
  historyList: {
    gap: 24,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  historyIconBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  historyContent: {
    flex: 1,
  },
  historyId: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  historyDesc: {
    fontSize: 13,
    color: '#6B7280',
  },
  statusPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusPillText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
