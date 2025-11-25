import type { LunaModeId, LunaProfile } from './types';
export interface LunaPreferencesStore {
    getProfile(userId: string, modeId: LunaModeId): Promise<LunaProfile | null>;
    getOrCreateProfile(userId: string, modeId: LunaModeId): Promise<LunaProfile>;
    saveProfile(profile: LunaProfile): Promise<void>;
    getActiveMode(userId: string): Promise<LunaModeId>;
    setActiveMode(userId: string, modeId: LunaModeId): Promise<void>;
    listModes(userId: string): Promise<LunaModeId[]>;
}
export declare class InMemoryLunaPreferencesStore implements LunaPreferencesStore {
    private profiles;
    private activeModes;
    getProfile(userId: string, modeId: LunaModeId): Promise<LunaProfile | null>;
    getOrCreateProfile(userId: string, modeId: LunaModeId): Promise<LunaProfile>;
    saveProfile(profile: LunaProfile): Promise<void>;
    getActiveMode(userId: string): Promise<LunaModeId>;
    setActiveMode(userId: string, modeId: LunaModeId): Promise<void>;
    listModes(userId: string): Promise<LunaModeId[]>;
}
//# sourceMappingURL=preferencesStore.d.ts.map