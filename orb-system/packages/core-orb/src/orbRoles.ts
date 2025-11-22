/**
 * Orb Role Definitions
 * 
 * Core identity types for the Orb system.
 * All packages must use these roles to maintain consistency.
 */

export enum OrbRole {
  SOL = 'sol',   // Engine / inference / brain
  TE = 'te',     // Reflection / memory
  MAV = 'mav',   // Actions / tools
  LUNA = 'luna', // Preferences / intent
}

/**
 * Orb Context
 * 
 * Provides role-aware context for operations across the Orb system.
 * Used to tag operations, validate permissions, and route requests.
 */
export type OrbContext = {
  role: OrbRole;
  userId: string | null;
  sessionId: string;
  deviceId?: string;
  mode?: string;
  persona?: string;
  timestamp?: Date;
};

/**
 * Create a new Orb context
 */
export function createOrbContext(
  role: OrbRole,
  sessionId: string,
  options?: {
    userId?: string | null;
    deviceId?: string;
    mode?: string;
    persona?: string;
  }
): OrbContext {
  return {
    role,
    userId: options?.userId ?? null,
    sessionId,
    deviceId: options?.deviceId,
    mode: options?.mode,
    persona: options?.persona,
    timestamp: new Date(),
  };
}

/**
 * Validate that a context has the expected role
 */
export function validateRole(context: OrbContext, expectedRole: OrbRole): boolean {
  return context.role === expectedRole;
}

/**
 * Get role display name
 */
export function getRoleDisplayName(role: OrbRole): string {
  const names: Record<OrbRole, string> = {
    [OrbRole.SOL]: 'Sol',
    [OrbRole.TE]: 'Te',
    [OrbRole.MAV]: 'Mav',
    [OrbRole.LUNA]: 'Luna',
  };
  return names[role];
}

/**
 * Get role description
 */
export function getRoleDescription(role: OrbRole): string {
  const descriptions: Record<OrbRole, string> = {
    [OrbRole.SOL]: 'What the model runs on (engine/inference/brain)',
    [OrbRole.TE]: 'What the model reflects on (memory/evaluation/self-critique)',
    [OrbRole.MAV]: 'What the model accomplishes (actions/tools/execution)',
    [OrbRole.LUNA]: 'What the user decides they want it to be (intent/preferences/constraints)',
  };
  return descriptions[role];
}

