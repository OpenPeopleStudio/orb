/**
 * Database-backed Te Reflection Store
 * 
 * Role: OrbRole.TE (reflection/memory)
 * 
 * Database-backed persistent storage for Te reflections using SQLite.
 * This is a wrapper around SqlTeReflectionStore that uses the shared database instance.
 */

import { getDb } from '@orb-system/core-orb';
import { SqlTeReflectionStore } from './sqlStore';
import type { TeReflectionStore } from './fileReflectionStore';

/**
 * Database-backed Te reflection store
 * Uses SQLite via the shared database instance from core-orb
 */
export class DbTeReflectionStore implements TeReflectionStore {
  private store: SqlTeReflectionStore;

  constructor(db?: any) {
    // Use provided db or get shared instance
    this.store = new SqlTeReflectionStore(db || getDb());
  }

  async saveReflection(
    reflection: import('./reflectionHelpers').TeReflection,
    userId: string,
    sessionId?: string
  ): Promise<void> {
    return this.store.saveReflection(reflection, userId, sessionId);
  }

  async getReflections(userId: string, limit?: number): Promise<import('./reflectionHelpers').TeReflection[]> {
    return this.store.getReflections(userId, limit);
  }

  async getReflectionsBySession(sessionId: string, limit?: number): Promise<import('./reflectionHelpers').TeReflection[]> {
    return this.store.getReflectionsBySession(sessionId, limit);
  }
}

