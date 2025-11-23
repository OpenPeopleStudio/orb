import { describe, it, expect, beforeEach } from '@jest/globals';

import {
  evaluateAction,
  validateModeTransition,
  seedConstraintStore,
  registerConstraintSet,
  getDefaultConstraintSets,
} from '../constraints';
import { OrbRole } from '../orbRoles';
import { OrbMode, OrbPersona, OrbDevice } from '../identity/types';
import type { ConstraintSet } from '../constraints/types';

describe('constraint evaluation', () => {
  beforeEach(() => {
    seedConstraintStore([]);
  });

  it('allows actions when no constraints are registered', async () => {
    const result = await evaluateAction({
      userId: 'user-1',
      mode: OrbMode.DEFAULT,
      role: OrbRole.MAV,
      action: {
        id: 'a1',
        kind: 'file_write',
        risk: 'low',
      },
    });

    expect(result.allowed).toBe(true);
    expect(result.outcome).toBe('allow');
    expect(result.violations).toHaveLength(0);
  });

  it('blocks high-risk action when constraint fails', async () => {
    const customSet: ConstraintSet = {
      id: 'test.set',
      label: 'Test',
      scope: 'system',
      constraints: [
        {
          id: 'block-high-risk',
          label: 'Block high risk',
          severity: 'block',
          appliesTo: { actions: ['file_write'] },
          evaluate: (context) => {
            if (context.action?.risk === 'high') {
              return { status: 'fail', reason: 'High risk not allowed.' };
            }
            return { status: 'pass' };
          },
        },
      ],
    };

    await registerConstraintSet(customSet);

    const result = await evaluateAction({
      userId: 'user-2',
      mode: OrbMode.DEFAULT,
      role: OrbRole.MAV,
      action: {
        id: 'a2',
        kind: 'file_write',
        risk: 'high',
      },
    });

    expect(result.allowed).toBe(false);
    expect(result.outcome).toBe('block');
    expect(result.violations.map((v) => v.constraintId)).toContain('block-high-risk');
  });
});

describe('mode transition validation', () => {
  beforeEach(() => {
    seedConstraintStore(getDefaultConstraintSets());
  });

  it('denies restaurant mode without SWL persona', async () => {
    const result = await validateModeTransition({
      userId: 'user-restaurant',
      sessionId: 'session-1',
      role: OrbRole.LUNA,
      fromMode: OrbMode.DEFAULT,
      toMode: OrbMode.RESTAURANT,
      persona: OrbPersona.PERSONAL,
      device: OrbDevice.SOL,
    });

    expect(result.allowed).toBe(false);
    expect(result.outcome).toBe('block');
    expect(result.reasons[0]).toContain('SWL');
  });

  it('allows restaurant mode with SWL persona on Mars', async () => {
    const result = await validateModeTransition({
      userId: 'user-restaurant',
      sessionId: 'session-2',
      role: OrbRole.LUNA,
      fromMode: OrbMode.DEFAULT,
      toMode: OrbMode.RESTAURANT,
      persona: OrbPersona.SWL,
      device: OrbDevice.MARS,
    });

    expect(result.allowed).toBe(true);
    expect(result.outcome === 'allow' || result.outcome === 'warn').toBe(true);
  });
});


