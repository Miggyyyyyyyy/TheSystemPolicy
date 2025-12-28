import { Platform, Alert } from 'react-native';

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
    // Check both standard Expo env var and direct process.env for web compatibility
    const key = process.env.EXPO_PUBLIC_ELEVENLABS_API_KEY;
    if (!key) {
        console.warn('ElevenLabs API Key is missing');
    }
    return key || '';
};

// Web Speech API - initialize on first user interaction
let webSpeechReady = false;

const initWebSpeech = () => {
    if (Platform.OS === 'web' && typeof window !== 'undefined' && 'speechSynthesis' in window) {
        // Load voices
        window.speechSynthesis.getVoices();
        webSpeechReady = true;
    }
};

// Speak using Web Speech API
const speakWithWebAPI = (text: string, settings: { pitch: number; rate: number }): boolean => {
    if (Platform.OS !== 'web' || typeof window === 'undefined' || !('speechSynthesis' in window)) {
        return false;
    }

    if (!webSpeechReady) {
        initWebSpeech();
    }

    try {
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.pitch = settings.pitch;
        utterance.rate = settings.rate;
        utterance.lang = 'en-US';
        utterance.volume = 1;

        const voices = window.speechSynthesis.getVoices();
        // Priorities: Google US English -> Microsoft David -> Any English Male -> First found
        const voice = voices.find(v => v.name.includes('Google US English')) ||
            voices.find(v => v.name.includes('David')) ||
            voices.find(v => v.name.toLowerCase().includes('male') && v.lang.startsWith('en')) ||
            voices.find(v => v.lang.startsWith('en'));

        if (voice) {
            utterance.voice = voice;
        }

        utterance.onstart = () => console.log('Web Speech started');
        utterance.onerror = (e) => console.error('Web Speech error:', e);

        window.speechSynthesis.speak(utterance);
        return true;
    } catch (error) {
        console.error('Web Speech exception:', error);
        return false;
    }
};

// Speak using ElevenLabs API (for premium voices)
const speakWithElevenLabs = async (archetypeId: ArchetypeId, text: string): Promise<boolean> => {
    const apiKey = getApiKey();
    if (!apiKey) {
        console.warn('Skipping ElevenLabs - No API Key');
        return false;
    }

    const voiceId = ELEVENLABS_VOICE_IDS[archetypeId];

    try {
        const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/stream`, {
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
                    stability: 0.5,
                    similarity_boost: 0.75,
                },
                optimize_streaming_latency: 3,
            }),
        });

        if (!response.ok) {
            console.error('ElevenLabs API error:', response.status, await response.text());
            return false;
        }

        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);

        audio.oncanplaythrough = () => {
            audio.play().catch(e => console.error('Audio play error:', e));
        };

        return true;
    } catch (error) {
        console.error('ElevenLabs network error:', error);
        return false;
    }
};

// Main speak function
export const speakQuote = async (archetypeId: ArchetypeId, quote: string): Promise<void> => {
    const settings = VOICE_SETTINGS[archetypeId];
    console.log(`Speaking quote for ${archetypeId}: "${quote}"`);

    // On web, try ElevenLabs first, then Web Speech
    if (Platform.OS === 'web') {
        const elevenlabsSuccess = await speakWithElevenLabs(archetypeId, quote);
        if (!elevenlabsSuccess) {
            console.log('Falling back to Web Speech API');
            const webSuccess = speakWithWebAPI(quote, settings);
            if (!webSuccess) {
                alert('Audio playback failed. Please check browser permissions.');
            }
        }
        return;
    }

    // On mobile, use expo-speech
    try {
        const Speech = require('expo-speech');
        const isSpeaking = await Speech.isSpeakingAsync();
        if (isSpeaking) {
            await Speech.stop();
        }

        Speech.speak(quote, {
            pitch: settings.pitch,
            rate: settings.rate,
            language: 'en-US',
            onError: (error: any) => {
                console.error('Mobile speech error:', error);
                Alert.alert('Audio Error', 'Could not play audio.');
            },
        });
    } catch (error) {
        console.error('Mobile speech module error:', error);
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
