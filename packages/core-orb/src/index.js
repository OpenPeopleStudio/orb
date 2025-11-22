const BASE_BACKGROUND = '#05070A';
const BASE_SURFACE = '#0C0F13';
const TEXT_PRIMARY = '#F5F7FA';
const TEXT_MUTED = 'rgba(245,247,250,0.68)';
const ROLE_ACCENTS = {
    orb: '#B9E4FF',
    sol: '#00A3FF',
    te: '#00FF9C',
    mav: '#EC742E',
    luna: '#8EA3C7',
    forge: '#E0B0FF',
};
const DEFAULT_DESCRIPTIONS = {
    orb: 'Mission control for the entire stack.',
    sol: 'Narrative intelligence synthesizer.',
    te: 'Reflective knowledge engine.',
    mav: 'Execution and automation orchestrator.',
    luna: 'Human experience and design partner.',
    forge: 'UI shell and orchestration surface.',
};
const DEFAULT_CAPABILITIES = {
    orb: ['routing', 'context-sync', 'safety'],
    sol: ['narrative', 'analysis', 'signal'],
    te: ['reflection', 'memory', 'embedding'],
    mav: ['automation', 'tasking', 'ops'],
    luna: ['design', 'persona', 'ux-audit'],
    forge: ['runtime', 'composition', 'delivery'],
};
export const roleOrder = ['orb', 'sol', 'te', 'mav', 'luna', 'forge'];
export const getOrbPalette = (role) => ({
    background: BASE_BACKGROUND,
    surface: BASE_SURFACE,
    textPrimary: TEXT_PRIMARY,
    textMuted: TEXT_MUTED,
    accent: ROLE_ACCENTS[role],
});
export const createOrbContext = (role, overrides = {}) => {
    const palette = getOrbPalette(role);
    return {
        role,
        title: overrides.title ?? role.toUpperCase(),
        description: overrides.description ?? DEFAULT_DESCRIPTIONS[role],
        capabilities: overrides.capabilities ?? DEFAULT_CAPABILITIES[role],
        accent: overrides.accent ?? palette.accent,
        surface: overrides.surface ?? palette.surface,
        background: overrides.background ?? palette.background,
    };
};
export const ORB_CONTEXTS = roleOrder.reduce((acc, role) => {
    acc[role] = createOrbContext(role);
    return acc;
}, {});
export const getContextSummary = (context) => {
    const capabilityList = context.capabilities.join(', ');
    return `${context.title}: ${context.description} (capabilities: ${capabilityList})`;
};
//# sourceMappingURL=index.js.map