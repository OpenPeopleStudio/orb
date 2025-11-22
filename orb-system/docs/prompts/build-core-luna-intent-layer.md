# Build Core-Luna Intent Layer

## Orb Context

You are working on the **Luna** layer of the Orb system. Luna is "what the user decides they want it to be" - preferences, constraints, modes, and intent settings.

**Orb Model Recap:**
- **Sol** → What the model runs on (engine/inference/brain)
- **Te** → What the model reflects on (reflection/memory)
- **Mav** → What the model accomplishes (actions/tools)
- **Luna** → What the user decides they want it to be (preferences/intent) ← **YOU ARE HERE**
- **Orb** → The package everything comes in (app/shell)

## Current State

The `core-luna` package has been scaffolded with:
- Mode service (`modes.ts`)
- Persona classifier (`personas.ts`)
- Basic types (`types.ts`)
- Design documentation (`docs/modes.md`, `docs/personas.md`)

## Tasks

### 1. Design Schema for User Preferences & Modes

Create a comprehensive preferences schema that:
- Stores user preferences (notifications, behaviors, defaults)
- Manages mode configurations (Sol, Mars, Earth)
- Supports persona-specific preferences
- Allows preferences to be scoped (global, per-mode, per-persona)

**Files to create:**
- `packages/core-luna/src/preferences.ts`
- `packages/core-luna/src/preferencesSchema.ts`

### 2. Implement Settings API

Build a settings API that:
- Allows reading and writing preferences
- Validates preference values against schema
- Supports preference inheritance (global → mode → persona)
- Provides change notifications/hooks

**Files to create:**
- `packages/core-luna/src/settings.ts`
- `packages/core-luna/src/settingsStore.ts`

### 3. Define Boundaries

Create a boundary system that enforces constraints:
- "Never spend money without confirmation"
- "Never call external tools without user approval"
- "Never send messages during focus hours"
- User-defined boundaries

**Files to create:**
- `packages/core-luna/src/boundaries.ts`
- `packages/core-luna/src/boundaryEnforcer.ts`

### 4. Wire Preferences into Sol/Te/Mav Behavior

Integrate preferences with other layers:
- Sol: Use preferences to adjust inference behavior
- Te: Respect preferences when generating reflections
- Mav: Enforce boundaries before executing actions
- Provide preference-aware context to all layers

**Files to create/modify:**
- `packages/core-luna/src/integrations/solPreferences.ts`
- `packages/core-luna/src/integrations/tePreferences.ts`
- `packages/core-luna/src/integrations/mavPreferences.ts`

## Implementation Guidelines

- Use `OrbRole.LUNA` for all operations
- Accept `OrbContext` in all public functions
- Tag all operations with appropriate role
- Preferences should be the source of truth for user intent
- Boundaries must be enforced before actions are taken
- All layers should query Luna for preferences before acting

## Success Criteria

- [ ] Preferences schema supports all needed configuration
- [ ] Settings API allows reading/writing preferences
- [ ] Boundary system enforces user-defined constraints
- [ ] Preferences are integrated with Sol/Te/Mav layers
- [ ] All code uses `OrbRole.LUNA` and `OrbContext`

## Next Steps

After completing this, see:
- `build-core-mav-action-graph.md` - For Mav to respect Luna's boundaries
- `build-core-sol-model-orchestrator.md` - For Sol to use Luna's preferences

