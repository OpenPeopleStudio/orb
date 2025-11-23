# Orb System Roadmap

## Overview

This roadmap defines the evolution of `orb-system` from a TypeScript monorepo into a **learning OS** that genuinely adapts from usage. The plan is structured in phases, with each phase building on the previous one.

**Key Principle**: `orb-system` is the **brain & skeleton** (types, flows, multi-agent Forge, web UI). SomaOS (SwiftUI app) is the **first organism** that provides concepts, architecture, and flows that Orb learns from.

---

## Phase 0 – Clean State on Sol & Luna

**Goal**: Ensure Ultra runs on a clean baseline on both machines.

**Status**: ⚪ Ready to execute

### Tasks

1. **Treat `orb-system` as the only real thing**
   - If it's not in `orb-system`, it's either legacy or an experiment.

2. **Get `main` clean on Sol**
   - From repo root (`/orb-system/orb-system`):
     - `git status`
     - Commit anything real
     - Delete / stash trash

3. **Kill cursed worktrees**
   - `git worktree list`
   - For each non-luna worktree:
     - If changes you care about: `git switch -c feature/<salvage>` → `git add .` → `git commit` → merge/cherry-pick into main
     - Then `git worktree remove <path>`

4. **Sync to Luna**
   - On Sol: `git push`
   - On Luna: `git pull`
   - Now **Ultra runs on the same clean baseline** on both machines

**Outcome**: Clean repo state, no orphaned worktrees, Sol and Luna in sync.

---

## Phase 1 – Forge as the Org Chart (Lock the Team)

**Goal**: Freeze the agent registry as the canonical "company directory" for Ultra sessions.

**Status**: 🟡 In Progress

### Tasks

1. **Freeze the agent registry**
   - Ensure `packages/forge/src/agents.ts` has all agents:
     - `architect`, `luna`, `te`, `mav`, `orb_ui`, `infra`
   - Scopes are honest and specific
   - Add brief rationale per agent in comments

2. **Align docs with code**
   - `docs/ORB_IDENTITY.md`: Ensure Sol/Luna/Mav/Te/Orb definitions match Forge agent roles
   - `docs/ROADMAP.md`: Add "Multi-agent system" section pointing to `packages/forge` and `docs/prompts`

3. **Commit as "definition of team"**
   ```bash
   git add docs packages/forge
   git commit -m "chore(forge): stabilize agent registry and Orb identity"
   git push
   ```

**Outcome**: Single source of truth for agent roles, scopes, and responsibilities. Ultra sessions read one truth about who's allowed to touch what.

---

## Phase 2 – Ultra "OS Layer": Prompts, Bootloader & Task Tickets

**Goal**: Make prompts non-negotiable entry points for Ultra agents.

**Status**: 🟡 Partial (bootloader exists, task templates needed)

### Tasks

1. **Make the bootloader the one true entrypoint**
   - `docs/prompts/forge-agent-bootloader.md` should:
     - Read `packages/forge/src/agents.ts`
     - Resolve `{AGENT_ID}` → scopes, responsibilities
     - Enforce:
       - Only touch whitelisted paths
       - No `git push`, no branching, no worktree creation
       - Clear output format: summary + file list + diff reasoning

2. **Create per-agent task templates**
   - Under `docs/prompts/` add:
     - `luna/persist-luna-file-store.md`
     - `te/persist-te-file-store.md`
     - `mav/file-executor.md`
     - `orb-web/mode-aware-console.md`
   - Each template should include:
     - Short recap of Orb model (Luna/Te/Mav/Sol roles)
     - Concrete goals
     - Exact files to touch (e.g. `packages/core-luna/src/**`)
     - Non-touch zones (e.g. avoid `node_modules`, `dist`, `sol/`, `luna/` scripts)

3. **Establish core roster**
   - Typically run: `architect`, `luna`, `te`, `mav`, `orb_ui`
   - `infra` used rarely
   - Spin up 2–4 at a time, not all 6 simultaneously

**Outcome**: Agents don't free-roam; they take tickets. Clear boundaries and expectations.

---

