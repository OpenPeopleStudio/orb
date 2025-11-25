/**
 * Adaptation Engine
 *
 * Role: Learning loop - compute patterns from events and adjust defaults
 *
 * Phase 6: Learning loop foundation.
 *
 * The adaptation engine analyzes events to discover patterns and
 * automatically adjusts Orb's default behaviors based on usage.
 */
import { OrbEventType as EventTypeEnum } from '../events/types';
import { getEventBus } from '../events/bus';
/**
 * Legacy Pattern Type - categories of patterns (Phase 4)
 *
 * Note: Phase 6 uses PatternType from ./types.ts
 * This enum is kept for backwards compatibility.
 */
export var LegacyPatternType;
(function (LegacyPatternType) {
    LegacyPatternType["MODE_USAGE"] = "mode_usage";
    LegacyPatternType["ERROR_PATTERN"] = "error_pattern";
    LegacyPatternType["FEATURE_USAGE"] = "feature_usage";
    LegacyPatternType["PERFORMANCE_PATTERN"] = "performance_pattern";
    LegacyPatternType["USER_BEHAVIOR"] = "user_behavior";
})(LegacyPatternType || (LegacyPatternType = {}));
/**
 * Adaptation Engine
 *
 * Computes patterns and insights from event history,
 * and automatically adjusts defaults based on usage patterns.
 */
