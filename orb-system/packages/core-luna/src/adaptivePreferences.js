/**
 * Adaptive Preferences
 *
 * Phase 6: Auto-apply high-confidence learnings
 *
 * Manages automatic preference updates based on learning confidence.
 */
import { ConfidenceThreshold, getEventBus, OrbEventType, OrbRole } from '@orb-system/core-orb';
import { preferenceLearning } from './preferenceLearning';
import { InMemoryLunaPreferencesStore } from './preferencesStore';
export class AdaptivePreferences {
    constructor(store) {
        this.store = store || new InMemoryLunaPreferencesStore();
    }
    /**
     * Set preference store
     */
    setStore(store) {
        this.store = store;
    }
    /**
     * Get profile for user and mode
     */
    async getProfile(userId, modeId) {
        return this.store.getProfile(userId, modeId);
    }
    /**
     * Save profile
     */
    async saveProfile(profile) {
        await this.store.saveProfile(profile);
    }
    /**
     * Auto-apply high-confidence learnings
     */
    async autoApplyIfHighConfidence(action, userId, modeId) {
        if (action.confidence >= ConfidenceThreshold.AUTO_APPLY) {
            // Apply automatically
            const profile = await this.getProfile(userId, modeId);
            if (!profile) {
                console.warn(`[Luna] No profile found for user ${userId} mode ${modeId}`);
                return false;
            }
            await preferenceLearning.applyLearningAction(action, profile);
            await this.saveProfile(profile);
            // Emit preference update event
            const eventBus = getEventBus();
            await eventBus.emit({
                id: `evt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                type: OrbEventType.PREFERENCE_UPDATED,
                timestamp: new Date().toISOString(),
                userId,
                sessionId: `adaptive-${Date.now()}`,
                role: OrbRole.LUNA,
                payload: {
                    modeId,
                    actionType: action.type,
                    target: action.target,
                    suggestedValue: action.suggestedValue,
                    confidence: action.confidence,
                    autoApplied: true,
                },
                metadata: {
                    learningActionId: action.id,
                    insightId: action.insightId,
                    reason: action.reason,
                },
            });
            return true;
        }
        return false;
    }
    /**
     * Apply learning action with confirmation
     */
    async applyWithConfirmation(action, userId, modeId, confirmed) {
        if (!confirmed) {
            // User rejected the suggestion
            action.status = 'rejected';
            return false;
        }
        // User confirmed, apply the learning
        const profile = await this.getProfile(userId, modeId);
        if (!profile) {
            console.warn(`[Luna] No profile found for user ${userId} mode ${modeId}`);
            return false;
        }
        await preferenceLearning.applyLearningAction(action, profile);
        await this.saveProfile(profile);
        // Emit preference update event
        const eventBus = getEventBus();
        await eventBus.emit({
            id: `evt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            type: OrbEventType.PREFERENCE_UPDATED,
            timestamp: new Date().toISOString(),
            userId,
            sessionId: `adaptive-${Date.now()}`,
            role: OrbRole.LUNA,
            payload: {
                modeId,
                actionType: action.type,
                target: action.target,
                suggestedValue: action.suggestedValue,
                confidence: action.confidence,
                autoApplied: false,
                userConfirmed: true,
            },
            metadata: {
                learningActionId: action.id,
                insightId: action.insightId,
                reason: action.reason,
            },
        });
        return true;
    }
    /**
     * Batch apply multiple learning actions
     */
    async batchApply(actions, userId, modeId) {
        let applied = 0;
        let rejected = 0;
        for (const action of actions) {
            const result = await this.autoApplyIfHighConfidence(action, userId, modeId);
            if (result) {
                applied++;
            }
            else if (action.confidence < ConfidenceThreshold.SUGGEST) {
                // Too low confidence, reject
                action.status = 'rejected';
                rejected++;
            }
        }
        return { applied, rejected };
    }
    /**
     * Get suggested actions that need user confirmation
     */
    getSuggestedActions(actions) {
        return actions.filter((action) => action.status === 'pending' &&
            action.confidence >= ConfidenceThreshold.SUGGEST &&
            action.confidence < ConfidenceThreshold.AUTO_APPLY);
    }
    /**
     * Get auto-applicable actions
     */
    getAutoApplicableActions(actions) {
        return actions.filter((action) => action.status === 'pending' &&
            action.confidence >= ConfidenceThreshold.AUTO_APPLY);
    }
}
// Export singleton instance
export const adaptivePreferences = new AdaptivePreferences();
//# sourceMappingURL=adaptivePreferences.js.map