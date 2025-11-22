<<<<<<< Current (Your changes)
=======
/**
 * Task Runner
 * 
 * Role: OrbRole.MAV (actions/tools)
 * 
 * Runs tasks and returns results.
 */

import { OrbRole, OrbContext } from '@orb-system/core-orb';
import { getDefaultExecutors, type MavExecutor } from './executors';

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

export interface MavTaskResult {
  taskId: string;
  status: 'completed' | 'failed' | 'partial';
  actionsCompleted: number;
  actionsTotal: number;
  output?: string;
  error?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Run a task with default executors
 */
export async function runTaskWithDefaults(
  ctx: OrbContext,
  task: MavTask,
  executors?: MavExecutor[]
): Promise<MavTaskResult> {
  if (ctx.role !== OrbRole.MAV) {
    console.warn(`runTaskWithDefaults called with role ${ctx.role}, expected MAV`);
  }

  console.log(`[MAV] Running task: ${task.label}`);

  const availableExecutors = executors || getDefaultExecutors();
  let actionsCompleted = 0;
  let hasError = false;
  const outputs: string[] = [];

  for (const action of task.actions) {
    try {
      console.log(`[MAV] Executing action: ${action.kind} (${action.toolId || 'no tool'})`);
      
      // Find an executor that can handle this action
      const executor = availableExecutors.find(e => e.canExecute(action));
      
      if (executor) {
        // Use real executor
        const result = await executor.execute(ctx, action);
        if (result.success) {
          actionsCompleted++;
          outputs.push(result.output || `Action ${action.id} completed`);
        } else {
          hasError = true;
          outputs.push(`Action ${action.id} failed: ${result.error}`);
        }
      } else {
        // Fallback to mock for unknown actions
        console.log(`[MAV] No executor found for ${action.kind}, using mock`);
        await new Promise(resolve => setTimeout(resolve, 10));
        actionsCompleted++;
        outputs.push(`Action ${action.id} completed (mock)`);
      }
    } catch (error) {
      hasError = true;
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`[MAV] Action ${action.id} failed:`, error);
      outputs.push(`Action ${action.id} failed: ${errorMessage}`);
    }
  }

  const status: MavTaskResult['status'] = hasError
    ? actionsCompleted === 0
      ? 'failed'
      : 'partial'
    : 'completed';

  return {
    taskId: task.id,
    status,
    actionsCompleted,
    actionsTotal: task.actions.length,
    output: outputs.join('\n'),
    metadata: task.metadata,
  };
}
>>>>>>> Incoming (Background Agent changes)
