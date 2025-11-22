// packages/forge/src/orchestrator.ts
// Simple planner + router that maps tasks to agents based on scope and tags.

import {
  type ForgeAgent,
  type ForgeAgentRegistry,
  type ForgeAssignment,
  type ForgeContext,
  type ForgePlan,
  type ForgePlanWithAssignments,
  type ForgeTask,
} from './types';

function generateId(prefix: string = 'plan'): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

/**
 * Basic strategy:
 * - If task tags include an agent id, prefer that agent.
 * - Else, match by targetPatterns overlapping agent.scopes.pattern.
 * - Fallback: architect.
 */
export class ForgeOrchestrator {
  constructor(private registry: ForgeAgentRegistry) {}

  createPlan(goal: string, tasks: Omit<ForgeTask, 'status'>[]): ForgePlan {
    const now = new Date().toISOString();
    return {
      id: generateId('plan'),
      goal,
      tasks: tasks.map((t) => ({
        ...t,
        status: 'planned',
      })),
      createdAt: now,
      meta: {},
    };
  }

  assignAgents(plan: ForgePlan, _ctx: ForgeContext): ForgePlanWithAssignments {
    const assignments: Record<string, ForgeAssignment> = {};

    const agents = this.registry.agents;
    const architect = agents.find((a) => a.id === 'architect');

    for (const task of plan.tasks) {
      const agent = this.chooseAgentForTask(task, agents, architect);
      if (!agent) continue;

      task.assignedAgentId = agent.id;

      if (!assignments[agent.id]) {
        assignments[agent.id] = {
          agent,
          tasks: [],
        };
      }
      assignments[agent.id].tasks.push(task);
    }

    return {
      ...plan,
      assignments: Object.values(assignments),
    };
  }

  private chooseAgentForTask(
    task: ForgeTask,
    agents: ForgeAgent[],
    fallback?: ForgeAgent,
  ): ForgeAgent | undefined {
    // 1) Tag-based routing (e.g. tags: ['luna'])
    if (task.tags && task.tags.length > 0) {
      const tagMatch = agents.find((a) => task.tags!.includes(a.id));
      if (tagMatch) return tagMatch;
    }

    // 2) Scope-based routing by pattern overlap
    const scopeMatches: ForgeAgent[] = [];

    for (const agent of agents) {
      const patterns = agent.scopes.map((s) => s.pattern);
      const touchesAgentScope = task.targetPatterns.some((tp) =>
        patterns.some((p) => simplePatternOverlap(tp, p)),
      );
      if (touchesAgentScope) {
        scopeMatches.push(agent);
      }
    }

    if (scopeMatches.length === 1) {
      return scopeMatches[0];
    }

    // If multiple matches, prefer non-architect agents
    if (scopeMatches.length > 1) {
      const nonArchitect = scopeMatches.filter((a) => a.id !== 'architect');
      if (nonArchitect.length > 0) {
        return nonArchitect[0];
      }
      return scopeMatches[0];
    }

    // 3) Fallback to architect
    return fallback;
  }
}

/**
 * Very crude overlap check:
 * - If one pattern includes the other as substring, consider it overlapping.
 * This is intentionally simple and not a full glob matcher.
 */
function simplePatternOverlap(a: string, b: string): boolean {
  return a.includes(b) || b.includes(a);
}

