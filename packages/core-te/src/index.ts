import { OrbContext, OrbRole, getOrbPalette } from '@orb-system/core-orb';

export interface Reflection {
  role: OrbRole;
  summary: string;
  actions: string[];
  embeddingSeed: number[];
  emphasisColor: string;
}

export const reflect = (context: OrbContext, signals: string[]): Reflection => {
  const palette = getOrbPalette(context.role);
  const joined = signals.join(' ');
  const emphasis = joined.length % 5;
  const actions = signals.slice(0, 3).map((signal, index) => `Resolve signal ${index + 1}: ${signal}`);

  const embeddingSeed = Array.from({ length: 8 }, (_, index) => (joined.charCodeAt(index % joined.length) || 0) % 97);

  return {
    role: context.role,
    summary: `${context.title} reflects on ${signals.length} inputs and prioritizes quadrant ${emphasis + 1}.`,
    actions,
    embeddingSeed,
    emphasisColor: palette.accent,
  };
};
