/**
 * File-backed Luna Preferences Store
 * 
 * Role: OrbRole.LUNA (preferences/intent)
 * 
 * File-based persistent storage for Luna profiles using JSON files.
 */

import { readJson, writeJson } from '@orb-system/core-orb';
import type { LunaModeId, LunaProfile } from './types';
import { createProfileFromPreset } from './presets';
import type { LunaPreferencesStore } from './preferencesStore';

const DEFAULT_MODE: LunaModeId = 'default';

/**
 * File storage layout:
 * .orb-data/luna/profiles.json
 * {
 *   "<userId>": {
 *     "activeMode": "<modeId>",
 *     "profiles": {
 *       "<modeId>": { /* LunaProfile */ }
 *     }
 *   }
 * }
 */
interface LunaFileData {
  [userId: string]: {
    activeMode: LunaModeId;
    profiles: {
      [modeId: string]: LunaProfile;
    };
  };
}

export class FileLunaPreferencesStore implements LunaPreferencesStore {
  private readonly filePath = 'luna/profiles.json';

  private async getData(): Promise<LunaFileData> {
    return readJson<LunaFileData>(this.filePath, {});
  }

  private async saveData(data: LunaFileData): Promise<void> {
    await writeJson(this.filePath, data);
  }

  async getProfile(userId: string, modeId: LunaModeId): Promise<LunaProfile | null> {
    const data = await this.getData();
    return data[userId]?.profiles[modeId] || null;
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

  async getActiveMode(userId: string): Promise<LunaModeId> {
    const data = await this.getData();
    const userData = data[userId];
    if (userData?.activeMode) {
      return userData.activeMode;
    }

    // Return default and ensure profile exists
    await this.getOrCreateProfile(userId, DEFAULT_MODE);
    return DEFAULT_MODE;
  }

  async setActiveMode(userId: string, modeId: LunaModeId): Promise<void> {
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

  async listModes(userId: string): Promise<LunaModeId[]> {
    const data = await this.getData();
    const userData = data[userId];
    if (!userData) {
      return [DEFAULT_MODE];
    }

    const modes = Object.keys(userData.profiles) as LunaModeId[];
    // Always include default mode
    if (!modes.includes(DEFAULT_MODE)) {
      modes.unshift(DEFAULT_MODE);
    }
    return modes;
  }
}

