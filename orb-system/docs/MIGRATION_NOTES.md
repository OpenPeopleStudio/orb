# Migration Notes

## Repositories Discovered

### 1. SomaOS/ (iOS Swift Application)
**Path**: `/Users/mars/.cursor/worktrees/SomaOS/7MiVd/SomaOS/`  
**Language**: Swift  
**Purpose**: Main iOS application with 27+ services handling UI, business logic, and integrations.  
**Key Components**:
- Services layer with AI orchestration, reflection, memory, tasks, calendar, inbox, etc.
- Conscious Tools framework (Insight Capsule, Focus Sanctuary, Quantum Flip, Mood Dials)
- Models and UI components
- Integration with Supabase backend

**Migration Targets**:
- Sol: `Services/AIOrchestrator.swift`, `Services/ConsciousTools/Shared/ConsciousAI.swift`, `Services/NLUService.swift`, `Services/ChatService.swift`
- Te: `Services/ReflectionService.swift`, `Services/MemoryService.swift`
- Mav: `Services/TaskService.swift`, `Services/CalendarService.swift`, `Services/InboxService.swift`, `Services/FlowForgeService.swift`
- Luna: `Services/ModeService.swift`, `Services/PersonaClassifier.swift`, `Models/LauncherModels.swift`

### 2. forge-node/ (TypeScript Node.js Service)
**Path**: `/Users/mars/.cursor/worktrees/SomaOS/7MiVd/forge-node/`  
**Language**: TypeScript  
**Purpose**: Always-on orchestration brain for flows, tasks, and agent execution.  
**Key Components**:
- Core Engine Service (HTTP/WebSocket API)
- Agent Orchestrator Worker (flow execution)
- Prompt-Building Daemons (intent → structured prompts → task flows)

**Migration Targets**:
- Mav: Entire `src/` directory (core-engine, agent-orchestrator, prompt-daemons)

### 3. playground/ (Experimental Features)
**Path**: `/Users/mars/.cursor/worktrees/SomaOS/7MiVd/playground/`  
**Language**: TypeScript/Swift  
**Purpose**: Experimental features, AlienPlayground evolution system, animation engine.  
**Key Components**:
- AlienPlayground (alien evolution, state management, interactions)
- Animation engine
- Queue processor for evolution tasks

**Migration Status**: Left as-is for now (experimental, may migrate later)

### 4. supabase/ (Backend Functions)
**Path**: `/Users/mars/.cursor/worktrees/SomaOS/7MiVd/supabase/`  
**Language**: TypeScript/Deno  
**Purpose**: Supabase Edge Functions for backend API endpoints.  
**Key Components**:
- 100+ edge functions for various integrations
- Reflection engine (`_shared/reflectionEngine.ts`)
- Chat generation, intent parsing, emotion analysis
- Flow orchestration, task management
- Embeddings and memory functions

**Migration Targets**:
- Sol: `functions/chat-generate/`, `functions/chat-generate-stream/`, `functions/parse-intent/`, `functions/emotion-analyze/`
- Te: `functions/_shared/reflectionEngine.ts`, `functions/add-reflection/`, `functions/get-reflections/`, `functions/create-embedding/`, `functions/search-embeddings/`, `functions/summarize-thread/`
- Mav: `functions/orchestrate-flow/`, `functions/run-flow/`, integration functions (gmail, calendar, finance, etc.)
- Luna: `functions/set-mode/`, `functions/get-mode/`, `functions/set-identity/`

### 5. sol/ (Design Workspace)
**Path**: `/Users/mars/.cursor/worktrees/SomaOS/7MiVd/sol/`  
**Language**: Markdown/Documentation  
**Purpose**: Design studio for OS surface, navigation, and emotional feel. Contains design briefs, navigation specs, component inventories, and exploration prompts.  
**Key Components**:
- `config/` - Device identity, modes, personas
- `design/` - Design briefs, navigation specs, component inventories
- `prompts/` - Ready-to-run prompts for explorations
- `workspace/` - Active explorations and archives

