/**
 * Adaptation Engine
 * 
 * Role: Learning loop - compute patterns from events
 * 
 * Phase 6: Learning loop foundation.
 * 
 * The adaptation engine analyzes events to discover patterns and
 * generate insights that can be used to adapt Orb's behavior.
 */

import type { OrbEvent, EventFilter, EventStats } from '../events';
import { OrbEventType } from '../events';
import { getEventBus } from '../events/bus';
import type { OrbDevice, OrbMode } from '../identity';
import type { OrbRole } from '../orbRoles';

/**
 * Pattern - discovered pattern from events
 */
export interface AdaptationPattern {
  id: string;
  type: PatternType;
  confidence: number; // 0 to 1
  description: string;
  metadata: Record<string, unknown>;
  createdAt: string; // ISO timestamp
}

/**
 * Pattern Type - categories of patterns
 */
export enum PatternType {
  MODE_USAGE = 'mode_usage',
  ERROR_PATTERN = 'error_pattern',
  FEATURE_USAGE = 'feature_usage',
  PERFORMANCE_PATTERN = 'performance_pattern',
  USER_BEHAVIOR = 'user_behavior',
}

/**
 * Adaptation Insights - computed insights from patterns
 */
export interface AdaptationInsights {
  mostUsedModes: Array<{ mode: string; count: number; percentage: number }>;
  failingFeatures: Array<{ feature: string; errorRate: number; errorCount: number }>;
  peakUsageTimes: Array<{ hour: number; count: number }>;
  deviceUsage: Array<{ device: string; count: number; percentage: number }>;
  roleActivity: Array<{ role: string; count: number; percentage: number }>;
  averageTaskDuration?: number; // milliseconds
  errorRate: number; // 0 to 1
  successRate: number; // 0 to 1
  patterns: AdaptationPattern[];
}

/**
 * Adaptation Engine
 * 
 * Computes patterns and insights from event history.
 */
export class AdaptationEngine {
  private eventBus = getEventBus();

