import { OrbRole, createOrbContext } from '@orb-system/core-orb';
const roleVoices = {
    [OrbRole.ORB]: 'systems',
    [OrbRole.SOL]: 'narrative',
    [OrbRole.TE]: 'operational',
    [OrbRole.MAV]: 'operational',
    [OrbRole.LUNA]: 'design',
    [OrbRole.FORGE]: 'systems',
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
/**
 * Convert PersonaBrief to Luna profile record format
 */
export const toProfileRecord = (brief, preferences = {}, constraints = {}) => {
    return {
        user_id: brief.userId || 'anonymous',
        mode_id: brief.mode || 'default',
        preferences,
        constraints,
    };
};
/**
 * Convert to Luna active mode record format
 */
export const toActiveModeRecord = (userId, modeId) => {
    return {
        user_id: userId,
        mode_id: modeId,
    };
};
//# sourceMappingURL=index.js.map