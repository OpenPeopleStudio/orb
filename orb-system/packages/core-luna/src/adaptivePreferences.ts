/**
 * Adaptive Preferences
 * 
 * Phase 6: Auto-apply high-confidence learnings
 * 
 * Manages automatic preference updates based on learning confidence.
 */

import { ConfidenceThreshold, getEventBus, OrbEventType, OrbRole, type LearningAction } from '@orb-system/core-orb';
import type { LunaProfile, LunaModeId } from './types';
import { preferenceLearning } from './preferenceLearning';
import type { LunaPreferencesStore } from './preferencesStore';
import { InMemoryLunaPreferencesStore } from './preferencesStore';

export class AdaptivePreferences {
  private store: LunaPreferencesStore;
  
  constructor(store?: LunaPreferencesStore) {
    this.store = store || new InMemoryLunaPreferencesStore();
  }
  
  /**
   * Set preference store
   */
  setStore(store: LunaPreferencesStore): void {
    this.store = store;
  }
  
  /**
   * Get profile for user and mode
   */
  private async getProfile(userId: string, modeId: LunaModeId): Promise<LunaProfile | null> {
    return this.store.getProfile(userId, modeId);
  }
  
  /**
   * Save profile
   */
  private async saveProfile(profile: LunaProfile): Promise<void> {
    await this.store.saveProfile(profile);
  }
  
  /**
   * Auto-apply high-confidence learnings
   */
  async autoApplyIfHighConfidence(
    action: LearningAction,
    userId: string,
    modeId: LunaModeId
  ): Promise<boolean> {
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
  async applyWithConfirmation(
    action: LearningAction,
    userId: string,
    modeId: LunaModeId,
    confirmed: boolean
  ): Promise<boolean> {
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
  async batchApply(
    actions: LearningAction[],
    userId: string,
    modeId: LunaModeId
  ): Promise<{ applied: number; rejected: number }> {
    let applied = 0;
    let rejected = 0;
    
    for (const action of actions) {
      const result = await this.autoApplyIfHighConfidence(action, userId, modeId);
      
      if (result) {
        applied++;
      } else if (action.confidence < ConfidenceThreshold.SUGGEST) {
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
  getSuggestedActions(actions: LearningAction[]): LearningAction[] {
    return actions.filter(
      (action) =>
        action.status === 'pending' &&
        action.confidence >= ConfidenceThreshold.SUGGEST &&
        action.confidence < ConfidenceThreshold.AUTO_APPLY
    );
  }
  
  /**
   * Get auto-applicable actions
   */
  getAutoApplicableActions(actions: LearningAction[]): LearningAction[] {
    return actions.filter(
      (action) =>
        action.status === 'pending' &&
        action.confidence >= ConfidenceThreshold.AUTO_APPLY
    );
  }
}

// Export singleton instance
export const adaptivePreferences = new AdaptivePreferences();

