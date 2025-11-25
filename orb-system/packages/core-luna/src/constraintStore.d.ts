/**
 * Constraint Store Interface and Implementations
 *
 * Role: OrbRole.LUNA (preferences/intent)
 *
 * Defines how constraint sets are persisted and retrieved.
 */
import type { Constraint, ConstraintSet } from '@orb-system/core-orb';
import type { Database } from 'better-sqlite3';
/**
 * Constraint Store Interface
 */
export interface IConstraintStore {
    getConstraintSets(userId: string | null, mode: string, persona?: string): Promise<ConstraintSet[]>;
    saveConstraintSet(set: ConstraintSet): Promise<void>;
    getConstraint(constraintId: string): Promise<Constraint | null>;
    updateConstraint(constraint: Constraint): Promise<void>;
    deleteConstraintSet(setId: string): Promise<void>;
}
/**
 * In-Memory Constraint Store
 *
 * For testing and development. Not persistent across restarts.
 */
export declare class InMemoryConstraintStore implements IConstraintStore {
    private sets;
    private constraints;
    constructor();
    getConstraintSets(userId: string | null, mode: string, persona?: string): Promise<ConstraintSet[]>;
    saveConstraintSet(set: ConstraintSet): Promise<void>;
    getConstraint(constraintId: string): Promise<Constraint | null>;
    updateConstraint(constraint: Constraint): Promise<void>;
    deleteConstraintSet(setId: string): Promise<void>;
    private initializeSystemDefaults;
}
/**
 * SQL Constraint Store
 *
 * Persistent storage using SQLite (via better-sqlite3).
 */
export declare class SqlConstraintStore implements IConstraintStore {
    private db;
    constructor(db: Database);
    getConstraintSets(userId: string | null, mode: string, persona?: string): Promise<ConstraintSet[]>;
    saveConstraintSet(set: ConstraintSet): Promise<void>;
    getConstraint(constraintId: string): Promise<Constraint | null>;
    updateConstraint(constraint: Constraint): Promise<void>;
    deleteConstraintSet(setId: string): Promise<void>;
    private saveConstraint;
    private initializeSchema;
}
//# sourceMappingURL=constraintStore.d.ts.map