/**
 * Tests for Mav Task Runner
 */

import { describe, it, expect } from '@jest/globals';
import { OrbRole, createOrbContext } from '@orb-system/core-orb';
import { runTaskWithDefaults } from '../taskRunner';
import { FileMavExecutor } from '../executors';
import type { MavTask } from '../taskRunner';

describe('Mav Task Runner', () => {
  const ctx = createOrbContext(OrbRole.MAV, 'test-session', { userId: 'test-user' });

  it('should complete tasks successfully', async () => {
    const task: MavTask = {
      id: 'test-task',
      label: 'Test Task',
      actions: [
        {
          id: 'action-1',
          kind: 'file_write',
          toolId: 'file_log',
          params: { test: 'data' },
        },
      ],
    };

    const result = await runTaskWithDefaults(ctx, task);

    expect(result.status).toBe('completed');
    expect(result.actionsCompleted).toBe(1);
    expect(result.actionsTotal).toBe(1);
  });

  it('should handle multiple actions', async () => {
    const task: MavTask = {
      id: 'test-task',
      label: 'Test Task',
      actions: [
        {
          id: 'action-1',
          kind: 'file_write',
          toolId: 'file_log',
          params: { test: 'data1' },
        },
        {
          id: 'action-2',
          kind: 'file_write',
          toolId: 'file_log',
          params: { test: 'data2' },
        },
      ],
    };

    const result = await runTaskWithDefaults(ctx, task);

    expect(result.status).toBe('completed');
    expect(result.actionsCompleted).toBe(2);
    expect(result.actionsTotal).toBe(2);
  });

  it('should use FileMavExecutor for file actions', async () => {
    const executor = new FileMavExecutor('/tmp/test-orb.log');
    const task: MavTask = {
      id: 'test-task',
      label: 'Test Task',
      actions: [
        {
          id: 'action-1',
          kind: 'file_write',
          toolId: 'file_log',
          params: { test: 'data' },
        },
      ],
    };

    const result = await runTaskWithDefaults(ctx, task, [executor]);

    expect(result.status).toBe('completed');
    expect(result.output).toContain('logged');
  });
});

