/**
 * Supabase-backed Luna Preferences Store
 * 
 * Role: OrbRole.LUNA (preferences/intent)
 * 
 * Supabase-backed persistent storage for Luna profiles using PostgreSQL.
 */

import { getSupabaseClient, OrbMode } from '@orb-system/core-orb';
import type { LunaModeId, LunaProfile } from './types';
import { createProfileFromPreset } from './presets';
import type { LunaPreferencesStore } from './preferencesStore';

const DEFAULT_MODE: LunaModeId = OrbMode.DEFAULT;

/**
 * Supabase-backed Luna preferences store
 * Uses Supabase PostgreSQL via the Supabase client
 */
export class SupabaseLunaPreferencesStore implements LunaPreferencesStore {
  private supabase: any;

  constructor(supabaseClient?: any) {
    this.supabase = supabaseClient || getSupabaseClient();
  }

  async getProfile(userId: string, modeId: LunaModeId): Promise<LunaProfile | null> {
    const { data, error } = await this.supabase
      .from('luna_profiles')
      .select('preferences, constraints, updated_at')
      .eq('user_id', userId)
      .eq('mode_id', modeId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows returned
        return null;
      }
      throw new Error(`Failed to get profile: ${error.message}`);
    }

    return {
      userId,
      modeId,
      preferences: data.preferences,
      constraints: data.constraints,
      updatedAt: data.updated_at,
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
    const { error } = await this.supabase
      .from('luna_profiles')
      .upsert({
        user_id: profile.userId,
        mode_id: profile.modeId,
        preferences: profile.preferences,
        constraints: profile.constraints,
        updated_at: profile.updatedAt,
      }, {
        onConflict: 'user_id,mode_id',
      });

    if (error) {
      throw new Error(`Failed to save profile: ${error.message}`);
    }
  }

  async getActiveMode(userId: string): Promise<LunaModeId> {
    const { data, error } = await this.supabase
      .from('luna_active_modes')
      .select('mode_id')
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows returned - return default and ensure profile exists
        await this.getOrCreateProfile(userId, DEFAULT_MODE);
        return DEFAULT_MODE;
      }
      throw new Error(`Failed to get active mode: ${error.message}`);
    }

    return data.mode_id as LunaModeId;
  }

  async setActiveMode(userId: string, modeId: LunaModeId): Promise<void> {
    const { error } = await this.supabase
      .from('luna_active_modes')
      .upsert({
        user_id: userId,
        mode_id: modeId,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id',
      });

    if (error) {
      throw new Error(`Failed to set active mode: ${error.message}`);
    }

    // Ensure profile exists with defaults
    await this.getOrCreateProfile(userId, modeId);
  }

  async listModes(userId: string): Promise<LunaModeId[]> {
    const { data, error } = await this.supabase
      .from('luna_profiles')
      .select('mode_id')
      .eq('user_id', userId);

    if (error) {
      throw new Error(`Failed to list modes: ${error.message}`);
    }

    const modes = (data || []).map((row: any) => row.mode_id as LunaModeId);

    // Always include default mode
    if (!modes.includes(DEFAULT_MODE)) {
      modes.unshift(DEFAULT_MODE);
    }

    return modes;
  }
}

