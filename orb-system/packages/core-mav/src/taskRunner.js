/**
 * Task Runner
 *
 * Role: OrbRole.MAV (actions/tools)
 * Phase 6: Enhanced with event emission for learning loop
 *
 * Runs tasks and returns structured results for downstream agents.
 */
import { OrbRole, getEventBus, OrbEventType, } from '@orb-system/core-orb';
import { MockMavExecutor } from './executors';
function ensureMavContext(ctx) {
    if (ctx.role !== OrbRole.MAV) {
        console.warn(`runTaskWithDefaults called with role ${ctx.role}, expected MAV`);
    }
    return ctx;
}
function resolveExecutors(executors) {
    if (executors && executors.length > 0) {
        return executors;
    }
    return [new MockMavExecutor()];
}
/**
 * Run a task using the provided executors (or a default mock fallback).
 * Phase 6: Emits events for learning loop pattern detection.
 */
export async function runTaskWithDefaults(ctx, task, executors) {
    const mavCtx = ensureMavContext(ctx);
    const eventBus = getEventBus();
    const taskStartedAt = new Date().toISOString();
    const startTime = Date.now();
    const actions = [];
    let successCount = 0;
    let failureCount = 0;
    console.log(`[MAV] Running task: ${task.label}`);
    // Emit ACTION_STARTED event
    await eventBus.emit({
        id: `evt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: OrbEventType.ACTION_STARTED,
        timestamp: taskStartedAt,
        userId: ctx.userId,
        sessionId: ctx.sessionId,
        deviceId: ctx.deviceId,
        mode: ctx.mode,
        persona: ctx.persona,
        role: OrbRole.MAV,
        payload: {
            taskId: task.id,
            taskLabel: task.label,
            actionCount: task.actions.length,
        },
        metadata: {
            startTime,
        },
    });
    const candidates = resolveExecutors(executors);
    const fallbackExecutor = candidates[candidates.length - 1];
    for (const action of task.actions) {
        console.log(`[MAV] Executing action ${action.id}: ${action.kind} (${action.toolId || 'n/a'})`);
        const executor = candidates.find((candidate) => candidate.canExecute(action)) ?? fallbackExecutor;
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
            }
            else {
                failureCount += 1;
            }
        }
        catch (error) {
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
    const endTime = Date.now();
    const duration = endTime - startTime;
    const status = failureCount === 0 ? 'completed' : successCount > 0 ? 'partial' : 'failed';
    // Aggregate filesTouched from all actions
    const filesTouched = [];
    const errors = [];
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
    const summary = `${successCount}/${task.actions.length} actions completed. ${filesTouched.length > 0 ? `Files touched: ${filesTouched.length}` : ''}`.trim();
    const result = {
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
    // Emit ACTION_COMPLETED or ACTION_FAILED event
    if (status === 'failed') {
        await eventBus.emit({
            id: `evt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            type: OrbEventType.ACTION_FAILED,
            timestamp: finishedAt,
            userId: ctx.userId,
            sessionId: ctx.sessionId,
            deviceId: ctx.deviceId,
            mode: ctx.mode,
            persona: ctx.persona,
            role: OrbRole.MAV,
            payload: {
                taskId: task.id,
                taskLabel: task.label,
                error: result.error,
                actionsCompleted: successCount,
                actionsTotal: task.actions.length,
            },
            metadata: {
                duration,
                success: false,
                errors,
            },
        });
    }
    else {
        await eventBus.emit({
            id: `evt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            type: OrbEventType.ACTION_COMPLETED,
            timestamp: finishedAt,
            userId: ctx.userId,
            sessionId: ctx.sessionId,
            deviceId: ctx.deviceId,
            mode: ctx.mode,
            persona: ctx.persona,
            role: OrbRole.MAV,
            payload: {
                taskId: task.id,
                taskLabel: task.label,
                result: summary,
                success: status === 'completed',
                actionsCompleted: successCount,
                actionsTotal: task.actions.length,
            },
            metadata: {
                duration,
                success: true,
                filesTouched,
            },
        });
    }
    return result;
}
//# sourceMappingURL=taskRunner.js.map