## Phase 3 – Cursor Ultra Day-1 Workflow

**Goal**: Define how you actually work with Ultra agents.

**Status**: ⚪ Ready to adopt

### Workflow

1. **Starting a session**
   - Per agent:
     - In Cursor, open `docs/prompts/forge-agent-bootloader.md`
     - Substitute:
       - `{AGENT_ID}` → `luna` / `te` / `mav` / `orb_ui` / `architect`
       - `{TASK_BLOCK}` → paste from specific task prompt (e.g. `luna/persist-luna-file-store.md`)
   - Run that. Let it:
     - Read `packages/forge/src/agents.ts`
     - Lock scope
     - Plan & edit

2. **Commit cadence**
   - Per "feature wave":
     - Let Luna / Te / Mav / Orb_UI each do their tasks
     - Review diffs in Cursor (reject stupid changes, ask follow-ups)
     - Run tests / build once: `pnpm lint`, `pnpm typecheck`, `pnpm dev` smoke
     - Commit with clear slices:
       ```bash
       git add packages/core-luna
       git commit -m "feat(core-luna): add file-backed preferences store"
       
       git add packages/core-te
       git commit -m "feat(core-te): add file-backed reflection store"
       ```

**Outcome**: Ultra gives you concurrency; you still serialize reality with focused commits.

---

## Phase 4 – First "Ultra" Missions (Make the Loop Real)

**Goal**: Make Luna–Mav–Te loop persistent, visible, and actionable.

**Status**: 🟡 Partial (some persistence exists)

### Mission 4.1 – Persist Luna & Te

**Goal**: No more in-memory only decisions / reflections.

**Targets**:
- `packages/core-luna/**`
- `packages/core-te/**`
- `packages/core-orb/src/demoFlow.ts`

**Steps**:
1. Implement simple file-backed stores:
   - `packages/core-luna/src/store/FileLunaPreferencesStore.ts`
   - `packages/core-te/src/store/FileTeReflectionStore.ts`
   - Use JSON files keyed by `userId`/`sessionId`. Keep it dead simple so you can swap later.

2. In `demoFlow.ts`:
   - Replace `createDefaultLunaStore` / `createDefaultTeStore` with factory functions that use file stores by default.
   - Leave in-memory variants for tests.

**Agents**: `architect + luna + te`

---

### Mission 4.2 – Give Mav Real Hands

**Goal**: Mav can actually act on files in a controlled way.

**Targets**:
- `packages/core-mav/**`
- Possibly `packages/core-mav/src/executors/FileSystemExecutor.ts`

**Steps**:
1. Implement a **whitelisted file executor**:
   - Given a task like "write this content to file X":
     - Check path against allowlist (e.g. `apps/**`, `packages/**`)
     - Never touch `.git`, `node_modules`, `dist`, etc.

2. Ensure Mav emits structured `MavTaskResult` with:
   - `filesTouched`
   - `summary`
   - `errors`

**Agents**: `mav + architect` (and `orb_ui` if you surface it)

---

### Mission 4.3 – Mode-Aware Loop in the UI

**Goal**: See the whole loop.

**Targets**:
- `packages/core-orb/src/demoFlow.ts`
- `apps/orb-web/src/features/orbConsole/**` (or equivalent)

**Steps**:
1. Make `demoFlow`:
   - Accept `mode` (Sol / Luna / Earth / Mars) as input.
   - Teach Luna to vary decisions by mode (even basic heuristics).

2. orb-web:
   - Add a console view that shows, for one run:
     - `mode`
     - Luna decision
     - Mav task & result
     - Te evaluation
   - This is your **debug HUD** for the OS loop.

**Agents**: `architect` (demoFlow) + `orb_ui`

**Outcome**: Luna that remembers, Te that remembers, Mav that can act, UI to see the whole cycle.

---

## Phase 5 – Import SomaOS Concepts into core-orb

**Goal**: Orb's domain & flows match what you already learned from SomaOS, but implemented in TypeScript & web-first.

**Status**: 🟡 In Progress

### Tasks

