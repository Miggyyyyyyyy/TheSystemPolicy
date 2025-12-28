import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Href } from 'expo-router';
import { signUp } from '@/lib/supabase';

export default function SignupScreen() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleSignup = async () => {
        if (!email || !password || !username) {
            setError('Please fill in all fields.');
            return;
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters.');
            return;
        }

        setLoading(true);
        setError('');

        const { data, error: authError } = await signUp(email, password, username);

        setLoading(false);

        if (authError) {
            setError(authError.message);
        } else if (data.user) {
            setSuccess(true);
        }
    };

    if (success) {
        return (
            <View style={styles.container}>
                <SafeAreaView style={styles.successContent}>
                    <Text style={styles.successTitle}>SYSTEM REGISTERED</Text>
                    <Text style={styles.successText}>
                        Check your email to confirm your account.
                    </Text>
                    <TouchableOpacity
                        style={styles.loginButton}
                        onPress={() => router.replace('/(auth)/login' as Href)}
                    >
                        <Text style={styles.loginButtonText}>PROCEED TO LOGIN</Text>
                    </TouchableOpacity>
                </SafeAreaView>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <SafeAreaView style={{ flex: 1 }}>
                <KeyboardAvoidingView
                    style={styles.content}
                    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                >
                    {/* Back */}
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => router.back()}
                    >
                        <Text style={styles.backText}>← BACK</Text>
                    </TouchableOpacity>

                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={styles.systemLabel}>THE SYSTEM</Text>
                        <Text style={styles.title}>CREATE ACCOUNT</Text>
                    </View>

                    {/* Form */}
                    <View style={styles.form}>
                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>USERNAME</Text>
                            <TextInput
                                style={styles.input}
                                value={username}
                                onChangeText={setUsername}
                                placeholder="Hunter"
                                placeholderTextColor="rgba(255,255,255,0.2)"
                                autoCapitalize="none"
                                autoCorrect={false}
                            />
                        </View>

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
                            style={[styles.signupButton, loading && styles.signupButtonDisabled]}
                            onPress={handleSignup}
                            disabled={loading}
                        >
                            <Text style={styles.signupButtonText}>
                                {loading ? 'REGISTERING...' : 'JOIN THE SYSTEM'}
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/* Footer */}
                    <View style={styles.footer}>
                        <Text style={styles.footerText}>Already have an account?</Text>
                        <TouchableOpacity onPress={() => router.replace('/(auth)/login' as Href)}>
                            <Text style={styles.loginLink}>LOGIN</Text>
                        </TouchableOpacity>
                    </View>
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
    },
    successContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    successTitle: {
        fontFamily: 'monospace',
        color: '#4A6B8A',
        fontSize: 18,
        letterSpacing: 4,
        marginBottom: 16,
    },
    successText: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: 14,
        textAlign: 'center',
        marginBottom: 30,
    },
    backButton: {
        marginBottom: 30,
    },
    backText: {
        fontFamily: 'monospace',
        color: 'rgba(255,255,255,0.4)',
        fontSize: 11,
        letterSpacing: 2,
    },
    header: {
        alignItems: 'center',
        marginBottom: 40,
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
        fontSize: 22,
        fontWeight: '200',
        letterSpacing: 4,
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
    signupButton: {
        borderWidth: 1,
        borderColor: '#4A6B8A',
        padding: 16,
        alignItems: 'center',
        marginTop: 10,
    },
    signupButtonDisabled: {
        opacity: 0.5,
    },
    signupButtonText: {
        fontFamily: 'monospace',
        color: '#4A6B8A',
        fontSize: 12,
        letterSpacing: 3,
    },
    loginButton: {
        borderWidth: 1,
        borderColor: '#4A6B8A',
        padding: 16,
        paddingHorizontal: 30,
    },
    loginButtonText: {
        fontFamily: 'monospace',
        color: '#4A6B8A',
        fontSize: 12,
        letterSpacing: 2,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
    },
    footerText: {
        fontFamily: 'monospace',
        color: 'rgba(255,255,255,0.3)',
        fontSize: 11,
    },
    loginLink: {
        fontFamily: 'monospace',
        color: '#4A6B8A',
        fontSize: 11,
        letterSpacing: 1,
    },
});
