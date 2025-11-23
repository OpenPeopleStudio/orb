/**
 * Constraint Builder
 * 
 * Helper functions for building constraint sets from configuration.
 */

import type {
  Constraint,
  ConstraintSet,
  ConstraintType,
  ConstraintSeverity,
  RiskLevel,
} from './types';
import type { OrbMode, OrbPersona, OrbDevice } from '../identity/types';
import type { OrbRole } from '../orbRoles';

let constraintIdCounter = 0;

/**
 * Generate a unique constraint ID
 */
function generateConstraintId(prefix: string = 'constraint'): string {
  return `${prefix}-${Date.now()}-${constraintIdCounter++}`;
}

/**
 * Create a constraint set
 */
export function createConstraintSet(
  name: string,
  constraints: Constraint[],
  options?: {
    id?: string;
    description?: string;
    priority?: number;
    metadata?: Record<string, unknown>;
  }
): ConstraintSet {
  return {
    id: options?.id || generateConstraintId('set'),
    name,
    description: options?.description,
    constraints,
    priority: options?.priority || 0,
    metadata: options?.metadata,
  };
}

/**
 * Create a block tool constraint
 */
export function blockTool(
  toolId: string,
  options?: {
    id?: string;
    description?: string;
    reason?: string;
    severity?: ConstraintSeverity;
    appliesToModes?: OrbMode[];
    appliesToPersonas?: OrbPersona[];
  }
): Constraint {
  return {
    id: options?.id || generateConstraintId('block-tool'),
    type: 'block_tool',
    active: true,
    severity: options?.severity || 'error',
    toolId,
    description: options?.description || `Block tool: ${toolId}`,
    reason: options?.reason,
    appliesToModes: options?.appliesToModes,
    appliesToPersonas: options?.appliesToPersonas,
  };
}

/**
 * Create a max risk constraint
 */
export function maxRisk(
  maxRisk: RiskLevel,
  options?: {
    id?: string;
    description?: string;
    reason?: string;
    severity?: ConstraintSeverity;
    appliesToModes?: OrbMode[];
    appliesToRoles?: OrbRole[];
  }
): Constraint {
  return {
    id: options?.id || generateConstraintId('max-risk'),
    type: 'max_risk',
    active: true,
    severity: options?.severity || 'error',
    maxRisk,
    description: options?.description || `Maximum risk level: ${maxRisk}`,
    reason: options?.reason,
    appliesToModes: options?.appliesToModes,
    appliesToRoles: options?.appliesToRoles,
  };
}

/**
 * Create a require confirmation constraint
 */
export function requireConfirmation(
  description: string,
  options?: {
    id?: string;
    reason?: string;
    appliesToModes?: OrbMode[];
    appliesToRoles?: OrbRole[];
  }
): Constraint {
  return {
    id: options?.id || generateConstraintId('require-confirm'),
    type: 'require_confirmation',
    active: true,
    severity: 'warning',
    description,
    reason: options?.reason,
    appliesToModes: options?.appliesToModes,
    appliesToRoles: options?.appliesToRoles,
  };
}

/**
 * Create a mode transition constraint
 */
export function restrictModeTransition(
  allowedModes: OrbMode[],
  options?: {
    id?: string;
    description?: string;
    reason?: string;
    appliesToModes?: OrbMode[];
  }
): Constraint {
  return {
    id: options?.id || generateConstraintId('mode-transition'),
    type: 'mode_transition',
    active: true,
    severity: 'error',
    allowedModes,
    description: options?.description || `Allowed modes: ${allowedModes.join(', ')}`,
    reason: options?.reason,
    appliesToModes: options?.appliesToModes,
  };
}

/**
 * Create a persona mismatch constraint
 */
export function requirePersona(
  requiredPersona: OrbPersona,
  options?: {
    id?: string;
    description?: string;
    reason?: string;
    appliesToModes?: OrbMode[];
  }
): Constraint {
  return {
    id: options?.id || generateConstraintId('persona'),
    type: 'persona_mismatch',
    active: true,
    severity: 'error',
    requiredPersona,
    description: options?.description || `Required persona: ${requiredPersona}`,
    reason: options?.reason,
    appliesToModes: options?.appliesToModes,
  };
}

