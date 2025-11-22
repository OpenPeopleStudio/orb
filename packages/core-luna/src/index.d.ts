import { OrbContext, OrbRole } from '@orb-system/core-orb';
export interface PersonaBrief extends OrbContext {
    principles: string[];
    voice: 'operational' | 'narrative' | 'design' | 'systems';
}
export declare const buildPersonaBrief: (role: OrbRole, overrides?: Partial<PersonaBrief>) => PersonaBrief;
//# sourceMappingURL=index.d.ts.map