import { OrbContext, OrbRole } from '@orb-system/core-orb';
export interface SolInsight {
    role: OrbRole;
    intent: string;
    confidence: number;
    tone: 'positive' | 'neutral' | 'urgent';
    summary: string;
    highlightColor: string;
}
export declare const analyzeIntent: (context: OrbContext, prompt: string) => SolInsight;
export declare const summarizeSignals: (insights: SolInsight[]) => string;
//# sourceMappingURL=index.d.ts.map