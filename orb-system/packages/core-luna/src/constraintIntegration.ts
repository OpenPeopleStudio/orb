/**
 * Luna Constraint Integration
 * 
 * Integrates Luna's preference-based constraints with the core constraint system.
 * This provides a bridge between Luna profiles and core-orb constraint evaluation.
 */

import {
  type Constraint,
  type ConstraintSet,
  type ActionContext,
  type ConstraintEvaluationResult,
  evaluateAction as coreEvaluateAction,
  createConstraintSet,
  constraint as constraintBuilder,
  OrbMode,
} from '@orb-system/core-orb';
import type { LunaProfile, LunaConstraint, LunaActionDescriptor } from './types';

/**
 * Convert Luna constraint to core Constraint
 */
export function lunaConstraintToCoreConstraint(lunaConstraint: LunaConstraint): Constraint {
  const builder = constraintBuilder(lunaConstraint.id);
  
  builder.description(lunaConstraint.description || 'Luna constraint');
  builder.active(lunaConstraint.active);
  
  // Map constraint type
  switch (lunaConstraint.type) {
    case 'block_tool':
      if (lunaConstraint.toolId) {
        builder.blockTool(lunaConstraint.toolId);
      }
      builder.severity('hard');
      break;
      
    case 'max_risk':
      if (lunaConstraint.maxRisk) {
        builder.maxRisk(lunaConstraint.maxRisk as any);
      }
      builder.severity('soft');
      break;
      
    case 'require_confirmation':
      builder.type('require_confirm');
      builder.severity('soft');
      break;
      
    case 'other':
    default:
      builder.type('other');
      builder.severity('warning');
      break;
  }
  
  // Apply role restrictions if present
  if (lunaConstraint.appliesToRoles && lunaConstraint.appliesToRoles.length > 0) {
    builder.blockForRoles(...(lunaConstraint.appliesToRoles as any));
  }
  
  return builder.build();
}

/**
 * Convert Luna profile to core ConstraintSet
 */
export function lunaProfileToConstraintSet(profile: LunaProfile): ConstraintSet {
  const coreConstraints = profile.constraints.map(c => 
    lunaConstraintToCoreConstraint(c)
  );
  
  return createConstraintSet(
    `luna-profile-${profile.userId}-${profile.modeId}`,
    `Luna Profile for ${profile.modeId}`,
    `Constraints from Luna profile for user ${profile.userId} in mode ${profile.modeId}`,
    coreConstraints,
    {
      modes: [profile.modeId as OrbMode],
    }
  );
}

/**
 * Convert Luna action descriptor to core ActionContext
 */
export function lunaActionToActionContext(
  action: LunaActionDescriptor,
  additionalContext?: {
    userId?: string;
    sessionId?: string;
    deviceId?: string;
    mode?: string;
    persona?: string;
  }
): ActionContext {
  return {
    actionId: action.id,
    actionType: action.kind as any,
    role: action.role as any,
    toolId: action.toolId,
    estimatedRisk: action.estimatedRisk as any,
    description: action.description,
    userId: additionalContext?.userId,
    sessionId: additionalContext?.sessionId,
    deviceId: additionalContext?.deviceId as any,
    mode: additionalContext?.mode as any,
    persona: additionalContext?.persona as any,
  };
}

/**
 * Evaluate action using Luna profile and core constraint system
 */
export function evaluateActionWithLunaProfile(
  action: LunaActionDescriptor,
  profile: LunaProfile,
  additionalContext?: {
    userId?: string;
    sessionId?: string;
    deviceId?: string;
    mode?: string;
    persona?: string;
  }
): ConstraintEvaluationResult {
  const actionContext = lunaActionToActionContext(action, additionalContext);
  const constraintSet = lunaProfileToConstraintSet(profile);
  
  return coreEvaluateAction(actionContext, [constraintSet]);
}

