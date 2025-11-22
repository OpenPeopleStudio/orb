/**
 * Orb Logging
 * 
 * Tagged logging by OrbRole for better observability.
 */

import { OrbRole } from './orbRoles';
import { getConfig } from './config';

export interface LogContext {
  userId?: string | null;
  sessionId?: string;
  mode?: string;
  [key: string]: unknown;
}

const ROLE_COLORS: Record<OrbRole, string> = {
  [OrbRole.SOL]: '\x1b[36m', // Cyan
  [OrbRole.TE]: '\x1b[32m',  // Green
  [OrbRole.MAV]: '\x1b[33m',  // Yellow
  [OrbRole.LUNA]: '\x1b[35m', // Magenta
};

const RESET = '\x1b[0m';

/**
 * Orb logger tagged by role
 */
export class OrbLog {
  private role: OrbRole;
  private context?: LogContext;

  constructor(role: OrbRole, context?: LogContext) {
    this.role = role;
    this.context = context;
  }

  private formatMessage(level: string, message: string, ...args: unknown[]): string {
    const color = ROLE_COLORS[this.role];
    const roleName = this.role.padEnd(5);
    const timestamp = new Date().toISOString();
    
    const contextStr = this.context
      ? ` [${this.context.userId || '?'}${this.context.mode ? `/${this.context.mode}` : ''}${this.context.sessionId ? `:${this.context.sessionId.slice(-8)}` : ''}]`
      : '';
    
    const formattedArgs = args.length > 0 ? ' ' + args.map(a => 
      typeof a === 'object' ? JSON.stringify(a) : String(a)
    ).join(' ') : '';
    
    return `${color}[${timestamp}] [${roleName}]${contextStr} ${level}: ${message}${formattedArgs}${RESET}`;
  }

  info(message: string, ...args: unknown[]): void {
    if (getConfig().nodeEnv !== 'test') {
      console.log(this.formatMessage('INFO', message, ...args));
    }
  }

  warn(message: string, ...args: unknown[]): void {
    console.warn(this.formatMessage('WARN', message, ...args));
  }

  error(message: string, ...args: unknown[]): void {
    console.error(this.formatMessage('ERROR', message, ...args));
  }

  debug(message: string, ...args: unknown[]): void {
    if (getConfig().nodeEnv === 'development') {
      console.debug(this.formatMessage('DEBUG', message, ...args));
    }
  }
}

/**
 * Create a logger for a specific role
 */
export function createOrbLog(role: OrbRole, context?: LogContext): OrbLog {
  return new OrbLog(role, context);
}

