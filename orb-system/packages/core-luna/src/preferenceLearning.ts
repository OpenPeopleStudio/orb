/**
 * Preference Learning
 * 
 * Phase 6: Learn from patterns and adapt user preferences
 * 
 * Converts detected patterns into actionable preference changes.
 */

import type { 
  Pattern, 
  LearningAction, 
  ConfidenceThreshold,
  LearningActionType,
} from '@orb-system/core-orb';
import type { LunaProfile, LunaConstraint } from './types';

export class PreferenceLearning {
  /**
   * Generate learning actions from pattern
   */
  async generateLearningActions(pattern: Pattern): Promise<LearningAction[]> {
    const actions: LearningAction[] = [];
    
    switch (pattern.type) {
      case 'frequent_action':
        actions.push(...this.learnFromFrequentAction(pattern));
        break;
      case 'mode_preference':
        actions.push(...this.learnFromModePreference(pattern));
        break;
      case 'risk_threshold':
        actions.push(...this.learnFromRiskThreshold(pattern));
        break;
      case 'time_based_routine':
        actions.push(...this.learnFromTimeBasedRoutine(pattern));
        break;
      case 'error_pattern':
        actions.push(...this.learnFromErrorPattern(pattern));
        break;
      case 'efficiency_gain':
        actions.push(...this.learnFromEfficiencyGain(pattern));
        break;
    }
    
    return actions;
  }
  
  /**
   * Learn from frequent actions
   */
  private learnFromFrequentAction(pattern: Pattern): LearningAction[] {
    if (pattern.confidence < 0.75) return [];
    
    return [{
      id: `action-${pattern.id}`,
      type: 'suggest_automation',
      insightId: `insight-${pattern.id}`,
      confidence: pattern.confidence,
      target: 'automation',
      currentValue: null,
      suggestedValue: {
        action: pattern.data.actions?.[0],
        trigger: 'shortcut',
      },
      reason: `Action performed ${pattern.data.frequency} times`,
      status: 'pending',
    }];
  }
  
  /**
   * Learn from mode preferences
   */
  private learnFromModePreference(pattern: Pattern): LearningAction[] {
    if (pattern.confidence < 0.85) return [];
    
    const usageRate = pattern.data.usageRate as number ?? 0;
    
    return [{
      id: `action-${pattern.id}`,
      type: 'update_preference',
      insightId: `insight-${pattern.id}`,
      confidence: pattern.confidence,
      target: 'default_mode',
      currentValue: 'default',
      suggestedValue: pattern.data.modes?.[0],
      reason: `Mode used ${(usageRate * 100).toFixed(0)}% of time`,
      status: 'pending',
    }];
  }
  
  /**
   * Learn from risk thresholds
   */
  private learnFromRiskThreshold(pattern: Pattern): LearningAction[] {
    if (pattern.confidence < 0.9) return [];
    
    return [{
      id: `action-${pattern.id}`,
      type: 'adjust_risk_threshold',
      insightId: `insight-${pattern.id}`,
      confidence: pattern.confidence,
      target: 'risk_tolerance',
      currentValue: 'medium',
      suggestedValue: 'high',
      reason: `Always approves high-risk actions (${pattern.eventCount} times)`,
      status: 'pending',
    }];
  }
  
  /**
   * Learn from time-based routines
   */
  private learnFromTimeBasedRoutine(pattern: Pattern): LearningAction[] {
    if (pattern.confidence < 0.8) return [];
    
    return [{
      id: `action-${pattern.id}`,
      type: 'suggest_automation',
      insightId: `insight-${pattern.id}`,
      confidence: pattern.confidence,
      target: 'scheduled_action',
      currentValue: null,
      suggestedValue: {
        action: pattern.data.actions?.[0],
        schedule: pattern.data.timeWindow,
      },
      reason: `Action performed regularly during ${JSON.stringify(pattern.data.timeWindow)}`,
      status: 'pending',
    }];
  }
  
