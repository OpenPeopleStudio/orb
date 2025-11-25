/**
 * File-backed Luna Preferences Store
 *
 * Role: OrbRole.LUNA (preferences/intent)
 *
 * File-based persistent storage for Luna profiles using JSON files.
 */
import type { LunaModeId, LunaProfile } from './types';
import type { LunaPreferencesStore } from './preferencesStore';
export declare class FileLunaPreferencesStore implements LunaPreferencesStore {
    private readonly filePath;
    private getData;
    private saveData;
    getProfile(userId: string, modeId: LunaModeId): Promise<LunaProfile | null>;
    getOrCreateProfile(userId: string, modeId: LunaModeId): Promise<LunaProfile>;
    saveProfile(profile: LunaProfile): Promise<void>;
    getActiveMode(userId: string): Promise<LunaModeId>;
    setActiveMode(userId: string, modeId: LunaModeId): Promise<void>;
    listModes(userId: string): Promise<LunaModeId[]>;
}
//# sourceMappingURL=filePreferencesStore.d.ts.map