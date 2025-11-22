/**
 * System Readiness Types
 *
 * Derived from SomaOS readiness checklists:
 * - V1_VERIFICATION_CHECKLIST.md
 * - SYSTEM_READY.md
 * - DATABASE_PUSH_GUIDE.md
 */

export type ReadinessStatus = 'pass' | 'warn' | 'fail';

export interface ReadinessCheckResult {
  id: string;
  title: string;
  status: ReadinessStatus;
  details: string;
  durationMs: number;
  metadata?: Record<string, unknown>;
}

export type ReadinessCheck = () => Promise<ReadinessCheckResult>;

export interface ReadinessReport {
  generatedAt: string;
  checks: ReadinessCheckResult[];
  overallStatus: ReadinessStatus;
}

