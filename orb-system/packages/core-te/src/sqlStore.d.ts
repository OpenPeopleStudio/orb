/**
 * SQLite Te Reflection Store
 *
 * Persistent storage for Te reflections using SQLite.
 */
import type { TeReflection } from './reflectionHelpers';
export interface TeReflectionStore {
    saveReflection(reflection: TeReflection, userId: string, sessionId?: string): Promise<void>;
    getReflections(userId: string, limit?: number): Promise<TeReflection[]>;
    getReflectionsBySession(sessionId: string, limit?: number): Promise<TeReflection[]>;
}
export declare class SqlTeReflectionStore implements TeReflectionStore {
    private db;
    constructor(db: any);
    saveReflection(reflection: TeReflection, userId: string, sessionId?: string): Promise<void>;
    getReflections(userId: string, limit?: number): Promise<TeReflection[]>;
    getReflectionsBySession(sessionId: string, limit?: number): Promise<TeReflection[]>;
}
//# sourceMappingURL=sqlStore.d.ts.map