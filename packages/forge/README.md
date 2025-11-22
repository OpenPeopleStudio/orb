# Forge – Orb Multi-Agent Dev System

This package defines the **multi-agent system** used to build and maintain the Orb ecosystem.

It does **not** run in end-user flows. It coordinates how different agents work on the `orb-system` repo itself.

## Roles

Agents are defined in `src/agents.ts`:

- `architect` – owns architecture, shared types, root configs, and docs.
- `luna` – owns `packages/core-luna/**` (modes, preferences, constraints).
- `te` – owns `packages/core-te/**` (reflection, scoring, summaries).
- `mav` – owns `packages/core-mav/**` (actions, task graphs, integrations).
- `orb_ui` – owns `apps/orb-web/**` (Orb console UI).
- `infra` – owns CI, test runner, migrations, and tooling.

Each agent has:

- `scopes` – patterns for files it is responsible for.
- `responsibilities` – textual description of what it should do.

## Tasks & plans

Types are in `src/types.ts`:

- `ForgeTask` – a unit of work with:
  - `targetPatterns` (paths/globs)
  - optional `tags` (e.g. `['luna']`)
- `ForgePlan` – a collection of tasks for a goal.
- `ForgePlanWithAssignments` – a plan where tasks have been assigned to agents.

## Orchestrator

`src/orchestrator.ts` provides `ForgeOrchestrator`:

- `createPlan(goal, tasks)` – create a plan from a goal and tasks.
- `assignAgents(plan, context)` – assign tasks to agents based on tags and scope patterns.

This is intentionally simple: it’s meant to be used as **metadata and guidance** for human/LLM-driven agents (e.g. Cursor sessions), not as an autonomous scheduler.

## How to use with external agents (Cursor, etc.)

### Quick Start: Bootloader Template

Use the **bootloader template** to spin up agents in Cursor:

1. Open `docs/prompts/forge-agent-bootloader.md`
2. Replace `{AGENT_ID}` with your agent (`architect`, `luna`, `te`, `mav`, `orb_ui`, `infra`)
3. Replace `{TASK_BLOCK}` with tasks for this session
4. Copy into Cursor

The bootloader ensures agents:
- Read their role from `src/agents.ts` (no hallucination)
- Respect file scopes strictly
- Follow Git safety rules (no worktree, no push, etc.)
- Work within the Orb model consistently

See `docs/prompts/FORGE_BOOTLOADER_USAGE.md` for detailed usage guide.

### Manual Workflow

1. Use `ForgeOrchestrator` to generate a plan and assignments for a given goal.
2. For each `ForgeAssignment`:
   - Start a Cursor / LLM session.
   - Use the bootloader template (recommended) or manually provide:
     - Agent's description, scopes, and tasks for this run
     - Constrain it to only touch files within its scopes
3. Use the `architect` agent to integrate and reconcile cross-cutting changes.

This gives you a consistent, repo-native definition of your multi-agent team, instead of hardcoding roles and scopes separately in each prompt.

