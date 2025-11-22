/**
 * Configuration Loader
 * 
 * Loads global configuration from environment variables, config files, etc.
 */

export type PersistenceMode = 'memory' | 'file' | 'database';

export interface OrbConfig {
  // API Keys
  openaiApiKey?: string;
  supabaseUrl?: string;
  supabaseServiceRoleKey?: string;
  
  // Database
  databaseUrl?: string;
  isPersistent?: boolean; // Enable persistent storage (derived from persistenceMode: true for 'file' or 'database', false for 'memory')
  
  // Persistence mode
  persistenceMode?: PersistenceMode;
  
  // Service URLs
  forgeNodeUrl?: string;
  forgeNodePort?: number;
  forgeNodeHost?: string;
  
  // Environment
  nodeEnv?: 'development' | 'production' | 'test';
  
  // Device/Identity
  deviceId?: string;
  deviceLabel?: string;
  
  // Feature flags
  enableReflection?: boolean;
  enableMemory?: boolean;
  enableActions?: boolean;
}

/**
 * Load configuration from environment variables
 */
export function loadConfigFromEnv(): OrbConfig {
  const databaseUrl = process.env.DATABASE_URL;
  const nodeEnv = (process.env.NODE_ENV as 'development' | 'production' | 'test') || 'development';
  
  // Determine persistence mode
  let persistenceMode: PersistenceMode = 'file';
  if (process.env.ORB_PERSISTENCE) {
    const envMode = process.env.ORB_PERSISTENCE as PersistenceMode;
    if (envMode === 'memory' || envMode === 'file' || envMode === 'database') {
      persistenceMode = envMode;
    }
  } else if (nodeEnv === 'test') {
    persistenceMode = 'memory';
  } else if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    // Default to database if Supabase is configured
    persistenceMode = 'database';
  } else if (databaseUrl) {
    // Default to database if DATABASE_URL is set (SQLite)
    persistenceMode = 'database';
  }
  
  // isPersistent should be true if persistenceMode is 'file' or 'database', false if 'memory'
  // Allow explicit override via ORB_PERSISTENT env var
  const explicitPersistent = process.env.ORB_PERSISTENT !== undefined
    ? process.env.ORB_PERSISTENT !== 'false'
    : undefined;
  const isPersistent = explicitPersistent !== undefined
    ? explicitPersistent
    : persistenceMode !== 'memory';
  
  return {
    openaiApiKey: process.env.OPENAI_API_KEY,
    supabaseUrl: process.env.SUPABASE_URL,
    supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
    databaseUrl,
    isPersistent,
    persistenceMode,
    forgeNodeUrl: process.env.FORGE_NODE_URL,
    forgeNodePort: process.env.FORGE_NODE_PORT ? parseInt(process.env.FORGE_NODE_PORT, 10) : undefined,
    forgeNodeHost: process.env.FORGE_NODE_HOST,
    nodeEnv,
    deviceId: process.env.DEVICE_ID,
    deviceLabel: process.env.DEVICE_LABEL,
    enableReflection: process.env.ENABLE_REFLECTION !== 'false',
    enableMemory: process.env.ENABLE_MEMORY !== 'false',
    enableActions: process.env.ENABLE_ACTIONS !== 'false',
  };
}

/**
 * Load configuration from a JSON file
 */
export async function loadConfigFromFile(filePath: string): Promise<OrbConfig> {
  try {
    const fs = await import('fs/promises');
    const content = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(content) as OrbConfig;
  } catch (error) {
    throw new Error(`Failed to load config from ${filePath}: ${error}`);
  }
}

/**
 * Get configuration (loads from env by default, can override)
 */
let cachedConfig: OrbConfig | null = null;

export function getConfig(override?: Partial<OrbConfig>): OrbConfig {
  if (!cachedConfig) {
    cachedConfig = loadConfigFromEnv();
  }
  
  if (override) {
    return { ...cachedConfig, ...override };
  }
  
  return cachedConfig;
}

/**
 * Set configuration (useful for testing)
 */
export function setConfig(config: OrbConfig): void {
  cachedConfig = config;
}

/**
 * Reset configuration (useful for testing)
 */
export function resetConfig(): void {
  cachedConfig = null;
}

/**
 * Get persistence mode from config
 * Defaults to 'database' if DATABASE_URL is set, 'file' otherwise, 'memory' in test
 */
export function getPersistenceMode(): PersistenceMode {
  const config = getConfig();
  if (config.persistenceMode) {
    return config.persistenceMode;
  }
  if (config.nodeEnv === 'test') {
    return 'memory';
  }
  if (config.databaseUrl) {
    return 'database';
  }
  return 'file';
}

