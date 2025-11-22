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
//# sourceMappingURL=index.js.map