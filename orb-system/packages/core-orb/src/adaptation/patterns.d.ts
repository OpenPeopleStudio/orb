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
import type { OrbEvent } from '../events/types';
import type { LearningPipeline, Pattern, Insight, LearningAction, DetectionOptions } from './types';
/**
 * Default Learning Pipeline Implementation
 *
 * Provides basic pattern detection and insight generation.
 * Individual agents (Te, Luna, Sol) will extend this with
 * specialized detectors and generators.
 */
export declare class DefaultLearningPipeline implements LearningPipeline {
    private recentEvents;
    private maxRecentEvents;
    /**
     * Process a single event
     *
     * Called by event bus for every event.
     * Stores events for batch pattern detection.
     */
    processEvent(event: OrbEvent): Promise<void>;
    /**
     * Detect patterns from event history
     *
     * Called periodically or on-demand.
     * Returns detected patterns with confidence scores.
     */
    detectPatterns(events: OrbEvent[], options?: DetectionOptions): Promise<Pattern[]>;
    /**
     * Detect patterns of a specific type
     *
     * TODO (Agent B - Te): Implement specialized detectors for each pattern type
     */
    private detectPatternType;
    /**
     * Detect frequent actions
     *
     * TODO (Agent B - Te): Implement full algorithm
     */
    private detectFrequentActions;
    /**
     * Detect time-based routines
     *
     * TODO (Agent B - Te): Implement full algorithm
     */
    private detectTimeRoutines;
    /**
     * Detect mode preferences
     *
     * TODO (Agent B - Te): Implement full algorithm
     */
    private detectModePreferences;
    /**
     * Detect error patterns
     *
     * TODO (Agent B - Te): Implement full algorithm
     */
    private detectErrorPatterns;
    /**
     * Detect efficiency gains
     *
     * TODO (Agent B - Te): Implement full algorithm
     */
    private detectEfficiencyGains;
    /**
     * Detect risk thresholds
     *
     * TODO (Agent B - Te): Implement full algorithm
     */
    private detectRiskThresholds;
    /**
     * Generate insights from patterns
     *
     * TODO (Agent E - Sol): Implement natural language insight generation
     */
    generateInsights(patterns: Pattern[]): Promise<Insight[]>;
    /**
     * Generate insight title
     *
     * TODO (Agent E - Sol): Enhance with better NLG
     */
    private generateInsightTitle;
    /**
     * Generate insight description
     *
     * TODO (Agent E - Sol): Enhance with better NLG
     */
    private generateInsightDescription;
    /**
     * Generate insight recommendation
     *
     * TODO (Agent E - Sol): Enhance with better recommendations
     */
    private generateInsightRecommendation;
    /**
     * Generate suggested actions from pattern
     *
     * TODO (Agent D - Luna): Implement preference/constraint adjustments
     */
    private generateSuggestedActions;
    /**
     * Apply learning
     *
     * TODO (Agent D - Luna): Implement actual preference/constraint updates
     */
    applyLearning(insights: Insight[]): Promise<LearningAction[]>;
    /**
     * Get recent events buffer
     */
    getRecentEvents(): OrbEvent[];
    /**
     * Clear recent events buffer
     */
    clearRecentEvents(): void;
}
/**
 * Get the global learning pipeline instance
 */
export declare function getLearningPipeline(): DefaultLearningPipeline;
/**
 * Reset the global learning pipeline (for testing)
 */
export declare function resetLearningPipeline(): void;
//# sourceMappingURL=patterns.d.ts.map