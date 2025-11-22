/**
 * SQLite to Supabase Migration Utility
 * 
 * Migrates all data from SQLite database to Supabase PostgreSQL.
 */

import { getDb } from './db';
import { getSupabaseClient, isSupabaseConfigured } from './supabase';
import { SupabaseLunaPreferencesStore } from '@orb-system/core-luna';
import { SupabaseTeReflectionStore } from '@orb-system/core-te';

export interface SupabaseMigrationResult {
  success: boolean;
  lunaProfilesMigrated: number;
  lunaActiveModesMigrated: number;
  teReflectionsMigrated: number;
  mavActionsMigrated: number;
  errors: string[];
}

/**
 * Migrate Luna profiles from SQLite to Supabase
 */
async function migrateLunaProfiles(
  sqliteDb: any,
  supabaseStore: SupabaseLunaPreferencesStore
): Promise<{ count: number; errors: string[] }> {
  const errors: string[] = [];
  let count = 0;

  try {
    const stmt = sqliteDb.prepare(`
      SELECT user_id, mode_id, preferences, constraints, updated_at
      FROM luna_profiles
    `);

    const rows = stmt.all() as Array<{
      user_id: string;
      mode_id: string;
      preferences: string;
      constraints: string;
      updated_at: string;
    }>;

    for (const row of rows) {
      try {
        await supabaseStore.saveProfile({
          userId: row.user_id,
          modeId: row.mode_id,
          preferences: JSON.parse(row.preferences),
          constraints: JSON.parse(row.constraints),
          updatedAt: row.updated_at,
        });
        count++;
      } catch (error: any) {
        errors.push(`Failed to migrate profile ${row.user_id}/${row.mode_id}: ${error.message}`);
      }
    }
  } catch (error: any) {
    errors.push(`Failed to read Luna profiles: ${error.message}`);
  }

  return { count, errors };
}

/**
 * Migrate Luna active modes from SQLite to Supabase
 */
async function migrateLunaActiveModes(
  sqliteDb: any,
  supabaseStore: SupabaseLunaPreferencesStore
): Promise<{ count: number; errors: string[] }> {
  const errors: string[] = [];
  let count = 0;

  try {
    const stmt = sqliteDb.prepare(`
      SELECT user_id, mode_id
      FROM luna_active_modes
    `);

    const rows = stmt.all() as Array<{
      user_id: string;
      mode_id: string;
    }>;

    for (const row of rows) {
      try {
        await supabaseStore.setActiveMode(row.user_id, row.mode_id);
        count++;
      } catch (error: any) {
        errors.push(`Failed to migrate active mode for ${row.user_id}: ${error.message}`);
      }
    }
  } catch (error: any) {
    errors.push(`Failed to read Luna active modes: ${error.message}`);
  }

  return { count, errors };
}

/**
 * Migrate Te reflections from SQLite to Supabase
 */
async function migrateTeReflections(
  sqliteDb: any,
  supabaseStore: SupabaseTeReflectionStore
): Promise<{ count: number; errors: string[] }> {
  const errors: string[] = [];
  let count = 0;

  try {
    const stmt = sqliteDb.prepare(`
      SELECT id, user_id, session_id, input, output, tags, notes, created_at
      FROM te_reflections
      ORDER BY created_at ASC
    `);

    const rows = stmt.all() as Array<{
      id: string;
      user_id: string;
      session_id: string | null;
      input: string;
      output: string;
      tags: string;
      notes: string | null;
      created_at: string;
    }>;

    for (const row of rows) {
      try {
        await supabaseStore.saveReflection(
          {
            id: row.id,
            input: row.input,
            output: row.output,
            tags: JSON.parse(row.tags),
            notes: row.notes || undefined,
            createdAt: new Date(row.created_at),
          },
          row.user_id,
          row.session_id || undefined
        );
        count++;
      } catch (error: any) {
        errors.push(`Failed to migrate reflection ${row.id}: ${error.message}`);
      }
    }
  } catch (error: any) {
    errors.push(`Failed to read Te reflections: ${error.message}`);
  }

  return { count, errors };
}

/**
 * Migrate Mav actions from SQLite to Supabase
 */
