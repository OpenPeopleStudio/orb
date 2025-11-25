/**
 * Preference Learning
 *
 * Phase 6: Learn from patterns and adapt user preferences
 *
 * Converts detected patterns into actionable preference changes.
 */
import type { Pattern, LearningAction } from '@orb-system/core-orb';
import type { LunaProfile } from './types';
export declare class PreferenceLearning {
    /**
     * Generate learning actions from pattern
     */
    generateLearningActions(pattern: Pattern): Promise<LearningAction[]>;
    /**
     * Learn from frequent actions
     */
    private learnFromFrequentAction;
    /**
     * Learn from mode preferences
     */
    private learnFromModePreference;
    /**
     * Learn from risk thresholds
     */
    private learnFromRiskThreshold;
    /**
     * Learn from time-based routines
     */
    private learnFromTimeBasedRoutine;
    /**
     * Learn from error patterns
     */
    private learnFromErrorPattern;
    /**
     * Learn from efficiency gains
     */
    private learnFromEfficiencyGain;
    /**
     * Apply learning action to profile
     */
    applyLearningAction(action: LearningAction, profile: LunaProfile): Promise<LunaProfile>;
}
export declare const preferenceLearning: PreferenceLearning;
//# sourceMappingURL=preferenceLearning.d.ts.map