  /**
   * Learn from error patterns
   */
  private learnFromErrorPattern(pattern: Pattern): LearningAction[] {
    if (pattern.confidence < 0.7) return [];
    
    return [{
      id: `action-${pattern.id}`,
      type: 'adjust_constraint',
      insightId: `insight-${pattern.id}`,
      confidence: pattern.confidence,
      target: 'error_prevention',
      currentValue: null,
      suggestedValue: {
        blockAction: pattern.data.actions?.[0],
        reason: `Action fails frequently (${(pattern.data.errorRate! * 100).toFixed(0)}% error rate)`,
      },
      reason: `Action fails ${pattern.eventCount} times`,
      status: 'pending',
    }];
  }
  
  /**
   * Learn from efficiency gains
   */
  private learnFromEfficiencyGain(pattern: Pattern): LearningAction[] {
    if (pattern.confidence < 0.75) return [];
    
    return [{
      id: `action-${pattern.id}`,
      type: 'recommend_mode',
      insightId: `insight-${pattern.id}`,
      confidence: pattern.confidence,
      target: 'workflow_optimization',
      currentValue: pattern.data.avgDuration,
      suggestedValue: pattern.data.modes?.[0],
      reason: `New workflow is ${((1 - (pattern.data.avgDuration as number)) * 100).toFixed(0)}% faster`,
      status: 'pending',
    }];
  }
  
  /**
   * Apply learning action to profile
   */
  async applyLearningAction(
    action: LearningAction,
    profile: LunaProfile
  ): Promise<LunaProfile> {
    switch (action.type) {
      case 'update_preference':
        // Convert preferences from string[] to Record<string, unknown>
        const prefsRecord: Record<string, unknown> = {};
        for (const pref of profile.preferences) {
          // Parse "key: value" strings or use as-is
          if (pref.includes(':')) {
            const [key, ...valueParts] = pref.split(':');
            prefsRecord[key.trim()] = valueParts.join(':').trim();
          } else {
            prefsRecord[pref] = true;
          }
        }
        
        // Update the target preference
        prefsRecord[action.target] = action.suggestedValue;
        
        // Convert back to string[]
        profile.preferences = Object.entries(prefsRecord).map(
          ([key, value]) => typeof value === 'boolean' ? key : `${key}: ${value}`
        );
        break;
        
      case 'adjust_constraint':
        // Add new constraint to profile
        const newConstraint: LunaConstraint = {
          id: `constraint-${Date.now()}`,
          type: 'other',
          active: true,
          description: action.reason,
        };
        profile.constraints.push(newConstraint);
        break;
        
      case 'adjust_risk_threshold':
        // Convert preferences to record, update risk tolerance, convert back
        const riskPrefsRecord: Record<string, unknown> = {};
        for (const pref of profile.preferences) {
          if (pref.includes(':')) {
            const [key, ...valueParts] = pref.split(':');
            riskPrefsRecord[key.trim()] = valueParts.join(':').trim();
          } else {
            riskPrefsRecord[pref] = true;
          }
        }
        
        riskPrefsRecord['riskTolerance'] = action.suggestedValue;
        
        profile.preferences = Object.entries(riskPrefsRecord).map(
          ([key, value]) => typeof value === 'boolean' ? key : `${key}: ${value}`
        );
        break;
        
      case 'suggest_automation':
      case 'recommend_mode':
      case 'create_shortcut':
        // These types don't directly modify the profile
        // They are suggestions that require user interaction or other system changes
        console.log(`[Luna] Learning action type ${action.type} requires external handling`);
        break;
    }
    
    // Mark action as applied
    action.status = 'applied';
    action.appliedAt = new Date().toISOString();
    
    // Update profile timestamp
    profile.updatedAt = new Date().toISOString();
    
    return profile;
  }
}

// Export singleton instance
export const preferenceLearning = new PreferenceLearning();

