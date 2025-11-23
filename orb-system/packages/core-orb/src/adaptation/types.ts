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
export type PatternType = 
  | 'frequent_action'      // User does X often
  | 'time_based_routine'   // User does Y at specific times
  | 'mode_preference'      // User prefers mode Z for context W
  | 'error_pattern'        // Action fails repeatedly
  | 'efficiency_gain'      // New workflow is faster
  | 'risk_threshold';      // User's actual risk tolerance

/**
 * Pattern - detected usage pattern
 */
export interface Pattern {
  id: string;
  type: PatternType;
  detectedAt: string; // ISO timestamp
  confidence: number; // 0-1
  
  // Pattern-specific data
  data: {
    frequency?: number;
    timeWindow?: { start: string; end: string };
    actions?: string[];
    modes?: OrbMode[];
    errorRate?: number;
    avgDuration?: number;
    [key: string]: unknown;
  };
  
  // Supporting evidence
  eventIds: string[];
  eventCount: number;
  
  // Lifecycle
  status: 'detected' | 'validated' | 'applied' | 'rejected';
  
  // Optional metadata
  metadata?: Record<string, unknown>;
}

/**
 * Insight - actionable understanding from patterns
 */
export interface Insight {
  id: string;
  patternId: string;
  generatedAt: string; // ISO timestamp
  confidence: number; // 0-1
  
  // Natural language insight
  title: string;
  description: string;
  recommendation: string;
  
  // Actionable suggestions
  suggestedActions: LearningAction[];
  
  // User feedback
  userFeedback?: 'accepted' | 'rejected' | 'modified';
  appliedAt?: string;
  
  // Optional metadata
  metadata?: Record<string, unknown>;
}

/**
 * Learning Action Type - what the system can learn to do
 */
export type LearningActionType =
  | 'update_preference'
  | 'adjust_constraint'
  | 'suggest_automation'
  | 'recommend_mode'
  | 'adjust_risk_threshold'
  | 'create_shortcut';

/**
 * Learning Action - specific adaptation to apply
 */
export interface LearningAction {
  id: string;
  type: LearningActionType;
  insightId: string;
  confidence: number; // 0-1
  
  // What to do
  target: string; // e.g., "notification_frequency", "risk_level"
  currentValue: unknown;
  suggestedValue: unknown;
  reason: string;
  
  // Lifecycle
  status: 'pending' | 'applied' | 'rejected';
  appliedAt?: string;
  
  // Optional metadata
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
  // Time window to analyze
  timeWindow?: { start: Date; end: Date };
  
  // Minimum confidence to report
  minConfidence?: number;
  
  // Specific pattern types to detect
  patternTypes?: PatternType[];
  
  // Filter by context
  userId?: string;
  deviceId?: string;
  mode?: OrbMode;
  persona?: OrbPersona;
  role?: OrbRole;
  
  // Batch size for processing
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
  detectPatterns(
    events: OrbEvent[], 
    options?: DetectionOptions
  ): Promise<Pattern[]>;
  
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
export enum ConfidenceThreshold {
  AUTO_APPLY = 0.9,      // > 0.9: Auto-apply
  SUGGEST = 0.7,         // 0.7 - 0.9: Suggest to user
  LOG_ONLY = 0.5,        // 0.5 - 0.7: Log but don't surface
  IGNORE = 0.0,          // < 0.5: Ignore
}

/**
 * Learning Configuration - system-wide learning settings
 */
export interface LearningConfiguration {
  // Enable/disable learning
  enabled: boolean;
  
  // Confidence thresholds
  autoApplyThreshold: number;
  suggestThreshold: number;
  logOnlyThreshold: number;
  
  // Pattern detection settings
  detectionIntervalMs: number; // How often to run pattern detection
  eventBatchSize: number; // How many events to process at once
  minEventsForPattern: number; // Minimum events needed to detect pattern
  
  // Insight generation settings
  maxInsightsPerDay: number;
  prioritizeRecent: boolean;
  
  // Privacy settings
  localOnly: boolean; // Keep all learning local
  shareAnonymousUsage: boolean; // Share anonymous patterns
  
  // Auto-apply settings per pattern type
  autoApplyByType: Partial<Record<PatternType, boolean>>;
}

/**
 * Learning Metrics - track learning effectiveness
 */
export interface LearningMetrics {
  // Pattern detection metrics
  patternsDetected: number;
  patternsByType: Record<PatternType, number>;
  avgPatternConfidence: number;
  
  // Insight generation metrics
  insightsGenerated: number;
  insightsAccepted: number;
  insightsRejected: number;
  avgInsightConfidence: number;
  
  // Learning action metrics
  actionsApplied: number;
  actionsRejected: number;
  autoAppliedCount: number;
  userConfirmedCount: number;
  
  // Effectiveness metrics
  acceptanceRate: number; // insightsAccepted / insightsGenerated
  precisionRate: number; // autoAppliedCount / (autoAppliedCount + actionsRejected)
  
  // Time metrics
  avgTimeToDetectPattern: number; // milliseconds
  avgTimeToGenerateInsight: number; // milliseconds
  
  // Last updated
  lastUpdated: string; // ISO timestamp
}

