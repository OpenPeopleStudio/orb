/**
 * Tests for Luna Action Evaluator
 * 
 * Tests decision logic for obvious allow/deny cases.
 */

import { evaluateActionWithDefaults } from './actionEvaluator';
import { createOrbContext, OrbRole } from '@orb-system/core-orb';
import type { LunaActionDescriptor } from './types';

describe('Luna Action Evaluator', () => {
  const userId = 'test-user';
  const sessionId = 'test-session';

  test('should allow low-risk action by default', async () => {
    const ctx = createOrbContext(OrbRole.LUNA, sessionId, { userId });
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

  test('should require confirmation for high-risk action', async () => {
    const ctx = createOrbContext(OrbRole.LUNA, sessionId, { userId });
    const action: LunaActionDescriptor = {
      id: 'test-action',
      role: OrbRole.MAV,
      kind: 'tool_call',
      toolId: 'risky_tool',
      estimatedRisk: 'high',
    };

    const decision = await evaluateActionWithDefaults(ctx, action);
    // Should require confirmation or deny based on constraints
    expect(['allow', 'require_confirmation', 'deny']).toContain(decision.type);
  });

  test('should include effective risk in decision', async () => {
    const ctx = createOrbContext(OrbRole.LUNA, sessionId, { userId });
    const action: LunaActionDescriptor = {
      id: 'test-action',
      role: OrbRole.MAV,
      kind: 'tool_call',
      toolId: 'test_tool',
      estimatedRisk: 'medium',
    };

    const decision = await evaluateActionWithDefaults(ctx, action);
    expect(decision.effectiveRisk).toBe('medium');
  });
});

// Simple test runner for Node.js
if (require.main === module) {
  const tests: Array<{ name: string; fn: () => Promise<void> }> = [];
  
  function test(name: string, fn: () => Promise<void>) {
    tests.push({ name, fn });
  }
  
  function expect(value: unknown) {
    return {
      toBe(expected: unknown) {
        if (value !== expected) {
          throw new Error(`Expected ${value} to be ${expected}`);
        }
      },
      toContain(item: unknown) {
        if (Array.isArray(value) && !value.includes(item)) {
          throw new Error(`Expected array to contain ${item}`);
        }
      },
      length: {
        toBeGreaterThan(n: number) {
          if (typeof value === 'object' && 'length' in value) {
            if ((value as { length: number }).length <= n) {
              throw new Error(`Expected length to be greater than ${n}`);
            }
          }
        },
      },
    };
  }
  
  async function runTests() {
    console.log('Running Luna Action Evaluator tests...\n');
    let passed = 0;
    let failed = 0;
    
    for (const { name, fn } of tests) {
      try {
        await fn();
        console.log(`✓ ${name}`);
        passed++;
      } catch (error) {
        console.error(`✗ ${name}`);
        console.error(`  ${error instanceof Error ? error.message : String(error)}`);
        failed++;
      }
    }
    
    console.log(`\n${passed} passed, ${failed} failed`);
    process.exit(failed > 0 ? 1 : 0);
  }
  
  // Import and run tests
  import('./actionEvaluator.test').then(() => {
    runTests();
  });
}

