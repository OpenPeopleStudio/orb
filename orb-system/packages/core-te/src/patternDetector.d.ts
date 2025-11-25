/**
 * Pattern Detector
 *
 * Phase 6: Learning Loop - Pattern Detection
 *
 * Analyzes event streams to find usage patterns.
 * Implements all 6 pattern types: frequent_action, time_based_routine,
 * mode_preference, error_pattern, efficiency_gain, risk_threshold.
 */
import type { OrbEvent } from '@orb-system/core-orb';
import type { Pattern, DetectionOptions } from '@orb-system/core-orb';
export declare class PatternDetector {
    /**
     * Detect all patterns in events
     */
    detectPatterns(events: OrbEvent[], options?: DetectionOptions): Promise<Pattern[]>;
    /**
     * Detect frequent actions
     */
    detectFrequentActions(events: OrbEvent[], options?: DetectionOptions): Promise<Pattern[]>;
    /**
     * Detect time-based routines
     */
    detectTimeRoutines(events: OrbEvent[], options?: DetectionOptions): Promise<Pattern[]>;
    /**
     * Detect mode preferences
     */
    detectModePreferences(events: OrbEvent[], options?: DetectionOptions): Promise<Pattern[]>;
    /**
     * Detect error patterns
     */
    detectErrorPatterns(events: OrbEvent[], options?: DetectionOptions): Promise<Pattern[]>;
    /**
     * Detect efficiency gains
     */
    detectEfficiencyGains(events: OrbEvent[], options?: DetectionOptions): Promise<Pattern[]>;
    /**
     * Detect risk thresholds
     */
    detectRiskThresholds(events: OrbEvent[], options?: DetectionOptions): Promise<Pattern[]>;
    /**
     * Helper: Calculate time span in days
     */
    private calculateTimeSpan;
    /**
     * Helper: Count occurrences
     */
    private countOccurrences;
    /**
     * Helper: Get top value from counts
     */
    private getTopValue;
    /**
     * Helper: Calculate average
     */
    private average;
}
export declare function getPatternDetector(): PatternDetector;
export declare function resetPatternDetector(): void;
//# sourceMappingURL=patternDetector.d.ts.map