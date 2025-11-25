/**
 * File-backed Te Reflection Store
 *
 * Role: OrbRole.TE (reflection/memory)
 *
 * File-based persistent storage for Te reflections using JSON files.
 */
import type { TeReflection } from './reflectionHelpers';
import type { TeReflectionStore } from './sqlStore';
export declare class FileTeReflectionStore implements TeReflectionStore {
    private readonly filePath;
    private getData;
    private saveData;
    saveReflection(reflection: TeReflection, userId: string, sessionId?: string): Promise<void>;
    getReflections(userId: string, limit?: number): Promise<TeReflection[]>;
    getReflectionsBySession(sessionId: string, limit?: number): Promise<TeReflection[]>;
}
//# sourceMappingURL=fileReflectionStore.d.ts.map