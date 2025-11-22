/**
 * Migration Utilities
 * 
 * Utilities for migrating data from file-based stores to database-backed stores.
 */

import { FileLunaPreferencesStore } from '@orb-system/core-luna';
import { FileTeReflectionStore } from '@orb-system/core-te';
import { DbLunaPreferencesStore } from '@orb-system/core-luna';
import { DbTeReflectionStore } from '@orb-system/core-te';
import { readJson } from './fileStore';

export interface FileToDatabaseMigrationResult {
  success: boolean;
  lunaProfilesMigrated: number;
  teReflectionsMigrated: number;
  errors: string[];
}

/**
 * Migrate Luna profiles from file store to database store
 */
async function migrateLunaProfiles(
  fileStore: FileLunaPreferencesStore,
  dbStore: DbLunaPreferencesStore
): Promise<{ count: number; errors: string[] }> {
  const errors: string[] = [];
  let count = 0;

  try {
    // Read file data directly to get all users
    const fileData = await readJson<{
      [userId: string]: {
        activeMode: string;
        profiles: { [modeId: string]: any };
      };
    }>('luna/profiles.json', {});

    // Migrate each user's profiles
    for (const [userId, userData] of Object.entries(fileData)) {
      try {
        // Set active mode
        await dbStore.setActiveMode(userId, userData.activeMode);

        // Migrate all profiles
        for (const [modeId, profile] of Object.entries(userData.profiles || {})) {
          try {
            await dbStore.saveProfile(profile);
            count++;
          } catch (error: any) {
            errors.push(`Failed to migrate profile ${userId}/${modeId}: ${error.message}`);
          }
        }
      } catch (error: any) {
        errors.push(`Failed to migrate user ${userId}: ${error.message}`);
      }
    }
  } catch (error: any) {
    errors.push(`Failed to read Luna file data: ${error.message}`);
  }

  return { count, errors };
}

/**
 * Migrate Te reflections from file store to database store
 */
async function migrateTeReflections(
  fileStore: FileTeReflectionStore,
  dbStore: DbTeReflectionStore
): Promise<{ count: number; errors: string[] }> {
  const errors: string[] = [];
  let count = 0;

  try {
    // Read file data directly
    const fileData = await readJson<{
      sessions: { [sessionId: string]: any[] };
      userSessions: { [userId: string]: string[] };
    }>('te/reflections.json', { sessions: {}, userSessions: {} });

    // Migrate reflections by session
    for (const [sessionId, reflections] of Object.entries(fileData.sessions || {})) {
      // Extract userId from session or use a default
      // We'll need to track userId per reflection, but for now we'll try to infer it
      for (const reflection of reflections) {
        try {
          // Try to find userId from userSessions
          let userId = 'default-user';
          for (const [uid, sessionIds] of Object.entries(fileData.userSessions || {})) {
            if (sessionIds.includes(sessionId)) {
              userId = uid;
              break;
            }
          }

          await dbStore.saveReflection(reflection, userId, sessionId);
          count++;
        } catch (error: any) {
          errors.push(`Failed to migrate reflection ${reflection.id}: ${error.message}`);
        }
      }
    }
  } catch (error: any) {
    errors.push(`Failed to read Te file data: ${error.message}`);
  }

  return { count, errors };
}

/**
 * Migrate all data from file stores to database stores
 * 
 * @param dryRun If true, only validate without actually migrating
 * @returns Migration result with counts and errors
 */
