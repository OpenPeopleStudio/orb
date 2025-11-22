/**
 * System Readiness Module
 *
 * Provides structured readiness checks inspired by SomaOS checklists
 * (V1 Verification, System Ready, and Database Push guides).
 */

import type { ReadinessCheck, ReadinessReport } from './types';
import {
  checkDatabaseConfig,
  checkGitStatus,
  checkNodeVersion,
  checkPersistenceMode,
  checkSupabaseConfig,
} from './checks';

export * from './types';
export * from './checks';

export const DEFAULT_READINESS_CHECKS: ReadinessCheck[] = [
  checkNodeVersion,
  checkGitStatus,
  checkSupabaseConfig,
  checkDatabaseConfig,
  checkPersistenceMode,
];

export async function runSystemReadiness(
  checks: ReadinessCheck[] = DEFAULT_READINESS_CHECKS,
): Promise<ReadinessReport> {
  const results = [];
  for (const check of checks) {
    try {
      results.push(await check());
    } catch (error) {
      results.push({
        id: 'unknown-check',
        title: 'Unhandled readiness check failure',
        status: 'fail' as const,
        details: (error as Error).message,
        durationMs: 0,
      });
    }
  }

  const overallStatus = results.some((c) => c.status === 'fail')
    ? 'fail'
    : results.some((c) => c.status === 'warn')
      ? 'warn'
      : 'pass';

  return {
    generatedAt: new Date().toISOString(),
    checks: results,
    overallStatus,
  };
}

