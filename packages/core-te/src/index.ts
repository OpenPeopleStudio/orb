import { OrbContext, OrbRole, getOrbPalette } from '@orb-system/core-orb';

export interface Reflection {
  role: OrbRole;
  summary: string;
  actions: string[];
  embeddingSeed: number[];
  emphasisColor: string;
}

export interface TeReflectionRecord {
  id: string;
  user_id: string;
  session_id: string | null;
  input: string;
  output: string;
  tags: string[];
  notes: string | null;
  created_at: string;
}

export const reflect = (context: OrbContext, signals: string[]): Reflection => {
  const palette = getOrbPalette(context.role);
  const joined = signals.join(' ');
  const emphasis = joined.length % 5;
  const actions = signals.slice(0, 3).map((signal, index) => `Resolve signal ${index + 1}: ${signal}`);

  const embeddingSeed = Array.from({ length: 8 }, (_, index) => (joined.charCodeAt(index % joined.length) || 0) % 97);

  return {
    role: context.role,
    summary: `${context.role.toUpperCase()} reflects on ${signals.length} inputs and prioritizes quadrant ${emphasis + 1}.`,
    actions,
    embeddingSeed,
    emphasisColor: palette.accent,
  };
};

/**
 * Convert Reflection to database record format
 */
export const toReflectionRecord = (
  reflection: Reflection,
  context: OrbContext,
  input: string,
  tags: string[] = [],
  notes: string | null = null
): Omit<TeReflectionRecord, 'created_at'> => {
  return {
    id: `te_${context.sessionId}_${Date.now()}`,
    user_id: context.userId || 'anonymous',
    session_id: context.sessionId,
    input,
    output: reflection.summary,
    tags,
    notes,
  };
};
