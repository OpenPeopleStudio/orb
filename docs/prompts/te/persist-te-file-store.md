# Te Agent Task: Persist Te File Store

## Context

This is a task ticket for the **Te agent** (`id: 'te'`). Use the bootloader (`docs/prompts/forge-agent-bootloader.md`) with:
- `{AGENT_ID}` = `te`
- `{TASK_BLOCK}` = contents of this file

## Orb Model Recap

- **Te** → reflection (what the model reflects on)
- **Luna** → intent (what the user decides they want it to be)
- **Sol** → engine (what the model runs on)
- **Mav** → execution (what the model accomplishes)
- **Orb** → shell (UI/app the human touches)

Te owns: journaling, evaluation, summarization, and reflection storage.

## Goal

Implement file-backed persistence for Te reflections so evaluations and memories persist across sessions.

## Files to Touch

- `packages/core-te/src/**` (your scope)
- May need to read `packages/core-orb/src/fileStore.ts` for shared utilities
- May need to read `packages/core-orb/src/demoFlow.ts` to see how stores are used

## Non-Touch Zones

- `node_modules/`, `dist/`, `.orb-data/` (runtime data, not code)
- `packages/core-luna/**`, `packages/core-mav/**` (other agents' domains)
- `docs/**` (Architect's domain, unless explicitly asked)

## Tasks

1. **Review existing store interfaces**
   - Read `packages/core-te/src/fileReflectionStore.ts` or similar to understand the interface
   - Check if `FileTeReflectionStore` already exists

2. **Implement file-backed store** (if missing)
   - Use `packages/core-orb/src/fileStore.ts` utilities (`readJson`, `writeJson`)
   - Store reflections in `.orb-data/te/reflections/<userId>/<sessionId>.json` or similar structure
   - Implement all methods from `TeReflectionStore` interface

3. **Update store factories** (if needed)
   - Check `packages/core-orb/src/storeFactories.ts`
   - Ensure `createDefaultTeStore()` can return file-backed store when persistence mode is 'file'

4. **Test integration**
   - Run `pnpm test --filter packages/core-te` to ensure tests pass
   - Verify file store works in `demoFlow` if possible

## Expected Outcome

- File-backed Te store exists and implements the interface
- Store factories use file store by default when persistence mode is 'file'
- Tests pass
- In-memory store still works for tests

## Follow-ups

- If `demoFlow.ts` needs changes, leave TODO for Architect
- If store factory changes are needed in `core-orb`, coordinate with Architect
