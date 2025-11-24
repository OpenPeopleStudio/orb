import { OrbContext, OrbRole } from '@orb-system/core-orb';
export interface Reflection {
    role: OrbRole;
    summary: string;
    actions: string[];
    embeddingSeed: number[];
    emphasisColor: string;
}
export interface TeReflectionRecord {
    id: string;
    user_id: string;
    session_id: string | null;
    input: string;
    output: string;
    tags: string[];
    notes: string | null;
    created_at: string;
}
export declare const reflect: (context: OrbContext, signals: string[]) => Reflection;
/**
 * Convert Reflection to database record format
 */
export declare const toReflectionRecord: (reflection: Reflection, context: OrbContext, input: string, tags?: string[], notes?: string | null) => Omit<TeReflectionRecord, "created_at">;
//# sourceMappingURL=index.d.ts.map