import React from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import Button from '@/components/ui/Button';
import { useTranslation } from 'react-i18next';

export default function CustomerProfileScreen() {
  const router = useRouter();
  const { userName, phone, logout, language, setLanguage } = useAuthStore();
  const { t } = useTranslation();

  const handleLogout = async () => {
    logout();
    router.replace('/(auth)/role-select');
  };

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'hi' : 'en');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.flex} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>{t('profile')}</Text>

        <View style={styles.avatarSection}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={36} color="#3B82F6" />
          </View>
          <Text style={styles.name}>{userName}</Text>
          <Text style={styles.phone}>+91 {phone}</Text>
        </View>

        <View style={styles.menuCard}>
          <Pressable style={styles.menuItem} onPress={toggleLanguage}>
            <Ionicons name="language" size={20} color="#94A3B8" />
            <Text style={styles.menuLabel}>{language === 'en' ? 'Switch to Hindi (हिंदी)' : 'Switch to English'}</Text>
            <Ionicons name="chevron-forward" size={18} color="#64748B" />
          </Pressable>
          {[
            { icon: 'card' as const, label: t('payment_method') },
            { icon: 'notifications' as const, label: 'Notifications' },
            { icon: 'help-circle' as const, label: t('support') },
            { icon: 'document-text' as const, label: 'Terms of Service' },
          ].map((item, i) => (
            <Pressable key={i} style={styles.menuItem}>
              <Ionicons name={item.icon} size={20} color="#94A3B8" />
              <Text style={styles.menuLabel}>{item.label}</Text>
              <Ionicons name="chevron-forward" size={18} color="#64748B" />
            </Pressable>
          ))}
        </View>

        <Button
          title={t('logout')}
          variant="danger"
          onPress={handleLogout}
          icon={<Ionicons name="log-out" size={20} color="white" />}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F9FAFB' },
  flex: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 24 },
  title: { color: '#111827', fontSize: 24, fontWeight: '700', paddingVertical: 24 },
  avatarSection: { alignItems: 'center', marginBottom: 32 },
  avatar: { width: 80, height: 80, backgroundColor: 'rgba(59,130,246,0.1)', borderRadius: 40, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  name: { color: '#111827', fontSize: 20, fontWeight: '700' },
  phone: { color: '#6B7280', fontSize: 14 },
  menuCard: { 
    backgroundColor: '#FFFFFF', 
    borderRadius: 16, 
    overflow: 'hidden', 
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  menuLabel: { color: '#374151', fontSize: 16, marginLeft: 16, flex: 1 },
});
