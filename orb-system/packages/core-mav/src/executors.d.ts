/**
 * Mav Executors
 *
 * Role: OrbRole.MAV (actions/tools)
 * Phase 6: Enhanced with event emission for learning loop
 *
 * Executors that actually perform actions in the real world.
 */
import type { MavActionResult, MavExecutionContext, MavTask, MavTaskAction } from './taskRunner';
export interface MavExecutor {
    readonly id: string;
    canExecute(action: MavTaskAction): boolean;
    executeAction(ctx: MavExecutionContext, task: MavTask, action: MavTaskAction): Promise<MavActionResult>;
}
/**
 * File executor - appends structured actions to ./.orb-data/mav/actions.log
 */
export declare class FileMavExecutor implements MavExecutor {
    readonly id = "mav_file_log";
    private readonly logPath;
    constructor(logPath?: string);
    canExecute(action: MavTaskAction): boolean;
    private ensureLogDir;
    private buildResult;
    executeAction(ctx: MavExecutionContext, task: MavTask, action: MavTaskAction): Promise<MavActionResult>;
}
/**
 * Mock executor - default fallback that simulates success without side effects.
 */
export declare class MockMavExecutor implements MavExecutor {
    readonly id = "mav_mock";
    canExecute(): boolean;
    executeAction(ctx: MavExecutionContext, task: MavTask, action: MavTaskAction): Promise<MavActionResult>;
}
/**
 * File System executor - writes files to whitelisted paths only.
 *
 * Safety rules:
 * - Only allows writes to apps/** and packages/**
 * - Never touches .git, node_modules, dist, lock files
 * - Creates directories as needed
 * - Logs all file writes to actions.log
 */
export declare class FileSystemMavExecutor implements MavExecutor {
    readonly id = "mav_file_system";
    private readonly logPath;
    private readonly whitelistPatterns;
    private readonly forbiddenPatterns;
    constructor(logPath?: string);
    canExecute(action: MavTaskAction): boolean;
    /**
     * Validate that a file path is safe to write to
     */
    private validatePath;
    /**
     * Write file atomically (write to temp, then rename)
     */
    private writeFileAtomic;
    /**
     * Log file write to actions.log
     */
    private logFileWrite;
    executeAction(ctx: MavExecutionContext, task: MavTask, action: MavTaskAction): Promise<MavActionResult>;
}
/**
 * HTTP executor - placeholder for future integrations.
 */
export declare class HttpMavExecutor implements MavExecutor {
    readonly id = "mav_http";
    canExecute(action: MavTaskAction): boolean;
    executeAction(ctx: MavExecutionContext, task: MavTask, action: MavTaskAction): Promise<MavActionResult>;
}
export type MavExecutorMode = 'mock' | 'file' | 'file_system';
export interface CreateDefaultMavExecutorOptions {
    mode?: MavExecutorMode;
    logPath?: string;
    env?: NodeJS.ProcessEnv;
}
export declare function getMavExecutorMode(env?: NodeJS.ProcessEnv): MavExecutorMode;
export declare function createDefaultMavExecutor(options?: CreateDefaultMavExecutorOptions): MavExecutor;
//# sourceMappingURL=executors.d.ts.map