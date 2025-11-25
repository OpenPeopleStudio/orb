/**
 * SQLite Te Reflection Store
 *
 * Persistent storage for Te reflections using SQLite.
 */
export class SqlTeReflectionStore {
    constructor(db) {
        this.db = db;
    }
    async saveReflection(reflection, userId, sessionId) {
        const stmt = this.db.prepare(`
      INSERT INTO te_reflections (id, user_id, session_id, input, output, tags, notes, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
        stmt.run(reflection.id, userId, sessionId || null, reflection.input, reflection.output, JSON.stringify(reflection.tags), reflection.notes || null, reflection.createdAt.toISOString());
    }
    async getReflections(userId, limit = 100) {
        const stmt = this.db.prepare(`
      SELECT id, input, output, tags, notes, created_at, session_id
      FROM te_reflections
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT ?
    `);
        const rows = stmt.all(userId, limit);
        return rows.map(row => ({
            id: row.id,
            input: row.input,
            output: row.output,
            tags: JSON.parse(row.tags),
            notes: row.notes || undefined,
            createdAt: new Date(row.created_at),
        }));
    }
    async getReflectionsBySession(sessionId, limit = 100) {
        const stmt = this.db.prepare(`
      SELECT id, input, output, tags, notes, created_at
      FROM te_reflections
      WHERE session_id = ?
      ORDER BY created_at DESC
      LIMIT ?
    `);
        const rows = stmt.all(sessionId, limit);
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
//# sourceMappingURL=sqlStore.js.map