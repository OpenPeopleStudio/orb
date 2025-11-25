/**
 * Database-backed Luna Preferences Store
 *
 * Role: OrbRole.LUNA (preferences/intent)
 *
 * Database-backed persistent storage for Luna profiles using SQLite.
 * This is a wrapper around SqlLunaPreferencesStore that uses the shared database instance.
 */
import type { LunaPreferencesStore } from './preferencesStore';
/**
 * Database-backed Luna preferences store
 * Uses SQLite via the shared database instance from core-orb
 */
export declare class DbLunaPreferencesStore implements LunaPreferencesStore {
    private store;
    constructor(db?: any);
    getProfile(userId: string, modeId: import('./types').LunaModeId): Promise<import('./types').LunaProfile | null>;
    getOrCreateProfile(userId: string, modeId: import('./types').LunaModeId): Promise<import('./types').LunaProfile>;
    saveProfile(profile: import('./types').LunaProfile): Promise<void>;
    getActiveMode(userId: string): Promise<import('./types').LunaModeId>;
    setActiveMode(userId: string, modeId: import('./types').LunaModeId): Promise<void>;
    listModes(userId: string): Promise<import('./types').LunaModeId[]>;
}
//# sourceMappingURL=dbPreferencesStore.d.ts.map