/**
 * Store Factories
 *
 * Default store factories that choose between memory, file-backed, and database-backed stores
 * based on persistence mode configuration.
 */
import type { LunaPreferencesStore } from '@orb-system/core-luna';
import type { TeReflectionStore } from '@orb-system/core-te';
/**
 * Create default Luna preferences store based on persistence mode
 */
export declare function createDefaultLunaStore(): LunaPreferencesStore;
/**
 * Create default Te reflection store based on persistence mode
 */
export declare function createDefaultTeStore(): TeReflectionStore;
//# sourceMappingURL=storeFactories.d.ts.map