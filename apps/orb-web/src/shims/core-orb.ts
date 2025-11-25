export enum OrbRole {
  ORB = 'orb',
  SOL = 'sol',
  TE = 'te',
  MAV = 'mav',
  LUNA = 'luna',
  FORGE = 'forge',
}

export const roleOrder: OrbRole[] = [
  OrbRole.ORB,
  OrbRole.SOL,
  OrbRole.MAV,
  OrbRole.TE,
  OrbRole.LUNA,
  OrbRole.FORGE,
];

export enum OrbEventType {
  TASK_STARTED = 'task_started',
  TASK_COMPLETED = 'task_completed',
  MODE_CHANGED = 'mode_changed',
  PREFERENCE_UPDATED = 'preference_updated',
  ERROR = 'error',
}

export type OrbMode = 'default' | 'restaurant' | 'real_estate' | 'builder';

export const OrbModeLabel: Record<OrbMode, string> = {
  default: 'Default',
  restaurant: 'Restaurant',
  real_estate: 'Real Estate',
  builder: 'Builder',
};

export type OrbPersona = 'personal' | 'business' | 'executive' | 'investor';

export const PersonaLabel: Record<OrbPersona, string> = {
  personal: 'Personal',
  business: 'Business',
  executive: 'Executive',
  investor: 'Investor',
};

export type EventFilter = {
  type?: string | string[];
  userId?: string;
  sessionId?: string;
  mode?: OrbMode;
  role?: OrbRole;
  dateFrom?: string;
  dateTo?: string;
  limit?: number;
  search?: string;
};

export type EventStats = {
  totalEvents: number;
  byType: Record<string, number>;
  byMode: Record<string, number>;
  byRole: Record<string, number>;
  mostUsedModes: OrbMode[];
  errorRate: number;
};

export type OrbEvent = {
  id: string;
  type: OrbEventType;
  role: OrbRole;
  mode: OrbMode;
  summary: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
};

export type LearningAction = {
  id: string;
  type: string;
  role: OrbRole;
  description: string;
  timestamp: string;
};

export type Pattern = {
  id: string;
  confidence: number;
  title: string;
  description: string;
};

export type Insight = {
  id: string;
  title: string;
  summary: string;
  weight?: number;
};

export type DemoFlowResult = {
  mode: OrbMode;
  lunaDecision: {
    type: 'allow' | 'deny' | 'require_confirmation';
    reasons?: string[];
    effectiveRisk?: string;
  };
  mavTaskResult?: {
    status: 'completed' | 'failed' | 'partial';
    actionsCompleted: number;
    actionsTotal: number;
    metadata?: Record<string, unknown>;
    error?: string;
  };
  teEvaluation?: {
    score: number;
    tags?: string[];
    recommendations?: string[];
    summary?: string;
  };
  solInsights?: Array<{ title: string; summary: string }>;
  timeline?: Array<{ step: string; status: string; timestamp: string }>;
  diagnostics?: Record<string, unknown>;
};

export enum OrbDevice {
  SOL = 'sol',
  LUNA = 'luna',
  TE = 'te',
  MAV = 'mav',
}

export type ConstraintSeverity = 'warn' | 'warning' | 'block' | 'error';

export type Constraint = {
  id: string;
  label: string;
  description?: string;
  severity: ConstraintSeverity;
};

export type ConstraintSet = {
  id: string;
  label: string;
  scope: string;
  constraints: Constraint[];
};

export type ConstraintEvaluationResult = {
  allowed: boolean;
  decision: 'allow' | 'deny' | 'require_confirmation';
  reasons: string[];
  effectiveRisk: string;
};

export type PersonaClassificationResult = {
  persona: OrbPersona;
  confidence: number;
  reason?: string;
  source: 'inferred' | 'override' | 'default';
};

const MOCK_EVENTS: OrbEvent[] = [
  {
    id: 'evt-1',
    type: OrbEventType.TASK_STARTED,
    role: OrbRole.MAV,
    mode: 'default',
    summary: 'Task runner initialized mission plan.',
    timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
  },
  {
    id: 'evt-2',
    type: OrbEventType.MODE_CHANGED,
    role: OrbRole.LUNA,
    mode: 'restaurant',
    summary: 'Mode switched to Restaurant after preference signal.',
    timestamp: new Date(Date.now() - 1000 * 60 * 4).toISOString(),
  },
  {
    id: 'evt-3',
    type: OrbEventType.TASK_COMPLETED,
    role: OrbRole.TE,
    mode: 'restaurant',
    summary: 'TE evaluation scored execution at 84.',
    timestamp: new Date(Date.now() - 1000 * 60 * 2).toISOString(),
  },
];

