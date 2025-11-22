# Using the Forge Agent Bootloader

This guide explains how to use the `forge-agent-bootloader.md` template to spin up agents in Cursor.

## Overview

The bootloader template ensures every agent:
- Reads their role from `packages/forge/src/agents.ts` (no hallucination)
- Respects file scopes strictly
- Follows Git safety rules
- Works within the Orb model consistently

## Quick Start

### Step 1: Identify the Agent

Choose one of these agent IDs:
- `architect` - Repo structure, docs, root configs
- `luna` - Intent layer (modes, preferences, constraints)
- `te` - Reflection layer (journaling, evaluation)
- `mav` - Execution layer (actions, task graphs)
- `orb_ui` - UI/presentation layer
- `infra` - CI, tests, migrations

### Step 2: Define Tasks

Write a `{TASK_BLOCK}` with tasks specific to that agent. Example:

```markdown
{TASK_BLOCK} = 

- Implement FileLunaPreferencesStore using core-orb fileStore.
- Ensure getOrCreateProfile uses file store via existing presets.
- Keep InMemoryLunaPreferencesStore intact for tests.
```

### Step 3: Fill the Template

1. Open `docs/prompts/forge-agent-bootloader.md`
2. Replace `{AGENT_ID}` with your chosen agent (e.g., `luna`)
3. Replace `{TASK_BLOCK}` with your task list
4. Copy the entire filled template into Cursor

### Step 4: Agent Execution

The agent will:
1. **Boot**: Read `packages/forge/src/agents.ts` and identify itself
2. **Scope**: Lock to its file patterns
3. **Work**: Execute tasks within scope
4. **Report**: Summarize changes, commands, and follow-ups

## Example: Luna Agent Session

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

## Git Workflow

**Agents can:**
- `git status`, `git diff`
- `git add`, `git commit` (if you want)

**Agents cannot:**
- `git worktree` (create/remove/list)
- `git push`, `git pull`, `git merge`, `git rebase`
- Change remotes

**Recommendation:** Let agents edit files and run tests. You handle commits & pushes.

If you want agents to commit:
- Use branch: `feature/<short-name>`
- Use conventional commits: `feat(core-luna): ...`, `chore(core-orb): ...`
- You push, not the agent

## Multi-Agent Coordination

### Workflow

1. **Architect** creates a plan (informal is fine)
2. **Break down** tasks by agent scope
3. **Spin up agents** one at a time with their slice
4. **Review** agent outputs
5. **Integrate** (Architect handles cross-cutting concerns)

### Example: Adding a New Feature

**Architect's plan:**
- Luna: Add new mode `restaurant`
- Mav: Add action `makeReservation`
- Te: Add reflection tag `restaurant_booking`
- Orb UI: Add mode selector dropdown

**Agent sessions:**
1. Luna agent: `{AGENT_ID}` = `luna`, tasks = "Add restaurant mode..."
2. Mav agent: `{AGENT_ID}` = `mav`, tasks = "Add makeReservation action..."
3. Te agent: `{AGENT_ID}` = `te`, tasks = "Add restaurant_booking tag..."
4. Orb UI agent: `{AGENT_ID}` = `orb_ui`, tasks = "Add mode selector..."

Each agent works independently, respecting scopes.

## Troubleshooting

### Agent tries to edit out-of-scope files

**Solution:** Remind agent to check `packages/forge/src/agents.ts` and respect scopes. If change is needed, leave TODO for relevant agent.

### Agent wants to use git worktree

**Solution:** Remind agent of Git rules. If parallel work is needed, you create worktrees manually.

### Agent doesn't understand its role

**Solution:** Ensure agent ran boot sequence (section 1). It should print a summary like "I am the Mav agent. My scopes are: ..."

### Cross-package changes needed

**Solution:** 
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

- `packages/forge/src/agents.ts` - Agent definitions
- `packages/forge/src/types.ts` - Forge types
- `packages/forge/src/orchestrator.ts` - Task routing logic
- `docs/ORB_IDENTITY.md` - Orb system overview

