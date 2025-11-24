import { OrbContext, OrbRole } from '@orb-system/core-orb';
export interface SolInsight {
    role: OrbRole;
    intent: string;
    confidence: number;
    tone: 'positive' | 'neutral' | 'urgent';
    summary: string;
    highlightColor: string;
}
export interface SolInsightRecord {
    id: string;
    user_id: string;
    session_id: string | null;
    intent: string;
    confidence: number;
    tone: 'positive' | 'neutral' | 'urgent';
    prompt: string;
    summary: string;
    role: string;
    highlight_color: string | null;
    metadata: Record<string, unknown>;
    created_at: string;
}
export declare const analyzeIntent: (context: OrbContext, prompt: string) => SolInsight;
export declare const summarizeSignals: (insights: SolInsight[]) => string;
/**
 * Convert SolInsight to database record format
 */
export declare const toInsightRecord: (insight: SolInsight, context: OrbContext, prompt: string, metadata?: Record<string, unknown>) => Omit<SolInsightRecord, "created_at">;
//# sourceMappingURL=index.d.ts.map