/**
 * File Store Utility
 *
 * Shared file-based persistence helper for Orb system.
 * Provides simple JSON read/write operations with automatic directory creation.
 */
/**
 * Base data directory for Orb persistence
 * Defaults to `.orb-data` relative to process cwd
 */
export declare function getDataDirectory(): string;
/**
 * Read JSON from a file, returning defaultValue if file doesn't exist or is invalid
 */
export declare function readJson<T>(relativePath: string, defaultValue: T): Promise<T>;
/**
 * Write JSON to a file, creating directories as needed
 */
export declare function writeJson<T>(relativePath: string, value: T): Promise<void>;
//# sourceMappingURL=fileStore.d.ts.map