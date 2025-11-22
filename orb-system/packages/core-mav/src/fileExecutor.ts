/**
 * File-based Mav Executor
 * 
 * Role: OrbRole.MAV (actions/tools)
 * 
 * Executes actions by writing to a log file (orb-actions.log).
 */

import { OrbRole, OrbContext } from '@orb-system/core-orb';
import * as fs from 'fs/promises';
import * as path from 'path';

export interface MavActionResult {
  success: boolean;
  output?: string;
  error?: string;
  metadata?: Record<string, unknown>;
}

export interface MavAction {
  id: string;
  kind: string;
  toolId?: string;
  params?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

/**
 * File-based executor that writes actions to orb-actions.log
 */
export class FileMavExecutor {
  private logPath: string;

  constructor(logPath: string = './orb-actions.log') {
    this.logPath = logPath;
  }

  /**
   * Execute an action by logging it to a file
   */
  async execute(
    ctx: OrbContext,
    action: MavAction
  ): Promise<MavActionResult> {
    if (ctx.role !== OrbRole.MAV) {
      console.warn(`FileMavExecutor.execute called with role ${ctx.role}, expected MAV`);
    }

    try {
      const timestamp = new Date().toISOString();
      const logEntry = {
        timestamp,
        userId: ctx.userId || 'unknown',
        sessionId: ctx.sessionId || 'unknown',
        actionId: action.id,
        kind: action.kind,
        toolId: action.toolId || 'none',
        params: action.params || {},
        metadata: action.metadata || {},
      };

      const logLine = JSON.stringify(logEntry) + '\n';

      // Ensure directory exists
      const logDir = path.dirname(this.logPath);
      try {
        await fs.mkdir(logDir, { recursive: true });
      } catch {
        // Directory might already exist, ignore
      }

      // Append to log file
      await fs.appendFile(this.logPath, logLine, 'utf-8');

      return {
        success: true,
        output: `Action logged to ${this.logPath}`,
        metadata: {
          logPath: this.logPath,
          timestamp,
        },
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`[MAV] FileMavExecutor failed:`, errorMessage);
      
      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * Read recent log entries
   */
  async readRecentEntries(limit: number = 10): Promise<string[]> {
    try {
      const content = await fs.readFile(this.logPath, 'utf-8');
      const lines = content.trim().split('\n').filter(line => line.length > 0);
      return lines.slice(-limit);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        return []; // File doesn't exist yet
      }
      throw error;
    }
  }
}

