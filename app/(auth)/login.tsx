import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Href } from 'expo-router';
import { signIn } from '@/lib/supabase';

export default function LoginScreen() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        if (!email || !password) {
            setError('Please fill in all fields.');
            return;
        }

        setLoading(true);
        setError('');

        const { data, error: authError } = await signIn(email, password);

        setLoading(false);

        if (authError) {
            setError(authError.message);
        } else if (data.user) {
            router.replace('/' as Href);
        }
    };

    return (
        <View style={styles.container}>
            <SafeAreaView style={{ flex: 1 }}>
                <KeyboardAvoidingView
                    style={styles.content}
                    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                >
                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={styles.systemLabel}>THE SYSTEM</Text>
                        <Text style={styles.title}>LOGIN</Text>
                    </View>

                    {/* Form */}
                    <View style={styles.form}>
                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>EMAIL</Text>
                            <TextInput
                                style={styles.input}
                                value={email}
                                onChangeText={setEmail}
                                placeholder="hunter@system.io"
                                placeholderTextColor="rgba(255,255,255,0.2)"
                                keyboardType="email-address"
                                autoCapitalize="none"
                                autoCorrect={false}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>PASSWORD</Text>
                            <TextInput
                                style={styles.input}
                                value={password}
                                onChangeText={setPassword}
                                placeholder="••••••••"
                                placeholderTextColor="rgba(255,255,255,0.2)"
                                secureTextEntry
                            />
                        </View>

                        {error ? <Text style={styles.error}>{error}</Text> : null}

                        <TouchableOpacity
                            style={[styles.loginButton, loading && styles.loginButtonDisabled]}
                            onPress={handleLogin}
                            disabled={loading}
                        >
                            <Text style={styles.loginButtonText}>
                                {loading ? 'AUTHENTICATING...' : 'ENTER SYSTEM'}
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/* Footer */}
                    <View style={styles.footer}>
                        <Text style={styles.footerText}>No account?</Text>
                        <TouchableOpacity onPress={() => router.push('/(auth)/signup' as Href)}>
                            <Text style={styles.signupLink}>CREATE ONE</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Skip for now (dev only) */}
                    <TouchableOpacity
                        style={styles.skipButton}
                        onPress={() => router.replace('/(onboarding)' as Href)}
                    >
                        <Text style={styles.skipText}>CONTINUE WITHOUT ACCOUNT</Text>
                    </TouchableOpacity>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0A0A0A',
    },
    content: {
        flex: 1,
        padding: 24,
        justifyContent: 'center',
    },
    header: {
        alignItems: 'center',
        marginBottom: 50,
    },
    systemLabel: {
        fontFamily: 'monospace',
        color: 'rgba(255,255,255,0.3)',
        fontSize: 10,
        letterSpacing: 4,
        marginBottom: 8,
    },
    title: {
        color: 'rgba(255,255,255,0.9)',
        fontSize: 28,
        fontWeight: '200',
        letterSpacing: 8,
    },
    form: {
        marginBottom: 40,
    },
    inputGroup: {
        marginBottom: 20,
    },
    inputLabel: {
        fontFamily: 'monospace',
        color: 'rgba(255,255,255,0.4)',
        fontSize: 10,
        letterSpacing: 2,
        marginBottom: 8,
    },
    input: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        color: 'rgba(255,255,255,0.9)',
        fontFamily: 'monospace',
        fontSize: 16,
        padding: 14,
    },
    error: {
        fontFamily: 'monospace',
        color: '#8B0000',
        fontSize: 11,
        marginBottom: 16,
        textAlign: 'center',
    },
    loginButton: {
        borderWidth: 1,
        borderColor: '#4A6B8A',
        padding: 16,
        alignItems: 'center',
        marginTop: 10,
    },
    loginButtonDisabled: {
        opacity: 0.5,
    },
    loginButtonText: {
        fontFamily: 'monospace',
        color: '#4A6B8A',
        fontSize: 12,
        letterSpacing: 3,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
        marginBottom: 20,
    },
    footerText: {
        fontFamily: 'monospace',
        color: 'rgba(255,255,255,0.3)',
        fontSize: 11,
    },
    signupLink: {
        fontFamily: 'monospace',
        color: '#4A6B8A',
        fontSize: 11,
        letterSpacing: 1,
    },
    skipButton: {
        alignItems: 'center',
        padding: 12,
    },
    skipText: {
        fontFamily: 'monospace',
        color: 'rgba(255,255,255,0.2)',
        fontSize: 10,
        letterSpacing: 2,
    },
});
