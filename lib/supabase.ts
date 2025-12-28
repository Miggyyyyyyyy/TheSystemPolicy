import { createClient, SupabaseClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

// Get env vars safely
const supabaseUrl = Constants.expoConfig?.extra?.supabaseUrl ||
    (typeof process !== 'undefined' ? process.env?.EXPO_PUBLIC_SUPABASE_URL : '') || '';
const supabaseAnonKey = Constants.expoConfig?.extra?.supabaseAnonKey ||
    (typeof process !== 'undefined' ? process.env?.EXPO_PUBLIC_SUPABASE_ANON_KEY : '') || '';

// Check if we're in a browser environment
const isBrowser = Platform.OS === 'web' && typeof window !== 'undefined';

// Storage adapter
const storageAdapter = {
    getItem: async (key: string): Promise<string | null> => {
        try {
            if (isBrowser) {
                return window.localStorage.getItem(key);
            }
            return await AsyncStorage.getItem(key);
        } catch {
            return null;
        }
    },
    setItem: async (key: string, value: string): Promise<void> => {
        try {
            if (isBrowser) {
                window.localStorage.setItem(key, value);
                return;
            }
            await AsyncStorage.setItem(key, value);
        } catch { }
    },
    removeItem: async (key: string): Promise<void> => {
        try {
            if (isBrowser) {
                window.localStorage.removeItem(key);
                return;
            }
            await AsyncStorage.removeItem(key);
        } catch { }
    },
};

// Create Supabase client lazily
let _supabase: SupabaseClient | null = null;

export const getSupabase = (): SupabaseClient | null => {
    if (_supabase) return _supabase;

    if (!supabaseUrl || !supabaseAnonKey) {
        console.warn('Supabase credentials not found, using offline mode');
        return null;
    }

    _supabase = createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
            storage: storageAdapter,
            autoRefreshToken: isBrowser,
            persistSession: isBrowser,
            detectSessionInUrl: false,
        },
    });

    return _supabase;
};

// For backward compatibility
export const supabase = {
    get client() {
        return getSupabase();
    }
};

// Types
export interface DBProfile {
    id: string;
    username: string;
    archetype: string;
    level: number;
    xp: number;
    streak: number;
    discipline: number;
    vitality: number;
    intellect: number;
    spirit: number;
    created_at: string;
}

export interface DBTask {
    id: string;
    user_id: string;
    title: string;
    intent: string;
    time: string;
    duration: number;
    xp: number;
    completed: boolean;
    failed: boolean;
    date: string;
    instructions: string[];
}

export interface DBCalibration {
    id: string;
    user_id: string;
    wake_time: string;
    sleep_time: string;
    work_hours: string;
    training_access: string[];
}

// Auth helpers
export const signUp = async (email: string, password: string, username: string) => {
    const client = getSupabase();
    if (!client) return { data: null, error: new Error('Offline mode') };

    const { data, error } = await client.auth.signUp({
        email,
        password,
        options: { data: { username } },
    });
    return { data, error };
};

export const signIn = async (email: string, password: string) => {
    const client = getSupabase();
    if (!client) return { data: null, error: new Error('Offline mode') };

    const { data, error } = await client.auth.signInWithPassword({ email, password });
    return { data, error };
};

export const signOut = async () => {
    const client = getSupabase();
    if (!client) return { error: null };

    const { error } = await client.auth.signOut();
    return { error };
};

export const getCurrentUser = async () => {
    const client = getSupabase();
    if (!client) return null;

    const { data: { user } } = await client.auth.getUser();
    return user;
};

// Profile helpers
export const getProfile = async (userId: string): Promise<DBProfile | null> => {
    const client = getSupabase();
    if (!client) return null;

    const { data, error } = await client
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

    if (error) console.error('Error fetching profile:', error);
    return data;
};

export const upsertProfile = async (profile: Partial<DBProfile> & { id: string }) => {
    const client = getSupabase();
    if (!client) return { data: null, error: new Error('Offline mode') };

    const { data, error } = await client
        .from('profiles')
        .upsert(profile, { onConflict: 'id' })
        .select()
        .single();

    return { data, error };
};

// Tasks helpers
export const getTasks = async (userId: string, date: string): Promise<DBTask[]> => {
    const client = getSupabase();
    if (!client) return [];

    const { data, error } = await client
        .from('tasks')
        .select('*')
        .eq('user_id', userId)
        .eq('date', date)
        .order('time');

    if (error) console.error('Error fetching tasks:', error);
    return data || [];
};

export const upsertTasks = async (tasks: DBTask[]) => {
    const client = getSupabase();
    if (!client) return { error: new Error('Offline mode') };

    const { error } = await client.from('tasks').upsert(tasks, { onConflict: 'id' });
    return { error };
};

export const updateTask = async (taskId: string, updates: Partial<DBTask>) => {
    const client = getSupabase();
    if (!client) return { error: new Error('Offline mode') };

    const { error } = await client.from('tasks').update(updates).eq('id', taskId);
    return { error };
};

// Calibration helpers
export const getCalibration = async (userId: string): Promise<DBCalibration | null> => {
    const client = getSupabase();
    if (!client) return null;

    const { data, error } = await client
        .from('calibrations')
        .select('*')
        .eq('user_id', userId)
        .single();

    if (error && error.code !== 'PGRST116') console.error('Error fetching calibration:', error);
    return data;
};

export const upsertCalibration = async (calibration: DBCalibration) => {
    const client = getSupabase();
    if (!client) return { error: new Error('Offline mode') };

    const { error } = await client
        .from('calibrations')
        .upsert(calibration, { onConflict: 'user_id' });
    return { error };
};
