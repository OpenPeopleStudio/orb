# Mav Agent Task: File Executor

## Context

This is a task ticket for the **Mav agent** (`id: 'mav'`). Use the bootloader (`docs/prompts/forge-agent-bootloader.md`) with:
- `{AGENT_ID}` = `mav`
- `{TASK_BLOCK}` = contents of this file

## Orb Model Recap

- **Mav** → execution (what the model accomplishes)
- **Luna** → intent (what the user decides they want it to be)
- **Sol** → engine (what the model runs on)
- **Te** → reflection (what the model reflects on)
- **Orb** → shell (UI/app the human touches)

Mav owns: actions, task graphs, integrations, and real-world execution.

## Goal

Implement a whitelisted file system executor so Mav can safely write files within controlled boundaries.

## Files to Touch

- `packages/core-mav/src/**` (your scope)
- May need to read `packages/core-mav/src/executors.ts` to see existing executor patterns

## Non-Touch Zones

- `.git/`, `node_modules/`, `dist/` (never touch these)
- `packages/core-luna/**`, `packages/core-te/**` (other agents' domains)
- `docs/**` (Architect's domain, unless explicitly asked)

## Tasks

1. **Review existing executors**
   - Read `packages/core-mav/src/executors.ts` to understand executor interface
   - Check if `FileSystemExecutor` or similar already exists

2. **Implement whitelisted file executor**
   - Create executor that checks paths against allowlist:
     - Allow: `apps/**`, `packages/**` (source code)
     - Deny: `.git/**`, `node_modules/**`, `dist/**`, `.orb-data/**` (protected)
   - Implement file write operations with path validation
   - Return structured results with `filesTouched`, `summary`, `errors`

3. **Integrate with task runner**
   - Ensure `runTaskWithDefaults` can use the file executor
   - Update executor selection logic if needed

4. **Test safely**
   - Run `pnpm test --filter packages/core-mav` to ensure tests pass
   - Verify executor rejects dangerous paths

## Expected Outcome

- File executor exists with path whitelisting
- Executor integrates with Mav task runner
- Tests pass
- Executor safely rejects attempts to write to protected paths

## Follow-ups

- If task runner changes are needed, coordinate with Architect
- If UI needs to display executor results, leave TODO for Orb UI agent
