import { Platform } from 'react-native';

export type ArchetypeId = 'yujiro' | 'baki' | 'ohma' | 'jack';

// ElevenLabs Voice IDs provided by user
const ELEVENLABS_VOICE_IDS: Record<ArchetypeId, string> = {
    yujiro: 'xOY5I7jdwCtaAIT2tqUg',
    baki: 'V5PcNlnNQJaak3hiU3OT',
    ohma: 'c8Qg6ombe4JNjLm4ql7a',
    jack: '4EWE6i6QHVi2axoi0px7',
};

// Voice settings for fallback TTS
const VOICE_SETTINGS: Record<ArchetypeId, { pitch: number; rate: number }> = {
    yujiro: { pitch: 0.8, rate: 0.85 },
    baki: { pitch: 1.0, rate: 1.0 },
    ohma: { pitch: 0.95, rate: 0.9 },
    jack: { pitch: 0.75, rate: 0.8 },
};

// Get API key from environment
const getApiKey = (): string => {
    if (typeof process !== 'undefined' && process.env) {
        return process.env.EXPO_PUBLIC_ELEVENLABS_API_KEY || '';
    }
    return '';
};

// Web Speech API - initialize on first user interaction
let webSpeechReady = false;

const initWebSpeech = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        // Load voices
        window.speechSynthesis.getVoices();
        webSpeechReady = true;
    }
};

// Speak using Web Speech API
const speakWithWebAPI = (text: string, settings: { pitch: number; rate: number }): boolean => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
        console.log('Web Speech API not available');
        return false;
    }

    // Initialize if needed
    if (!webSpeechReady) {
        initWebSpeech();
    }

    try {
        // Cancel any ongoing speech
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.pitch = settings.pitch;
        utterance.rate = settings.rate;
        utterance.lang = 'en-US';
        utterance.volume = 1;

        // Try to find a male voice
        const voices = window.speechSynthesis.getVoices();
        const maleVoice = voices.find(v =>
            v.name.toLowerCase().includes('male') ||
            v.name.includes('David') ||
            v.name.includes('James') ||
            v.name.includes('Google US English')
        );
        if (maleVoice) {
            utterance.voice = maleVoice;
        }

        utterance.onstart = () => console.log('Speaking:', text.substring(0, 30) + '...');
        utterance.onerror = (e) => console.error('Speech error:', e);

        window.speechSynthesis.speak(utterance);
        return true;
    } catch (error) {
        console.error('Web Speech error:', error);
        return false;
    }
};

// Speak using ElevenLabs API (for premium voices)
const speakWithElevenLabs = async (archetypeId: ArchetypeId, text: string): Promise<boolean> => {
    const apiKey = getApiKey();
    if (!apiKey) {
        return false;
    }

    const voiceId = ELEVENLABS_VOICE_IDS[archetypeId];

    try {
        const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
            method: 'POST',
            headers: {
                'Accept': 'audio/mpeg',
                'Content-Type': 'application/json',
                'xi-api-key': apiKey,
            },
            body: JSON.stringify({
                text,
                model_id: 'eleven_monolingual_v1',
                voice_settings: {
                    stability: 0.7,
                    similarity_boost: 0.8,
                },
            }),
        });

        if (!response.ok) {
            console.log('ElevenLabs API error:', response.status);
            return false;
        }

        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        await audio.play();

        console.log(`ElevenLabs: Playing ${archetypeId} voice`);
        return true;
    } catch (error) {
        console.error('ElevenLabs error:', error);
        return false;
    }
};

// Main speak function
export const speakQuote = async (archetypeId: ArchetypeId, quote: string): Promise<void> => {
    const settings = VOICE_SETTINGS[archetypeId];

    // On web, try ElevenLabs first, then Web Speech
    if (Platform.OS === 'web') {
        const elevenlabsSuccess = await speakWithElevenLabs(archetypeId, quote);
        if (!elevenlabsSuccess) {
            speakWithWebAPI(quote, settings);
        }
        return;
    }

    // On mobile, use expo-speech
    try {
        const Speech = require('expo-speech');
        await Speech.stop();

        Speech.speak(quote, {
            pitch: settings.pitch,
            rate: settings.rate,
            language: 'en-US',
            onDone: () => console.log('Quote spoken'),
            onError: (error: any) => console.error('Speech error:', error),
        });
    } catch (error) {
        console.error('Mobile speech error:', error);
    }
};

export const stopSpeech = (): void => {
    if (Platform.OS === 'web') {
        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
            window.speechSynthesis.cancel();
        }
    } else {
        try {
            const Speech = require('expo-speech');
            Speech.stop();
        } catch (error) {
            console.error('Stop speech error:', error);
        }
    }
};
