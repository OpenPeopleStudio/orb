/**
 * Constraint Builder Tests
 */

import { describe, it, expect } from 'vitest';
import {
  createConstraintSet,
  addConstraint,
  removeConstraint,
  updateConstraint,
  buildModeConstraints,
  buildPersonaConstraints,
  buildGlobalConstraints,
  mergeConstraintSets,
  blockAction,
  requireConfirmation,
  maxRisk,
} from '../builder';
import type { OrbMode, OrbPersona } from '../../identity/types';
import type { BlockActionConstraint } from '../types';

describe('Constraint Builder', () => {
  describe('createConstraintSet', () => {
    it('should create an empty constraint set', () => {
      const set = createConstraintSet({});
      
      expect(set.id).toBeTruthy();
      expect(set.constraints).toEqual([]);
      expect(set.priority).toBe(0);
      expect(set.createdAt).toBeTruthy();
      expect(set.updatedAt).toBeTruthy();
    });

    it('should create a constraint set with options', () => {
      const set = createConstraintSet({
        userId: 'user123',
        mode: 'sol' as OrbMode,
        priority: 50,
      });

      expect(set.userId).toBe('user123');
      expect(set.mode).toBe('sol');
      expect(set.priority).toBe(50);
    });
  });

  describe('addConstraint', () => {
    it('should add a constraint to a set immutably', () => {
      const set = createConstraintSet({});
      const constraint = blockAction('test_action', 'Test constraint');

      const updated = addConstraint(set, constraint);

      expect(updated.constraints).toHaveLength(1);
      expect(updated.constraints[0]).toEqual(constraint);
      expect(set.constraints).toHaveLength(0); // Original unchanged
    });

    it('should update the updatedAt timestamp', () => {
      const set = createConstraintSet({});
      const constraint = blockAction('test_action', 'Test constraint');

      const updated = addConstraint(set, constraint);

      expect(new Date(updated.updatedAt).getTime()).toBeGreaterThanOrEqual(
        new Date(set.updatedAt).getTime()
      );
    });
  });

  describe('removeConstraint', () => {
    it('should remove a constraint by ID', () => {
      const set = createConstraintSet({});
      const constraint = blockAction('test_action', 'Test constraint');
      const withConstraint = addConstraint(set, constraint);

      const removed = removeConstraint(withConstraint, constraint.id);

      expect(removed.constraints).toHaveLength(0);
    });
  });

  describe('updateConstraint', () => {
    it('should update a constraint by ID', () => {
      const set = createConstraintSet({});
      const constraint = blockAction('test_action', 'Test constraint');
      const withConstraint = addConstraint(set, constraint);

      const updated = updateConstraint(withConstraint, constraint.id, {
        description: 'Updated description',
        active: false,
      });

      expect(updated.constraints[0].description).toBe('Updated description');
      expect(updated.constraints[0].active).toBe(false);
    });
  });

  describe('buildModeConstraints', () => {
    it('should build constraints for Sol mode', () => {
      const set = buildModeConstraints('sol' as OrbMode);

      expect(set.mode).toBe('sol');
      expect(set.priority).toBe(50);
      expect(set.constraints.length).toBeGreaterThan(0);

      // Sol mode should have no-destructive-actions and require-confirmation
      const hasDestructive = set.constraints.some(
        (c) => c.type === 'block_action' && c.description.includes('destructive')
      );
      expect(hasDestructive).toBe(true);
    });

    it('should build constraints for Mars mode', () => {
      const set = buildModeConstraints('mars' as OrbMode);

      expect(set.mode).toBe('mars');
      expect(set.constraints.length).toBeGreaterThan(0);

      // Mars mode should have no-personal-notifications
      const hasNoPersonal = set.constraints.some(
        (c) => c.type === 'block_action' && c.description.includes('personal')
      );
      expect(hasNoPersonal).toBe(true);
    });
  });

  describe('buildPersonaConstraints', () => {
    it('should build constraints for a persona', () => {
      const set = buildPersonaConstraints('personal' as OrbPersona);

      expect(set.persona).toBe('personal');
      expect(set.priority).toBe(40);
      expect(set.constraints.length).toBeGreaterThan(0);

      // All personas should require confirmation for financial actions
      const hasFinanceConfirm = set.constraints.some(
        (c) => c.type === 'require_confirmation' && c.description.includes('financial')
      );
      expect(hasFinanceConfirm).toBe(true);
    });
  });

  describe('buildGlobalConstraints', () => {
    it('should build global system constraints', () => {
      const set = buildGlobalConstraints();

      expect(set.priority).toBe(100);
      expect(set.constraints.length).toBeGreaterThan(0);

      // Should have destructive git block
      const hasGitBlock = set.constraints.some(
        (c) => c.type === 'block_action' && c.description.includes('git')
      );
      expect(hasGitBlock).toBe(true);
    });
  });

  describe('mergeConstraintSets', () => {
    it('should merge multiple constraint sets', () => {
      const set1 = createConstraintSet({ priority: 10 });
      const set1WithConstraint = addConstraint(
        set1,
        blockAction('action1', 'Constraint 1')
      );

      const set2 = createConstraintSet({ priority: 20 });
      const set2WithConstraint = addConstraint(
        set2,
        blockAction('action2', 'Constraint 2')
      );

      const merged = mergeConstraintSets([set1WithConstraint, set2WithConstraint]);

      expect(merged.constraints).toHaveLength(2);
      expect(merged.priority).toBe(20); // Higher priority wins
    });

    it('should remove duplicate constraint IDs', () => {
      const constraint = blockAction('action1', 'Constraint');
      
      const set1 = addConstraint(createConstraintSet({}), constraint);
      const set2 = addConstraint(createConstraintSet({}), constraint);

      const merged = mergeConstraintSets([set1, set2]);

      expect(merged.constraints).toHaveLength(1);
    });

    it('should handle empty array', () => {
      const merged = mergeConstraintSets([]);
      
      expect(merged.constraints).toHaveLength(0);
    });
  });

  describe('Helper functions', () => {
    describe('blockAction', () => {
      it('should create a block action constraint', () => {
        const constraint = blockAction('test_action', 'Test description');

        expect(constraint.type).toBe('block_action');
        expect(constraint.actionType).toBe('test_action');
        expect(constraint.description).toBe('Test description');
        expect(constraint.severity).toBe('hard');
        expect(constraint.active).toBe(true);
      });
    });

    describe('requireConfirmation', () => {
      it('should create a require confirmation constraint', () => {
        const constraint = requireConfirmation('test_action', 'Test description');

        expect(constraint.type).toBe('require_confirmation');
        expect(constraint.actionType).toBe('test_action');
        expect(constraint.description).toBe('Test description');
        expect(constraint.severity).toBe('soft');
        expect(constraint.active).toBe(true);
      });
    });

    describe('maxRisk', () => {
      it('should create a max risk constraint', () => {
        const constraint = maxRisk('medium', 'Test description', ['action1']);

        expect(constraint.type).toBe('max_risk');
        expect(constraint.maxRiskLevel).toBe('medium');
        expect(constraint.description).toBe('Test description');
        expect(constraint.actionTypes).toEqual(['action1']);
        expect(constraint.active).toBe(true);
      });
    });
  });
});

