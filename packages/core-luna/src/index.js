import { createOrbContext } from '@orb-system/core-orb';
const roleVoices = {
    orb: 'systems',
    sol: 'narrative',
    te: 'operational',
    mav: 'operational',
    luna: 'design',
    forge: 'systems',
};
export const buildPersonaBrief = (role, overrides = {}) => {
    const sessionId = overrides.sessionId || `session-${Date.now()}`;
    const context = createOrbContext(role, sessionId, {
        userId: overrides.userId,
        deviceId: overrides.deviceId,
        mode: overrides.mode,
        persona: overrides.persona,
    });
    const principles = overrides.principles ?? [
        'lead with clarity',
        'bias to action',
        'close the loop',
    ];
    return {
        ...context,
        principles,
        voice: overrides.voice ?? roleVoices[role],
    };
};
//# sourceMappingURL=index.js.map