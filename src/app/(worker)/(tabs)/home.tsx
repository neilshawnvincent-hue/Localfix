import { useEffect, useState } from 'react';
import { View, Text, Pressable, Switch, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useJobStore } from '@/store/jobStore';
import { MOCK_WORKER, MOCK_WORKER_EARNINGS } from '@/constants/mockData';
import { useTranslation } from 'react-i18next';

export default function WorkerHomeScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { isOnline, toggleOnline, hasIncomingJob, triggerJobAlert, acceptJob } = useJobStore();
  const [acceptingId, setAcceptingId] = useState<string | null>(null);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (isOnline && !hasIncomingJob) {
      timeout = setTimeout(() => {
        triggerJobAlert();
      }, 4000);
    }
    return () => clearTimeout(timeout);
  }, [isOnline, hasIncomingJob]);

  const handleAccept = async () => {
    setAcceptingId('mock-job');
    try {
      await new Promise(resolve => setTimeout(resolve, 800)); // Mock network delay
      acceptJob();
      router.push('/(worker)/execution');
    } catch (err: any) {
      Alert.alert('Could not accept job', err?.message || 'Please try again.');
    } finally {
      setAcceptingId(null);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
        {/* Header */}
        <View className="flex-row justify-between items-center px-5 py-4">
          <View>
            <Text className="text-gray-500 text-sm">{t('welcome_back')}</Text>
            <Text className="text-gray-900 text-xl font-bold">{MOCK_WORKER.name}</Text>
          </View>
          <View className="flex-row items-center">
            <View className={`w-2.5 h-2.5 rounded-full mr-1.5 ${isOnline ? 'bg-green-500' : 'bg-gray-400'}`} />
            <Text className={`font-bold ${isOnline ? 'text-green-500' : 'text-gray-400'}`}>
              {isOnline ? t('online') : t('offline')}
            </Text>
          </View>
        </View>

        {/* Online toggle */}
        <View className="px-5 mb-4">
          <View
            className={`rounded-2xl p-5 border ${
              isOnline ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'
            }`}
          >
            <View className="flex-row items-center">
              <View
                className={`w-14 h-14 rounded-2xl items-center justify-center mr-4 ${
                  isOnline ? 'bg-green-600' : 'bg-gray-100'
                }`}
              >
                <Ionicons
                  name={isOnline ? 'radio' : 'radio-outline'}
                  size={28}
                  color={isOnline ? 'white' : '#64748B'}
                />
              </View>
              <View className="flex-1">
                <Text className="text-gray-900 font-bold text-lg">
                  {isOnline ? t('you_are_online') : t('go_online')}
                </Text>
                <Text className="text-gray-500 text-sm">
                  {isOnline ? t('accepting_jobs') : t('start_accepting')}
                </Text>
              </View>
              <Switch
                value={isOnline}
                onValueChange={toggleOnline}
                trackColor={{ false: '#E5E7EB', true: '#16A34A' }}
                thumbColor="white"
              />
            </View>
          </View>
        </View>

        {/* Today's summary */}
        <View className="px-5 mb-6">
          <Text className="text-gray-900 font-bold text-base mb-3">{t('todays_summary')}</Text>
          <View className="flex-row gap-3">
            <View className="flex-1 bg-white border border-gray-200 rounded-2xl p-4 items-center">
              <Text className="text-gray-900 text-2xl font-black">₹{MOCK_WORKER_EARNINGS.today}</Text>
              <Text className="text-gray-500 text-xs mt-1">{t('earned')}</Text>
            </View>
            <View className="flex-1 bg-white border border-gray-200 rounded-2xl p-4 items-center">
              <Text className="text-gray-900 text-2xl font-black">{MOCK_WORKER_EARNINGS.todayJobs}</Text>
              <Text className="text-gray-500 text-xs mt-1">{t('jobs_done')}</Text>
            </View>
            <View className="flex-1 bg-white border border-gray-200 rounded-2xl p-4 items-center">
              <Text className="text-amber-400 text-2xl font-black">★ {MOCK_WORKER.rating}</Text>
              <Text className="text-gray-500 text-xs mt-1">{t('rating')}</Text>
            </View>
          </View>
        </View>

        {/* Available jobs */}
        <View className="px-5">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-gray-900 font-bold text-base">{t('incoming_requests')}</Text>
          </View>

          {!hasIncomingJob ? (
            <View className="py-12 items-center">
              <Ionicons name="briefcase-outline" size={40} color="#9CA3AF" />
              <Text className="text-gray-500 mt-3">{isOnline ? t('waiting_jobs') : t('go_online_receive')}</Text>
            </View>
          ) : (
              <View className="bg-white rounded-xl p-4 border-2 border-blue-500 mb-3 shadow-sm shadow-blue-200">
                <View className="flex-row items-center">
                  <View className="w-12 h-12 rounded-full bg-blue-100 items-center justify-center mr-3">
                    <Ionicons name="warning" size={24} color="#2563EB" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-gray-900 font-bold text-lg">{t('Electrician')}</Text>
                    <Text className="text-gray-500 text-sm mt-0.5">2.4 km away • ₹350 est.</Text>
                  </View>
                </View>

                <Pressable
                  onPress={handleAccept}
                  disabled={acceptingId !== null}
                  className={`mt-4 rounded-xl py-3.5 items-center justify-center active:opacity-80 ${
                    acceptingId !== null ? 'bg-green-400' : 'bg-green-600'
                  }`}
                  accessibilityRole="button"
                >
                  {acceptingId !== null ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text className="text-white font-bold text-base">{t('accept_job_now')}</Text>
                  )}
                </Pressable>
              </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
