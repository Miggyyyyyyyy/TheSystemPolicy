import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Href } from 'expo-router';
import { useUserStore } from '@/lib/store';
import { useTaskStore } from '@/lib/taskStore';
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

export default function TodayScreen() {
  const router = useRouter();
  const profile = useUserStore((state) => state.profile);
  const tasks = useTaskStore((state) => state.tasks);
  const penaltyActive = useTaskStore((state) => state.penaltyActive);

  const archetype = ARCHETYPES.find((a) => a.id === profile?.archetype);
  const characterImage = archetype ? CHARACTER_IMAGES[archetype.id as keyof typeof CHARACTER_IMAGES] : null;
  const accentColor = archetype ? ACCENT_COLORS[archetype.id as keyof typeof ACCENT_COLORS] : '#4A6B8A';

  // Find current task (first incomplete)
  const currentTask = tasks.find(t => !t.completed && !t.failed);
  const completedCount = tasks.filter(t => t.completed).length;

  if (!profile || !archetype) {
    return (
      <View style={styles.container}>
        <SafeAreaView style={styles.emptyState}>
          <Text style={styles.systemText}>NO PATH SELECTED</Text>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.replace('/(onboarding)' as Href)}
          >
            <Text style={styles.actionButtonText}>SELECT PATH</Text>
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
      {/* Character background (faded) */}
      {characterImage && (
        <Image
          source={characterImage}
          style={styles.characterBg}
          resizeMode="contain"
        />
      )}

      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Header: Level + Streak */}
          <View style={styles.header}>
            <View>
              <Text style={styles.levelLabel}>LEVEL</Text>
              <Text style={styles.levelValue}>{profile.level}</Text>
            </View>
            <View style={styles.streak}>
              <Text style={styles.streakValue}>{profile.streak}</Text>
              <Text style={styles.streakLabel}>DAY STREAK</Text>
            </View>
          </View>

          {/* Current Objective */}
          <View style={styles.objectiveSection}>
            <Text style={styles.sectionLabel}>CURRENT OBJECTIVE</Text>
            {currentTask ? (
              <View style={[styles.objectiveCard, { borderLeftColor: accentColor }]}>
                <Text style={styles.objectiveTime}>{currentTask.time}</Text>
                <Text style={styles.objectiveTitle}>{currentTask.title}</Text>
                <Text style={styles.objectiveIntent}>{currentTask.intent} • {currentTask.duration}min</Text>
                <TouchableOpacity
                  style={[styles.startButton, { borderColor: accentColor }]}
                  onPress={handleStartTask}
                >
                  <Text style={[styles.startButtonText, { color: accentColor }]}>
                    START TASK
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.objectiveCard}>
                <Text style={styles.completeText}>All tasks complete.</Text>
              </View>
            )}
          </View>

          {/* Penalty Warning */}
          {penaltyActive && (
            <TouchableOpacity
              style={styles.penaltyBanner}
              onPress={() => router.push('/dungeon?taskId=penalty-1' as Href)}
            >
              <Text style={styles.penaltyText}>⚠ PENALTY ACTIVE — TAP TO RESOLVE</Text>
            </TouchableOpacity>
          )}

          {/* Timeline */}
          <View style={styles.timelineSection}>
            <Text style={styles.sectionLabel}>TODAY'S TIMELINE</Text>
            <Text style={styles.progressText}>{completedCount}/{tasks.length} COMPLETE</Text>

            {tasks.map((task, i) => (
              <TouchableOpacity
                key={task.id}
                style={[
                  styles.timelineItem,
                  task.completed && styles.timelineItemCompleted,
                  task.failed && styles.timelineItemFailed,
                  task.id === currentTask?.id && styles.timelineItemActive,
                ]}
                onPress={() => !task.completed && router.push(`/dungeon?taskId=${task.id}` as Href)}
                disabled={task.completed}
              >
                <Text style={styles.timelineTime}>{task.time}</Text>
                <View style={styles.timelineContent}>
                  <Text style={[
                    styles.timelineTitle,
                    task.completed && styles.timelineTitleCompleted
                  ]}>
                    {task.title}
                  </Text>
                  <Text style={styles.timelineMeta}>{task.intent}</Text>
                </View>
                <Text style={styles.timelineStatus}>
                  {task.completed ? '✓' : task.failed ? '✗' : '○'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* System Quote */}
          <TouchableOpacity
            style={styles.quoteSection}
            onPress={() => speakQuote(archetype.id, archetype.quote)}
          >
            <Text style={styles.quoteText}>"{archetype.quote}"</Text>
            <Text style={styles.quoteAuthor}>— {archetype.name}</Text>
          </TouchableOpacity>

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
  characterBg: {
    position: 'absolute',
    top: 50,
    right: -80,
    width: 280,
    height: 400,
    opacity: 0.12,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  systemText: {
    fontFamily: 'monospace',
    color: 'rgba(255,255,255,0.4)',
    fontSize: 12,
    letterSpacing: 3,
    marginBottom: 20,
  },
  actionButton: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    padding: 16,
    paddingHorizontal: 30,
  },
  actionButtonText: {
    fontFamily: 'monospace',
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    letterSpacing: 2,
  },
  scrollView: {
    flex: 1,
    padding: 20
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 30,
  },
  levelLabel: {
    fontFamily: 'monospace',
    color: 'rgba(255,255,255,0.3)',
    fontSize: 10,
    letterSpacing: 3,
  },
  levelValue: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 32,
    fontWeight: '200',
  },
  streak: {
    alignItems: 'flex-end',
  },
  streakValue: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 24,
    fontWeight: '200',
  },
  streakLabel: {
    fontFamily: 'monospace',
    color: 'rgba(255,255,255,0.3)',
    fontSize: 9,
    letterSpacing: 2,
  },
  objectiveSection: {
    marginBottom: 24,
  },
  sectionLabel: {
    fontFamily: 'monospace',
    color: 'rgba(255,255,255,0.3)',
    fontSize: 10,
    letterSpacing: 3,
    marginBottom: 12,
  },
  objectiveCard: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderLeftWidth: 2,
    borderLeftColor: 'rgba(255,255,255,0.2)',
    padding: 16,
  },
  objectiveTime: {
    fontFamily: 'monospace',
    color: 'rgba(255,255,255,0.5)',
    fontSize: 11,
    marginBottom: 4,
  },
  objectiveTitle: {
    color: 'rgba(255,255,255,0.95)',
    fontSize: 18,
    fontWeight: '300',
    marginBottom: 6,
  },
  objectiveIntent: {
    fontFamily: 'monospace',
    color: 'rgba(255,255,255,0.4)',
    fontSize: 11,
    letterSpacing: 1,
    marginBottom: 16,
  },
  startButton: {
    borderWidth: 1,
    padding: 12,
    alignItems: 'center',
  },
  startButtonText: {
    fontFamily: 'monospace',
    fontSize: 11,
    letterSpacing: 2,
  },
  completeText: {
    fontFamily: 'monospace',
    color: 'rgba(255,255,255,0.4)',
    fontSize: 12,
  },
  penaltyBanner: {
    backgroundColor: 'rgba(139,0,0,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(139,0,0,0.4)',
    padding: 14,
    marginBottom: 24,
  },
  penaltyText: {
    fontFamily: 'monospace',
    color: '#8B0000',
    fontSize: 11,
    letterSpacing: 1,
    textAlign: 'center',
  },
  timelineSection: {
    marginBottom: 30,
  },
  progressText: {
    fontFamily: 'monospace',
    color: 'rgba(255,255,255,0.3)',
    fontSize: 10,
    letterSpacing: 2,
    marginBottom: 12,
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.02)',
    padding: 12,
    marginBottom: 4,
    borderLeftWidth: 2,
    borderLeftColor: 'transparent',
  },
  timelineItemActive: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderLeftColor: 'rgba(255,255,255,0.3)',
  },
  timelineItemCompleted: {
    opacity: 0.5,
  },
  timelineItemFailed: {
    backgroundColor: 'rgba(139,0,0,0.1)',
  },
  timelineTime: {
    fontFamily: 'monospace',
    color: 'rgba(255,255,255,0.4)',
    fontSize: 11,
    width: 50,
  },
  timelineContent: {
    flex: 1,
    marginLeft: 10,
  },
  timelineTitle: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 13,
  },
  timelineTitleCompleted: {
    textDecorationLine: 'line-through',
    color: 'rgba(255,255,255,0.4)',
  },
  timelineMeta: {
    fontFamily: 'monospace',
    color: 'rgba(255,255,255,0.3)',
    fontSize: 10,
    marginTop: 2,
  },
  timelineStatus: {
    fontFamily: 'monospace',
    color: 'rgba(255,255,255,0.4)',
    fontSize: 14,
    width: 20,
    textAlign: 'right',
  },
  quoteSection: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
    paddingTop: 20,
  },
  quoteText: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 13,
    fontStyle: 'italic',
    lineHeight: 20,
  },
  quoteAuthor: {
    fontFamily: 'monospace',
    color: 'rgba(255,255,255,0.2)',
    fontSize: 10,
    marginTop: 8,
  },
});
