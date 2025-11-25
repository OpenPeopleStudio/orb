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
import type { EventFilter } from '../events/types';
import type { OrbMode } from '../identity/types';
/**
 * Pattern - discovered pattern from events
 */
export interface AdaptationPattern {
    id: string;
    type: LegacyPatternType;
    confidence: number;
    description: string;
    metadata: Record<string, unknown>;
    createdAt: string;
}
/**
 * Legacy Pattern Type - categories of patterns (Phase 4)
 *
 * Note: Phase 6 uses PatternType from ./types.ts
 * This enum is kept for backwards compatibility.
 */
export declare enum LegacyPatternType {
    MODE_USAGE = "mode_usage",
    ERROR_PATTERN = "error_pattern",
    FEATURE_USAGE = "feature_usage",
    PERFORMANCE_PATTERN = "performance_pattern",
    USER_BEHAVIOR = "user_behavior"
}
/**
 * Adaptation Insights - computed insights from patterns
 */
export interface AdaptationInsights {
    mostUsedModes: Array<{
        mode: string;
        count: number;
        percentage: number;
    }>;
    failingFeatures: Array<{
        feature: string;
        errorRate: number;
        errorCount: number;
    }>;
    peakUsageTimes: Array<{
        hour: number;
        count: number;
    }>;
    deviceUsage: Array<{
        device: string;
        count: number;
        percentage: number;
    }>;
    roleActivity: Array<{
        role: string;
        count: number;
        percentage: number;
    }>;
    averageTaskDuration?: number;
    errorRate: number;
    successRate: number;
    patterns: AdaptationPattern[];
}
/**
 * Adaptation Adjustments - actual changes to defaults
 */
export interface AdaptationAdjustments {
    defaultMode?: OrbMode;
    modePromotions?: Array<{
        mode: OrbMode;
        priority: number;
    }>;
    featureFlags?: Record<string, boolean>;
    lunaPreferences?: Record<string, unknown>;
    recommendations: string[];
    appliedAt: string;
}
/**
 * Adaptation Engine
 *
 * Computes patterns and insights from event history,
 * and automatically adjusts defaults based on usage patterns.
 */
export declare class AdaptationEngine {
    private eventBus;
    private adjustments;
    /**
     * Compute adaptation insights from events
     */
    computeInsights(filter?: EventFilter): Promise<AdaptationInsights>;
    /**
     * Compute patterns from events
     */
    private computePatterns;
    /**
     * Compute and apply adaptation adjustments
     *
     * This is the core learning function - it analyzes events and
     * automatically adjusts defaults based on usage patterns.
     */
    computeAndApplyAdjustments(filter?: EventFilter): Promise<AdaptationAdjustments>;
    /**
     * Get current adjustments
     */
    getAdjustments(): AdaptationAdjustments | null;
    /**
     * Get recommendations based on insights
     */
    getRecommendations(filter?: EventFilter): Promise<string[]>;
    /**
     * Get adaptation suggestions for a specific mode
     */
    getModeSuggestions(mode: OrbMode, filter?: EventFilter): Promise<string[]>;
}
/**
 * Get the global adaptation engine instance
 */
export declare function getAdaptationEngine(): AdaptationEngine;
/**
 * Reset the global adaptation engine (for testing)
 */
export declare function resetAdaptationEngine(): void;
//# sourceMappingURL=engine.d.ts.map