1. **Port identity & mode model**
   - Target: `packages/core-orb/src/**`
   - Define types:
     - `OrbUser`, `OrbDevice`, `OrbPersona`, `OrbMode`, `OrbStream` (messages, events, tasks)
   - Base them on existing Supabase schema that SomaOS used; just don't hardwire Supabase yet
   - Create single `core-orb` source of truth for:
     - Devices: Sol, Luna, Mars, Earth
     - Personas: Personal / SWL / RealEstate / OpenPeople
     - Modes: explorer, forge, etc.

2. **Turn SomaOS checklists into Orb flows**
   - Use things like:
     - `V1_VERIFICATION_CHECKLIST.md`
     - `SYSTEM_READY.md`
     - `DATABASE_PUSH_GUIDE.md`
   - To define:
     - `core-orb` "system readiness checks" (e.g. `checkSupabaseConnection`, `checkGitConfig`, `checkNodeVersion`)
     - Simple "ready state" API returning structured report for UI

3. **Extract module ideas as Orb "domains"**
   - From SomaOS docs & structure, define future domains in `core-orb` as simple type modules:
     - `identity` (profiles, devices, accounts)
     - `messaging` (email, SMS, app messages)
     - `contacts` (graph of people, emotional signals)
     - `finances` (transactions, categories, accounts)
     - `playground` (alien, emotional reflection)
   - You're not rebuilding all features yet. Just **naming the domains and giving them types**.

**Agents**: `architect` + maybe short-lived `infra` helper to keep types clean

**See Also**: `docs/SOMAOS_PORTING_PLAN.md` for detailed mapping

**Progress**:
- Identity & mode descriptors now live in `packages/core-orb/src/identity/types.ts` and are consumed by Luna services.
- `packages/core-orb/src/system/` exposes `runSystemReadiness()` plus Supabase/Git/Node/database checks.
- Domain barrels exist under `packages/core-orb/src/domains/**` (contacts, messaging, finances, playground) for layer alignment.

---

## Phase 6 – Learning Loop: Orb Actually Learns from Usage

**Goal**: "OS that learns" stops being a slogan.

**Status**: 🟢 Ready to Start

**Mission Prompt**: `docs/prompts/MISSION_6_LEARNING_LOOP.md`  
**Agent Prompts**: `docs/prompts/learning-loop/`

### Tasks

1. **Define an event bus in core-orb**
   - Target: `packages/core-orb/src/**`
   - Create an `OrbEvent` type:
     - `type` (e.g. `TASK_RUN`, `ERROR`, `USER_ACTION`, `REFLECTION`)
     - `timestamp`
     - `userId`, `deviceId`, `mode`
     - `payload` (structured)
   - Implement simple in-memory event store **plus** pluggable "sink" interface:
     - `OrbEventSink` → later: Supabase, file-based log, analytics

2. **Wire the loop to emit events**
   - `demoFlow`:
     - Emits events when Luna decides, Mav acts, Te evaluates
   - orb-web:
     - Emits events when user clicks / selects modes / runs flows

3. **Build a tiny adaptation engine**
   - Start with dumb but useful:
     - From logs, compute:
       - "Most used modes"
       - "Features with failing tasks"
     - Use that to:
       - Promote shortcuts in UI
       - Adjust default prompts for Luna/Te (e.g. change temperature, change heuristics)

**Agents**: `architect + te` (reflection logic) + `orb_ui`

**Later**: This grows into "alignment metrics / ERS / CPI" stuff, but v1 can be basic.

---

## Phase 7 – Multi-Device & Auto-Building Behavior

**Goal**: Get closer to "OS builds itself" fantasy, but with brakes.

**Status**: ⚪ Not Started

### Tasks

1. **Make Orb callable from Sol and Luna**
   - Add small CLI / Node entry (future `apps/orb-cli` or scripts in `sol/` and `luna/` folders):
     - Commands like:
       - `orb run demo-flow`
       - `orb run agent-mission --agent=luna --task=persist-store`
     - These should route to core-orb flows and, optionally, spawn Cursor sessions when needed (even if initially manual)

