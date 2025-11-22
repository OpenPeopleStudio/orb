/**
 * Event Types
 * 
 * Role: Core event system
 * 
 * Event bus for learning loop and adaptation.
 * Phase 6: Learning loop foundation.
 */

import type { OrbRole } from '../orbRoles';
import type { OrbDevice, OrbMode, OrbPersona } from '../identity';

/**
 * Event Type - categories of events
 */
export enum OrbEventType {
  // Task execution
  TASK_RUN = 'task_run',
  TASK_COMPLETE = 'task_complete',
  TASK_FAIL = 'task_fail',
  
  // User actions
  USER_ACTION = 'user_action',
  USER_INPUT = 'user_input',
  MODE_CHANGE = 'mode_change',
  
  // System events
  ERROR = 'error',
  WARNING = 'warning',
  INFO = 'info',
  
  // Reflection
  REFLECTION = 'reflection',
  EVALUATION = 'evaluation',
  
  // Luna decisions
  LUNA_DECISION = 'luna_decision',
  LUNA_ALLOW = 'luna_allow',
  LUNA_DENY = 'luna_deny',
  
  // Mav actions
  MAV_ACTION = 'mav_action',
  FILE_WRITE = 'file_write',
  FILE_READ = 'file_read',
  
  // Te evaluations
  TE_EVALUATION = 'te_evaluation',
  TE_REFLECTION = 'te_reflection',
}

/**
 * Orb Event - base event type
 */
export interface OrbEvent {
  id: string;
  type: OrbEventType;
  timestamp: string; // ISO timestamp
  
  // Context
  userId: string | null;
  sessionId?: string;
  deviceId?: OrbDevice;
  mode?: OrbMode;
  persona?: OrbPersona;
  role?: OrbRole;
  
  // Payload
  payload: Record<string, unknown>;
  
  // Metadata
  metadata?: Record<string, unknown>;
}

/**
 * Event Sink - destination for events
 */
export interface OrbEventSink {
  /**
   * Emit an event to the sink
   */
  emit(event: OrbEvent): Promise<void>;
  
  /**
   * Query events
   */
  query(filter: EventFilter): Promise<OrbEvent[]>;
  
  /**
   * Get event statistics
   */
  getStats(filter?: EventFilter): Promise<EventStats>;
}

/**
 * Event Filter - for querying events
 */
export interface EventFilter {
  type?: OrbEventType | OrbEventType[];
  userId?: string | null;
  sessionId?: string;
  deviceId?: OrbDevice;
  mode?: OrbMode;
  role?: OrbRole;
  dateFrom?: string; // ISO timestamp
  dateTo?: string; // ISO timestamp
  limit?: number;
  search?: string; // Search in payload content (case-insensitive)
}

/**
 * Event Stats - aggregated event statistics
 */
export interface EventStats {
  totalEvents: number;
  byType: Record<OrbEventType, number>;
  byMode: Record<string, number>;
  byRole: Record<OrbRole, number>;
  mostUsedModes: Array<{ mode: string; count: number }>;
  errorRate: number; // 0 to 1
  averageScore?: number; // For evaluation events
}

