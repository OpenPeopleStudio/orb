import { createProfileFromPreset } from './presets';
import { OrbMode } from '@orb-system/core-orb';
const DEFAULT_MODE = OrbMode.DEFAULT;
export class InMemoryLunaPreferencesStore {
    constructor() {
        this.profiles = new Map();
        this.activeModes = new Map();
    }
    async getProfile(userId, modeId) {
        return this.profiles.get(userId)?.get(modeId) ?? null;
    }
    async getOrCreateProfile(userId, modeId) {
        const existing = await this.getProfile(userId, modeId);
        if (existing) {
            return existing;
        }
        // Create profile from preset defaults
        const { preferences, constraints: constraintStrings } = createProfileFromPreset(userId, modeId);
        // Convert constraint strings to LunaConstraint objects
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
        const userProfiles = this.profiles.get(profile.userId) ?? new Map();
        userProfiles.set(profile.modeId, profile);
        this.profiles.set(profile.userId, userProfiles);
    }
    async getActiveMode(userId) {
        return this.activeModes.get(userId) ?? DEFAULT_MODE;
    }
    async setActiveMode(userId, modeId) {
        this.activeModes.set(userId, modeId);
        // Ensure profile exists with defaults
        await this.getOrCreateProfile(userId, modeId);
    }
    async listModes(userId) {
        const userProfiles = this.profiles.get(userId);
        if (!userProfiles)
            return [DEFAULT_MODE];
        return Array.from(userProfiles.keys());
    }
}
// TODO: Persist profiles in Supabase/Postgres to survive process restarts.
// Note: SqlLunaPreferencesStore is now available in sqlStore.ts
//# sourceMappingURL=preferencesStore.js.map