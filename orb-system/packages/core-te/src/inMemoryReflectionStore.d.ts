/**
 * In-Memory Te Reflection Store
 *
 * Role: OrbRole.TE (reflection/memory)
 *
 * In-memory storage for Te reflections (useful for tests and ephemeral sessions).
 */
import type { TeReflection } from './reflectionHelpers';
import type { TeReflectionStore } from './sqlStore';
export declare class InMemoryTeReflectionStore implements TeReflectionStore {
    private reflections;
    saveReflection(reflection: TeReflection, userId: string, sessionId?: string): Promise<void>;
    getReflections(userId: string, limit?: number): Promise<TeReflection[]>;
    getReflectionsBySession(sessionId: string, limit?: number): Promise<TeReflection[]>;
    /**
     * Clear all reflections (useful for testing)
     */
    clear(): void;
    /**
     * Get total reflection count (useful for testing/debugging)
     */
    getTotalCount(): number;
}
//# sourceMappingURL=inMemoryReflectionStore.d.ts.map