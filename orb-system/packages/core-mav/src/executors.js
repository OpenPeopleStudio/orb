/**
 * Mav Executors
 *
 * Role: OrbRole.MAV (actions/tools)
 * Phase 6: Enhanced with event emission for learning loop
 *
 * Executors that actually perform actions in the real world.
 */
import { promises as fs } from 'node:fs';
import * as path from 'node:path';
import { OrbRole, getEventBus, OrbEventType, } from '@orb-system/core-orb';
/**
 * Helper to generate event IDs
 */
function generateEventId() {
    return `evt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
/**
 * Wrapper to emit events around executor actions
 */
async function executeWithEvents(ctx, task, action, executor) {
    const eventBus = getEventBus();
    const startTime = Date.now();
    const startedAt = new Date().toISOString();
    // Emit ACTION_STARTED event
    await eventBus.emit({
        id: generateEventId(),
        type: OrbEventType.ACTION_STARTED,
        timestamp: startedAt,
        userId: ctx.userId,
        sessionId: ctx.sessionId,
        deviceId: ctx.deviceId,
        mode: ctx.mode,
        persona: ctx.persona,
        role: OrbRole.MAV,
        payload: {
            actionId: action.id,
            actionType: action.kind,
            toolId: action.toolId,
            taskId: task.id,
        },
        metadata: {
            startTime,
        },
    });
    try {
        const result = await executor();
        const endTime = Date.now();
        const duration = endTime - startTime;
        // Emit ACTION_COMPLETED or ACTION_FAILED based on result
        if (result.status === 'success') {
            await eventBus.emit({
                id: generateEventId(),
                type: OrbEventType.ACTION_COMPLETED,
                timestamp: result.finishedAt,
                userId: ctx.userId,
                sessionId: ctx.sessionId,
                deviceId: ctx.deviceId,
                mode: ctx.mode,
                persona: ctx.persona,
                role: OrbRole.MAV,
                payload: {
                    actionId: action.id,
                    actionType: action.kind,
                    toolId: action.toolId,
                    taskId: task.id,
                    result: result.output,
                },
                metadata: {
                    duration,
                    success: true,
                },
            });
        }
        else {
            await eventBus.emit({
                id: generateEventId(),
                type: OrbEventType.ACTION_FAILED,
                timestamp: result.finishedAt,
                userId: ctx.userId,
                sessionId: ctx.sessionId,
                deviceId: ctx.deviceId,
                mode: ctx.mode,
                persona: ctx.persona,
                role: OrbRole.MAV,
                payload: {
                    actionId: action.id,
                    actionType: action.kind,
                    toolId: action.toolId,
                    taskId: task.id,
                    error: result.error,
                },
                metadata: {
                    duration,
                    success: false,
                    errorMessage: result.error,
                },
            });
        }
        return result;
    }
    catch (error) {
        const endTime = Date.now();
        const duration = endTime - startTime;
        const errorMessage = error instanceof Error ? error.message : String(error);
        // Emit ACTION_FAILED event
        await eventBus.emit({
            id: generateEventId(),
            type: OrbEventType.ACTION_FAILED,
            timestamp: new Date().toISOString(),
            userId: ctx.userId,
            sessionId: ctx.sessionId,
            deviceId: ctx.deviceId,
            mode: ctx.mode,
            persona: ctx.persona,
            role: OrbRole.MAV,
            payload: {
                actionId: action.id,
                actionType: action.kind,
                toolId: action.toolId,
                taskId: task.id,
                error: errorMessage,
            },
            metadata: {
                duration,
                success: false,
                errorMessage,
            },
        });
        throw error;
    }
}
const DEFAULT_LOG_PATH = path.resolve(process.cwd(), '.orb-data/mav/actions.log');
/**
 * File executor - appends structured actions to ./.orb-data/mav/actions.log
 */
export class FileMavExecutor {
    constructor(logPath) {
        this.id = 'mav_file_log';
        this.logPath = logPath ? path.resolve(logPath) : DEFAULT_LOG_PATH;
    }
    canExecute(action) {
        return (action.kind === 'log' ||
            action.kind === 'file_write' ||
            action.toolId === this.id ||
            action.toolId === 'file_log');
    }
    async ensureLogDir() {
        await fs.mkdir(path.dirname(this.logPath), { recursive: true });
    }
    buildResult(task, action, status, startedAt, finishedAt, output, error) {
        return {
            taskId: task.id,
            actionId: action.id,
            kind: action.kind,
            toolId: action.toolId ?? this.id,
            status,
            startedAt,
            finishedAt,
            output,
            error,
            metadata: {
                executorId: this.id,
                logPath: this.logPath,
                ...action.metadata,
            },
        };
    }
    async executeAction(ctx, task, action) {
        if (ctx.role !== OrbRole.MAV) {
            console.warn(`FileMavExecutor.executeAction called with role ${ctx.role}, expected MAV`);
        }
        return executeWithEvents(ctx, task, action, async () => {
            const startedAt = new Date().toISOString();
            const entry = {
                ts: startedAt,
                taskId: task.id,
                actionId: action.id,
                kind: action.kind,
                toolId: action.toolId,
                status: 'success',
                executorId: this.id,
                context: {
                    userId: ctx.userId ?? null,
                    sessionId: ctx.sessionId,
                    role: ctx.role,
                },
                params: action.params,
                error: null,
            };
            try {
                await this.ensureLogDir();
                const output = {
                    logged: true,
                    logPath: this.logPath,
                };
                entry.output = output;
                await fs.appendFile(this.logPath, JSON.stringify(entry) + '\n', 'utf-8');
                const finishedAt = new Date().toISOString();
                return this.buildResult(task, action, 'success', startedAt, finishedAt, output);
            }
            catch (error) {
                const finishedAt = new Date().toISOString();
                const errorMessage = error instanceof Error ? error.message : String(error);
                entry.status = 'failed';
                entry.error = errorMessage;
                console.error('[MAV] Failed to append action log:', errorMessage);
                return this.buildResult(task, action, 'failed', startedAt, finishedAt, undefined, errorMessage);
            }
        });
    }
}
/**
 * Mock executor - default fallback that simulates success without side effects.
 */
export class MockMavExecutor {
    constructor() {
        this.id = 'mav_mock';
    }
    canExecute() {
        return true;
    }
    async executeAction(ctx, task, action) {
        if (ctx.role !== OrbRole.MAV) {
            console.warn(`MockMavExecutor.executeAction called with role ${ctx.role}, expected MAV`);
        }
        return executeWithEvents(ctx, task, action, async () => {
            const timestamp = new Date().toISOString();
            return {
                taskId: task.id,
                actionId: action.id,
                kind: action.kind,
                toolId: action.toolId,
                status: 'success',
                startedAt: timestamp,
                finishedAt: timestamp,
                output: {
                    mock: true,
                    message: `Simulated ${action.kind}`,
                },
                metadata: {
                    executorId: this.id,
                },
            };
        });
    }
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
export class FileSystemMavExecutor {
    constructor(logPath) {
        this.id = 'mav_file_system';
        this.logPath = logPath ? path.resolve(logPath) : DEFAULT_LOG_PATH;
        // Whitelist: only allow writes to apps/ and packages/ directories
        this.whitelistPatterns = ['apps/', 'packages/'];
        // Forbidden: never touch these
        this.forbiddenPatterns = [
            '.git',
            'node_modules',
            'dist',
            'pnpm-lock.yaml',
            'package-lock.json',
            'yarn.lock',
        ];
    }
    canExecute(action) {
        return (action.kind === 'file_write' ||
            action.kind === 'file_create' ||
            action.toolId === this.id ||
            action.toolId === 'file_system');
    }
    /**
     * Validate that a file path is safe to write to
     */
    validatePath(filePath) {
        const normalized = path.normalize(filePath);
        const resolved = path.resolve(process.cwd(), normalized);
        const relative = path.relative(process.cwd(), resolved);
        // Check forbidden patterns
        for (const forbidden of this.forbiddenPatterns) {
            if (relative.includes(forbidden)) {
                return {
                    valid: false,
                    error: `Path contains forbidden pattern: ${forbidden}`,
                };
            }
        }
        // Check whitelist patterns
        const matchesWhitelist = this.whitelistPatterns.some((pattern) => relative.startsWith(pattern));
        if (!matchesWhitelist) {
            return {
                valid: false,
                error: `Path must start with one of: ${this.whitelistPatterns.join(', ')}`,
            };
        }
        return { valid: true };
    }
    /**
     * Write file atomically (write to temp, then rename)
     */
    async writeFileAtomic(filePath, content) {
        const dir = path.dirname(filePath);
        await fs.mkdir(dir, { recursive: true });
        // Write to temp file first
        const tempPath = `${filePath}.tmp.${Date.now()}`;
        await fs.writeFile(tempPath, content, 'utf-8');
        // Atomic rename
        await fs.rename(tempPath, filePath);
    }
    /**
     * Log file write to actions.log
     */
    async logFileWrite(ctx, task, action, filePath, success, error) {
        try {
            await fs.mkdir(path.dirname(this.logPath), { recursive: true });
            const entry = {
                ts: new Date().toISOString(),
                taskId: task.id,
                actionId: action.id,
                kind: action.kind,
                toolId: action.toolId ?? this.id,
                status: success ? 'success' : 'failed',
                executorId: this.id,
                context: {
                    userId: ctx.userId ?? null,
                    sessionId: ctx.sessionId,
                    role: ctx.role,
                },
                params: { ...action.params, filePath },
                output: success ? { filePath, written: true } : undefined,
                error: error ?? null,
            };
            await fs.appendFile(this.logPath, JSON.stringify(entry) + '\n', 'utf-8');
        }
        catch (logError) {
            // Don't fail the action if logging fails
            console.error('[MAV] Failed to log file write:', logError);
        }
    }
    async executeAction(ctx, task, action) {
        if (ctx.role !== OrbRole.MAV) {
            console.warn(`FileSystemMavExecutor.executeAction called with role ${ctx.role}, expected MAV`);
        }
        return executeWithEvents(ctx, task, action, async () => {
            const startedAt = new Date().toISOString();
            // Extract file path and content from params
            const filePath = action.params?.path;
            const content = action.params?.content;
            if (!filePath) {
                const finishedAt = new Date().toISOString();
                await this.logFileWrite(ctx, task, action, '', false, 'Missing file path in params');
                return {
                    taskId: task.id,
                    actionId: action.id,
                    kind: action.kind,
                    toolId: action.toolId ?? this.id,
                    status: 'failed',
                    startedAt,
                    finishedAt,
                    error: 'Missing file path in action params',
                    metadata: {
                        executorId: this.id,
                    },
                };
            }
            // Validate path
            const validation = this.validatePath(filePath);
            if (!validation.valid) {
                const finishedAt = new Date().toISOString();
                await this.logFileWrite(ctx, task, action, filePath, false, validation.error);
                return {
                    taskId: task.id,
                    actionId: action.id,
                    kind: action.kind,
                    toolId: action.toolId ?? this.id,
                    status: 'failed',
                    startedAt,
                    finishedAt,
                    error: validation.error,
                    metadata: {
                        executorId: this.id,
                        filePath,
                        rejected: true,
                    },
                };
            }
            // Write file
            try {
                const resolvedPath = path.resolve(process.cwd(), filePath);
                const fileContent = content ?? '';
                await this.writeFileAtomic(resolvedPath, fileContent);
                const finishedAt = new Date().toISOString();
                await this.logFileWrite(ctx, task, action, filePath, true);
                return {
                    taskId: task.id,
                    actionId: action.id,
                    kind: action.kind,
                    toolId: action.toolId ?? this.id,
                    status: 'success',
                    startedAt,
                    finishedAt,
                    output: {
                        filePath,
                        written: true,
                        size: fileContent.length,
                    },
                    metadata: {
                        executorId: this.id,
                        filesTouched: [filePath],
                    },
                };
            }
            catch (error) {
                const finishedAt = new Date().toISOString();
                const errorMessage = error instanceof Error ? error.message : String(error);
                await this.logFileWrite(ctx, task, action, filePath, false, errorMessage);
                return {
                    taskId: task.id,
                    actionId: action.id,
                    kind: action.kind,
                    toolId: action.toolId ?? this.id,
                    status: 'failed',
                    startedAt,
                    finishedAt,
                    error: errorMessage,
                    metadata: {
                        executorId: this.id,
                        filePath,
                    },
                };
            }
        });
    }
}
/**
 * HTTP executor - placeholder for future integrations.
 */
export class HttpMavExecutor {
    constructor() {
        this.id = 'mav_http';
    }
    canExecute(action) {
        return action.kind === 'http_request' || action.toolId === this.id;
    }
    async executeAction(ctx, task, action) {
        if (ctx.role !== OrbRole.MAV) {
            console.warn(`HttpMavExecutor.executeAction called with role ${ctx.role}, expected MAV`);
        }
        return executeWithEvents(ctx, task, action, async () => {
            const timestamp = new Date().toISOString();
            return {
                taskId: task.id,
                actionId: action.id,
                kind: action.kind,
                toolId: action.toolId,
                status: 'failed',
                startedAt: timestamp,
                finishedAt: timestamp,
                error: 'HTTP executor not yet implemented',
                metadata: {
                    executorId: this.id,
                },
            };
        });
    }
}
const EXECUTOR_ENV_KEY = 'ORB_MAV_EXECUTOR';
const LOG_PATH_ENV_KEY = 'ORB_MAV_EXECUTOR_LOG_PATH';
export function getMavExecutorMode(env = process.env) {
    const value = env[EXECUTOR_ENV_KEY]?.toLowerCase();
    if (value === 'mock') {
        return 'mock';
    }
    if (value === 'file_system' || value === 'filesystem') {
        return 'file_system';
    }
    return 'file';
}
export function createDefaultMavExecutor(options) {
    const env = options?.env ?? process.env;
    const mode = options?.mode ?? getMavExecutorMode(env);
    if (mode === 'mock') {
        return new MockMavExecutor();
    }
    if (mode === 'file_system') {
        const logPath = options?.logPath ?? env[LOG_PATH_ENV_KEY];
        return new FileSystemMavExecutor(logPath);
    }
    // Default: file logger
    const logPath = options?.logPath ?? env[LOG_PATH_ENV_KEY];
    return new FileMavExecutor(logPath);
}
//# sourceMappingURL=executors.js.map