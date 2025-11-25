/**
 * Orb Role Definitions
 *
 * Core identity types for the Orb system.
 * All packages must use these roles to maintain consistency.
 */
export declare enum OrbRole {
    ORB = "orb",// System orchestrator
    SOL = "sol",// Engine / inference / brain
    TE = "te",// Reflection / memory
    MAV = "mav",// Actions / tools
    LUNA = "luna",// Preferences / intent
    FORGE = "forge"
}
/**
 * Standard role order for display and iteration
 */
export declare const roleOrder: readonly [OrbRole.ORB, OrbRole.SOL, OrbRole.TE, OrbRole.MAV, OrbRole.LUNA, OrbRole.FORGE];
/**
 * Orb Context
 *
 * Provides role-aware context for operations across the Orb system.
 * Used to tag operations, validate permissions, and route requests.
 */
export type OrbContext = {
    role: OrbRole;
    userId: string | null;
    sessionId: string;
    deviceId?: string;
    mode?: string;
    persona?: string;
    timestamp?: Date;
};
/**
 * Create a new Orb context
 */
export declare function createOrbContext(role: OrbRole, sessionId: string, options?: {
    userId?: string | null;
    deviceId?: string;
    mode?: string;
    persona?: string;
}): OrbContext;
/**
 * Validate that a context has the expected role
 */
export declare function validateRole(context: OrbContext, expectedRole: OrbRole): boolean;
/**
 * Get role display name
 */
export declare function getRoleDisplayName(role: OrbRole): string;
/**
 * Get role description
 */
export declare function getRoleDescription(role: OrbRole): string;
/**
 * Orb Palette - color scheme for UI
 */
export interface OrbPalette {
    accent: string;
    surface: string;
    background: string;
    textPrimary: string;
    textMuted: string;
}
/**
 * Get color palette for a role
 */
export declare function getOrbPalette(role: OrbRole): OrbPalette;
//# sourceMappingURL=orbRoles.d.ts.map