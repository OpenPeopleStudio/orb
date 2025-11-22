// packages/forge/src/agents.ts
// Canonical agent registry for Orb's Forge multi-agent dev system.
//
// This is the "company directory" - the single source of truth for who can touch what.
// Ultra agents read this file to understand their role, scopes, and responsibilities.
// Do not modify agent definitions without explicit architectural review.

import { type ForgeAgent, type ForgeAgentId, type ForgeAgentRegistry } from './types';

export const forgeAgents: ForgeAgent[] = [
  {
    id: 'architect',
    name: 'Architect',
    description:
      'Owns repo structure, shared types, root configs, and docs. Integrates work from other agents.',
    scopes: [
      { pattern: 'docs/**' },
      { pattern: 'package.json' },
      { pattern: 'pnpm-lock.yaml' },
      { pattern: 'tsconfig.*' },
      { pattern: 'turbo.*' },
      { pattern: 'vite.config.*' },
      { pattern: 'next.config.*' },
      { pattern: 'packages/core-orb/**' },
      { pattern: 'packages/forge/**' },
    ],
    responsibilities: [
      'Define and evolve Orb system architecture (Sol/Te/Mav/Luna/Orb).',
      'Maintain docs/ORB_IDENTITY.md, docs/ROADMAP.md, docs/MIGRATION_NOTES.md.',
      'Manage workspace configuration (package.json workspaces, tooling).',
      'Resolve cross-package type and API contracts.',
      'Review and integrate changes proposed by other agents.',
    ],
    // Rationale: Architect is the only agent that can touch cross-cutting concerns.
    // This prevents other agents from accidentally breaking repo structure or docs.
    // core-orb is included because it's the shared identity layer that all packages depend on.
  },
  {
    id: 'luna',
    name: 'Luna Agent',
    description:
      'Owns intent layer: modes, preferences, constraints, and policy evaluation logic.',
    scopes: [{ pattern: 'packages/core-luna/**' }],
    responsibilities: [
      'Design and evolve Luna modes (default, restaurant, real_estate, builder).',
      'Maintain preference and constraint schemas.',
      'Implement and refine policy evaluation (allow / require_confirmation / deny).',
    ],
    // Rationale: Luna maps to the Orb model's "preferences/intent" layer.
    // Strict scope prevents Luna from touching execution (Mav) or reflection (Te) logic.
    // This maintains separation of concerns in the Orb architecture.
  },
  {
    id: 'te',
    name: 'Te Agent',
    description: 'Owns reflection layer: journaling, evaluation, and summarization.',
    scopes: [{ pattern: 'packages/core-te/**' }],
    responsibilities: [
      'Define reflection types, tags, and scoring heuristics.',
      'Implement TeReflectionStore (memory, file, DB).',
      'Integrate Te evaluations into flows like demoFlow.',
    ],
    // Rationale: Te maps to the Orb model's "reflection/memory" layer.
    // Isolated scope ensures reflection logic doesn't leak into other layers.
    // Te can read from other packages but only edits its own domain.
  },
  {
    id: 'mav',
    name: 'Mav Agent',
    description: 'Owns execution layer: actions, task graphs, and integrations.',
    scopes: [{ pattern: 'packages/core-mav/**' }],
    responsibilities: [
      'Design MavAction/MavTask types and execution log.',
      'Implement executors (mock, file, HTTP, domain-specific tools).',
      'Ensure integration points for Luna (pre-check) and Te (post-run reflection).',
    ],
    // Rationale: Mav maps to the Orb model's "actions/tools" layer.
    // Execution is isolated to prevent accidental side effects in other packages.
    // Mav executors are whitelisted and controlled to prevent destructive actions.
  },
  {
    id: 'orb_ui',
    name: 'Orb UI Agent',
    description: 'Owns Orb console UI and presentation layer.',
    scopes: [{ pattern: 'apps/orb-web/**' }],
    responsibilities: [
      'Implement Orb shell UI consistent with design tokens.',
      'Expose Sol/Te/Mav/Luna state in a clear console layout.',
      'Wire UI flows to core-orb orchestrations like demoFlow.',
    ],
    // Rationale: UI is isolated to prevent presentation logic from leaking into core packages.
    // orb-web is the primary client, but this scope could extend to future UI packages.
    // UI agent reads from core packages but doesn't modify their logic.
  },
  {
    id: 'infra',
    name: 'Infra Agent',
    description: 'Owns CI, test runners, linting, migrations, and infra glue.',
    scopes: [
      { pattern: '.github/**' },
      { pattern: '.gitlab/**' },
      { pattern: 'supabase/**' },
      { pattern: 'scripts/**' },
      { pattern: 'vitest.config.*' },
      { pattern: 'jest.config.*' },
    ],
    responsibilities: [
      'Configure and maintain test runner (Vitest/Jest).',
      'Set up CI workflows.',
      'Manage database migrations and schema consistency.',
      'Optimize dev workflows (scripts, formatters, etc.).',
    ],
    // Rationale: Infra is rarely used but owns all infrastructure concerns.
    // Isolated scope prevents accidental changes to CI/CD or database schemas.
    // This agent is typically invoked manually for specific infra tasks.
  },
];

export const forgeAgentRegistry: ForgeAgentRegistry = {
  agents: forgeAgents,
};

export function getAgentById(id: ForgeAgentId): ForgeAgent | undefined {
  return forgeAgents.find((a) => a.id === id);
}

