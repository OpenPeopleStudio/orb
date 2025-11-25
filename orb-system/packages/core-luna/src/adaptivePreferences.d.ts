/**
 * Adaptive Preferences
 *
 * Phase 6: Auto-apply high-confidence learnings
 *
 * Manages automatic preference updates based on learning confidence.
 */
import { type LearningAction } from '@orb-system/core-orb';
import type { LunaModeId } from './types';
import type { LunaPreferencesStore } from './preferencesStore';
export declare class AdaptivePreferences {
    private store;
    constructor(store?: LunaPreferencesStore);
    /**
     * Set preference store
     */
    setStore(store: LunaPreferencesStore): void;
    /**
     * Get profile for user and mode
     */
    private getProfile;
    /**
     * Save profile
     */
    private saveProfile;
    /**
     * Auto-apply high-confidence learnings
     */
    autoApplyIfHighConfidence(action: LearningAction, userId: string, modeId: LunaModeId): Promise<boolean>;
    /**
     * Apply learning action with confirmation
     */
    applyWithConfirmation(action: LearningAction, userId: string, modeId: LunaModeId, confirmed: boolean): Promise<boolean>;
    /**
     * Batch apply multiple learning actions
     */
    batchApply(actions: LearningAction[], userId: string, modeId: LunaModeId): Promise<{
        applied: number;
        rejected: number;
    }>;
    /**
     * Get suggested actions that need user confirmation
     */
    getSuggestedActions(actions: LearningAction[]): LearningAction[];
    /**
     * Get auto-applicable actions
     */
    getAutoApplicableActions(actions: LearningAction[]): LearningAction[];
}
export declare const adaptivePreferences: AdaptivePreferences;
//# sourceMappingURL=adaptivePreferences.d.ts.map