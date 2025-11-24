import { getOrbPalette } from '@orb-system/core-orb';
const randomId = () => Math.random().toString(36).slice(2, 8);
export const buildActionPlan = (context, goals) => {
    const palette = getOrbPalette(context.role);
    const actions = goals.map((goal, index) => ({
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
export const toActionRecord = (item, context, taskId, toolId = null, kind = 'execute', params = null, output = null, error = null) => {
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
//# sourceMappingURL=index.js.map