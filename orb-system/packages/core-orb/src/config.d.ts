/**
 * Configuration Loader
 *
 * Loads global configuration from environment variables, config files, etc.
 */
export type PersistenceMode = 'memory' | 'file' | 'database';
export interface OrbConfig {
    openaiApiKey?: string;
    supabaseUrl?: string;
    supabaseServiceRoleKey?: string;
    databaseUrl?: string;
    isPersistent?: boolean;
    persistenceMode?: PersistenceMode;
    forgeNodeUrl?: string;
    forgeNodePort?: number;
    forgeNodeHost?: string;
    nodeEnv?: 'development' | 'production' | 'test';
    deviceId?: string;
    deviceLabel?: string;
    enableReflection?: boolean;
    enableMemory?: boolean;
    enableActions?: boolean;
}
/**
 * Load configuration from environment variables
 */
export declare function loadConfigFromEnv(): OrbConfig;
/**
 * Load configuration from a JSON file
 */
export declare function loadConfigFromFile(filePath: string): Promise<OrbConfig>;
export declare function getConfig(override?: Partial<OrbConfig>): OrbConfig;
/**
 * Set configuration (useful for testing)
 */
export declare function setConfig(config: OrbConfig): void;
/**
 * Reset configuration (useful for testing)
 */
export declare function resetConfig(): void;
/**
 * Get persistence mode from config
 * Defaults to 'database' if DATABASE_URL is set, 'file' otherwise, 'memory' in test
 */
export declare function getPersistenceMode(): PersistenceMode;
//# sourceMappingURL=config.d.ts.map