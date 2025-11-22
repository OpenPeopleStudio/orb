/**
 * Compaction and Cleanup Utilities
 * 
 * Utilities for cleaning up and compacting file-based stores
 */

import { readJson, writeJson, getDataDirectory } from './fileStore';
import path from 'node:path';
import { promises as fs } from 'node:fs';

export interface CompactionStats {
  beforeSize: number;
  afterSize: number;
  removed: number;
  errors: string[];
}

/**
 * Compact Luna profiles file by removing duplicate entries and cleaning up
 */
export async function compactLunaProfiles(): Promise<CompactionStats> {
  const filePath = 'luna/profiles.json';
  const errors: string[] = [];
  let removed = 0;

  try {
    const data = await readJson<any>(filePath, {});
    const beforeSize = JSON.stringify(data).length;

    // Clean up each user's data
    for (const userId in data) {
      const userData = data[userId];
      
      // Ensure structure is valid
      if (!userData.profiles) {
        userData.profiles = {};
      }
      if (!userData.activeMode) {
        userData.activeMode = 'default';
      }

      // Remove profiles with invalid structure
      for (const modeId in userData.profiles) {
        const profile = userData.profiles[modeId];
        if (!profile.userId || !profile.modeId || !profile.preferences || !profile.constraints) {
          delete userData.profiles[modeId];
          removed++;
        }
      }

      // Ensure active mode exists in profiles
      if (userData.activeMode && !userData.profiles[userData.activeMode]) {
        // Keep active mode but it will be created on next access
      }
    }

    // Write back compacted data
    await writeJson(filePath, data);
    const afterSize = JSON.stringify(data).length;

    return {
      beforeSize,
      afterSize,
      removed,
      errors,
    };
  } catch (error: any) {
    return {
      beforeSize: 0,
      afterSize: 0,
      removed: 0,
      errors: [`Compaction failed: ${error.message}`],
    };
  }
}

/**
 * Compact Te reflections file by removing old entries and cleaning up
 */
export async function compactTeReflections(options: {
  maxAgeDays?: number;
  maxReflectionsPerSession?: number;
} = {}): Promise<CompactionStats> {
  const filePath = 'te/reflections.json';
  const errors: string[] = [];
  let removed = 0;
  const { maxAgeDays = 90, maxReflectionsPerSession = 1000 } = options;

  try {
    const data = await readJson<any>(filePath, { sessions: {}, userSessions: {} });
    const beforeSize = JSON.stringify(data).length;

    const now = Date.now();
    const maxAgeMs = maxAgeDays * 24 * 60 * 60 * 1000;

    // Clean up sessions
    for (const sessionId in data.sessions) {
      let reflections = data.sessions[sessionId] || [];
      
      // Remove old reflections
      const beforeCount = reflections.length;
      reflections = reflections.filter((r: any) => {
        const createdAt = new Date(r.createdAt).getTime();
        return now - createdAt < maxAgeMs;
      });
      removed += beforeCount - reflections.length;

      // Limit reflections per session
      if (reflections.length > maxReflectionsPerSession) {
        // Keep most recent
        reflections.sort((a: any, b: any) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        removed += reflections.length - maxReflectionsPerSession;
        reflections = reflections.slice(0, maxReflectionsPerSession);
      }

      // Sort back to chronological order (most recent last)
      reflections.sort((a: any, b: any) => 
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );

      data.sessions[sessionId] = reflections;
    }

    // Clean up user sessions index
    for (const userId in data.userSessions) {
      const sessionIds = data.userSessions[userId] || [];
      data.userSessions[userId] = sessionIds.filter((sid: string) => 
        data.sessions[sid] && data.sessions[sid].length > 0
      );
    }

    // Remove empty sessions
    for (const sessionId in data.sessions) {
      if (!data.sessions[sessionId] || data.sessions[sessionId].length === 0) {
        delete data.sessions[sessionId];
      }
    }

    // Write back compacted data
    await writeJson(filePath, data);
    const afterSize = JSON.stringify(data).length;

    return {
      beforeSize,
      afterSize,
      removed,
      errors,
    };
  } catch (error: any) {
    return {
      beforeSize: 0,
      afterSize: 0,
      removed: 0,
      errors: [`Compaction failed: ${error.message}`],
    };
  }
}

/**
 * Get storage statistics for file stores
 */
export async function getStorageStats(): Promise<{
  luna: { size: number; users: number; profiles: number };
  te: { size: number; sessions: number; reflections: number };
}> {
  const dataDir = getDataDirectory();

  // Luna stats
  const lunaPath = path.join(dataDir, 'luna/profiles.json');
  let lunaSize = 0;
  let lunaUsers = 0;
  let lunaProfiles = 0;
  try {
    const lunaData = await readJson<any>(lunaPath, {});
    lunaSize = JSON.stringify(lunaData).length;
    lunaUsers = Object.keys(lunaData).length;
    for (const userId in lunaData) {
      lunaProfiles += Object.keys(lunaData[userId]?.profiles || {}).length;
    }
  } catch {
    // File doesn't exist or invalid
  }

  // Te stats
  const tePath = path.join(dataDir, 'te/reflections.json');
  let teSize = 0;
  let teSessions = 0;
  let teReflections = 0;
  try {
    const teData = await readJson<any>(tePath, { sessions: {}, userSessions: {} });
    teSize = JSON.stringify(teData).length;
    teSessions = Object.keys(teData.sessions || {}).length;
    for (const sessionId in teData.sessions) {
      teReflections += (teData.sessions[sessionId] || []).length;
    }
  } catch {
    // File doesn't exist or invalid
  }

  return {
    luna: { size: lunaSize, users: lunaUsers, profiles: lunaProfiles },
    te: { size: teSize, sessions: teSessions, reflections: teReflections },
  };
}

/**
 * Clean up orphaned files and directories
 */
export async function cleanupOrphanedFiles(): Promise<string[]> {
  const dataDir = getDataDirectory();
  const cleaned: string[] = [];

  try {
    // Check for files that shouldn't exist
    const entries = await fs.readdir(dataDir, { withFileTypes: true });
    
    for (const entry of entries) {
      const entryPath = path.join(dataDir, entry.name);
      
      // Remove files that aren't in expected locations
      if (entry.isFile() && !entryPath.includes('luna') && !entryPath.includes('te')) {
        await fs.unlink(entryPath);
        cleaned.push(entryPath);
      }
    }
  } catch (error: any) {
    // Ignore errors
  }

  return cleaned;
}

