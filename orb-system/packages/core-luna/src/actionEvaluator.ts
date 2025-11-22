<<<<<<< Current (Your changes)
=======
/**
 * Action Evaluator
 * 
 * Role: OrbRole.LUNA (preferences/intent)
 * 
 * Evaluates actions against user preferences and constraints.
 */

import { OrbRole, OrbContext, getDb, isPersistenceEnabled } from '@orb-system/core-orb';
import type { LunaActionDescriptor, LunaDecision, LunaDecisionType, LunaRiskLevel } from './types';
import { InMemoryLunaPreferencesStore, type LunaPreferencesStore } from './preferencesStore';
import { SqlLunaPreferencesStore } from './sqlStore';

/**
 * Evaluate an action against user preferences and constraints
 */
export async function evaluateActionWithDefaults(
  ctx: OrbContext,
  action: LunaActionDescriptor
): Promise<LunaDecision> {
  if (ctx.role !== OrbRole.LUNA) {
    console.warn(`evaluateActionWithDefaults called with role ${ctx.role}, expected LUNA`);
  }
  
  // Use persistent store if enabled, otherwise fall back to in-memory
  let store: LunaPreferencesStore;
  if (isPersistenceEnabled()) {
    store = new SqlLunaPreferencesStore(getDb());
  } else {
    store = new InMemoryLunaPreferencesStore();
  }
  
  const userId = ctx.userId || 'default-user';
  
  // Get active mode and profile
  const activeMode = await store.getActiveMode(userId);
  const profile = await store.getProfile(userId, activeMode);
  
  const triggeredConstraints: string[] = [];
  const reasons: string[] = [];
  let decisionType: LunaDecisionType = 'allow';
  let effectiveRisk: LunaRiskLevel = action.estimatedRisk || 'low';
  
  // Check constraints if profile exists
  if (profile) {
    for (const constraint of profile.constraints) {
      if (!constraint.active) continue;
      
      // Check tool blocking
      if (constraint.type === 'block_tool' && constraint.toolId === action.toolId) {
        triggeredConstraints.push(constraint.id);
        reasons.push(`Tool ${action.toolId} is blocked by constraint ${constraint.id}`);
        decisionType = 'deny';
      }
      
      // Check risk level
      if (constraint.type === 'max_risk' && constraint.maxRisk) {
        const riskLevels: LunaRiskLevel[] = ['low', 'medium', 'high'];
        const actionRiskIndex = riskLevels.indexOf(effectiveRisk);
        const maxRiskIndex = riskLevels.indexOf(constraint.maxRisk);
        
        if (actionRiskIndex > maxRiskIndex) {
          triggeredConstraints.push(constraint.id);
          reasons.push(`Action risk (${effectiveRisk}) exceeds maximum allowed (${constraint.maxRisk})`);
          decisionType = 'require_confirmation';
        }
      }
      
      // Check role restrictions
      if (constraint.appliesToRoles && !constraint.appliesToRoles.includes(action.role)) {
        // Constraint doesn't apply to this role, skip
        continue;
      }
    }
  }
  
  // Default: allow if no constraints triggered
  if (triggeredConstraints.length === 0) {
    reasons.push('No constraints triggered, action allowed');
  }
  
  return {
    type: decisionType,
    reasons,
    triggeredConstraints,
    effectiveRisk,
    context: {
      userId: ctx.userId || null,
      sessionId: ctx.sessionId,
    },
  };
}
>>>>>>> Incoming (Background Agent changes)
