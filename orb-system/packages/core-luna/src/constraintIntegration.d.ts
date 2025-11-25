/**
 * Luna Constraint Integration
 *
 * Integrates Luna's preference-based constraints with the core constraint system.
 * This provides a bridge between Luna profiles and core-orb constraint evaluation.
 */
import { type Constraint, type ConstraintSet, type ActionContext, type ConstraintEvaluationResult } from '@orb-system/core-orb';
import type { LunaProfile, LunaConstraint, LunaActionDescriptor } from './types';
/**
 * Convert Luna constraint to core Constraint
 */
export declare function lunaConstraintToCoreConstraint(lunaConstraint: LunaConstraint): Constraint;
/**
 * Convert Luna profile to core ConstraintSet
 */
export declare function lunaProfileToConstraintSet(profile: LunaProfile): ConstraintSet;
/**
 * Convert Luna action descriptor to core ActionContext
 */
export declare function lunaActionToActionContext(action: LunaActionDescriptor, additionalContext?: {
    userId?: string;
    sessionId?: string;
    deviceId?: string;
    mode?: string;
    persona?: string;
}): ActionContext;
/**
 * Evaluate action using Luna profile and core constraint system
 */
export declare function evaluateActionWithLunaProfile(action: LunaActionDescriptor, profile: LunaProfile, additionalContext?: {
    userId?: string;
    sessionId?: string;
    deviceId?: string;
    mode?: string;
    persona?: string;
}): ConstraintEvaluationResult;
//# sourceMappingURL=constraintIntegration.d.ts.map