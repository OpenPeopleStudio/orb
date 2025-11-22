# Ultra Workflow Quick Start

This guide explains how to use the Ultra multi-agent system for orb-system development.

## Overview

The Ultra system uses **Forge agents** - specialized AI agents with strict file scopes and responsibilities. Each agent reads its role from `packages/forge/src/agents.ts` and only edits files within its scope.

## Quick Start

### 1. Choose Your Agent

Available agents:
- `architect` - Repo structure, docs, root configs, `core-orb`
- `luna` - Intent layer (`core-luna`)
- `te` - Reflection layer (`core-te`)
- `mav` - Execution layer (`core-mav`)
- `orb_ui` - UI layer (`apps/orb-web`)
- `infra` - CI, tests, migrations

### 2. Choose Your Task

**Option A: Use a Task Template**
- Browse `docs/prompts/{agent}/` for pre-written task templates
- Examples:
  - `docs/prompts/luna/persist-luna-file-store.md`
  - `docs/prompts/te/persist-te-file-store.md`
  - `docs/prompts/mav/file-executor.md`
  - `docs/prompts/orb-web/mode-aware-console.md`

**Option B: Write Your Own Task**
- Create a task block describing what needs to be done
- Be specific about files to touch and goals

### 3. Fill the Bootloader

1. Open `docs/prompts/forge-agent-bootloader.md`
2. Replace `{AGENT_ID}` with your chosen agent (e.g., `luna`)
3. Replace `{TASK_BLOCK}` with your task (from template or custom)
4. Copy the entire filled template into Cursor

### 4. Run the Agent

The agent will:
1. **Boot**: Read `packages/forge/src/agents.ts` and identify itself
2. **Scope**: Lock to its file patterns (only edits allowed paths)
3. **Work**: Execute tasks within scope
4. **Report**: Summarize changes, commands, and follow-ups

### 5. Review & Commit

- Review agent output in Cursor
- Reject stupid changes, ask follow-ups if needed
- Run tests: `pnpm lint`, `pnpm typecheck`, `pnpm dev` (smoke test)
- Commit with clear slices:
  ```bash
  git add packages/core-luna
  git commit -m "feat(core-luna): add file-backed preferences store"
  ```

## Example Session

**Agent**: `luna`  
**Task**: Implement file-backed preferences store

**Bootloader Template**:
```markdown
# ORB Forge Agent Bootloader

Your identity for THIS run is:
> **AGENT_ID:** `luna`

{TASK_BLOCK} = 

- Implement FileLunaPreferencesStore using core-orb fileStore.
- Ensure getOrCreateProfile uses file store via existing presets.
- Keep InMemoryLunaPreferencesStore intact for tests.
```

The agent will:
- Read `packages/forge/src/agents.ts` → find `id: 'luna'`
- See scopes: `['packages/core-luna/**']`
- Only edit files matching that pattern
- Follow Git rules (no worktree, no push, etc.)

## Multi-Agent Workflow

For complex features requiring multiple agents:

1. **Architect** creates a plan (informal is fine)
2. **Break down** tasks by agent scope
3. **Spin up agents** one at a time with their slice
4. **Review** agent outputs
5. **Integrate** (Architect handles cross-cutting concerns)

**Example**: Adding a new feature
- Luna: Add new mode `restaurant`
- Mav: Add action `makeReservation`
- Te: Add reflection tag `restaurant_booking`
- Orb UI: Add mode selector dropdown

Each agent works independently, respecting scopes.

## Git Rules

**Agents can:**
- `git status`, `git diff`
- `git add`, `git commit` (if you want)

**Agents cannot:**
- `git worktree` (create/remove/list)
- `git push`, `git pull`, `git merge`, `git rebase`
- Change remotes

**Recommendation**: Let agents edit files and run tests. You handle commits & pushes.

## Troubleshooting

### Agent tries to edit out-of-scope files
**Solution**: Remind agent to check `packages/forge/src/agents.ts` and respect scopes. If change is needed, leave TODO for relevant agent.

### Agent wants to use git worktree
**Solution**: Remind agent of Git rules. If parallel work is needed, you create worktrees manually.

### Agent doesn't understand its role
**Solution**: Ensure agent ran boot sequence (section 1). It should print a summary like "I am the Mav agent. My scopes are: ..."

### Cross-package changes needed
**Solution**: 
- Agent implements their part
- Leaves TODO for Architect or relevant agent
- Architect coordinates integration

## Best Practices

1. **One agent per session** - Don't mix agents in one Cursor session
2. **Clear task blocks** - Be specific about what needs to be done
3. **Review agent output** - Check summaries before moving to next agent
4. **Let Architect integrate** - Cross-cutting changes go through Architect
5. **Test incrementally** - Run tests after each agent's changes

## See Also

- `packages/forge/src/agents.ts` - Agent definitions with rationale
- `packages/forge/src/types.ts` - Forge types
- `packages/forge/src/orchestrator.ts` - Task routing logic
- `docs/ORB_IDENTITY.md` - Orb system overview
- `docs/ROADMAP.md` - Phase 0-7 roadmap
- `docs/SOMAOS_PORTING_PLAN.md` - SomaOS concept mapping

