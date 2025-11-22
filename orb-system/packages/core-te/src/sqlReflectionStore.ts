/**
 * SQLite-based Te Reflection Store
 * 
 * Role: OrbRole.TE (reflection/memory)
 * 
 * Persistent storage for Te reflections and evaluations using SQLite.
 */

import { getDatabase } from '@orb-system/core-orb';
import type { TeReflection } from './reflectionHelpers';
import type { TeEvaluation } from './evaluation';

export interface TeReflectionRecord extends TeReflection {
  userId: string;
  sessionId?: string;
  score?: number;
  recommendations?: string[];
  summary?: string;
}

export interface TeReflectionStore {
  saveReflection(reflection: TeReflectionRecord): Promise<void>;
  getReflections(userId: string, limit?: number): Promise<TeReflectionRecord[]>;
  getReflectionsBySession(sessionId: string, limit?: number): Promise<TeReflectionRecord[]>;
  getReflection(id: string): Promise<TeReflectionRecord | null>;
}

export class SqlTeReflectionStore implements TeReflectionStore {
  private db = getDatabase();

  async saveReflection(reflection: TeReflectionRecord): Promise<void> {
    const stmt = this.db.prepare(`
      INSERT INTO te_reflections (
        id, user_id, session_id, input, output, tags, notes,
        score, recommendations, summary, created_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        input = excluded.input,
        output = excluded.output,
        tags = excluded.tags,
        notes = excluded.notes,
        score = excluded.score,
        recommendations = excluded.recommendations,
        summary = excluded.summary
    `);

    stmt.run(
      reflection.id,
      reflection.userId,
      reflection.sessionId || null,
      reflection.input,
      reflection.output,
      JSON.stringify(reflection.tags),
      reflection.notes || null,
      reflection.score || null,
      reflection.recommendations ? JSON.stringify(reflection.recommendations) : null,
      reflection.summary || null,
      reflection.createdAt.toISOString()
    );
  }

  async getReflections(userId: string, limit: number = 100): Promise<TeReflectionRecord[]> {
    const stmt = this.db.prepare(`
      SELECT id, user_id, session_id, input, output, tags, notes,
             score, recommendations, summary, created_at
      FROM te_reflections
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT ?
    `);

    const rows = stmt.all(userId, limit) as Array<{
      id: string;
      user_id: string;
      session_id: string | null;
      input: string;
      output: string;
      tags: string;
      notes: string | null;
      score: number | null;
      recommendations: string | null;
      summary: string | null;
      created_at: string;
    }>;

    return rows.map(row => ({
      id: row.id,
      userId: row.user_id,
      sessionId: row.session_id || undefined,
      input: row.input,
      output: row.output,
      tags: JSON.parse(row.tags),
      notes: row.notes || undefined,
      score: row.score || undefined,
      recommendations: row.recommendations ? JSON.parse(row.recommendations) : undefined,
      summary: row.summary || undefined,
      createdAt: new Date(row.created_at),
    }));
  }

  async getReflectionsBySession(sessionId: string, limit: number = 100): Promise<TeReflectionRecord[]> {
    const stmt = this.db.prepare(`
      SELECT id, user_id, session_id, input, output, tags, notes,
             score, recommendations, summary, created_at
      FROM te_reflections
      WHERE session_id = ?
      ORDER BY created_at DESC
      LIMIT ?
    `);

    const rows = stmt.all(sessionId, limit) as Array<{
      id: string;
      user_id: string;
      session_id: string | null;
      input: string;
      output: string;
      tags: string;
      notes: string | null;
      score: number | null;
      recommendations: string | null;
      summary: string | null;
      created_at: string;
    }>;

    return rows.map(row => ({
      id: row.id,
      userId: row.user_id,
      sessionId: row.session_id || undefined,
      input: row.input,
      output: row.output,
      tags: JSON.parse(row.tags),
      notes: row.notes || undefined,
      score: row.score || undefined,
      recommendations: row.recommendations ? JSON.parse(row.recommendations) : undefined,
      summary: row.summary || undefined,
      createdAt: new Date(row.created_at),
    }));
  }

  async getReflection(id: string): Promise<TeReflectionRecord | null> {
    const stmt = this.db.prepare(`
      SELECT id, user_id, session_id, input, output, tags, notes,
             score, recommendations, summary, created_at
      FROM te_reflections
      WHERE id = ?
    `);

    const row = stmt.get(id) as {
      id: string;
      user_id: string;
      session_id: string | null;
      input: string;
      output: string;
      tags: string;
      notes: string | null;
      score: number | null;
      recommendations: string | null;
      summary: string | null;
      created_at: string;
    } | undefined;

    if (!row) {
      return null;
    }

    return {
      id: row.id,
      userId: row.user_id,
      sessionId: row.session_id || undefined,
      input: row.input,
      output: row.output,
      tags: JSON.parse(row.tags),
      notes: row.notes || undefined,
      score: row.score || undefined,
      recommendations: row.recommendations ? JSON.parse(row.recommendations) : undefined,
      summary: row.summary || undefined,
      createdAt: new Date(row.created_at),
    };
  }
}