**Migration Targets**:
- Luna: Entire `sol/` directory (design intent, modes, personas) → `packages/core-luna/docs/`

### 6. coordinator/ (Multi-Agent Routing)
**Path**: `/Users/mars/.cursor/worktrees/SomaOS/7MiVd/coordinator/`  
**Language**: TypeScript  
**Purpose**: Multi-agent development system for routing tasks between ProdAgent, PlaygroundAgent, and CoordinatorAgent.  
**Key Components**:
- Router for task routing
- Promotion rules for feature promotion
- Agent manifest

**Migration Status**: Left as-is (separate concern, may integrate later)

## Migration Strategy

### Code Migration Approach
1. **Swift → TypeScript**: All Swift code will be rewritten to TypeScript for consistency with existing Node.js/Deno codebase
2. **Preservation**: All existing repos remain intact as read-only archives
3. **Incremental**: Migrate code commit-by-commit, preserving git history where possible
4. **Documentation**: Each migrated file includes header comment linking back to source

### Files Intentionally Left Behind
- `playground/` - Experimental features, may migrate later
- `coordinator/` - Separate multi-agent system, may integrate later
- iOS-specific UI code in `SomaOS/Views/` - Will remain in SomaOS for now
- Supabase migrations and schema files - Backend infrastructure, separate concern

### Technical Debt & Rough Edges
- Swift to TypeScript conversion will require careful type mapping
- Some Swift-specific patterns (actors, @MainActor) need TypeScript equivalents
- Supabase functions may need refactoring to work as package modules
- Integration between packages will need careful dependency management
- Some services have tight coupling that will need to be decoupled

## Migration Progress

### Completed
- [x] Repository discovery and documentation
- [x] Monorepo structure creation
- [x] Core-orb identity layer implementation
- [x] Sol code migration (basic inference/engine code)
- [x] Te code migration (basic reflection/memory code)
- [x] Mav code migration (basic actions/tools code)
- [x] Luna code migration (basic preferences/intent code)
- [x] Orb role wiring (all code uses OrbRole/OrbContext)
- [x] Orb-web shell creation (minimal demo)
- [x] Future prompt files creation (5 prompts)

### Migration Details

#### Core-Orb (Identity Layer)
**Migrated**: Complete implementation
- `packages/core-orb/src/orbRoles.ts` - OrbRole enum and OrbContext type
- `packages/core-orb/src/config.ts` - Configuration loader
- `docs/ORB_IDENTITY.md` - Canonical Orb model definitions

#### Core-Sol (Inference/Engine)
**Migrated from**:
- `SomaOS/Services/ConsciousTools/Shared/ConsciousAI.swift` → `packages/core-sol/src/modelClient.ts`
- `SomaOS/Services/NLUService.swift` → `packages/core-sol/src/nlu.ts`
- `supabase/functions/chat-generate/index.ts` → `packages/core-sol/src/chatGenerate.ts`
- `supabase/functions/parse-intent/index.ts` → `packages/core-sol/src/intentParser.ts`
- `supabase/functions/emotion-analyze/index.ts` → `packages/core-sol/src/emotionAnalyzer.ts`

**Status**: Basic structure migrated, needs model orchestrator (see prompts)

#### Core-Te (Reflection/Memory)
**Migrated from**:
- `SomaOS/Services/ReflectionService.swift` → `packages/core-te/src/reflection.ts`
- `SomaOS/Services/MemoryService.swift` → `packages/core-te/src/memory.ts`
- `supabase/functions/_shared/reflectionEngine.ts` → `packages/core-te/src/reflectionEngine.ts`
- `supabase/functions/create-embedding/index.ts` → `packages/core-te/src/embeddings.ts`

**Status**: Basic structure migrated, needs reflection pipeline (see prompts)

