/**
 * Store Factories
 *
 * Default store factories that choose between memory, file-backed, and database-backed stores
 * based on persistence mode configuration.
 */
import { getPersistenceMode } from './config';
import { isSupabaseConfigured } from './supabase';
/**
 * Create default Luna preferences store based on persistence mode
 */
export function createDefaultLunaStore() {
    const mode = getPersistenceMode();
    if (mode === 'memory') {
        // Lazy import to avoid circular dependencies
        const { InMemoryLunaPreferencesStore } = require('@orb-system/core-luna');
        return new InMemoryLunaPreferencesStore();
    }
    if (mode === 'database') {
        // Check if Supabase is configured, use it if available
        if (isSupabaseConfigured()) {
            const { SupabaseLunaPreferencesStore } = require('@orb-system/core-luna');
            return new SupabaseLunaPreferencesStore();
        }
        // Fall back to SQLite
        const { DbLunaPreferencesStore } = require('@orb-system/core-luna');
        return new DbLunaPreferencesStore();
    }
    // File mode - use file-backed store
    const { FileLunaPreferencesStore } = require('@orb-system/core-luna');
    return new FileLunaPreferencesStore();
}
/**
 * Create default Te reflection store based on persistence mode
 */
export function createDefaultTeStore() {
    const mode = getPersistenceMode();
    if (mode === 'memory') {
        // Lazy import to avoid circular dependencies
        const { InMemoryTeReflectionStore } = require('@orb-system/core-te');
        return new InMemoryTeReflectionStore();
    }
    if (mode === 'database') {
        // Check if Supabase is configured, use it if available
        if (isSupabaseConfigured()) {
            const { SupabaseTeReflectionStore } = require('@orb-system/core-te');
            return new SupabaseTeReflectionStore();
        }
        // Fall back to SQLite
        const { DbTeReflectionStore } = require('@orb-system/core-te');
        return new DbTeReflectionStore();
    }
    // File mode - use file-backed store
    const { FileTeReflectionStore } = require('@orb-system/core-te');
    return new FileTeReflectionStore();
}
//# sourceMappingURL=storeFactories.js.map