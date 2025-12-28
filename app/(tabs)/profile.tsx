import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useUserStore } from '@/lib/store';
import { ARCHETYPES } from '@/constants/archetypes';

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

// Descriptive stat labels
const STAT_DESCRIPTIONS: Record<string, Record<number, string>> = {
    discipline: {
        0: 'Unstable',
        1: 'Forming', 2: 'Forming', 3: 'Forming',
        4: 'Developing', 5: 'Developing', 6: 'Developing',
        7: 'Stable', 8: 'Stable',
        9: 'Strong', 10: 'Unshakable',
    },
    vitality: {
        0: 'Critical',
        1: 'Weak', 2: 'Weak', 3: 'Weak',
        4: 'Functional', 5: 'Functional', 6: 'Functional',
        7: 'Healthy', 8: 'Healthy',
        9: 'Thriving', 10: 'Peak',
    },
    intellect: {
        0: 'Dormant',
        1: 'Awakening', 2: 'Awakening', 3: 'Awakening',
        4: 'Active', 5: 'Active', 6: 'Active',
        7: 'Sharp', 8: 'Sharp',
        9: 'Tactical', 10: 'Strategic',
    },
    spirit: {
        0: 'Broken',
        1: 'Recovering', 2: 'Recovering', 3: 'Recovering',
        4: 'Stable', 5: 'Stable', 6: 'Stable',
        7: 'Focused', 8: 'Focused',
        9: 'Resolute', 10: 'Indomitable',
    },
};

const getStatDescription = (stat: string, value: number) => {
    const descriptions = STAT_DESCRIPTIONS[stat];
    const clampedValue = Math.min(10, Math.max(0, value));
    return descriptions[clampedValue] || 'Unknown';
};

export default function ProgressScreen() {
    const profile = useUserStore((state) => state.profile);
    const archetype = ARCHETYPES.find((a) => a.id === profile?.archetype);
    const characterImage = archetype ? CHARACTER_IMAGES[archetype.id as keyof typeof CHARACTER_IMAGES] : null;
    const accentColor = archetype ? ACCENT_COLORS[archetype.id as keyof typeof ACCENT_COLORS] : '#4A6B8A';

    if (!profile || !archetype) {
        return (
            <View style={styles.container}>
                <SafeAreaView style={styles.emptyState}>
                    <Text style={styles.systemText}>NO PATH SELECTED</Text>
                </SafeAreaView>
            </View>
        );
    }

    // Level titles
    const LEVEL_TITLES = ['Initiate', 'Novice', 'Practitioner', 'Adept', 'Warrior', 'Master', 'Legend'];
    const levelTitle = LEVEL_TITLES[Math.min(profile.level - 1, LEVEL_TITLES.length - 1)];

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
                <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={styles.sectionLabel}>PROGRESS</Text>
                    </View>

                    {/* Level Card */}
                    <View style={[styles.levelCard, { borderLeftColor: accentColor }]}>
                        <Text style={styles.levelNumber}>{profile.level}</Text>
                        <View style={styles.levelInfo}>
                            <Text style={[styles.levelTitle, { color: accentColor }]}>{levelTitle.toUpperCase()}</Text>
                            <Text style={styles.xpText}>{profile.xp} XP TOTAL</Text>
                        </View>
                    </View>

                    {/* Streak */}
                    <View style={styles.streakCard}>
                        <Text style={styles.streakLabel}>CURRENT STREAK</Text>
                        <Text style={styles.streakValue}>{profile.streak} DAYS</Text>
                        <Text style={styles.streakStatus}>
                            {profile.streak >= 7 ? 'Consistency established.' : 'Building momentum.'}
                        </Text>
                    </View>

                    {/* Shadow Stats (Descriptive) */}
                    <View style={styles.section}>
                        <Text style={styles.sectionLabel}>SHADOW STATS</Text>

                        <View style={styles.statRow}>
                            <Text style={styles.statName}>DISCIPLINE</Text>
                            <Text style={[styles.statValue, { color: accentColor }]}>
                                {getStatDescription('discipline', profile.stats.discipline)}
                            </Text>
                        </View>

                        <View style={styles.statRow}>
                            <Text style={styles.statName}>VITALITY</Text>
                            <Text style={[styles.statValue, { color: accentColor }]}>
                                {getStatDescription('vitality', profile.stats.vitality)}
                            </Text>
                        </View>

                        <View style={styles.statRow}>
                            <Text style={styles.statName}>INTELLECT</Text>
                            <Text style={[styles.statValue, { color: accentColor }]}>
                                {getStatDescription('intellect', profile.stats.intellect)}
                            </Text>
                        </View>

                        <View style={styles.statRow}>
                            <Text style={styles.statName}>SPIRIT</Text>
                            <Text style={[styles.statValue, { color: accentColor }]}>
                                {getStatDescription('spirit', profile.stats.spirit)}
                            </Text>
                        </View>
                    </View>

                    {/* System Message */}
                    <View style={styles.systemMessageBox}>
                        <Text style={styles.systemMessage}>
                            Progress is observed. Continue with consistency.
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
    characterBg: {
        position: 'absolute',
        top: 100,
        right: -80,
        width: 250,
        height: 350,
        opacity: 0.08,
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
        marginBottom: 24,
    },
    sectionLabel: {
        fontFamily: 'monospace',
        color: 'rgba(255,255,255,0.3)',
        fontSize: 10,
        letterSpacing: 3,
    },
    levelCard: {
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderLeftWidth: 3,
        padding: 20,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    levelNumber: {
        color: 'rgba(255,255,255,0.9)',
        fontSize: 48,
        fontWeight: '100',
        marginRight: 20,
    },
    levelInfo: {
        flex: 1,
    },
    levelTitle: {
        fontFamily: 'monospace',
        fontSize: 14,
        letterSpacing: 3,
        marginBottom: 4,
    },
    xpText: {
        fontFamily: 'monospace',
        color: 'rgba(255,255,255,0.3)',
        fontSize: 10,
        letterSpacing: 2,
    },
    streakCard: {
        backgroundColor: 'rgba(255,255,255,0.02)',
        padding: 16,
        marginBottom: 30,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    streakLabel: {
        fontFamily: 'monospace',
        color: 'rgba(255,255,255,0.3)',
        fontSize: 9,
        letterSpacing: 2,
        marginBottom: 4,
    },
    streakValue: {
        color: 'rgba(255,255,255,0.9)',
        fontSize: 24,
        fontWeight: '200',
        marginBottom: 4,
    },
    streakStatus: {
        fontFamily: 'monospace',
        color: 'rgba(255,255,255,0.4)',
        fontSize: 10,
    },
    section: {
        marginBottom: 30,
    },
    statRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.05)',
    },
    statName: {
        fontFamily: 'monospace',
        color: 'rgba(255,255,255,0.4)',
        fontSize: 10,
        letterSpacing: 2,
    },
    statValue: {
        fontFamily: 'monospace',
        fontSize: 11,
        letterSpacing: 1,
    },
    systemMessageBox: {
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.05)',
        paddingTop: 20,
    },
    systemMessage: {
        fontFamily: 'monospace',
        color: 'rgba(255,255,255,0.3)',
        fontSize: 11,
        textAlign: 'center',
        letterSpacing: 1,
    },
});
