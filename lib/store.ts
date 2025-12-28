import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ArchetypeId, ShadowStats, UserProfile } from '@/types';

interface UserState {
    profile: UserProfile | null;
    isOnboarded: boolean;

    // Actions
    setArchetype: (archetypeId: ArchetypeId) => void;
    addXP: (amount: number) => void;
    incrementStreak: () => void;
    resetStreak: () => void;
    logout: () => void;
}

const DEFAULT_STATS: ShadowStats = {
    vitality: 10,
    discipline: 10,
    intellect: 10,
    spirit: 10,
};

export const useUserStore = create<UserState>()(
    persist(
        (set, get) => ({
            profile: null,
            isOnboarded: false,

            setArchetype: (archetypeId: ArchetypeId) => {
                set({
                    isOnboarded: true,
                    profile: {
                        id: 'local-user',
                        username: 'Hunter',
                        archetype: archetypeId,
                        level: 1,
                        xp: 0,
                        stats: DEFAULT_STATS,
                        streak: 0,
                    },
                });
            },

            addXP: (amount: number) => {
                const { profile } = get();
                if (!profile) return;

                const newXP = profile.xp + amount;
                const xpToLevel = profile.level * 100; // Simple formula

                if (newXP >= xpToLevel) {
                    // LEVEL UP
                    set({
                        profile: {
                            ...profile,
                            xp: newXP - xpToLevel,
                            level: profile.level + 1,
                        },
                    });
                } else {
                    set({ profile: { ...profile, xp: newXP } });
                }
            },

            incrementStreak: () => {
                const { profile } = get();
                if (!profile) return;
                set({ profile: { ...profile, streak: profile.streak + 1 } });
            },

            resetStreak: () => {
                const { profile } = get();
                if (!profile) return;
                set({ profile: { ...profile, streak: 0 } });
            },

            logout: () => {
                set({ profile: null, isOnboarded: false });
            },
        }),
        {
            name: 'the-system-user-storage',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
