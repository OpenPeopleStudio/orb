/**
 * Tests for Demo Flow
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
import { setConfig, resetConfig } from '../config';
import { runDemoFlow } from '../demoFlow';

describe('Demo Flow', () => {
  beforeEach(() => {
    resetConfig();
    setConfig({ isPersistent: false });
  });

  it('should return all four segments', async () => {
    const result = await runDemoFlow({
      userId: 'test-user',
      sessionId: 'test-session',
      prompt: 'Test prompt',
      mode: 'default',
    });

    expect(result).toHaveProperty('context');
    expect(result).toHaveProperty('mode');
    expect(result).toHaveProperty('lunaDecision');
    expect(result.mode).toBe('default');
  });

  it('should respect mode parameter', async () => {
    const result = await runDemoFlow({
      userId: 'test-user',
      sessionId: 'test-session',
      prompt: 'Test prompt',
      mode: 'restaurant',
    });

    expect(result.mode).toBe('restaurant');
  });

  it('should return Luna decision even if denied', async () => {
    const result = await runDemoFlow({
      userId: 'test-user',
      sessionId: 'test-session',
      prompt: 'Test prompt',
      mode: 'restaurant',
    });

    expect(result.lunaDecision).toBeDefined();
    expect(result.lunaDecision.type).toBeDefined();
  });

  it('should include sol output when allowed', async () => {
    const result = await runDemoFlow({
      userId: 'test-user',
      sessionId: 'test-session',
      prompt: 'Test prompt',
      mode: 'default',
    });

    if (result.lunaDecision.type !== 'deny') {
      expect(result.solOutput).toBeDefined();
      expect(result.mavTaskResult).toBeDefined();
      expect(result.teEvaluation).toBeDefined();
    }
  });
});

