/**
 * SQLite Te Reflection Store
 * 
 * Persistent storage for Te reflections using SQLite.
 */

import type { TeReflection } from './reflectionHelpers';

export interface TeReflectionStore {
  saveReflection(reflection: TeReflection, userId: string, sessionId?: string): Promise<void>;
  getReflections(userId: string, limit?: number): Promise<TeReflection[]>;
  getReflectionsBySession(sessionId: string, limit?: number): Promise<TeReflection[]>;
}

export class SqlTeReflectionStore implements TeReflectionStore {
  private db: any;

  constructor(db: any) {
    this.db = db;
  }

  async saveReflection(
    reflection: TeReflection,
    userId: string,
    sessionId?: string
  ): Promise<void> {
    const stmt = this.db.prepare(`
      INSERT INTO te_reflections (id, user_id, session_id, input, output, tags, notes, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      reflection.id,
      userId,
      sessionId || null,
      reflection.input,
      reflection.output,
      JSON.stringify(reflection.tags),
      reflection.notes || null,
      reflection.createdAt.toISOString()
    );
  }

  async getReflections(userId: string, limit: number = 100): Promise<TeReflection[]> {
    const stmt = this.db.prepare(`
      SELECT id, input, output, tags, notes, created_at, session_id
      FROM te_reflections
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT ?
    `);

    const rows = stmt.all(userId, limit) as Array<{
      id: string;
      input: string;
      output: string;
      tags: string;
      notes: string | null;
      created_at: string;
      session_id: string | null;
    }>;

    return rows.map(row => ({
      id: row.id,
      input: row.input,
      output: row.output,
      tags: JSON.parse(row.tags),
      notes: row.notes || undefined,
      createdAt: new Date(row.created_at),
    }));
  }

  async getReflectionsBySession(sessionId: string, limit: number = 100): Promise<TeReflection[]> {
    const stmt = this.db.prepare(`
      SELECT id, input, output, tags, notes, created_at
      FROM te_reflections
      WHERE session_id = ?
      ORDER BY created_at DESC
      LIMIT ?
    `);

    const rows = stmt.all(sessionId, limit) as Array<{
      id: string;
      input: string;
      output: string;
      tags: string;
      notes: string | null;
      created_at: string;
    }>;

    return rows.map(row => ({
      id: row.id,
      input: row.input,
      output: row.output,
      tags: JSON.parse(row.tags),
      notes: row.notes || undefined,
      createdAt: new Date(row.created_at),
    }));
  }
}

