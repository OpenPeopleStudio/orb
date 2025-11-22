# Luna Agent Task: Persist Luna File Store

## Context

This is a task ticket for the **Luna agent** (`id: 'luna'`). Use the bootloader (`docs/prompts/forge-agent-bootloader.md`) with:
- `{AGENT_ID}` = `luna`
- `{TASK_BLOCK}` = contents of this file

## Orb Model Recap

- **Luna** → intent (what the user decides they want it to be)
- **Sol** → engine (what the model runs on)
- **Te** → reflection (what the model reflects on)
- **Mav** → execution (what the model accomplishes)
- **Orb** → shell (UI/app the human touches)

Luna owns: modes, preferences, constraints, and policy evaluation.

## Goal

Implement file-backed persistence for Luna preferences/profiles so decisions persist across sessions.

## Files to Touch

- `packages/core-luna/src/**` (your scope)
- May need to read `packages/core-orb/src/fileStore.ts` for shared utilities
- May need to read `packages/core-orb/src/demoFlow.ts` to see how stores are used

## Non-Touch Zones

- `node_modules/`, `dist/`, `.orb-data/` (runtime data, not code)
- `packages/core-te/**`, `packages/core-mav/**` (other agents' domains)
- `docs/**` (Architect's domain, unless explicitly asked)

## Tasks

1. **Review existing store interfaces**
   - Read `packages/core-luna/src/preferencesStore.ts` to understand the interface
   - Check if `FileLunaPreferencesStore` already exists

2. **Implement file-backed store** (if missing)
   - Use `packages/core-orb/src/fileStore.ts` utilities (`readJson`, `writeJson`)
   - Store profiles in `.orb-data/luna/profiles/<userId>/<modeId>.json`
   - Implement all methods from `LunaPreferencesStore` interface

3. **Update store factories** (if needed)
   - Check `packages/core-orb/src/storeFactories.ts`
   - Ensure `createDefaultLunaStore()` can return file-backed store when persistence mode is 'file'

4. **Test integration**
   - Run `pnpm test --filter packages/core-luna` to ensure tests pass
   - Verify file store works in `demoFlow` if possible

## Expected Outcome

- File-backed Luna store exists and implements the interface
- Store factories use file store by default when persistence mode is 'file'
- Tests pass
- In-memory store still works for tests

## Follow-ups

- If `demoFlow.ts` needs changes, leave TODO for Architect
- If store factory changes are needed in `core-orb`, coordinate with Architect
