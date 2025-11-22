import { OrbContext, OrbRole } from '@orb-system/core-orb';
export interface Reflection {
    role: OrbRole;
    summary: string;
    actions: string[];
    embeddingSeed: number[];
    emphasisColor: string;
}
export declare const reflect: (context: OrbContext, signals: string[]) => Reflection;
//# sourceMappingURL=index.d.ts.map