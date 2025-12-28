import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { useRouter, Href } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

export default function IntroScreen() {
    const router = useRouter();

    useEffect(() => {
        // Redirect to onboarding after 3 seconds
        const timeout = setTimeout(() => {
            router.replace('/(onboarding)' as Href);
        }, 3000);

        return () => clearTimeout(timeout);
    }, [router]);

    return (
        <LinearGradient colors={['#1A1A2E', '#0A0A0A']} style={styles.container}>
            <View style={styles.content}>
                <View style={styles.logoOuter}>
                    <View style={styles.logoInner}>
                        <Text style={styles.logoText}>S</Text>
                    </View>
                </View>

                <Text style={styles.systemLabel}>THE SYSTEM</Text>
                <Text style={styles.mainText}>Welcome.</Text>
                <Text style={styles.subText}>This is not a game.</Text>
            </View>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        alignItems: 'center',
        padding: 40,
    },
    logoOuter: {
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 30,
    },
    logoInner: {
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: 'rgba(255,255,255,0.1)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    logoText: {
        color: 'white',
        fontSize: 36,
        fontWeight: '900',
    },
    systemLabel: {
        color: 'rgba(255,255,255,0.3)',
        fontSize: 12,
        letterSpacing: 8,
        marginBottom: 30,
    },
    mainText: {
        color: 'white',
        fontSize: 32,
        fontWeight: '300',
        marginBottom: 10,
    },
    subText: {
        color: 'rgba(255,255,255,0.5)',
        fontSize: 18,
    },
});
