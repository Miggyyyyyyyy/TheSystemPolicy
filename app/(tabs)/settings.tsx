import React from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Href } from 'expo-router';
import { useUserStore } from '@/lib/store';
import { useSettingsStore } from '@/lib/settingsStore';
import { useTaskStore } from '@/lib/taskStore';
import { ARCHETYPES } from '@/constants/archetypes';

const ACCENT_COLORS = {
    yujiro: '#8B0000',
    baki: '#4A6B8A',
    ohma: '#2D5A5A',
    jack: '#8B7355',
};

export default function SettingsScreen() {
    const router = useRouter();
    const profile = useUserStore((state) => state.profile);
    const logout = useUserStore((state) => state.logout);
    const settings = useSettingsStore((state) => state.settings);
    const updateSettings = useSettingsStore((state) => state.updateSettings);
    const calibration = useSettingsStore((state) => state.calibration);
    const resetAllSettings = useSettingsStore((state) => state.resetAll);
    const resetTasks = useTaskStore((state) => state.setTasks);

    const archetype = ARCHETYPES.find((a) => a.id === profile?.archetype);
    const accentColor = archetype ? ACCENT_COLORS[archetype.id as keyof typeof ACCENT_COLORS] : '#4A6B8A';

    const toggleSetting = (key: keyof typeof settings) => {
        updateSettings({ [key]: !settings[key] });
    };

    const handleChangePath = () => {
        Alert.alert(
            'Change Path',
            'This will reset your progress and let you choose a new character. Are you sure?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Change Path',
                    style: 'destructive',
                    onPress: () => {
                        logout();
                        resetAllSettings();
                        resetTasks([]);
                        router.replace('/(onboarding)' as Href);
                    },
                },
            ]
        );
    };

    const handleRecalibrate = () => {
        router.push('/calibration' as Href);
    };

    return (
        <View style={styles.container}>
            <SafeAreaView style={{ flex: 1 }}>
                <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={styles.sectionLabel}>SETTINGS</Text>
                    </View>

                    {/* Current Path */}
                    {archetype && (
                        <View style={styles.section}>
                            <Text style={styles.sectionLabel}>CURRENT PATH</Text>
                            <View style={[styles.pathCard, { borderLeftColor: accentColor }]}>
                                <Text style={[styles.pathName, { color: accentColor }]}>{archetype.name}</Text>
                                <Text style={styles.pathEpithet}>{archetype.epithet}</Text>
                            </View>
                        </View>
                    )}

                    {/* Schedule Configuration */}
                    <View style={styles.section}>
                        <Text style={styles.sectionLabel}>SCHEDULE</Text>
                        {calibration ? (
                            <>
                                <View style={styles.configRow}>
                                    <Text style={styles.configLabel}>WAKE TIME</Text>
                                    <Text style={[styles.configValue, { color: accentColor }]}>{calibration.wakeTime}</Text>
                                </View>
                                <View style={styles.configRow}>
                                    <Text style={styles.configLabel}>SLEEP TARGET</Text>
                                    <Text style={[styles.configValue, { color: accentColor }]}>{calibration.sleepTime}</Text>
                                </View>
                                <View style={styles.configRow}>
                                    <Text style={styles.configLabel}>WORK HOURS</Text>
                                    <Text style={[styles.configValue, { color: accentColor }]}>{calibration.workHours}</Text>
                                </View>
                                <View style={styles.configRow}>
                                    <Text style={styles.configLabel}>TRAINING ACCESS</Text>
                                    <Text style={[styles.configValue, { color: accentColor }]}>
                                        {calibration.trainingAccess.join(' / ').toUpperCase()}
                                    </Text>
                                </View>
                                <TouchableOpacity style={styles.recalibrateButton} onPress={handleRecalibrate}>
                                    <Text style={styles.recalibrateText}>RECALIBRATE</Text>
                                </TouchableOpacity>
                            </>
                        ) : (
                            <TouchableOpacity style={styles.recalibrateButton} onPress={handleRecalibrate}>
                                <Text style={styles.recalibrateText}>SET UP SCHEDULE</Text>
                            </TouchableOpacity>
                        )}
                    </View>

                    {/* Audio */}
                    <View style={styles.section}>
                        <Text style={styles.sectionLabel}>AUDIO</Text>
                        <View style={styles.settingRow}>
                            <View>
                                <Text style={styles.settingLabel}>VOICE FEEDBACK</Text>
                                <Text style={styles.settingDesc}>Character voice narration</Text>
                            </View>
                            <Switch
                                value={settings.voiceEnabled}
                                onValueChange={() => toggleSetting('voiceEnabled')}
                                trackColor={{ false: 'rgba(255,255,255,0.1)', true: accentColor }}
                                thumbColor="white"
                            />
                        </View>
                        <View style={styles.settingRow}>
                            <View>
                                <Text style={styles.settingLabel}>SOUND EFFECTS</Text>
                                <Text style={styles.settingDesc}>Task completion sounds</Text>
                            </View>
                            <Switch
                                value={settings.soundEffects}
                                onValueChange={() => toggleSetting('soundEffects')}
                                trackColor={{ false: 'rgba(255,255,255,0.1)', true: accentColor }}
                                thumbColor="white"
                            />
                        </View>
                    </View>

                    {/* Notifications */}
                    <View style={styles.section}>
                        <Text style={styles.sectionLabel}>NOTIFICATIONS</Text>
                        <View style={styles.settingRow}>
                            <View>
                                <Text style={styles.settingLabel}>REMINDERS</Text>
                                <Text style={styles.settingDesc}>Task reminder alerts</Text>
                            </View>
                            <Switch
                                value={settings.notifications}
                                onValueChange={() => toggleSetting('notifications')}
                                trackColor={{ false: 'rgba(255,255,255,0.1)', true: accentColor }}
                                thumbColor="white"
                            />
                        </View>
                        <View style={styles.settingRow}>
                            <View>
                                <Text style={styles.settingLabel}>SUDDEN QUESTS</Text>
                                <Text style={styles.settingDesc}>Random quest alerts</Text>
                            </View>
                            <Switch
                                value={settings.suddenQuests}
                                onValueChange={() => toggleSetting('suddenQuests')}
                                trackColor={{ false: 'rgba(255,255,255,0.1)', true: accentColor }}
                                thumbColor="white"
                            />
                        </View>
                    </View>

                    {/* Danger Zone */}
                    <View style={styles.dangerSection}>
                        <Text style={[styles.sectionLabel, { color: 'rgba(139,0,0,0.6)' }]}>DANGER ZONE</Text>
                        <TouchableOpacity style={styles.dangerButton} onPress={handleChangePath}>
                            <Text style={styles.dangerButtonText}>CHANGE PATH</Text>
                        </TouchableOpacity>
                        <Text style={styles.dangerNote}>
                            This will reset all progress and let you choose a new character.
                        </Text>
                    </View>

                    {/* About */}
                    <View style={styles.aboutSection}>
                        <Text style={styles.appName}>THE SYSTEM</Text>
                        <Text style={styles.version}>v1.0.0</Text>
                        <Text style={styles.tagline}>
                            A character-driven system for disciplined progression.
                        </Text>
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
    scrollView: {
        flex: 1,
        padding: 20
    },
    header: {
        marginBottom: 24,
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
    pathCard: {
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderLeftWidth: 3,
        padding: 16,
    },
    pathName: {
        fontFamily: 'monospace',
        fontSize: 14,
        letterSpacing: 2,
    },
    pathEpithet: {
        color: 'rgba(255,255,255,0.4)',
        fontSize: 12,
        marginTop: 4,
    },
    configRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.05)',
    },
    configLabel: {
        fontFamily: 'monospace',
        color: 'rgba(255,255,255,0.4)',
        fontSize: 10,
        letterSpacing: 2,
    },
    configValue: {
        fontFamily: 'monospace',
        fontSize: 12,
    },
    recalibrateButton: {
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
        padding: 12,
        alignItems: 'center',
        marginTop: 12,
    },
    recalibrateText: {
        fontFamily: 'monospace',
        color: 'rgba(255,255,255,0.5)',
        fontSize: 10,
        letterSpacing: 2,
    },
    settingRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.02)',
        padding: 14,
        marginBottom: 6,
    },
    settingLabel: {
        fontFamily: 'monospace',
        color: 'rgba(255,255,255,0.7)',
        fontSize: 11,
        letterSpacing: 1,
    },
    settingDesc: {
        fontFamily: 'monospace',
        color: 'rgba(255,255,255,0.3)',
        fontSize: 9,
        marginTop: 2,
    },
    dangerSection: {
        borderTopWidth: 1,
        borderTopColor: 'rgba(139,0,0,0.2)',
        paddingTop: 24,
        marginBottom: 30,
    },
    dangerButton: {
        borderWidth: 1,
        borderColor: 'rgba(139,0,0,0.4)',
        padding: 14,
        alignItems: 'center',
    },
    dangerButtonText: {
        fontFamily: 'monospace',
        color: 'rgba(139,0,0,0.7)',
        fontSize: 11,
        letterSpacing: 2,
    },
    dangerNote: {
        fontFamily: 'monospace',
        color: 'rgba(255,255,255,0.2)',
        fontSize: 9,
        textAlign: 'center',
        marginTop: 8,
    },
    aboutSection: {
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.05)',
        paddingTop: 30,
        alignItems: 'center',
    },
    appName: {
        fontFamily: 'monospace',
        color: 'rgba(255,255,255,0.6)',
        fontSize: 14,
        letterSpacing: 4,
    },
    version: {
        fontFamily: 'monospace',
        color: 'rgba(255,255,255,0.2)',
        fontSize: 10,
        marginTop: 4,
    },
    tagline: {
        color: 'rgba(255,255,255,0.3)',
        fontSize: 11,
        textAlign: 'center',
        marginTop: 12,
        lineHeight: 18,
    },
});
