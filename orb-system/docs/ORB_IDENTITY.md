# Orb Identity

## Canonical Orb Model

The Orb system is organized into four core layers, wrapped in an Orb shell:

### Sol → What the model runs on

**Role**: Engine / inference / brain

**Responsibilities**:
- Model clients and API wrappers
- Prompt routing logic
- Context window management
- Natural language understanding
- Chat generation and intent parsing
- Token control and streaming

**Package**: `packages/core-sol`

### Te → What the model reflects on

**Role**: Reflection / memory

**Responsibilities**:
- Journaling and reflection pipelines
- Memory storage and retrieval
- Embeddings and semantic search
- Summarization and evaluation
- Self-critique and automated reviews
- Historical pattern analysis

**Package**: `packages/core-te`

### Mav → What the model accomplishes

**Role**: Actions / tools

**Responsibilities**:
- Task execution and scheduling
- Flow orchestration
- External integrations (calendar, inbox, etc.)
- Real-world actions and changes
- Tool invocation and management
- Task graph and dependency resolution

**Package**: `packages/core-mav`

### Luna → What the user decides they want it to be

**Role**: Preferences / intent

**Responsibilities**:
- Mode and persona management
- User preferences and constraints
- Design intent and specifications
- Boundary settings (e.g., "never spend money without confirmation")
- Intent capture and classification
- User-defined behaviors and limits

**Package**: `packages/core-luna`

### Orb → The package everything comes in

**Role**: App / shell / human touchpoint

**Responsibilities**:
- User-facing interface
- Integration of Sol/Te/Mav/Luna layers
- Human interaction and feedback
- Presentation and visualization

**Package**: `apps/orb-web` (and future UI packages)

## System Identity Map

```
Umbrella: Orb
  └── Layers:
      ├── core-sol  → Sol (engine)
      ├── core-te   → Te (reflection)
      ├── core-mav  → Mav (actions)
      ├── core-luna → Luna (preferences / intent)
      └── core-orb  → Shared identity / config
```

## Design Principles

1. **Separation of Concerns**: Each layer has a clear, distinct responsibility
2. **Role-Based Operations**: All operations are tagged with an `OrbRole` for clarity and routing
3. **Context-Aware**: Operations receive `OrbContext` to understand their role and environment
4. **No New Roles**: Strictly adhere to Sol/Te/Mav/Luna/Orb - do not invent new roles
5. **Consistent Naming**: Use these exact names and meanings throughout the system

## Usage

All packages should import from `@orb-system/core-orb`:

```typescript
import { OrbRole, OrbContext, createOrbContext } from '@orb-system/core-orb';

const context = createOrbContext(OrbRole.SOL, 'session-123', {
  userId: 'user-456',
  deviceId: 'device-789',
});
```

## Multi-Agent Development System (Forge)

The Orb system uses a **multi-agent development approach** via the **Forge** system for coordinated development:

- **Agent Registry**: `packages/forge/src/agents.ts` - Defines all agents, their scopes, and responsibilities
- **Orchestrator**: `packages/forge/src/orchestrator.ts` - Routes tasks to appropriate agents
- **Bootloader**: `docs/prompts/forge-agent-bootloader.md` - Entry point for Ultra agent sessions
- **Templates**: `docs/prompts/forge-agent-template.md` - Template for agent-specific tasks

### Forge Agents

The Forge system defines agents that map to Orb model roles:

- **`architect`** → Owns repo structure, shared types (`core-orb`), docs, and cross-package integration
- **`luna`** → Owns `core-luna` (preferences/intent layer)
- **`te`** → Owns `core-te` (reflection/memory layer)
- **`mav`** → Owns `core-mav` (actions/tools layer)
- **`orb_ui`** → Owns `apps/orb-web` (presentation layer)
- **`infra`** → Owns CI, tests, migrations, infrastructure

**Key Principle**: Each agent has **strict file scopes** that prevent cross-boundary edits. This maintains separation of concerns and prevents accidental architectural violations.

See `packages/forge/src/agents.ts` for the canonical agent registry with rationale.

## Future Extensions

When extending the system:
- Keep roles distinct - don't blur boundaries
- Use `OrbContext` to pass role information
- Document which role a module belongs to
- Follow the canonical definitions above
- When adding new agents, update `packages/forge/src/agents.ts` with rationale

