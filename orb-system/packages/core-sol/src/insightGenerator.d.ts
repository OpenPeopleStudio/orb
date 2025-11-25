/**
 * Insight Generator
 *
 * Phase 6: Convert patterns into natural language insights
 *
 * Generates human-readable insights and recommendations from detected patterns.
 */
import type { Pattern, Insight, InsightContext } from '@orb-system/core-orb';
export declare class InsightGenerator {
    /**
     * Generate insight from pattern
     */
    generate(pattern: Pattern, context?: InsightContext): Promise<Insight>;
    /**
     * Generate natural language title
     */
    private generateTitle;
    /**
     * Generate natural language description
     */
    private generateDescription;
    /**
     * Generate recommendation
     */
    private generateRecommendation;
    /**
     * Prioritize insights by importance
     */
    prioritize(insights: Insight[]): Insight[];
    /**
     * Batch generate insights from multiple patterns
     */
    generateBatch(patterns: Pattern[], context?: InsightContext): Promise<Insight[]>;
}
export declare const insightGenerator: InsightGenerator;
//# sourceMappingURL=insightGenerator.d.ts.map