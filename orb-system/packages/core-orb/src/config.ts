/**
 * Configuration Loader
 * 
 * Loads global configuration from environment variables, config files, etc.
 */

export interface OrbConfig {
  // API Keys
  openaiApiKey?: string;
  supabaseUrl?: string;
  supabaseServiceRoleKey?: string;
  
  // Database
  databaseUrl?: string;
  
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
  return {
    openaiApiKey: process.env.OPENAI_API_KEY,
    supabaseUrl: process.env.SUPABASE_URL,
    supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
    databaseUrl: process.env.DATABASE_URL,
    forgeNodeUrl: process.env.FORGE_NODE_URL,
    forgeNodePort: process.env.FORGE_NODE_PORT ? parseInt(process.env.FORGE_NODE_PORT, 10) : undefined,
    forgeNodeHost: process.env.FORGE_NODE_HOST,
    nodeEnv: (process.env.NODE_ENV as 'development' | 'production' | 'test') || 'development',
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

