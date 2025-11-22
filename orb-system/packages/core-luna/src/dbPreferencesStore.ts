/**
 * Database-backed Luna Preferences Store
 * 
 * Role: OrbRole.LUNA (preferences/intent)
 * 
 * Database-backed persistent storage for Luna profiles using SQLite.
 * This is a wrapper around SqlLunaPreferencesStore that uses the shared database instance.
 */

import { getDb } from '@orb-system/core-orb';
import { SqlLunaPreferencesStore } from './sqlStore';
import type { LunaPreferencesStore } from './preferencesStore';

/**
 * Database-backed Luna preferences store
 * Uses SQLite via the shared database instance from core-orb
 */
export class DbLunaPreferencesStore implements LunaPreferencesStore {
  private store: SqlLunaPreferencesStore;

  constructor(db?: any) {
    // Use provided db or get shared instance
    this.store = new SqlLunaPreferencesStore(db || getDb());
  }

  async getProfile(userId: string, modeId: string): Promise<import('./types').LunaProfile | null> {
    return this.store.getProfile(userId, modeId);
  }

  async getOrCreateProfile(userId: string, modeId: string): Promise<import('./types').LunaProfile> {
    return this.store.getOrCreateProfile(userId, modeId);
  }

  async saveProfile(profile: import('./types').LunaProfile): Promise<void> {
    return this.store.saveProfile(profile);
  }

  async getActiveMode(userId: string): Promise<string> {
    return this.store.getActiveMode(userId);
  }

  async setActiveMode(userId: string, modeId: string): Promise<void> {
    return this.store.setActiveMode(userId, modeId);
  }

  async listModes(userId: string): Promise<string[]> {
    return this.store.listModes(userId);
  }
}

