/**
 * Mode Transitions
 *
 * Logic for validating and executing mode transitions.
 * Ensures transitions respect constraints and contextual rules.
 */
import type { ModeTransitionRequest, ModeTransitionResult, ActionContext, ConstraintSet } from './types';
import { OrbMode } from '../identity/types';
/**
 * Validate a mode transition request
 *
 * Checks if transitioning from one mode to another is allowed
 * based on context and constraints.
 */
export declare function validateModeTransition(request: ModeTransitionRequest, constraintSets: ConstraintSet[]): ModeTransitionResult;
/**
 * Check if a mode transition is allowed
 *
 * Simpler API that returns a boolean.
 */
export declare function canTransitionMode(fromMode: OrbMode, toMode: OrbMode, context: ActionContext, constraintSets?: ConstraintSet[]): boolean;
/**
 * Get common denial reasons for mode transitions
 *
 * Provides user-friendly explanations for why a transition might be blocked.
 */
export declare function getModeTransitionDenialReasons(): Record<string, string>;
/**
 * Get recommended mode based on context
 *
 * TODO: PERSONA_AGENT - Integrate with persona classification
 */
export declare function getRecommendedMode(context: ActionContext): OrbMode;
//# sourceMappingURL=modeTransitions.d.ts.map