/**
 * File-backed Te Reflection Store
 * 
 * Role: OrbRole.TE (reflection/memory)
 * 
 * File-based persistent storage for Te reflections using JSON files.
 */

import { readJson, writeJson } from '@orb-system/core-orb';
import type { TeReflection } from './reflectionHelpers';
import type { TeReflectionStore } from './sqlStore';

/**
 * File storage layout:
 * .orb-data/te/reflections.json
 * {
 *   "<sessionId>": [ /* TeReflection[], most recent last */ ]
 * }
 * 
 * Note: We store by sessionId, but also maintain a userId index for queries
 */
interface TeFileData {
  sessions: {
    [sessionId: string]: TeReflection[];
  };
  userSessions: {
    [userId: string]: string[]; // sessionIds for this user
  };
}

export class FileTeReflectionStore implements TeReflectionStore {
  private readonly filePath = 'te/reflections.json';

  private async getData(): Promise<TeFileData> {
    return readJson<TeFileData>(this.filePath, {
      sessions: {},
      userSessions: {},
    });
  }

  private async saveData(data: TeFileData): Promise<void> {
    await writeJson(this.filePath, data);
  }

  async saveReflection(
    reflection: TeReflection,
    userId: string,
    sessionId?: string
  ): Promise<void> {
    const data = await this.getData();
    const sid = sessionId || 'default';

    // Initialize session array if needed
    if (!data.sessions[sid]) {
      data.sessions[sid] = [];
    }

    // Append reflection (most recent last)
    data.sessions[sid].push(reflection);

    // Update user sessions index
    if (!data.userSessions[userId]) {
      data.userSessions[userId] = [];
    }
    if (!data.userSessions[userId].includes(sid)) {
      data.userSessions[userId].push(sid);
    }

    await this.saveData(data);
  }

  async getReflections(userId: string, limit: number = 100): Promise<TeReflection[]> {
    const data = await this.getData();
    const sessionIds = data.userSessions[userId] || [];
    
    // Collect all reflections from user's sessions
    const allReflections: TeReflection[] = [];
    for (const sessionId of sessionIds) {
      const sessionReflections = data.sessions[sessionId] || [];
      allReflections.push(...sessionReflections);
    }

    // Sort by createdAt (most recent first) and limit
    allReflections.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    return allReflections.slice(0, limit);
  }

  async getReflectionsBySession(sessionId: string, limit: number = 100): Promise<TeReflection[]> {
    const data = await this.getData();
    const reflections = data.sessions[sessionId] || [];
    
    // Return most recent reflections (they're stored with most recent last)
    return reflections.slice(-limit).reverse();
  }
}

