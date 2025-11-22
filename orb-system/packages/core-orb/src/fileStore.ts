/**
 * File Store Utility
 * 
 * Shared file-based persistence helper for Orb system.
 * Provides simple JSON read/write operations with automatic directory creation.
 */

import { promises as fs } from 'node:fs';
import path from 'node:path';

/**
 * Base data directory for Orb persistence
 * Defaults to `.orb-data` relative to process cwd
 */
export function getDataDirectory(): string {
  const dataDir = process.env.ORB_DATA_DIR || path.join(process.cwd(), '.orb-data');
  return dataDir;
}

/**
 * Read JSON from a file, returning defaultValue if file doesn't exist or is invalid
 */
export async function readJson<T>(relativePath: string, defaultValue: T): Promise<T> {
  const dataDir = getDataDirectory();
  const filePath = path.join(dataDir, relativePath);

  try {
    const content = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(content) as T;
  } catch (error: any) {
    // File doesn't exist or invalid JSON - return default
    if (error.code === 'ENOENT') {
      return defaultValue;
    }
    
    // Invalid JSON - log warning and return default
    console.warn(`[fileStore] Failed to parse JSON from ${filePath}: ${error.message}`);
    return defaultValue;
  }
}

/**
 * Write JSON to a file, creating directories as needed
 */
export async function writeJson<T>(relativePath: string, value: T): Promise<void> {
  const dataDir = getDataDirectory();
  const filePath = path.join(dataDir, relativePath);
  const dirPath = path.dirname(filePath);

  // Ensure directory exists
  await fs.mkdir(dirPath, { recursive: true });

  // Write file
  await fs.writeFile(filePath, JSON.stringify(value, null, 2), 'utf-8');
}

