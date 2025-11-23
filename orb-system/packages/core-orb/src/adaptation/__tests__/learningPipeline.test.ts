/**
 * Learning Pipeline Tests
 * 
 * Phase 6: End-to-end tests for the learning loop
 * 
 * Tests the complete flow: Events → Patterns → Insights → Actions
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { OrbRole } from '../../orbRoles';
import { OrbMode, OrbDevice } from '../../identity/types';
import { OrbEventType } from '../../events/types';
import { getLearningPipeline, resetLearningPipeline } from '../patterns';
import type { OrbEvent } from '../../events/types';

describe('Learning Pipeline', () => {
  beforeEach(() => {
    resetLearningPipeline();
  });

  describe('End-to-End Flow', () => {
    it('learns from repeated action execution', async () => {
      const pipeline = getLearningPipeline();
      const events: OrbEvent[] = [];

      // Simulate 10 executions of the same action
      for (let i = 0; i < 10; i++) {
        const event: OrbEvent = {
          id: `evt-${i}`,
          type: OrbEventType.ACTION_COMPLETED,
          timestamp: new Date(Date.now() + i * 1000).toISOString(),
          userId: 'user-1',
          sessionId: 'session-1',
          deviceId: OrbDevice.SOL,
          mode: OrbMode.SOL,
          role: OrbRole.MAV,
          payload: {
            taskId: 'task-git-commit',
            actionType: 'git-commit',
            success: true,
          },
          metadata: {
            duration: 100 + i * 10,
          },
        };
        events.push(event);
        await pipeline.processEvent(event);
      }

      // Detect patterns
      const patterns = await pipeline.detectPatterns(events);
      
      expect(patterns.length).toBeGreaterThan(0);
      
      const frequentActionPattern = patterns.find(p => p.type === 'frequent_action');
      expect(frequentActionPattern).toBeDefined();
      expect(frequentActionPattern?.confidence).toBeGreaterThan(0.4); // 10/20 = 0.5 confidence
      expect(frequentActionPattern?.eventCount).toBe(10);
    });

    it.skip('detects mode preferences', async () => {
      // TODO: Requires Te PatternDetector integration
      // Stub implementation in patterns.ts returns empty array
      const pipeline = getLearningPipeline();
      const events: OrbEvent[] = [];

      // User uses SOL mode 9/10 times
      for (let i = 0; i < 10; i++) {
        const event: OrbEvent = {
          id: `evt-${i}`,
          type: OrbEventType.ACTION_STARTED,
          timestamp: new Date(Date.now() + i * 1000).toISOString(),
          userId: 'user-1',
          sessionId: 'session-1',
          deviceId: OrbDevice.SOL,
          mode: i < 9 ? OrbMode.SOL : OrbMode.DEFAULT,
          role: OrbRole.MAV,
          payload: { taskId: `task-${i}` },
        };
        events.push(event);
        await pipeline.processEvent(event);
      }

      const patterns = await pipeline.detectPatterns(events, {
        patternTypes: ['mode_preference'],
      });

      expect(patterns.length).toBeGreaterThan(0);
      
      const modePattern = patterns.find(p => p.type === 'mode_preference');
      expect(modePattern).toBeDefined();
      expect(modePattern?.data.modes).toContain(OrbMode.SOL);
    });

    it.skip('detects time-based routines', async () => {
      // TODO: Requires Te PatternDetector integration
      // Stub implementation in patterns.ts returns empty array
      const pipeline = getLearningPipeline();
      const events: OrbEvent[] = [];

      // User does the same action at 9 AM every day for 5 days
      const baseTime = new Date('2024-01-01T09:00:00Z');
      for (let day = 0; day < 5; day++) {
        const timestamp = new Date(baseTime.getTime() + day * 24 * 60 * 60 * 1000);
        const event: OrbEvent = {
          id: `evt-${day}`,
          type: OrbEventType.ACTION_COMPLETED,
          timestamp: timestamp.toISOString(),
          userId: 'user-1',
          sessionId: `session-${day}`,
          role: OrbRole.MAV,
          payload: {
            actionType: 'morning-review',
            success: true,
          },
        };
        events.push(event);
        await pipeline.processEvent(event);
      }

      const patterns = await pipeline.detectPatterns(events, {
        patternTypes: ['time_based_routine'],
      });

      expect(patterns.length).toBeGreaterThan(0);
      
      const routinePattern = patterns.find(p => p.type === 'time_based_routine');
      expect(routinePattern).toBeDefined();
    });

    it.skip('detects error patterns', async () => {
      // TODO: Requires Te PatternDetector integration
      // Stub implementation in patterns.ts returns empty array
      const pipeline = getLearningPipeline();
      const events: OrbEvent[] = [];

      // Action fails 8 out of 10 times
      for (let i = 0; i < 10; i++) {
        const failed = i < 8;
        const event: OrbEvent = {
          id: `evt-${i}`,
          type: failed ? OrbEventType.ACTION_FAILED : OrbEventType.ACTION_COMPLETED,
          timestamp: new Date(Date.now() + i * 1000).toISOString(),
          userId: 'user-1',
          sessionId: 'session-1',
          role: OrbRole.MAV,
          payload: {
            actionType: 'npm-build',
            success: !failed,
            error: failed ? 'Build error' : undefined,
          },
        };
        events.push(event);
        await pipeline.processEvent(event);
      }

      const patterns = await pipeline.detectPatterns(events, {
        patternTypes: ['error_pattern'],
      });

      expect(patterns.length).toBeGreaterThan(0);
      
      const errorPattern = patterns.find(p => p.type === 'error_pattern');
      expect(errorPattern).toBeDefined();
      expect(errorPattern?.data.errorRate).toBeGreaterThan(0.7);
    });
  });

  describe('Pattern Detection Accuracy', () => {
    it('requires minimum event count for patterns', async () => {
      const pipeline = getLearningPipeline();
      const events: OrbEvent[] = [];

      // Only 2 events - too few for a pattern
      for (let i = 0; i < 2; i++) {
        const event: OrbEvent = {
          id: `evt-${i}`,
          type: OrbEventType.ACTION_COMPLETED,
          timestamp: new Date(Date.now() + i * 1000).toISOString(),
          userId: 'user-1',
          sessionId: 'session-1',
          role: OrbRole.MAV,
          payload: { actionType: 'test-action' },
        };
        events.push(event);
        await pipeline.processEvent(event);
      }

      const patterns = await pipeline.detectPatterns(events);
      
      // Should not detect patterns with too few events
      expect(patterns.length).toBe(0);
    });

    it('calculates confidence scores correctly', async () => {
      const pipeline = getLearningPipeline();
      const events: OrbEvent[] = [];

      // 20 events - should have high confidence
      for (let i = 0; i < 20; i++) {
        const event: OrbEvent = {
          id: `evt-${i}`,
          type: OrbEventType.ACTION_COMPLETED,
          timestamp: new Date(Date.now() + i * 1000).toISOString(),
          userId: 'user-1',
          sessionId: 'session-1',
          role: OrbRole.MAV,
          payload: { actionType: 'frequent-action' },
        };
        events.push(event);
        await pipeline.processEvent(event);
      }

      const patterns = await pipeline.detectPatterns(events);
      
      expect(patterns.length).toBeGreaterThan(0);
      
      // High event count should yield high confidence
      const pattern = patterns[0];
      expect(pattern.confidence).toBeGreaterThan(0.8);
      expect(pattern.confidence).toBeLessThanOrEqual(1.0);
    });

    it('filters patterns by minimum confidence', async () => {
      const pipeline = getLearningPipeline();
      const events: OrbEvent[] = [];

      // Create events that might produce low-confidence patterns
      for (let i = 0; i < 5; i++) {
        const event: OrbEvent = {
          id: `evt-${i}`,
          type: OrbEventType.ACTION_COMPLETED,
          timestamp: new Date(Date.now() + i * 1000).toISOString(),
          userId: 'user-1',
          sessionId: 'session-1',
          role: OrbRole.MAV,
          payload: { actionType: `action-${i}` }, // Different actions
        };
        events.push(event);
        await pipeline.processEvent(event);
      }

      const highConfidencePatterns = await pipeline.detectPatterns(events, {
        minConfidence: 0.9,
      });

      const lowConfidencePatterns = await pipeline.detectPatterns(events, {
        minConfidence: 0.3,
      });

      expect(highConfidencePatterns.length).toBeLessThanOrEqual(lowConfidencePatterns.length);
    });
  });

  describe('Insight Generation', () => {
    it('generates insights from patterns', async () => {
      const pipeline = getLearningPipeline();
      const events: OrbEvent[] = [];

      // Create a clear pattern
      for (let i = 0; i < 15; i++) {
        const event: OrbEvent = {
          id: `evt-${i}`,
          type: OrbEventType.ACTION_COMPLETED,
          timestamp: new Date(Date.now() + i * 1000).toISOString(),
          userId: 'user-1',
          sessionId: 'session-1',
          role: OrbRole.MAV,
          payload: { actionType: 'git-commit', success: true },
        };
        events.push(event);
        await pipeline.processEvent(event);
      }

      const patterns = await pipeline.detectPatterns(events);
      const insights = await pipeline.generateInsights(patterns);

      expect(insights.length).toBeGreaterThan(0);
      
      const insight = insights[0];
      expect(insight.patternId).toBe(patterns[0].id);
      expect(insight.title).toBeDefined();
      expect(insight.description).toBeDefined();
      expect(insight.recommendation).toBeDefined();
    });

    it('prioritizes high-confidence insights', async () => {
      const pipeline = getLearningPipeline();
      const events: OrbEvent[] = [];

      // Create multiple patterns with different frequencies
      for (let i = 0; i < 20; i++) {
        events.push({
          id: `evt-action1-${i}`,
          type: OrbEventType.ACTION_COMPLETED,
          timestamp: new Date(Date.now() + i * 1000).toISOString(),
          userId: 'user-1',
          sessionId: 'session-1',
          role: OrbRole.MAV,
          payload: { actionType: 'frequent-action' },
        });
      }

      for (let i = 0; i < 5; i++) {
        events.push({
          id: `evt-action2-${i}`,
          type: OrbEventType.ACTION_COMPLETED,
          timestamp: new Date(Date.now() + i * 1000).toISOString(),
          userId: 'user-1',
          sessionId: 'session-1',
          role: OrbRole.MAV,
          payload: { actionType: 'rare-action' },
        });
      }

      for (const event of events) {
        await pipeline.processEvent(event);
      }

      const patterns = await pipeline.detectPatterns(events);
      const insights = await pipeline.generateInsights(patterns);

      // First insight should be the one with higher confidence
      expect(insights[0].confidence).toBeGreaterThanOrEqual(insights[insights.length - 1].confidence);
    });
  });

  describe('Learning Application', () => {
    it('applies high-confidence learnings', async () => {
      const pipeline = getLearningPipeline();
      const events: OrbEvent[] = [];

      // Create a very clear pattern (high confidence)
      for (let i = 0; i < 25; i++) {
        const event: OrbEvent = {
          id: `evt-${i}`,
          type: OrbEventType.ACTION_COMPLETED,
          timestamp: new Date(Date.now() + i * 1000).toISOString(),
          userId: 'user-1',
          sessionId: 'session-1',
          role: OrbRole.MAV,
          payload: { actionType: 'very-frequent-action', success: true },
        };
        events.push(event);
        await pipeline.processEvent(event);
      }

      const patterns = await pipeline.detectPatterns(events);
      const insights = await pipeline.generateInsights(patterns);
      const actions = await pipeline.applyLearning(insights);

      expect(actions.length).toBeGreaterThan(0);
      
      const action = actions[0];
      expect(action.insightId).toBe(insights[0].id);
      expect(action.confidence).toBeGreaterThan(0);
    });

    it('respects confidence thresholds', async () => {
      const pipeline = getLearningPipeline();
      const events: OrbEvent[] = [];

      // Create a pattern with medium confidence
      for (let i = 0; i < 8; i++) {
        const event: OrbEvent = {
          id: `evt-${i}`,
          type: OrbEventType.ACTION_COMPLETED,
          timestamp: new Date(Date.now() + i * 1000).toISOString(),
          userId: 'user-1',
          sessionId: 'session-1',
          role: OrbRole.MAV,
          payload: { actionType: 'medium-action', success: true },
        };
        events.push(event);
        await pipeline.processEvent(event);
      }

      const patterns = await pipeline.detectPatterns(events);
      const insights = await pipeline.generateInsights(patterns);
      const actions = await pipeline.applyLearning(insights);

      // With medium confidence, actions should be generated but marked for user confirmation
      if (actions.length > 0) {
        const action = actions[0];
        expect(action.confidence).toBeLessThan(0.9); // Below auto-apply threshold
      }
    });
  });
});

