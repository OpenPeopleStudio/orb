import { OrbContext, OrbRole } from '@orb-system/core-orb';
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
export declare const buildActionPlan: (context: OrbContext, goals: string[]) => ActionPlan;
/**
 * Convert ActionPlanItem to database record format
 */
export declare const toActionRecord: (item: ActionPlanItem, context: OrbContext, taskId: string, toolId?: string | null, kind?: string, params?: Record<string, unknown> | null, output?: string | null, error?: string | null) => Omit<MavActionRecord, "created_at">;
//# sourceMappingURL=index.d.ts.map