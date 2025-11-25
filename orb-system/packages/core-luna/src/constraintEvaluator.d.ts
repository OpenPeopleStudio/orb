/**
 * Constraint Evaluator Implementation
 *
 * Role: OrbRole.LUNA (preferences/intent)
 *
 * Implements the IConstraintEvaluator interface for evaluating actions
 * and mode transitions against user-defined and system constraints.
 */
import { type ActionContext, type Constraint, type ConstraintSet, type ConstraintEvaluationResult, type ModeTransitionContext, type ModeTransitionResult, type IConstraintEvaluator } from '@orb-system/core-orb';
import type { IConstraintStore } from './constraintStore';
/**
 * Default Constraint Evaluator
 *
 * Evaluates actions and mode transitions against constraint sets.
 */
export declare class DefaultConstraintEvaluator implements IConstraintEvaluator {
    private store;
    constructor(store: IConstraintStore);
    /**
     * Evaluate an action against all relevant constraints
     */
    evaluateAction(context: ActionContext, constraintSets?: ConstraintSet[]): Promise<ConstraintEvaluationResult>;
    /**
     * Validate a mode transition
     */
    validateModeTransition(context: ModeTransitionContext): Promise<ModeTransitionResult>;
    /**
     * Get all active constraints for a given context
     */
    getActiveConstraints(userId: string | null, mode: string, persona?: string): Promise<Constraint[]>;
    /**
     * Collect active constraints from sets, filtering by applicability
     */
    private collectActiveConstraints;
    /**
     * Evaluate a single constraint against an action context
     */
    private evaluateSingleConstraint;
    /**
     * Check if an action's risk level is within allowed limits
     */
    private isRiskAllowed;
    /**
     * Check if current time is within allowed window
     */
    private isInTimeWindow;
    /**
     * Assess effective risk based on base risk and number of risk factors
     */
    private assessEffectiveRisk;
    /**
     * Check persona-mode compatibility
     */
    private checkPersonaModeCompatibility;
    /**
     * Check device-mode compatibility
     */
    private checkDeviceModeCompatibility;
}
/**
 * Helper function for creating an evaluator with default store
 */
export declare function createConstraintEvaluator(store: IConstraintStore): Promise<DefaultConstraintEvaluator>;
//# sourceMappingURL=constraintEvaluator.d.ts.map