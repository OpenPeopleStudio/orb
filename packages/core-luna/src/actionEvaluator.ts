/**
 * Action Evaluator
 *
 * Role: OrbRole.LUNA (preferences/intent)
 *
 * Evaluates actions against user preferences and constraints.
 * 
 * NOTE: This is a stub implementation. The full implementation is in orb-system/packages/core-luna
 */

import { OrbRole, type OrbContext } from '@orb-system/core-orb';

// Stub types - full types are in orb-system/packages/core-luna
type LunaActionDescriptor = {
  toolId?: string;
  estimatedRisk?: 'low' | 'medium' | 'high';
  role?: OrbRole;
};

type LunaDecisionType = 'allow' | 'require_confirmation' | 'deny';
type LunaRiskLevel = 'low' | 'medium' | 'high';

type LunaDecision = {
  type: LunaDecisionType;
  reasons: string[];
  triggeredConstraints: string[];
  effectiveRisk: LunaRiskLevel;
  context: {
    userId: string | null;
    sessionId: string;
  };
};

/**
 * Evaluate an action against user preferences and constraints
 * 
 * NOTE: This is a stub implementation. The full implementation is in orb-system/packages/core-luna
 */
export async function evaluateActionWithDefaults(
  ctx: OrbContext,
  action: LunaActionDescriptor,
): Promise<LunaDecision> {
  if (ctx.role !== OrbRole.LUNA) {
    console.warn(`evaluateActionWithDefaults called with role ${ctx.role}, expected LUNA`);
  }

  // Stub implementation - always allow
  const effectiveRisk: LunaRiskLevel = action.estimatedRisk || 'low';
  
  return {
    type: 'allow',
    reasons: ['Stub implementation - always allows'],
    triggeredConstraints: [],
    effectiveRisk,
    context: {
      userId: ctx.userId || null,
      sessionId: ctx.sessionId,
    },
  };
}

