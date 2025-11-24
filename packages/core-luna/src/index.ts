import { OrbContext, OrbRole, createOrbContext } from '@orb-system/core-orb';

export interface PersonaBrief extends OrbContext {
  principles: string[];
  voice: 'operational' | 'narrative' | 'design' | 'systems';
}

export interface LunaProfileRecord {
  user_id: string;
  mode_id: string;
  preferences: Record<string, unknown>;
  constraints: Record<string, unknown>;
  updated_at: string;
}

export interface LunaActiveModeRecord {
  user_id: string;
  mode_id: string;
  updated_at: string;
}

const roleVoices: Record<OrbRole, PersonaBrief['voice']> = {
  [OrbRole.ORB]: 'systems',
  [OrbRole.SOL]: 'narrative',
  [OrbRole.TE]: 'operational',
  [OrbRole.MAV]: 'operational',
  [OrbRole.LUNA]: 'design',
  [OrbRole.FORGE]: 'systems',
};

export const buildPersonaBrief = (
  role: OrbRole,
  overrides: Partial<PersonaBrief> = {},
): PersonaBrief => {
  const sessionId = overrides.sessionId || `session-${Date.now()}`;
  const context = createOrbContext(role, sessionId, {
    userId: overrides.userId,
    deviceId: overrides.deviceId,
    mode: overrides.mode,
    persona: overrides.persona,
  });

  const principles = overrides.principles ?? [
    'lead with clarity',
    'bias to action',
    'close the loop',
  ];

  return {
    ...context,
    principles,
    voice: overrides.voice ?? roleVoices[role],
  };
};

/**
 * Convert PersonaBrief to Luna profile record format
 */
export const toProfileRecord = (
  brief: PersonaBrief,
  preferences: Record<string, unknown> = {},
  constraints: Record<string, unknown> = {}
): Omit<LunaProfileRecord, 'updated_at'> => {
  return {
    user_id: brief.userId || 'anonymous',
    mode_id: brief.mode || 'default',
    preferences,
    constraints,
  };
};

/**
 * Convert to Luna active mode record format
 */
export const toActiveModeRecord = (
  userId: string,
  modeId: string
): Omit<LunaActiveModeRecord, 'updated_at'> => {
  return {
    user_id: userId,
    mode_id: modeId,
  };
};
