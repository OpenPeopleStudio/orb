export type OrbRole = 'orb' | 'sol' | 'te' | 'mav' | 'luna' | 'forge';
export interface OrbPalette {
    surface: string;
    background: string;
    textPrimary: string;
    textMuted: string;
    accent: string;
}
export interface OrbContext {
    role: OrbRole;
    title: string;
    description: string;
    capabilities: string[];
    accent: string;
    surface: string;
    background: string;
}
export declare const roleOrder: OrbRole[];
export declare const getOrbPalette: (role: OrbRole) => OrbPalette;
export declare const createOrbContext: (role: OrbRole, overrides?: Partial<Omit<OrbContext, "role">>) => OrbContext;
export declare const ORB_CONTEXTS: Record<OrbRole, OrbContext>;
export declare const getContextSummary: (context: OrbContext) => string;
//# sourceMappingURL=index.d.ts.map