import { OrbContext, OrbRole } from '@orb-system/core-orb';
export interface PersonaBrief extends OrbContext {
    principles: string[];
    voice: 'operational' | 'narrative' | 'design' | 'systems';
}
export interface LunaProfileRecord {
    user_id: string;
    mode_id: string;
    preferences: Record<string, unknown>;
    constraints: Record<string, unknown>;
    updated_at: string;
}
export interface LunaActiveModeRecord {
    user_id: string;
    mode_id: string;
    updated_at: string;
}
export declare const buildPersonaBrief: (role: OrbRole, overrides?: Partial<PersonaBrief>) => PersonaBrief;
/**
 * Convert PersonaBrief to Luna profile record format
 */
export declare const toProfileRecord: (brief: PersonaBrief, preferences?: Record<string, unknown>, constraints?: Record<string, unknown>) => Omit<LunaProfileRecord, "updated_at">;
/**
 * Convert to Luna active mode record format
 */
export declare const toActiveModeRecord: (userId: string, modeId: string) => Omit<LunaActiveModeRecord, "updated_at">;
//# sourceMappingURL=index.d.ts.map