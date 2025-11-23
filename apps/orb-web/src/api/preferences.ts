import {
  modeService,
  createProfileFromPreset,
  type Mode,
  type Persona,
} from '@orb-system/core-luna';
import {
  OrbDevice,
  OrbPersona,
  classifyPersona,
  getRelevantConstraintSets,
  setPersonaOverride,
  type ActionContext,
  type ConstraintSet,
} from '@orb-system/core-orb';

const DEFAULT_USER_ID = 'demo-user';
const DEFAULT_DEVICE = OrbDevice.SOL;

export interface ConstraintSummary {
  id: string;
  label: string;
  scope: string;
  constraintCount: number;
  constraints: Array<{
    id: string;
    label: string;
    severity: string;
    description?: string;
  }>;
}

export interface PreferencesSnapshot {
  userId: string;
  mode: Mode;
  persona: {
    id: Persona;
    confidence: number;
    reason: string;
    source: string;
    override?: Persona | null;
  };
  preferences: string[];
  constraints: ConstraintSummary[];
}

export interface PreferencesUpdatePayload {
  userId?: string;
  personaOverride?: OrbPersona | null;
}

export async function getPreferencesSnapshot(
  userId: string = DEFAULT_USER_ID,
): Promise<PreferencesSnapshot> {
  const mode = modeService.getCurrentMode();
  const personaResult = classifyPersona({
    userId,
    device: DEFAULT_DEVICE,
    mode,
  });

  const profile = createProfileFromPreset(userId, mode);

  const constraintContext: ActionContext = {
    userId,
    device: DEFAULT_DEVICE,
    mode,
    persona: personaResult.persona,
  };

  const constraintSets = await getRelevantConstraintSets(constraintContext);
  const summarizedConstraints = summarizeConstraints(constraintSets);

  return {
    userId,
    mode,
    persona: {
      id: personaResult.persona as Persona,
      confidence: personaResult.confidence,
      reason: personaResult.reason,
      source: personaResult.source,
      override: personaResult.source === 'override' ? (personaResult.persona as Persona) : null,
    },
    preferences: profile.preferences,
    constraints: summarizedConstraints,
  };
}

export async function updatePreferences(payload: PreferencesUpdatePayload): Promise<PreferencesSnapshot> {
  const userId = payload.userId || DEFAULT_USER_ID;
  if (payload.personaOverride !== undefined) {
    setPersonaOverride(userId, payload.personaOverride);
  }
  return getPreferencesSnapshot(userId);
}

function summarizeConstraints(constraintSets: ConstraintSet[]): ConstraintSummary[] {
  return constraintSets.map((set) => ({
    id: set.id,
    label: set.label,
    scope: set.scope,
    constraintCount: set.constraints.length,
    constraints: set.constraints.slice(0, 4).map((constraint) => ({
      id: constraint.id,
      label: constraint.label,
      severity: constraint.severity,
      description: constraint.description,
    })),
  }));
}

