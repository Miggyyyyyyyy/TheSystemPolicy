import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';

interface SystemButtonProps {
    title: string;
    onPress: () => void;
    color?: string;
    variant?: 'primary' | 'secondary' | 'danger';
    disabled?: boolean;
    style?: ViewStyle;
}

export const SystemButton: React.FC<SystemButtonProps> = ({
    title,
    onPress,
    color = '#FFFFFF',
    variant = 'primary',
    disabled = false,
    style,
}) => {
    const getButtonStyle = () => {
        switch (variant) {
            case 'primary':
                return { backgroundColor: color };
            case 'secondary':
                return { backgroundColor: 'transparent', borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)' };
            case 'danger':
                return { backgroundColor: 'transparent', borderWidth: 1, borderColor: 'rgba(255,0,0,0.3)' };
            default:
                return { backgroundColor: color };
        }
    };

    const getTextColor = () => {
        switch (variant) {
            case 'primary':
                return color === '#FFFFFF' ? 'black' : 'white';
            case 'secondary':
                return 'white';
            case 'danger':
                return 'rgba(255,0,0,0.7)';
            default:
                return 'white';
        }
    };

    return (
        <TouchableOpacity
            style={[styles.button, getButtonStyle(), disabled && styles.disabled, style]}
            onPress={onPress}
            disabled={disabled}
        >
            <Text style={[styles.buttonText, { color: getTextColor() }]}>{title}</Text>
        </TouchableOpacity>
    );
};

interface SystemCardProps {
    children: React.ReactNode;
    accentColor?: string;
    style?: ViewStyle;
}

export const SystemCard: React.FC<SystemCardProps> = ({
    children,
    accentColor,
    style,
}) => {
    return (
        <View
            style={[
                styles.card,
                accentColor && { borderLeftWidth: 4, borderLeftColor: accentColor },
                style,
            ]}
        >
            {children}
        </View>
    );
};

interface SystemLabelProps {
    text: string;
}

export const SystemLabel: React.FC<SystemLabelProps> = ({ text }) => {
    return <Text style={styles.label}>{text}</Text>;
};

interface StatDisplayProps {
    value: number | string;
    label: string;
    color?: string;
}

export const StatDisplay: React.FC<StatDisplayProps> = ({ value, label, color }) => {
    return (
        <View style={styles.statContainer}>
            <Text style={[styles.statValue, color && { color }]}>{value}</Text>
            <Text style={styles.statLabel}>{label}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    button: {
        padding: 20,
        alignItems: 'center',
    },
    buttonText: {
        fontSize: 16,
        fontWeight: '900',
        letterSpacing: 2,
    },
    disabled: {
        opacity: 0.5,
    },
    card: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        padding: 20,
    },
    label: {
        color: 'rgba(255,255,255,0.4)',
        fontSize: 12,
        letterSpacing: 4,
        fontWeight: 'bold',
        marginBottom: 12,
    },
    statContainer: {
        alignItems: 'center',
    },
    statValue: {
        color: 'white',
        fontSize: 24,
        fontWeight: '900',
    },
    statLabel: {
        color: 'rgba(255,255,255,0.4)',
        fontSize: 10,
        letterSpacing: 2,
        marginTop: 4,
    },
});