2. **Luna as Forge Host**
   - On **Luna (PC / WSL)**:
     - Maintain scripts under `luna/`:
       - Start dev session for heavy builds (e.g. numerical tasks, CI, maybe local LLMs later)
       - Run periodic agent jobs (nightly refactors, documentation sync)
     - Orb's `infra` agent should own these scripts conceptually, even if you write them

3. **Self-building, with guard rails**
   - Goal: Orb agents help maintain orb-system, not randomly refactor the universe
   - Define categories of work that *can* be automated:
     - Docs sync (e.g. porting SomaOS docs into orb docs)
     - Type cleanup
     - UI polish
   - For each category, create dedicated Ultra task prompt under `docs/prompts/*` and keep:
     - Strict path scope
     - Requirement to add summary note in `docs/changelog/agent/<date>.md`
   - Human you still reviews & commits

**Outcome**: Orb can be invoked from multiple devices, and agents can maintain the repo within guardrails.

---

## Current Implementation Status

### core-orb (Identity Layer)
**Status**: ✅ Complete  
**What's Implemented**:
- `OrbRole` enum (Sol, Te, Mav, Luna)
- `OrbContext` type for role-aware operations
- Configuration loader from environment variables
- Identity documentation (`ORB_IDENTITY.md`)
- **File-store utility** (`fileStore.ts`) for JSON-based persistence
- **Persistence mode configuration** (`PersistenceMode: 'memory' | 'file' | 'database'`)
- **Store factories** (`createDefaultLunaStore`, `createDefaultTeStore`) for automatic store selection
- **Demo flow wiring** that now selects the default Mav executor via `createDefaultMavExecutor()`

**What Remains**:
- Enhanced configuration validation
- Configuration persistence
- Multi-environment support
- Event bus (Phase 6)
- Domain types from SomaOS (Phase 5)

### core-sol (Inference/Engine)
**Status**: 🟡 Partial  
**What's Implemented**:
- Model client for AI interactions
- NLU service (intent parsing, emotion analysis)
- Intent parser
- Emotion analyzer
- Chat generation with context awareness

**What Remains**:
- Model orchestrator for multiple providers
- Context window management
- Streaming support
- Token usage tracking
- See: `docs/prompts/build-core-sol-model-orchestrator.md`

### core-te (Reflection/Memory)
**Status**: 🟡 Partial  
**What's Implemented**:
- Reflection service (basic CRUD)
- Memory service (embeddings, semantic search)
- Reflection engine for financial insights
- Embeddings creation
- **File-backed reflection persistence** (`FileTeReflectionStore`) using JSON files in `.orb-data/te/`
- SQLite-backed reflection store (`SqlTeReflectionStore`) for database persistence
- Shared file-store utility in `core-orb` for all file-based persistence

**What Remains**:
- Reflection pipeline API
- Structured journaling system
- Reflection summaries and storage
- Action evaluation hooks
- Event emission (Phase 6)
- See: `docs/prompts/build-core-te-reflection-engine.md`

### core-mav (Actions/Tools)
**Status**: 🟡 Partial  
**What's Implemented**:
- Task service (basic CRUD)
- Flow executor with dependency resolution
- Calendar integration (placeholder)
- Inbox integration (placeholder)
- **File-based executor (`FileMavExecutor`) that appends JSONL entries to `./.orb-data/mav/actions.log`**
- **Mock executor + env-driven selector (`ORB_MAV_EXECUTOR`) via `createDefaultMavExecutor()`**
- Task runner now returns structured action metadata for UI + Te hooks

**What Remains**:
- Task graph structure
- Task scheduling and queues
- Real integration adapters (Google Calendar, Gmail, etc.)
- Additional executors (HTTP, domain-specific)
- Whitelisted file executor (Phase 4.2)
- See: `docs/prompts/build-core-mav-action-graph.md`

### core-luna (Preferences/Intent)
**Status**: 🟡 Partial  
**What's Implemented**:
- Mode service (Sol, Mars, Earth)
- Persona classifier (basic structure)
- Mode and persona types
- Design documentation (modes, personas)
- **File-backed preferences store** (`FileLunaPreferencesStore`)
- **Database-backed preferences store** (`DbLunaPreferencesStore`)

