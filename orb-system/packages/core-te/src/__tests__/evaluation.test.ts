/**
 * Tests for Te Evaluation
 */

import { describe, it, expect } from '@jest/globals';
import { OrbRole, createOrbContext } from '@orb-system/core-orb';
import { evaluateRun } from '../evaluation';

describe('Te Evaluation', () => {
  const ctx = createOrbContext(OrbRole.TE, 'test-session', { userId: 'test-user' });

  it('should score good output highly', () => {
    const result = evaluateRun(ctx, {
      input: 'What should I do?',
      output: 'You should create a task, execute it, and verify the results. This will help you accomplish your goal efficiently.',
    });

    expect(result.score).toBeGreaterThan(60);
    expect(result.tags).toContain('good');
    expect(result.tags).toContain('actionable');
  });

  it('should score vague output low', () => {
    const result = evaluateRun(ctx, {
      input: 'What should I do?',
      output: 'Maybe you could possibly do something sort of like that, perhaps.',
    });

    expect(result.score).toBeLessThan(50);
    expect(result.tags).toContain('vague');
  });

  it('should detect too short output', () => {
    const result = evaluateRun(ctx, {
      input: 'What should I do?',
      output: 'Do it.',
    });

    expect(result.score).toBeLessThan(50);
    expect(result.tags).toContain('too_short');
  });

  it('should detect too long output', () => {
    const longOutput = 'This is a very long output. '.repeat(50);
    const result = evaluateRun(ctx, {
      input: 'What should I do?',
      output: longOutput,
    });

    expect(result.score).toBeLessThan(50);
    expect(result.tags).toContain('too_long');
  });

  it('should provide recommendations', () => {
    const result = evaluateRun(ctx, {
      input: 'What should I do?',
      output: 'Maybe something.',
    });

    expect(result.recommendations.length).toBeGreaterThan(0);
    expect(result.summary.length).toBeGreaterThan(0);
  });
});

