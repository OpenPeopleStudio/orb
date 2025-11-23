# Agent E: Sol (Inference) - Insight Generation

**Mission**: Phase 6 - Learning Loop & Adaptation  
**Parent Mission**: `docs/prompts/MISSION_6_LEARNING_LOOP.md`

---

## Your Role

You are the **Sol (Inference)** agent. Your job is to convert patterns into natural language insights and generate actionable recommendations.

**Scope**:
- `orb-system/packages/core-sol/src/`
- Focus: Natural language generation, recommendations

---

## Deliverables

### 1. Insight Generator

**File**: `orb-system/packages/core-sol/src/insightGenerator.ts` (NEW)

```typescript
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
      suggestedActions: [], // Filled by Luna
    };
  }
  
  /**
   * Generate natural language title
   */
  private generateTitle(pattern: Pattern): string {
    const templates = {
      frequent_action: (p: Pattern) => 
        `Frequent ${p.data.actions[0]} Detected`,
      time_based_routine: (p: Pattern) => 
        `Daily Routine at ${p.data.timeWindow.start}`,
      mode_preference: (p: Pattern) => 
        `${p.data.modes[0]} Mode Preferred`,
      error_pattern: (p: Pattern) => 
        `${p.data.actions[0]} Failing Often`,
      efficiency_gain: (p: Pattern) => 
        `Workflow Improvement Found`,
      risk_threshold: (p: Pattern) => 
        `Risk Tolerance Learned`,
    };
    
    return templates[pattern.type]?.(pattern) || 'Pattern Detected';
  }
  
  /**
   * Generate natural language description
   */
  private generateDescription(pattern: Pattern, context?: InsightContext): string {
    const templates = {
      frequent_action: (p: Pattern) => {
        const action = p.data.actions[0];
        const freq = p.data.frequency;
        const perDay = p.data.avgPerDay || 0;
        return `You execute '${action}' ${freq} times (${perDay.toFixed(1)}/day). This action could be automated or assigned a keyboard shortcut.`;
      },
      time_based_routine: (p: Pattern) => {
        const action = p.data.actions[0];
        const time = p.data.timeWindow.start;
        return `You regularly perform '${action}' around ${time}. This could be scheduled automatically.`;
      },
      mode_preference: (p: Pattern) => {
        const mode = p.data.modes[0];
        const context = p.data.context;
        const rate = (p.data.usageRate * 100).toFixed(0);
        return `You use ${mode} mode ${rate}% of the time on ${context}. Set it as default for this context?`;
      },
      error_pattern: (p: Pattern) => {
        const action = p.data.actions[0];
        const rate = (p.data.errorRate * 100).toFixed(1);
        return `'${action}' fails ${rate}% of the time. This workflow may need review or debugging.`;
      },
      efficiency_gain: (p: Pattern) => {
        const improvement = p.data.improvement || 0;
        return `Your new workflow is ${(improvement * 100).toFixed(0)}% faster. Great optimization!`;
      },
      risk_threshold: (p: Pattern) => {
        const mode = p.data.modes?.[0] || 'this mode';
        const rate = (p.data.approvalRate * 100).toFixed(0);
        return `You approve ${rate}% of high-risk actions in ${mode}. Adjust risk threshold?`;
      },
    };
    
    return templates[pattern.type]?.(pattern) || 
      `Pattern detected with ${(pattern.confidence * 100).toFixed(0)}% confidence.`;
  }
  
  /**
   * Generate recommendation
   */
  private generateRecommendation(pattern: Pattern, context?: InsightContext): string {
    const recommendations = {
      frequent_action: 'Create ⌘+Shift+N shortcut or schedule automatic execution',
      time_based_routine: 'Set up automatic task scheduling for this time',
      mode_preference: 'Set as default mode for this context',
      error_pattern: 'Review workflow steps and error logs',
      efficiency_gain: 'Continue using this improved workflow',
      risk_threshold: 'Increase risk tolerance for this mode',
    };
    
    return recommendations[pattern.type] || 'Review and take appropriate action';
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
}

export const insightGenerator = new InsightGenerator();
```

### 2. Daily Summaries

**File**: `orb-system/packages/core-sol/src/patternSummarizer.ts` (NEW)

```typescript
export class PatternSummarizer {
  /**
   * Generate daily summary
   */
  async generateDailySummary(
    patterns: Pattern[],
    insights: Insight[]
  ): Promise<string> {
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
    
    return summary;
  }
}
```

---

## Success Criteria

- ✅ Natural language insights generated for all pattern types
- ✅ Descriptions are clear and actionable
- ✅ Prioritization works correctly
- ✅ Type errors resolved

**Time**: 1-2 days

