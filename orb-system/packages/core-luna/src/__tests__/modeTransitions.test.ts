/**
 * Mode Transition Tests
 * 
 * Tests for Luna mode service mode transition validation
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { ModeService } from '../modes';
import {
  OrbRole,
  OrbMode,
  OrbPersona,
  createOrbContext,
  constraint,
  createConstraintSet,
  setConstraintStorage,
  type ConstraintStorage,
  type ConstraintSet,
} from '@orb-system/core-orb';

// Mock constraint storage for testing
class MockConstraintStorage implements ConstraintStorage {
  private sets: Map<string, ConstraintSet[]> = new Map();
  
  async getConstraintSets(userId: string): Promise<ConstraintSet[]> {
    return this.sets.get(userId) || [];
  }
  
  async getConstraintSet(userId: string, setId: string): Promise<ConstraintSet | null> {
    const sets = this.sets.get(userId) || [];
    return sets.find(s => s.id === setId) || null;
  }
  
  async saveConstraintSet(userId: string, set: ConstraintSet): Promise<void> {
    const sets = this.sets.get(userId) || [];
    const index = sets.findIndex(s => s.id === set.id);
    if (index >= 0) {
      sets[index] = set;
    } else {
      sets.push(set);
    }
    this.sets.set(userId, sets);
  }
  
  async deleteConstraintSet(userId: string, setId: string): Promise<void> {
    const sets = this.sets.get(userId) || [];
    this.sets.set(userId, sets.filter(s => s.id !== setId));
  }
  
  async getActiveConstraintSets(
    userId: string,
    context: { mode?: string; persona?: string; device?: string; role?: string }
  ): Promise<ConstraintSet[]> {
    const allSets = await this.getConstraintSets(userId);
    return allSets; // Simplified for testing
  }
  
  setSets(userId: string, sets: ConstraintSet[]): void {
    this.sets.set(userId, sets);
  }
}

describe('Mode Transitions', () => {
  let modeService: ModeService;
  let mockStorage: MockConstraintStorage;
  const testUserId = 'test-user';
  
  beforeEach(() => {
    modeService = ModeService.getInstance();
    mockStorage = new MockConstraintStorage();
    setConstraintStorage(mockStorage);
  });
  
  it('should allow transition without constraints', async () => {
    const ctx = createOrbContext(OrbRole.LUNA, 'session-1', { userId: testUserId });
    
    const result = await modeService.validateTransition(
      ctx,
      OrbMode.MARS,
      OrbPersona.SWL
    );
    
    expect(result.allowed).toBe(true);
    expect(result.decision).toBe('allow');
  });
  
  it('should block transition when constrained', async () => {
    // Set up constraint that only allows Earth and Sol modes
    const modeConstraint = constraint('mode-restrict-1')
      .onlyInModes(OrbMode.EARTH, OrbMode.SOL)
      .severity('hard')
      .description('Only Earth and Sol allowed')
      .build();
    
    const constraintSet = createConstraintSet(
      'test-set',
      'Test Set',
      'Mode restrictions',
      [modeConstraint]
    );
    
    mockStorage.setSets(testUserId, [constraintSet]);
    
    const ctx = createOrbContext(OrbRole.LUNA, 'session-1', { userId: testUserId });
    
    const result = await modeService.validateTransition(
      ctx,
      OrbMode.FORGE,
      OrbPersona.PERSONAL
    );
    
    expect(result.allowed).toBe(false);
    expect(result.decision).toBe('deny');
    expect(result.reasons.length).toBeGreaterThan(0);
  });
  
  it('should successfully transition when allowed', async () => {
    const ctx = createOrbContext(OrbRole.LUNA, 'session-1', { userId: testUserId });
    
    await expect(
      modeService.setMode(ctx, OrbMode.MARS, OrbPersona.SWL)
    ).resolves.not.toThrow();
    
    expect(modeService.getCurrentMode()).toBe(OrbMode.MARS);
  });
  
  it('should throw error when transition is denied', async () => {
    // Set up blocking constraint
    const modeConstraint = constraint('mode-restrict-1')
      .onlyInModes(OrbMode.EARTH)
      .severity('hard')
      .description('Only Earth allowed')
      .build();
    
    const constraintSet = createConstraintSet(
      'test-set',
      'Test Set',
      'Strict mode restrictions',
      [modeConstraint]
    );
    
    mockStorage.setSets(testUserId, [constraintSet]);
    
    const ctx = createOrbContext(OrbRole.LUNA, 'session-1', { userId: testUserId });
    
    await expect(
      modeService.setMode(ctx, OrbMode.MARS, OrbPersona.SWL)
    ).rejects.toThrow('Mode transition denied');
  });
  
  it('should allow skipping validation', async () => {
    // Set up blocking constraint
    const modeConstraint = constraint('mode-restrict-1')
      .onlyInModes(OrbMode.EARTH)
      .severity('hard')
      .description('Only Earth allowed')
      .build();
    
    const constraintSet = createConstraintSet(
      'test-set',
      'Test Set',
      'Strict mode restrictions',
      [modeConstraint]
    );
    
    mockStorage.setSets(testUserId, [constraintSet]);
    
    const ctx = createOrbContext(OrbRole.LUNA, 'session-1', { userId: testUserId });
    
    // Should succeed with skipValidation
    await expect(
      modeService.setMode(ctx, OrbMode.MARS, OrbPersona.SWL, { skipValidation: true })
    ).resolves.not.toThrow();
  });
  
  it('should include reason in validation context', async () => {
    const ctx = createOrbContext(OrbRole.LUNA, 'session-1', { userId: testUserId });
    
    const result = await modeService.validateTransition(
      ctx,
      OrbMode.FORGE,
      OrbPersona.PERSONAL,
      'Starting development session'
    );
    
    expect(result.allowed).toBe(true);
  });
});

