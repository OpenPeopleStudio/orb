/**
 * Adaptation Types
 *
 * Phase 6: Learning loop type system
 *
 * Defines patterns, insights, and learning actions for the
 * adaptation engine.
 */
import type { OrbMode, OrbPersona } from '../identity/types';
import type { OrbRole } from '../orbRoles';
import type { OrbEvent } from '../events/types';
/**
 * Pattern Type - categories of learnable patterns
 */
export type PatternType = 'frequent_action' | 'time_based_routine' | 'mode_preference' | 'error_pattern' | 'efficiency_gain' | 'risk_threshold';
/**
 * Pattern - detected usage pattern
 */
export interface Pattern {
    id: string;
    type: PatternType;
    detectedAt: string;
    confidence: number;
    data: {
        frequency?: number;
        timeWindow?: {
            start: string;
            end: string;
        };
        actions?: string[];
        modes?: OrbMode[];
        errorRate?: number;
        avgDuration?: number;
        [key: string]: unknown;
    };
    eventIds: string[];
    eventCount: number;
    status: 'detected' | 'validated' | 'applied' | 'rejected';
    metadata?: Record<string, unknown>;
}
/**
 * Insight - actionable understanding from patterns
 */
export interface Insight {
    id: string;
    patternId: string;
    generatedAt: string;
    confidence: number;
    title: string;
    description: string;
    recommendation: string;
    suggestedActions: LearningAction[];
    userFeedback?: 'accepted' | 'rejected' | 'modified';
    appliedAt?: string;
    metadata?: Record<string, unknown>;
}
/**
 * Learning Action Type - what the system can learn to do
 */
export type LearningActionType = 'update_preference' | 'adjust_constraint' | 'suggest_automation' | 'recommend_mode' | 'adjust_risk_threshold' | 'create_shortcut';
/**
 * Learning Action - specific adaptation to apply
 */
export interface LearningAction {
    id: string;
    type: LearningActionType;
    insightId: string;
    confidence: number;
    target: string;
    currentValue: unknown;
    suggestedValue: unknown;
    reason: string;
    status: 'pending' | 'applied' | 'rejected';
    appliedAt?: string;
    metadata?: Record<string, unknown>;
}
/**
 * Time Window - for pattern detection
 */
export interface TimeWindow {
    start: Date;
    end: Date;
}
/**
 * Detection Options - configuration for pattern detection
 */
export interface DetectionOptions {
    timeWindow?: {
        start: Date;
        end: Date;
    };
    minConfidence?: number;
    patternTypes?: PatternType[];
    userId?: string;
    deviceId?: string;
    mode?: OrbMode;
    persona?: OrbPersona;
    role?: OrbRole;
    batchSize?: number;
}
/**
 * Learning Pipeline - interface for the learning system
 *
 * Events → Patterns → Insights → Actions
 */
export interface LearningPipeline {
    /**
     * Process a single event
     * (called by event bus for every event)
     */
    processEvent(event: OrbEvent): Promise<void>;
    /**
     * Detect patterns from event history
     * (called periodically or on-demand)
     */
    detectPatterns(events: OrbEvent[], options?: DetectionOptions): Promise<Pattern[]>;
    /**
     * Generate insights from patterns
     */
    generateInsights(patterns: Pattern[]): Promise<Insight[]>;
    /**
     * Apply learning (update preferences, constraints, etc.)
     */
    applyLearning(insights: Insight[]): Promise<LearningAction[]>;
}
/**
 * Pattern Detector - specialized pattern detection
 */
export interface PatternDetector {
    /**
     * Detect a specific pattern type
     */
    detect(events: OrbEvent[], options?: DetectionOptions): Promise<Pattern[]>;
    /**
     * Pattern type this detector handles
     */
    readonly patternType: PatternType;
    /**
     * Minimum confidence threshold
     */
    readonly minConfidence: number;
}
/**
 * Insight Generator - converts patterns to insights
 */
export interface InsightGenerator {
    /**
     * Generate insight from a pattern
     */
    generate(pattern: Pattern, context?: InsightContext): Promise<Insight>;
    /**
     * Prioritize multiple insights
     */
    prioritize(insights: Insight[]): Insight[];
}
/**
 * Insight Context - additional context for insight generation
 */
export interface InsightContext {
    userId?: string;
    currentMode?: OrbMode;
    currentPersona?: OrbPersona;
    recentEvents?: OrbEvent[];
    existingInsights?: Insight[];
}
/**
 * Learning Store - persistence for patterns and insights
 */
export interface LearningStore {
    /**
     * Save a pattern
     */
    savePattern(pattern: Pattern): Promise<void>;
    /**
     * Get patterns
     */
    getPatterns(filter?: PatternFilter): Promise<Pattern[]>;
    /**
     * Save an insight
     */
    saveInsight(insight: Insight): Promise<void>;
    /**
     * Get insights
     */
    getInsights(filter?: InsightFilter): Promise<Insight[]>;
    /**
     * Save a learning action
     */
    saveLearningAction(action: LearningAction): Promise<void>;
    /**
     * Get learning actions
     */
    getLearningActions(filter?: LearningActionFilter): Promise<LearningAction[]>;
}
/**
 * Pattern Filter - for querying patterns
 */
export interface PatternFilter {
    type?: PatternType | PatternType[];
    status?: Pattern['status'] | Array<Pattern['status']>;
    minConfidence?: number;
    dateFrom?: string;
    dateTo?: string;
    limit?: number;
}
/**
 * Insight Filter - for querying insights
 */
export interface InsightFilter {
    patternId?: string;
    status?: 'pending' | 'applied' | 'rejected';
    minConfidence?: number;
    dateFrom?: string;
    dateTo?: string;
    limit?: number;
}
/**
 * Learning Action Filter - for querying learning actions
 */
export interface LearningActionFilter {
    insightId?: string;
    type?: LearningActionType | LearningActionType[];
    status?: LearningAction['status'] | Array<LearningAction['status']>;
    dateFrom?: string;
    dateTo?: string;
    limit?: number;
}
/**
 * Confidence Threshold - for auto-applying learnings
 */
export declare enum ConfidenceThreshold {
    AUTO_APPLY = 0.9,// > 0.9: Auto-apply
    SUGGEST = 0.7,// 0.7 - 0.9: Suggest to user
    LOG_ONLY = 0.5,// 0.5 - 0.7: Log but don't surface
    IGNORE = 0
}
/**
 * Learning Configuration - system-wide learning settings
 */
export interface LearningConfiguration {
    enabled: boolean;
    autoApplyThreshold: number;
    suggestThreshold: number;
    logOnlyThreshold: number;
    detectionIntervalMs: number;
    eventBatchSize: number;
    minEventsForPattern: number;
    maxInsightsPerDay: number;
    prioritizeRecent: boolean;
    localOnly: boolean;
    shareAnonymousUsage: boolean;
    autoApplyByType: Partial<Record<PatternType, boolean>>;
}
/**
 * Learning Metrics - track learning effectiveness
 */
export interface LearningMetrics {
    patternsDetected: number;
    patternsByType: Record<PatternType, number>;
    avgPatternConfidence: number;
    insightsGenerated: number;
    insightsAccepted: number;
    insightsRejected: number;
    avgInsightConfidence: number;
    actionsApplied: number;
    actionsRejected: number;
    autoAppliedCount: number;
    userConfirmedCount: number;
    acceptanceRate: number;
    precisionRate: number;
    avgTimeToDetectPattern: number;
    avgTimeToGenerateInsight: number;
    lastUpdated: string;
}
//# sourceMappingURL=types.d.ts.map