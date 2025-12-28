import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface CalibrationData {
    wakeTime: string;
    sleepTime: string;
    workHours: string;
    trainingAccess: ('gym' | 'home' | 'dojo')[];
}

export interface SettingsData {
    notifications: boolean;
    voiceEnabled: boolean;
    focusLock: boolean;
    haptics: boolean;
    soundEffects: boolean;
    suddenQuests: boolean;
}

interface SettingsState {
    calibration: CalibrationData | null;
    settings: SettingsData;
    isCalibrated: boolean;

    // Actions
    setCalibration: (data: CalibrationData) => void;
    updateSettings: (data: Partial<SettingsData>) => void;
    resetAll: () => void;
}

const DEFAULT_SETTINGS: SettingsData = {
    notifications: true,
    voiceEnabled: true,
    focusLock: false,
    haptics: true,
    soundEffects: true,
    suddenQuests: true,
};

export const useSettingsStore = create<SettingsState>()(
    persist(
        (set) => ({
            calibration: null,
            settings: DEFAULT_SETTINGS,
            isCalibrated: false,

            setCalibration: (data: CalibrationData) => {
                set({ calibration: data, isCalibrated: true });
            },

            updateSettings: (data: Partial<SettingsData>) => {
                set((state) => ({
                    settings: { ...state.settings, ...data },
                }));
            },

            resetAll: () => {
                set({
                    calibration: null,
                    settings: DEFAULT_SETTINGS,
                    isCalibrated: false,
                });
            },
        }),
        {
            name: 'the-system-settings-storage',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
