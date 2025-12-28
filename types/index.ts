export type ArchetypeId = 'yujiro' | 'baki' | 'ohma' | 'jack';

export interface ShadowStats {
    vitality: number;
    discipline: number;
    intellect: number;
    spirit: number;
}

export interface Archetype {
    id: ArchetypeId;
    name: string;
    epithet: string; // e.g. "The Ogre"
    description: string;
    doctrine: string; // The "Rule" they live by
    color: string;
    image: any; // Placeholder for require()
    quote: string; // The "Voice" line
    requirements: string[]; // "Daily Pain", "No Excuses"
}

export interface UserProfile {
    id: string;
    username: string;
    archetype: ArchetypeId | null;
    level: number;
    xp: number;
    stats: ShadowStats;
    streak: number;
}
