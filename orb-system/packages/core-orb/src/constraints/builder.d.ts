/**
 * Constraint Builder
 *
 * Helper functions for building constraint sets from configuration.
 */
import type { Constraint, ConstraintSet, ConstraintSeverity, RiskLevel } from './types';
import type { OrbMode, OrbPersona, OrbDevice } from '../identity/types';
import type { OrbRole } from '../orbRoles';
/**
 * Create a constraint set
 */
export declare function createConstraintSet(name: string, constraints: Constraint[], options?: {
    id?: string;
    description?: string;
    priority?: number;
    metadata?: Record<string, unknown>;
}): ConstraintSet;
/**
 * Create a block tool constraint
 */
export declare function blockTool(toolId: string, options?: {
    id?: string;
    description?: string;
    reason?: string;
    severity?: ConstraintSeverity;
    appliesToModes?: OrbMode[];
    appliesToPersonas?: OrbPersona[];
}): Constraint;
/**
 * Create a max risk constraint
 */
export declare function maxRisk(maxRisk: RiskLevel, options?: {
    id?: string;
    description?: string;
    reason?: string;
    severity?: ConstraintSeverity;
    appliesToModes?: OrbMode[];
    appliesToRoles?: OrbRole[];
}): Constraint;
/**
 * Create a require confirmation constraint
 */
export declare function requireConfirmation(description: string, options?: {
    id?: string;
    reason?: string;
    appliesToModes?: OrbMode[];
    appliesToRoles?: OrbRole[];
}): Constraint;
/**
 * Create a mode transition constraint
 */
export declare function restrictModeTransition(allowedModes: OrbMode[], options?: {
    id?: string;
    description?: string;
    reason?: string;
    appliesToModes?: OrbMode[];
}): Constraint;
/**
 * Create a persona mismatch constraint
 */
export declare function requirePersona(requiredPersona: OrbPersona, options?: {
    id?: string;
    description?: string;
    reason?: string;
    appliesToModes?: OrbMode[];
}): Constraint;
/**
 * Create a device restriction constraint
 */
export declare function restrictToDevices(allowedDevices: OrbDevice[], options?: {
    id?: string;
    description?: string;
    reason?: string;
}): Constraint;
/**
 * Parse constraint strings from mode descriptors into Constraint objects
 *
 * This handles the `defaultConstraints` arrays from mode descriptors
 * which are currently string-based (e.g. "no-destructive-actions").
 *
 * TODO: CORE_ORB_AGENT - Expand this mapping as needed
 */
export declare function parseConstraintString(constraintStr: string, mode?: OrbMode): Constraint | null;
//# sourceMappingURL=builder.d.ts.map