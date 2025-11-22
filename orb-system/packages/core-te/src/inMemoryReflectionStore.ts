/**
 * In-Memory Te Reflection Store
 * 
 * Role: OrbRole.TE (reflection/memory)
 * 
 * In-memory storage for Te reflections (useful for tests and ephemeral sessions).
 */

import type { TeReflection } from './reflectionHelpers';
import type { TeReflectionStore } from './sqlStore';

export class InMemoryTeReflectionStore implements TeReflectionStore {
  // Map: userId -> Map: sessionId -> TeReflection[]
  private reflections = new Map<string, Map<string, TeReflection[]>>();

  async saveReflection(
    reflection: TeReflection,
    userId: string,
    sessionId?: string
  ): Promise<void> {
    const sid = sessionId || 'default';
    
    // Get or create user's reflection map
    let userReflections = this.reflections.get(userId);
    if (!userReflections) {
      userReflections = new Map<string, TeReflection[]>();
      this.reflections.set(userId, userReflections);
    }

    // Get or create session array
    let sessionReflections = userReflections.get(sid);
    if (!sessionReflections) {
      sessionReflections = [];
      userReflections.set(sid, sessionReflections);
    }

    // Append reflection (most recent last)
    sessionReflections.push(reflection);
  }

  async getReflections(userId: string, limit: number = 100): Promise<TeReflection[]> {
    const userReflections = this.reflections.get(userId);
    if (!userReflections) {
      return [];
    }

    // Collect all reflections from all sessions
    const allReflections: TeReflection[] = [];
    for (const sessionReflections of userReflections.values()) {
      allReflections.push(...sessionReflections);
    }

    // Sort by createdAt (most recent first) and limit
    allReflections.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    return allReflections.slice(0, limit);
  }

  async getReflectionsBySession(sessionId: string, limit: number = 100): Promise<TeReflection[]> {
    // Search across all users for this session
    const allSessionReflections: TeReflection[] = [];
    
    for (const userReflections of this.reflections.values()) {
      const sessionReflections = userReflections.get(sessionId);
      if (sessionReflections) {
        allSessionReflections.push(...sessionReflections);
      }
    }

    // Sort by createdAt (most recent first) and limit
    allSessionReflections.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    return allSessionReflections.slice(0, limit);
  }

  /**
   * Clear all reflections (useful for testing)
   */
  clear(): void {
    this.reflections.clear();
  }

  /**
   * Get total reflection count (useful for testing/debugging)
   */
  getTotalCount(): number {
    let count = 0;
    for (const userReflections of this.reflections.values()) {
      for (const sessionReflections of userReflections.values()) {
        count += sessionReflections.length;
      }
    }
    return count;
  }
}

