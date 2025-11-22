# Supabase Migration Guide

This guide explains how to migrate your Orb system data from SQLite to Supabase PostgreSQL.

## Prerequisites

1. **Supabase Project**: Create a Supabase project at https://supabase.com
2. **Environment Variables**: Set the following in your `.env` file:
   ```bash
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```

3. **Install Dependencies**:
   ```bash
   npm install @supabase/supabase-js
   ```

## Step 1: Create Supabase Schema

Run the SQL migration script in your Supabase SQL Editor:

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy and paste the contents of `packages/core-orb/src/supabase-schema.sql`
4. Execute the SQL

This will create the following tables:
- `luna_profiles` - User preferences and profiles
- `luna_active_modes` - Active mode per user
- `te_reflections` - Reflection records
- `mav_actions` - Action logs

## Step 2: Run Migration

### Option A: Using the Migration Script

```bash
# Dry run (validate without migrating)
ts-node scripts/migrate-to-supabase.ts --dry-run

# Actual migration
ts-node scripts/migrate-to-supabase.ts
```

### Option B: Using the API Directly

```typescript
import { migrateSqliteToSupabase, verifySupabaseMigration } from '@orb-system/core-orb';

// Dry run
const dryRunResult = await migrateSqliteToSupabase(true);
console.log(`Would migrate ${dryRunResult.lunaProfilesMigrated} Luna profiles`);

// Actual migration
const result = await migrateSqliteToSupabase(false);
console.log(`Migrated ${result.lunaProfilesMigrated} Luna profiles`);

// Verify migration
const verification = await verifySupabaseMigration();
console.log(`Luna profiles match: ${verification.lunaProfilesMatch}`);
```

## Step 3: Verify Migration

The migration script automatically verifies the migration by comparing counts:

```typescript
import { verifySupabaseMigration } from '@orb-system/core-orb';

const verification = await verifySupabaseMigration();
console.log('Verification:', verification);
```

## Step 4: Update Configuration

Once migration is complete, your system will automatically use Supabase when:
- `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are set
- `ORB_PERSISTENCE=database` (or auto-detected)

The store factories (`createDefaultLunaStore()`, `createDefaultTeStore()`) will automatically select Supabase stores when configured.

## Migration Details

### What Gets Migrated

- **Luna Profiles**: All user profiles and preferences
- **Luna Active Modes**: Active mode settings per user
- **Te Reflections**: All reflection records with user and session associations
- **Mav Actions**: All action logs

### Migration Process

1. Reads all data from SQLite database (`orb.db` by default)
2. Inserts data into Supabase tables in batches
3. Handles duplicate keys gracefully (updates existing records)
4. Provides detailed error reporting for any failures

### Error Handling

- Individual record failures are logged but don't stop the migration
- Batch operations fall back to individual inserts if batch fails
- All errors are collected and reported at the end

## Post-Migration

After successful migration:

1. **Backup SQLite**: Keep your `orb.db` file as a backup
2. **Test Application**: Verify your application works with Supabase
3. **Monitor**: Check Supabase dashboard for data integrity
4. **Optional**: Remove SQLite dependency if no longer needed

## Troubleshooting

### "Supabase not configured" Error

Make sure you've set:
```bash
export SUPABASE_URL=https://your-project.supabase.co
export SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### "Table does not exist" Error

Run the SQL schema migration in Supabase SQL Editor first.

### Row Level Security (RLS) Issues

The schema includes basic RLS policies for service role. If you need custom policies, update them in Supabase dashboard under Authentication > Policies.

### Migration Fails Partially

- Check the error messages for specific records that failed
- Verify your Supabase connection and permissions
- Ensure the schema matches exactly
- Re-run migration (it's idempotent - safe to run multiple times)

## Rollback

If you need to rollback:

1. Your SQLite database (`orb.db`) remains unchanged
2. Simply remove Supabase environment variables
3. System will fall back to SQLite automatically

## Next Steps

- Set up Supabase backups
- Configure Row Level Security policies for production
- Set up monitoring and alerts
- Consider setting up Supabase Edge Functions for advanced features

