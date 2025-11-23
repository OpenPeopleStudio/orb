/**
 * useInsights Hook
 * 
 * Phase 6: Learning Loop UI Integration
 * 
 * Hook for fetching and managing insights, patterns, and learning actions.
 */

import { useState, useEffect, useCallback } from 'react';
import type { Pattern, Insight, LearningAction } from '@orb-system/core-orb';

export interface UseInsightsResult {
  patterns: Pattern[];
  insights: Insight[];
  learningActions: LearningAction[];
  pendingSuggestions: LearningAction[];
  appliedLearnings: LearningAction[];
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
  approveLearning: (actionId: string) => Promise<void>;
  rejectLearning: (actionId: string) => Promise<void>;
}

export function useInsights(): UseInsightsResult {
  const [patterns, setPatterns] = useState<Pattern[]>([]);
  const [insights, setInsights] = useState<Insight[]>([]);
  const [learningActions, setLearningActions] = useState<LearningAction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchInsights = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // TODO: Replace with actual API calls
      // For now, return mock data
      const mockPatterns: Pattern[] = [
        {
          id: 'pattern-1',
          type: 'frequent_action',
          detectedAt: new Date().toISOString(),
          confidence: 0.92,
          data: {
            actions: ['git-commit'],
            frequency: 47,
            avgPerDay: 6.7,
          },
          eventIds: ['evt-1', 'evt-2'],
          eventCount: 47,
          status: 'detected',
        },
        {
          id: 'pattern-2',
          type: 'mode_preference',
          detectedAt: new Date().toISOString(),
          confidence: 0.88,
          data: {
            modes: ['sol'],
            context: 'desk setup',
            usageRate: 0.85,
          },
          eventIds: ['evt-3', 'evt-4'],
          eventCount: 34,
          status: 'detected',
        },
      ];

      const mockInsights: Insight[] = [
        {
          id: 'insight-pattern-1',
          patternId: 'pattern-1',
          generatedAt: new Date().toISOString(),
          confidence: 0.92,
          title: 'Frequent git-commit Detected',
          description: 'You execute \'git-commit\' 47 times (6.7/day). This action could be automated or assigned a keyboard shortcut.',
          recommendation: 'Create ⌘+Shift+N shortcut or schedule automatic execution',
          suggestedActions: [],
        },
        {
          id: 'insight-pattern-2',
          patternId: 'pattern-2',
          generatedAt: new Date().toISOString(),
          confidence: 0.88,
          title: 'sol Mode Preferred',
          description: 'You use sol mode 85% of the time on desk setup. Set it as default for this context?',
          recommendation: 'Set as default mode for this context',
          suggestedActions: [],
        },
      ];

      const mockLearningActions: LearningAction[] = [
        {
          id: 'action-1',
          type: 'suggest_automation',
          insightId: 'insight-pattern-1',
          confidence: 0.92,
          target: 'automation',
          currentValue: null,
          suggestedValue: { action: 'git-commit', trigger: 'shortcut' },
          reason: 'Action performed 47 times',
          status: 'pending',
        },
        {
          id: 'action-2',
          type: 'update_preference',
          insightId: 'insight-pattern-2',
          confidence: 0.88,
          target: 'default_mode',
          currentValue: 'default',
          suggestedValue: 'sol',
          reason: 'Mode used 85% of time',
          status: 'pending',
        },
      ];

      setPatterns(mockPatterns);
      setInsights(mockInsights);
      setLearningActions(mockLearningActions);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch insights'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInsights();
  }, [fetchInsights]);

  const approveLearning = useCallback(async (actionId: string) => {
    try {
      // TODO: Call API to approve learning
      console.log('[useInsights] Approving learning:', actionId);
      
      // Update local state
      setLearningActions(prev =>
        prev.map(action =>
          action.id === actionId
            ? { ...action, status: 'applied' as const, appliedAt: new Date().toISOString() }
            : action
        )
      );
    } catch (err) {
      console.error('[useInsights] Failed to approve learning:', err);
      throw err;
    }
  }, []);

  const rejectLearning = useCallback(async (actionId: string) => {
    try {
      // TODO: Call API to reject learning
      console.log('[useInsights] Rejecting learning:', actionId);
      
      // Update local state
      setLearningActions(prev =>
        prev.map(action =>
          action.id === actionId
            ? { ...action, status: 'rejected' as const }
            : action
        )
      );
    } catch (err) {
      console.error('[useInsights] Failed to reject learning:', err);
      throw err;
    }
  }, []);

  const pendingSuggestions = learningActions.filter(
    action => action.status === 'pending' && action.confidence >= 0.7 && action.confidence < 0.9
  );

  const appliedLearnings = learningActions.filter(
    action => action.status === 'applied'
  );

  return {
    patterns,
    insights,
    learningActions,
    pendingSuggestions,
    appliedLearnings,
    loading,
    error,
    refresh: fetchInsights,
    approveLearning,
    rejectLearning,
  };
}

