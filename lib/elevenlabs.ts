import { ArchetypeId } from '@/types';

const ELEVENLABS_API_KEY = process.env.EXPO_PUBLIC_ELEVENLABS_API_KEY || '';

// Voice IDs - User will need to create these in ElevenLabs and paste IDs here
// For now, using placeholders that will use default voices
const VOICE_IDS: Record<ArchetypeId, string> = {
    yujiro: 'onwK4e9ZLuTAKqWW03F9', // Adam - Deep male voice
    baki: 'EXAVITQu4vr4xnSDxMaL',   // Bella - Energetic
    ohma: 'pNInz6obpgDQGcFmaJgB',   // Arnold - Calm
    jack: '21m00Tcm4TlvDq8ikWAM',   // Rachel - Will apply distortion
};

export interface ElevenLabsVoiceSettings {
    stability: number;
    similarity_boost: number;
    style: number;
    use_speaker_boost: boolean;
}

const CHARACTER_VOICE_SETTINGS: Record<ArchetypeId, ElevenLabsVoiceSettings> = {
    yujiro: {
        stability: 0.3,        // Low stability = more aggressive
        similarity_boost: 0.7,
        style: 0.8,            // High style = more character
        use_speaker_boost: true,
    },
    baki: {
        stability: 0.5,
        similarity_boost: 0.75,
        style: 0.6,
        use_speaker_boost: true,
    },
    ohma: {
        stability: 0.8,        // High stability = calm
        similarity_boost: 0.8,
        style: 0.3,
        use_speaker_boost: false,
    },
    jack: {
        stability: 0.2,        // Very low = unstable/distorted
        similarity_boost: 0.5,
        style: 0.9,
        use_speaker_boost: true,
    },
};

export const generateElevenLabsAudio = async (
    archetypeId: ArchetypeId,
    text: string
): Promise<string | null> => {
    if (!ELEVENLABS_API_KEY) {
        console.warn('ElevenLabs API key not configured');
        return null;
    }

    try {
        const voiceId = VOICE_IDS[archetypeId];
        const settings = CHARACTER_VOICE_SETTINGS[archetypeId];

        const response = await fetch(
            `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
            {
                method: 'POST',
                headers: {
                    'Accept': 'audio/mpeg',
                    'Content-Type': 'application/json',
                    'xi-api-key': ELEVENLABS_API_KEY,
                },
                body: JSON.stringify({
                    text: text,
                    model_id: 'eleven_monolingual_v1',
                    voice_settings: settings,
                }),
            }
        );

        if (!response.ok) {
            console.error('ElevenLabs API error:', response.status);
            return null;
        }

        // Convert blob to base64 for playback
        const blob = await response.blob();
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                resolve(reader.result as string);
            };
            reader.readAsDataURL(blob);
        });
    } catch (error) {
        console.error('ElevenLabs generation error:', error);
        return null;
    }
};

// Pre-defined quotes for each event type
export const VOICE_EVENTS = {
    LEVEL_UP: 'level_up',
    TASK_COMPLETE: 'task_complete',
    TASK_FAILED: 'task_failed',
    SUDDEN_QUEST: 'sudden_quest',
    PENALTY: 'penalty',
} as const;

export type VoiceEvent = typeof VOICE_EVENTS[keyof typeof VOICE_EVENTS];

// Quote database per archetype per event
const VOICE_QUOTES: Record<ArchetypeId, Record<VoiceEvent, string[]>> = {
    yujiro: {
        level_up: [
            'So you have clawed this far. Do not think you are special. You are simply less weak.',
            'Another step. The weak remain below. Continue.',
        ],
        task_complete: [
            'A minimal effort. Do not expect applause for doing what is necessary.',
            'Progress recorded. The system acknowledges your compliance.',
        ],
        task_failed: [
            'Weakness is a sickness. And today, you are infected.',
            'Pathetic. The strong do not falter. You are not yet strong.',
        ],
        sudden_quest: [
            'The world is soft. You are soft. Hardness is required. Now.',
            'A test appears. Show me you are not worthless.',
        ],
        penalty: [
            'If you cannot control your time, you cannot control your fate. Pay the price.',
            'Discipline must be enforced. Accept your punishment.',
        ],
    },
    baki: {
        level_up: [
            'We are getting closer! I can feel it. The body is listening!',
            'Another level! The training is working. Keep pushing!',
        ],
        task_complete: [
            'Good. That burn? That is the feeling of evolution.',
            'Nice work. Every rep builds the champion.',
        ],
        task_failed: [
            'Damn it... we slipped. It is fine. We fix it tomorrow. But we DO fix it.',
            'A setback, not a defeat. Get back up.',
        ],
        sudden_quest: [
            'A real fight does not wait for you to be ready! Move!',
            'Opportunity strikes! Show what you have got!',
        ],
        penalty: [
            'Pain is just information! Let us use this mistake to build something new.',
            'This is extra training. Embrace it.',
        ],
    },
    ohma: {
        level_up: [
            'Your flow is improving. You are beginning to see the shape of your own power.',
            'The advance continues. Stay focused.',
        ],
        task_complete: [
            'Efficient. Not a single wasted movement. Rest now.',
            'Task complete. Breathe. Recover.',
        ],
        task_failed: [
            'Your focus drifted. You must control the mind before you control the body.',
            'The flow was broken. Center yourself. Try again.',
        ],
        sudden_quest: [
            'The environment has shifted. Adapt to it.',
            'A new challenge appears. Face it calmly.',
        ],
        penalty: [
            'Balance must be restored. Accept this burden to realign your spirit.',
            'A correction is needed. Embrace the discomfort.',
        ],
    },
    jack: {
        level_up: [
            'MORE. I NEED MORE. IT IS NOT ENOUGH.',
            'Stronger. But never strong enough. AGAIN.',
        ],
        task_complete: [
            'I would trade my tomorrow for this strength today.',
            'Suffering yields power. Continue.',
        ],
        task_failed: [
            'Pathology detected. Weakness is fatal. REMOVE IT.',
            'UNACCEPTABLE. The body must be pushed further.',
        ],
        sudden_quest: [
            'Pain incoming. Good. I was getting bored.',
            'More opportunity to destroy weakness.',
        ],
        penalty: [
            'Suffering is the only truth. Destroy the weakness.',
            'This is what I deserve. More. Always more.',
        ],
    },
};

export const getRandomQuote = (archetypeId: ArchetypeId, event: VoiceEvent): string => {
    const quotes = VOICE_QUOTES[archetypeId][event];
    return quotes[Math.floor(Math.random() * quotes.length)];
};
