import React from 'react';
import { Tabs } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useUserStore } from '@/lib/store';
import { ARCHETYPES } from '@/constants/archetypes';

const ACCENT_COLORS: Record<string, string> = {
  yujiro: '#8B0000',
  baki: '#4A6B8A',
  ohma: '#2D5A5A',
  jack: '#8B7355',
};

export default function TabLayout() {
  const profile = useUserStore((state) => state.profile);
  const archetype = ARCHETYPES.find((a) => a.id === profile?.archetype);
  const accentColor = archetype ? ACCENT_COLORS[archetype.id] : '#4A6B8A';

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: accentColor,
        tabBarInactiveTintColor: 'rgba(255,255,255,0.3)',
        tabBarStyle: {
          backgroundColor: '#050505',
          borderTopWidth: 1,
          borderTopColor: 'rgba(255,255,255,0.05)',
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontFamily: 'monospace',
          fontSize: 9,
          letterSpacing: 1,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'TODAY',
          tabBarIcon: ({ color }) => (
            <FontAwesome name="crosshairs" size={18} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="two"
        options={{
          title: 'PATH',
          tabBarIcon: ({ color }) => (
            <FontAwesome name="user" size={18} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'PROGRESS',
          tabBarIcon: ({ color }) => (
            <FontAwesome name="line-chart" size={18} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'SETTINGS',
          tabBarIcon: ({ color }) => (
            <FontAwesome name="cog" size={18} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
