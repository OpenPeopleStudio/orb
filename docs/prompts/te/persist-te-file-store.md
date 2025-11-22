# Te Agent Task: Persist Te File Store

## Context

You are the **Te Agent** working on the reflection/memory layer of the Orb system.

**Orb Model Recap**:
- **Sol** → engine (what the model runs on)
- **Te** → reflection (what the model reflects on) ← **You are here**
- **Mav** → execution (what the model accomplishes)
- **Luna** → intent (what the user decides they want it to be)
- **Orb** → shell (UI/app that the human touches)

## Your Scope

You MAY edit files matching:
- `packages/core-te/**`

You MUST NOT edit:
- `node_modules/`, `dist/`, `sol/`, `luna/` scripts
- Other core packages (`core-luna`, `core-mav`, `core-sol`)
- Root configs or docs (that's `architect`'s job)

## Task: Implement File-Backed Te Reflection Store

### Goal

Create a file-backed persistence layer for Te reflections so that evaluations and reflections survive across sessions.

### Current State

- Te has in-memory stores for testing
- Te has database-backed stores (SQLite, Supabase)
- Te needs a simple file-backed store for development and lightweight deployments

### Files to Touch

1. **`packages/core-te/src/fileReflectionStore.ts`** (may already exist)
   - Implement `FileTeReflectionStore` class
   - Use `@orb-system/core-orb`'s `fileStore` utilities (`readJson`, `writeJson`)
   - Store reflections in `.orb-data/te/reflections/{userId}/{sessionId}.json` (or single file per user)
   - Support both per-session and per-user retrieval

2. **`packages/core-te/src/reflectionHelpers.ts`** (types)
   - Ensure `TeReflection` type is properly defined
   - Document the contract

3. **`packages/core-te/src/index.ts`**
   - Export `FileTeReflectionStore` if not already exported

### Implementation Notes

- Use `getDataDirectory()` from `@orb-system/core-orb` for base path
- Keep JSON structure simple: `{ id, input, output, tags: string[], notes?, createdAt: string }`
- Handle file read errors gracefully (return empty array, create defaults)
- Support `getReflections(userId, limit?)` and `getReflectionsBySession(sessionId, limit?)`

### Testing

- Keep `InMemoryTeReflectionStore` intact for tests
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

