/**
 * Insight Generator
 * 
 * Phase 6: Convert patterns into natural language insights
 * 
 * Generates human-readable insights and recommendations from detected patterns.
 */

import type { Pattern, Insight, InsightContext } from '@orb-system/core-orb';

export class InsightGenerator {
  /**
   * Generate insight from pattern
   */
  async generate(pattern: Pattern, context?: InsightContext): Promise<Insight> {
    return {
      id: `insight-${pattern.id}`,
      patternId: pattern.id,
      generatedAt: new Date().toISOString(),
      confidence: pattern.confidence,
      title: this.generateTitle(pattern),
      description: this.generateDescription(pattern, context),
      recommendation: this.generateRecommendation(pattern, context),
      suggestedActions: [], // Filled by Luna's preference learning
    };
  }
  
  /**
   * Generate natural language title
   */
  private generateTitle(pattern: Pattern): string {
    const templates: Record<string, (p: Pattern) => string> = {
      frequent_action: (p: Pattern) => {
        const action = p.data.actions?.[0] ?? 'Unknown Action';
        return `Frequent ${action} Detected`;
      },
      time_based_routine: (p: Pattern) => {
        const timeWindow = p.data.timeWindow as { start: string; end: string } | undefined;
        const time = timeWindow?.start ?? 'Unknown Time';
        return `Daily Routine at ${time}`;
      },
      mode_preference: (p: Pattern) => {
        const mode = p.data.modes?.[0] ?? 'Unknown Mode';
        return `${mode} Mode Preferred`;
      },
      error_pattern: (p: Pattern) => {
        const action = p.data.actions?.[0] ?? 'Unknown Action';
        return `${action} Failing Often`;
      },
      efficiency_gain: (p: Pattern) => {
        return 'Workflow Improvement Found';
      },
      risk_threshold: (p: Pattern) => {
        return 'Risk Tolerance Learned';
      },
    };
    
    return templates[pattern.type]?.(pattern) ?? 'Pattern Detected';
  }
  
  /**
   * Generate natural language description
   */
  private generateDescription(pattern: Pattern, context?: InsightContext): string {
    const templates: Record<string, (p: Pattern, c?: InsightContext) => string> = {
      frequent_action: (p: Pattern) => {
        const action = p.data.actions?.[0] ?? 'Unknown Action';
        const freq = p.data.frequency ?? 0;
        const perDay = (p.data.avgPerDay as number | undefined) ?? 0;
        return `You execute '${action}' ${freq} times (${perDay.toFixed(1)}/day). This action could be automated or assigned a keyboard shortcut.`;
      },
      time_based_routine: (p: Pattern) => {
        const action = p.data.actions?.[0] ?? 'Unknown Action';
        const timeWindow = p.data.timeWindow as { start: string; end: string } | undefined;
        const time = timeWindow?.start ?? 'Unknown Time';
        return `You regularly perform '${action}' around ${time}. This could be scheduled automatically.`;
      },
      mode_preference: (p: Pattern) => {
        const mode = p.data.modes?.[0] ?? 'Unknown Mode';
        const contextStr = (p.data.context as string | undefined) ?? 'this context';
        const usageRate = (p.data.usageRate as number | undefined) ?? 0;
        const rate = (usageRate * 100).toFixed(0);
        return `You use ${mode} mode ${rate}% of the time on ${contextStr}. Set it as default for this context?`;
      },
      error_pattern: (p: Pattern) => {
        const action = p.data.actions?.[0] ?? 'Unknown Action';
        const errorRate = (p.data.errorRate as number | undefined) ?? 0;
        const rate = (errorRate * 100).toFixed(1);
        return `'${action}' fails ${rate}% of the time. This workflow may need review or debugging.`;
      },
      efficiency_gain: (p: Pattern) => {
        const improvement = (p.data.improvement as number | undefined) ?? 0;
        return `Your new workflow is ${(improvement * 100).toFixed(0)}% faster. Great optimization!`;
      },
      risk_threshold: (p: Pattern) => {
        const mode = p.data.modes?.[0] ?? 'this mode';
        const approvalRate = (p.data.approvalRate as number | undefined) ?? 0;
        const rate = (approvalRate * 100).toFixed(0);
        return `You approve ${rate}% of high-risk actions in ${mode}. Adjust risk threshold?`;
      },
    };
    
    return templates[pattern.type]?.(pattern, context) ?? 
      `Pattern detected with ${(pattern.confidence * 100).toFixed(0)}% confidence.`;
  }
  
  /**
   * Generate recommendation
   */
  private generateRecommendation(pattern: Pattern, context?: InsightContext): string {
    const recommendations: Record<string, string> = {
      frequent_action: 'Create ⌘+Shift+N shortcut or schedule automatic execution',
      time_based_routine: 'Set up automatic task scheduling for this time',
      mode_preference: 'Set as default mode for this context',
      error_pattern: 'Review workflow steps and error logs',
      efficiency_gain: 'Continue using this improved workflow',
      risk_threshold: 'Increase risk tolerance for this mode',
    };
    
    return recommendations[pattern.type] ?? 'Review and take appropriate action';
  }
  
  /**
   * Prioritize insights by importance
   */
  prioritize(insights: Insight[]): Insight[] {
    return insights.sort((a, b) => {
      // Sort by confidence descending
      if (b.confidence !== a.confidence) {
        return b.confidence - a.confidence;
      }
      
      // Then by recency
      return new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime();
    });
  }
  
  /**
   * Batch generate insights from multiple patterns
   */
  async generateBatch(patterns: Pattern[], context?: InsightContext): Promise<Insight[]> {
    const insights: Insight[] = [];
    
    for (const pattern of patterns) {
      try {
        const insight = await this.generate(pattern, context);
        insights.push(insight);
      } catch (error) {
        console.error(`[Sol] Failed to generate insight for pattern ${pattern.id}:`, error);
      }
    }
    
    return this.prioritize(insights);
  }
}

// Export singleton instance
export const insightGenerator = new InsightGenerator();

