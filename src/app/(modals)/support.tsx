import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

export default function SupportScreen() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 items-center justify-center p-4">
        <Text className="text-2xl font-bold text-gray-900 mb-8">Live Chat Support</Text>
        
        <Pressable 
          className="flex-row items-center bg-gray-100 px-6 py-3 rounded-full active:opacity-80"
          onPress={() => router.back()}
        >
          <Ionicons name="close" size={20} color="#111827" />
          <Text className="text-gray-900 font-medium ml-2">Close</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
