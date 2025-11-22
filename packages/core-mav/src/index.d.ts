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
export declare const buildActionPlan: (context: OrbContext, goals: string[]) => ActionPlan;
//# sourceMappingURL=index.d.ts.map