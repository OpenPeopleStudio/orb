/**
 * Orb Role Definitions
 * 
 * Core identity types for the Orb system.
 * All packages must use these roles to maintain consistency.
 */

export enum OrbRole {
  ORB = 'orb',   // System orchestrator
  SOL = 'sol',   // Engine / inference / brain
  TE = 'te',     // Reflection / memory
  MAV = 'mav',   // Actions / tools
  LUNA = 'luna', // Preferences / intent
  FORGE = 'forge', // Multi-agent coordinator
}

/**
 * Standard role order for display and iteration
 */
export const roleOrder = [
  OrbRole.ORB,
  OrbRole.SOL,
  OrbRole.TE,
  OrbRole.MAV,
  OrbRole.LUNA,
  OrbRole.FORGE,
] as const;

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
    [OrbRole.ORB]: 'Orb',
    [OrbRole.SOL]: 'Sol',
    [OrbRole.TE]: 'Te',
    [OrbRole.MAV]: 'Mav',
    [OrbRole.LUNA]: 'Luna',
    [OrbRole.FORGE]: 'Forge',
  };
  return names[role];
}

/**
 * Get role description
 */
export function getRoleDescription(role: OrbRole): string {
  const descriptions: Record<OrbRole, string> = {
    [OrbRole.ORB]: 'System orchestrator and coordinator',
    [OrbRole.SOL]: 'What the model runs on (engine/inference/brain)',
    [OrbRole.TE]: 'What the model reflects on (memory/evaluation/self-critique)',
    [OrbRole.MAV]: 'What the model accomplishes (actions/tools/execution)',
    [OrbRole.LUNA]: 'What the user decides they want it to be (intent/preferences/constraints)',
    [OrbRole.FORGE]: 'Multi-agent coordination and orchestration',
  };
  return descriptions[role];
}

/**
 * Orb Palette - color scheme for UI
 */
export interface OrbPalette {
  accent: string;
  surface: string;
  background: string;
  textPrimary: string;
  textMuted: string;
}

/**
 * Get color palette for a role
 */
export function getOrbPalette(role: OrbRole): OrbPalette {
  const palettes: Record<OrbRole, OrbPalette> = {
    [OrbRole.ORB]: {
      accent: '#b9e4ff', // Light blue
      surface: '#0c0f13',
      background: '#05070a',
      textPrimary: '#ffffff',
      textMuted: '#a0b0c0',
    },
    [OrbRole.SOL]: {
      accent: '#00d4ff', // Cyan
      surface: '#001a26',
      background: '#000d14',
      textPrimary: '#ffffff',
      textMuted: '#7f9faf',
    },
    [OrbRole.TE]: {
      accent: '#00ff88', // Green
      surface: '#001a0d',
      background: '#000d0a',
      textPrimary: '#ffffff',
      textMuted: '#7faf9f',
    },
    [OrbRole.MAV]: {
      accent: '#ffaa00', // Yellow/Orange
      surface: '#261a00',
      background: '#140d00',
      textPrimary: '#ffffff',
      textMuted: '#af9f7f',
    },
    [OrbRole.LUNA]: {
      accent: '#ff00ff', // Magenta
      surface: '#26001a',
      background: '#14000d',
      textPrimary: '#ffffff',
      textMuted: '#af7f9f',
    },
    [OrbRole.FORGE]: {
      accent: '#e0b0ff', // Light purple
      surface: '#1a0026',
      background: '#0d0014',
      textPrimary: '#ffffff',
      textMuted: '#9f7faf',
    },
  };
  return palettes[role];
}

