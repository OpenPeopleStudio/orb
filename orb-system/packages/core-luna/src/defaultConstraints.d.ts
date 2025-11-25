/**
 * Default Constraint Sets
 *
 * Role: OrbRole.LUNA (preferences/intent)
 *
 * Defines system-level default constraints that ship with Orb.
 * These are sensible defaults that users can override or extend.
 */
import { type Constraint, type ConstraintSet } from '@orb-system/core-orb';
/**
 * System-wide default constraints
 */
export declare function getSystemDefaultConstraints(): Constraint[];
/**
 * Mode-specific default constraint sets
 */
export declare function getModeDefaultConstraintSets(): ConstraintSet[];
/**
 * Get all default constraint sets (system + mode-specific)
 */
export declare function getAllDefaultConstraintSets(): ConstraintSet[];
/**
 * Initialize a constraint store with defaults
 */
export declare function initializeWithDefaults(store: {
    saveConstraintSet: (set: ConstraintSet) => Promise<void>;
}): Promise<void>;
//# sourceMappingURL=defaultConstraints.d.ts.map