async function migrateMavActions(
  sqliteDb: any,
  supabase: any
): Promise<{ count: number; errors: string[] }> {
  const errors: string[] = [];
  let count = 0;

  try {
    const stmt = sqliteDb.prepare(`
      SELECT id, user_id, session_id, task_id, action_id, tool_id, kind, params, status, output, error, created_at
      FROM mav_actions
      ORDER BY created_at ASC
    `);

    const rows = stmt.all() as Array<{
      id: string;
      user_id: string;
      session_id: string | null;
      task_id: string;
      action_id: string;
      tool_id: string | null;
      kind: string;
      params: string | null;
      status: string;
      output: string | null;
      error: string | null;
      created_at: string;
    }>;

    // Batch insert for better performance
    const batchSize = 100;
    for (let i = 0; i < rows.length; i += batchSize) {
      const batch = rows.slice(i, i + batchSize);
      const batchData = batch.map(row => ({
        id: row.id,
        user_id: row.user_id,
        session_id: row.session_id || null,
        task_id: row.task_id,
        action_id: row.action_id,
        tool_id: row.tool_id || null,
        kind: row.kind,
        params: row.params ? JSON.parse(row.params) : null,
        status: row.status,
        output: row.output || null,
        error: row.error || null,
        created_at: row.created_at,
      }));

      const { error } = await supabase
        .from('mav_actions')
        .insert(batchData);

      if (error) {
        // If batch fails, try individual inserts
        for (const row of batch) {
          try {
            const { error: insertError } = await supabase
              .from('mav_actions')
              .insert({
                id: row.id,
                user_id: row.user_id,
                session_id: row.session_id || null,
                task_id: row.task_id,
                action_id: row.action_id,
                tool_id: row.tool_id || null,
                kind: row.kind,
                params: row.params ? JSON.parse(row.params) : null,
                status: row.status,
                output: row.output || null,
                error: row.error || null,
                created_at: row.created_at,
              });

            if (insertError) {
              errors.push(`Failed to migrate action ${row.id}: ${insertError.message}`);
            } else {
              count++;
            }
          } catch (error: any) {
            errors.push(`Failed to migrate action ${row.id}: ${error.message}`);
          }
        }
      } else {
        count += batch.length;
      }
    }
  } catch (error: any) {
    errors.push(`Failed to read Mav actions: ${error.message}`);
  }

  return { count, errors };
}

/**
 * Migrate all data from SQLite to Supabase
 * 
 * @param dryRun If true, only validate without actually migrating
 * @returns Migration result with counts and errors
 */
export async function migrateSqliteToSupabase(dryRun: boolean = false): Promise<SupabaseMigrationResult> {
  if (!isSupabaseConfigured()) {
    throw new Error(
      'Supabase not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables.'
    );
  }

  const sqliteDb = getDb();
  const supabase = getSupabaseClient();
  const supabaseLunaStore = new SupabaseLunaPreferencesStore(supabase);
  const supabaseTeStore = new SupabaseTeReflectionStore(supabase);

  const errors: string[] = [];
  let lunaProfilesMigrated = 0;
  let lunaActiveModesMigrated = 0;
  let teReflectionsMigrated = 0;
  let mavActionsMigrated = 0;

  if (dryRun) {
    // Just count items in SQLite
    try {
      const lunaProfilesStmt = sqliteDb.prepare('SELECT COUNT(*) as count FROM luna_profiles');
      const lunaActiveModesStmt = sqliteDb.prepare('SELECT COUNT(*) as count FROM luna_active_modes');
      const teReflectionsStmt = sqliteDb.prepare('SELECT COUNT(*) as count FROM te_reflections');
      const mavActionsStmt = sqliteDb.prepare('SELECT COUNT(*) as count FROM mav_actions');

      lunaProfilesMigrated = (lunaProfilesStmt.get() as any).count;
      lunaActiveModesMigrated = (lunaActiveModesStmt.get() as any).count;
      teReflectionsMigrated = (teReflectionsStmt.get() as any).count;
      mavActionsMigrated = (mavActionsStmt.get() as any).count;

      return {
        success: true,
        lunaProfilesMigrated,
        lunaActiveModesMigrated,
        teReflectionsMigrated,
        mavActionsMigrated,
        errors: [],
      };
    } catch (error: any) {
      return {
        success: false,
        lunaProfilesMigrated: 0,
        lunaActiveModesMigrated: 0,
        teReflectionsMigrated: 0,
        mavActionsMigrated: 0,
        errors: [`Dry run failed: ${error.message}`],
      };
    }
  }

  // Perform actual migration
  try {
    console.log('Starting migration from SQLite to Supabase...');

    // Migrate Luna profiles
    console.log('Migrating Luna profiles...');
    const lunaProfilesResult = await migrateLunaProfiles(sqliteDb, supabaseLunaStore);
    lunaProfilesMigrated = lunaProfilesResult.count;
    errors.push(...lunaProfilesResult.errors);
    console.log(`Migrated ${lunaProfilesMigrated} Luna profiles`);

    // Migrate Luna active modes
    console.log('Migrating Luna active modes...');
    const lunaActiveModesResult = await migrateLunaActiveModes(sqliteDb, supabaseLunaStore);
    lunaActiveModesMigrated = lunaActiveModesResult.count;
    errors.push(...lunaActiveModesResult.errors);
    console.log(`Migrated ${lunaActiveModesMigrated} Luna active modes`);

    // Migrate Te reflections
    console.log('Migrating Te reflections...');
    const teReflectionsResult = await migrateTeReflections(sqliteDb, supabaseTeStore);
    teReflectionsMigrated = teReflectionsResult.count;
    errors.push(...teReflectionsResult.errors);
    console.log(`Migrated ${teReflectionsMigrated} Te reflections`);

    // Migrate Mav actions
    console.log('Migrating Mav actions...');
    const mavActionsResult = await migrateMavActions(sqliteDb, supabase);
    mavActionsMigrated = mavActionsResult.count;
    errors.push(...mavActionsResult.errors);
    console.log(`Migrated ${mavActionsMigrated} Mav actions`);

    console.log('Migration completed!');

    return {
      success: errors.length === 0,
      lunaProfilesMigrated,
      lunaActiveModesMigrated,
      teReflectionsMigrated,
      mavActionsMigrated,
      errors,
    };
  } catch (error: any) {
    errors.push(`Migration failed: ${error.message}`);
    return {
      success: false,
      lunaProfilesMigrated,
      lunaActiveModesMigrated,
      teReflectionsMigrated,
      mavActionsMigrated,
      errors,
    };
  }
}