  /**
   * Compute adaptation insights from events
   */
  async computeInsights(filter?: EventFilter): Promise<AdaptationInsights> {
    const stats = await this.eventBus.getStats(filter);
    const events = await this.eventBus.query(filter || {});

    // Most used modes
    const mostUsedModes = stats.mostUsedModes.map((item) => ({
      mode: item.mode,
      count: item.count,
      percentage: stats.totalEvents > 0 ? item.count / stats.totalEvents : 0,
    }));

    // Device usage
    const deviceCounts: Record<string, number> = {};
    for (const event of events) {
      if (event.deviceId) {
        deviceCounts[event.deviceId] = (deviceCounts[event.deviceId] || 0) + 1;
      }
    }
    const deviceUsage = Object.entries(deviceCounts)
      .map(([device, count]) => ({
        device,
        count,
        percentage: stats.totalEvents > 0 ? count / stats.totalEvents : 0,
      }))
      .sort((a, b) => b.count - a.count);

    // Role activity
    const roleActivity = Object.entries(stats.byRole)
      .map(([role, count]) => ({
        role,
        count,
        percentage: stats.totalEvents > 0 ? count / stats.totalEvents : 0,
      }))
      .sort((a, b) => b.count - a.count);

    // Failing features (tasks that fail frequently)
    const taskFailures: Record<string, { failures: number; total: number }> = {};
    for (const event of events) {
      if (event.type === OrbEventType.TASK_RUN || event.type === OrbEventType.TASK_COMPLETE || event.type === OrbEventType.TASK_FAIL) {
        const feature = (event.payload.feature as string) || (event.payload.flow as string) || 'unknown';
        if (!taskFailures[feature]) {
          taskFailures[feature] = { failures: 0, total: 0 };
        }
        taskFailures[feature].total++;
        if (event.type === OrbEventType.TASK_FAIL) {
          taskFailures[feature].failures++;
        }
      }
    }
    const failingFeatures = Object.entries(taskFailures)
      .map(([feature, data]) => ({
        feature,
        errorRate: data.total > 0 ? data.failures / data.total : 0,
        errorCount: data.failures,
      }))
      .filter((f) => f.errorRate > 0)
      .sort((a, b) => b.errorRate - a.errorRate);

    // Peak usage times (by hour of day)
    const hourCounts: Record<number, number> = {};
    for (const event of events) {
      const hour = new Date(event.timestamp).getHours();
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    }
    const peakUsageTimes = Object.entries(hourCounts)
      .map(([hour, count]) => ({ hour: parseInt(hour, 10), count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Average task duration (from task_run to task_complete/fail)
    const taskDurations: number[] = [];
    const taskStartTimes: Map<string, number> = new Map();
    for (const event of events) {
      if (event.type === OrbEventType.TASK_RUN) {
        const taskId = (event.payload.taskId as string) || event.id;
        taskStartTimes.set(taskId, new Date(event.timestamp).getTime());
      } else if (event.type === OrbEventType.TASK_COMPLETE || event.type === OrbEventType.TASK_FAIL) {
        const taskId = (event.payload.taskId as string) || event.id;
        const startTime = taskStartTimes.get(taskId);
        if (startTime) {
          const duration = new Date(event.timestamp).getTime() - startTime;
          taskDurations.push(duration);
          taskStartTimes.delete(taskId);
        }
      }
    }
    const averageTaskDuration =
      taskDurations.length > 0
        ? taskDurations.reduce((a, b) => a + b, 0) / taskDurations.length
        : undefined;

    // Success rate
    const successRate = 1 - stats.errorRate;

    // Compute patterns
    const patterns = await this.computePatterns(events, stats);

    return {
      mostUsedModes,
      failingFeatures,
      peakUsageTimes,
      deviceUsage,
      roleActivity,
      averageTaskDuration,
      errorRate: stats.errorRate,
      successRate,
      patterns,
    };
  }

  /**
   * Compute patterns from events
   */
  private async computePatterns(events: OrbEvent[], stats: EventStats): Promise<AdaptationPattern[]> {
    const patterns: AdaptationPattern[] = [];

    // Pattern: Most used mode
    if (stats.mostUsedModes.length > 0) {
      const topMode = stats.mostUsedModes[0];
      patterns.push({
        id: `pattern-mode-${topMode.mode}`,
        type: PatternType.MODE_USAGE,
        confidence: Math.min(1.0, topMode.count / Math.max(1, stats.totalEvents / 10)),
        description: `Mode "${topMode.mode}" is the most frequently used (${topMode.count} times)`,
        metadata: { mode: topMode.mode, count: topMode.count },
        createdAt: new Date().toISOString(),
      });
    }

    // Pattern: High error rate
    if (stats.errorRate > 0.1) {
      patterns.push({
        id: 'pattern-high-error-rate',
        type: PatternType.ERROR_PATTERN,
        confidence: Math.min(1.0, stats.errorRate * 2),
        description: `High error rate detected: ${(stats.errorRate * 100).toFixed(1)}%`,
        metadata: { errorRate: stats.errorRate, totalEvents: stats.totalEvents },
        createdAt: new Date().toISOString(),
      });
    }

    // Pattern: Low success rate
    if (stats.errorRate > 0.5) {
      patterns.push({
        id: 'pattern-low-success-rate',
        type: PatternType.PERFORMANCE_PATTERN,
        confidence: stats.errorRate,
        description: `Low success rate: ${((1 - stats.errorRate) * 100).toFixed(1)}%`,
        metadata: { successRate: 1 - stats.errorRate, errorRate: stats.errorRate },
        createdAt: new Date().toISOString(),
      });
    }

    // Pattern: Frequent mode switching
    const modeSwitches = events.filter((e) => e.type === OrbEventType.MODE_CHANGE).length;
    if (modeSwitches > 10 && stats.totalEvents > 0) {
      const switchRate = modeSwitches / stats.totalEvents;
      if (switchRate > 0.1) {
        patterns.push({
          id: 'pattern-frequent-mode-switching',
          type: PatternType.USER_BEHAVIOR,
          confidence: Math.min(1.0, switchRate * 5),
          description: `Frequent mode switching detected (${modeSwitches} switches)`,
          metadata: { modeSwitches, switchRate },
          createdAt: new Date().toISOString(),
        });
      }
    }

    return patterns;
  }

  /**
   * Get recommendations based on insights
   */
  async getRecommendations(filter?: EventFilter): Promise<string[]> {
    const insights = await this.computeInsights(filter);
    const recommendations: string[] = [];

    // Recommend promoting most used modes
    if (insights.mostUsedModes.length > 0) {
      const topMode = insights.mostUsedModes[0];
      if (topMode.percentage > 0.3) {
        recommendations.push(
          `Consider promoting "${topMode.mode}" mode as default (used ${(topMode.percentage * 100).toFixed(1)}% of the time)`
        );
      }
    }

    // Recommend fixing failing features
    for (const feature of insights.failingFeatures.slice(0, 3)) {
      if (feature.errorRate > 0.2) {
        recommendations.push(
          `Feature "${feature.feature}" has high error rate (${(feature.errorRate * 100).toFixed(1)}%) - consider investigation`
        );
      }
    }

    // Recommend based on error rate
    if (insights.errorRate > 0.15) {
      recommendations.push(
        `Overall error rate is ${(insights.errorRate * 100).toFixed(1)}% - consider reviewing system health`
      );
    }

    // Recommend based on peak usage times
    if (insights.peakUsageTimes.length > 0) {
      const peakHour = insights.peakUsageTimes[0];
      recommendations.push(
        `Peak usage time is ${peakHour.hour}:00 (${peakHour.count} events) - consider optimizing for this time`
      );
    }

    return recommendations;
  }

  /**
   * Get adaptation suggestions for a specific mode
   */
  async getModeSuggestions(mode: OrbMode, filter?: EventFilter): Promise<string[]> {
    const modeFilter: EventFilter = { ...filter, mode };
    const insights = await this.computeInsights(modeFilter);
    const suggestions: string[] = [];

    if (insights.errorRate > 0.1) {
      suggestions.push(`Mode "${mode}" has error rate of ${(insights.errorRate * 100).toFixed(1)}%`);
    }

    if (insights.averageTaskDuration) {
      const durationSeconds = insights.averageTaskDuration / 1000;
      suggestions.push(`Average task duration in "${mode}": ${durationSeconds.toFixed(1)}s`);
    }

    return suggestions;
  }
}

// Global adaptation engine instance
let globalAdaptationEngine: AdaptationEngine | null = null;

/**
 * Get the global adaptation engine instance
 */
export function getAdaptationEngine(): AdaptationEngine {
  if (!globalAdaptationEngine) {
    globalAdaptationEngine = new AdaptationEngine();
  }
  return globalAdaptationEngine;
}

/**
 * Reset the global adaptation engine (for testing)
 */
export function resetAdaptationEngine(): void {
  globalAdaptationEngine = null;
}

