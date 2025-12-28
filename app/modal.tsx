import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useUserStore } from '@/lib/store';
import { ARCHETYPES } from '@/constants/archetypes';
import { speakQuote } from '@/lib/voice';

export default function LevelUpModal() {
  const router = useRouter();
  const profile = useUserStore((state) => state.profile);
  const archetype = ARCHETYPES.find((a) => a.id === profile?.archetype);

  useEffect(() => {
    // Heavy haptic on mount
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    // Speak the level up quote
    if (archetype && profile) {
      const message = `Level ${profile.level} achieved. ${archetype.doctrine}`;
      speakQuote(archetype.id, message);
    }
  }, []);

  const handleDismiss = () => {
    router.back();
  };

  if (!profile || !archetype) {
    return null;
  }

  return (
    <View style={[styles.container, { backgroundColor: archetype.color }]}>
      <View style={styles.content}>
        {/* Badge */}
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{profile.level}</Text>
        </View>

        {/* Title */}
        <Text style={styles.label}>SYSTEM NOTIFICATION</Text>
        <Text style={styles.title}>LEVEL UP</Text>

        {/* Message */}
        <Text style={styles.message}>
          Your discipline has been recognized.{'\n'}
          You have ascended to Level {profile.level}.
        </Text>

        {/* Quote */}
        <View style={styles.quoteBox}>
          <Text style={styles.quoteText}>"{archetype.doctrine}"</Text>
        </View>

        <View style={{ flex: 1 }} />

        {/* Dismiss */}
        <TouchableOpacity style={styles.dismissButton} onPress={handleDismiss}>
          <Text style={styles.dismissText}>ACKNOWLEDGE</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    width: '100%',
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
    borderWidth: 4,
    borderColor: 'white',
  },
  badgeText: {
    color: 'white',
    fontSize: 48,
    fontWeight: '900',
  },
  label: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
    letterSpacing: 4,
    marginBottom: 8,
  },
  title: {
    color: 'white',
    fontSize: 48,
    fontWeight: '900',
    letterSpacing: 4,
    marginBottom: 24,
  },
  message: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 26,
    marginBottom: 40,
  },
  quoteBox: {
    backgroundColor: 'rgba(0,0,0,0.2)',
    padding: 20,
    width: '100%',
  },
  quoteText: {
    color: 'white',
    fontSize: 16,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  dismissButton: {
    backgroundColor: 'white',
    paddingVertical: 20,
    paddingHorizontal: 60,
  },
  dismissText: {
    color: 'black',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 2,
  },
});
