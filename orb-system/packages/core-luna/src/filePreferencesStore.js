/**
 * File-backed Luna Preferences Store
 *
 * Role: OrbRole.LUNA (preferences/intent)
 *
 * File-based persistent storage for Luna profiles using JSON files.
 */
import { readJson, writeJson, OrbMode } from '@orb-system/core-orb';
import { createProfileFromPreset } from './presets';
const DEFAULT_MODE = OrbMode.DEFAULT;
export class FileLunaPreferencesStore {
    constructor() {
        this.filePath = 'luna/profiles.json';
    }
    async getData() {
        return readJson(this.filePath, {});
    }
    async saveData(data) {
        await writeJson(this.filePath, data);
    }
    async getProfile(userId, modeId) {
        const data = await this.getData();
        return data[userId]?.profiles[modeId] || null;
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
        const data = await this.getData();
        if (!data[profile.userId]) {
            data[profile.userId] = {
                activeMode: DEFAULT_MODE,
                profiles: {},
            };
        }
        data[profile.userId].profiles[profile.modeId] = profile;
        await this.saveData(data);
    }
    async getActiveMode(userId) {
        const data = await this.getData();
        const userData = data[userId];
        if (userData?.activeMode) {
            return userData.activeMode;
        }
        // Return default and ensure profile exists
        await this.getOrCreateProfile(userId, DEFAULT_MODE);
        return DEFAULT_MODE;
    }
    async setActiveMode(userId, modeId) {
        const data = await this.getData();
        if (!data[userId]) {
            data[userId] = {
                activeMode: modeId,
                profiles: {},
            };
        }
        data[userId].activeMode = modeId;
        await this.saveData(data);
        // Ensure profile exists with defaults
        await this.getOrCreateProfile(userId, modeId);
    }
    async listModes(userId) {
        const data = await this.getData();
        const userData = data[userId];
        if (!userData) {
            return [DEFAULT_MODE];
        }
        const modes = Object.keys(userData.profiles);
        // Always include default mode
        if (!modes.includes(DEFAULT_MODE)) {
            modes.unshift(DEFAULT_MODE);
        }
        return modes;
    }
}
//# sourceMappingURL=filePreferencesStore.js.map