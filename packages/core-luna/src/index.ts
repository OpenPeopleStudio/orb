import { OrbContext, OrbRole, createOrbContext } from '@orb-system/core-orb';

export interface PersonaBrief extends OrbContext {
  principles: string[];
  voice: 'operational' | 'narrative' | 'design' | 'systems';
}

const roleVoices: Record<OrbRole, PersonaBrief['voice']> = {
  [OrbRole.SOL]: 'narrative',
  [OrbRole.TE]: 'operational',
  [OrbRole.MAV]: 'operational',
  [OrbRole.LUNA]: 'design',
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
