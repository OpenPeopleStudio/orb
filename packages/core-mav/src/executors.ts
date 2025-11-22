/**
 * Mav Executors
 *
 * Role: OrbRole.MAV (actions/tools)
 *
 * Executors that actually perform actions in the real world.
 */

import { OrbRole } from '@orb-system/core-orb';
import type {
  MavActionResult,
  MavExecutionContext,
  MavTask,
  MavTaskAction,
} from './taskRunner';
import { promises as fs } from 'node:fs';
import * as path from 'node:path';

export interface MavExecutor {
  readonly id: string;
  canExecute(action: MavTaskAction): boolean;
  executeAction(
    ctx: MavExecutionContext,
    task: MavTask,
    action: MavTaskAction,
  ): Promise<MavActionResult>;
}

const DEFAULT_LOG_PATH = path.resolve(process.cwd(), '.orb-data/mav/actions.log');

type FileLogEntry = {
  ts: string;
  taskId: string;
  actionId: string;
  kind: string;
  toolId?: string;
  status: 'success' | 'failed';
  executorId: string;
  context: {
    userId: string | null;
    sessionId: string;
    role: OrbRole;
  };
  params?: Record<string, unknown>;
  output?: Record<string, unknown>;
  error?: string | null;
};

/**
 * File executor - appends structured actions to ./.orb-data/mav/actions.log
 */
export class FileMavExecutor implements MavExecutor {
  public readonly id = 'mav_file_log';
  private readonly logPath: string;

  constructor(logPath?: string) {
    this.logPath = logPath ? path.resolve(logPath) : DEFAULT_LOG_PATH;
  }

  canExecute(action: MavTaskAction): boolean {
    return (
      action.kind === 'log' ||
      action.kind === 'file_write' ||
      action.toolId === this.id ||
      action.toolId === 'file_log'
    );
  }

  private async ensureLogDir(): Promise<void> {
    await fs.mkdir(path.dirname(this.logPath), { recursive: true });
  }

  private buildResult(
    task: MavTask,
    action: MavTaskAction,
    status: 'success' | 'failed',
    startedAt: string,
    finishedAt: string,
    output?: Record<string, unknown>,
    error?: string,
  ): MavActionResult {
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

  async executeAction(
    ctx: MavExecutionContext,
    task: MavTask,
    action: MavTaskAction,
  ): Promise<MavActionResult> {
    if (ctx.role !== OrbRole.MAV) {
      console.warn(`FileMavExecutor.executeAction called with role ${ctx.role}, expected MAV`);
    }

    const startedAt = new Date().toISOString();
    const entry: FileLogEntry = {
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
    } catch (error) {
      const finishedAt = new Date().toISOString();
      const errorMessage = error instanceof Error ? error.message : String(error);
      entry.status = 'failed';
      entry.error = errorMessage;
      console.error('[MAV] Failed to append action log:', errorMessage);

      return this.buildResult(task, action, 'failed', startedAt, finishedAt, undefined, errorMessage);
    }
  }
}

/**
 * Mock executor - default fallback that simulates success without side effects.
 */
export class MockMavExecutor implements MavExecutor {
  public readonly id = 'mav_mock';

  canExecute(): boolean {
    return true;
  }

  async executeAction(
    ctx: MavExecutionContext,
    task: MavTask,
    action: MavTaskAction,
  ): Promise<MavActionResult> {
    if (ctx.role !== OrbRole.MAV) {
      console.warn(`MockMavExecutor.executeAction called with role ${ctx.role}, expected MAV`);
    }

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
  }
}

/**
 * HTTP executor - placeholder for future integrations.
 */
export class HttpMavExecutor implements MavExecutor {
  public readonly id = 'mav_http';

  canExecute(action: MavTaskAction): boolean {
    return action.kind === 'http_request' || action.toolId === this.id;
  }

  async executeAction(
    ctx: MavExecutionContext,
    task: MavTask,
    action: MavTaskAction,
  ): Promise<MavActionResult> {
    if (ctx.role !== OrbRole.MAV) {
      console.warn(`HttpMavExecutor.executeAction called with role ${ctx.role}, expected MAV`);
    }

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
  }
}

export type MavExecutorMode = 'mock' | 'file';

export interface CreateDefaultMavExecutorOptions {
  mode?: MavExecutorMode;
  logPath?: string;
  env?: NodeJS.ProcessEnv;
}

const EXECUTOR_ENV_KEY = 'ORB_MAV_EXECUTOR';
const LOG_PATH_ENV_KEY = 'ORB_MAV_EXECUTOR_LOG_PATH';

export function getMavExecutorMode(env: NodeJS.ProcessEnv = process.env): MavExecutorMode {
  const value = env[EXECUTOR_ENV_KEY]?.toLowerCase();
  if (value === 'mock') {
    return 'mock';
  }
  return 'file';
}

export function createDefaultMavExecutor(
  options?: CreateDefaultMavExecutorOptions,
): MavExecutor {
  const env = options?.env ?? process.env;
  const mode = options?.mode ?? getMavExecutorMode(env);

  if (mode === 'mock') {
    return new MockMavExecutor();
  }

  const logPath = options?.logPath ?? env[LOG_PATH_ENV_KEY];
  return new FileMavExecutor(logPath);
}

