import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Href } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useUserStore } from '@/lib/store';
import { useTaskStore } from '@/lib/taskStore';
import { ARCHETYPES } from '@/constants/archetypes';
import { speakQuote } from '@/lib/voice';

const { width } = Dimensions.get('window');

const CHARACTER_IMAGES = {
  yujiro: require('@/assets/images/yujiro.png'),
  baki: require('@/assets/images/baki.png'),
  ohma: require('@/assets/images/ohma.png'),
  jack: require('@/assets/images/jack.png'),
};

const ACCENT_COLORS = {
  yujiro: '#E53E3E', // Brighter red for glow
  baki: '#63B3ED',   // Brighter blue
  ohma: '#38B2AC',   // Brighter teal
  jack: '#F6AD55',   // Brighter amber
};

export default function TodayScreen() {
  const router = useRouter();
  const profile = useUserStore((state) => state.profile);
  const tasks = useTaskStore((state) => state.tasks);
  const penaltyActive = useTaskStore((state) => state.penaltyActive);

  const archetype = ARCHETYPES.find((a) => a.id === profile?.archetype);
  const characterImage = archetype ? CHARACTER_IMAGES[archetype.id as keyof typeof CHARACTER_IMAGES] : null;
  const accentColor = archetype ? ACCENT_COLORS[archetype.id as keyof typeof ACCENT_COLORS] : '#4A6B8A';
  const glowColor = `${accentColor}40`; // 25% opacity

  const currentTask = tasks.find(t => !t.completed && !t.failed);
  const completedCount = tasks.filter(t => t.completed).length;

  if (!profile || !archetype) {
    return (
      <View style={styles.container}>
        <LinearGradient colors={['#000', '#1a1a1a']} style={styles.background} />
        <SafeAreaView style={styles.emptyState}>
          <Text style={styles.systemBadge}>SYSTEM OFFLINE</Text>
          <Text style={styles.systemText}>NO PATH SELECTED</Text>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.replace('/(onboarding)' as Href)}
          >
            <LinearGradient
              colors={['#4A6B8A', '#2C5282']}
              style={styles.actionButtonGradient}
            >
              <Text style={styles.actionButtonText}>INITIATE PROTOCOL</Text>
            </LinearGradient>
          </TouchableOpacity>
        </SafeAreaView>
      </View>
    );
  }

  const handleStartTask = () => {
    if (currentTask) {
      router.push(`/dungeon?taskId=${currentTask.id}` as Href);
    }
  };

  return (
    <View style={styles.container}>
      {/* Dynamic Background */}
      <LinearGradient
        colors={['#050505', '#0A0A0A', '#131313']}
        style={styles.background}
      />

      {/* Cinematic Character Art */}
      {characterImage && (
        <View style={styles.characterContainer}>
          <Image
            source={characterImage}
            style={styles.characterBg}
            resizeMode="cover"
          />
          <LinearGradient
            colors={['transparent', '#0A0A0A']}
            style={styles.characterGradient}
          />
          <LinearGradient
            colors={['transparent', '#0A0A0A']}
            locations={[0, 0.8]}
            style={styles.characterGradientBottom}
          />
        </View>
      )}

      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>

          {/* HUD Header */}
          <View style={styles.header}>
            <View style={styles.levelContainer}>
              <Text style={[styles.levelLabel, { color: accentColor }]}>LVL.{profile.level}</Text>
              <View style={[styles.xpBarBg, { borderColor: `${accentColor}30` }]}>
                <View style={[styles.xpBarFill, { width: `${(profile.stats.discipline / 20) * 100}%`, backgroundColor: accentColor }]} />
              </View>
            </View>
            <View style={styles.streakContainer}>
              <Text style={[styles.streakValue, { textShadowColor: glowColor }]}>{profile.streak}</Text>
              <Text style={styles.streakLabel}>DAY STREAK</Text>
            </View>
          </View>

          {/* Current Objective Card */}
          <View style={styles.sectionContainer}>
            <View style={styles.labelRow}>
              <View style={[styles.statusDot, { backgroundColor: currentTask ? accentColor : '#444' }]} />
              <Text style={styles.sectionLabel}>CURRENT OBJECTIVE</Text>
            </View>

            {currentTask ? (
              <LinearGradient
                colors={[`${accentColor}15`, 'rgba(255,255,255,0.02)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[styles.objectiveCard, { borderColor: `${accentColor}40` }]}
              >
                <View style={styles.objectiveHeader}>
                  <Text style={[styles.objectiveTime, { color: accentColor }]}>{currentTask.time}</Text>
                  <Text style={styles.objectiveDuration}>{currentTask.duration} MIN</Text>
                </View>

                <Text style={styles.objectiveTitle}>{currentTask.title}</Text>
                <Text style={styles.objectiveIntent}>{currentTask.intent}</Text>

                <TouchableOpacity
                  style={[styles.startButton, { shadowColor: accentColor }]}
                  onPress={handleStartTask}
                >
                  <LinearGradient
                    colors={[accentColor, `${accentColor}80`]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.startButtonGradient}
                  >
                    <Text style={styles.startButtonText}>EXECUTE</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </LinearGradient>
            ) : (
              <View style={styles.completeCard}>
                <Text style={styles.completeText}>ALL SYSTEMS NORMAL. REST.</Text>
              </View>
            )}
          </View>

          {/* Penalty Warning */}
          {penaltyActive && (
            <TouchableOpacity
              onPress={() => router.push('/dungeon?taskId=penalty-1' as Href)}
            >
              <LinearGradient
                colors={['rgba(139,0,0,0.4)', 'rgba(139,0,0,0.1)']}
                style={styles.penaltyBanner}
              >
                <Text style={styles.penaltyIcon}>⚠</Text>
                <Text style={styles.penaltyText}>PENALTY ACTIVE // IMMEDIATE ACTION REQUIRED</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}

          {/* Timeline */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionLabel}>OPERATIONAL TIMELINE</Text>

            <View style={styles.timelineList}>
              <View style={[styles.timelineLine, { backgroundColor: `${accentColor}20` }]} />

              {tasks.map((task, i) => (
                <TouchableOpacity
                  key={task.id}
                  style={[
                    styles.timelineItem,
                    task.completed && styles.timelineItemCompleted
                  ]}
                  onPress={() => !task.completed && router.push(`/dungeon?taskId=${task.id}` as Href)}
                  disabled={task.completed}
                >
                  <View style={[
                    styles.timelineDot,
                    task.completed ? { backgroundColor: accentColor } :
                      task.id === currentTask?.id ? { borderColor: accentColor, borderWidth: 2, backgroundColor: '#000' } :
                        { backgroundColor: '#222' }
                  ]} />

                  <View style={[
                    styles.timelineContent,
                    task.id === currentTask?.id && { backgroundColor: `${accentColor}10`, borderColor: `${accentColor}20`, borderWidth: 1 }
                  ]}>
                    <Text style={[styles.timelineTime, task.id === currentTask?.id && { color: accentColor }]}>{task.time}</Text>
                    <Text style={[styles.timelineTitle, task.completed && { color: '#666' }]}>{task.title}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Quote */}
          <TouchableOpacity
            style={styles.quoteCard}
            onPress={() => speakQuote(archetype.id, archetype.quote)}
          >
            <LinearGradient
              colors={['rgba(255,255,255,0.03)', 'transparent']}
              style={styles.quoteGradient}
            >
              <Text style={styles.quoteText}>"{archetype.quote}"</Text>
              <Text style={[styles.quoteAuthor, { color: accentColor }]}>{archetype.name.toUpperCase()}</Text>
            </LinearGradient>
          </TouchableOpacity>

          <View style={{ height: 120 }} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  background: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  characterContainer: {
    position: 'absolute',
    top: 0,
    width: '100%',
    height: 600,
    opacity: 0.6,
  },
  characterBg: {
    width: '100%',
    height: '100%',
  },
  characterGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  characterGradientBottom: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 300,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  systemBadge: {
    color: '#F56565',
    fontSize: 10,
    fontFamily: 'monospace',
    letterSpacing: 2,
    marginBottom: 10,
    backgroundColor: 'rgba(245, 101, 101, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  systemText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: 2,
    marginBottom: 30,
  },
  actionButton: {
    borderRadius: 2,
    overflow: 'hidden',
  },
  actionButtonGradient: {
    paddingVertical: 16,
    paddingHorizontal: 40,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  scrollView: {
    flex: 1,
    padding: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 40,
    marginTop: 10,
  },
  levelContainer: {
    flex: 1,
  },
  levelLabel: {
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 1,
    marginBottom: 6,
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  xpBarBg: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.1)',
    width: 100,
    borderRadius: 2,
    borderWidth: 0.5,
  },
  xpBarFill: {
    height: '100%',
    borderRadius: 2,
  },
  streakContainer: {
    alignItems: 'flex-end',
  },
  streakValue: {
    color: '#fff',
    fontSize: 48,
    fontWeight: '900',
    lineHeight: 48,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  streakLabel: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  sectionContainer: {
    marginBottom: 40,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  sectionLabel: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  objectiveCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 24,
    backdropFilter: 'blur(10px)',
  },
  objectiveHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  objectiveTime: {
    fontSize: 14,
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
  objectiveDuration: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 12,
    fontWeight: 'bold',
  },
  objectiveTitle: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  objectiveIntent: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 14,
    letterSpacing: 1,
    marginBottom: 24,
    fontFamily: 'monospace',
  },
  startButton: {
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8,
  },
  startButtonGradient: {
    paddingVertical: 18,
    alignItems: 'center',
    borderRadius: 8,
  },
  startButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 4,
  },
  completeCard: {
    padding: 30,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  completeText: {
    color: 'rgba(255,255,255,0.3)',
    fontSize: 12,
    letterSpacing: 2,
    fontWeight: 'bold',
  },
  penaltyBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: '#E53E3E',
    borderRadius: 8,
    gap: 12,
  },
  penaltyIcon: {
    color: '#E53E3E',
    fontSize: 18,
  },
  penaltyText: {
    color: '#E53E3E',
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  timelineList: {
    position: 'relative',
    paddingLeft: 12,
  },
  timelineLine: {
    position: 'absolute',
    left: 15,
    top: 0,
    bottom: 0,
    width: 2,
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
    paddingVertical: 4,
  },
  timelineItemCompleted: {
    opacity: 0.4,
  },
  timelineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: 6,
    marginRight: 20,
    zIndex: 10,
  },
  timelineContent: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.02)',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  timelineTime: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 12,
    fontFamily: 'monospace',
    marginBottom: 4,
  },
  timelineTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  quoteCard: {
    marginTop: 20,
    borderTopWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  quoteGradient: {
    padding: 24,
  },
  quoteText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '300',
    fontStyle: 'italic',
    lineHeight: 28,
    marginBottom: 12,
  },
  quoteAuthor: {
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 2,
    textAlign: 'right',
  },
});
