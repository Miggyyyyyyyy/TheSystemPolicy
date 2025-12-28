import { Redirect } from 'expo-router';
import { useUserStore } from '@/lib/store';
import { useSettingsStore } from '@/lib/settingsStore';

export default function Index() {
    const isOnboarded = useUserStore((state) => state.isOnboarded);
    const isCalibrated = useSettingsStore((state) => state.isCalibrated);

    // Already onboarded and calibrated -> go to tabs
    if (isOnboarded && isCalibrated) {
        return <Redirect href="/(tabs)" />;
    }

    // Onboarded but not calibrated -> go to calibration
    if (isOnboarded && !isCalibrated) {
        return <Redirect href="/calibration" />;
    }

    // Not onboarded -> show intro
    return <Redirect href="/intro" />;
}
