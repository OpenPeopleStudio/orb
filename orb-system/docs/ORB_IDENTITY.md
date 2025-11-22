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

## Future Extensions

When extending the system:
- Keep roles distinct - don't blur boundaries
- Use `OrbContext` to pass role information
- Document which role a module belongs to
- Follow the canonical definitions above

