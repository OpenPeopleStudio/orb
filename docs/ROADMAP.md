# Orb System Roadmap

## Current Implementation Status

### core-orb (Identity Layer)
**Status**: ✅ Complete  
**What's Implemented**:
- `OrbRole` enum (Sol, Te, Mav, Luna)
- `OrbContext` type for role-aware operations
- Configuration loader from environment variables
- Identity documentation (`ORB_IDENTITY.md`)
- **File-store utility** (`fileStore.ts`) for JSON-based persistence
- **Persistence mode configuration** (`PersistenceMode: 'memory' | 'file'`)
- **Store factories** (`createDefaultLunaStore`, `createDefaultTeStore`) for automatic store selection
- **Demo flow wiring** that now selects the default Mav executor via `createDefaultMavExecutor()`

**What Remains**:
- Enhanced configuration validation
- Configuration persistence
- Multi-environment support

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
- See: `docs/prompts/build-core-mav-action-graph.md`

### core-luna (Preferences/Intent)
**Status**: 🟡 Partial  
**What's Implemented**:
- Mode service (Sol, Mars, Earth)
- Persona classifier (basic structure)
- Mode and persona types
- Design documentation (modes, personas)

**What Remains**:
- Preferences schema and API
- Settings store
- Boundary system (constraints)
- Integration with Sol/Te/Mav
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

### forge (Build Automation)
**Status**: ⚪ Not Started  
**What's Implemented**:
- Package structure and README

**What Remains**:
- Test/migration/linting scripts
- Code scanning and refactoring tools
- Integration with Sol/Te/Mav/Luna
- See: `docs/prompts/build-forge-automation-layer.md`

## Next Steps

### Immediate Priorities

1. **Complete Sol Model Orchestrator**
   - Prompt: `docs/prompts/build-core-sol-model-orchestrator.md`
   - Enables proper model management and streaming

2. **Build Te Reflection Engine**
   - Prompt: `docs/prompts/build-core-te-reflection-engine.md`
   - Enables structured reflection and journaling

3. **Implement Mav Action Graph**
   - Prompt: `docs/prompts/build-core-mav-action-graph.md`
   - Enables proper task orchestration and integrations

### Secondary Priorities

4. **Complete Luna Intent Layer**
   - Prompt: `docs/prompts/build-core-luna-intent-layer.md`
   - Enables user preferences and boundaries

5. **Build Forge Automation**
   - Prompt: `docs/prompts/build-forge-automation-layer.md`
   - Enables continuous improvement

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

## Future Enhancements

- Web UI for orb-web
- Real-time collaboration features
- Advanced analytics and insights
- Plugin system for custom integrations
- Multi-user support
- Offline capabilities

## Current Capabilities Snapshot
- `core-orb` — Provides `OrbRole`, `OrbContext`, environment-aware config helpers, and demo flow orchestration.
- `core-sol` — Includes a `summarizeThread` inference shim plus fetch-mock support for Sol experiments.
- `core-te` — Offers `buildReflectionSession` for Supabase reflections/tasks and basic evaluation helpers.
- `core-mav` — Runs Golden/Task flows, emits structured task results, and logs real actions to `.orb-data/mav/actions.log`.
- `core-luna` — Encodes Sol/Mars/Earth/Luna mode definitions plus a contextual resolver + mode service.
- `apps/orb-web` — CLI/console shell that demonstrates Sol/Te/Mav/Luna surfaces using the in-memory stores.

