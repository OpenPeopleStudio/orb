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

export interface MavActionRecord {
  id: string;
  user_id: string;
  session_id: string | null;
  task_id: string;
  action_id: string;
  tool_id: string | null;
  kind: string;
  params: Record<string, unknown> | null;
  status: string;
  output: string | null;
  error: string | null;
  created_at: string;
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

/**
 * Convert ActionPlanItem to database record format
 */
export const toActionRecord = (
  item: ActionPlanItem,
  context: OrbContext,
  taskId: string,
  toolId: string | null = null,
  kind: string = 'execute',
  params: Record<string, unknown> | null = null,
  output: string | null = null,
  error: string | null = null
): Omit<MavActionRecord, 'created_at'> => {
  return {
    id: `mav_${context.sessionId}_${item.id}`,
    user_id: context.userId || 'anonymous',
    session_id: context.sessionId,
    task_id: taskId,
    action_id: item.id,
    tool_id: toolId,
    kind,
    params,
    status: item.status === 'in-flight' ? 'running' : item.status === 'done' ? 'completed' : 'queued',
    output,
    error,
  };
};
