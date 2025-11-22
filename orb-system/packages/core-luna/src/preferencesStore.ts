import type { LunaModeId, LunaProfile } from './types';
import { createProfileFromPreset } from './presets';
import { OrbMode } from '@orb-system/core-orb';

const DEFAULT_MODE: LunaModeId = OrbMode.DEFAULT;

export interface LunaPreferencesStore {
  getProfile(userId: string, modeId: LunaModeId): Promise<LunaProfile | null>;
  getOrCreateProfile(userId: string, modeId: LunaModeId): Promise<LunaProfile>;
  saveProfile(profile: LunaProfile): Promise<void>;
  getActiveMode(userId: string): Promise<LunaModeId>;
  setActiveMode(userId: string, modeId: LunaModeId): Promise<void>;
  listModes(userId: string): Promise<LunaModeId[]>;
}

export class InMemoryLunaPreferencesStore implements LunaPreferencesStore {
  private profiles = new Map<string, Map<LunaModeId, LunaProfile>>();
  private activeModes = new Map<string, LunaModeId>();

  async getProfile(userId: string, modeId: LunaModeId): Promise<LunaProfile | null> {
    return this.profiles.get(userId)?.get(modeId) ?? null;
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
    const userProfiles = this.profiles.get(profile.userId) ?? new Map<LunaModeId, LunaProfile>();
    userProfiles.set(profile.modeId, profile);
    this.profiles.set(profile.userId, userProfiles);
  }

  async getActiveMode(userId: string): Promise<LunaModeId> {
    return this.activeModes.get(userId) ?? DEFAULT_MODE;
  }

  async setActiveMode(userId: string, modeId: LunaModeId): Promise<void> {
    this.activeModes.set(userId, modeId);
    // Ensure profile exists with defaults
    await this.getOrCreateProfile(userId, modeId);
  }

  async listModes(userId: string): Promise<LunaModeId[]> {
    const userProfiles = this.profiles.get(userId);
    if (!userProfiles) return [DEFAULT_MODE];
    return Array.from(userProfiles.keys());
  }
}

// TODO: Persist profiles in Supabase/Postgres to survive process restarts.
// Note: SqlLunaPreferencesStore is now available in sqlStore.ts
