# Luna Agent Task: Persist Luna File Store

## Context

You are the **Luna Agent** working on the intent/preferences layer of the Orb system.

**Orb Model Recap**:
- **Sol** → engine (what the model runs on)
- **Te** → reflection (what the model reflects on)
- **Mav** → execution (what the model accomplishes)
- **Luna** → intent (what the user decides they want it to be) ← **You are here**
- **Orb** → shell (UI/app that the human touches)

## Your Scope

You MAY edit files matching:
- `packages/core-luna/**`

You MUST NOT edit:
- `node_modules/`, `dist/`, `sol/`, `luna/` scripts
- Other core packages (`core-te`, `core-mav`, `core-sol`)
- Root configs or docs (that's `architect`'s job)

## Task: Implement File-Backed Luna Preferences Store

### Goal

Create a file-backed persistence layer for Luna preferences so that mode selections and user preferences survive across sessions.

### Current State

- Luna has in-memory stores for testing
- Luna has database-backed stores (SQLite, Supabase)
- Luna needs a simple file-backed store for development and lightweight deployments

### Files to Touch

1. **`packages/core-luna/src/filePreferencesStore.ts`** (may already exist)
   - Implement `FileLunaPreferencesStore` class
   - Use `@orb-system/core-orb`'s `fileStore` utilities (`readJson`, `writeJson`)
   - Store profiles in `.orb-data/luna/profiles/{userId}/{modeId}.json`
   - Store active modes in `.orb-data/luna/active-modes/{userId}.json`

2. **`packages/core-luna/src/preferencesStore.ts`** (interface)
   - Ensure `LunaPreferencesStore` interface is properly defined
   - Document the contract

3. **`packages/core-luna/src/index.ts`**
   - Export `FileLunaPreferencesStore` if not already exported

### Implementation Notes

- Use `getDataDirectory()` from `@orb-system/core-orb` for base path
- Keep JSON structure simple: `{ userId, modeId, preferences: string[], constraints: string[], updatedAt: string }`
- Handle file read errors gracefully (return null, create defaults)
- Ensure `getOrCreateProfile` creates a profile from presets if missing

### Testing

- Keep `InMemoryLunaPreferencesStore` intact for tests
- File store should work alongside in-memory and database stores
- No breaking changes to existing APIs

### Follow-ups

After completing:
- Note if `architect` needs to update `demoFlow.ts` to use file store by default
- Note if `infra` needs to add `.orb-data/` to `.gitignore` (if not already)

## Output Format

When done, provide:
- Summary of changes per file
- Any commands run (lint, test, build)
- Follow-ups for other agents

