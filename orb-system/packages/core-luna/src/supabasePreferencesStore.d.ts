/**
 * Supabase-backed Luna Preferences Store
 *
 * Role: OrbRole.LUNA (preferences/intent)
 *
 * Supabase-backed persistent storage for Luna profiles using PostgreSQL.
 */
import type { LunaModeId, LunaProfile } from './types';
import type { LunaPreferencesStore } from './preferencesStore';
/**
 * Supabase-backed Luna preferences store
 * Uses Supabase PostgreSQL via the Supabase client
 */
export declare class SupabaseLunaPreferencesStore implements LunaPreferencesStore {
    private supabase;
    constructor(supabaseClient?: any);
    getProfile(userId: string, modeId: LunaModeId): Promise<LunaProfile | null>;
    getOrCreateProfile(userId: string, modeId: LunaModeId): Promise<LunaProfile>;
    saveProfile(profile: LunaProfile): Promise<void>;
    getActiveMode(userId: string): Promise<LunaModeId>;
    setActiveMode(userId: string, modeId: LunaModeId): Promise<void>;
    listModes(userId: string): Promise<LunaModeId[]>;
}
//# sourceMappingURL=supabasePreferencesStore.d.ts.map