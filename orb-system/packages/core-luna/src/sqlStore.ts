/**
 * SQLite Luna Preferences Store
 * 
 * Persistent storage for Luna profiles using SQLite.
 */

import type { LunaModeId, LunaProfile } from './types';
import { createProfileFromPreset } from './presets';
import type { LunaPreferencesStore } from './preferencesStore';

const DEFAULT_MODE: LunaModeId = 'default';

export class SqlLunaPreferencesStore implements LunaPreferencesStore {
  private db: any;

  constructor(db: any) {
    this.db = db;
  }

  async getProfile(userId: string, modeId: LunaModeId): Promise<LunaProfile | null> {
    const stmt = this.db.prepare(`
      SELECT mode_id, preferences, constraints, updated_at
      FROM luna_profiles
      WHERE user_id = ? AND mode_id = ?
    `);

    const row = stmt.get(userId, modeId) as {
      mode_id: string;
      preferences: string;
      constraints: string;
      updated_at: string;
    } | undefined;

    if (!row) {
      return null;
    }

    return {
      userId,
      modeId: row.mode_id as LunaModeId,
      preferences: JSON.parse(row.preferences),
      constraints: JSON.parse(row.constraints),
      updatedAt: row.updated_at,
    };
  }

  async getOrCreateProfile(userId: string, modeId: LunaModeId): Promise<LunaProfile> {
    const existing = await this.getProfile(userId, modeId);
    if (existing) {
      return existing;
    }

    // Create profile from preset defaults
    const { preferences, constraints } = createProfileFromPreset(userId, modeId);
    const profile: LunaProfile = {
      userId,
      modeId,
      preferences,
      constraints,
      updatedAt: new Date().toISOString(),
    };

    await this.saveProfile(profile);
    return profile;
  }

  async saveProfile(profile: LunaProfile): Promise<void> {
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO luna_profiles (user_id, mode_id, preferences, constraints, updated_at)
      VALUES (?, ?, ?, ?, ?)
    `);

    stmt.run(
      profile.userId,
      profile.modeId,
      JSON.stringify(profile.preferences),
      JSON.stringify(profile.constraints),
      profile.updatedAt
    );
  }

  async getActiveMode(userId: string): Promise<LunaModeId> {
    const stmt = this.db.prepare(`
      SELECT mode_id FROM luna_active_modes WHERE user_id = ?
    `);

    const row = stmt.get(userId) as { mode_id: string } | undefined;
    if (row) {
      return row.mode_id as LunaModeId;
    }

    // Return default and ensure profile exists
    await this.getOrCreateProfile(userId, DEFAULT_MODE);
    return DEFAULT_MODE;
  }

  async setActiveMode(userId: string, modeId: LunaModeId): Promise<void> {
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO luna_active_modes (user_id, mode_id, updated_at)
      VALUES (?, ?, ?)
    `);

    stmt.run(userId, modeId, new Date().toISOString());

    // Ensure profile exists with defaults
    await this.getOrCreateProfile(userId, modeId);
  }

  async listModes(userId: string): Promise<LunaModeId[]> {
    const stmt = this.db.prepare(`
      SELECT DISTINCT mode_id FROM luna_profiles WHERE user_id = ?
    `);

    const rows = stmt.all(userId) as Array<{ mode_id: string }>;
    const modes = rows.map(row => row.mode_id as LunaModeId);

    // Always include default mode
    if (!modes.includes(DEFAULT_MODE)) {
      modes.unshift(DEFAULT_MODE);
    }

    return modes;
  }
}

