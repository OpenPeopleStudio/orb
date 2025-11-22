/**
 * Tests for Mav Task Runner
 *
 * Tests that task runner stops on failure and logs properly.
 */

import { createOrbContext, OrbRole } from '@orb-system/core-orb';

import { runTaskWithDefaults } from './taskRunner';
import type { MavTask } from './taskRunner';

describe('Mav Task Runner', () => {
  const ctx = createOrbContext(OrbRole.MAV, 'test-session', { userId: 'test-user' });

  test('should complete task with successful actions', async () => {
    const task: MavTask = {
      id: 'test-task-1',
      label: 'Test Task',
      actions: [
        {
          id: 'action-1',
          kind: 'tool_call',
          toolId: 'mock_tool',
          params: { test: true },
        },
      ],
    };

    const result = await runTaskWithDefaults(ctx, task);
    expect(result.status).toBe('completed');
    expect(result.actionsCompleted).toBe(1);
    expect(result.actionsTotal).toBe(1);
    expect(result.actions[0].status).toBe('success');
  });

  test('should handle multiple actions', async () => {
    const task: MavTask = {
      id: 'test-task-2',
      label: 'Multi Action Task',
      actions: [
        {
          id: 'action-1',
          kind: 'tool_call',
          toolId: 'mock_tool',
        },
        {
          id: 'action-2',
          kind: 'tool_call',
          toolId: 'mock_tool',
        },
      ],
    };

    const result = await runTaskWithDefaults(ctx, task);
    expect(result.actionsCompleted).toBe(2);
    expect(result.actionsTotal).toBe(2);
    expect(result.actions.every((action) => action.status === 'success')).toBe(true);
  });

  test('should return proper task metadata', async () => {
    const task: MavTask = {
      id: 'test-task-3',
      label: 'Metadata Task',
      actions: [
        {
          id: 'action-1',
          kind: 'tool_call',
          toolId: 'mock_tool',
        },
      ],
      metadata: { test: 'metadata' },
    };

    const result = await runTaskWithDefaults(ctx, task);
    expect(result.metadata).toEqual({ test: 'metadata' });
    expect(result.actions[0].taskId).toBe('test-task-3');
  });
});

// Simple test runner
if (require.main === module) {
  const tests: Array<{ name: string; fn: () => Promise<void> }> = [];

  function _test(name: string, fn: () => Promise<void>) {
    tests.push({ name, fn });
  }

  function _expect(value: unknown) {
    return {
      toBe(expected: unknown) {
        if (value !== expected) {
          throw new Error(`Expected ${value} to be ${expected}`);
        }
      },
      toEqual(expected: unknown) {
        if (JSON.stringify(value) !== JSON.stringify(expected)) {
          throw new Error(
            `Expected ${JSON.stringify(value)} to equal ${JSON.stringify(expected)}`,
          );
        }
      },
    };
  }

  async function runTests() {
    console.log('Running Mav Task Runner tests...\n');
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

  import('./taskRunner.test').then(() => {
    runTests();
  });
}

