import { useState } from 'react';
import { View, Text, TextInput, Pressable, KeyboardAvoidingView, Platform, ScrollView, StyleSheet } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Button from '@/components/ui/Button';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';

export default function BookingScreen() {
  const router = useRouter();
  const { serviceId, serviceName } = useLocalSearchParams<{
    serviceId: string;
    serviceName: string;
  }>();
  const { t } = useTranslation();
  const [description, setDescription] = useState('');
  const [isRecording, setIsRecording] = useState(false);

  const handleMicPress = () => {
    setIsRecording(!isRecording);
    if (!isRecording) {
      setTimeout(() => {
        setDescription('Kitchen sink pipe is leaking. Water dripping under the cabinet.');
        setIsRecording(false);
      }, 2000);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <ScrollView style={styles.flex} contentContainerStyle={styles.scrollContent}>
          {/* Back button */}
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#94A3B8" />
            <Text style={styles.backText}>{t('back')}</Text>
          </Pressable>

          <Animated.View entering={FadeInDown.duration(400)}>
            <Text style={styles.title}>{t('book_a')} {t(serviceName as TranslationKey, serviceName)}</Text>
            <Text style={styles.subtitle}>
              Describe your issue and we'll find the best worker nearby.
            </Text>

            {/* Description Input */}
            <View style={styles.inputSection}>
              <Text style={styles.label}>{t('describe_issue')}</Text>
              <TextInput
                value={description}
                onChangeText={setDescription}
                placeholder={t('describe_issue_hint')}
                placeholderTextColor="#4B5563"
                multiline
                numberOfLines={5}
                textAlignVertical="top"
                style={styles.textArea}
              />
            </View>

            {/* Voice AI Mock */}
            <View style={styles.micSection}>
              <Text style={styles.micLabel}>{t('voice_describe')}</Text>
              <Pressable
                onPress={handleMicPress}
                style={[styles.micBtn, isRecording && styles.micBtnRecording]}
              >
                <Ionicons
                  name={isRecording ? 'stop' : 'mic'}
                  size={32}
                  color="white"
                />
              </Pressable>
              {isRecording && (
                <Text style={styles.recordingText}>🎙️ Listening...</Text>
              )}
            </View>

            {/* Photo attachment */}
            <View style={styles.photoCard}>
              <Text style={styles.label}>{t('attach_photos')}</Text>
              <View style={styles.photoRow}>
                <Pressable style={styles.photoBtn}>
                  <Ionicons name="camera-outline" size={24} color="#64748B" />
                  <Text style={styles.photoBtnText}>{t('camera')}</Text>
                </Pressable>
                <Pressable style={styles.photoBtn}>
                  <Ionicons name="image-outline" size={24} color="#64748B" />
                  <Text style={styles.photoBtnText}>{t('gallery')}</Text>
                </Pressable>
              </View>
            </View>

            {/* Proceed */}
            <Button
              title={t('proceed_payment')}
              onPress={() =>
                router.push({
                  pathname: '/(customer)/checkout',
                  params: { serviceId, serviceName, description },
                })
              }
              disabled={description.length < 10}
              icon={<Ionicons name="arrow-forward" size={20} color="white" />}
            />
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0F172A' },
  flex: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 24 },
  backBtn: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16 },
  backText: { color: '#94A3B8', marginLeft: 8 },
  title: { color: '#F8FAFC', fontSize: 24, fontWeight: '700', marginBottom: 8 },
  subtitle: { color: '#94A3B8', fontSize: 15, marginBottom: 32 },
  inputSection: { marginBottom: 24 },
  label: { color: '#CBD5E1', fontSize: 14, fontWeight: '600', marginBottom: 8 },
  textArea: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 16,
    color: '#F8FAFC',
    fontSize: 16,
    minHeight: 140,
    borderWidth: 1,
    borderColor: '#334155',
    textAlignVertical: 'top',
  },
  micSection: { alignItems: 'center', marginBottom: 32 },
  micLabel: { color: '#94A3B8', fontSize: 14, marginBottom: 16 },
  micBtn: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  micBtnRecording: { backgroundColor: '#DC2626' },
  recordingText: { color: '#F87171', fontSize: 14, fontWeight: '500', marginTop: 12 },
  photoCard: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 16,
    marginBottom: 32,
  },
  photoRow: { flexDirection: 'row', gap: 12, marginTop: 4 },
  photoBtn: {
    width: 80,
    height: 80,
    backgroundColor: '#334155',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#475569',
  },
  photoBtnText: { color: '#64748B', fontSize: 11, marginTop: 4 },
});
