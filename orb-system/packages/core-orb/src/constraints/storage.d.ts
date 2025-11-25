/**
 * Constraint Storage
 *
 * Persistent storage for constraint sets.
 * Supports in-memory, file-based, and SQL-based storage.
 */
import type { ConstraintSet, ActionContext } from './types';
import type { OrbMode, OrbPersona } from '../identity/types';
/**
 * Constraint Store Interface
 */
export interface ConstraintStore {
    getConstraintSets(context: ActionContext): Promise<ConstraintSet[]>;
    getConstraintSetsByMode(mode: OrbMode): Promise<ConstraintSet[]>;
    getConstraintSetsByPersona(persona: OrbPersona): Promise<ConstraintSet[]>;
    saveConstraintSet(constraintSet: ConstraintSet): Promise<void>;
    deleteConstraintSet(id: string): Promise<void>;
}
/**
 * In-Memory Constraint Store
 *
 * Simple implementation that stores constraints in memory.
 * Useful for testing and development.
 */
export declare class InMemoryConstraintStore implements ConstraintStore {
    private constraintSets;
    getConstraintSets(context: ActionContext): Promise<ConstraintSet[]>;
    getConstraintSetsByMode(mode: OrbMode): Promise<ConstraintSet[]>;
    getConstraintSetsByPersona(persona: OrbPersona): Promise<ConstraintSet[]>;
    saveConstraintSet(constraintSet: ConstraintSet): Promise<void>;
    deleteConstraintSet(id: string): Promise<void>;
}
/**
 * Load default constraint sets from mode descriptors
 *
 * Parses the `defaultConstraints` strings from mode descriptors
 * and creates ConstraintSet objects.
 */
export declare function loadDefaultConstraintSets(): ConstraintSet[];
/**
 * Initialize the global constraint store
 */
export declare function initializeConstraintStore(store?: ConstraintStore): void;
/**
 * Get the global constraint store
 */
export declare function getConstraintStore(): ConstraintStore;
/**
 * Reset the global constraint store (useful for testing)
 */
export declare function resetConstraintStore(): void;
//# sourceMappingURL=storage.d.ts.map