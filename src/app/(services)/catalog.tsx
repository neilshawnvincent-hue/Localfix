import React, { useState } from 'react';
import { View, Text, TextInput, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const CATEGORIES = [
  { id: 1, name: 'Electrician', icon: 'flash' },
  { id: 2, name: 'Plumbing', icon: 'water' },
  { id: 3, name: 'AC Repair', icon: 'snow' },
  { id: 4, name: 'Cleaning', icon: 'sparkles' },
  { id: 5, name: 'Carpentry', icon: 'hammer' },
  { id: 6, name: 'Painting', icon: 'color-palette' },
  { id: 7, name: 'Appliance Repair', icon: 'tv' },
  { id: 8, name: 'Pest Control', icon: 'bug' },
  { id: 9, name: 'Masonry', icon: 'construct' },
];

const POPULAR_SERVICES = [
  { id: 1, name: 'Switchboard Repair', price: '₹299 onwards', color: 'bg-blue-100' },
  { id: 2, name: 'Tap Leakage Fix', price: '₹149 onwards', color: 'bg-green-100' },
  { id: 3, name: 'Deep Home Cleaning', price: '₹999 onwards', color: 'bg-purple-100' },
];

export default function CatalogScreen() {
  const router = useRouter();
  const [search, setSearch] = useState('');

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Custom Header */}
      <View className="flex-row items-center px-4 py-3 border-b border-gray-100">
        <Pressable 
          onPress={() => router.back()} 
          className="p-2 -ml-2 active:opacity-50"
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </Pressable>
        <Text className="text-xl font-bold text-gray-900 ml-2">Book a Service</Text>
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Search Bar */}
        <View className="px-4 py-4">
          <View className="flex-row items-center bg-gray-100 rounded-xl px-4 py-3">
            <Ionicons name="search" size={20} color="#6B7280" />
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Search for a service..."
              placeholderTextColor="#9CA3AF"
              className="flex-1 ml-3 text-base text-gray-900"
            />
          </View>
        </View>

        {/* Categories (Grid Layout) */}
        <View className="px-4 mt-2">
          <Text className="text-lg font-bold text-gray-900 mb-4">Categories</Text>
          <View className="flex-row flex-wrap justify-between">
            {CATEGORIES.map((cat) => (
              <Pressable
                key={cat.id}
                onPress={() => router.push({ pathname: '/(customer)/booking', params: { serviceId: cat.id, serviceName: cat.name } })}
                className="w-[30%] aspect-square bg-gray-50 border border-gray-200 rounded-2xl items-center justify-center mb-4 active:opacity-70"
              >
                <Ionicons name={cat.icon as any} size={28} color="#3B82F6" />
                <Text className="text-xs font-medium text-gray-700 mt-2 text-center">{cat.name}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Popular Cooperative Services */}
        <View className="px-4 mt-6">
          <Text className="text-lg font-bold text-gray-900 mb-4">Popular in your Area</Text>
          <View className="gap-4">
            {POPULAR_SERVICES.map((service) => (
              <Pressable
                key={service.id}
                className="flex-row items-center bg-white border border-gray-100 rounded-2xl p-3 shadow-sm shadow-gray-200/50 active:opacity-80"
              >
                <View className={`w-20 h-20 rounded-xl ${service.color} items-center justify-center`}>
                  <Ionicons name="image-outline" size={24} color="#9CA3AF" />
                </View>
                
                <View className="flex-1 ml-4 justify-center">
                  <Text className="text-base font-bold text-gray-900 mb-1">{service.name}</Text>
                  
                  <View className="flex-row items-center mb-2">
                    <Ionicons name="shield-checkmark" size={14} color="#10B981" />
                    <Text className="text-xs text-emerald-600 font-medium ml-1">Verified Society Worker</Text>
                  </View>
                  
                  <Text className="text-sm font-semibold text-gray-700">{service.price}</Text>
                </View>

                <Pressable 
                  className="bg-blue-600 px-4 py-2 rounded-full active:opacity-80"
                  onPress={() => router.push({ pathname: '/(customer)/booking', params: { serviceId: service.id, serviceName: service.name } })}
                >
                  <Text className="text-white font-semibold text-sm">Book</Text>
                </Pressable>
              </Pressable>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
