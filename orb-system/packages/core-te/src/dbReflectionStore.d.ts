/**
 * Database-backed Te Reflection Store
 *
 * Role: OrbRole.TE (reflection/memory)
 *
 * Database-backed persistent storage for Te reflections using SQLite.
 * This is a wrapper around SqlTeReflectionStore that uses the shared database instance.
 */
import type { TeReflectionStore } from './sqlStore';
/**
 * Database-backed Te reflection store
 * Uses SQLite via the shared database instance from core-orb
 */
export declare class DbTeReflectionStore implements TeReflectionStore {
    private store;
    constructor(db?: any);
    saveReflection(reflection: import('./reflectionHelpers').TeReflection, userId: string, sessionId?: string): Promise<void>;
    getReflections(userId: string, limit?: number): Promise<import('./reflectionHelpers').TeReflection[]>;
    getReflectionsBySession(sessionId: string, limit?: number): Promise<import('./reflectionHelpers').TeReflection[]>;
}
//# sourceMappingURL=dbReflectionStore.d.ts.map