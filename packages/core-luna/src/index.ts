import { OrbContext, OrbRole, createOrbContext } from '@orb-system/core-orb';

export interface PersonaBrief extends OrbContext {
  principles: string[];
  voice: 'operational' | 'narrative' | 'design' | 'systems';
}

const roleVoices: Record<OrbRole, PersonaBrief['voice']> = {
  orb: 'systems',
  sol: 'narrative',
  te: 'operational',
  mav: 'operational',
  luna: 'design',
  forge: 'systems',
};

export const buildPersonaBrief = (
  role: OrbRole,
  overrides: Partial<PersonaBrief> = {},
): PersonaBrief => {
  const context = createOrbContext(role, overrides);

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
