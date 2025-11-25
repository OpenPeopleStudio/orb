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
/**
 * Database-backed Luna preferences store
 * Uses SQLite via the shared database instance from core-orb
 */
export class DbLunaPreferencesStore {
    constructor(db) {
        // Use provided db or get shared instance
        this.store = new SqlLunaPreferencesStore(db || getDb());
    }
    async getProfile(userId, modeId) {
        return this.store.getProfile(userId, modeId);
    }
    async getOrCreateProfile(userId, modeId) {
        return this.store.getOrCreateProfile(userId, modeId);
    }
    async saveProfile(profile) {
        return this.store.saveProfile(profile);
    }
    async getActiveMode(userId) {
        return this.store.getActiveMode(userId);
    }
    async setActiveMode(userId, modeId) {
        return this.store.setActiveMode(userId, modeId);
    }
    async listModes(userId) {
        return this.store.listModes(userId);
    }
}
//# sourceMappingURL=dbPreferencesStore.js.map