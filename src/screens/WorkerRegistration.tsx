import AsyncStorage from '@react-native-async-storage/async-storage';
import { ChevronDown, Globe, UserPlus } from 'lucide-react-native';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { Button, Copy, Heading, Logo, Notice } from '../components/ui';
import { persistLanguage } from '../i18n/i18n';
import { supabase } from '../lib/supabase';

const PROFESSIONS = ['plumber', 'electrician', 'carpenter', 'painter', 'cleaner', 'appliance_repair'] as const;

interface FormErrors {
  fullName?: string;
  profession?: string;
  uan?: string;
  aadhaar?: string;
}

export function WorkerRegistration() {
  const { t, i18n } = useTranslation();

  // ── Language toggle ──
  const [lang, setLang] = useState(i18n.language);

  const toggleLanguage = useCallback(async () => {
    const next = lang === 'en' ? 'hi' : 'en';
    await i18n.changeLanguage(next);
    await persistLanguage(next);
    setLang(next);
  }, [lang, i18n]);

  // Keep local state in sync if language changes externally
  useEffect(() => {
    const handler = (lng: string) => setLang(lng);
    i18n.on('languageChanged', handler);
    return () => { i18n.off('languageChanged', handler); };
  }, [i18n]);

  // ── Form state ──
  const [fullName, setFullName] = useState('');
  const [profession, setProfession] = useState('');
  const [uan, setUan] = useState('');
  const [aadhaar, setAadhaar] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ kind: 'success' | 'error'; message: string } | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);

  // ── Validation ──
  function validate(): FormErrors {
    const e: FormErrors = {};
    if (!fullName.trim()) e.fullName = t('registration.errors.fullNameRequired');
    else if (fullName.trim().length < 2) e.fullName = t('registration.errors.fullNameMinLength');
    if (!profession) e.profession = t('registration.errors.professionRequired');
    if (!uan.trim()) e.uan = t('registration.errors.uanRequired');
    else if (!/^\d{12}$/.test(uan.trim())) e.uan = t('registration.errors.uanInvalid');
    if (!aadhaar.trim()) e.aadhaar = t('registration.errors.aadhaarRequired');
    else if (!/^\d{12}$/.test(aadhaar.trim())) e.aadhaar = t('registration.errors.aadhaarInvalid');
    return e;
  }

  // ── Submit ──
  async function onSubmit() {
    setResult(null);
    const validationErrors = validate();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setLoading(true);
    try {
      if (!supabase) {
        // Demo mode — simulate a short delay
        await new Promise(resolve => setTimeout(resolve, 800));
        setResult({ kind: 'success', message: t('registration.errors.registrationSuccess') });
        return;
      }

      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw new Error('Not authenticated.');

      const { error: upsertError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          full_name: fullName.trim(),
          profession,
          uan_number: uan.trim(),
          aadhaar_number: aadhaar.trim(),
        }, { onConflict: 'id' });

      if (upsertError) throw upsertError;
      setResult({ kind: 'success', message: t('registration.errors.registrationSuccess') });
    } catch {
      setResult({ kind: 'error', message: t('registration.errors.registrationFailed') });
    } finally {
      setLoading(false);
    }
  }

  // ── Profession picker (cross-platform) ──
  function ProfessionPicker() {
    return (
      <Modal visible={pickerOpen} transparent animationType="fade" onRequestClose={() => setPickerOpen(false)}>
        <Pressable onPress={() => setPickerOpen(false)} className="flex-1 items-center justify-center bg-black/40 p-6">
          <View className="w-full max-w-sm rounded-xl border border-line bg-white">
            <View className="border-b border-line px-5 py-3.5">
              <Heading className="text-base">{t('registration.professionPlaceholder')}</Heading>
            </View>
            <ScrollView className="max-h-72">
              {PROFESSIONS.map(key => (
                <Pressable
                  key={key}
                  accessibilityRole="button"
                  onPress={() => { setProfession(key); setPickerOpen(false); setErrors(prev => ({ ...prev, profession: undefined })); }}
                  className={`border-b border-line/50 px-5 py-3.5 ${profession === key ? 'bg-mint' : ''}`}
                >
                  <Copy className={`text-[14px] ${profession === key ? 'font-bold text-primary' : ''}`}>
                    {t(`registration.professions.${key}`)}
                  </Copy>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>
    );
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1 bg-canvas">
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerClassName="flex-grow items-center justify-center p-6 md:p-12">
        <View className="w-full max-w-lg gap-6">

          {/* ── Header row ── */}
          <View className="flex-row items-center justify-between">
            <Logo />
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('registration.selectLanguage')}
              onPress={() => void toggleLanguage()}
              className="flex-row items-center gap-1.5 rounded-lg border border-line bg-white px-3 py-2"
            >
              <Globe size={16} color="#287454" />
              <Copy className="font-semibold text-[13px] text-primary">{lang === 'en' ? 'हिन्दी' : 'English'}</Copy>
            </Pressable>
          </View>

          {/* ── Title ── */}
          <View className="gap-2">
            <View className="h-14 w-14 items-center justify-center rounded-lg bg-mint">
              <UserPlus size={28} color="#287454" />
            </View>
            <Heading className="text-[24px] leading-[30px] md:text-[32px] md:leading-[40px]">{t('registration.title')}</Heading>
            <Copy className="text-muted">{t('registration.subtitle')}</Copy>
          </View>

          {/* ── Full Name ── */}
          <View className="gap-1.5">
            <Copy className="font-semibold text-[12px] md:text-[13px]">{t('registration.fullName')}</Copy>
            <TextInput
              accessibilityLabel={t('registration.fullName')}
              placeholder={t('registration.fullNamePlaceholder')}
              placeholderTextColor="#96A19B"
              value={fullName}
              onChangeText={v => { setFullName(v); setErrors(prev => ({ ...prev, fullName: undefined })); }}
              className={`min-h-11 rounded-lg border md:min-h-12 ${errors.fullName ? 'border-red-400' : 'border-line'} bg-white px-3 py-2.5 font-sans text-[13px] text-ink md:px-4 md:py-3 md:text-[14px]`}
            />
            {errors.fullName && <Copy accessibilityRole="alert" className="text-xs text-red-700">{errors.fullName}</Copy>}
          </View>

          {/* ── Profession picker ── */}
          <View className="gap-1.5">
            <Copy className="font-semibold text-[12px] md:text-[13px]">{t('registration.profession')}</Copy>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('registration.profession')}
              onPress={() => setPickerOpen(true)}
              className={`min-h-11 flex-row items-center justify-between rounded-lg border md:min-h-12 ${errors.profession ? 'border-red-400' : 'border-line'} bg-white px-3 py-2.5 md:px-4 md:py-3`}
            >
              <Text className={`font-sans text-[13px] md:text-[14px] ${profession ? 'text-ink' : 'text-[#96A19B]'}`}>
                {profession ? t(`registration.professions.${profession}`) : t('registration.professionPlaceholder')}
              </Text>
              <ChevronDown size={16} color="#96A19B" />
            </Pressable>
            {errors.profession && <Copy accessibilityRole="alert" className="text-xs text-red-700">{errors.profession}</Copy>}
          </View>

          {/* ── UAN Number ── */}
          <View className="gap-1.5">
            <Copy className="font-semibold text-[12px] md:text-[13px]">{t('registration.uanNumber')}</Copy>
            <TextInput
              accessibilityLabel={t('registration.uanNumber')}
              placeholder={t('registration.uanPlaceholder')}
              placeholderTextColor="#96A19B"
              value={uan}
              onChangeText={v => { setUan(v.replace(/\D/g, '').slice(0, 12)); setErrors(prev => ({ ...prev, uan: undefined })); }}
              keyboardType="number-pad"
              maxLength={12}
              className={`min-h-11 rounded-lg border md:min-h-12 ${errors.uan ? 'border-red-400' : 'border-line'} bg-white px-3 py-2.5 font-sans text-[13px] text-ink md:px-4 md:py-3 md:text-[14px]`}
            />
            {errors.uan && <Copy accessibilityRole="alert" className="text-xs text-red-700">{errors.uan}</Copy>}
          </View>

          {/* ── Aadhaar Number (masked) ── */}
          <View className="gap-1.5">
            <Copy className="font-semibold text-[12px] md:text-[13px]">{t('registration.aadhaarNumber')}</Copy>
            <TextInput
              accessibilityLabel={t('registration.aadhaarNumber')}
              placeholder={t('registration.aadhaarPlaceholder')}
              placeholderTextColor="#96A19B"
              value={aadhaar}
              onChangeText={v => { setAadhaar(v.replace(/\D/g, '').slice(0, 12)); setErrors(prev => ({ ...prev, aadhaar: undefined })); }}
              keyboardType="number-pad"
              maxLength={12}
              secureTextEntry
              className={`min-h-11 rounded-lg border md:min-h-12 ${errors.aadhaar ? 'border-red-400' : 'border-line'} bg-white px-3 py-2.5 font-sans text-[13px] text-ink md:px-4 md:py-3 md:text-[14px]`}
            />
            {errors.aadhaar && <Copy accessibilityRole="alert" className="text-xs text-red-700">{errors.aadhaar}</Copy>}
          </View>

          {/* ── Result notice ── */}
          {result && <Notice message={result.message} kind={result.kind === 'success' ? 'success' : 'error'} />}

          {/* ── Submit ── */}
          <Button
            label={loading ? t('registration.registering') : t('registration.register')}
            loading={loading}
            onPress={() => void onSubmit()}
            testID="register-submit"
          />
        </View>
      </ScrollView>

      {/* Profession picker modal */}
      <ProfessionPicker />
    </KeyboardAvoidingView>
  );
}
