import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useUserStore } from '@/lib/store';
import { ARCHETYPES } from '@/constants/archetypes';
import { speakQuote } from '@/lib/voice';

const CHARACTER_IMAGES = {
  yujiro: require('@/assets/images/yujiro.png'),
  baki: require('@/assets/images/baki.png'),
  ohma: require('@/assets/images/ohma.png'),
  jack: require('@/assets/images/jack.png'),
};

const ACCENT_COLORS = {
  yujiro: '#8B0000',
  baki: '#4A6B8A',
  ohma: '#2D5A5A',
  jack: '#8B7355',
};

const QUOTE_DATABASE: Record<string, string[]> = {
  yujiro: [
    "Strength is the only truth.",
    "I am not bound by laws or morality.",
    "Weakness is a disease that needs eradication.",
    "Only by death is a true warrior defeated.",
  ],
  baki: [
    "I want to be slightly stronger than my father.",
    "True strength is power over oneself.",
    "Training is a way of life.",
    "The will to rise again defines strength.",
  ],
  ohma: [
    "Control your breath. Control your power.",
    "True strength comes from within.",
    "Advance. Never retreat.",
    "I spent my life training to become the strongest.",
  ],
  jack: [
    "I traded my life for strength.",
    "Pain is just a chemical reaction.",
    "There is no shortcut. Only sacrifice.",
    "I will rebuild stronger.",
  ],
};

export default function PathScreen() {
  const profile = useUserStore((state) => state.profile);
  const archetype = ARCHETYPES.find((a) => a.id === profile?.archetype);
  const characterImage = archetype ? CHARACTER_IMAGES[archetype.id as keyof typeof CHARACTER_IMAGES] : null;
  const accentColor = archetype ? ACCENT_COLORS[archetype.id as keyof typeof ACCENT_COLORS] : '#4A6B8A';
  const quotes = archetype ? QUOTE_DATABASE[archetype.id] || [] : [];

  if (!profile || !archetype) {
    return (
      <View style={styles.container}>
        <SafeAreaView style={styles.emptyState}>
          <Text style={styles.systemText}>NO PATH SELECTED</Text>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Character Header */}
          <View style={styles.header}>
            <View style={styles.characterContainer}>
              {characterImage && (
                <Image source={characterImage} style={styles.characterImage} resizeMode="contain" />
              )}
            </View>
            <Text style={[styles.epithet, { color: accentColor }]}>
              {archetype.epithet.toUpperCase()}
            </Text>
            <Text style={styles.name}>{archetype.name}</Text>
          </View>

          {/* Core Doctrine */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>DOCTRINE</Text>
            <TouchableOpacity
              style={[styles.doctrineCard, { borderLeftColor: accentColor }]}
              onPress={() => speakQuote(archetype.id, archetype.doctrine)}
            >
              <Text style={styles.doctrineText}>"{archetype.doctrine}"</Text>
              <Text style={styles.tapHint}>TAP TO HEAR</Text>
            </TouchableOpacity>
          </View>

          {/* Philosophy */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>PHILOSOPHY</Text>
            <Text style={styles.philosophyText}>{archetype.description}</Text>
          </View>

          {/* The Code */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>THE CODE</Text>
            {archetype.requirements.map((req, i) => (
              <View key={i} style={styles.codeRow}>
                <Text style={[styles.codeNumber, { color: accentColor }]}>{String(i + 1).padStart(2, '0')}</Text>
                <Text style={styles.codeText}>{req}</Text>
              </View>
            ))}
          </View>

          {/* Quotes */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>SAYINGS</Text>
            {quotes.map((quote, i) => (
              <TouchableOpacity
                key={i}
                style={styles.quoteRow}
                onPress={() => speakQuote(archetype.id, quote)}
              >
                <Text style={styles.quoteText}>"{quote}"</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={{ height: 100 }} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A'
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  systemText: {
    fontFamily: 'monospace',
    color: 'rgba(255,255,255,0.4)',
    fontSize: 12,
    letterSpacing: 3,
  },
  scrollView: {
    flex: 1,
    padding: 20
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  characterContainer: {
    width: 150,
    height: 200,
    marginBottom: 16,
  },
  characterImage: {
    width: '100%',
    height: '100%',
  },
  epithet: {
    fontFamily: 'monospace',
    fontSize: 11,
    letterSpacing: 4,
    marginBottom: 4,
  },
  name: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 24,
    fontWeight: '300',
    letterSpacing: 2,
  },
  section: {
    marginBottom: 30,
  },
  sectionLabel: {
    fontFamily: 'monospace',
    color: 'rgba(255,255,255,0.3)',
    fontSize: 10,
    letterSpacing: 3,
    marginBottom: 12,
  },
  doctrineCard: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderLeftWidth: 2,
    padding: 16,
  },
  doctrineText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 16,
    fontStyle: 'italic',
    lineHeight: 24,
  },
  tapHint: {
    fontFamily: 'monospace',
    color: 'rgba(255,255,255,0.2)',
    fontSize: 9,
    letterSpacing: 2,
    marginTop: 12,
  },
  philosophyText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 13,
    lineHeight: 22,
  },
  codeRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    paddingLeft: 4,
  },
  codeNumber: {
    fontFamily: 'monospace',
    fontSize: 11,
    width: 24,
  },
  codeText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 13,
    flex: 1,
    lineHeight: 20,
  },
  quoteRow: {
    backgroundColor: 'rgba(255,255,255,0.02)',
    padding: 14,
    marginBottom: 8,
    borderLeftWidth: 1,
    borderLeftColor: 'rgba(255,255,255,0.1)',
  },
  quoteText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 12,
    fontStyle: 'italic',
  },
});