export class AdaptationEngine {
    constructor() {
        this.eventBus = getEventBus();
        this.adjustments = null;
    }
    /**
     * Compute adaptation insights from events
     */
    async computeInsights(filter) {
        const stats = await this.eventBus.getStats(filter);
        const events = await this.eventBus.query(filter || {});
        // Most used modes
        const mostUsedModes = stats.mostUsedModes.map((item) => ({
            mode: item.mode,
            count: typeof item.count === 'number' ? item.count : Number(item.count) || 0,
            percentage: stats.totalEvents > 0 ? (typeof item.count === 'number' ? item.count : Number(item.count) || 0) / stats.totalEvents : 0,
        }));
        // Device usage
        const deviceCounts = {};
        for (const event of events) {
            if (event.deviceId) {
                deviceCounts[event.deviceId] = (deviceCounts[event.deviceId] || 0) + 1;
            }
        }
        const deviceUsage = Object.entries(deviceCounts)
            .map(([device, count]) => {
            const countNum = typeof count === 'number' ? count : Number(count) || 0;
            return {
                device,
                count: countNum,
                percentage: stats.totalEvents > 0 ? countNum / stats.totalEvents : 0,
            };
        })
            .sort((a, b) => b.count - a.count);
        // Role activity
        const roleActivity = Object.entries(stats.byRole)
            .map(([role, count]) => {
            const countNum = typeof count === 'number' ? count : Number(count) || 0;
            return {
                role,
                count: countNum,
                percentage: stats.totalEvents > 0 ? countNum / stats.totalEvents : 0,
            };
        })
            .sort((a, b) => b.count - a.count);
        // Failing features (tasks that fail frequently)
        const taskFailures = {};
        for (const event of events) {
            if (event.type === EventTypeEnum.TASK_RUN ||
                event.type === EventTypeEnum.TASK_COMPLETE ||
                event.type === EventTypeEnum.TASK_FAIL) {
                const feature = event.payload.feature ||
                    event.payload.flow ||
                    event.payload.taskLabel ||
                    'unknown';
                if (!taskFailures[feature]) {
                    taskFailures[feature] = { failures: 0, total: 0 };
                }
                taskFailures[feature].total++;
                if (event.type === EventTypeEnum.TASK_FAIL) {
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
        const hourCounts = {};
        for (const event of events) {
            const hour = new Date(event.timestamp).getHours();
            hourCounts[hour] = (hourCounts[hour] || 0) + 1;
        }
        const peakUsageTimes = Object.entries(hourCounts)
            .map(([hour, count]) => ({ hour: parseInt(hour, 10), count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);
        // Average task duration (from task_run to task_complete/fail)
        const taskDurations = [];
        const taskStartTimes = new Map();
        for (const event of events) {
            if (event.type === EventTypeEnum.TASK_RUN) {
                const taskId = event.payload.taskId || event.id;
                taskStartTimes.set(taskId, new Date(event.timestamp).getTime());
            }
            else if (event.type === EventTypeEnum.TASK_COMPLETE || event.type === EventTypeEnum.TASK_FAIL) {
                const taskId = event.payload.taskId || event.id;
                const startTime = taskStartTimes.get(taskId);
                if (startTime) {
                    const duration = new Date(event.timestamp).getTime() - startTime;
                    taskDurations.push(duration);
                    taskStartTimes.delete(taskId);
                }
            }
        }
        const averageTaskDuration = taskDurations.length > 0
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
    async computePatterns(events, stats) {
        const patterns = [];
        // Pattern: Most used mode
        if (stats.mostUsedModes.length > 0) {
            const topMode = stats.mostUsedModes[0];
            patterns.push({
                id: `pattern-mode-${topMode.mode}`,
                type: LegacyPatternType.MODE_USAGE,
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
                type: LegacyPatternType.ERROR_PATTERN,
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
                type: LegacyPatternType.PERFORMANCE_PATTERN,
                confidence: stats.errorRate,
                description: `Low success rate: ${((1 - stats.errorRate) * 100).toFixed(1)}%`,
                metadata: { successRate: 1 - stats.errorRate, errorRate: stats.errorRate },
                createdAt: new Date().toISOString(),
            });
        }
        // Pattern: Frequent mode switching
        const modeSwitches = events.filter((e) => e.type === EventTypeEnum.MODE_CHANGE).length;
        if (modeSwitches > 10 && stats.totalEvents > 0) {
            const switchRate = modeSwitches / stats.totalEvents;
            if (switchRate > 0.1) {
                patterns.push({
                    id: 'pattern-frequent-mode-switching',
                    type: LegacyPatternType.USER_BEHAVIOR,
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
     * Compute and apply adaptation adjustments
     *
     * This is the core learning function - it analyzes events and
     * automatically adjusts defaults based on usage patterns.
     */
    async computeAndApplyAdjustments(filter) {
        const insights = await this.computeInsights(filter);
        const adjustments = {
            recommendations: [],
            appliedAt: new Date().toISOString(),
        };
        // Adjust default mode based on most used mode
        if (insights.mostUsedModes.length > 0) {
            const topMode = insights.mostUsedModes[0];
            if (topMode.percentage > 0.3) {
                // If a mode is used >30% of the time, promote it as default
                adjustments.defaultMode = topMode.mode;
                adjustments.recommendations.push(`Set "${topMode.mode}" as default mode (used ${(topMode.percentage * 100).toFixed(1)}% of the time)`);
            }
            // Create mode priority list based on usage
            adjustments.modePromotions = insights.mostUsedModes
                .slice(0, 5)
                .map((item) => ({
                mode: item.mode,
                priority: item.percentage,
            }));
        }
        // Adjust feature flags based on error rates
        adjustments.featureFlags = {};
        for (const feature of insights.failingFeatures) {
            if (feature.errorRate > 0.5) {
                // Disable features with >50% error rate
                adjustments.featureFlags[feature.feature] = false;
                adjustments.recommendations.push(`Disable feature "${feature.feature}" (error rate: ${(feature.errorRate * 100).toFixed(1)}%)`);
            }
        }
        // Adjust Luna preferences based on patterns
        adjustments.lunaPreferences = {};
        if (insights.errorRate > 0.15) {
            // Increase caution if error rate is high
            adjustments.lunaPreferences = {
                riskTolerance: 'low',
                requireConfirmation: true,
            };
            adjustments.recommendations.push(`Increase Luna caution (error rate: ${(insights.errorRate * 100).toFixed(1)}%)`);
        }
        else if (insights.successRate > 0.9) {
            // Allow more autonomy if success rate is high
            adjustments.lunaPreferences = {
                riskTolerance: 'medium',
                requireConfirmation: false,
            };
            adjustments.recommendations.push(`Allow more Luna autonomy (success rate: ${(insights.successRate * 100).toFixed(1)}%)`);
        }
        // Store adjustments
        this.adjustments = adjustments;
        return adjustments;
    }
    /**
     * Get current adjustments
     */
    getAdjustments() {
        return this.adjustments;
    }
    /**
     * Get recommendations based on insights
     */
    async getRecommendations(filter) {
        const insights = await this.computeInsights(filter);
        const recommendations = [];
        // Recommend promoting most used modes
        if (insights.mostUsedModes.length > 0) {
            const topMode = insights.mostUsedModes[0];
            if (topMode.percentage > 0.3) {
                recommendations.push(`Consider promoting "${topMode.mode}" mode as default (used ${(topMode.percentage * 100).toFixed(1)}% of the time)`);
            }
        }
        // Recommend fixing failing features
        for (const feature of insights.failingFeatures.slice(0, 3)) {
            if (feature.errorRate > 0.2) {
                recommendations.push(`Feature "${feature.feature}" has high error rate (${(feature.errorRate * 100).toFixed(1)}%) - consider investigation`);
            }
        }
        // Recommend based on error rate
        if (insights.errorRate > 0.15) {
            recommendations.push(`Overall error rate is ${(insights.errorRate * 100).toFixed(1)}% - consider reviewing system health`);
        }
        // Recommend based on peak usage times
        if (insights.peakUsageTimes.length > 0) {
            const peakHour = insights.peakUsageTimes[0];
            recommendations.push(`Peak usage time is ${peakHour.hour}:00 (${peakHour.count} events) - consider optimizing for this time`);
        }
        return recommendations;
    }
    /**
     * Get adaptation suggestions for a specific mode
     */
    async getModeSuggestions(mode, filter) {
        const modeFilter = { ...filter, mode };
        const insights = await this.computeInsights(modeFilter);
        const suggestions = [];
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
let globalAdaptationEngine = null;
/**
 * Get the global adaptation engine instance
 */
export function getAdaptationEngine() {
    if (!globalAdaptationEngine) {
        globalAdaptationEngine = new AdaptationEngine();
    }
    return globalAdaptationEngine;
}
/**
 * Reset the global adaptation engine (for testing)
 */
export function resetAdaptationEngine() {
    globalAdaptationEngine = null;
}
//# sourceMappingURL=engine.js.map