/**
 * SQLite Luna Preferences Store
 *
 * Persistent storage for Luna profiles using SQLite.
 */
import type { LunaModeId, LunaProfile } from './types';
import type { LunaPreferencesStore } from './preferencesStore';
export declare class SqlLunaPreferencesStore implements LunaPreferencesStore {
    private db;
    constructor(db: any);
    getProfile(userId: string, modeId: LunaModeId): Promise<LunaProfile | null>;
    getOrCreateProfile(userId: string, modeId: LunaModeId): Promise<LunaProfile>;
    saveProfile(profile: LunaProfile): Promise<void>;
    getActiveMode(userId: string): Promise<LunaModeId>;
    setActiveMode(userId: string, modeId: LunaModeId): Promise<void>;
    listModes(userId: string): Promise<LunaModeId[]>;
}
//# sourceMappingURL=sqlStore.d.ts.map