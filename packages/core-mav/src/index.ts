import { OrbContext, OrbRole, getOrbPalette } from '@orb-system/core-orb';

export interface ActionPlanItem {
  id: string;
  owner: OrbRole;
  summary: string;
  etaMinutes: number;
  status: 'queued' | 'in-flight' | 'done';
}

export interface ActionPlan {
  owner: OrbRole;
  actions: ActionPlanItem[];
  accent: string;
}

const randomId = () => Math.random().toString(36).slice(2, 8);

export const buildActionPlan = (context: OrbContext, goals: string[]): ActionPlan => {
  const palette = getOrbPalette(context.role);
  const actions: ActionPlanItem[] = goals.map((goal, index) => ({
    id: randomId(),
    owner: context.role,
    summary: goal,
    etaMinutes: 15 * (index + 1),
    status: index === 0 ? 'in-flight' : 'queued',
  }));

  if (!actions.length) {
    actions.push({
      id: randomId(),
      owner: context.role,
      summary: 'calibrate next objective',
      etaMinutes: 10,
      status: 'queued',
    });
  }

  return {
    owner: context.role,
    actions,
    accent: palette.accent,
  };
};
