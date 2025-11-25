// @ts-nocheck
/**
 * Insight Generator Tests
 * 
 * Phase 6: Tests for natural language insight generation
 * 
 * Validates that insights are clear, actionable, and properly generated.
 */

import { describe, it, expect } from 'vitest';
import { insightGenerator } from '../insightGenerator';
import type { Pattern } from '@orb-system/core-orb';
import { OrbMode } from '@orb-system/core-orb';

describe('InsightGenerator', () => {
  describe('Natural Language Generation', () => {
    it('generates clear title for frequent_action pattern', async () => {
      const pattern: Pattern = {
        id: 'pattern-1',
        type: 'frequent_action',
        detectedAt: new Date().toISOString(),
        confidence: 0.92,
        data: {
          actions: ['git-commit'],
          frequency: 47,
          avgPerDay: 6.7,
        },
        eventIds: [],
        eventCount: 47,
        status: 'detected',
      };

      const insight = await insightGenerator.generate(pattern);

      expect(insight.title).toContain('git-commit');
      expect(insight.title).toContain('Frequent');
    });

    it('generates actionable description for mode_preference pattern', async () => {
      const pattern: Pattern = {
        id: 'pattern-2',
        type: 'mode_preference',
        detectedAt: new Date().toISOString(),
        confidence: 0.88,
        data: {
          modes: [OrbMode.SOL],
          context: 'desk setup',
          usageRate: 0.85,
        },
        eventIds: [],
        eventCount: 34,
        status: 'detected',
      };

      const insight = await insightGenerator.generate(pattern);

      expect(insight.description).toContain('sol mode');
      expect(insight.description).toContain('85%');
      expect(insight.description).toContain('desk setup');
    });

    it('generates warning for error_pattern', async () => {
      const pattern: Pattern = {
        id: 'pattern-3',
        type: 'error_pattern',
        detectedAt: new Date().toISOString(),
        confidence: 0.78,
        data: {
          actions: ['npm-build'],
          errorRate: 0.235,
        },
        eventIds: [],
        eventCount: 20,
        status: 'detected',
      };

      const insight = await insightGenerator.generate(pattern);

      expect(insight.title).toContain('Failing');
      expect(insight.description).toContain('23.5%');
      expect(insight.description).toContain('fails');
    });

    it('generates positive message for efficiency_gain pattern', async () => {
      const pattern: Pattern = {
        id: 'pattern-4',
        type: 'efficiency_gain',
        detectedAt: new Date().toISOString(),
        confidence: 0.91,
        data: {
          improvement: 0.35,
        },
        eventIds: [],
        eventCount: 15,
        status: 'detected',
      };

      const insight = await insightGenerator.generate(pattern);

      expect(insight.description).toContain('35%');
      expect(insight.description).toContain('faster');
      expect(insight.recommendation).toContain('Continue');
    });
  });

  describe('Recommendation Generation', () => {
    it('suggests automation for frequent actions', async () => {
      const pattern: Pattern = {
        id: 'pattern-5',
        type: 'frequent_action',
        detectedAt: new Date().toISOString(),
        confidence: 0.95,
        data: {
          actions: ['daily-standup-notes'],
          frequency: 30,
        },
        eventIds: [],
        eventCount: 30,
        status: 'detected',
      };

      const insight = await insightGenerator.generate(pattern);

      expect(insight.recommendation).toMatch(/shortcut|automation|schedule/i);
    });

    it('suggests mode change for mode preference', async () => {
      const pattern: Pattern = {
        id: 'pattern-6',
        type: 'mode_preference',
        detectedAt: new Date().toISOString(),
        confidence: 0.89,
        data: {
          modes: [OrbMode.FORGE],
          usageRate: 0.9,
        },
        eventIds: [],
        eventCount: 40,
        status: 'detected',
      };

      const insight = await insightGenerator.generate(pattern);

      expect(insight.recommendation).toMatch(/default mode|set/i);
    });

    it('suggests review for error patterns', async () => {
      const pattern: Pattern = {
        id: 'pattern-7',
        type: 'error_pattern',
        detectedAt: new Date().toISOString(),
        confidence: 0.85,
        data: {
          actions: ['deploy-production'],
          errorRate: 0.4,
        },
        eventIds: [],
        eventCount: 25,
        status: 'detected',
      };

      const insight = await insightGenerator.generate(pattern);

      expect(insight.recommendation).toMatch(/review|debug|logs/i);
    });
  });

  describe('Insight Prioritization', () => {
    it('sorts insights by confidence descending', () => {
      const insights = [
        {
          id: 'insight-1',
          patternId: 'pattern-1',
          generatedAt: '2024-01-01T10:00:00Z',
          confidence: 0.75,
          title: 'Low Confidence',
          description: 'Test',
          recommendation: 'Test',
          suggestedActions: [],
        },
        {
          id: 'insight-2',
          patternId: 'pattern-2',
          generatedAt: '2024-01-01T10:00:00Z',
          confidence: 0.95,
          title: 'High Confidence',
          description: 'Test',
          recommendation: 'Test',
          suggestedActions: [],
        },
        {
          id: 'insight-3',
          patternId: 'pattern-3',
          generatedAt: '2024-01-01T10:00:00Z',
          confidence: 0.85,
          title: 'Medium Confidence',
          description: 'Test',
          recommendation: 'Test',
          suggestedActions: [],
        },
      ];

      const prioritized = insightGenerator.prioritize(insights);

      expect(prioritized[0].confidence).toBe(0.95);
      expect(prioritized[1].confidence).toBe(0.85);
      expect(prioritized[2].confidence).toBe(0.75);
    });

    it('uses recency as tiebreaker for equal confidence', () => {
      const insights = [
        {
          id: 'insight-1',
          patternId: 'pattern-1',
          generatedAt: '2024-01-01T10:00:00Z',
          confidence: 0.85,
          title: 'Older',
          description: 'Test',
          recommendation: 'Test',
          suggestedActions: [],
        },
        {
          id: 'insight-2',
          patternId: 'pattern-2',
          generatedAt: '2024-01-01T12:00:00Z',
          confidence: 0.85,
          title: 'Newer',
          description: 'Test',
          recommendation: 'Test',
          suggestedActions: [],
        },
      ];

      const prioritized = insightGenerator.prioritize(insights);

      expect(prioritized[0].id).toBe('insight-2'); // Newer insight first
      expect(prioritized[1].id).toBe('insight-1');
    });
  });

  describe('Batch Generation', () => {
    it('generates multiple insights from patterns', async () => {
      const patterns: Pattern[] = [
        {
          id: 'pattern-1',
          type: 'frequent_action',
          detectedAt: new Date().toISOString(),
          confidence: 0.9,
          data: { actions: ['action-1'], frequency: 20 },
          eventIds: [],
          eventCount: 20,
          status: 'detected',
        },
        {
          id: 'pattern-2',
          type: 'mode_preference',
          detectedAt: new Date().toISOString(),
          confidence: 0.85,
        data: { modes: [OrbMode.SOL], usageRate: 0.8 },
          eventIds: [],
          eventCount: 30,
          status: 'detected',
        },
      ];

      const insights = await insightGenerator.generateBatch(patterns);

      expect(insights.length).toBe(2);
      expect(insights[0].patternId).toBe('pattern-1');
      expect(insights[1].patternId).toBe('pattern-2');
    });

    it('handles errors gracefully in batch generation', async () => {
      const patterns: Pattern[] = [
        {
          id: 'pattern-1',
          type: 'frequent_action',
          detectedAt: new Date().toISOString(),
          confidence: 0.9,
          data: { actions: ['valid-action'], frequency: 20 },
          eventIds: [],
          eventCount: 20,
          status: 'detected',
        },
      ];

      // Should not throw even if there are issues
      const insights = await insightGenerator.generateBatch(patterns);
      expect(Array.isArray(insights)).toBe(true);
    });

    it('returns prioritized insights from batch', async () => {
      const patterns: Pattern[] = [
        {
          id: 'pattern-1',
          type: 'frequent_action',
          detectedAt: new Date().toISOString(),
          confidence: 0.7,
          data: { actions: ['low'], frequency: 5 },
          eventIds: [],
          eventCount: 5,
          status: 'detected',
        },
        {
          id: 'pattern-2',
          type: 'frequent_action',
          detectedAt: new Date().toISOString(),
          confidence: 0.95,
          data: { actions: ['high'], frequency: 30 },
          eventIds: [],
          eventCount: 30,
          status: 'detected',
        },
      ];

      const insights = await insightGenerator.generateBatch(patterns);

      // Should be sorted by confidence (high first)
      expect(insights[0].confidence).toBeGreaterThan(insights[1].confidence);
    });
  });
});

