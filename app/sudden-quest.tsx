import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useUserStore } from '@/lib/store';
import { ARCHETYPES } from '@/constants/archetypes';
import { speakQuote } from '@/lib/voice';

const CHARACTER_IMAGES = {
    yujiro: require('@/assets/images/yujiro.png'),
    baki: require('@/assets/images/baki.png'),
    ohma: require('@/assets/images/ohma.png'),
    jack: require('@/assets/images/jack.png'),
};

const SUDDEN_QUESTS = [
    { id: 'sq-1', title: 'THE DROP', objective: 'Drop and do 20 pushups. Now.', xp: 30, icon: 'arrow-down' },
    { id: 'sq-2', title: 'THE WALK', objective: 'Take a 10 minute walk. No phone.', xp: 20, icon: 'street-view' },
    { id: 'sq-3', title: 'THE BREATH', objective: 'Complete 20 deep breaths. Box breathing.', xp: 15, icon: 'cloud' },
    { id: 'sq-4', title: 'THE VOID', objective: 'Sit in silence for 5 minutes. Eyes closed.', xp: 25, icon: 'eye-slash' },
];

export default function SuddenQuestScreen() {
    const router = useRouter();
    const profile = useUserStore((state) => state.profile);
    const addXP = useUserStore((state) => state.addXP);
    const archetype = ARCHETYPES.find((a) => a.id === profile?.archetype);
    const characterImage = archetype ? CHARACTER_IMAGES[archetype.id as keyof typeof CHARACTER_IMAGES] : null;

    const [quest] = useState(() => SUDDEN_QUESTS[Math.floor(Math.random() * SUDDEN_QUESTS.length)]);
    const [accepted, setAccepted] = useState(false);
    const [completed, setCompleted] = useState(false);

    useEffect(() => {
        if (archetype) {
            speakQuote(archetype.id, 'Sudden Quest. ' + quest.title);
        }
    }, []);

    const handleAccept = () => {
        setAccepted(true);
        if (archetype) {
            speakQuote(archetype.id, 'Begin immediately.');
        }
    };

    const handleComplete = () => {
        setCompleted(true);
        addXP(quest.xp);
        if (archetype) {
            speakQuote(archetype.id, 'Quest complete. Discipline noted.');
        }
    };

    const handleDecline = () => {
        if (archetype) {
            speakQuote(archetype.id, 'Weakness detected.');
        }
        router.back();
    };

    if (!archetype) return null;

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={[archetype.color, '#0A0A0A']}
                locations={[0, 0.6]}
                style={StyleSheet.absoluteFill}
            />

            {characterImage && (
                <View style={styles.characterBg}>
                    <Image source={characterImage} style={styles.characterImage} resizeMode="contain" />
                </View>
            )}

            <SafeAreaView style={styles.safeArea}>
                <View style={styles.header}>
                    <FontAwesome name="bolt" size={24} color="#FFD700" />
                    <Text style={styles.systemAlert}>SUDDEN QUEST</Text>
                </View>

                <View style={styles.questCard}>
                    <FontAwesome name={quest.icon as any} size={40} color={archetype.color} />
                    <Text style={[styles.questTitle, { color: archetype.color }]}>{quest.title}</Text>

                    <View style={styles.objectiveBox}>
                        <Text style={styles.objectiveLabel}>OBJECTIVE</Text>
                        <Text style={styles.objectiveText}>{quest.objective}</Text>
                    </View>

                    <View style={styles.rewardBox}>
                        <FontAwesome name="star" size={18} color="#FFD700" />
                        <Text style={styles.rewardValue}>+{quest.xp} XP</Text>
                    </View>
                </View>

                <TouchableOpacity
                    style={styles.quoteBox}
                    onPress={() => archetype && speakQuote(archetype.id, archetype.quote)}
                >
                    <Text style={styles.quote}>"{archetype.quote}"</Text>
                </TouchableOpacity>

                <View style={{ flex: 1 }} />

                {completed ? (
                    <TouchableOpacity style={styles.successButton} onPress={() => router.back()}>
                        <FontAwesome name="check" size={18} color="white" />
                        <Text style={styles.buttonText}>RETURN TO HUB</Text>
                    </TouchableOpacity>
                ) : accepted ? (
                    <TouchableOpacity
                        style={[styles.primaryButton, { backgroundColor: archetype.color }]}
                        onPress={handleComplete}
                    >
                        <FontAwesome name="flag-checkered" size={18} color="white" />
                        <Text style={styles.buttonText}>MARK COMPLETE</Text>
                    </TouchableOpacity>
                ) : (
                    <>
                        <TouchableOpacity
                            style={[styles.primaryButton, { backgroundColor: archetype.color }]}
                            onPress={handleAccept}
                        >
                            <FontAwesome name="bolt" size={18} color="white" />
                            <Text style={styles.buttonText}>ACCEPT QUEST</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.declineButton} onPress={handleDecline}>
                            <FontAwesome name="times" size={14} color="rgba(255,0,0,0.7)" />
                            <Text style={styles.declineText}>DECLINE</Text>
                        </TouchableOpacity>
                    </>
                )}
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    characterBg: {
        position: 'absolute',
        top: 100,
        right: -50,
        width: 200,
        height: 300,
        opacity: 0.15,
    },
    characterImage: { width: '100%', height: '100%' },
    safeArea: { flex: 1, padding: 24 },
    header: { alignItems: 'center', marginBottom: 30 },
    systemAlert: {
        color: '#FFD700',
        fontSize: 16,
        fontWeight: '900',
        letterSpacing: 4,
        marginTop: 10,
    },
    questCard: {
        backgroundColor: 'rgba(0,0,0,0.4)',
        padding: 24,
        alignItems: 'center',
        marginBottom: 20,
    },
    questTitle: { fontSize: 28, fontWeight: '900', marginTop: 16, marginBottom: 20 },
    objectiveBox: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        padding: 16,
        width: '100%',
        marginBottom: 16,
    },
    objectiveLabel: {
        color: 'rgba(255,255,255,0.4)',
        fontSize: 10,
        letterSpacing: 2,
        marginBottom: 8,
    },
    objectiveText: { color: 'white', fontSize: 16, fontWeight: 'bold', lineHeight: 24 },
    rewardBox: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    rewardValue: { color: '#FFD700', fontSize: 24, fontWeight: '900' },
    quoteBox: { alignItems: 'center', paddingHorizontal: 20 },
    quote: {
        color: 'rgba(255,255,255,0.4)',
        fontSize: 13,
        fontStyle: 'italic',
        textAlign: 'center',
    },
    primaryButton: {
        flexDirection: 'row',
        gap: 12,
        padding: 18,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
    },
    successButton: {
        flexDirection: 'row',
        gap: 12,
        padding: 18,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
        backgroundColor: '#1A5A1A',
    },
    buttonText: { color: 'white', fontSize: 16, fontWeight: '900', letterSpacing: 2 },
    declineButton: {
        flexDirection: 'row',
        gap: 8,
        padding: 14,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,0,0,0.3)',
    },
    declineText: { color: 'rgba(255,0,0,0.7)', fontSize: 13, fontWeight: 'bold', letterSpacing: 1 },
});
