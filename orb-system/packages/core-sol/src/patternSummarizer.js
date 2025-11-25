/**
 * Pattern Summarizer
 *
 * Phase 6: Generate daily learning summaries
 *
 * Creates human-readable summaries of detected patterns and insights.
 */
export class PatternSummarizer {
    /**
     * Generate daily summary
     */
    async generateDailySummary(patterns, insights) {
        const topPatterns = patterns.slice(0, 3);
        const topInsights = insights.slice(0, 3);
        let summary = '# Daily Learning Summary\n\n';
        if (topPatterns.length > 0) {
            summary += '## Patterns Detected\n';
            for (const pattern of topPatterns) {
                summary += `- ${pattern.type}: ${(pattern.confidence * 100).toFixed(0)}% confidence\n`;
            }
            summary += '\n';
        }
        if (topInsights.length > 0) {
            summary += '## Insights Generated\n';
            for (const insight of topInsights) {
                summary += `- ${insight.title}\n`;
                summary += `  ${insight.description}\n`;
            }
        }
        if (topPatterns.length === 0 && topInsights.length === 0) {
            summary += 'No significant patterns detected today.\n';
        }
        return summary;
    }
    /**
     * Generate weekly summary
     */
    async generateWeeklySummary(patterns, insights) {
        const patternsByType = this.groupPatternsByType(patterns);
        const topInsights = insights
            .filter(i => i.userFeedback === 'accepted')
            .slice(0, 5);
        let summary = '# Weekly Learning Summary\n\n';
        if (Object.keys(patternsByType).length > 0) {
            summary += '## Patterns by Type\n';
            for (const [type, patternsOfType] of Object.entries(patternsByType)) {
                const avgConfidence = patternsOfType.reduce((sum, p) => sum + p.confidence, 0) / patternsOfType.length;
                summary += `- ${type}: ${patternsOfType.length} patterns (avg ${(avgConfidence * 100).toFixed(0)}% confidence)\n`;
            }
            summary += '\n';
        }
        if (topInsights.length > 0) {
            summary += '## Top Accepted Insights\n';
            for (const insight of topInsights) {
                summary += `- ${insight.title}\n`;
                summary += `  ${insight.recommendation}\n`;
            }
            summary += '\n';
        }
        const appliedInsights = insights.filter(i => i.appliedAt);
        if (appliedInsights.length > 0) {
            summary += `## Summary\n`;
            summary += `- ${patterns.length} patterns detected\n`;
            summary += `- ${insights.length} insights generated\n`;
            summary += `- ${appliedInsights.length} insights applied\n`;
        }
        return summary;
    }
    /**
     * Generate summary for specific pattern type
     */
    async generatePatternTypeSummary(patterns, patternType) {
        const filteredPatterns = patterns.filter(p => p.type === patternType);
        if (filteredPatterns.length === 0) {
            return `No ${patternType} patterns detected.`;
        }
        let summary = `# ${patternType} Summary\n\n`;
        summary += `Detected ${filteredPatterns.length} patterns:\n\n`;
        for (const pattern of filteredPatterns.slice(0, 5)) {
            summary += `## Pattern ${pattern.id.slice(0, 8)}\n`;
            summary += `- Confidence: ${(pattern.confidence * 100).toFixed(0)}%\n`;
            summary += `- Events: ${pattern.eventCount}\n`;
            summary += `- Status: ${pattern.status}\n`;
            // Add pattern-specific details
            if (pattern.data.actions) {
                summary += `- Actions: ${pattern.data.actions.join(', ')}\n`;
            }
            if (pattern.data.modes) {
                summary += `- Modes: ${pattern.data.modes.join(', ')}\n`;
            }
            if (pattern.data.frequency) {
                summary += `- Frequency: ${pattern.data.frequency}\n`;
            }
            summary += '\n';
        }
        return summary;
    }
    /**
     * Group patterns by type
     */
    groupPatternsByType(patterns) {
        const grouped = {};
        for (const pattern of patterns) {
            if (!grouped[pattern.type]) {
                grouped[pattern.type] = [];
            }
            grouped[pattern.type].push(pattern);
        }
        return grouped;
    }
    /**
     * Generate markdown report
     */
    async generateMarkdownReport(patterns, insights, timeRange) {
        let report = `# Learning Report\n`;
        report += `**Period**: ${timeRange.start} to ${timeRange.end}\n\n`;
        // Overview
        report += `## Overview\n`;
        report += `- **Patterns Detected**: ${patterns.length}\n`;
        report += `- **Insights Generated**: ${insights.length}\n`;
        report += `- **Insights Applied**: ${insights.filter(i => i.appliedAt).length}\n`;
        report += `- **Avg Pattern Confidence**: ${this.calculateAvgConfidence(patterns).toFixed(0)}%\n\n`;
        // Top patterns by confidence
        const topPatterns = patterns
            .sort((a, b) => b.confidence - a.confidence)
            .slice(0, 5);
        if (topPatterns.length > 0) {
            report += `## Top Patterns\n`;
            for (const pattern of topPatterns) {
                report += `### ${pattern.type} (${(pattern.confidence * 100).toFixed(0)}% confidence)\n`;
                report += `- Events: ${pattern.eventCount}\n`;
                report += `- Status: ${pattern.status}\n`;
                report += `- Detected: ${pattern.detectedAt}\n\n`;
            }
        }
        // Top insights
        const topInsights = insights
            .sort((a, b) => b.confidence - a.confidence)
            .slice(0, 5);
        if (topInsights.length > 0) {
            report += `## Top Insights\n`;
            for (const insight of topInsights) {
                report += `### ${insight.title}\n`;
                report += `${insight.description}\n\n`;
                report += `**Recommendation**: ${insight.recommendation}\n`;
                if (insight.appliedAt) {
                    report += `**Applied**: ${insight.appliedAt}\n`;
                }
                if (insight.userFeedback) {
                    report += `**Feedback**: ${insight.userFeedback}\n`;
                }
                report += '\n';
            }
        }
        return report;
    }
    /**
     * Calculate average confidence
     */
    calculateAvgConfidence(patterns) {
        if (patterns.length === 0)
            return 0;
        const total = patterns.reduce((sum, p) => sum + p.confidence, 0);
        return (total / patterns.length) * 100;
    }
}
// Export singleton instance
export const patternSummarizer = new PatternSummarizer();
//# sourceMappingURL=patternSummarizer.js.map