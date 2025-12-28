import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Href } from 'expo-router';
import { useUserStore } from '@/lib/store';
import { useSettingsStore, CalibrationData } from '@/lib/settingsStore';
import { useTaskStore } from '@/lib/taskStore';
import { generateSchedule } from '@/lib/scheduleGenerator';
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

type TrainingAccess = 'gym' | 'home' | 'dojo';

export default function CalibrationScreen() {
    const router = useRouter();
    const profile = useUserStore((state) => state.profile);
    const setCalibration = useSettingsStore((state) => state.setCalibration);
    const setTasks = useTaskStore((state) => state.setTasks);

    const archetype = ARCHETYPES.find((a) => a.id === profile?.archetype);
    const characterImage = archetype ? CHARACTER_IMAGES[archetype.id as keyof typeof CHARACTER_IMAGES] : null;
    const accentColor = archetype ? ACCENT_COLORS[archetype.id as keyof typeof ACCENT_COLORS] : '#4A6B8A';

    const [wakeTime, setWakeTime] = useState('06:00');
    const [sleepTime, setSleepTime] = useState('22:00');
    const [workHours, setWorkHours] = useState('9-17');
    const [trainingAccess, setTrainingAccess] = useState<TrainingAccess[]>(['home']);

    const toggleAccess = (access: TrainingAccess) => {
        if (trainingAccess.includes(access)) {
            if (trainingAccess.length > 1) {
                setTrainingAccess(trainingAccess.filter((a) => a !== access));
            }
        } else {
            setTrainingAccess([...trainingAccess, access]);
        }
    };

    const handleGenerate = () => {
        if (!profile?.archetype || !archetype) return;

        const calibrationData: CalibrationData = {
            wakeTime,
            sleepTime,
            workHours,
            trainingAccess,
        };

        setCalibration(calibrationData);
        const schedule = generateSchedule(profile.archetype, calibrationData);
        setTasks(schedule);

        speakQuote(profile.archetype, 'Schedule configured. System active.');
        router.replace('/(tabs)' as Href);
    };

    if (!profile || !archetype) {
        return (
            <View style={styles.container}>
                <SafeAreaView style={styles.errorContainer}>
                    <Text style={styles.systemText}>NO PATH SELECTED</Text>
                    <TouchableOpacity onPress={() => router.replace('/(onboarding)' as Href)}>
                        <Text style={styles.linkText}>SELECT PATH</Text>
                    </TouchableOpacity>
                </SafeAreaView>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Character presence */}
            {characterImage && (
                <Image
                    source={characterImage}
                    style={styles.characterBg}
                    resizeMode="contain"
                />
            )}

            <SafeAreaView style={{ flex: 1 }}>
                <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                    <Text style={styles.backText}>← BACK</Text>
                </TouchableOpacity>

                <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                    <View style={styles.header}>
                        <Text style={styles.sectionLabel}>REALITY CALIBRATION</Text>
                        <Text style={styles.headerTitle}>CONFIGURE YOUR LIFE</Text>
                    </View>

                    {/* Wake Time */}
                    <View style={styles.inputSection}>
                        <Text style={styles.inputLabel}>WAKE TIME</Text>
                        <TextInput
                            style={[styles.textInput, { borderColor: accentColor }]}
                            value={wakeTime}
                            onChangeText={setWakeTime}
                            placeholder="06:00"
                            placeholderTextColor="rgba(255,255,255,0.2)"
                        />
                    </View>

                    {/* Sleep Time */}
                    <View style={styles.inputSection}>
                        <Text style={styles.inputLabel}>SLEEP TARGET</Text>
                        <TextInput
                            style={[styles.textInput, { borderColor: accentColor }]}
                            value={sleepTime}
                            onChangeText={setSleepTime}
                            placeholder="22:00"
                            placeholderTextColor="rgba(255,255,255,0.2)"
                        />
                    </View>

                    {/* Work Hours */}
                    <View style={styles.inputSection}>
                        <Text style={styles.inputLabel}>WORK HOURS</Text>
                        <TextInput
                            style={[styles.textInput, { borderColor: accentColor }]}
                            value={workHours}
                            onChangeText={setWorkHours}
                            placeholder="9-17"
                            placeholderTextColor="rgba(255,255,255,0.2)"
                        />
                    </View>

                    {/* Training Access */}
                    <View style={styles.inputSection}>
                        <Text style={styles.inputLabel}>TRAINING ACCESS</Text>
                        <View style={styles.accessRow}>
                            {(['gym', 'home', 'dojo'] as TrainingAccess[]).map((access) => (
                                <TouchableOpacity
                                    key={access}
                                    style={[
                                        styles.accessButton,
                                        trainingAccess.includes(access) && {
                                            borderColor: accentColor,
                                            backgroundColor: accentColor + '20',
                                        },
                                    ]}
                                    onPress={() => toggleAccess(access)}
                                >
                                    <Text style={[
                                        styles.accessText,
                                        trainingAccess.includes(access) && { color: accentColor }
                                    ]}>
                                        {access.toUpperCase()}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    {/* Generate Button */}
                    <TouchableOpacity
                        style={[styles.generateButton, { borderColor: accentColor }]}
                        onPress={handleGenerate}
                    >
                        <Text style={[styles.generateText, { color: accentColor }]}>
                            GENERATE SCHEDULE
                        </Text>
                    </TouchableOpacity>

                    <Text style={styles.disclaimer}>
                        The system will construct a routine based on your reality.
                    </Text>

                    <View style={{ height: 50 }} />
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
        top: 80,
        right: -80,
        width: 250,
        height: 350,
        opacity: 0.1,
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    systemText: {
        fontFamily: 'monospace',
        color: 'rgba(255,255,255,0.4)',
        fontSize: 12,
        letterSpacing: 3,
    },
    linkText: {
        fontFamily: 'monospace',
        color: 'rgba(255,255,255,0.6)',
        marginTop: 20,
        letterSpacing: 2,
    },
    backButton: {
        padding: 20,
    },
    backText: {
        fontFamily: 'monospace',
        color: 'rgba(255,255,255,0.4)',
        fontSize: 11,
        letterSpacing: 2,
    },
    scrollView: {
        flex: 1,
        padding: 20,
        paddingTop: 0
    },
    header: {
        marginBottom: 30
    },
    sectionLabel: {
        fontFamily: 'monospace',
        color: 'rgba(255,255,255,0.3)',
        fontSize: 10,
        letterSpacing: 3,
        marginBottom: 8,
    },
    headerTitle: {
        color: 'rgba(255,255,255,0.9)',
        fontSize: 18,
        fontWeight: '300',
        letterSpacing: 2,
    },
    inputSection: {
        marginBottom: 24,
    },
    inputLabel: {
        fontFamily: 'monospace',
        color: 'rgba(255,255,255,0.4)',
        fontSize: 10,
        letterSpacing: 2,
        marginBottom: 10,
    },
    textInput: {
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        color: 'rgba(255,255,255,0.9)',
        fontFamily: 'monospace',
        fontSize: 18,
        padding: 14,
        textAlign: 'center',
    },
    accessRow: {
        flexDirection: 'row',
        gap: 10,
    },
    accessButton: {
        flex: 1,
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        padding: 14,
        alignItems: 'center',
    },
    accessText: {
        fontFamily: 'monospace',
        color: 'rgba(255,255,255,0.4)',
        fontSize: 10,
        letterSpacing: 1,
    },
    generateButton: {
        borderWidth: 1,
        padding: 18,
        alignItems: 'center',
        marginTop: 10,
        marginBottom: 16,
    },
    generateText: {
        fontFamily: 'monospace',
        fontSize: 12,
        letterSpacing: 3,
    },
    disclaimer: {
        fontFamily: 'monospace',
        color: 'rgba(255,255,255,0.2)',
        fontSize: 10,
        textAlign: 'center',
    },
});