**What Remains**:
- Preferences schema and API
- Settings store
- Boundary system (constraints)
- Integration with Sol/Te/Mav
- Mode-aware decision variation (Phase 4.3)
- See: `docs/prompts/build-core-luna-intent-layer.md`

### orb-web (App Shell)
**Status**: 🟡 Minimal  
**What's Implemented**:
- Basic console UI showing Sol/Te/Mav/Luna roles
- Mode selector + prompt input
- **Mav panel now renders task status, action list, and file-log hints**

**What Remains**:
- Web UI polish and routing
- Full-featured shell application
- Visualization of Orb system state over time
- Server wiring for `/api/demo-flow` endpoint
- Mode-aware console view (Phase 4.3)

### forge (Multi-Agent System)
**Status**: 🟡 Partial  
**What's Implemented**:
- Agent registry (`packages/forge/src/agents.ts`)
- Task types and orchestrator (`packages/forge/src/orchestrator.ts`)
- Bootloader prompt (`docs/prompts/forge-agent-bootloader.md`)
- Agent template (`docs/prompts/forge-agent-template.md`)

**What Remains**:
- Per-agent task templates (Phase 2)
- Task ticket system
- Agent coordination workflows
- See: `docs/prompts/forge-agent-bootloader.md`

---

## Multi-Agent System

The Orb system uses a multi-agent development approach via the **Forge** system:

- **Agent Registry**: `packages/forge/src/agents.ts` - Defines all agents, their scopes, and responsibilities
- **Orchestrator**: `packages/forge/src/orchestrator.ts` - Routes tasks to appropriate agents
- **Bootloader**: `docs/prompts/forge-agent-bootloader.md` - Entry point for Ultra agent sessions
- **Templates**: `docs/prompts/forge-agent-template.md` - Template for agent-specific tasks

**Agents**:
- `architect` - Repo structure, docs, root configs, cross-package integration
- `luna` - Intent layer (modes, preferences, constraints)
- `te` - Reflection layer (journaling, evaluation, summarization)
- `mav` - Execution layer (actions, task graphs, integrations)
- `orb_ui` - UI/presentation layer (orb-web)
- `infra` - CI, tests, migrations, infra glue

See `docs/ORB_IDENTITY.md` for how these map to the Orb model (Sol/Te/Mav/Luna/Orb).

---

## Migration Status

See `MIGRATION_NOTES.md` for detailed migration information.

**Summary**:
- ✅ Core identity layer (core-orb)
- ✅ Basic Sol code migrated (inference/engine)
- ✅ Basic Te code migrated (reflection/memory)
- ✅ Basic Mav code migrated (actions/tools)
- ✅ Basic Luna code migrated (preferences/intent)
- ✅ Design docs migrated from sol/ directory
- ⚪ Full feature parity with original repos (in progress)
- ⚪ SomaOS concept porting (Phase 5)

---

## Future Enhancements

- Web UI for orb-web
- Real-time collaboration features
- Advanced analytics and insights
- Plugin system for custom integrations
- Multi-user support
- Offline capabilities
- Learning loop (Phase 6)
- Multi-device orchestration (Phase 7)

---

## Current Capabilities Snapshot

- `core-orb` — Provides `OrbRole`, `OrbContext`, environment-aware config helpers, and demo flow orchestration.
- `core-sol` — Includes a `summarizeThread` inference shim plus fetch-mock support for Sol experiments.
- `core-te` — Offers `buildReflectionSession` for Supabase reflections/tasks and basic evaluation helpers.
- `core-mav` — Runs Golden/Task flows, emits structured task results, and logs real actions to `.orb-data/mav/actions.log`.
- `core-luna` — Encodes Sol/Mars/Earth/Luna mode definitions plus a contextual resolver + mode service.
- `apps/orb-web` — CLI/console shell that demonstrates Sol/Te/Mav/Luna surfaces using the in-memory stores.
- `packages/forge` — Multi-agent system for coordinated development with scoped agents.
