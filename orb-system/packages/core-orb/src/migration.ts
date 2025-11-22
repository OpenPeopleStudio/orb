/**
 * Data Migration Utilities
 * 
 * Utilities for migrating data between different store backends
 * (e.g., file -> database, memory -> file, etc.)
 */

import { FileLunaPreferencesStore } from '@orb-system/core-luna';
import { SqlLunaPreferencesStore } from '@orb-system/core-luna';
import { FileTeReflectionStore } from '@orb-system/core-te';
import { SqlTeReflectionStore } from '@orb-system/core-te';
import type { LunaPreferencesStore } from '@orb-system/core-luna';
import type { TeReflectionStore } from '@orb-system/core-te';
import { getDb } from './db';

export interface MigrationResult {
  success: boolean;
  migrated: number;
  errors: string[];
}

/**
 * Migrate Luna profiles from file store to SQL store
 */
export async function migrateLunaFileToSql(): Promise<MigrationResult> {
  const fileStore = new FileLunaPreferencesStore();
  const sqlStore = new SqlLunaPreferencesStore(getDb());
  const errors: string[] = [];
  let migrated = 0;

  try {
    // Get all user IDs from file store by reading the data structure
    // We'll need to iterate through all users
    const fileData = await (fileStore as any).getData();
    const users = Object.keys(fileData);

    for (const userId of users) {
      try {
        // Get all modes for this user
        const modes = await fileStore.listModes(userId);
        
        for (const modeId of modes) {
          const profile = await fileStore.getProfile(userId, modeId);
          if (profile) {
            await sqlStore.saveProfile(profile);
            migrated++;
          }
        }

        // Migrate active mode
        const activeMode = await fileStore.getActiveMode(userId);
        await sqlStore.setActiveMode(userId, activeMode);
      } catch (error: any) {
        errors.push(`Failed to migrate user ${userId}: ${error.message}`);
      }
    }

    return {
      success: errors.length === 0,
      migrated,
      errors,
    };
  } catch (error: any) {
    return {
      success: false,
      migrated,
      errors: [...errors, `Migration failed: ${error.message}`],
    };
  }
}

/**
 * Migrate Te reflections from file store to SQL store
 */
export async function migrateTeFileToSql(): Promise<MigrationResult> {
  const fileStore = new FileTeReflectionStore();
  const sqlStore = new SqlTeReflectionStore(getDb());
  const errors: string[] = [];
  let migrated = 0;

  try {
    // Get all user IDs from file store
    const fileData = await (fileStore as any).getData();
    const userIds = Object.keys(fileData.userSessions || {});

    for (const userId of userIds) {
      try {
        const reflections = await fileStore.getReflections(userId, 10000); // Get all
        
        for (const reflection of reflections) {
          // Find the session ID for this reflection
          const sessionIds = fileData.userSessions[userId] || [];
          let sessionId: string | undefined;
          
          // Try to find which session this reflection belongs to
          for (const sid of sessionIds) {
            const sessionReflections = fileData.sessions[sid] || [];
            if (sessionReflections.some((r: { id: string }) => r.id === reflection.id)) {
              sessionId = sid;
              break;
            }
          }

          await sqlStore.saveReflection(reflection, userId, sessionId);
          migrated++;
        }
      } catch (error: any) {
        errors.push(`Failed to migrate reflections for user ${userId}: ${error.message}`);
      }
    }

    return {
      success: errors.length === 0,
      migrated,
      errors,
    };
  } catch (error: any) {
    return {
      success: false,
      migrated,
      errors: [...errors, `Migration failed: ${error.message}`],
    };
  }
}

/**
 * Migrate all data from file stores to SQL stores
 */
export async function migrateAllFileToSql(): Promise<{
  luna: MigrationResult;
  te: MigrationResult;
}> {
  const [luna, te] = await Promise.all([
    migrateLunaFileToSql(),
    migrateTeFileToSql(),
  ]);

  return { luna, te };
}

/**
 * Export data from a store to JSON (for backup)
 */
export async function exportLunaData(store: LunaPreferencesStore): Promise<any> {
  // This is a simplified export - in practice you'd need to know all user IDs
  // For now, we'll export from file store directly
  const fileStore = new FileLunaPreferencesStore();
  return await (fileStore as any).getData();
}

export async function exportTeData(store: TeReflectionStore): Promise<any> {
  const fileStore = new FileTeReflectionStore();
  return await (fileStore as any).getData();
}

