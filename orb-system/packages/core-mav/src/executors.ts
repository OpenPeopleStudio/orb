/**
 * Mav Executors
 * 
 * Role: OrbRole.MAV (actions/tools)
 * 
 * Executors that actually perform actions in the real world.
 */

import { OrbRole, OrbContext } from '@orb-system/core-orb';
import type { MavTaskAction, MavTaskResult } from './taskRunner';
import * as fs from 'node:fs';
import * as path from 'node:path';

export interface MavExecutor {
  canExecute(action: MavTaskAction): boolean;
  execute(ctx: OrbContext, action: MavTaskAction): Promise<MavActionResult>;
}

export interface MavActionResult {
  success: boolean;
  output?: string;
  error?: string;
  metadata?: Record<string, unknown>;
}

/**
 * File executor - writes actions to a log file
 */
export class FileMavExecutor implements MavExecutor {
  private logPath: string;

  constructor(logPath?: string) {
    this.logPath = logPath || path.join(process.cwd(), 'orb-actions.log');
  }

  canExecute(action: MavTaskAction): boolean {
    return action.kind === 'file_write' || action.toolId === 'file_log';
  }

  async execute(ctx: OrbContext, action: MavTaskAction): Promise<MavActionResult> {
    if (ctx.role !== OrbRole.MAV) {
      console.warn(`FileMavExecutor.execute called with role ${ctx.role}, expected MAV`);
    }

    try {
      const timestamp = new Date().toISOString();
      const logEntry = {
        timestamp,
        userId: ctx.userId,
        sessionId: ctx.sessionId,
        actionId: action.id,
        toolId: action.toolId,
        kind: action.kind,
        params: action.params,
        metadata: action.metadata,
      };

      const logLine = JSON.stringify(logEntry) + '\n';

      // Ensure directory exists
      const logDir = path.dirname(this.logPath);
      if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
      }

      // Append to log file
      fs.appendFileSync(this.logPath, logLine, 'utf-8');

      return {
        success: true,
        output: `Action logged to ${this.logPath}`,
        metadata: { logPath: this.logPath, timestamp },
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return {
        success: false,
        error: `Failed to write to log file: ${errorMessage}`,
      };
    }
  }
}

/**
 * HTTP executor - makes HTTP requests (placeholder for future)
 */
export class HttpMavExecutor implements MavExecutor {
  canExecute(action: MavTaskAction): boolean {
    return action.kind === 'http_request' || action.toolId === 'http_call';
  }

  async execute(ctx: OrbContext, action: MavTaskAction): Promise<MavActionResult> {
    if (ctx.role !== OrbRole.MAV) {
      console.warn(`HttpMavExecutor.execute called with role ${ctx.role}, expected MAV`);
    }

    // TODO: Implement actual HTTP request
    return {
      success: false,
      error: 'HTTP executor not yet implemented',
    };
  }
}

/**
 * Get default executors
 */
export function getDefaultExecutors(): MavExecutor[] {
  return [
    new FileMavExecutor(),
    new HttpMavExecutor(),
  ];
}

