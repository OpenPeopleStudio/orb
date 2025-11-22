/**
 * Tests for Te Evaluation
 * 
 * Tests scoring for "good vs garbage" text.
 */

import { evaluateRun } from './evaluation';
import { createOrbContext, OrbRole } from '@orb-system/core-orb';

describe('Te Evaluation', () => {
  const ctx = createOrbContext(OrbRole.TE, 'test-session', { userId: 'test-user' });

  test('should score good output highly', () => {
    const result = evaluateRun(ctx, {
      input: 'What should I do?',
      output: 'You should take action on this task. First, create a plan. Then execute it step by step. Finally, review the results.',
    });

    expect(result.score).toBeGreaterThan(60);
    expect(result.tags).toContain('good');
  });

  test('should score short output low', () => {
    const result = evaluateRun(ctx, {
      input: 'What should I do?',
      output: 'Do it.',
    });

    expect(result.score).toBeLessThan(50);
    expect(result.tags).toContain('too_short');
  });

  test('should identify vague output', () => {
    const result = evaluateRun(ctx, {
      input: 'What should I do?',
      output: 'Maybe you could perhaps sort of try something, I guess.',
    });

    expect(result.tags).toContain('vague');
    expect(result.recommendations.length).toBeGreaterThan(0);
  });

  test('should identify actionable output', () => {
    const result = evaluateRun(ctx, {
      input: 'What should I do?',
      output: 'Create a new file, then run the build command, and finally deploy.',
    });

    expect(result.tags).toContain('actionable');
    expect(result.score).toBeGreaterThan(50);
  });
});

// Simple test runner
if (require.main === module) {
  const tests: Array<{ name: string; fn: () => void }> = [];
  
  function test(name: string, fn: () => void) {
    tests.push({ name, fn });
  }
  
  function expect(value: unknown) {
    return {
      toBeGreaterThan(expected: number) {
        if (typeof value !== 'number' || value <= expected) {
          throw new Error(`Expected ${value} to be greater than ${expected}`);
        }
      },
      toBeLessThan(expected: number) {
        if (typeof value !== 'number' || value >= expected) {
          throw new Error(`Expected ${value} to be less than ${expected}`);
        }
      },
      toContain(item: unknown) {
        if (Array.isArray(value) && !value.includes(item)) {
          throw new Error(`Expected array to contain ${item}`);
        }
      },
      length: {
        toBeGreaterThan(n: number) {
          if (typeof value === 'object' && 'length' in value) {
            if ((value as { length: number }).length <= n) {
              throw new Error(`Expected length to be greater than ${n}`);
            }
          }
        },
      },
    };
  }
  
  function runTests() {
    console.log('Running Te Evaluation tests...\n');
    let passed = 0;
    let failed = 0;
    
    for (const { name, fn } of tests) {
      try {
        fn();
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
  
  import('./evaluation.test').then(() => {
    runTests();
  });
}

