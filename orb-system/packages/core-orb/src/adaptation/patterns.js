/**
 * Learning Pipeline
 *
 * Phase 6: Default implementation of learning pipeline
 *
 * Events → Patterns → Insights → Actions
 *
 * This is the core learning loop that:
 * 1. Processes events from the event bus
 * 2. Detects patterns in usage
 * 3. Generates actionable insights
 * 4. Applies learning to preferences/constraints
 */
import { ConfidenceThreshold } from './types';
/**
 * Default Learning Pipeline Implementation
 *
 * Provides basic pattern detection and insight generation.
 * Individual agents (Te, Luna, Sol) will extend this with
 * specialized detectors and generators.
 */
export class DefaultLearningPipeline {
    constructor() {
        this.recentEvents = [];
        this.maxRecentEvents = 1000;
    }
    /**
     * Process a single event
     *
     * Called by event bus for every event.
     * Stores events for batch pattern detection.
     */
    async processEvent(event) {
        // Add to recent events buffer
        this.recentEvents.push(event);
        // Trim buffer if too large
        if (this.recentEvents.length > this.maxRecentEvents) {
            this.recentEvents = this.recentEvents.slice(-this.maxRecentEvents);
        }
        // TODO (Agent B - Te): Real-time pattern detection for high-priority patterns
        // For now, we just buffer events for batch processing
    }
    /**
     * Detect patterns from event history
     *
     * Called periodically or on-demand.
     * Returns detected patterns with confidence scores.
     */
    async detectPatterns(events, options) {
        const patterns = [];
        // Apply filters
        let filteredEvents = events;
        if (options?.timeWindow) {
            const { start, end } = options.timeWindow;
            filteredEvents = filteredEvents.filter(e => {
                const timestamp = new Date(e.timestamp);
                return timestamp >= start && timestamp <= end;
            });
        }
        if (options?.userId) {
            filteredEvents = filteredEvents.filter(e => e.userId === options.userId);
        }
        if (options?.mode) {
            filteredEvents = filteredEvents.filter(e => e.mode === options.mode);
        }
        if (options?.role) {
            filteredEvents = filteredEvents.filter(e => e.role === options.role);
        }
        // Detect patterns by type
        const typesToDetect = options?.patternTypes || [
            'frequent_action',
            'time_based_routine',
            'mode_preference',
            'error_pattern',
            'efficiency_gain',
            'risk_threshold'
        ];
        for (const patternType of typesToDetect) {
            const detected = await this.detectPatternType(patternType, filteredEvents, options);
            patterns.push(...detected);
        }
        // Filter by minimum confidence
        const minConfidence = options?.minConfidence ?? ConfidenceThreshold.LOG_ONLY;
        return patterns.filter(p => p.confidence >= minConfidence);
    }
    /**
     * Detect patterns of a specific type
     *
     * TODO (Agent B - Te): Implement specialized detectors for each pattern type
     */
    async detectPatternType(patternType, events, options) {
        // Stub implementations - Agent B (Te) will implement these
        switch (patternType) {
            case 'frequent_action':
                return this.detectFrequentActions(events);
            case 'time_based_routine':
                return this.detectTimeRoutines(events);
            case 'mode_preference':
                return this.detectModePreferences(events);
            case 'error_pattern':
                return this.detectErrorPatterns(events);
            case 'efficiency_gain':
                return this.detectEfficiencyGains(events);
            case 'risk_threshold':
                return this.detectRiskThresholds(events);
            default:
                return [];
        }
    }
    /**
     * Detect frequent actions
     *
     * TODO (Agent B - Te): Implement full algorithm
     */
    async detectFrequentActions(events) {
        // Count action frequencies
        const actionCounts = {};
        const actionEvents = {};
        for (const event of events) {
            if (event.type === 'action_completed' || event.type === 'task_complete') {
                const action = event.payload.action ||
                    event.payload.taskLabel ||
                    'unknown';
                actionCounts[action] = (actionCounts[action] || 0) + 1;
                actionEvents[action] = actionEvents[action] || [];
                actionEvents[action].push(event.id);
            }
        }
        // Find frequent actions (threshold: > 5 occurrences)
        const patterns = [];
        for (const [action, count] of Object.entries(actionCounts)) {
            if (count > 5) {
                const confidence = Math.min(1.0, count / 20); // Max confidence at 20 occurrences
                patterns.push({
                    id: `pattern-frequent-${action}-${Date.now()}`,
                    type: 'frequent_action',
                    detectedAt: new Date().toISOString(),
                    confidence,
                    data: {
                        actions: [action],
                        frequency: count,
                    },
                    eventIds: actionEvents[action],
                    eventCount: count,
                    status: 'detected',
                });
            }
        }
        return patterns;
    }
    /**
     * Detect time-based routines
     *
     * TODO (Agent B - Te): Implement full algorithm
     */
    async detectTimeRoutines(events) {
        // Stub - Agent B will implement
        return [];
    }
    /**
     * Detect mode preferences
     *
     * TODO (Agent B - Te): Implement full algorithm
     */
    async detectModePreferences(events) {
        // Stub - Agent B will implement
        return [];
    }
    /**
     * Detect error patterns
     *
     * TODO (Agent B - Te): Implement full algorithm
     */
    async detectErrorPatterns(events) {
        // Stub - Agent B will implement
        return [];
    }
    /**
     * Detect efficiency gains
     *
     * TODO (Agent B - Te): Implement full algorithm
     */
    async detectEfficiencyGains(events) {
        // Stub - Agent B will implement
        return [];
    }
    /**
     * Detect risk thresholds
     *
     * TODO (Agent B - Te): Implement full algorithm
     */
    async detectRiskThresholds(events) {
        // Stub - Agent B will implement
        return [];
    }
    /**
     * Generate insights from patterns
     *
     * TODO (Agent E - Sol): Implement natural language insight generation
     */
    async generateInsights(patterns) {
        const insights = [];
        for (const pattern of patterns) {
            // Basic insight generation - Agent E (Sol) will enhance
            const insight = {
                id: `insight-${pattern.id}`,
                patternId: pattern.id,
                generatedAt: new Date().toISOString(),
                confidence: pattern.confidence,
                title: this.generateInsightTitle(pattern),
                description: this.generateInsightDescription(pattern),
                recommendation: this.generateInsightRecommendation(pattern),
                suggestedActions: await this.generateSuggestedActions(pattern),
            };
            insights.push(insight);
        }
        return insights;
    }
    /**
     * Generate insight title
     *
     * TODO (Agent E - Sol): Enhance with better NLG
     */
    generateInsightTitle(pattern) {
        switch (pattern.type) {
            case 'frequent_action':
                return `Frequent action detected`;
            case 'time_based_routine':
                return `Time-based routine identified`;
            case 'mode_preference':
                return `Mode preference learned`;
            case 'error_pattern':
                return `Error pattern found`;
            case 'efficiency_gain':
                return `Efficiency improvement detected`;
            case 'risk_threshold':
                return `Risk tolerance learned`;
            default:
                return `Pattern detected`;
        }
    }
    /**
     * Generate insight description
     *
     * TODO (Agent E - Sol): Enhance with better NLG
     */
    generateInsightDescription(pattern) {
        switch (pattern.type) {
            case 'frequent_action':
                const actions = pattern.data.actions || [];
                const freq = pattern.data.frequency || 0;
                return `You execute '${actions[0]}' approximately ${freq} times. This action could be optimized.`;
            default:
                return `A ${pattern.type} pattern was detected with ${(pattern.confidence * 100).toFixed(0)}% confidence.`;
        }
    }
    /**
     * Generate insight recommendation
     *
     * TODO (Agent E - Sol): Enhance with better recommendations
     */
    generateInsightRecommendation(pattern) {
        switch (pattern.type) {
            case 'frequent_action':
                return `Consider creating a hotkey or automation for this action.`;
            case 'time_based_routine':
                return `Consider scheduling this as an automatic task.`;
            case 'mode_preference':
                return `Set this as your default mode for this context.`;
            case 'error_pattern':
                return `Review this workflow to reduce errors.`;
            case 'efficiency_gain':
                return `Continue using this workflow for better efficiency.`;
            case 'risk_threshold':
                return `Adjust your risk settings to match your actual behavior.`;
            default:
                return `Review this pattern and take appropriate action.`;
        }
    }
    /**
     * Generate suggested actions from pattern
     *
     * TODO (Agent D - Luna): Implement preference/constraint adjustments
     */
    async generateSuggestedActions(pattern) {
        const actions = [];
        // Basic action generation - Agent D (Luna) will enhance
        if (pattern.type === 'frequent_action' && pattern.confidence > ConfidenceThreshold.SUGGEST) {
            actions.push({
                id: `action-${pattern.id}`,
                type: 'suggest_automation',
                insightId: `insight-${pattern.id}`,
                confidence: pattern.confidence,
                target: 'automation',
                currentValue: null,
                suggestedValue: {
                    action: pattern.data.actions?.[0],
                    trigger: 'manual',
                },
                reason: `Action performed ${pattern.data.frequency} times`,
                status: 'pending',
            });
        }
        return actions;
    }
    /**
     * Apply learning
     *
     * TODO (Agent D - Luna): Implement actual preference/constraint updates
     */
    async applyLearning(insights) {
        const appliedActions = [];
        for (const insight of insights) {
            // Only auto-apply high-confidence insights
            if (insight.confidence >= ConfidenceThreshold.AUTO_APPLY) {
                for (const action of insight.suggestedActions) {
                    // Agent D (Luna) will implement actual application logic
                    // For now, just mark as applied
                    action.status = 'applied';
                    action.appliedAt = new Date().toISOString();
                    appliedActions.push(action);
                }
            }
        }
        return appliedActions;
    }
    /**
     * Get recent events buffer
     */
    getRecentEvents() {
        return [...this.recentEvents];
    }
    /**
     * Clear recent events buffer
     */
    clearRecentEvents() {
        this.recentEvents = [];
    }
}
/**
 * Global learning pipeline instance
 */
let globalLearningPipeline = null;
/**
 * Get the global learning pipeline instance
 */
export function getLearningPipeline() {
    if (!globalLearningPipeline) {
        globalLearningPipeline = new DefaultLearningPipeline();
    }
    return globalLearningPipeline;
}
/**
 * Reset the global learning pipeline (for testing)
 */
export function resetLearningPipeline() {
    globalLearningPipeline = null;
}
//# sourceMappingURL=patterns.js.map