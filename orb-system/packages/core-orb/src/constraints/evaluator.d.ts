/**
 * Constraint Evaluator
 *
 * Core logic for evaluating actions against constraints.
 * This is the main entry point for constraint checking.
 */
import type { ActionContext, ActionDescriptor, ConstraintSet, ConstraintEvaluationResult } from './types';
/**
 * Evaluate an action against a set of constraints
 *
 * @param action - The action to evaluate
 * @param context - The context in which the action is being performed
 * @param constraintSets - The constraint sets to evaluate against (ordered by priority)
 * @returns Evaluation result indicating whether the action is allowed
 */
export declare function evaluateAction(action: ActionDescriptor, context: ActionContext, constraintSets: ConstraintSet[]): ConstraintEvaluationResult;
/**
 * Collect applicable constraint sets for a context
 *
 * Fetches constraint sets from storage that apply to the current context.
 */
export declare function collectConstraintSets(context: ActionContext): Promise<ConstraintSet[]>;
//# sourceMappingURL=evaluator.d.ts.map