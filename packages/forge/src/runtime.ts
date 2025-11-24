// packages/forge/src/runtime.ts
// Orb runtime helper utilities kept for backwards compatibility.

import { OrbRole, createOrbContext, type OrbContext } from '@orb-system/core-orb';

// Stub types (TODO: implement in respective core packages)
export interface PersonaBrief {
  title: string;
  voice: string;
  description: string;
  traits: string[];
}

export interface SolInsight {
  summary: string;
  intent: string;
  confidence: number;
  keywords: string[];
}

export interface Reflection {
  summary: string;
  insights: string[];
  patterns: string[];
}

export interface ActionPlan {
  actions: Array<{
    id: string;
    summary: string;
    status: string;
    etaMinutes: number;
  }>;
}

// Stub implementation for buildPersonaBrief (TODO: move to core-luna)
const buildPersonaBrief = (role: OrbRole): PersonaBrief => {
  const personas: Record<OrbRole, PersonaBrief> = {
    [OrbRole.ORB]: { 
      title: 'Orchestrator', 
      voice: 'strategic', 
      description: 'System orchestrator', 
      traits: ['strategic', 'balanced'] 
    },
    [OrbRole.SOL]: { 
      title: 'Analyzer', 
      voice: 'analytical', 
      description: 'Intent analyzer', 
      traits: ['analytical', 'insightful'] 
    },
    [OrbRole.TE]: { 
      title: 'Reflector', 
      voice: 'contemplative', 
      description: 'Reflection engine', 
      traits: ['reflective', 'learning'] 
    },
    [OrbRole.MAV]: { 
      title: 'Executor', 
      voice: 'practical', 
      description: 'Action executor', 
      traits: ['practical', 'decisive'] 
    },
    [OrbRole.LUNA]: { 
      title: 'Adapter', 
      voice: 'empathetic', 
      description: 'Preference manager', 
      traits: ['adaptive', 'user-focused'] 
    },
    [OrbRole.FORGE]: { 
      title: 'Coordinator', 
      voice: 'systemic', 
      description: 'Multi-agent coordinator', 
      traits: ['orchestrating', 'systemic'] 
    },
  };
  return personas[role] || { 
    title: 'Unknown', 
    voice: 'neutral', 
    description: 'Unknown role', 
    traits: [] 
  };
};

// Stub implementation for analyzeIntent (TODO: move to core-sol)
const analyzeIntent = (context: OrbContext, input: string): SolInsight => {
  return {
    summary: input,
    intent: 'general',
    confidence: 0.8,
    keywords: input.split(' ').slice(0, 3),
  };
};

// Stub implementation for reflect (TODO: move to core-te)
const reflect = (context: OrbContext, summaries: string[]): Reflection => {
  return {
    summary: summaries.length > 0 ? summaries[summaries.length - 1] : 'No insights yet',
    insights: summaries,
    patterns: ['Consistent progress', 'Active engagement'],
  };
};

// Stub implementation for buildActionPlan (TODO: move to core-mav)
const buildActionPlan = (context: OrbContext, goals: string[]): ActionPlan => {
  return {
    actions: goals.map((goal, idx) => ({
      id: `action-${idx}`,
      summary: goal,
      status: 'pending',
      etaMinutes: 15 + idx * 10,
    })),
  };
};

// Stub implementation for summarizeSignals (TODO: move to core-sol)
const summarizeSignals = (insights: SolInsight[]): string => {
  if (insights.length === 0) return 'No signals yet';
  return `${insights.length} insights tracked`;
};

export interface OrbRuntime {
  role: OrbRole;
  insights: SolInsight[];
  addSignal: (input: string) => SolInsight;
  reflect: () => Reflection;
  plan: (goals: string[]) => ActionPlan;
  persona: PersonaBrief;
  summary: () => string;
}

export const buildOrbRuntime = (role: OrbRole): OrbRuntime => {
  const context = createOrbContext(role, `session-${Date.now()}`);
  const persona = buildPersonaBrief(role);
  const insights: SolInsight[] = [];

  const addSignal = (input: string) => {
    const insight = analyzeIntent(context, input);
    insights.push(insight);
    return insight;
  };

  const reflectFn = () => reflect(context, insights.map((insight) => insight.summary));
  const planFn = (goals: string[]) => buildActionPlan(context, goals);
  const summary = () => summarizeSignals(insights);

  return {
    role,
    insights,
    addSignal,
    reflect: reflectFn,
    plan: planFn,
    persona,
    summary,
  };
};

