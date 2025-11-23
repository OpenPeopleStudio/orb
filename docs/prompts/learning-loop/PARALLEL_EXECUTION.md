# Parallel Execution Guide - Agents B, C, D, E

**Mission**: Phase 6 - Learning Loop & Adaptation  
**Status**: Ready to execute in parallel

---

## Overview

Agents B, C, D, and E can run **simultaneously** because they work on different packages with minimal dependencies:

- **Agent B (Te)**: `orb-system/packages/core-te/src/` - Pattern detection
- **Agent C (Mav)**: `orb-system/packages/core-mav/src/` - Event emission
- **Agent D (Luna)**: `orb-system/packages/core-luna/src/` - Preference learning
- **Agent E (Sol)**: `orb-system/packages/core-sol/src/` - Insight generation

**Dependencies**: All depend on Agent A (complete), none depend on each other.

---

## Quick Start

### Option 1: Single Developer, Sequential

Execute agents one at a time:

```bash
# Terminal 1: Agent B
cd ~/Code/orb-system
cat docs/prompts/learning-loop/agent-b-te-reflection.md
# Implement Agent B...

# Then Agent C
cat docs/prompts/learning-loop/agent-c-mav-actions.md
# Implement Agent C...

# Then D, then E...
```

### Option 2: Multiple Developers, Parallel

Assign one agent per developer:

```bash
# Developer 1 (Te specialist): Agent B
# Developer 2 (Mav specialist): Agent C
# Developer 3 (Luna specialist): Agent D
# Developer 4 (Sol specialist): Agent E
```

Each developer works independently, coordinating only on merge.

### Option 3: AI Agents, Parallel

Launch 4 AI agent sessions simultaneously:

```bash
# Session 1 - Agent B
AI_AGENT_ID=agent-b-te
SCOPE=orb-system/packages/core-te/src/
PROMPT=docs/prompts/learning-loop/agent-b-te-reflection.md

# Session 2 - Agent C
AI_AGENT_ID=agent-c-mav
SCOPE=orb-system/packages/core-mav/src/
PROMPT=docs/prompts/learning-loop/agent-c-mav-actions.md

# Session 3 - Agent D
AI_AGENT_ID=agent-d-luna
SCOPE=orb-system/packages/core-luna/src/
PROMPT=docs/prompts/learning-loop/agent-d-luna-preferences.md

# Session 4 - Agent E
AI_AGENT_ID=agent-e-sol
SCOPE=orb-system/packages/core-sol/src/
PROMPT=docs/prompts/learning-loop/agent-e-sol-inference.md
```

---

## Coordination Points

### Shared Resources (No Conflicts)

Each agent works in its own package directory:
- ✅ Agent B → `packages/core-te/`
- ✅ Agent C → `packages/core-mav/`
- ✅ Agent D → `packages/core-luna/`
- ✅ Agent E → `packages/core-sol/`

**No file conflicts expected.**

### Shared Types (Read-Only)

All agents **read** from Agent A's types:
- `orb-system/packages/core-orb/src/adaptation/types.ts`
- `orb-system/packages/core-orb/src/events/types.ts`

**These files should not be modified by B, C, D, or E.**

### Integration Points (Post-Completion)

After all agents complete:
1. Agent B's patterns → Agent E converts to insights
2. Agent E's insights → Agent D applies to preferences
3. Agent C's events → Agent B analyzes for patterns

**Integration testing happens after individual agents complete.**

---

## Validation

Each agent should validate independently:

```bash
# Agent B validation
cd orb-system/packages/core-te
pnpm typecheck
pnpm test

# Agent C validation
cd orb-system/packages/core-mav
pnpm typecheck
pnpm test

# Agent D validation
cd orb-system/packages/core-luna
pnpm typecheck
pnpm test

# Agent E validation
cd orb-system/packages/core-sol
pnpm typecheck
pnpm test
```

**Each agent's code should compile independently.**

---

## Merge Strategy

### Git Workflow

Each agent works on a separate branch:

```bash
# Agent B
git checkout -b feature/agent-b-pattern-detection

# Agent C
git checkout -b feature/agent-c-event-emission

# Agent D
git checkout -b feature/agent-d-preference-learning

# Agent E
git checkout -b feature/agent-e-insight-generation
```

### Merge Order

Merge in any order since there are no conflicts:

```bash
git checkout main
git merge feature/agent-b-pattern-detection
git merge feature/agent-c-event-emission
git merge feature/agent-d-preference-learning
git merge feature/agent-e-insight-generation
```

Or merge all at once:

```bash
git merge feature/agent-b-pattern-detection \
          feature/agent-c-event-emission \
          feature/agent-d-preference-learning \
          feature/agent-e-insight-generation
```

---

## Timeline

### Parallel Execution (2-3 days)

```
Day 1:
  Agent B: Pattern detection (6 algorithms)    [8 hours]
  Agent C: Event emission (3 files)            [4 hours]
  Agent D: Preference learning (2 files)       [4 hours]
  Agent E: Insight generation (3 files)        [4 hours]

Day 2:
  Agent B: Learning store (3 backends)         [4 hours]
  Agent C: Integration with executors          [2 hours]
  Agent D: Adaptive preferences                [2 hours]
  Agent E: Summaries and recommendations       [2 hours]

Day 3:
  All: Testing and validation                  [2-4 hours each]
  All: Integration testing                     [2 hours]
```

**Total**: 2-3 days with parallel work (vs 7-10 days sequential)

---

## Communication

### Slack/Discord Channel

Create `#mission-6-learning-loop` channel:
- Agent B posts when pattern detection is ready
- Agent C posts when events are emitting
- Agent D posts when preferences are learning
- Agent E posts when insights are generating

### Stand-ups

Brief sync every 8 hours:
- What's complete?
- Any blockers?
- Any type conflicts?

### Merge Coordination

Use a shared doc or GitHub project board:
- [ ] Agent B: Pattern detection
- [ ] Agent C: Event emission
- [ ] Agent D: Preference learning
- [ ] Agent E: Insight generation

---

## Troubleshooting

### Type Errors Across Agents

If Agent B needs a type that Agent E is creating:
1. Check if it should come from Agent A (core-orb)
2. If truly needed, coordinate to add it to Agent A's types
3. Don't create duplicate types

### Runtime Dependencies

If Agent B needs Agent C's events:
- Use mock events for testing
- Integration testing happens after both complete

### Merge Conflicts

If conflicts occur (unlikely):
1. Favor the agent's scope (e.g., Agent B owns core-te)
2. Resolve by reviewing both changes
3. Re-run tests after resolution

---

## Success Metrics

After all agents complete:

- ✅ All packages build (`pnpm build`)
- ✅ All tests pass (`pnpm test`)
- ✅ No type errors (`pnpm typecheck`)
- ✅ Events emitting (Agent C)
- ✅ Patterns detecting (Agent B)
- ✅ Insights generating (Agent E)
- ✅ Preferences learning (Agent D)

**Integration test**: Run demo flow, check that patterns are detected and insights generated.

---

## Next Steps

After B, C, D, E complete:
1. **Integration testing** - Wire everything together
2. **Agent F (Orb-Web)** - Build UI dashboard
3. **Agent G (Tests)** - Comprehensive test suite

---

**Ready to execute!** All agent prompts are complete. Start now for 2-3 day completion.

