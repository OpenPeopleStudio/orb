/**
 * Action Evaluator
 *
 * Role: OrbRole.LUNA (preferences/intent)
 *
 * Evaluates actions against user preferences and constraints.
 */
import { type OrbContext } from '@orb-system/core-orb';
import type { LunaActionDescriptor, LunaDecision } from './types';
/**
 * Evaluate an action against user preferences and constraints
 */
export declare function evaluateActionWithDefaults(ctx: OrbContext, action: LunaActionDescriptor): Promise<LunaDecision>;
//# sourceMappingURL=actionEvaluator.d.ts.map