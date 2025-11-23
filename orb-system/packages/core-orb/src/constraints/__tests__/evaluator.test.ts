/**
 * Constraint Evaluator Tests
 * 
 * Tests for action evaluation logic.
 */

import { describe, it, expect } from 'vitest';
import { evaluateAction } from '../evaluator';
import { createConstraintSet, blockTool, maxRisk, requireConfirmation } from '../builder';
import type { ActionContext, ActionDescriptor } from '../types';
import { OrbMode, OrbPersona, OrbDevice } from '../../identity/types';
import { OrbRole } from '../../orbRoles';

describe('Constraint Evaluator', () => {
  const baseContext: ActionContext = {
    userId: 'user-123',
    sessionId: 'session-456',
    mode: OrbMode.SOL,
    persona: OrbPersona.PERSONAL,
    device: OrbDevice.SOL,
  };

  const baseAction: ActionDescriptor = {
    id: 'test-action',
    type: 'tool_call',
    role: OrbRole.MAV,
    toolId: 'test-tool',
    estimatedRisk: 'low',
    description: 'Test action',
  };

  describe('Basic Evaluation', () => {
    it('should allow action when no constraints exist', () => {
      const result = evaluateAction(baseAction, baseContext, []);
      
      expect(result.allowed).toBe(true);
      expect(result.decision).toBe('allow');
      expect(result.reasons).toContain('No constraints violated');
      expect(result.triggeredConstraints).toHaveLength(0);
    });

    it('should allow action when constraints do not apply', () => {
      const constraint = blockTool('other-tool', {
        appliesToModes: [OrbMode.MARS],
      });
      const constraintSet = createConstraintSet('test-set', [constraint]);
      
      const result = evaluateAction(baseAction, baseContext, [constraintSet]);
      
      expect(result.allowed).toBe(true);
      expect(result.decision).toBe('allow');
    });
  });

  describe('Block Tool Constraints', () => {
    it('should block action when tool is blocked', () => {
      const constraint = blockTool('test-tool', {
        description: 'Test tool is blocked',
      });
      const constraintSet = createConstraintSet('test-set', [constraint]);
      
      const result = evaluateAction(baseAction, baseContext, [constraintSet]);
      
      expect(result.allowed).toBe(false);
      expect(result.decision).toBe('deny');
      expect(result.triggeredConstraints).toHaveLength(1);
      expect(result.triggeredConstraints[0].constraintType).toBe('block_tool');
    });

    it('should only block in specific mode', () => {
      const constraint = blockTool('test-tool', {
        appliesToModes: [OrbMode.MARS],
      });
      const constraintSet = createConstraintSet('test-set', [constraint]);
      
      // Should not block in SOL mode
      const solResult = evaluateAction(baseAction, baseContext, [constraintSet]);
      expect(solResult.allowed).toBe(true);
      
      // Should block in MARS mode
      const marsContext = { ...baseContext, mode: OrbMode.MARS };
      const marsResult = evaluateAction(baseAction, marsContext, [constraintSet]);
      expect(marsResult.allowed).toBe(false);
    });
  });

  describe('Max Risk Constraints', () => {
    it('should block high-risk action when max risk is low', () => {
      const constraint = maxRisk('low');
      const constraintSet = createConstraintSet('test-set', [constraint]);
      
      const highRiskAction: ActionDescriptor = {
        ...baseAction,
        estimatedRisk: 'high',
      };
      
      const result = evaluateAction(highRiskAction, baseContext, [constraintSet]);
      
      expect(result.allowed).toBe(false);
      expect(result.decision).toBe('require_confirmation');
      expect(result.triggeredConstraints[0].constraintType).toBe('max_risk');
    });

    it('should allow low-risk action when max risk is high', () => {
      const constraint = maxRisk('high');
      const constraintSet = createConstraintSet('test-set', [constraint]);
      
      const result = evaluateAction(baseAction, baseContext, [constraintSet]);
      
      expect(result.allowed).toBe(true);
    });

    it('should allow critical-risk action when max risk is critical', () => {
      const constraint = maxRisk('critical');
      const constraintSet = createConstraintSet('test-set', [constraint]);
      
      const criticalAction: ActionDescriptor = {
        ...baseAction,
        estimatedRisk: 'critical',
      };
      
      const result = evaluateAction(criticalAction, baseContext, [constraintSet]);
      
      expect(result.allowed).toBe(true);
    });
  });

  describe('Require Confirmation Constraints', () => {
    it('should require confirmation for any action', () => {
      const constraint = requireConfirmation('All actions need confirmation');
      const constraintSet = createConstraintSet('test-set', [constraint]);
      
      const result = evaluateAction(baseAction, baseContext, [constraintSet]);
      
      expect(result.allowed).toBe(false);
      expect(result.decision).toBe('require_confirmation');
      expect(result.triggeredConstraints[0].constraintType).toBe('require_confirmation');
    });
  });

  describe('Multiple Constraints', () => {
    it('should trigger multiple applicable constraints', () => {
      const constraints = [
        blockTool('test-tool'),
        requireConfirmation('Confirmation needed'),
      ];
      const constraintSet = createConstraintSet('test-set', constraints);
      
      const result = evaluateAction(baseAction, baseContext, [constraintSet]);
      
      expect(result.triggeredConstraints.length).toBeGreaterThanOrEqual(2);
    });

    it('should prioritize critical severity', () => {
      const constraints = [
        requireConfirmation('Minor warning'), // warning severity
        blockTool('test-tool'), // error/critical severity
      ];
      const constraintSet = createConstraintSet('test-set', constraints);
      
      const result = evaluateAction(baseAction, baseContext, [constraintSet]);
      
      expect(result.decision).toBe('deny'); // Critical/error takes precedence
    });
  });

  describe('Constraint Set Priority', () => {
    it('should evaluate higher priority sets first', () => {
      const lowPrioritySet = createConstraintSet(
        'low-priority',
        [requireConfirmation('Low priority')],
        { priority: 10 }
      );
      
      const highPrioritySet = createConstraintSet(
        'high-priority',
        [blockTool('test-tool')],
        { priority: 100 }
      );
      
      const result = evaluateAction(
        baseAction,
        baseContext,
        [lowPrioritySet, highPrioritySet]
      );
      
      // Should be blocked by high-priority constraint
      expect(result.decision).toBe('deny');
    });
  });

  describe('Scoped Constraints', () => {
    it('should respect persona scope', () => {
      const constraint = blockTool('test-tool', {
        appliesToPersonas: [OrbPersona.SWL],
      });
      const constraintSet = createConstraintSet('test-set', [constraint]);
      
      // Should not apply to PERSONAL persona
      const personalResult = evaluateAction(baseAction, baseContext, [constraintSet]);
      expect(personalResult.allowed).toBe(true);
      
      // Should apply to SWL persona
      const swlContext = { ...baseContext, persona: OrbPersona.SWL };
      const swlResult = evaluateAction(baseAction, swlContext, [constraintSet]);
      expect(swlResult.allowed).toBe(false);
    });

    it('should respect device scope', () => {
      const constraint = blockTool('test-tool');
      constraint.appliesToDevices = [OrbDevice.MARS];
      const constraintSet = createConstraintSet('test-set', [constraint]);
      
      // Should not apply to SOL device
      const solResult = evaluateAction(baseAction, baseContext, [constraintSet]);
      expect(solResult.allowed).toBe(true);
      
      // Should apply to MARS device
      const marsContext = { ...baseContext, device: OrbDevice.MARS };
      const marsResult = evaluateAction(baseAction, marsContext, [constraintSet]);
      expect(marsResult.allowed).toBe(false);
    });

    it('should respect role scope', () => {
      const constraint = blockTool('test-tool');
      constraint.appliesToRoles = [OrbRole.TE];
      const constraintSet = createConstraintSet('test-set', [constraint]);
      
      // Should not apply to MAV role
      const mavAction = { ...baseAction, role: OrbRole.MAV };
      const mavResult = evaluateAction(mavAction, baseContext, [constraintSet]);
      expect(mavResult.allowed).toBe(true);
      
      // Should apply to TE role
      const teAction = { ...baseAction, role: OrbRole.TE };
      const teResult = evaluateAction(teAction, baseContext, [constraintSet]);
      expect(teResult.allowed).toBe(false);
    });
  });

  describe('Recommendations', () => {
    it('should include recommendations when constraints are triggered', () => {
      const constraint = blockTool('test-tool', {
        reason: 'This tool is dangerous',
      });
      const constraintSet = createConstraintSet('test-set', [constraint]);
      
      const result = evaluateAction(baseAction, baseContext, [constraintSet]);
      
      expect(result.recommendations).toBeDefined();
      expect(result.recommendations!.length).toBeGreaterThan(0);
    });
  });
});

