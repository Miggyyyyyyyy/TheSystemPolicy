import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, Dimensions, StatusBar, TouchableOpacity, Image, ImageBackground } from 'react-native';
import { useRouter, Href } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { ARCHETYPES } from '@/constants/archetypes';
import { useUserStore } from '@/lib/store';
import { speakQuote } from '@/lib/voice';

const { width, height } = Dimensions.get('window');

// Cinematic character images
const CHARACTER_IMAGES = {
    yujiro: require('@/assets/images/yujiro.png'),
    baki: require('@/assets/images/baki.png'),
    ohma: require('@/assets/images/ohma.png'),
    jack: require('@/assets/images/jack.png'),
};

// Character accent colors (muted, not neon)
const ACCENT_COLORS = {
    yujiro: '#8B0000',  // Deep crimson
    baki: '#4A6B8A',    // Steel blue
    ohma: '#2D5A5A',    // Muted teal
    jack: '#8B7355',    // Warning amber
};

export default function OnboardingScreen() {
    const router = useRouter();
    const [currentIndex, setCurrentIndex] = useState(0);
    const setArchetype = useUserStore((state) => state.setArchetype);

    const currentArchetype = ARCHETYPES[currentIndex];
    const currentImage = CHARACTER_IMAGES[currentArchetype.id as keyof typeof CHARACTER_IMAGES];
    const accentColor = ACCENT_COLORS[currentArchetype.id as keyof typeof ACCENT_COLORS];

    const handleNext = useCallback(() => {
        setCurrentIndex((prev) => (prev < ARCHETYPES.length - 1 ? prev + 1 : 0));
    }, []);

    const handlePrev = useCallback(() => {
        setCurrentIndex((prev) => (prev > 0 ? prev - 1 : ARCHETYPES.length - 1));
    }, []);

    const handleCommit = useCallback(() => {
        setArchetype(currentArchetype.id);
        speakQuote(currentArchetype.id, `Path selected. ${currentArchetype.doctrine}`);
        router.replace('/calibration' as Href);
    }, [currentArchetype, setArchetype, router]);

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />

            {/* Full-screen character image */}
            <Image
                source={currentImage}
                style={styles.characterImage}
                resizeMode="cover"
            />

            {/* Gradient overlay for text readability */}
            <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.7)', 'rgba(0,0,0,0.95)']}
                locations={[0.3, 0.6, 1]}
                style={styles.overlay}
            />

            <SafeAreaView style={styles.content}>
                {/* Top: Path indicator */}
                <View style={styles.topBar}>
                    <Text style={styles.systemLabel}>SELECT PATH</Text>
                    <View style={styles.dots}>
                        {ARCHETYPES.map((_, i) => (
                            <View
                                key={i}
                                style={[
                                    styles.dot,
                                    i === currentIndex && [styles.dotActive, { backgroundColor: accentColor }]
                                ]}
                            />
                        ))}
                    </View>
                </View>

                {/* Navigation arrows */}
                <View style={styles.navContainer}>
                    <TouchableOpacity style={styles.navArrow} onPress={handlePrev}>
                        <Text style={styles.navArrowText}>‹</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.navArrow} onPress={handleNext}>
                        <Text style={styles.navArrowText}>›</Text>
                    </TouchableOpacity>
                </View>

                {/* Bottom: Character info */}
                <View style={styles.infoContainer}>
                    {/* Identity */}
                    <Text style={[styles.epithet, { color: accentColor }]}>
                        {currentArchetype.epithet.toUpperCase()}
                    </Text>
                    <Text style={styles.name}>{currentArchetype.name}</Text>

                    {/* Doctrine */}
                    <View style={[styles.doctrineBox, { borderLeftColor: accentColor }]}>
                        <Text style={styles.doctrine}>"{currentArchetype.doctrine}"</Text>
                    </View>

                    {/* Code (Requirements) */}
                    <View style={styles.codeSection}>
                        <Text style={styles.codeLabel}>THE CODE</Text>
                        {currentArchetype.requirements.map((req, i) => (
                            <View key={i} style={styles.codeRow}>
                                <View style={[styles.codeDot, { backgroundColor: accentColor }]} />
                                <Text style={styles.codeText}>{req}</Text>
                            </View>
                        ))}
                    </View>

                    {/* Commit button */}
                    <TouchableOpacity
                        style={[styles.commitButton, { borderColor: accentColor }]}
                        onPress={handleCommit}
                    >
                        <Text style={[styles.commitText, { color: accentColor }]}>
                            COMMIT TO THIS PATH
                        </Text>
                    </TouchableOpacity>

                    <Text style={styles.warning}>
                        This choice defines your routine. Choose carefully.
                    </Text>
                </View>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000'
    },
    characterImage: {
        position: 'absolute',
        width: width,
        height: height * 0.7,
        top: 0,
    },
    overlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    content: {
        flex: 1,
        justifyContent: 'space-between',
        padding: 20,
    },
    topBar: {
        alignItems: 'center',
        paddingTop: 10,
    },
    systemLabel: {
        fontFamily: 'monospace',
        color: 'rgba(255,255,255,0.4)',
        fontSize: 11,
        letterSpacing: 4,
        marginBottom: 12,
    },
    dots: {
        flexDirection: 'row',
        gap: 10
    },
    dot: {
        width: 8,
        height: 8,
        backgroundColor: 'rgba(255,255,255,0.2)',
    },
    dotActive: {
        width: 24,
    },
    navContainer: {
        position: 'absolute',
        top: height * 0.4,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 10,
    },
    navArrow: {
        width: 50,
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    navArrowText: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: 32,
        fontWeight: '200',
    },
    infoContainer: {
        paddingBottom: 20,
    },
    epithet: {
        fontFamily: 'monospace',
        fontSize: 12,
        letterSpacing: 4,
        marginBottom: 4,
    },
    name: {
        color: 'rgba(255,255,255,0.95)',
        fontSize: 28,
        fontWeight: '300',
        letterSpacing: 2,
        marginBottom: 16,
    },
    doctrineBox: {
        borderLeftWidth: 2,
        paddingLeft: 12,
        marginBottom: 20,
    },
    doctrine: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 14,
        fontStyle: 'italic',
        lineHeight: 22,
    },
    codeSection: {
        marginBottom: 24,
    },
    codeLabel: {
        fontFamily: 'monospace',
        color: 'rgba(255,255,255,0.3)',
        fontSize: 10,
        letterSpacing: 3,
        marginBottom: 10,
    },
    codeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    codeDot: {
        width: 4,
        height: 4,
        marginRight: 10,
    },
    codeText: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: 12,
        fontFamily: 'monospace',
    },
    commitButton: {
        borderWidth: 1,
        padding: 16,
        alignItems: 'center',
        marginBottom: 12,
    },
    commitText: {
        fontFamily: 'monospace',
        fontSize: 13,
        letterSpacing: 2,
    },
    warning: {
        color: 'rgba(255,255,255,0.3)',
        fontSize: 10,
        textAlign: 'center',
        fontFamily: 'monospace',
    },
});
