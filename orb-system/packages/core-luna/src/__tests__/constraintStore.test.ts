/**
 * Constraint Store Tests
 * 
 * Tests for in-memory and SQL constraint stores.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { InMemoryConstraintStore } from '../constraintStore';
import {
  type Constraint,
  type ConstraintSet,
  OrbMode,
  OrbPersona,
} from '@orb-system/core-orb';

describe('InMemoryConstraintStore', () => {
  let store: InMemoryConstraintStore;
  
  beforeEach(() => {
    store = new InMemoryConstraintStore();
  });
  
  describe('saveConstraintSet', () => {
    it('should save and retrieve constraint set', async () => {
      const set: ConstraintSet = {
        id: 'test-set',
        name: 'Test Set',
        description: 'Test constraint set',
        constraints: [
          {
            id: 'constraint-1',
            type: 'block_tool',
            severity: 'hard',
            active: true,
            description: 'Test constraint',
          },
        ],
        appliesTo: {
          modes: [OrbMode.DEFAULT],
        },
        priority: 100,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      await store.saveConstraintSet(set);
      
      const retrieved = await store.getConstraintSets('user-123', OrbMode.DEFAULT);
      
      expect(retrieved).toHaveLength(1);
      expect(retrieved[0].id).toBe('test-set');
      expect(retrieved[0].constraints).toHaveLength(1);
    });
  });
  
  describe('getConstraintSets', () => {
    it('should filter by mode', async () => {
      const set1: ConstraintSet = {
        id: 'set-1',
        name: 'Set 1',
        description: 'Set for Default mode',
        constraints: [],
        appliesTo: { modes: [OrbMode.DEFAULT] },
        priority: 100,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      const set2: ConstraintSet = {
        id: 'set-2',
        name: 'Set 2',
        description: 'Set for Mars mode',
        constraints: [],
        appliesTo: { modes: [OrbMode.MARS] },
        priority: 100,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      await store.saveConstraintSet(set1);
      await store.saveConstraintSet(set2);
      
      const defaultSets = await store.getConstraintSets('user-123', OrbMode.DEFAULT);
      const marsSets = await store.getConstraintSets('user-123', OrbMode.MARS);
      
      expect(defaultSets).toHaveLength(1);
      expect(defaultSets[0].id).toBe('set-1');
      
      expect(marsSets).toHaveLength(1);
      expect(marsSets[0].id).toBe('set-2');
    });
    
    it('should filter by persona', async () => {
      const set1: ConstraintSet = {
        id: 'set-1',
        name: 'Set 1',
        description: 'Set for Personal persona',
        constraints: [],
        appliesTo: { personas: [OrbPersona.PERSONAL] },
        priority: 100,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      const set2: ConstraintSet = {
        id: 'set-2',
        name: 'Set 2',
        description: 'Set for SWL persona',
        constraints: [],
        appliesTo: { personas: [OrbPersona.SWL] },
        priority: 100,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      await store.saveConstraintSet(set1);
      await store.saveConstraintSet(set2);
      
      const personalSets = await store.getConstraintSets('user-123', OrbMode.DEFAULT, OrbPersona.PERSONAL);
      const swlSets = await store.getConstraintSets('user-123', OrbMode.DEFAULT, OrbPersona.SWL);
      
      expect(personalSets).toHaveLength(1);
      expect(personalSets[0].id).toBe('set-1');
      
      expect(swlSets).toHaveLength(1);
      expect(swlSets[0].id).toBe('set-2');
    });
    
    it('should sort by priority (highest first)', async () => {
      const set1: ConstraintSet = {
        id: 'set-1',
        name: 'Low Priority',
        description: 'Low priority set',
        constraints: [],
        appliesTo: {},
        priority: 10,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      const set2: ConstraintSet = {
        id: 'set-2',
        name: 'High Priority',
        description: 'High priority set',
        constraints: [],
        appliesTo: {},
        priority: 100,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      await store.saveConstraintSet(set1);
      await store.saveConstraintSet(set2);
      
      const sets = await store.getConstraintSets('user-123', OrbMode.DEFAULT);
      
      expect(sets[0].id).toBe('set-2'); // Higher priority first
      expect(sets[1].id).toBe('set-1');
    });
  });
  
  describe('constraint operations', () => {
    it('should get individual constraint', async () => {
      const set: ConstraintSet = {
        id: 'test-set',
        name: 'Test Set',
        description: 'Test constraint set',
        constraints: [
          {
            id: 'constraint-1',
            type: 'block_tool',
            severity: 'hard',
            active: true,
            description: 'Test constraint',
          },
        ],
        appliesTo: {},
        priority: 100,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      await store.saveConstraintSet(set);
      
      const constraint = await store.getConstraint('constraint-1');
      
      expect(constraint).toBeDefined();
      expect(constraint!.id).toBe('constraint-1');
      expect(constraint!.type).toBe('block_tool');
    });
    
    it('should update individual constraint', async () => {
      const set: ConstraintSet = {
        id: 'test-set',
        name: 'Test Set',
        description: 'Test constraint set',
        constraints: [
          {
            id: 'constraint-1',
            type: 'block_tool',
            severity: 'hard',
            active: true,
            description: 'Original description',
          },
        ],
        appliesTo: {},
        priority: 100,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      await store.saveConstraintSet(set);
      
      const updated: Constraint = {
        id: 'constraint-1',
        type: 'block_tool',
        severity: 'soft', // Changed
        active: false, // Changed
        description: 'Updated description', // Changed
      };
      
      await store.updateConstraint(updated);
      
      const retrieved = await store.getConstraint('constraint-1');
      
      expect(retrieved!.severity).toBe('soft');
      expect(retrieved!.active).toBe(false);
      expect(retrieved!.description).toBe('Updated description');
    });
    
    it('should delete constraint set', async () => {
      const set: ConstraintSet = {
        id: 'test-set',
        name: 'Test Set',
        description: 'Test constraint set',
        constraints: [
          {
            id: 'constraint-1',
            type: 'block_tool',
            severity: 'hard',
            active: true,
            description: 'Test constraint',
          },
        ],
        appliesTo: {},
        priority: 100,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      await store.saveConstraintSet(set);
      await store.deleteConstraintSet('test-set');
      
      const sets = await store.getConstraintSets('user-123', OrbMode.DEFAULT);
      const constraint = await store.getConstraint('constraint-1');
      
      expect(sets).toHaveLength(0);
      expect(constraint).toBeNull();
    });
  });
});

