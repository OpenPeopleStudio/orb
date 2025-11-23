# Agent D: Luna (Preferences) - Adaptive Learning

**Mission**: Phase 6 - Learning Loop & Adaptation  
**Parent Mission**: `docs/prompts/MISSION_6_LEARNING_LOOP.md`

---

## Your Role

You are the **Luna (Preferences)** agent. Your job is to implement adaptive preferences that learn from patterns and automatically adjust user settings.

**Scope**:
- `orb-system/packages/core-luna/src/`
- Focus: Preference learning, constraint adjustments

---

## Deliverables

### 1. Preference Learning

**File**: `orb-system/packages/core-luna/src/preferenceLearning.ts` (NEW)

```typescript
import type { Pattern, LearningAction, ConfidenceThreshold } from '@orb-system/core-orb';
import type { LunaProfile } from './types';

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
    
    return [{
      id: `action-${pattern.id}`,
      type: 'update_preference',
      insightId: `insight-${pattern.id}`,
      confidence: pattern.confidence,
      target: 'default_mode',
      currentValue: 'default',
      suggestedValue: pattern.data.modes?.[0],
      reason: `Mode used ${(pattern.data.usageRate * 100).toFixed(0)}% of time`,
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
   * Apply learning action
   */
  async applyLearningAction(
    action: LearningAction,
    profile: LunaProfile
  ): Promise<LunaProfile> {
    switch (action.type) {
      case 'update_preference':
        profile.preferences[action.target] = action.suggestedValue;
        break;
        
      case 'adjust_constraint':
        // Update constraint in profile
        break;
        
      case 'adjust_risk_threshold':
        profile.preferences.riskTolerance = action.suggestedValue;
        break;
    }
    
    action.status = 'applied';
    action.appliedAt = new Date().toISOString();
    
    return profile;
  }
}

export const preferenceLearning = new PreferenceLearning();
```

### 2. Adaptive Preferences

**File**: `orb-system/packages/core-luna/src/adaptivePreferences.ts` (NEW)

```typescript
export class AdaptivePreferences {
  /**
   * Auto-apply high-confidence learnings
   */
  async autoApplyIfHighConfidence(action: LearningAction): Promise<boolean> {
    if (action.confidence >= ConfidenceThreshold.AUTO_APPLY) {
      // Apply automatically
      const profile = await this.getProfile(action.userId, action.modeId);
      await preferenceLearning.applyLearningAction(action, profile);
      await this.saveProfile(profile);
      return true;
    }
    
    return false;
  }
}
```

---

## Success Criteria

- ✅ Preference learning generates actions from patterns
- ✅ Confidence thresholds respected (0.9 auto, 0.7 suggest)
- ✅ Actions actually update preferences when applied
- ✅ Type errors resolved

**Time**: 1-2 days

