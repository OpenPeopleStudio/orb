# Persistence Implementation Guide

This document describes the file-backed persistence system for Luna and Te stores, along with utilities for migration, compaction, and validation.

## Overview

The Orb system now supports multiple persistence backends:
- **Memory**: In-memory stores (for tests and ephemeral sessions)
- **File**: JSON file-based stores (for local development)
- **SQL**: SQLite/Postgres stores (for production)

## Store Types

### Luna Stores

- `InMemoryLunaPreferencesStore` - In-memory storage
- `FileLunaPreferencesStore` - File-based storage (`.orb-data/luna/profiles.json`)
- `SqlLunaPreferencesStore` - SQLite/Postgres storage

### Te Stores

- `InMemoryTeReflectionStore` - In-memory storage
- `FileTeReflectionStore` - File-based storage (`.orb-data/te/reflections.json`)
- `SqlTeReflectionStore` - SQLite/Postgres storage

## Usage

### Automatic Store Selection

Use the factory functions to automatically select the appropriate store based on configuration:

```typescript
import { createDefaultLunaStore, createDefaultTeStore } from '@orb-system/core-orb';

const lunaStore = createDefaultLunaStore();
const teStore = createDefaultTeStore();
```

### Persistence Mode Configuration

Set the persistence mode via environment variable:

```bash
# Use file-backed stores (default in non-test environments)
ORB_PERSISTENCE=file

# Use in-memory stores (default in test environments)
ORB_PERSISTENCE=memory
```

## Data Migration

### Migrate from File to SQL

```typescript
import { migrateAllFileToSql } from '@orb-system/core-orb';

const result = await migrateAllFileToSql();
console.log(`Migrated ${result.luna.migrated} Luna profiles`);
console.log(`Migrated ${result.te.migrated} Te reflections`);
```

### Individual Migrations

```typescript
import { migrateLunaFileToSql, migrateTeFileToSql } from '@orb-system/core-orb';

// Migrate Luna profiles only
const lunaResult = await migrateLunaFileToSql();

// Migrate Te reflections only
const teResult = await migrateTeFileToSql();
```

## Compaction and Cleanup

### Compact Luna Profiles

```typescript
import { compactLunaProfiles } from '@orb-system/core-orb';

const stats = await compactLunaProfiles();
console.log(`Removed ${stats.removed} invalid profiles`);
console.log(`Size: ${stats.beforeSize} -> ${stats.afterSize} bytes`);
```

### Compact Te Reflections

```typescript
import { compactTeReflections } from '@orb-system/core-orb';

const stats = await compactTeReflections({
  maxAgeDays: 90,              // Remove reflections older than 90 days
  maxReflectionsPerSession: 1000  // Keep only 1000 most recent per session
});
```

### Storage Statistics

```typescript
import { getStorageStats } from '@orb-system/core-orb';

const stats = await getStorageStats();
console.log(`Luna: ${stats.luna.users} users, ${stats.luna.profiles} profiles`);
console.log(`Te: ${stats.te.sessions} sessions, ${stats.te.reflections} reflections`);
```

### Cleanup Orphaned Files

```typescript
import { cleanupOrphanedFiles } from '@orb-system/core-orb';

const cleaned = await cleanupOrphanedFiles();
console.log(`Cleaned up ${cleaned.length} orphaned files`);
```

## Validation

### Validate Luna Profile

```typescript
import { validateLunaProfile, sanitizeLunaProfile } from '@orb-system/core-orb';

const result = validateLunaProfile(profile);
if (!result.valid) {
  console.error('Validation errors:', result.errors);
  // Try to sanitize
  const sanitized = sanitizeLunaProfile(profile);
}
```

### Validate Te Reflection

```typescript
import { validateTeReflection, sanitizeTeReflection } from '@orb-system/core-orb';

const result = validateTeReflection(reflection);
if (!result.valid) {
  console.error('Validation errors:', result.errors);
  // Try to sanitize
  const sanitized = sanitizeTeReflection(reflection);
}
```

### Validate File Data Structures

```typescript
import { validateLunaFileData, validateTeFileData } from '@orb-system/core-orb';

// Validate entire Luna file
const lunaResult = validateLunaFileData(fileData);

// Validate entire Te file
const teResult = validateTeFileData(fileData);
```

## Data Layout

### Luna Profiles

File: `.orb-data/luna/profiles.json`

```json
{
  "<userId>": {
    "activeMode": "<modeId>",
    "profiles": {
      "<modeId>": {
        "userId": "...",
        "modeId": "...",
        "preferences": ["..."],
        "constraints": ["..."],
        "updatedAt": "2024-01-01T00:00:00.000Z"
      }
    }
  }
}
```

### Te Reflections

File: `.orb-data/te/reflections.json`

```json
{
  "sessions": {
    "<sessionId>": [
      {
        "id": "...",
        "input": "...",
        "output": "...",
        "tags": ["..."],
        "notes": "...",
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ]
  },
  "userSessions": {
    "<userId>": ["<sessionId1>", "<sessionId2>"]
  }
}
```

## Implementation Details

### File Store Utility

The `fileStore.ts` module provides:
- `readJson<T>(path, defaultValue)` - Read JSON with default fallback
- `writeJson<T>(path, value)` - Write JSON with directory creation
- `getDataDirectory()` - Get base data directory (`.orb-data`)

### Store Factories

The `storeFactories.ts` module provides:
- `createDefaultLunaStore()` - Creates Luna store based on persistence mode
- `createDefaultTeStore()` - Creates Te store based on persistence mode and DB availability

### Migration Utilities

The `migration.ts` module provides:
- `migrateLunaFileToSql()` - Migrate Luna profiles from file to SQL
- `migrateTeFileToSql()` - Migrate Te reflections from file to SQL
- `migrateAllFileToSql()` - Migrate all data
- `exportLunaData()` / `exportTeData()` - Export data for backup

### Compaction Utilities

The `compaction.ts` module provides:
- `compactLunaProfiles()` - Clean up Luna profile file
- `compactTeReflections(options)` - Clean up Te reflections file
- `getStorageStats()` - Get storage statistics
- `cleanupOrphanedFiles()` - Remove orphaned files

### Validation Utilities

The `validation.ts` module provides:
- `validateLunaProfile()` - Validate Luna profile structure
- `validateTeReflection()` - Validate Te reflection structure
- `validateLunaFileData()` - Validate entire Luna file
- `validateTeFileData()` - Validate entire Te file
- `sanitizeLunaProfile()` - Fix common Luna profile issues
- `sanitizeTeReflection()` - Fix common Te reflection issues

## Best Practices

1. **Use factory functions** - Always use `createDefaultLunaStore()` and `createDefaultTeStore()` instead of instantiating stores directly
2. **Run compaction periodically** - Use `compactTeReflections()` to prevent file growth
3. **Validate before migration** - Validate data before migrating to catch issues early
4. **Backup before migration** - Use export functions to create backups before migration
5. **Monitor storage stats** - Use `getStorageStats()` to monitor file sizes

## Future Enhancements

- [ ] Add compression for file stores
- [ ] Add encryption for sensitive data
- [ ] Add incremental migration support
- [ ] Add migration rollback capabilities
- [ ] Add automated compaction scheduling
- [ ] Add data versioning and schema migration

