/**
 * Pattern Summarizer
 *
 * Phase 6: Generate daily learning summaries
 *
 * Creates human-readable summaries of detected patterns and insights.
 */
import type { Pattern, Insight } from '@orb-system/core-orb';
export declare class PatternSummarizer {
    /**
     * Generate daily summary
     */
    generateDailySummary(patterns: Pattern[], insights: Insight[]): Promise<string>;
    /**
     * Generate weekly summary
     */
    generateWeeklySummary(patterns: Pattern[], insights: Insight[]): Promise<string>;
    /**
     * Generate summary for specific pattern type
     */
    generatePatternTypeSummary(patterns: Pattern[], patternType: string): Promise<string>;
    /**
     * Group patterns by type
     */
    private groupPatternsByType;
    /**
     * Generate markdown report
     */
    generateMarkdownReport(patterns: Pattern[], insights: Insight[], timeRange: {
        start: string;
        end: string;
    }): Promise<string>;
    /**
     * Calculate average confidence
     */
    private calculateAvgConfidence;
}
export declare const patternSummarizer: PatternSummarizer;
//# sourceMappingURL=patternSummarizer.d.ts.map