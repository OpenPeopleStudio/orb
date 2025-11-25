/**
 * Te Reflection Helpers
 *
 * Types and utilities for Te reflections.
 */
import { type OrbContext } from '@orb-system/core-orb';
/**
 * Te Reflection - represents a reflection on a run/action
 */
export interface TeReflection {
    id: string;
    input: string;
    output: string;
    tags: string[];
    notes?: string;
    createdAt: Date;
}
/**
 * Create a Te reflection from context and data
 */
export declare function createTeReflection(context: OrbContext, data: {
    input: string;
    output: string;
    tags: string[];
    notes?: string;
}): TeReflection;
//# sourceMappingURL=reflectionHelpers.d.ts.map