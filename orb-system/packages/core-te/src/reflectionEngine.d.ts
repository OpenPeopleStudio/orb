/**
 * Reflection Engine
 *
 * Migrated from repo: supabase, path: functions/_shared/reflectionEngine.ts
 * Date: 2025-11-22
 * Role: OrbRole.TE (reflection/memory)
 *
 * Generates reflections and insights based on patterns and data analysis.
 */
import { OrbContext, type Transaction as FinancialTransaction } from '@orb-system/core-orb';
export interface ReflectionContext {
    transactions: FinancialTransaction[];
    recentDays: number;
    previousPeriod?: {
        transactions: FinancialTransaction[];
        totalSpend: number;
    };
    merchantPatterns: Record<string, number>;
    categoryBreakdown: Record<string, number>;
    timePatterns: {
        lateNight: number;
        weekend: number;
        weekday: number;
    };
}
export interface ReflectionResult {
    summary: string;
    alignment_score: number | null;
    tags: string[];
    transaction_ids: string[];
}
/**
 * Generate reflection from transactions
 */
export declare function generateReflection(ctx: OrbContext, transactions: FinancialTransaction[], userEmotion?: {
    emotion: string;
    intensity: number;
    valence: number;
}): Promise<ReflectionResult>;
//# sourceMappingURL=reflectionEngine.d.ts.map