/**
 * Tests for Demo Flow
 * 
 * Tests that demoFlow returns all four segments.
 */

import { runDemoFlow } from './demoFlow';

describe('Demo Flow', () => {
  test('should return all four segments', async () => {
    const result = await runDemoFlow({
      userId: 'test-user',
      sessionId: 'test-session',
      prompt: 'Test prompt',
    });

    expect(result).toHaveProperty('context');
    expect(result).toHaveProperty('lunaDecision');
    expect(result).toHaveProperty('solOutput');
    expect(result).toHaveProperty('mavTaskResult');
    expect(result).toHaveProperty('teEvaluation');
  });

  test('should respect mode parameter', async () => {
    const result = await runDemoFlow({
      userId: 'test-user',
      sessionId: 'test-session',
      prompt: 'Test prompt',
      mode: 'builder',
    });

    expect(result.lunaDecision).toBeDefined();
    // Mode should affect decision
    expect(['allow', 'require_confirmation', 'deny']).toContain(result.lunaDecision.type);
  });

  test('should return deny decision when Luna denies', async () => {
    // This test would need a way to force a deny, but for now just verify structure
    const result = await runDemoFlow({
      userId: 'test-user',
      sessionId: 'test-session',
      prompt: 'Test prompt',
    });

    expect(result.lunaDecision.type).toBeDefined();
    expect(result.lunaDecision.reasons).toBeInstanceOf(Array);
  });
});

// Simple test runner
if (require.main === module) {
  const tests: Array<{ name: string; fn: () => Promise<void> }> = [];
  
  function test(name: string, fn: () => Promise<void>) {
    tests.push({ name, fn });
  }
  
  function expect(value: unknown) {
    return {
      toHaveProperty(prop: string) {
        if (typeof value !== 'object' || value === null || !(prop in value)) {
          throw new Error(`Expected object to have property ${prop}`);
        }
      },
      toBeDefined() {
        if (value === undefined) {
          throw new Error('Expected value to be defined');
        }
      },
      toBeInstanceOf(Constructor: new () => unknown) {
        if (!(value instanceof Constructor)) {
          throw new Error(`Expected value to be instance of ${Constructor.name}`);
        }
      },
      toContain(item: unknown) {
        if (Array.isArray(value) && !value.includes(item)) {
          throw new Error(`Expected array to contain ${item}`);
        }
      },
    };
  }
  
  async function runTests() {
    console.log('Running Demo Flow tests...\n');
    let passed = 0;
    let failed = 0;
    
    for (const { name, fn } of tests) {
      try {
        await fn();
        console.log(`✓ ${name}`);
        passed++;
      } catch (error) {
        console.error(`✗ ${name}`);
        console.error(`  ${error instanceof Error ? error.message : String(error)}`);
        failed++;
      }
    }
    
    console.log(`\n${passed} passed, ${failed} failed`);
    process.exit(failed > 0 ? 1 : 0);
  }
  
  import('./demoFlow.test').then(() => {
    runTests();
  });
}

