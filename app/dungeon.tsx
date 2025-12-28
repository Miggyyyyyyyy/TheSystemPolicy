import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams, Href } from 'expo-router';
import { useUserStore } from '@/lib/store';
import { useTaskStore, Task } from '@/lib/taskStore';
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

export default function DungeonScreen() {
    const router = useRouter();
    const { taskId } = useLocalSearchParams<{ taskId: string }>();
    const profile = useUserStore((state) => state.profile);
    const addXP = useUserStore((state) => state.addXP);
    const tasks = useTaskStore((state) => state.tasks);
    const penaltyTask = useTaskStore((state) => state.penaltyTask);
    const completeTask = useTaskStore((state) => state.completeTask);
    const failTask = useTaskStore((state) => state.failTask);
    const clearPenalty = useTaskStore((state) => state.clearPenalty);

    const task: Task | null | undefined = taskId === 'penalty-1'
        ? penaltyTask
        : tasks.find((t) => t.id === taskId);

    const archetype = ARCHETYPES.find((a) => a.id === profile?.archetype);
    const characterImage = archetype ? CHARACTER_IMAGES[archetype.id as keyof typeof CHARACTER_IMAGES] : null;
    const accentColor = archetype ? ACCENT_COLORS[archetype.id as keyof typeof ACCENT_COLORS] : '#4A6B8A';

    const [timeRemaining, setTimeRemaining] = useState(task?.duration ? task.duration * 60 : 60);
    const [isActive, setIsActive] = useState(false);
    const [isCompleted, setIsCompleted] = useState(false);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    useEffect(() => {
        if (isActive && timeRemaining > 0) {
            intervalRef.current = setInterval(() => {
                setTimeRemaining((prev) => prev - 1);
            }, 1000);
        } else if (timeRemaining === 0 && isActive) {
            handleComplete();
        }
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [isActive, timeRemaining]);

    const handleStart = () => {
        setIsActive(true);
        if (archetype) {
            speakQuote(archetype.id, 'Begin.');
        }
    };

    const handleComplete = () => {
        setIsActive(false);
        setIsCompleted(true);
        if (task) {
            addXP(task.xp);
            if (taskId === 'penalty-1') {
                clearPenalty();
            } else {
                completeTask(task.id);
            }
        }
        if (archetype) {
            speakQuote(archetype.id, 'Task complete.');
        }
    };

    const handleAbandon = () => {
        if (task && taskId !== 'penalty-1') {
            failTask(task.id);
        }
        if (archetype) {
            speakQuote(archetype.id, 'Compliance failure detected.');
        }
        router.back();
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    if (!task || !archetype) {
        return (
            <View style={styles.container}>
                <SafeAreaView style={styles.errorContainer}>
                    <Text style={styles.systemText}>TASK NOT FOUND</Text>
                    <TouchableOpacity style={styles.returnButton} onPress={() => router.back()}>
                        <Text style={styles.returnText}>← RETURN</Text>
                    </TouchableOpacity>
                </SafeAreaView>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Minimal character presence */}
            {characterImage && (
                <Image
                    source={characterImage}
                    style={styles.characterBg}
                    resizeMode="contain"
                />
            )}

            <SafeAreaView style={styles.content}>
                {/* Exit button */}
                <TouchableOpacity style={styles.exitButton} onPress={() => router.back()}>
                    <Text style={styles.exitText}>← EXIT</Text>
                </TouchableOpacity>

                {/* Minimal focus mode */}
                <View style={styles.focusArea}>
                    {/* Timer */}
                    <Text style={styles.timer}>{formatTime(timeRemaining)}</Text>

                    {/* Status */}
                    <Text style={[styles.status, { color: accentColor }]}>
                        {isCompleted ? 'COMPLETE' : isActive ? 'IN PROGRESS' : 'READY'}
                    </Text>

                    {/* Task title (minimal) */}
                    <Text style={styles.taskTitle}>{task.title}</Text>
                </View>

                {/* System message */}
                <View style={styles.messageArea}>
                    <Text style={styles.systemMessage}>
                        {isCompleted
                            ? 'Progress recorded.'
                            : isActive
                                ? 'Focus.'
                                : 'Begin when ready.'}
                    </Text>
                </View>

                {/* Actions */}
                <View style={styles.actions}>
                    {isCompleted ? (
                        <TouchableOpacity
                            style={[styles.primaryButton, { borderColor: accentColor }]}
                            onPress={() => router.back()}
                        >
                            <Text style={[styles.primaryButtonText, { color: accentColor }]}>
                                RETURN
                            </Text>
                        </TouchableOpacity>
                    ) : isActive ? (
                        <TouchableOpacity
                            style={[styles.primaryButton, { borderColor: accentColor }]}
                            onPress={handleComplete}
                        >
                            <Text style={[styles.primaryButtonText, { color: accentColor }]}>
                                MARK COMPLETE
                            </Text>
                        </TouchableOpacity>
                    ) : (
                        <TouchableOpacity
                            style={[styles.primaryButton, { borderColor: accentColor }]}
                            onPress={handleStart}
                        >
                            <Text style={[styles.primaryButtonText, { color: accentColor }]}>
                                BEGIN
                            </Text>
                        </TouchableOpacity>
                    )}

                    {!isCompleted && (
                        <TouchableOpacity style={styles.abandonButton} onPress={handleAbandon}>
                            <Text style={styles.abandonText}>ABANDON</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#050505'
    },
    characterBg: {
        position: 'absolute',
        bottom: 0,
        right: -50,
        width: 250,
        height: 350,
        opacity: 0.08,
    },
    errorContainer: {
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
    returnButton: {
        marginTop: 20,
        padding: 16,
    },
    returnText: {
        fontFamily: 'monospace',
        color: 'rgba(255,255,255,0.5)',
        fontSize: 12,
    },
    content: {
        flex: 1,
        padding: 20,
        justifyContent: 'space-between',
    },
    exitButton: {
        alignSelf: 'flex-start',
        padding: 10,
    },
    exitText: {
        fontFamily: 'monospace',
        color: 'rgba(255,255,255,0.4)',
        fontSize: 11,
        letterSpacing: 2,
    },
    focusArea: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    timer: {
        color: 'rgba(255,255,255,0.9)',
        fontSize: 72,
        fontWeight: '100',
        letterSpacing: 4,
    },
    status: {
        fontFamily: 'monospace',
        fontSize: 11,
        letterSpacing: 4,
        marginTop: 16,
    },
    taskTitle: {
        color: 'rgba(255,255,255,0.4)',
        fontSize: 14,
        marginTop: 30,
        textAlign: 'center',
    },
    messageArea: {
        alignItems: 'center',
        paddingVertical: 30,
    },
    systemMessage: {
        fontFamily: 'monospace',
        color: 'rgba(255,255,255,0.3)',
        fontSize: 12,
        letterSpacing: 2,
    },
    actions: {
        paddingBottom: 20,
    },
    primaryButton: {
        borderWidth: 1,
        padding: 18,
        alignItems: 'center',
        marginBottom: 12,
    },
    primaryButtonText: {
        fontFamily: 'monospace',
        fontSize: 13,
        letterSpacing: 3,
    },
    abandonButton: {
        padding: 14,
        alignItems: 'center',
    },
    abandonText: {
        fontFamily: 'monospace',
        color: 'rgba(139,0,0,0.6)',
        fontSize: 11,
        letterSpacing: 2,
    },
});
