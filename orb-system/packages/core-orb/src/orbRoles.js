/**
 * Orb Role Definitions
 *
 * Core identity types for the Orb system.
 * All packages must use these roles to maintain consistency.
 */
export var OrbRole;
(function (OrbRole) {
    OrbRole["ORB"] = "orb";
    OrbRole["SOL"] = "sol";
    OrbRole["TE"] = "te";
    OrbRole["MAV"] = "mav";
    OrbRole["LUNA"] = "luna";
    OrbRole["FORGE"] = "forge";
})(OrbRole || (OrbRole = {}));
/**
 * Standard role order for display and iteration
 */
export const roleOrder = [
    OrbRole.ORB,
    OrbRole.SOL,
    OrbRole.TE,
    OrbRole.MAV,
    OrbRole.LUNA,
    OrbRole.FORGE,
];
/**
 * Create a new Orb context
 */
export function createOrbContext(role, sessionId, options) {
    return {
        role,
        userId: options?.userId ?? null,
        sessionId,
        deviceId: options?.deviceId,
        mode: options?.mode,
        persona: options?.persona,
        timestamp: new Date(),
    };
}
/**
 * Validate that a context has the expected role
 */
export function validateRole(context, expectedRole) {
    return context.role === expectedRole;
}
/**
 * Get role display name
 */
export function getRoleDisplayName(role) {
    const names = {
        [OrbRole.ORB]: 'Orb',
        [OrbRole.SOL]: 'Sol',
        [OrbRole.TE]: 'Te',
        [OrbRole.MAV]: 'Mav',
        [OrbRole.LUNA]: 'Luna',
        [OrbRole.FORGE]: 'Forge',
    };
    return names[role];
}
/**
 * Get role description
 */
export function getRoleDescription(role) {
    const descriptions = {
        [OrbRole.ORB]: 'System orchestrator and coordinator',
        [OrbRole.SOL]: 'What the model runs on (engine/inference/brain)',
        [OrbRole.TE]: 'What the model reflects on (memory/evaluation/self-critique)',
        [OrbRole.MAV]: 'What the model accomplishes (actions/tools/execution)',
        [OrbRole.LUNA]: 'What the user decides they want it to be (intent/preferences/constraints)',
        [OrbRole.FORGE]: 'Multi-agent coordination and orchestration',
    };
    return descriptions[role];
}
/**
 * Get color palette for a role
 */
export function getOrbPalette(role) {
    const palettes = {
        [OrbRole.ORB]: {
            accent: '#b9e4ff', // Light blue
            surface: '#0c0f13',
            background: '#05070a',
            textPrimary: '#ffffff',
            textMuted: '#a0b0c0',
        },
        [OrbRole.SOL]: {
            accent: '#00d4ff', // Cyan
            surface: '#001a26',
            background: '#000d14',
            textPrimary: '#ffffff',
            textMuted: '#7f9faf',
        },
        [OrbRole.TE]: {
            accent: '#00ff88', // Green
            surface: '#001a0d',
            background: '#000d0a',
            textPrimary: '#ffffff',
            textMuted: '#7faf9f',
        },
        [OrbRole.MAV]: {
            accent: '#ffaa00', // Yellow/Orange
            surface: '#261a00',
            background: '#140d00',
            textPrimary: '#ffffff',
            textMuted: '#af9f7f',
        },
        [OrbRole.LUNA]: {
            accent: '#ff00ff', // Magenta
            surface: '#26001a',
            background: '#14000d',
            textPrimary: '#ffffff',
            textMuted: '#af7f9f',
        },
        [OrbRole.FORGE]: {
            accent: '#e0b0ff', // Light purple
            surface: '#1a0026',
            background: '#0d0014',
            textPrimary: '#ffffff',
            textMuted: '#9f7faf',
        },
    };
    return palettes[role];
}
//# sourceMappingURL=orbRoles.js.map