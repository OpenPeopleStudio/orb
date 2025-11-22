/**
 * Task Runner
 * 
 * Role: OrbRole.MAV (actions/tools)
 * 
 * Runs tasks and returns structured results for downstream agents.
 */

import { OrbRole, type OrbContext } from '@orb-system/core-orb';

import { MockMavExecutor, type MavExecutor } from './executors';

export type MavExecutionContext = OrbContext & {
  role: OrbRole.MAV;
};

export interface MavTaskAction {
  id: string;
  kind: string;
  toolId?: string;
  params?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

export interface MavTask {
  id: string;
  label: string;
  actions: MavTaskAction[];
  metadata?: Record<string, unknown>;
}

export type MavActionStatus = 'success' | 'failed';

export interface MavActionResult {
  taskId: string;
  actionId: string;
  kind: string;
  toolId?: string;
  status: MavActionStatus;
  startedAt: string;
  finishedAt: string;
  output?: Record<string, unknown>;
  error?: string;
  metadata?: Record<string, unknown>;
}

export interface MavTaskResult {
  taskId: string;
  label: string;
  status: 'completed' | 'failed' | 'partial';
  actionsCompleted: number;
  actionsTotal: number;
  actions: MavActionResult[];
  startedAt: string;
  finishedAt: string;
  error?: string;
  metadata?: Record<string, unknown>;
}

function ensureMavContext(ctx: OrbContext): MavExecutionContext {
  if (ctx.role !== OrbRole.MAV) {
    console.warn(`runTaskWithDefaults called with role ${ctx.role}, expected MAV`);
  }
  return ctx as MavExecutionContext;
}

function resolveExecutors(executors?: MavExecutor[]): MavExecutor[] {
  if (executors && executors.length > 0) {
    return executors;
  }
  return [new MockMavExecutor()];
}

/**
 * Run a task using the provided executors (or a default mock fallback).
 */
export async function runTaskWithDefaults(
  ctx: OrbContext,
  task: MavTask,
  executors?: MavExecutor[],
): Promise<MavTaskResult> {
  const mavCtx = ensureMavContext(ctx);
  const taskStartedAt = new Date().toISOString();
  const actions: MavActionResult[] = [];
  let successCount = 0;
  let failureCount = 0;

  console.log(`[MAV] Running task: ${task.label}`);

  const candidates = resolveExecutors(executors);
  const fallbackExecutor = candidates[candidates.length - 1];

  for (const action of task.actions) {
    console.log(`[MAV] Executing action ${action.id}: ${action.kind} (${action.toolId || 'n/a'})`);
    const executor =
      candidates.find((candidate) => candidate.canExecute(action)) ?? fallbackExecutor;
      
    if (!executor) {
      const now = new Date().toISOString();
      actions.push({
        taskId: task.id,
        actionId: action.id,
        kind: action.kind,
        toolId: action.toolId,
        status: 'failed',
        startedAt: now,
        finishedAt: now,
        error: `No executor available for action kind=${action.kind}`,
      });
      failureCount += 1;
      continue;
    }

    try {
      const result = await executor.executeAction(mavCtx, task, action);
      actions.push(result);
      if (result.status === 'success') {
        successCount += 1;
      } else {
        failureCount += 1;
      }
    } catch (error) {
      failureCount += 1;
      const now = new Date().toISOString();
      const message = error instanceof Error ? error.message : String(error);
      console.error(`[MAV] Action ${action.id} failed: ${message}`);
      actions.push({
        taskId: task.id,
        actionId: action.id,
        kind: action.kind,
        toolId: action.toolId,
        status: 'failed',
        startedAt: now,
        finishedAt: now,
        error: message,
      });
    }
  }

  const finishedAt = new Date().toISOString();
  const status: MavTaskResult['status'] =
    failureCount === 0 ? 'completed' : successCount > 0 ? 'partial' : 'failed';

  // Aggregate filesTouched from all actions
  const filesTouched: string[] = [];
  const errors: string[] = [];
  for (const action of actions) {
    if (action.metadata?.filesTouched) {
      const touched = Array.isArray(action.metadata.filesTouched)
        ? action.metadata.filesTouched
        : [action.metadata.filesTouched];
      filesTouched.push(...touched.map(String));
    }
    if (action.error) {
      errors.push(action.error);
    }
  }

  // Build summary
  const summary = `${successCount}/${task.actions.length} actions completed. ${
    filesTouched.length > 0 ? `Files touched: ${filesTouched.length}` : ''
  }`.trim();

  return {
    taskId: task.id,
    label: task.label,
    status,
    actionsCompleted: successCount,
    actionsTotal: task.actions.length,
    actions,
    startedAt: taskStartedAt,
    finishedAt,
    error: failureCount > 0 ? 'One or more actions failed' : undefined,
    metadata: {
      ...task.metadata,
      filesTouched: filesTouched.length > 0 ? filesTouched : undefined,
      errors: errors.length > 0 ? errors : undefined,
      summary,
    },
  };
}
