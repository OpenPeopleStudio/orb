/**
 * Constraint Storage
 *
 * Persistent storage for constraint sets.
 * Supports in-memory, file-based, and SQL-based storage.
 */
import { ORB_MODE_DESCRIPTORS } from '../identity/types';
import { parseConstraintString, createConstraintSet } from './builder';
/**
 * In-Memory Constraint Store
 *
 * Simple implementation that stores constraints in memory.
 * Useful for testing and development.
 */
export class InMemoryConstraintStore {
    constructor() {
        this.constraintSets = new Map();
    }
    async getConstraintSets(context) {
        const sets = [];
        // Get mode-specific constraints
        const modeSets = await this.getConstraintSetsByMode(context.mode);
        sets.push(...modeSets);
        // Get persona-specific constraints
        const personaSets = await this.getConstraintSetsByPersona(context.persona);
        sets.push(...personaSets);
        // Get global constraints (those with no specific scope)
        for (const set of this.constraintSets.values()) {
            const isGlobal = set.constraints.every(c => !c.appliesToModes && !c.appliesToPersonas && !c.appliesToDevices);
            if (isGlobal && !sets.includes(set)) {
                sets.push(set);
            }
        }
        return sets;
    }
    async getConstraintSetsByMode(mode) {
        const sets = [];
        for (const set of this.constraintSets.values()) {
            const hasRelevantConstraints = set.constraints.some(c => !c.appliesToModes || c.appliesToModes.includes(mode));
            if (hasRelevantConstraints) {
                sets.push(set);
            }
        }
        return sets;
    }
    async getConstraintSetsByPersona(persona) {
        const sets = [];
        for (const set of this.constraintSets.values()) {
            const hasRelevantConstraints = set.constraints.some(c => !c.appliesToPersonas || c.appliesToPersonas.includes(persona));
            if (hasRelevantConstraints) {
                sets.push(set);
            }
        }
        return sets;
    }
    async saveConstraintSet(constraintSet) {
        this.constraintSets.set(constraintSet.id, constraintSet);
    }
    async deleteConstraintSet(id) {
        this.constraintSets.delete(id);
    }
}
/**
 * Load default constraint sets from mode descriptors
 *
 * Parses the `defaultConstraints` strings from mode descriptors
 * and creates ConstraintSet objects.
 */
export function loadDefaultConstraintSets() {
    const sets = [];
    for (const [modeKey, descriptor] of Object.entries(ORB_MODE_DESCRIPTORS)) {
        const mode = modeKey;
        const constraints = descriptor.defaultConstraints
            .map(str => parseConstraintString(str, mode))
            .filter((c) => c !== null);
        if (constraints.length > 0) {
            const set = createConstraintSet(`${mode}-defaults`, constraints, {
                id: `default-${mode}`,
                description: `Default constraints for ${mode} mode`,
                priority: 50,
            });
            sets.push(set);
        }
    }
    return sets;
}
/**
 * Global constraint store instance
 */
let globalStore = null;
/**
 * Initialize the global constraint store
 */
export function initializeConstraintStore(store) {
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
export function getConstraintStore() {
    if (!globalStore) {
        initializeConstraintStore();
    }
    return globalStore;
}
/**
 * Reset the global constraint store (useful for testing)
 */
export function resetConstraintStore() {
    globalStore = null;
}
//# sourceMappingURL=storage.js.map