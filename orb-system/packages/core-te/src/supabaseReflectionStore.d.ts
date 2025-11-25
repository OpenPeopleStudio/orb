/**
 * Supabase-backed Te Reflection Store
 *
 * Role: OrbRole.TE (reflection/memory)
 *
 * Supabase-backed persistent storage for Te reflections using PostgreSQL.
 */
import type { TeReflection } from './reflectionHelpers';
import type { TeReflectionStore } from './sqlStore';
/**
 * Supabase-backed Te reflection store
 * Uses Supabase PostgreSQL via the Supabase client
 */
export declare class SupabaseTeReflectionStore implements TeReflectionStore {
    private supabase;
    constructor(supabaseClient?: any);
    saveReflection(reflection: TeReflection, userId: string, sessionId?: string): Promise<void>;
    getReflections(userId: string, limit?: number): Promise<TeReflection[]>;
    getReflectionsBySession(sessionId: string, limit?: number): Promise<TeReflection[]>;
}
//# sourceMappingURL=supabaseReflectionStore.d.ts.map