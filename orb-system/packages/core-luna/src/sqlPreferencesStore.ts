/**
 * SQLite-based Luna Preferences Store
 * 
 * Role: OrbRole.LUNA (preferences/intent)
 * 
 * Persistent storage for Luna profiles using SQLite.
 */

import { getDb, OrbMode } from '@orb-system/core-orb';
import type { LunaModeId, LunaProfile } from './types';
import { createProfileFromPreset } from './presets';
import type { LunaPreferencesStore } from './preferencesStore';

const DEFAULT_MODE: LunaModeId = OrbMode.DEFAULT;

export class SqlLunaPreferencesStore implements LunaPreferencesStore {
  private db = getDb();

  async getProfile(userId: string, modeId: LunaModeId): Promise<LunaProfile | null> {
    const stmt = this.db.prepare(`
      SELECT preferences, constraints, updated_at
      FROM luna_profiles
      WHERE user_id = ? AND mode_id = ?
    `);
    
    const row = stmt.get(userId, modeId) as {
      preferences: string;
      constraints: string;
      updated_at: string;
    } | undefined;

    if (!row) {
      return null;
    }

    return {
      userId,
      modeId,
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
    const { preferences, constraints: constraintStrings } = createProfileFromPreset(userId, modeId);
    const constraints = constraintStrings.map((c, idx) => ({
      id: `constraint-${modeId}-${idx}`,
      type: 'other' as const,
      active: true,
      description: c,
    }));
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
      INSERT INTO luna_profiles (user_id, mode_id, preferences, constraints, updated_at)
      VALUES (?, ?, ?, ?, ?)
      ON CONFLICT(user_id, mode_id) DO UPDATE SET
        preferences = excluded.preferences,
        constraints = excluded.constraints,
        updated_at = excluded.updated_at
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
    
    if (!row) {
      // Set default mode if none exists
      await this.setActiveMode(userId, DEFAULT_MODE);
      return DEFAULT_MODE;
    }
    
    return row.mode_id as LunaModeId;
  }

  async setActiveMode(userId: string, modeId: LunaModeId): Promise<void> {
    const stmt = this.db.prepare(`
      INSERT INTO luna_active_modes (user_id, mode_id, updated_at)
      VALUES (?, ?, ?)
      ON CONFLICT(user_id) DO UPDATE SET
        mode_id = excluded.mode_id,
        updated_at = excluded.updated_at
    `);

    stmt.run(userId, modeId, new Date().toISOString());
    
    // Ensure profile exists with defaults
    await this.getOrCreateProfile(userId, modeId);
  }

  async listModes(userId: string): Promise<LunaModeId[]> {
    const stmt = this.db.prepare(`
      SELECT DISTINCT mode_id FROM luna_profiles WHERE user_id = ?
    `);
    
    const rows = stmt.all(userId) as { mode_id: string }[];
    
    if (rows.length === 0) {
      return [DEFAULT_MODE];
    }
    
    return rows.map(row => row.mode_id as LunaModeId);
  }
}

