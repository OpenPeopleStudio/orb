# Sol — Explorer / OS Redesign Studio

**Sol is the Explorer node.**

Sol is responsible for the full OS surface, navigation, and emotional feel. This workspace holds the Soma → Sol redesign: reimagining how the operating system should work, flow, and resonate with humans.

## Role & Purpose

Sol defines **how the OS should feel** — the UX intent, navigation models, emotional tones, and interaction patterns. While Luna (Forge node) handles builds and automation, and SomaOS manages Swift/iOS implementation, Sol is the **design brain** that answers:

- What should the OS *feel* like when you use it?
- How should modes, navigation, and surfaces evolve?
- What makes an interaction calm, intentional, and honest?

## Layout

```
sol/
├── config/         Device identity, modes, and personas
├── design/         Design briefs, navigation specs, component inventories
├── prompts/        Ready-to-run prompts for explorations, refactors, and reviews
├── scripts/        Helper scripts for syncing, snapshots, and studio access
└── workspace/      Active explorations, archives, and notes
```

### config/

- `sol.device.json` — Sol node identity, linked devices, repo paths
- `sol_modes.md` — OS mode definitions (Sol, Mars, Earth) with behavioral specs
- `sol_personas.md` — User personas: goals, friction points, requirements

### design/

- `os_redesign_brief.md` — Master brief for the Soma → Sol redesign
- `navigation_system.md` — Navigation principles and migration strategy
- `components_index.md` — UI component inventory grouped by domain

### prompts/

Standalone, Cursor-ready prompts for agent-driven work:

- `sol_exploration_loop.md` — Guided exploration of one OS area
- `sol_ui_refactor.md` — Translate design decisions into implementation specs
- `sol_surface_review.md` — Critique surfaces against design pillars

### scripts/

- `sync-from-soma-os.sh` — Sync code snippets from SomaOS repo
- `snapshot-ui-state.sh` — Record timestamped UI state notes
- `open-studio.sh` — Convenience launcher for Sol Studio

### workspace/

- `explorations/` — Active exploration sessions and experiments
- `archives/` — Completed or retired explorations
- `notes/` — Freeform notes and snapshots

## First-Time Setup

1. **Place this folder**  
   Keep `sol/` in your main development directory alongside other Soma repositories.

2. **Configure device paths**  
   Edit `config/sol.device.json` to match your actual file paths and hostnames.

3. **Use the prompts**  
   Open prompts in `prompts/` with Cursor or agents to drive redesign tasks. Each prompt is self-contained and ready to use.

4. **Work in workspace/**  
   Use `workspace/explorations/` for active work. Archive completed explorations to `workspace/archives/`.

## Design Philosophy

Sol inherits and evolves SomaOS design language:

- **Visual**: Monochrome-first, near-black backgrounds, off-white surfaces, cyan accents
- **Motion**: Calm, critically damped springs, intentional timing (no bounce)
- **Philosophy**: Simple is beautiful. Precision. Emotional honesty. Low-friction reflection.
- **Awareness**: Token Studio (design DNA), Alien Console (health), Schema Lab (structure)

## Integration

- **Sol ↔ Luna**: Sol defines UX intent → Luna handles Forge automation/builds
- **Sol ↔ SomaOS**: Sol specifies surface design → SomaOS implements in Swift/iOS  
- **Sol ↔ Coordinator**: Sol explorations can feed multi-agent routing decisions

## Working with Sol

Sol is a **design studio**, not a code repository. The files here define intent, principles, and specifications. Implementation happens elsewhere (SomaOS, Luna/Forge).

When Sol produces a design spec or navigation model, it should be:

1. **Clear enough** to guide implementation without ambiguity
2. **Specific enough** to be testable and verifiable
3. **Open enough** to allow implementers to make technical decisions

Sol says **what** and **why**. Others figure out **how**.

---

**Status**: Active  
**Device**: macOS (Sol)  
**Partner Nodes**: Luna (Windows/Forge), SomaOS (iOS/Swift)  
**Version**: 1.0