const eventBus = {
  async query(filter: EventFilter = {}): Promise<OrbEvent[]> {
    return MOCK_EVENTS.filter((event) => {
      if (filter.type) {
        const types = Array.isArray(filter.type) ? filter.type : [filter.type];
        if (!types.includes(event.type)) return false;
      }
      if (filter.mode && filter.mode !== event.mode) return false;
      if (filter.role && filter.role !== event.role) return false;
      return true;
    }).slice(0, filter.limit ?? 100);
  },
  async getStats(): Promise<EventStats> {
    return {
      totalEvents: MOCK_EVENTS.length,
      byType: MOCK_EVENTS.reduce((acc, event) => {
        acc[event.type] = (acc[event.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      byMode: MOCK_EVENTS.reduce((acc, event) => {
        acc[event.mode] = (acc[event.mode] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      byRole: MOCK_EVENTS.reduce((acc, event) => {
        acc[event.role] = (acc[event.role] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      mostUsedModes: ['default', 'restaurant', 'builder'],
      errorRate: 0.02,
    };
  },
};

export function initializeEventSinks() {
  // No-op in browser stub
}

export function getEventBus() {
  return eventBus;
}

export function createOrbContext(
  role: OrbRole,
  sessionId: string,
  options?: { userId?: string; mode?: OrbMode; persona?: OrbPersona; deviceId?: string }
) {
  return {
    role,
    sessionId,
    userId: options?.userId ?? 'demo-user',
    deviceId: options?.deviceId ?? 'web',
    mode: options?.mode ?? 'default',
    persona: options?.persona ?? 'personal',
  };
}

export async function runDemoFlow(input: {
  userId: string;
  sessionId: string;
  prompt: string;
  mode: OrbMode;
}): Promise<DemoFlowResult> {
  const now = Date.now();
  return {
    mode: input.mode,
    lunaDecision: {
      type: 'allow',
      reasons: ['Constraints satisfied', 'Risk remains low'],
      effectiveRisk: 'low',
    },
    mavTaskResult: {
      status: 'completed',
      actionsCompleted: 5,
      actionsTotal: 5,
      metadata: {
        summary: 'Generated recommendations and follow-up tasks.',
        filesTouched: ['plans/mission.md', 'notes/context.txt'],
      },
    },
    teEvaluation: {
      score: 84,
      tags: ['quality', 'thorough'],
      recommendations: ['Send recap email to user', 'Schedule follow-up check-in'],
      summary: 'Execution met expectations with minor improvements suggested.',
    },
    solInsights: [
      {
        title: 'User preference detected',
        summary: 'User prefers high-urgency framing with fast follow-ups.',
      },
    ],
    timeline: [
      { step: 'Persona classification', status: 'completed', timestamp: new Date(now - 4000).toISOString() },
      { step: 'Constraint evaluation', status: 'completed', timestamp: new Date(now - 3000).toISOString() },
      { step: 'Mission planning', status: 'completed', timestamp: new Date(now - 2000).toISOString() },
      { step: 'Reflection', status: 'completed', timestamp: new Date(now - 1000).toISOString() },
    ],
    diagnostics: {
      prompt: input.prompt,
      sessionId: input.sessionId,
    },
  };
}

export function getModeDisplayName(mode: OrbMode) {
  return OrbModeLabel[mode] ?? 'Unknown';
}

export function getPersonaDisplayName(persona: OrbPersona) {
  return PersonaLabel[persona] ?? 'Unknown';
}

export function classifyPersona(_context: {
  userId: string;
  device: OrbDevice;
  mode: OrbMode;
}): PersonaClassificationResult {
  return {
    persona: 'personal' as OrbPersona,
    confidence: 0.78,
    reason: 'Default persona for demo user',
    source: 'inferred',
  };
}

const mockConstraintSets: ConstraintSet[] = [
  {
    id: 'safety',
    label: 'Safety Constraints',
    scope: 'global',
    constraints: [
      {
        id: 'risk-check',
        label: 'Risk level monitor',
        severity: 'warn',
        description: 'Warn when estimated risk exceeds medium.',
      },
      {
        id: 'require-confirmation',
        label: 'High impact confirmation',
        severity: 'warning',
        description: 'Require confirmation for sensitive actions.',
      },
    ],
  },
  {
    id: 'mode-specific',
    label: 'Mode Guardrails',
    scope: 'mode',
    constraints: [
      {
        id: 'restaurant-content',
        label: 'Restaurant focus',
        severity: 'warn',
        description: 'Favor hospitality context when in restaurant mode.',
      },
    ],
  },
];

export async function getRelevantConstraintSets(
  _context: ActionContext
): Promise<ConstraintSet[]> {
  return mockConstraintSets;
}

export function setPersonaOverride(_userId: string, _persona: OrbPersona | null) {
  // No-op stub
}

export type ActionContext = {
  userId: string;
  device: OrbDevice;
  mode: OrbMode;
  persona: OrbPersona;
};

export type PreferenceSnapshot = {
  userId: string;
  mode: OrbMode;
  preferences: string[];
  constraints: ConstraintSet[];
};

