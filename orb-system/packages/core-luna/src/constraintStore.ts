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
export class InMemoryConstraintStore implements IConstraintStore {
  private sets: Map<string, ConstraintSet> = new Map();
  private constraints: Map<string, Constraint> = new Map();
  
  constructor() {
    // Initialize with system defaults
    this.initializeSystemDefaults();
  }
  
  async getConstraintSets(
    userId: string | null,
    mode: string,
    persona?: string
  ): Promise<ConstraintSet[]> {
    const results: ConstraintSet[] = [];
    
    for (const set of this.sets.values()) {
      // Check if set applies to this context
      if (set.appliesTo.modes && !set.appliesTo.modes.includes(mode as any)) {
        continue;
      }
      if (set.appliesTo.personas && persona && !set.appliesTo.personas.includes(persona as any)) {
        continue;
      }
      
      results.push(set);
    }
    
    // Sort by priority (higher first)
    return results.sort((a, b) => b.priority - a.priority);
  }
  
  async saveConstraintSet(set: ConstraintSet): Promise<void> {
    this.sets.set(set.id, set);
    
    // Also store individual constraints
    for (const constraint of set.constraints) {
      this.constraints.set(constraint.id, constraint);
    }
  }
  
  async getConstraint(constraintId: string): Promise<Constraint | null> {
    return this.constraints.get(constraintId) ?? null;
  }
  
  async updateConstraint(constraint: Constraint): Promise<void> {
    this.constraints.set(constraint.id, constraint);
    
    // Update in parent constraint set
    for (const set of this.sets.values()) {
      const index = set.constraints.findIndex(c => c.id === constraint.id);
      if (index !== -1) {
        set.constraints[index] = constraint;
      }
    }
  }
  
  async deleteConstraintSet(setId: string): Promise<void> {
    const set = this.sets.get(setId);
    if (set) {
      // Remove individual constraints
      for (const constraint of set.constraints) {
        this.constraints.delete(constraint.id);
      }
      this.sets.delete(setId);
    }
  }
  
  private initializeSystemDefaults(): void {
    // System defaults will be added via defaultConstraints.ts
  }
}

/**
 * SQL Constraint Store
 * 
 * Persistent storage using SQLite (via better-sqlite3).
 */
export class SqlConstraintStore implements IConstraintStore {
  constructor(private db: Database) {
    this.initializeSchema();
  }
  
  async getConstraintSets(
    userId: string | null,
    mode: string,
    persona?: string
  ): Promise<ConstraintSet[]> {
    // Query constraint sets
    const setsQuery = this.db.prepare(`
      SELECT * FROM luna_constraint_sets
      WHERE (user_id = ? OR user_id IS NULL)
      ORDER BY priority DESC
    `);
    
    const rows = setsQuery.all(userId ?? null) as any[];
    const sets: ConstraintSet[] = [];
    
    for (const row of rows) {
      const appliesTo = JSON.parse(row.applies_to);
      
      // Filter by mode/persona
      if (appliesTo.modes && !appliesTo.modes.includes(mode)) {
        continue;
      }
      if (appliesTo.personas && persona && !appliesTo.personas.includes(persona)) {
        continue;
      }
      
      // Get constraints for this set
      const constraintsQuery = this.db.prepare(`
        SELECT * FROM luna_constraints
        WHERE constraint_set_id = ?
      `);
      
      const constraintRows = constraintsQuery.all(row.id) as any[];
      const constraints: Constraint[] = constraintRows.map(c => ({
        id: c.id,
        type: c.type,
        severity: c.severity,
        active: c.active === 1,
        description: c.description,
        toolId: c.tool_id,
        maxRisk: c.max_risk,
        blockedModes: c.blocked_modes ? JSON.parse(c.blocked_modes) : undefined,
        blockedPersonas: c.blocked_personas ? JSON.parse(c.blocked_personas) : undefined,
        requiredPersona: c.required_persona,
        allowedDevices: c.allowed_devices ? JSON.parse(c.allowed_devices) : undefined,
        appliesToRoles: c.applies_to_roles ? JSON.parse(c.applies_to_roles) : undefined,
        timeWindow: c.time_window ? JSON.parse(c.time_window) : undefined,
        createdAt: c.created_at,
        updatedAt: c.updated_at,
        createdBy: c.created_by,
      }));
      
      sets.push({
        id: row.id,
        name: row.name,
        description: row.description,
        constraints,
        appliesTo,
        priority: row.priority,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      });
    }
    
    return sets;
  }
  
