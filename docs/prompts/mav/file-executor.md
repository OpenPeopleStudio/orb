# Mav Agent Task: File Executor

## Context

You are the **Mav Agent** working on the execution/actions layer of the Orb system.

**Orb Model Recap**:
- **Sol** → engine (what the model runs on)
- **Te** → reflection (what the model reflects on)
- **Mav** → execution (what the model accomplishes) ← **You are here**
- **Luna** → intent (what the user decides they want it to be)
- **Orb** → shell (UI/app that the human touches)

## Your Scope

You MAY edit files matching:
- `packages/core-mav/**`

You MUST NOT edit:
- `node_modules/`, `dist/`, `sol/`, `luna/` scripts
- Other core packages (`core-luna`, `core-te`, `core-sol`)
- Root configs or docs (that's `architect`'s job)

## Task: Implement Whitelisted File Executor

### Goal

Create a controlled file executor that allows Mav to write files within a whitelist, preventing accidental destruction of important files.

### Current State

- Mav has `FileMavExecutor` that logs actions to `.orb-data/mav/actions.log`
- Mav needs a real file writer that can safely write to allowed paths

### Files to Touch

1. **`packages/core-mav/src/executors.ts`** (or create new file)
   - Implement `FileSystemMavExecutor` class
   - Extend or implement `MavExecutor` interface
   - Whitelist paths: `apps/**`, `packages/**` (but not `node_modules`, `dist`, `.git`)
   - Never touch: `.git/**`, `node_modules/**`, `dist/**`, `pnpm-lock.yaml`, `package-lock.json`

2. **`packages/core-mav/src/taskRunner.ts`**
   - Ensure task runner can use `FileSystemMavExecutor`
   - Emit structured `MavTaskResult` with:
     - `filesTouched: string[]`
     - `summary: string`
     - `errors: string[]`

3. **`packages/core-mav/src/index.ts`**
   - Export `FileSystemMavExecutor` if not already exported

### Implementation Notes

- Path validation: Check if target path matches whitelist patterns
- Reject paths that contain `node_modules`, `dist`, `.git` anywhere
- Create directories as needed (use `fs.mkdir` with `recursive: true`)
- Write files atomically if possible (write to temp, then rename)
- Emit clear errors if path is rejected

### Safety Rules

- **Whitelist only**: Only allow writes to `apps/**` and `packages/**`
- **Never touch**: `.git`, `node_modules`, `dist`, lock files
- **Log everything**: All file writes should be logged to `.orb-data/mav/actions.log`
- **Error on reject**: If path is not whitelisted, return error, don't silently skip

### Testing

- Test whitelist validation
- Test directory creation
- Test error handling for rejected paths
- Test atomic writes (if implemented)

### Follow-ups

After completing:
- Note if `architect` needs to update `demoFlow.ts` to use `FileSystemMavExecutor` by default
- Note if `orb_ui` should surface file write results in the UI

## Output Format

When done, provide:
- Summary of changes per file
- Any commands run (lint, test, build)
- Follow-ups for other agents

