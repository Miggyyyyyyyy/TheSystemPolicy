import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
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
    yujiro: '#E53E3E',
    baki: '#63B3ED',
    ohma: '#38B2AC',
    jack: '#F6AD55',
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

    // Timer Logic
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
            speakQuote(archetype.id, 'Failure.');
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
                <LinearGradient colors={['#000', '#111']} style={styles.background} />
                <SafeAreaView style={styles.errorContainer}>
                    <Text style={styles.systemText}>INVALID PARAMETERS</Text>
                    <TouchableOpacity style={styles.returnButton} onPress={() => router.back()}>
                        <Text style={styles.returnText}>RETURN</Text>
                    </TouchableOpacity>
                </SafeAreaView>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Background */}
            <LinearGradient colors={['#050505', '#1a1a1a']} style={styles.background} />

            {/* Character Overlay */}
            {characterImage && (
                <View style={styles.characterContainer}>
                    <Image
                        source={characterImage}
                        style={styles.characterBg}
                        resizeMode="cover"
                    />
                    <LinearGradient
                        colors={['rgba(0,0,0,0.4)', '#000']}
                        style={styles.characterGradient}
                    />
                </View>
            )}

            <SafeAreaView style={styles.content}>
                {/* Header */}
                <TouchableOpacity style={styles.exitButton} onPress={() => router.back()}>
                    <Text style={styles.exitText}>ABORT MISSION</Text>
                </TouchableOpacity>

                {/* Main Focus Area */}
                <View style={styles.focusArea}>
                    <View style={styles.timerContainer}>
                        <LinearGradient
                            colors={[isActive ? `${accentColor}20` : 'transparent', 'transparent']}
                            style={styles.timerGlow}
                        />
                        <Text style={[styles.timer, { textShadowColor: isActive ? accentColor : 'transparent' }]}>
                            {formatTime(timeRemaining)}
                        </Text>
                    </View>

                    <Text style={[styles.status, { color: accentColor }]}>
                        {isCompleted ? 'MISSION COMPLETE' : isActive ? 'SYSTEM ENGAGED' : 'AWAITING INPUT'}
                    </Text>

                    <Text style={styles.taskTitle}>{task.title}</Text>

                    <View style={styles.xpBadge}>
                        <Text style={[styles.xpText, { color: accentColor }]}>+{task.xp} XP</Text>
                    </View>
                </View>

                {/* Actions */}
                <View style={styles.actions}>
                    {isCompleted ? (
                        <TouchableOpacity
                            style={[styles.actionButton, { shadowColor: accentColor }]}
                            onPress={() => router.back()}
                        >
                            <LinearGradient
                                colors={[accentColor, `${accentColor}80`]}
                                style={styles.actionGradient}
                            >
                                <Text style={styles.actionText}>CONFIRM</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    ) : isActive ? (
                        <TouchableOpacity
                            style={[styles.actionButton, { shadowColor: accentColor }]}
                            onPress={handleComplete}
                        >
                            <LinearGradient
                                colors={[accentColor, `${accentColor}80`]}
                                style={styles.actionGradient}
                            >
                                <Text style={styles.actionText}>COMPLETE</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    ) : (
                        <TouchableOpacity
                            style={[styles.actionButton, { shadowColor: accentColor }]}
                            onPress={handleStart}
                        >
                            <LinearGradient
                                colors={[accentColor, `${accentColor}80`]}
                                style={styles.actionGradient}
                            >
                                <Text style={styles.actionText}>ENGAGE</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    )}

                    {!isCompleted && !isActive && (
                        <TouchableOpacity style={styles.secondaryButton} onPress={() => router.back()}>
                            <Text style={styles.secondaryText}>CANCEL</Text>
                        </TouchableOpacity>
                    )}

                    {isActive && (
                        <TouchableOpacity style={styles.secondaryButton} onPress={handleAbandon}>
                            <Text style={[styles.secondaryText, { color: '#E53E3E' }]}>GIVE UP</Text>
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
        height: '70%',
        opacity: 0.3,
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
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    systemText: {
        color: '#fff',
        fontSize: 16,
        fontFamily: 'monospace',
        letterSpacing: 4,
    },
    returnButton: {
        marginTop: 20,
        padding: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    returnText: {
        color: '#fff',
        fontSize: 12,
        fontFamily: 'monospace',
    },
    content: {
        flex: 1,
        padding: 24,
        justifyContent: 'space-between',
    },
    exitButton: {
        alignSelf: 'flex-start',
        padding: 12,
    },
    exitText: {
        color: 'rgba(255,255,255,0.4)',
        fontSize: 11,
        fontFamily: 'monospace',
        letterSpacing: 2,
    },
    focusArea: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    timerContainer: {
        position: 'relative',
        marginBottom: 20,
    },
    timerGlow: {
        position: 'absolute',
        left: -50,
        right: -50,
        top: -50,
        bottom: -50,
        borderRadius: 100,
        opacity: 0.5,
    },
    timer: {
        color: '#fff',
        fontSize: 80,
        fontWeight: '900',
        letterSpacing: 4,
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 20,
    },
    status: {
        fontSize: 14,
        fontWeight: 'bold',
        letterSpacing: 4,
        marginBottom: 40,
    },
    taskTitle: {
        color: '#fff',
        fontSize: 24,
        fontWeight: '300',
        textAlign: 'center',
        letterSpacing: 1,
        marginBottom: 20,
    },
    xpBadge: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
    },
    xpText: {
        fontSize: 14,
        fontWeight: 'bold',
        letterSpacing: 1,
    },
    actions: {
        gap: 16,
    },
    actionButton: {
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.5,
        shadowRadius: 10,
        elevation: 10,
    },
    actionGradient: {
        paddingVertical: 20,
        borderRadius: 4,
        alignItems: 'center',
    },
    actionText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '900',
        letterSpacing: 4,
    },
    secondaryButton: {
        alignItems: 'center',
        padding: 16,
    },
    secondaryText: {
        color: 'rgba(255,255,255,0.5)',
        fontSize: 12,
        fontFamily: 'monospace',
        letterSpacing: 2,
    },
});