/**
 * Create a device restriction constraint
 */
export function restrictToDevices(
  allowedDevices: OrbDevice[],
  options?: {
    id?: string;
    description?: string;
    reason?: string;
  }
): Constraint {
  return {
    id: options?.id || generateConstraintId('device'),
    type: 'device_restriction',
    active: true,
    severity: 'error',
    appliesToDevices: allowedDevices,
    description: options?.description || `Allowed devices: ${allowedDevices.join(', ')}`,
    reason: options?.reason,
  };
}

/**
 * Parse constraint strings from mode descriptors into Constraint objects
 * 
 * This handles the `defaultConstraints` arrays from mode descriptors
 * which are currently string-based (e.g. "no-destructive-actions").
 * 
 * TODO: CORE_ORB_AGENT - Expand this mapping as needed
 */
export function parseConstraintString(
  constraintStr: string,
  mode?: OrbMode
): Constraint | null {
  const id = generateConstraintId(constraintStr);
  
  switch (constraintStr) {
    case 'no-destructive-actions':
      return {
        id,
        type: 'max_risk',
        active: true,
        severity: 'critical',
        maxRisk: 'medium',
        description: 'Prevent destructive actions',
        reason: 'Destructive actions are not allowed in this mode',
        appliesToModes: mode ? [mode] : undefined,
      };
      
    case 'require-confirmation':
      return requireConfirmation('Actions require confirmation', {
        id,
        appliesToModes: mode ? [mode] : undefined,
      });
      
    case 'no-personal-notifications':
      return {
        id,
        type: 'block_action',
        active: true,
        severity: 'warning',
        description: 'Block personal notifications',
        reason: 'Personal notifications are muted in this mode',
        appliesToModes: mode ? [mode] : undefined,
      };
      
    case 'fast-confirmations':
      return {
        id,
        type: 'other',
        active: true,
        severity: 'warning',
        description: 'Use fast confirmation flows',
        reason: 'Optimize for speed in this mode',
        appliesToModes: mode ? [mode] : undefined,
      };
      
    case 'no-work-alerts':
      return {
        id,
        type: 'block_action',
        active: true,
        severity: 'warning',
        description: 'Block work-related alerts',
        reason: 'Work alerts are muted in this mode',
        appliesToModes: mode ? [mode] : undefined,
      };
      
    case 'limit-task-creation':
      return {
        id,
        type: 'require_confirmation',
        active: true,
        severity: 'warning',
        description: 'Require confirmation for task creation',
        reason: 'Task creation should be intentional in this mode',
        appliesToModes: mode ? [mode] : undefined,
      };
      
    case 'suppress-non-research':
      return {
        id,
        type: 'block_action',
        active: true,
        severity: 'warning',
        description: 'Suppress non-research notifications',
        reason: 'Focus on research in this mode',
        appliesToModes: mode ? [mode] : undefined,
      };
      
    case 'require-review':
      return requireConfirmation('Changes require review', {
        id,
        reason: 'All changes must be reviewed before merging',
        appliesToModes: mode ? [mode] : undefined,
      });
      
    case 'mute-personal':
      return {
        id,
        type: 'block_action',
        active: true,
        severity: 'warning',
        description: 'Mute personal notifications',
        reason: 'Personal notifications are muted during service',
        appliesToModes: mode ? [mode] : undefined,
      };
      
    case 'require-deal-links':
      return requireConfirmation('Actions should link to deals', {
        id,
        reason: 'Maintain traceability to deals/properties',
        appliesToModes: mode ? [mode] : undefined,
      });
      
    case 'no-prod-writes':
      return {
        id,
        type: 'block_action',
        active: true,
        severity: 'critical',
        description: 'Block production writes',
        reason: 'Production writes are not allowed in builder mode',
        appliesToModes: mode ? [mode] : undefined,
      };
      
    default:
      // Unknown constraint string - create a generic "other" constraint
      return {
        id,
        type: 'other',
        active: true,
        severity: 'warning',
        description: constraintStr,
        appliesToModes: mode ? [mode] : undefined,
      };
  }
}

