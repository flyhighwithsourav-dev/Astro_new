export interface UserProfile {
    id: string;
    name: string;
    birthDate: string; // YYYY-MM-DD
    birthTime: string; // HH:MM
    latitude: number;
    longitude: number;
    locationName: string;
    createdAt: string;
}

export interface AppSettings {
    system: 'vedic' | 'western';
    houseSystem: 'whole_sign' | 'equal_house';
    chartStyle: 'north_indian' | 'south_indian' | 'circular';
}

const DEFAULT_SETTINGS: AppSettings = {
    system: 'vedic',
    houseSystem: 'whole_sign',
    chartStyle: 'north_indian'
};

const PROFILES_KEY = 'astro_astrology_profiles';
const SETTINGS_KEY = 'astro_astrology_settings';

/**
 * Gets all saved profiles from localStorage.
 * Safe to call during SSR (returns empty array).
 */
export function getSavedProfiles(): UserProfile[] {
    if (typeof window === 'undefined') return [];
    try {
        const stored = localStorage.getItem(PROFILES_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch (e) {
        console.error("Failed to load profiles:", e);
        return [];
    }
}

/**
 * Saves a profile to localStorage.
 */
export function saveProfile(profile: Omit<UserProfile, 'id' | 'createdAt'>): UserProfile {
    const profiles = getSavedProfiles();
    const newProfile: UserProfile = {
        ...profile,
        id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 11),
        createdAt: new Date().toISOString()
    };
    
    profiles.push(newProfile);
    if (typeof window !== 'undefined') {
        localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles));
    }
    return newProfile;
}

/**
 * Deletes a profile by ID.
 */
export function deleteProfile(id: string): void {
    const profiles = getSavedProfiles();
    const updated = profiles.filter(p => p.id !== id);
    if (typeof window !== 'undefined') {
        localStorage.setItem(PROFILES_KEY, JSON.stringify(updated));
    }
}

/**
 * Gets app settings.
 * Safe to call during SSR (returns default settings).
 */
export function getAppSettings(): AppSettings {
    if (typeof window === 'undefined') return DEFAULT_SETTINGS;
    try {
        const stored = localStorage.getItem(SETTINGS_KEY);
        return stored ? { ...DEFAULT_SETTINGS, ...JSON.parse(stored) } : DEFAULT_SETTINGS;
    } catch (e) {
        console.error("Failed to load settings:", e);
        return DEFAULT_SETTINGS;
    }
}

/**
 * Saves app settings.
 */
export function saveAppSettings(settings: Partial<AppSettings>): void {
    const current = getAppSettings();
    const updated = { ...current, ...settings };
    if (typeof window !== 'undefined') {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));
    }
}
