/**
 * Mode Transitions Tests
 * 
 * Tests for mode transition validation logic.
 */

import { describe, it, expect } from 'vitest';
import {
  validateModeTransition,
  canTransitionMode,
  getRecommendedMode,
} from '../modeTransitions';
import { createConstraintSet, restrictModeTransition } from '../builder';
import type { ModeTransitionRequest, ActionContext } from '../types';
import { OrbMode, OrbPersona, OrbDevice } from '../../identity/types';

describe('Mode Transitions', () => {
  const baseContext: ActionContext = {
    userId: 'user-123',
    sessionId: 'session-456',
    mode: OrbMode.SOL,
    persona: OrbPersona.PERSONAL,
    device: OrbDevice.SOL,
  };

  describe('Basic Transitions', () => {
    it('should allow transition when no constraints exist', () => {
      const request: ModeTransitionRequest = {
        fromMode: OrbMode.SOL,
        toMode: OrbMode.MARS,
        context: baseContext,
      };
      
      const result = validateModeTransition(request, []);
      
      expect(result.allowed).toBe(true);
      expect(result.fromMode).toBe(OrbMode.SOL);
      expect(result.toMode).toBe(OrbMode.MARS);
    });

    it('should allow transition to same mode', () => {
      const request: ModeTransitionRequest = {
        fromMode: OrbMode.SOL,
        toMode: OrbMode.SOL,
        context: baseContext,
      };
      
      const result = validateModeTransition(request, []);
      
      expect(result.allowed).toBe(true);
      expect(result.reasons).toContain('No transition needed (same mode)');
    });

    it('should allow forced transition', () => {
      const constraint = restrictModeTransition([OrbMode.SOL], {
        appliesToModes: [OrbMode.SOL],
      });
      const constraintSet = createConstraintSet('test-set', [constraint]);
      
      const request: ModeTransitionRequest = {
        fromMode: OrbMode.SOL,
        toMode: OrbMode.MARS,
        context: baseContext,
        forced: true,
      };
      
      const result = validateModeTransition(request, [constraintSet]);
      
      expect(result.allowed).toBe(true);
      expect(result.reasons).toContain('Transition forced by user override');
    });
  });

  describe('Device Compatibility', () => {
    it('should warn when mode is not typical for device', () => {
      const request: ModeTransitionRequest = {
        fromMode: OrbMode.SOL,
        toMode: OrbMode.MARS, // Mars mode not typical for Sol device
        context: { ...baseContext, device: OrbDevice.SOL },
      };
      
      const result = validateModeTransition(request, []);
      
      // Should still allow, but include a warning
      expect(result.allowed).toBe(true);
      expect(result.reasons.some(r => r.includes('not typically used on device'))).toBe(true);
    });

    it('should allow mode typical for device', () => {
      const request: ModeTransitionRequest = {
        fromMode: OrbMode.DEFAULT,
        toMode: OrbMode.SOL, // Sol mode typical for Sol device
        context: { ...baseContext, device: OrbDevice.SOL },
      };
      
      const result = validateModeTransition(request, []);
      
      expect(result.allowed).toBe(true);
    });
  });

  describe('Persona Compatibility', () => {
    it('should warn when mode is not typical for persona', () => {
      const request: ModeTransitionRequest = {
        fromMode: OrbMode.SOL,
        toMode: OrbMode.RESTAURANT, // Restaurant mode not typical for PERSONAL persona
        context: { ...baseContext, persona: OrbPersona.PERSONAL },
      };
      
      const result = validateModeTransition(request, []);
      
      // Should still allow, but include a warning
      expect(result.allowed).toBe(true);
      expect(result.reasons.some(r => r.includes('not typically used with persona'))).toBe(true);
    });

    it('should allow mode typical for persona', () => {
      const request: ModeTransitionRequest = {
        fromMode: OrbMode.DEFAULT,
        toMode: OrbMode.SOL, // Sol mode typical for PERSONAL persona
        context: { ...baseContext, persona: OrbPersona.PERSONAL },
      };
      
      const result = validateModeTransition(request, []);
      
      expect(result.allowed).toBe(true);
    });
  });

  describe('Mode Transition Constraints', () => {
    it('should block transition when constrained', () => {
      const constraint = restrictModeTransition([OrbMode.SOL, OrbMode.EARTH], {
        appliesToModes: [OrbMode.SOL],
        description: 'Only allow SOL → SOL or SOL → EARTH',
      });
      const constraintSet = createConstraintSet('test-set', [constraint]);
      
      const request: ModeTransitionRequest = {
        fromMode: OrbMode.SOL,
        toMode: OrbMode.MARS, // Not in allowed list
        context: baseContext,
      };
      
      const result = validateModeTransition(request, [constraintSet]);
      
      expect(result.allowed).toBe(false);
      expect(result.triggeredConstraints).toHaveLength(1);
      expect(result.triggeredConstraints[0].constraintType).toBe('mode_transition');
    });

    it('should allow transition when within allowed modes', () => {
      const constraint = restrictModeTransition([OrbMode.SOL, OrbMode.EARTH], {
        appliesToModes: [OrbMode.SOL],
      });
      const constraintSet = createConstraintSet('test-set', [constraint]);
      
      const request: ModeTransitionRequest = {
        fromMode: OrbMode.SOL,
        toMode: OrbMode.EARTH, // In allowed list
        context: baseContext,
      };
      
      const result = validateModeTransition(request, [constraintSet]);
      
      expect(result.allowed).toBe(true);
    });

    it('should not apply constraint to other modes', () => {
      const constraint = restrictModeTransition([OrbMode.MARS], {
        appliesToModes: [OrbMode.SOL], // Only applies to SOL mode
      });
      const constraintSet = createConstraintSet('test-set', [constraint]);
      
      const request: ModeTransitionRequest = {
        fromMode: OrbMode.EARTH, // Starting from EARTH, not SOL
        toMode: OrbMode.FORGE,
        context: { ...baseContext, mode: OrbMode.EARTH },
      };
      
      const result = validateModeTransition(request, [constraintSet]);
      
      expect(result.allowed).toBe(true);
    });
  });

  describe('Multiple Constraints', () => {
    it('should respect multiple transition constraints', () => {
      const constraints = [
        restrictModeTransition([OrbMode.SOL, OrbMode.EARTH], {
          appliesToModes: [OrbMode.SOL],
        }),
        restrictModeTransition([OrbMode.MARS, OrbMode.DEFAULT], {
          appliesToModes: [OrbMode.MARS],
        }),
      ];
      const constraintSet = createConstraintSet('test-set', constraints);
      
      // Should block SOL → MARS
      const solToMars: ModeTransitionRequest = {
        fromMode: OrbMode.SOL,
        toMode: OrbMode.MARS,
        context: baseContext,
      };
      expect(validateModeTransition(solToMars, [constraintSet]).allowed).toBe(false);
      
      // Should allow SOL → EARTH
      const solToEarth: ModeTransitionRequest = {
        fromMode: OrbMode.SOL,
        toMode: OrbMode.EARTH,
        context: baseContext,
      };
      expect(validateModeTransition(solToEarth, [constraintSet]).allowed).toBe(true);
    });
  });

  describe('canTransitionMode Helper', () => {
    it('should return boolean for simple checks', () => {
      expect(canTransitionMode(OrbMode.SOL, OrbMode.MARS, baseContext, [])).toBe(true);
      expect(canTransitionMode(OrbMode.SOL, OrbMode.SOL, baseContext, [])).toBe(true);
    });

    it('should respect constraints', () => {
      const constraint = restrictModeTransition([OrbMode.SOL], {
        appliesToModes: [OrbMode.SOL],
      });
      const constraintSet = createConstraintSet('test-set', [constraint]);
      
      expect(canTransitionMode(OrbMode.SOL, OrbMode.MARS, baseContext, [constraintSet])).toBe(false);
      expect(canTransitionMode(OrbMode.SOL, OrbMode.SOL, baseContext, [constraintSet])).toBe(true);
    });
  });

  describe('getRecommendedMode', () => {
    it('should recommend mode based on device', () => {
      const solContext = { ...baseContext, device: OrbDevice.SOL };
      expect(getRecommendedMode(solContext)).toBe(OrbMode.SOL);
      
      const marsContext = { ...baseContext, device: OrbDevice.MARS };
      expect(getRecommendedMode(marsContext)).toBe(OrbMode.MARS);
      
      const lunaContext = { ...baseContext, device: OrbDevice.LUNA };
      expect(getRecommendedMode(lunaContext)).toBe(OrbMode.FORGE);
    });

    it('should recommend mode based on persona when device unknown', () => {
      const swlContext = { ...baseContext, device: undefined, persona: OrbPersona.SWL };
      expect(getRecommendedMode(swlContext)).toBe(OrbMode.MARS);
      
      const openPeopleContext = { ...baseContext, device: undefined, persona: OrbPersona.OPEN_PEOPLE };
      expect(getRecommendedMode(openPeopleContext)).toBe(OrbMode.EXPLORER);
    });

    it('should fall back to default mode', () => {
      const unknownContext = {
        ...baseContext,
        device: 'unknown' as OrbDevice,
        persona: 'unknown' as OrbPersona,
      };
      expect(getRecommendedMode(unknownContext)).toBe(OrbMode.DEFAULT);
    });
  });

  describe('Recommendations', () => {
    it('should include recommendations when transition blocked', () => {
      const constraint = restrictModeTransition([OrbMode.SOL], {
        appliesToModes: [OrbMode.SOL],
      });
      const constraintSet = createConstraintSet('test-set', [constraint]);
      
      const request: ModeTransitionRequest = {
        fromMode: OrbMode.SOL,
        toMode: OrbMode.MARS,
        context: baseContext,
      };
      
      const result = validateModeTransition(request, [constraintSet]);
      
      expect(result.recommendations).toBeDefined();
      expect(result.recommendations!.length).toBeGreaterThan(0);
    });
  });
});

