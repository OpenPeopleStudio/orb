/**
 * Constraint Evaluator
 * 
 * Core logic for evaluating actions against constraints.
 * This is the main entry point for constraint checking.
 */

import type {
  ActionContext,
  ActionDescriptor,
  Constraint,
  ConstraintSet,
  ConstraintEvaluationResult,
  TriggeredConstraint,
  RiskLevel,
} from './types';

/**
 * Evaluate an action against a set of constraints
 * 
 * @param action - The action to evaluate
 * @param context - The context in which the action is being performed
 * @param constraintSets - The constraint sets to evaluate against (ordered by priority)
 * @returns Evaluation result indicating whether the action is allowed
 */
export function evaluateAction(
  action: ActionDescriptor,
  context: ActionContext,
  constraintSets: ConstraintSet[]
): ConstraintEvaluationResult {
  const triggeredConstraints: TriggeredConstraint[] = [];
  const reasons: string[] = [];
  const recommendations: string[] = [];
  
  let decision: 'allow' | 'deny' | 'require_confirmation' = 'allow';
  let effectiveRisk: RiskLevel = action.estimatedRisk || 'low';
  
  // Sort constraint sets by priority (highest first)
  const sortedSets = [...constraintSets].sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0));
  
  // Evaluate each constraint set
  for (const constraintSet of sortedSets) {
    for (const constraint of constraintSet.constraints) {
      if (!constraint.active) continue;
      
      // Check if constraint applies to this context
      if (!doesConstraintApply(constraint, context, action)) {
        continue;
      }
      
      // Evaluate the constraint
      const violation = checkConstraintViolation(constraint, action, context);
      
      if (violation) {
        triggeredConstraints.push({
          constraintId: constraint.id,
          constraintType: constraint.type || 'other',
          severity: constraint.severity,
          reason: violation.reason,
          metadata: violation.metadata,
        });
        
        reasons.push(violation.reason);
        
        // Determine decision based on severity
        if (constraint.severity === 'critical' || constraint.type === 'block_action' || constraint.type === 'block_tool') {
          decision = 'deny';
        } else if (constraint.severity === 'error' && decision !== 'deny') {
          decision = 'require_confirmation';
        }
        
        // Add recommendation if available
        if (violation.recommendation) {
          recommendations.push(violation.recommendation);
        }
      }
    }
  }
  
  // If no constraints triggered, allow the action
  if (triggeredConstraints.length === 0) {
    reasons.push('No constraints violated');
    decision = 'allow';
  }
  
  const allowed = decision === 'allow';
  
  return {
    allowed,
    decision,
    reasons,
    triggeredConstraints,
    effectiveRisk,
    recommendations: recommendations.length > 0 ? recommendations : undefined,
  };
}

/**
 * Check if a constraint applies to the current context
 */
function doesConstraintApply(
  constraint: Constraint,
  context: ActionContext,
  action: ActionDescriptor
): boolean {
  // Check mode scope
  if (constraint.appliesToModes && !constraint.appliesToModes.includes(context.mode)) {
    return false;
  }
  
  // Check persona scope
  if (constraint.appliesToPersonas && !constraint.appliesToPersonas.includes(context.persona)) {
    return false;
  }
  
  // Check device scope
  if (constraint.appliesToDevices && context.device && !constraint.appliesToDevices.includes(context.device)) {
    return false;
  }
  
  // Check role scope
  if (constraint.appliesToRoles && !constraint.appliesToRoles.includes(action.role)) {
    return false;
  }
  
  // Check feature scope
  if (constraint.appliesToFeatures && context.feature && !constraint.appliesToFeatures.includes(context.feature)) {
    return false;
  }
  
  return true;
}

/**
 * Check if a constraint is violated
 * 
 * Returns null if not violated, or violation details if violated
 */
function checkConstraintViolation(
  constraint: Constraint,
  action: ActionDescriptor,
  context: ActionContext
): { reason: string; recommendation?: string; metadata?: Record<string, unknown> } | null {
  switch (constraint.type) {
    case 'block_action':
      if (constraint.actionId === action.id) {
        return {
          reason: `Action ${action.id} is blocked by constraint ${constraint.id}`,
          recommendation: 'This action is not allowed in the current context',
        };
      }
      break;
      
    case 'block_tool':
      if (constraint.toolId === action.toolId) {
        return {
          reason: `Tool ${action.toolId} is blocked by constraint ${constraint.id}`,
          recommendation: constraint.reason || 'Try using an alternative tool',
        };
      }
      break;
      
    case 'max_risk':
      if (constraint.maxRisk) {
        const riskLevels: RiskLevel[] = ['low', 'medium', 'high', 'critical'];
        const actionRiskIndex = riskLevels.indexOf(action.estimatedRisk || 'low');
        const maxRiskIndex = riskLevels.indexOf(constraint.maxRisk);
        
        if (actionRiskIndex > maxRiskIndex) {
          return {
            reason: `Action risk (${action.estimatedRisk}) exceeds maximum allowed (${constraint.maxRisk})`,
            recommendation: 'Consider a lower-risk approach or request approval',
          };
        }
      }
      break;
      
    case 'require_confirmation':
      return {
        reason: constraint.reason || 'This action requires confirmation',
        recommendation: 'Review and confirm before proceeding',
      };
      
    case 'persona_mismatch':
      if (constraint.requiredPersona && context.persona !== constraint.requiredPersona) {
        return {
          reason: `Action requires persona ${constraint.requiredPersona}, but current persona is ${context.persona}`,
          recommendation: `Switch to ${constraint.requiredPersona} persona to perform this action`,
        };
      }
      break;
      
    case 'device_restriction':
      if (constraint.appliesToDevices && context.device && !constraint.appliesToDevices.includes(context.device)) {
        return {
          reason: `Action not allowed on device ${context.device}`,
          recommendation: `This action is only allowed on: ${constraint.appliesToDevices.join(', ')}`,
        };
      }
      break;
      
    default:
      // For 'other' or unknown types, check if description suggests a violation
      // This is extensible for custom constraint logic
      break;
  }
  
  return null;
}

/**
 * Collect applicable constraint sets for a context
 * 
 * Fetches constraint sets from storage that apply to the current context.
 */
export async function collectConstraintSets(context: ActionContext): Promise<ConstraintSet[]> {
  // Import here to avoid circular dependency
  const { getConstraintStore } = await import('./storage');
  const store = getConstraintStore();
  return store.getConstraintSets(context);
}

