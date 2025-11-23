/**
 * Constraint Evaluator Tests
 * 
 * Tests for constraint evaluation and mode transition validation.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { DefaultConstraintEvaluator } from '../constraintEvaluator';
import { InMemoryConstraintStore } from '../constraintStore';
import {
  type ActionContext,
  type ModeTransitionContext,
  type ConstraintSet,
  OrbRole,
  OrbMode,
  OrbPersona,
  OrbDevice,
} from '@orb-system/core-orb';

describe('DefaultConstraintEvaluator', () => {
  let evaluator: DefaultConstraintEvaluator;
  let store: InMemoryConstraintStore;
  
  beforeEach(() => {
    store = new InMemoryConstraintStore();
    evaluator = new DefaultConstraintEvaluator(store);
  });
  
  describe('evaluateAction', () => {
    it('should allow action when no constraints apply', async () => {
      const context: ActionContext = {
        userId: 'user-123',
        sessionId: 'session-456',
        currentMode: OrbMode.DEFAULT,
        actionId: 'action-1',
        actionType: 'tool_call',
        actionRole: OrbRole.MAV,
        estimatedRisk: 'low',
      };
      
      const result = await evaluator.evaluateAction(context);
      
      expect(result.allowed).toBe(true);
      expect(result.decision).toBe('allow');
      expect(result.triggeredConstraints).toHaveLength(0);
      expect(result.reasons).toContain('No constraints triggered');
    });
    
    it('should block action when hard constraint is triggered', async () => {
      // Add a blocking constraint
      const constraintSet: ConstraintSet = {
        id: 'test-set',
        name: 'Test Set',
        description: 'Test constraint set',
        constraints: [
          {
            id: 'block-delete',
            type: 'block_tool',
            severity: 'hard',
            active: true,
            description: 'Block delete tool',
            toolId: 'delete-file',
          },
        ],
        appliesTo: {
          modes: [OrbMode.DEFAULT],
        },
        priority: 100,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      await store.saveConstraintSet(constraintSet);
      
      const context: ActionContext = {
        userId: 'user-123',
        sessionId: 'session-456',
        currentMode: OrbMode.DEFAULT,
        actionId: 'action-1',
        actionType: 'tool_call',
        actionRole: OrbRole.MAV,
        toolId: 'delete-file',
        estimatedRisk: 'high',
      };
      
      const result = await evaluator.evaluateAction(context);
      
      expect(result.allowed).toBe(false);
      expect(result.decision).toBe('deny');
      expect(result.triggeredConstraints).toHaveLength(1);
      expect(result.triggeredConstraints[0].constraintId).toBe('block-delete');
      expect(result.triggeredConstraints[0].severity).toBe('hard');
    });
    
    it('should require confirmation for high-risk actions', async () => {
      const constraintSet: ConstraintSet = {
        id: 'test-set',
        name: 'Test Set',
        description: 'Test constraint set',
        constraints: [
          {
            id: 'max-risk',
            type: 'max_risk',
            severity: 'soft',
            active: true,
            description: 'Limit risk to medium',
            maxRisk: 'medium',
          },
        ],
        appliesTo: {},
        priority: 100,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      await store.saveConstraintSet(constraintSet);
      
      const context: ActionContext = {
        userId: 'user-123',
        sessionId: 'session-456',
        currentMode: OrbMode.DEFAULT,
        actionId: 'action-1',
        actionType: 'tool_call',
        actionRole: OrbRole.MAV,
        estimatedRisk: 'high',
      };
      
      const result = await evaluator.evaluateAction(context);
      
      expect(result.allowed).toBe(false);
      expect(result.decision).toBe('deny');
      expect(result.triggeredConstraints).toHaveLength(1);
      expect(result.reasons[0]).toContain('risk');
    });
    
    it('should respect device restrictions', async () => {
      const constraintSet: ConstraintSet = {
        id: 'test-set',
        name: 'Test Set',
        description: 'Test constraint set',
        constraints: [
          {
            id: 'device-restriction',
            type: 'device_restriction',
            severity: 'hard',
            active: true,
            description: 'Only allow on Mars device',
            allowedDevices: [OrbDevice.MARS],
          },
        ],
        appliesTo: {},
        priority: 100,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      await store.saveConstraintSet(constraintSet);
      
      const context: ActionContext = {
        userId: 'user-123',
        sessionId: 'session-456',
        deviceId: OrbDevice.SOL, // Wrong device
        currentMode: OrbMode.DEFAULT,
        actionId: 'action-1',
        actionType: 'tool_call',
        actionRole: OrbRole.MAV,
        estimatedRisk: 'low',
      };
      
      const result = await evaluator.evaluateAction(context);
      
      expect(result.allowed).toBe(false);
      expect(result.decision).toBe('deny');
      expect(result.triggeredConstraints).toHaveLength(1);
      expect(result.reasons[0]).toContain('device');
    });
    
    it('should filter constraints by mode applicability', async () => {
      // Add constraint that only applies to Mars mode
      const constraintSet: ConstraintSet = {
        id: 'test-set',
        name: 'Test Set',
        description: 'Test constraint set',
        constraints: [
          {
            id: 'mars-only',
            type: 'block_tool',
            severity: 'hard',
            active: true,
            description: 'Block in Mars mode only',
            toolId: 'send-email',
          },
        ],
        appliesTo: {
          modes: [OrbMode.MARS],
        },
        priority: 100,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      await store.saveConstraintSet(constraintSet);
      
      // Action in DEFAULT mode should not be blocked
      const context: ActionContext = {
        userId: 'user-123',
        sessionId: 'session-456',
        currentMode: OrbMode.DEFAULT,
        actionId: 'action-1',
        actionType: 'tool_call',
        actionRole: OrbRole.MAV,
        toolId: 'send-email',
        estimatedRisk: 'low',
      };
      
      const result = await evaluator.evaluateAction(context);
      
      expect(result.allowed).toBe(true);
      expect(result.decision).toBe('allow');
    });
  });
  
  describe('validateModeTransition', () => {
    it('should allow valid mode transition', async () => {
      const context: ModeTransitionContext = {
        userId: 'user-123',
        sessionId: 'session-456',
        deviceId: OrbDevice.SOL,
        fromMode: OrbMode.DEFAULT,
        toMode: OrbMode.SOL,
        persona: OrbPersona.PERSONAL,
        triggeredBy: 'user',
      };
      
      const result = await evaluator.validateModeTransition(context);
      
      expect(result.success).toBe(true);
      expect(result.fromMode).toBe(OrbMode.DEFAULT);
      expect(result.toMode).toBe(OrbMode.SOL);
      expect(result.blockedBy).toBeUndefined();
    });
    
    it('should block transition when constraint prevents it', async () => {
      // Add constraint that blocks transition to Earth mode
      const constraintSet: ConstraintSet = {
        id: 'test-set',
        name: 'Test Set',
        description: 'Test constraint set',
        constraints: [
          {
            id: 'block-earth',
            type: 'block_mode',
            severity: 'hard',
            active: true,
            description: 'Block transition to Earth mode',
            blockedModes: [OrbMode.EARTH],
          },
        ],
        appliesTo: {
          modes: [OrbMode.MARS],
        },
        priority: 100,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      await store.saveConstraintSet(constraintSet);
      
      const context: ModeTransitionContext = {
        userId: 'user-123',
        sessionId: 'session-456',
        fromMode: OrbMode.MARS,
        toMode: OrbMode.EARTH,
        triggeredBy: 'user',
      };
      
      const result = await evaluator.validateModeTransition(context);
      
      expect(result.success).toBe(false);
      expect(result.blockedBy).toBeDefined();
      expect(result.blockedBy!.length).toBeGreaterThan(0);
      expect(result.blockedBy![0].constraintId).toBe('block-earth');
    });
    
    it('should block persona-mode mismatch', async () => {
      const context: ModeTransitionContext = {
        userId: 'user-123',
        sessionId: 'session-456',
        deviceId: OrbDevice.MARS,
        fromMode: OrbMode.DEFAULT,
        toMode: OrbMode.MARS, // Mars mode
        persona: OrbPersona.OPEN_PEOPLE, // Wrong persona for Mars
        triggeredBy: 'user',
      };
      
      const result = await evaluator.validateModeTransition(context);
      
      expect(result.success).toBe(false);
      expect(result.blockedBy).toBeDefined();
      expect(result.blockedBy!.some(b => b.constraintId === 'system:persona-mode-mismatch')).toBe(true);
    });
    
    it('should allow compatible persona-mode combination', async () => {
      const context: ModeTransitionContext = {
        userId: 'user-123',
        sessionId: 'session-456',
        deviceId: OrbDevice.MARS,
        fromMode: OrbMode.DEFAULT,
        toMode: OrbMode.MARS,
        persona: OrbPersona.SWL, // Correct persona for Mars
        triggeredBy: 'user',
      };
      
      const result = await evaluator.validateModeTransition(context);
      
      expect(result.success).toBe(true);
    });
    
    it('should warn about device-mode mismatch', async () => {
      const context: ModeTransitionContext = {
        userId: 'user-123',
        sessionId: 'session-456',
        deviceId: OrbDevice.SOL, // Wrong device for Forge
        fromMode: OrbMode.DEFAULT,
        toMode: OrbMode.FORGE, // Forge is for Luna
        triggeredBy: 'user',
      };
      
      const result = await evaluator.validateModeTransition(context);
      
      expect(result.success).toBe(false);
      expect(result.blockedBy).toBeDefined();
      expect(result.blockedBy!.some(b => b.constraintId === 'system:device-mode-mismatch')).toBe(true);
    });
  });
  
  describe('getActiveConstraints', () => {
    it('should return all active constraints for a context', async () => {
      const constraintSet: ConstraintSet = {
        id: 'test-set',
        name: 'Test Set',
        description: 'Test constraint set',
        constraints: [
          {
            id: 'constraint-1',
            type: 'block_tool',
            severity: 'hard',
            active: true,
            description: 'Active constraint',
          },
          {
            id: 'constraint-2',
            type: 'max_risk',
            severity: 'soft',
            active: false,
            description: 'Inactive constraint',
          },
        ],
        appliesTo: {
          modes: [OrbMode.DEFAULT],
        },
        priority: 100,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      await store.saveConstraintSet(constraintSet);
      
      const constraints = await evaluator.getActiveConstraints('user-123', OrbMode.DEFAULT);
      
      expect(constraints).toHaveLength(1);
      expect(constraints[0].id).toBe('constraint-1');
      expect(constraints[0].active).toBe(true);
    });
  });
});

