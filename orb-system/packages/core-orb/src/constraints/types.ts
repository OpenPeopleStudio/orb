/**
 * Constraints Types
 * 
 * Core constraint types for the Orb system.
 * These define the shape of constraints, evaluation contexts, and results.
 */

import type { OrbMode, OrbPersona, OrbDevice } from '../identity/types';
import type { OrbRole } from '../orbRoles';

/**
 * Action Context - full context for evaluating an action
 * 
 * This includes mode, persona, device, feature area, and any
 * additional metadata needed for constraint evaluation.
 */
export interface ActionContext {
  userId: string;
  sessionId: string;
  deviceId?: string;
  device?: OrbDevice;
  mode: OrbMode;
  persona: OrbPersona;
  feature?: string; // e.g. 'SWL', 'RealEstate', 'Personal'
  role?: OrbRole;
  timestamp?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Constraint Type - different kinds of constraints
 */
export type ConstraintType =
  | 'block_action'      // Block a specific action entirely
  | 'block_tool'        // Block use of a specific tool
  | 'max_risk'          // Limit maximum risk level
  | 'require_confirmation' // Require user confirmation
  | 'mode_transition'   // Restrict mode transitions
  | 'persona_mismatch'  // Block if persona doesn't match
  | 'device_restriction' // Restrict to specific devices
  | 'time_restriction'  // Restrict based on time
  | 'other';            // Custom/extensible

/**
 * Risk Level - how risky an action is
 */
export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

/**
 * Constraint Severity - how serious a violation is
 */
export type ConstraintSeverity = 'warning' | 'error' | 'critical';

/**
 * Constraint - a single constraint definition
 */
export interface Constraint {
  id: string;
  type: ConstraintType;
  active: boolean;
  severity: ConstraintSeverity;
  
  // Scope - when does this constraint apply?
  appliesToModes?: OrbMode[];
  appliesToPersonas?: OrbPersona[];
  appliesToDevices?: OrbDevice[];
  appliesToRoles?: OrbRole[];
  appliesToFeatures?: string[];
  
  // Type-specific fields
  toolId?: string;           // For block_tool
  actionId?: string;         // For block_action
  maxRisk?: RiskLevel;       // For max_risk
  allowedModes?: OrbMode[];  // For mode_transition
  requiredPersona?: OrbPersona; // For persona_mismatch
  
  // Metadata
  description: string;
  reason?: string;
  createdAt?: string;
  updatedAt?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Constraint Set - a collection of constraints
 */
export interface ConstraintSet {
  id: string;
  name: string;
  description?: string;
  constraints: Constraint[];
  priority: number; // Higher = evaluated first
  metadata?: Record<string, unknown>;
}

/**
 * Evaluation Result - result of evaluating an action against constraints
 */
export interface ConstraintEvaluationResult {
  allowed: boolean;
  decision: 'allow' | 'deny' | 'require_confirmation';
  reasons: string[];
  triggeredConstraints: TriggeredConstraint[];
  effectiveRisk: RiskLevel;
  recommendations?: string[];
  metadata?: Record<string, unknown>;
}

/**
 * Triggered Constraint - a constraint that was violated
 */
export interface TriggeredConstraint {
  constraintId: string;
  constraintType: ConstraintType;
  severity: ConstraintSeverity;
  reason: string;
  metadata?: Record<string, unknown>;
}

/**
 * Mode Transition Request - request to change modes
 */
export interface ModeTransitionRequest {
  fromMode: OrbMode;
  toMode: OrbMode;
  context: ActionContext;
  reason?: string;
  forced?: boolean; // Override constraints
}

/**
 * Mode Transition Result - result of attempting a mode transition
 */
export interface ModeTransitionResult {
  allowed: boolean;
  fromMode: OrbMode;
  toMode: OrbMode;
  reasons: string[];
  triggeredConstraints: TriggeredConstraint[];
  recommendations?: string[];
  timestamp: string;
}

/**
 * Action Descriptor - describes an action to be evaluated
 */
export interface ActionDescriptor {
  id: string;
  type: 'tool_call' | 'file_write' | 'file_read' | 'api_call' | 'mode_change' | 'other';
  role: OrbRole;
  toolId?: string;
  targetPath?: string;
  apiEndpoint?: string;
  estimatedRisk?: RiskLevel;
  description: string;
  metadata?: Record<string, unknown>;
}