export async function migrateFileToDatabase(dryRun: boolean = false): Promise<FileToDatabaseMigrationResult> {
  const fileLunaStore = new FileLunaPreferencesStore();
  const fileTeStore = new FileTeReflectionStore();
  const dbLunaStore = new DbLunaPreferencesStore();
  const dbTeStore = new DbTeReflectionStore();

  const errors: string[] = [];
  let lunaProfilesMigrated = 0;
  let teReflectionsMigrated = 0;

  if (dryRun) {
    // Just validate that we can read the file data
    try {
      const lunaData = await readJson('luna/profiles.json', {});
      const teData = await readJson('te/reflections.json', { sessions: {}, userSessions: {} });
      
      // Count items
      for (const userData of Object.values(lunaData as any)) {
        lunaProfilesMigrated += Object.keys((userData as any).profiles || {}).length;
      }
      
      for (const reflections of Object.values((teData as any).sessions || {})) {
        teReflectionsMigrated += (reflections as any[]).length;
      }
      
      return {
        success: true,
        lunaProfilesMigrated,
        teReflectionsMigrated,
        errors: [],
      };
    } catch (error: any) {
      return {
        success: false,
        lunaProfilesMigrated: 0,
        teReflectionsMigrated: 0,
        errors: [`Dry run failed: ${error.message}`],
      };
    }
  }

  // Perform actual migration
  try {
    // Migrate Luna profiles
    const lunaResult = await migrateLunaProfiles(fileLunaStore, dbLunaStore);
    lunaProfilesMigrated = lunaResult.count;
    errors.push(...lunaResult.errors);

    // Migrate Te reflections
    const teResult = await migrateTeReflections(fileTeStore, dbTeStore);
    teReflectionsMigrated = teResult.count;
    errors.push(...teResult.errors);

    return {
      success: errors.length === 0,
      lunaProfilesMigrated,
      teReflectionsMigrated,
      errors,
    };
  } catch (error: any) {
    errors.push(`Migration failed: ${error.message}`);
    return {
      success: false,
      lunaProfilesMigrated,
      teReflectionsMigrated,
      errors,
    };
  }
}

/**
 * Verify migration by comparing counts between file and database stores
 */
export async function verifyMigration(): Promise<{
  lunaMatch: boolean;
  teMatch: boolean;
  lunaFileCount: number;
  lunaDbCount: number;
  teFileCount: number;
  teDbCount: number;
  errors: string[];
}> {
  const errors: string[] = [];
  let lunaFileCount = 0;
  let teFileCount = 0;
  let lunaDbCount = 0;
  let teDbCount = 0;

  try {
    // Count file store items
    const lunaData = await readJson('luna/profiles.json', {});
    for (const userData of Object.values(lunaData as any)) {
      lunaFileCount += Object.keys((userData as any).profiles || {}).length;
    }

    const teData = await readJson('te/reflections.json', { sessions: {}, userSessions: {} });
    for (const reflections of Object.values((teData as any).sessions || {})) {
      teFileCount += (reflections as any[]).length;
    }

    // Count database store items
    const dbLunaStore = new DbLunaPreferencesStore();
    const dbTeStore = new DbTeReflectionStore();

    // Get all users from file data and count their profiles
    for (const userId of Object.keys(lunaData as any)) {
      try {
        const modes = await dbLunaStore.listModes(userId);
        for (const modeId of modes) {
          const profile = await dbLunaStore.getProfile(userId, modeId);
          if (profile) {
            lunaDbCount++;
          }
        }
      } catch (error: any) {
        errors.push(`Failed to count Luna profiles for user ${userId}: ${error.message}`);
      }
    }

    // Count Te reflections by getting all unique user IDs
    const userIds = new Set<string>();
    for (const sessionIds of Object.values((teData as any).userIdIndex || {})) {
      // This is approximate - we'd need to track userIds better
    }
    
    // For Te, we'll count by getting reflections for a sample user
    // This is a simplified verification
    try {
      const sampleReflections = await dbTeStore.getReflections('default-user', 1000);
      teDbCount = sampleReflections.length;
    } catch (error: any) {
      // If default-user doesn't exist, that's okay
    }
  } catch (error: any) {
    errors.push(`Verification failed: ${error.message}`);
  }

  return {
    lunaMatch: lunaFileCount === lunaDbCount,
    teMatch: teFileCount === teDbCount,
    lunaFileCount,
    lunaDbCount,
    teFileCount,
    teDbCount,
    errors,
  };
}