#### Core-Mav (Actions/Tools)
**Migrated from**:
- `SomaOS/Services/TaskService.swift` → `packages/core-mav/src/tasks.ts`
- `forge-node/src/agent-orchestrator/flow-executor.ts` → `packages/core-mav/src/orchestrator/flowExecutor.ts`
- `SomaOS/Services/CalendarService.swift` → `packages/core-mav/src/integrations/calendar.ts`
- `SomaOS/Services/InboxService.swift` → `packages/core-mav/src/integrations/inbox.ts`

**Status**: Basic structure migrated, needs task graph and real integrations (see prompts)

#### Core-Luna (Preferences/Intent)
**Migrated from**:
- `SomaOS/Services/ModeService.swift` → `packages/core-luna/src/modes.ts`
- `SomaOS/Services/PersonaClassifier.swift` → `packages/core-luna/src/personas.ts`
- `SomaOS/Models/LauncherModels.swift` → `packages/core-luna/src/types.ts`
- `sol/config/sol_modes.md` → `packages/core-luna/docs/modes.md`
- `sol/config/sol_personas.md` → `packages/core-luna/docs/personas.md`
- `sol/design/` → `packages/core-luna/docs/design/`

**Status**: Basic structure migrated, needs preferences schema and boundaries (see prompts)

#### Orb-Web (App Shell)
**Created**: Minimal demo application
- `apps/orb-web/src/index.ts` - Demonstrates all four roles

**Status**: Basic demo complete, needs full UI (if desired)

### Files Intentionally Left Behind
- `playground/` - Experimental features, may migrate later
- `coordinator/` - Separate multi-agent system, may integrate later
- iOS-specific UI code in `SomaOS/Views/` - Will remain in SomaOS for now
- Supabase migrations and schema files - Backend infrastructure, separate concern
- Most of `AIOrchestrator.swift` - Large file, complex state management, needs careful refactoring

### Technical Debt & Rough Edges
- Swift to TypeScript conversion completed for migrated code
- Some Swift-specific patterns (actors, @MainActor) converted to TypeScript equivalents
- Supabase functions converted to package modules but need backend integration
- Integration between packages uses workspace dependencies (needs monorepo tooling)
- Some services have placeholder implementations (need real backend API calls)
- Database access is abstracted but not implemented (needs Supabase client integration)
- Model provider abstraction exists but only OpenAI is implemented

### Next Steps
See `ROADMAP.md` for detailed next steps and prompt files in `docs/prompts/` for building out each module.

<<<<<<< Current (Your changes)
=======
- Workspace already contains multiple repos (matches assumptions). No deviations detected yet. Future deviations will be documented here.

## Migration Log

- `core-sol`: Added `summarizeThread` orchestrator derived from `supabase/functions/summarize-thread/index.ts`. OpenAI call sites moved while leaving the Deno wrapper behind for Supabase functions (still needed for deployment).
- `core-te`: Ported reflection session aggregation from `forge-node/src/core-engine/routes/reflection.ts`. HTTP/Express wiring remains in Forge Node.
- `core-mav`: Moved Golden Flow orchestration bits from `forge-node/src/core-engine/routes/flows.ts`. Express route handlers/CORS plumbing still live in Forge Node.
- `core-luna`: Encoded mode definitions from `sol/config/sol_modes.md` as TypeScript data + helpers. Markdown source kept as canonical design reference.

## Left Behind / Archives

- Supabase edge functions continue to live in `../supabase/functions/` until Sol orchestrator supports multi-provider deployments.
- Full Forge Node Express server (`../forge-node`) remains authoritative for production APIs; orb-system only mirrors the underlying logic.
- Alien evolution code stays inside `../playground` for now; future Te memory ingestion should read from that repo rather than duplicating.

## Known Debt

- In-memory Supabase client within `apps/orb-web` is for demos only. Replace with real clients once authentication and migrations are wired.
- Package `package.json` files declare file-based dependencies but no workspace-level tooling exists yet. Add pnpm/yarn workspaces in a follow-up.
>>>>>>> Incoming (Background Agent changes)
