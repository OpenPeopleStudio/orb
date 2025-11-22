#!/usr/bin/env ts-node
/**
 * Migration Script: SQLite to Supabase
 * 
 * Usage:
 *   npm run migrate-to-supabase [--dry-run]
 * 
 * Or directly:
 *   ts-node scripts/migrate-to-supabase.ts [--dry-run]
 */

import { migrateSqliteToSupabase, verifySupabaseMigration } from '../packages/core-orb/src/migrateToSupabase';

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run') || args.includes('-d');

  if (dryRun) {
    console.log('🔍 Running migration in DRY-RUN mode (no data will be migrated)...\n');
  } else {
    console.log('🚀 Starting migration from SQLite to Supabase...\n');
  }

  try {
    const result = await migrateSqliteToSupabase(dryRun);

    console.log('\n📊 Migration Results:');
    console.log(`  ✅ Luna Profiles: ${result.lunaProfilesMigrated}`);
    console.log(`  ✅ Luna Active Modes: ${result.lunaActiveModesMigrated}`);
    console.log(`  ✅ Te Reflections: ${result.teReflectionsMigrated}`);
    console.log(`  ✅ Mav Actions: ${result.mavActionsMigrated}`);

    if (result.errors.length > 0) {
      console.log(`\n⚠️  Errors (${result.errors.length}):`);
      result.errors.forEach((error, index) => {
        console.log(`  ${index + 1}. ${error}`);
      });
    }

    if (result.success) {
      console.log('\n✅ Migration completed successfully!');
      
      if (!dryRun) {
        console.log('\n🔍 Verifying migration...');
        const verification = await verifySupabaseMigration();
        
        console.log('\n📊 Verification Results:');
        console.log(`  Luna Profiles: ${verification.lunaProfilesMatch ? '✅' : '❌'} (SQLite: ${verification.sqliteCounts.lunaProfiles}, Supabase: ${verification.supabaseCounts.lunaProfiles})`);
        console.log(`  Luna Active Modes: ${verification.lunaActiveModesMatch ? '✅' : '❌'} (SQLite: ${verification.sqliteCounts.lunaActiveModes}, Supabase: ${verification.supabaseCounts.lunaActiveModes})`);
        console.log(`  Te Reflections: ${verification.teReflectionsMatch ? '✅' : '❌'} (SQLite: ${verification.sqliteCounts.teReflections}, Supabase: ${verification.supabaseCounts.teReflections})`);
        console.log(`  Mav Actions: ${verification.mavActionsMatch ? '✅' : '❌'} (SQLite: ${verification.sqliteCounts.mavActions}, Supabase: ${verification.supabaseCounts.mavActions})`);

        if (verification.errors.length > 0) {
          console.log(`\n⚠️  Verification Errors:`);
          verification.errors.forEach((error, index) => {
            console.log(`  ${index + 1}. ${error}`);
          });
        }
      }
    } else {
      console.log('\n❌ Migration completed with errors. Please review the errors above.');
      process.exit(1);
    }
  } catch (error: any) {
    console.error('\n❌ Migration failed:', error.message);
    console.error(error);
    process.exit(1);
  }
}

main();

