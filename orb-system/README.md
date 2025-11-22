# Orb System

A monorepo implementing the Orb model: an AI system organized into four core layers (Sol, Te, Mav, Luna) wrapped in an Orb shell.

## Structure

```
orb-system/
  apps/
    orb-web/            # Main UI/shell (Orb package)
    orb-daemon/         # Background runner / node agent
  packages/
    core-orb/           # Shared types, identity, config
    core-sol/           # Inference/engine (Sol)
    core-te/            # Reflection/memory (Te)
    core-mav/           # Actions/tools (Mav)
    core-luna/          # Preferences/intent (Luna)
    forge/              # Build automation helpers
  docs/
    ORB_IDENTITY.md     # Canonical Orb model definitions
    MIGRATION_NOTES.md  # Migration details from existing repos
    ROADMAP.md          # Implementation status and next steps
    prompts/            # Future "routed prompts" for agents
```

## Orb Model

- **Sol** → What the model runs on (engine/inference/brain)
- **Te** → What the model reflects on (memory, evaluation, self-critique)
- **Mav** → What the model accomplishes (actions, tools, execution)
- **Luna** → What the user decides they want it to be (intent, preferences, constraints)
- **Orb** → The package everything comes in (app/shell/human touchpoint)

See `docs/ORB_IDENTITY.md` for complete definitions.

## Getting Started

See individual package READMEs for details:
- `packages/core-orb/README.md` - Identity and shared types
- `packages/core-sol/README.md` - Inference engine
- `packages/core-te/README.md` - Reflection and memory
- `packages/core-mav/README.md` - Actions and tools
- `packages/core-luna/README.md` - Preferences and intent

## Development

This is a work in progress. See `docs/ROADMAP.md` for current status and next steps.

