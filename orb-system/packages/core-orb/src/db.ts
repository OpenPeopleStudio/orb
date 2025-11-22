/**
 * Database Module
 * 
 * Provides SQLite database connection and initialization.
 */

import { getConfig } from './config';
import path from 'node:path';
import fs from 'node:fs';

let dbInstance: any = null;

/**
 * Get or create the database instance
 */
export function getDb(): any {
  if (dbInstance) {
    return dbInstance;
  }

  // Lazy import to avoid issues in browser environments
  let Database: any;
  try {
    Database = require('better-sqlite3');
  } catch (error) {
    throw new Error('better-sqlite3 is required for persistence. Install it with: npm install better-sqlite3');
  }

  const config = getConfig();
  const dbPath = config.databaseUrl || path.join(process.cwd(), 'orb.db');

  // Ensure directory exists
  const dbDir = path.dirname(dbPath);
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  dbInstance = new Database(dbPath);
  
  // Enable foreign keys
  dbInstance.pragma('foreign_keys = ON');

  // Initialize schema
  initializeSchema(dbInstance);

  return dbInstance;
}

/**
 * Initialize database schema
 */
function initializeSchema(db: any): void {
  // Luna profiles table
  db.exec(`
    CREATE TABLE IF NOT EXISTS luna_profiles (
      user_id TEXT NOT NULL,
      mode_id TEXT NOT NULL,
      preferences TEXT NOT NULL, -- JSON array
      constraints TEXT NOT NULL, -- JSON array
      updated_at TEXT NOT NULL,
      PRIMARY KEY (user_id, mode_id)
    );

    CREATE INDEX IF NOT EXISTS idx_luna_profiles_user ON luna_profiles(user_id);
  `);

  // Luna active modes table
  db.exec(`
    CREATE TABLE IF NOT EXISTS luna_active_modes (
      user_id TEXT PRIMARY KEY,
      mode_id TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);

  // Te reflections table
  db.exec(`
    CREATE TABLE IF NOT EXISTS te_reflections (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      session_id TEXT,
      input TEXT NOT NULL,
      output TEXT NOT NULL,
      tags TEXT NOT NULL, -- JSON array
      notes TEXT,
      created_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_te_reflections_user ON te_reflections(user_id);
    CREATE INDEX IF NOT EXISTS idx_te_reflections_session ON te_reflections(session_id);
    CREATE INDEX IF NOT EXISTS idx_te_reflections_created ON te_reflections(created_at);
  `);

  // Mav actions log table
  db.exec(`
    CREATE TABLE IF NOT EXISTS mav_actions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      session_id TEXT,
      task_id TEXT NOT NULL,
      action_id TEXT NOT NULL,
      tool_id TEXT,
      kind TEXT NOT NULL,
      params TEXT, -- JSON object
      status TEXT NOT NULL,
      output TEXT,
      error TEXT,
      created_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_mav_actions_user ON mav_actions(user_id);
    CREATE INDEX IF NOT EXISTS idx_mav_actions_task ON mav_actions(task_id);
    CREATE INDEX IF NOT EXISTS idx_mav_actions_created ON mav_actions(created_at);
  `);
}

/**
 * Close database connection
 */
export function closeDb(): void {
  if (dbInstance) {
    try {
      dbInstance.close();
    } catch (error) {
      // Ignore errors on close
    }
    dbInstance = null;
  }
}

/**
 * Check if persistence is enabled
 */
export function isPersistenceEnabled(): boolean {
  const config = getConfig();
  return config.isPersistent !== false && !!config.databaseUrl;
}

