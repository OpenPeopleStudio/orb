import { execSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { join } from 'node:path';

import { getConfig } from '../config';
import type { ReadinessCheckResult, ReadinessStatus } from './types';

function buildResult(
  id: string,
  title: string,
  status: ReadinessStatus,
  details: string,
  metadata?: Record<string, unknown>,
  startedAt?: number,
): ReadinessCheckResult {
  return {
    id,
    title,
    status,
    details,
    metadata,
    durationMs: startedAt ? Date.now() - startedAt : 0,
  };
}

export async function checkNodeVersion(): Promise<ReadinessCheckResult> {
  const startedAt = Date.now();
  const version = process.version.replace(/^v/, '');
  const major = Number(version.split('.')[0]);
  const status: ReadinessStatus = major >= 18 ? 'pass' : 'warn';
  return buildResult(
    'node-version',
    'Node.js Version',
    status,
    status === 'pass'
      ? `Running Node ${process.version}`
      : `Node ${process.version} detected. Recommended >= v18.x`,
    { version: process.version },
    startedAt,
  );
}

export async function checkGitStatus(): Promise<ReadinessCheckResult> {
  const startedAt = Date.now();
  try {
    const output = execSync('git status --porcelain', {
      stdio: 'pipe',
    })
      .toString()
      .trim();
    const status: ReadinessStatus = output.length === 0 ? 'pass' : 'warn';
    return buildResult(
      'git-status',
      'Git Workspace Cleanliness',
      status,
      status === 'pass'
        ? 'Working tree clean'
        : 'Working tree has pending changes. Review before release.',
      { pendingChanges: output.split('\n').filter(Boolean).length },
      startedAt,
    );
  } catch (error) {
    return buildResult(
      'git-status',
      'Git Workspace Cleanliness',
      'fail',
      'Unable to read git status',
      { error: (error as Error).message },
      startedAt,
    );
  }
}

export async function checkSupabaseConfig(): Promise<ReadinessCheckResult> {
  const startedAt = Date.now();
  const config = getConfig();
  const hasSupabase = Boolean(config.supabaseUrl && config.supabaseServiceRoleKey);
  const status: ReadinessStatus = hasSupabase ? 'pass' : 'warn';
  return buildResult(
    'supabase-config',
    'Supabase Configuration',
    status,
    hasSupabase
      ? 'Supabase URL + service role detected'
      : 'Supabase credentials missing. Required for database-backed stores.',
    {
      supabaseUrlPresent: Boolean(config.supabaseUrl),
      serviceRolePresent: Boolean(config.supabaseServiceRoleKey),
    },
    startedAt,
  );
}

export async function checkDatabaseConfig(): Promise<ReadinessCheckResult> {
  const startedAt = Date.now();
  const config = getConfig();
  const hasDb = Boolean(config.databaseUrl);
  let migrationFilePresent = false;
  try {
    migrationFilePresent = existsSync(
      join(process.cwd(), 'orb-system', 'packages', 'core-orb', 'src', 'supabase-schema.sql'),
    );
  } catch {
    migrationFilePresent = false;
  }

  const status: ReadinessStatus = hasDb ? 'pass' : 'warn';
  return buildResult(
    'database-config',
    'Database Configuration',
    status,
    hasDb
      ? 'DATABASE_URL detected'
      : 'DATABASE_URL missing. File stores will be used instead.',
    { migrationFilePresent },
    startedAt,
  );
}

export async function checkPersistenceMode(): Promise<ReadinessCheckResult> {
  const startedAt = Date.now();
  const config = getConfig();
  const status: ReadinessStatus = config.isPersistent ? 'pass' : 'warn';
  return buildResult(
    'persistence-mode',
    'Persistence Mode',
    status,
    status === 'pass'
      ? `Persistent mode enabled (${config.persistenceMode || 'file'})`
      : 'Running in memory mode. Data resets between sessions.',
    { persistenceMode: config.persistenceMode ?? 'file' },
    startedAt,
  );
}