/**
 * Verify migration by comparing counts between SQLite and Supabase
 */
export async function verifySupabaseMigration(): Promise<{
  lunaProfilesMatch: boolean;
  lunaActiveModesMatch: boolean;
  teReflectionsMatch: boolean;
  mavActionsMatch: boolean;
  sqliteCounts: {
    lunaProfiles: number;
    lunaActiveModes: number;
    teReflections: number;
    mavActions: number;
  };
  supabaseCounts: {
    lunaProfiles: number;
    lunaActiveModes: number;
    teReflections: number;
    mavActions: number;
  };
  errors: string[];
}> {
  const errors: string[] = [];
  const sqliteDb = getDb();
  const supabase = getSupabaseClient();

  const sqliteCounts = {
    lunaProfiles: 0,
    lunaActiveModes: 0,
    teReflections: 0,
    mavActions: 0,
  };

  const supabaseCounts = {
    lunaProfiles: 0,
    lunaActiveModes: 0,
    teReflections: 0,
    mavActions: 0,
  };

  try {
    // Count SQLite items
    sqliteCounts.lunaProfiles = (sqliteDb.prepare('SELECT COUNT(*) as count FROM luna_profiles').get() as any).count;
    sqliteCounts.lunaActiveModes = (sqliteDb.prepare('SELECT COUNT(*) as count FROM luna_active_modes').get() as any).count;
    sqliteCounts.teReflections = (sqliteDb.prepare('SELECT COUNT(*) as count FROM te_reflections').get() as any).count;
    sqliteCounts.mavActions = (sqliteDb.prepare('SELECT COUNT(*) as count FROM mav_actions').get() as any).count;

    // Count Supabase items
    const { count: lunaProfilesCount } = await supabase
      .from('luna_profiles')
      .select('*', { count: 'exact', head: true });
    supabaseCounts.lunaProfiles = lunaProfilesCount || 0;

    const { count: lunaActiveModesCount } = await supabase
      .from('luna_active_modes')
      .select('*', { count: 'exact', head: true });
    supabaseCounts.lunaActiveModes = lunaActiveModesCount || 0;

    const { count: teReflectionsCount } = await supabase
      .from('te_reflections')
      .select('*', { count: 'exact', head: true });
    supabaseCounts.teReflections = teReflectionsCount || 0;

    const { count: mavActionsCount } = await supabase
      .from('mav_actions')
      .select('*', { count: 'exact', head: true });
    supabaseCounts.mavActions = mavActionsCount || 0;
  } catch (error: any) {
    errors.push(`Verification failed: ${error.message}`);
  }

  return {
    lunaProfilesMatch: sqliteCounts.lunaProfiles === supabaseCounts.lunaProfiles,
    lunaActiveModesMatch: sqliteCounts.lunaActiveModes === supabaseCounts.lunaActiveModes,
    teReflectionsMatch: sqliteCounts.teReflections === supabaseCounts.teReflections,
    mavActionsMatch: sqliteCounts.mavActions === supabaseCounts.mavActions,
    sqliteCounts,
    supabaseCounts,
    errors,
  };
}

