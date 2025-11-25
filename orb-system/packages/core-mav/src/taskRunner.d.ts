/**
 * Task Runner
 *
 * Role: OrbRole.MAV (actions/tools)
 * Phase 6: Enhanced with event emission for learning loop
 *
 * Runs tasks and returns structured results for downstream agents.
 */
import { OrbRole, type OrbContext } from '@orb-system/core-orb';
import { type MavExecutor } from './executors';
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
/**
 * Run a task using the provided executors (or a default mock fallback).
 * Phase 6: Emits events for learning loop pattern detection.
 */
export declare function runTaskWithDefaults(ctx: OrbContext, task: MavTask, executors?: MavExecutor[]): Promise<MavTaskResult>;
//# sourceMappingURL=taskRunner.d.ts.map