// packages/forge/src/types.ts
// Core types for the Orb Forge multi-agent system.

export type ForgeAgentId =
  | 'architect'
  | 'luna'
  | 'te'
  | 'mav'
  | 'orb_ui'
  | 'infra';

export interface ForgeFileScope {
  /**
   * Glob-like pattern for files this agent is responsible for.
   * Example: "packages/core-luna/**"
   */
  pattern: string;

  /**
   * If true, the agent should treat this scope as read-only.
   */
  readOnly?: boolean;
}

export interface ForgeAgent {
  id: ForgeAgentId;
  name: string;
  description: string;
  scopes: ForgeFileScope[];
  responsibilities: string[];
}

export type ForgeTaskStatus =
  | 'pending'
  | 'planned'
  | 'in_progress'
  | 'blocked'
  | 'done'
  | 'cancelled';

export interface ForgeTask {
  id: string;
  title: string;
  description: string;

  /**
   * Paths or globs this task primarily touches.
   * Used to route to the right agent.
   */
  targetPatterns: string[];

  /**
   * Optional tags like: ['luna', 'reflection', 'infra', 'ui']
   */
  tags?: string[];

  status: ForgeTaskStatus;

  /**
   * Agent this task is assigned to, if any.
   */
  assignedAgentId?: ForgeAgentId;

  /**
   * Arbitrary metadata (e.g. createdBy, createdAt).
   */
  meta?: Record<string, any>;
}

export interface ForgePlan {
  id: string;
  goal: string;
  tasks: ForgeTask[];
  createdAt: string;
  meta?: Record<string, any>;
}

/**
 * Context passed when planning or assigning tasks.
 * Not runtime OrbContext, just planning metadata.
 */
export interface ForgeContext {
  repoRoot: string;
  branch?: string;
  notes?: string;
}

export interface ForgeAgentRegistry {
  agents: ForgeAgent[];
}

export interface ForgeAssignment {
  agent: ForgeAgent;
  tasks: ForgeTask[];
}

export interface ForgePlanWithAssignments extends ForgePlan {
  assignments: ForgeAssignment[];
}