  async saveConstraintSet(set: ConstraintSet): Promise<void> {
    // Insert or replace constraint set
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO luna_constraint_sets
      (id, name, description, applies_to, priority, created_at, updated_at, user_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, NULL)
    `);
    
    stmt.run(
      set.id,
      set.name,
      set.description,
      JSON.stringify(set.appliesTo),
      set.priority,
      set.createdAt,
      set.updatedAt
    );
    
    // Insert constraints
    for (const constraint of set.constraints) {
      await this.saveConstraint(constraint, set.id);
    }
  }
  
  async getConstraint(constraintId: string): Promise<Constraint | null> {
    const stmt = this.db.prepare('SELECT * FROM luna_constraints WHERE id = ?');
    const row = stmt.get(constraintId) as any;
    
    if (!row) return null;
    
    return {
      id: row.id,
      type: row.type,
      severity: row.severity,
      active: row.active === 1,
      description: row.description,
      toolId: row.tool_id,
      maxRisk: row.max_risk,
      blockedModes: row.blocked_modes ? JSON.parse(row.blocked_modes) : undefined,
      blockedPersonas: row.blocked_personas ? JSON.parse(row.blocked_personas) : undefined,
      requiredPersona: row.required_persona,
      allowedDevices: row.allowed_devices ? JSON.parse(row.allowed_devices) : undefined,
      appliesToRoles: row.applies_to_roles ? JSON.parse(row.applies_to_roles) : undefined,
      timeWindow: row.time_window ? JSON.parse(row.time_window) : undefined,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      createdBy: row.created_by,
    };
  }
  
  async updateConstraint(constraint: Constraint): Promise<void> {
    const stmt = this.db.prepare(`
      UPDATE luna_constraints
      SET type = ?, severity = ?, active = ?, description = ?,
          tool_id = ?, max_risk = ?, blocked_modes = ?, blocked_personas = ?,
          required_persona = ?, allowed_devices = ?, applies_to_roles = ?,
          time_window = ?, updated_at = ?
      WHERE id = ?
    `);
    
    stmt.run(
      constraint.type,
      constraint.severity,
      constraint.active ? 1 : 0,
      constraint.description,
      constraint.toolId ?? null,
      constraint.maxRisk ?? null,
      constraint.blockedModes ? JSON.stringify(constraint.blockedModes) : null,
      constraint.blockedPersonas ? JSON.stringify(constraint.blockedPersonas) : null,
      constraint.requiredPersona ?? null,
      constraint.allowedDevices ? JSON.stringify(constraint.allowedDevices) : null,
      constraint.appliesToRoles ? JSON.stringify(constraint.appliesToRoles) : null,
      constraint.timeWindow ? JSON.stringify(constraint.timeWindow) : null,
      new Date().toISOString(),
      constraint.id
    );
  }
  
  async deleteConstraintSet(setId: string): Promise<void> {
    // Delete constraints first (foreign key)
    const deleteConstraints = this.db.prepare('DELETE FROM luna_constraints WHERE constraint_set_id = ?');
    deleteConstraints.run(setId);
    
    // Delete set
    const deleteSet = this.db.prepare('DELETE FROM luna_constraint_sets WHERE id = ?');
    deleteSet.run(setId);
  }
  
  private async saveConstraint(constraint: Constraint, setId: string): Promise<void> {
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO luna_constraints
      (id, constraint_set_id, type, severity, active, description,
       tool_id, max_risk, blocked_modes, blocked_personas, required_persona,
       allowed_devices, applies_to_roles, time_window, created_at, updated_at, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    stmt.run(
      constraint.id,
      setId,
      constraint.type,
      constraint.severity,
      constraint.active ? 1 : 0,
      constraint.description,
      constraint.toolId ?? null,
      constraint.maxRisk ?? null,
      constraint.blockedModes ? JSON.stringify(constraint.blockedModes) : null,
      constraint.blockedPersonas ? JSON.stringify(constraint.blockedPersonas) : null,
      constraint.requiredPersona ?? null,
      constraint.allowedDevices ? JSON.stringify(constraint.allowedDevices) : null,
      constraint.appliesToRoles ? JSON.stringify(constraint.appliesToRoles) : null,
      constraint.timeWindow ? JSON.stringify(constraint.timeWindow) : null,
      constraint.createdAt ?? new Date().toISOString(),
      constraint.updatedAt ?? new Date().toISOString(),
      constraint.createdBy ?? 'system'
    );
  }
  
  private initializeSchema(): void {
    // Create constraint sets table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS luna_constraint_sets (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT NOT NULL,
        applies_to TEXT NOT NULL,
        priority INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        user_id TEXT
      )
    `);
    
    // Create constraints table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS luna_constraints (
        id TEXT PRIMARY KEY,
        constraint_set_id TEXT NOT NULL,
        type TEXT NOT NULL,
        severity TEXT NOT NULL,
        active INTEGER NOT NULL DEFAULT 1,
        description TEXT NOT NULL,
        tool_id TEXT,
        max_risk TEXT,
        blocked_modes TEXT,
        blocked_personas TEXT,
        required_persona TEXT,
        allowed_devices TEXT,
        applies_to_roles TEXT,
        time_window TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        created_by TEXT,
        FOREIGN KEY (constraint_set_id) REFERENCES luna_constraint_sets(id)
      )
    `);
    
    // Create indexes
    this.db.exec(`
      CREATE INDEX IF NOT EXISTS idx_constraint_sets_user ON luna_constraint_sets(user_id);
      CREATE INDEX IF NOT EXISTS idx_constraints_set ON luna_constraints(constraint_set_id);
    `);
  }
}

