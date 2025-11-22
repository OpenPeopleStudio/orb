// packages/forge/src/runtime.ts
// Orb runtime helper utilities kept for backwards compatibility.

import { buildPersonaBrief, type PersonaBrief } from '@orb-system/core-luna';
import { buildActionPlan, type ActionPlan } from '@orb-system/core-mav';
import { ORB_CONTEXTS, type OrbRole } from '@orb-system/core-orb';
import { analyzeIntent, type SolInsight, summarizeSignals } from '@orb-system/core-sol';
import { reflect, type Reflection } from '@orb-system/core-te';

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
  const context = ORB_CONTEXTS[role];
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

export { analyzeIntent, summarizeSignals } from '@orb-system/core-sol';
export { reflect } from '@orb-system/core-te';
export { buildActionPlan } from '@orb-system/core-mav';
export { buildPersonaBrief } from '@orb-system/core-luna';

