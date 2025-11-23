/**
 * Constraint Storage
 * 
 * Persistent storage for constraint sets.
 * Supports in-memory, file-based, and SQL-based storage.
 */

import type { ConstraintSet, ActionContext } from './types';
import type { OrbMode, OrbPersona } from '../identity/types';
import { ORB_MODE_DESCRIPTORS } from '../identity/types';
import { parseConstraintString, createConstraintSet } from './builder';

/**
 * Constraint Store Interface
 */
export interface ConstraintStore {
  getConstraintSets(context: ActionContext): Promise<ConstraintSet[]>;
  getConstraintSetsByMode(mode: OrbMode): Promise<ConstraintSet[]>;
  getConstraintSetsByPersona(persona: OrbPersona): Promise<ConstraintSet[]>;
  saveConstraintSet(constraintSet: ConstraintSet): Promise<void>;
  deleteConstraintSet(id: string): Promise<void>;
}

/**
 * In-Memory Constraint Store
 * 
 * Simple implementation that stores constraints in memory.
 * Useful for testing and development.
 */
export class InMemoryConstraintStore implements ConstraintStore {
  private constraintSets: Map<string, ConstraintSet> = new Map();
  
  async getConstraintSets(context: ActionContext): Promise<ConstraintSet[]> {
    const sets: ConstraintSet[] = [];
    
    // Get mode-specific constraints
    const modeSets = await this.getConstraintSetsByMode(context.mode);
    sets.push(...modeSets);
    
    // Get persona-specific constraints
    const personaSets = await this.getConstraintSetsByPersona(context.persona);
    sets.push(...personaSets);
    
    // Get global constraints (those with no specific scope)
    for (const set of this.constraintSets.values()) {
      const isGlobal = set.constraints.every(
        c => !c.appliesToModes && !c.appliesToPersonas && !c.appliesToDevices
      );
      if (isGlobal && !sets.includes(set)) {
        sets.push(set);
      }
    }
    
    return sets;
  }
  
  async getConstraintSetsByMode(mode: OrbMode): Promise<ConstraintSet[]> {
    const sets: ConstraintSet[] = [];
    
    for (const set of this.constraintSets.values()) {
      const hasRelevantConstraints = set.constraints.some(
        c => !c.appliesToModes || c.appliesToModes.includes(mode)
      );
      
      if (hasRelevantConstraints) {
        sets.push(set);
      }
    }
    
    return sets;
  }
  
  async getConstraintSetsByPersona(persona: OrbPersona): Promise<ConstraintSet[]> {
    const sets: ConstraintSet[] = [];
    
    for (const set of this.constraintSets.values()) {
      const hasRelevantConstraints = set.constraints.some(
        c => !c.appliesToPersonas || c.appliesToPersonas.includes(persona)
      );
      
      if (hasRelevantConstraints) {
        sets.push(set);
      }
    }
    
    return sets;
  }
  
  async saveConstraintSet(constraintSet: ConstraintSet): Promise<void> {
    this.constraintSets.set(constraintSet.id, constraintSet);
  }
  
  async deleteConstraintSet(id: string): Promise<void> {
    this.constraintSets.delete(id);
  }
}

/**
 * Load default constraint sets from mode descriptors
 * 
 * Parses the `defaultConstraints` strings from mode descriptors
 * and creates ConstraintSet objects.
 */
export function loadDefaultConstraintSets(): ConstraintSet[] {
  const sets: ConstraintSet[] = [];
  
  for (const [modeKey, descriptor] of Object.entries(ORB_MODE_DESCRIPTORS)) {
    const mode = modeKey as OrbMode;
    const constraints = descriptor.defaultConstraints
      .map(str => parseConstraintString(str, mode))
      .filter((c): c is NonNullable<typeof c> => c !== null);
    
    if (constraints.length > 0) {
      const set = createConstraintSet(
        `${mode}-defaults`,
        constraints,
        {
          id: `default-${mode}`,
          description: `Default constraints for ${mode} mode`,
          priority: 50,
        }
      );
      sets.push(set);
    }
  }
  
  return sets;
}

/**
 * Global constraint store instance
 */
let globalStore: ConstraintStore | null = null;

/**
 * Initialize the global constraint store
 */
export function initializeConstraintStore(store?: ConstraintStore): void {
  if (!store) {
    // Create default in-memory store
    store = new InMemoryConstraintStore();
    
    // Load default constraint sets
    const defaultSets = loadDefaultConstraintSets();
    for (const set of defaultSets) {
      store.saveConstraintSet(set);
    }
  }
  
  globalStore = store;
}

/**
 * Get the global constraint store
 */
export function getConstraintStore(): ConstraintStore {
  if (!globalStore) {
    initializeConstraintStore();
  }
  return globalStore!;
}

/**
 * Reset the global constraint store (useful for testing)
 */
export function resetConstraintStore(): void {
  globalStore = null;
}

