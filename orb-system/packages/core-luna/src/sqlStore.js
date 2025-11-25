/**
 * SQLite Luna Preferences Store
 *
 * Persistent storage for Luna profiles using SQLite.
 */
import { OrbMode } from '@orb-system/core-orb';
import { createProfileFromPreset } from './presets';
const DEFAULT_MODE = OrbMode.DEFAULT;
export class SqlLunaPreferencesStore {
    constructor(db) {
        this.db = db;
    }
    async getProfile(userId, modeId) {
        const stmt = this.db.prepare(`
      SELECT mode_id, preferences, constraints, updated_at
      FROM luna_profiles
      WHERE user_id = ? AND mode_id = ?
    `);
        const row = stmt.get(userId, modeId);
        if (!row) {
            return null;
        }
        return {
            userId,
            modeId: row.mode_id,
            preferences: JSON.parse(row.preferences),
            constraints: JSON.parse(row.constraints),
            updatedAt: row.updated_at,
        };
    }
    async getOrCreateProfile(userId, modeId) {
        const existing = await this.getProfile(userId, modeId);
        if (existing) {
            return existing;
        }
        // Create profile from preset defaults
        const { preferences, constraints: constraintStrings } = createProfileFromPreset(userId, modeId);
        const constraints = constraintStrings.map((c, idx) => ({
            id: `constraint-${modeId}-${idx}`,
            type: 'other',
            active: true,
            description: c,
        }));
        const profile = {
            userId,
            modeId,
            preferences,
            constraints,
            updatedAt: new Date().toISOString(),
        };
        await this.saveProfile(profile);
        return profile;
    }
    async saveProfile(profile) {
        const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO luna_profiles (user_id, mode_id, preferences, constraints, updated_at)
      VALUES (?, ?, ?, ?, ?)
    `);
        stmt.run(profile.userId, profile.modeId, JSON.stringify(profile.preferences), JSON.stringify(profile.constraints), profile.updatedAt);
    }
    async getActiveMode(userId) {
        const stmt = this.db.prepare(`
      SELECT mode_id FROM luna_active_modes WHERE user_id = ?
    `);
        const row = stmt.get(userId);
        if (row) {
            return row.mode_id;
        }
        // Return default and ensure profile exists
        await this.getOrCreateProfile(userId, DEFAULT_MODE);
        return DEFAULT_MODE;
    }
    async setActiveMode(userId, modeId) {
        const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO luna_active_modes (user_id, mode_id, updated_at)
      VALUES (?, ?, ?)
    `);
        stmt.run(userId, modeId, new Date().toISOString());
        // Ensure profile exists with defaults
        await this.getOrCreateProfile(userId, modeId);
    }
    async listModes(userId) {
        const stmt = this.db.prepare(`
      SELECT DISTINCT mode_id FROM luna_profiles WHERE user_id = ?
    `);
        const rows = stmt.all(userId);
        const modes = rows.map(row => row.mode_id);
        // Always include default mode
        if (!modes.includes(DEFAULT_MODE)) {
            modes.unshift(DEFAULT_MODE);
        }
        return modes;
    }
}
//# sourceMappingURL=sqlStore.js.map