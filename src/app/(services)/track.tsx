import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useJobStore } from '@/store/jobStore';

type TimelineStep = {
  title: string;
  subtitle?: string;
  state: 'done' | 'active' | 'pending';
};

// Derive the 4-step timeline from the booking status.
// 'pending'  -> step 1 active (awaiting a worker)
// 'accepted' -> steps 1-2 done, step 3 active (worker on the way)
function buildTimeline(status?: string): TimelineStep[] {
  const isAccepted = status === 'assigned' || status === 'en_route' || status === 'arrived' || status === 'in_progress' || status === 'completed';
  const isStarted = status === 'in_progress' || status === 'completed';

  return [
    {
      title: 'Booking Confirmed',
      state: 'done',
    },
    {
      title: 'Worker Assigned',
      subtitle: isAccepted ? undefined : 'Finding a nearby worker...',
      state: isAccepted ? 'done' : 'active',
    },
    {
      title: 'Worker En Route',
      subtitle: isAccepted && !isStarted ? 'Arriving in approx. 15 mins' : undefined,
      state: isStarted ? 'done' : isAccepted ? 'active' : 'pending',
    },
    {
      title: 'Job Started',
      state: isStarted ? 'active' : 'pending',
    },
  ];
}

function TimelineRow({ step, isLast }: { step: TimelineStep; isLast: boolean }) {
  const isDone = step.state === 'done';
  const isActive = step.state === 'active';

  const circleClass = isDone
    ? 'bg-green-500'
    : isActive
    ? 'bg-blue-500'
    : 'bg-gray-200';

  const titleClass = isActive
    ? 'text-gray-900 font-bold'
    : isDone
    ? 'text-gray-500 font-medium'
    : 'text-gray-400 font-medium';

  return (
    <View className="flex-row">
      {/* Left rail: circle + connecting line */}
      <View className="items-center mr-4">
        <View className={`w-6 h-6 rounded-full items-center justify-center ${circleClass}`}>
          {isDone ? (
            <Ionicons name="checkmark" size={14} color="#FFFFFF" />
          ) : isActive ? (
            <View className="w-2 h-2 rounded-full bg-white" />
          ) : null}
        </View>
        {!isLast ? (
          <View className={`w-0.5 flex-1 my-1 ${isDone ? 'bg-green-500' : 'bg-gray-200'}`} />
        ) : null}
      </View>

      {/* Right content */}
      <View className={isLast ? 'pb-0' : 'pb-6'}>
        <Text className={`text-base ${titleClass}`}>{step.title}</Text>
        {step.subtitle ? (
          <Text className="text-sm text-blue-500 mt-1 font-medium">{step.subtitle}</Text>
        ) : null}
      </View>
    </View>
  );
}

export default function TrackScreen() {
  const router = useRouter();
  const { activeJob } = useJobStore();

  const timeline = buildTimeline(activeJob?.status || 'searching');
  const serviceName = activeJob?.serviceName ?? 'Service';
  const bookingId = activeJob?.id ?? 'LF-000000';
  // Render the OTP as spaced digits, e.g. "4 8 1 2".
  const otpDigits = (activeJob?.arrivalOtp ?? '1234').split('').join(' ');

  const body = (
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
        <View className="px-4 py-4">
          <Text className="text-sm text-gray-500">Booking ID</Text>
          <Text className="text-base font-semibold text-gray-900 mt-0.5">{bookingId}</Text>
          <Text className="text-sm text-gray-500 mt-2">Service</Text>
          <Text className="text-base font-semibold text-gray-900 mt-0.5">{serviceName}</Text>
        </View>

        {/* Trust & Safety worker card */}
        <View className="bg-white rounded-2xl p-5 mx-4 mt-4 border border-gray-100">
          <View className="flex-row items-center">
            {/* Avatar placeholder */}
            <View className="w-14 h-14 rounded-full bg-gray-100 items-center justify-center mr-4">
              <Ionicons name="person" size={28} color="#6B7280" />
            </View>

            <View className="flex-1">
              <Text className="text-lg font-bold text-gray-900">Ramesh Kumar</Text>

              {/* Verified badge */}
              <View className="flex-row items-center mt-1">
                <Ionicons name="checkmark-circle" size={16} color="#16A34A" />
                <Text className="text-sm text-green-600 font-medium ml-1">
                  Verified Society Worker
                </Text>
              </View>

              {/* Rating */}
              <View className="flex-row items-center mt-1">
                <Ionicons name="star" size={14} color="#FBBF24" />
                <Text className="text-sm text-gray-700 font-medium ml-1">4.8</Text>
              </View>
            </View>
          </View>

          {/* Action row */}
          <View className="flex-row mt-5">
            <Pressable
              className="flex-1 flex-row items-center justify-center bg-gray-100 rounded-xl py-3 mr-2 active:opacity-80"
              accessibilityRole="button"
              accessibilityLabel="Call worker"
            >
              <Ionicons name="call" size={18} color="#111827" />
              <Text className="text-gray-900 font-semibold ml-2">Call</Text>
            </Pressable>

            <Pressable
              className="flex-1 flex-row items-center justify-center bg-green-500 rounded-xl py-3 ml-2 active:opacity-80"
              accessibilityRole="button"
              accessibilityLabel="Message worker on WhatsApp"
            >
              <Ionicons name="chatbubble-ellipses" size={18} color="#FFFFFF" />
              <Text className="text-white font-semibold ml-2">WhatsApp</Text>
            </Pressable>
          </View>
        </View>

        {/* Status timeline */}
        <View className="bg-white rounded-2xl p-5 mx-4 mt-4 border border-gray-100">
          <Text className="text-base font-bold text-gray-900 mb-4">Status</Text>
          {timeline.map((step, index) => (
            <TimelineRow
              key={step.title}
              step={step}
              isLast={index === timeline.length - 1}
            />
          ))}
        </View>

        {/* Secure Start OTP */}
        <View className="bg-blue-50 border border-blue-200 rounded-2xl p-5 mx-4 mt-6 mb-10">
          <View className="flex-row items-center">
            <Ionicons name="lock-closed" size={18} color="#2563EB" />
            <Text className="text-base font-bold text-blue-700 ml-2">Secure Start Code</Text>
          </View>

          <Text className="text-4xl font-extrabold text-blue-700 tracking-[8px] mt-4 text-center">
            {otpDigits || '— — — —'}
          </Text>

          <Text className="text-sm text-blue-600 mt-4 text-center leading-5">
            Share this OTP with the worker when they arrive to unlock the escrow payment and start the job.
          </Text>
        </View>
      </ScrollView>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
      {/* Header */}
      <View className="bg-white border-b border-gray-100 px-4 py-4 flex-row items-center">
        <Pressable
          onPress={() => router.back()}
          hitSlop={8}
          className="mr-3 active:opacity-60"
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </Pressable>
        <Text className="text-xl font-bold text-gray-900">Track Service</Text>
      </View>
      {body}
    </SafeAreaView>
  );
}
