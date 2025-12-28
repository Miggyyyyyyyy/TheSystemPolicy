import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ShadowStats } from '@/types';

interface StatsState {
    dailyXP: number;
    weeklyXP: number;
    totalXP: number;
    completedTasks: number;
    failedTasks: number;
    currentStreak: number;
    longestStreak: number;
    lastActiveDate: string | null;

    // Actions
    addDailyXP: (amount: number) => void;
    recordTaskComplete: () => void;
    recordTaskFail: () => void;
    checkStreak: () => void;
    resetDailyStats: () => void;
}

export const useStatsStore = create<StatsState>()(
    persist(
        (set, get) => ({
            dailyXP: 0,
            weeklyXP: 0,
            totalXP: 0,
            completedTasks: 0,
            failedTasks: 0,
            currentStreak: 0,
            longestStreak: 0,
            lastActiveDate: null,

            addDailyXP: (amount: number) => {
                set((state) => ({
                    dailyXP: state.dailyXP + amount,
                    weeklyXP: state.weeklyXP + amount,
                    totalXP: state.totalXP + amount,
                }));
            },

            recordTaskComplete: () => {
                set((state) => ({
                    completedTasks: state.completedTasks + 1,
                }));
            },

            recordTaskFail: () => {
                set((state) => ({
                    failedTasks: state.failedTasks + 1,
                }));
            },

            checkStreak: () => {
                const { lastActiveDate, currentStreak, longestStreak } = get();
                const today = new Date().toISOString().split('T')[0];

                if (lastActiveDate === today) {
                    // Already active today
                    return;
                }

                if (lastActiveDate) {
                    const lastDate = new Date(lastActiveDate);
                    const todayDate = new Date(today);
                    const diffTime = todayDate.getTime() - lastDate.getTime();
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                    if (diffDays === 1) {
                        // Consecutive day
                        const newStreak = currentStreak + 1;
                        set({
                            currentStreak: newStreak,
                            longestStreak: Math.max(longestStreak, newStreak),
                            lastActiveDate: today,
                        });
                    } else {
                        // Streak broken
                        set({
                            currentStreak: 1,
                            lastActiveDate: today,
                        });
                    }
                } else {
                    // First activity
                    set({
                        currentStreak: 1,
                        lastActiveDate: today,
                    });
                }
            },

            resetDailyStats: () => {
                set({ dailyXP: 0 });
            },
        }),
        {
            name: 'the-system-stats-storage',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);

// Calculate Shadow Stats based on completed task intents
export const calculateShadowStats = (
    baseStats: ShadowStats,
    completedIntents: { vitality: number; discipline: number; intellect: number; spirit: number }
): ShadowStats => {
    return {
        vitality: baseStats.vitality + Math.floor(completedIntents.vitality / 3),
        discipline: baseStats.discipline + Math.floor(completedIntents.discipline / 3),
        intellect: baseStats.intellect + Math.floor(completedIntents.intellect / 3),
        spirit: baseStats.spirit + Math.floor(completedIntents.spirit / 3),
    };
};
