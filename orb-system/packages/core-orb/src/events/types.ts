/**
 * Event Types
 * 
 * Role: Core event system
 * 
 * Event bus for learning loop and adaptation.
 * Phase 6: Learning loop foundation.
 */

import type { OrbDevice, OrbMode, OrbPersona } from '../identity';
import type { OrbRole } from '../orbRoles';

// Re-export OrbRole so it can be imported from events/types
export type { OrbRole };

/**
 * Event Type - categories of events for learning loop
 * 
 * Phase 6: Enhanced event taxonomy for learning & adaptation
 */
export enum OrbEventType {
  // Mav action events
  ACTION_STARTED = 'action_started',
  ACTION_COMPLETED = 'action_completed',
  ACTION_FAILED = 'action_failed',
  
  // Luna decision events
  DECISION_MADE = 'decision_made',
  CONSTRAINT_TRIGGERED = 'constraint_triggered',
  PREFERENCE_UPDATED = 'preference_updated',
  MODE_CHANGED = 'mode_changed',
  
  // Te reflection events
  REFLECTION_CREATED = 'reflection_created',
  PATTERN_DETECTED = 'pattern_detected',
  INSIGHT_GENERATED = 'insight_generated',
  
  // Sol inference events
  MODEL_CALLED = 'model_called',
  INTENT_ANALYZED = 'intent_analyzed',
  RECOMMENDATION_MADE = 'recommendation_made',
  
  // User events
  USER_ACTION = 'user_action',
  USER_FEEDBACK = 'user_feedback',
  SESSION_STARTED = 'session_started',
  SESSION_ENDED = 'session_ended',
  
  // Legacy/compatibility events (Phase 4)
  TASK_RUN = 'task_run',
  TASK_COMPLETE = 'task_complete',
  TASK_FAIL = 'task_fail',
  USER_INPUT = 'user_input',
  MODE_CHANGE = 'mode_change',
  ERROR = 'error',
  WARNING = 'warning',
  INFO = 'info',
  REFLECTION = 'reflection',
  EVALUATION = 'evaluation',
  LUNA_DECISION = 'luna_decision',
  LUNA_ALLOW = 'luna_allow',
  LUNA_DENY = 'luna_deny',
  LUNA_REQUIRE_CONFIRMATION = 'luna_require_confirmation',
  
  // Legacy Mav actions
  MAV_ACTION = 'mav_action',
  FILE_WRITE = 'file_write',
  FILE_READ = 'file_read',
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

