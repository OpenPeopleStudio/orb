# Phase Status & Next Steps

## Phase 0: Clean Repo State

**Status**: ⚠️ Needs Attention

**Current State**:
- 17 worktrees detected (many appear to be detached HEAD)
- Main branch has committed changes
- Some unstaged changes remain in core packages

**Action Required**:
1. Review worktrees for any important changes:
   ```bash
   git worktree list
   # For each worktree, check if it has changes you care about
   ```
2. For worktrees with changes:
   - Create branch: `git switch -c feature/<salvage>`
   - Commit changes: `git add . && git commit -m "..."`  
   - Merge/cherry-pick into main
   - Remove worktree: `git worktree remove <path>`
3. For worktrees without changes: `git worktree remove <path>`

**Recommendation**: Clean up worktrees before proceeding to avoid confusion.

---

## Phase 1: Forge Agent Registry

**Status**: ✅ Complete

**What Was Done**:
- Added rationale comments to each agent in `packages/forge/src/agents.ts`
- Updated `orb-system/docs/ORB_IDENTITY.md` with multi-agent system section
- Created comprehensive Phase 0-7 roadmap
- Added SomaOS porting plan document
- Created per-agent task templates
- Added Ultra workflow quick start guide

**Commit**: `8a6e057` - "chore(forge): stabilize agent registry and Orb identity"

---

## Phase 2: Ultra OS Layer (Prompts & Bootloader)

**Status**: ✅ Complete

**What Was Done**:
- Bootloader exists: `docs/prompts/forge-agent-bootloader.md`
- Task templates created:
  - `docs/prompts/luna/persist-luna-file-store.md`
  - `docs/prompts/te/persist-te-file-store.md`
  - `docs/prompts/mav/file-executor.md`
  - `docs/prompts/orb-web/mode-aware-console.md`
- Quick start guide: `docs/prompts/ULTRA_WORKFLOW_QUICK_START.md`

**Ready to Use**: Yes - you can now use the bootloader with task templates.

---

## Phase 4: First Ultra Missions

### Mission 4.1 – Persist Luna & Te

**Status**: ✅ Complete (Already Implemented)

**Verification**:
- ✅ `FileLunaPreferencesStore` exists in `orb-system/packages/core-luna/src/filePreferencesStore.ts`
- ✅ `FileTeReflectionStore` exists in `orb-system/packages/core-te/src/fileReflectionStore.ts`
- ✅ Store factories (`createDefaultLunaStore`, `createDefaultTeStore`) use file stores by default
- ✅ `demoFlow.ts` uses the factories
- ✅ Default persistence mode is `'file'`

**What's Working**:
- Luna preferences persist to `.orb-data/luna/profiles.json`
- Te reflections persist to `.orb-data/te/reflections.json`
- Stores use `@orb-system/core-orb`'s `fileStore` utilities
- In-memory stores remain for tests

**Next Steps**: Mission 4.1 is complete. Move to Mission 4.2 or 4.3.

---

### Mission 4.2 – Give Mav Real Hands

**Status**: 🟡 Partial

**Current State**:
- `FileMavExecutor` exists and logs to `.orb-data/mav/actions.log`
- Need: Whitelisted file writer that can actually write files (not just log)

**Task Template**: `docs/prompts/mav/file-executor.md`

**To Complete**:
1. Use bootloader with `{AGENT_ID}` = `mav`
2. Use task from `docs/prompts/mav/file-executor.md`
3. Implement `FileSystemMavExecutor` with path whitelist
4. Test with safe paths only

---

### Mission 4.3 – Mode-Aware Loop in the UI

**Status**: ⚪ Not Started

**Current State**:
- orb-web has basic console UI
- Mode selector exists
- Need: Detailed view showing full loop (mode → Luna → Mav → Te)

**Task Template**: `docs/prompts/orb-web/mode-aware-console.md`

**To Complete**:
1. Use bootloader with `{AGENT_ID}` = `orb_ui`
2. Use task from `docs/prompts/orb-web/mode-aware-console.md`
3. Implement console view showing all segments
4. Wire to `demoFlow` results

---

## How to Use Ultra Workflow

### Example: Complete Mission 4.2

1. **Open Bootloader Template**:
   - Read `docs/prompts/forge-agent-bootloader.md`

2. **Fill Template**:
   ```markdown
   # ORB Forge Agent Bootloader
   
   Your identity for THIS run is:
   > **AGENT_ID:** `mav`
   
   {TASK_BLOCK} = 
   
   [Paste contents of docs/prompts/mav/file-executor.md]
   ```

3. **Run in Cursor**:
   - Agent will:
     - Read `packages/forge/src/agents.ts`
     - Lock to `packages/core-mav/**` scope
     - Implement file executor
     - Report changes

4. **Review & Commit**:
   - Review agent output
   - Run tests: `pnpm lint && pnpm typecheck`
   - Commit: `git add packages/core-mav && git commit -m "feat(core-mav): add whitelisted file executor"`

---

## Next Actions

1. **Clean up worktrees** (Phase 0)
2. **Complete Mission 4.2** (Mav file executor) - Use Ultra workflow
3. **Complete Mission 4.3** (Mode-aware UI) - Use Ultra workflow
4. **Move to Phase 5** (Import SomaOS concepts)

---

## Quick Reference

- **Bootloader**: `docs/prompts/forge-agent-bootloader.md`
- **Task Templates**: `docs/prompts/{agent}/`
- **Agent Registry**: `packages/forge/src/agents.ts`
- **Quick Start**: `docs/prompts/ULTRA_WORKFLOW_QUICK_START.md`
- **Roadmap**: `orb-system/docs/ROADMAP.md`

