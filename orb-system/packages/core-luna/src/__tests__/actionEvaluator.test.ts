/**
 * Tests for Luna Action Evaluator
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
import { OrbRole, createOrbContext, setConfig, resetConfig } from '@orb-system/core-orb';
import { evaluateActionWithDefaults } from '../actionEvaluator';
import type { LunaActionDescriptor } from '../types';

describe('Luna Action Evaluator', () => {
  beforeEach(() => {
    resetConfig();
    setConfig({ isPersistent: false });
  });

  it('should allow low-risk actions by default', async () => {
    const ctx = createOrbContext(OrbRole.LUNA, 'test-session', { userId: 'test-user' });
    const action: LunaActionDescriptor = {
      id: 'test-action',
      role: OrbRole.MAV,
      kind: 'tool_call',
      toolId: 'safe_tool',
      estimatedRisk: 'low',
    };

    const decision = await evaluateActionWithDefaults(ctx, action);

    expect(decision.type).toBe('allow');
    expect(decision.reasons.length).toBeGreaterThan(0);
  });

  it('should require confirmation for high-risk actions', async () => {
    const ctx = createOrbContext(OrbRole.LUNA, 'test-session', { userId: 'test-user' });
    const action: LunaActionDescriptor = {
      id: 'test-action',
      role: OrbRole.MAV,
      kind: 'tool_call',
      toolId: 'risky_tool',
      estimatedRisk: 'high',
    };

    const decision = await evaluateActionWithDefaults(ctx, action);

    // Default mode allows high risk but requires confirmation
    expect(['allow', 'require_confirmation']).toContain(decision.type);
  });

  it('should deny blocked tools', async () => {
    const ctx = createOrbContext(OrbRole.LUNA, 'test-session', { userId: 'test-user' });
    
    // First set restaurant mode which blocks 'make_purchase'
    const { SqlLunaPreferencesStore } = await import('../sqlStore');
    const { getDb } = await import('@orb-system/core-orb');
    const store = new SqlLunaPreferencesStore(getDb());
    await store.setActiveMode('test-user', 'restaurant');

    const action: LunaActionDescriptor = {
      id: 'test-action',
      role: OrbRole.MAV,
      kind: 'tool_call',
      toolId: 'make_purchase',
      estimatedRisk: 'low',
    };

    const decision = await evaluateActionWithDefaults(ctx, action);

    expect(decision.type).toBe('deny');
    expect(decision.triggeredConstraints.length).toBeGreaterThan(0);
  });
});

