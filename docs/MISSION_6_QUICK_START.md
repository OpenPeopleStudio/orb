# Phase 6 Quick Start: Learning Loop & Adaptation

**Status**: 🟢 Ready to Start  
**Estimated Time**: 7-10 days with parallel work

---

## 🎯 What We're Building

A learning loop that transforms Orb from a reactive system to one that learns from usage patterns and adapts behavior automatically.

**Before**: User manually adjusts preferences, constraints, and modes  
**After**: Orb learns preferences and suggests improvements automatically

---

## 📋 Prerequisites

Ensure these are complete before starting:

- ✅ Phase 5 complete (SomaOS concepts imported)
- ✅ Event bus exists (`orb-system/packages/core-orb/src/events/`)
- ✅ Adaptation engine stub exists (`core-orb/src/adaptation/`)
- ✅ All core packages building successfully

---

## 🚀 Execution Plan

### Step 1: Architect Defines Contracts (1-2 days)

**Agent**: Architect (Agent A)  
**Prompt**: `docs/prompts/learning-loop/agent-a-architect.md`

**Deliverables**:
- Event taxonomy (15+ event types)
- Pattern types (6+ pattern types)
- Learning pipeline interface
- Architecture documentation

**Start Command**:
```bash
# Provide the agent prompt to AI agent with AGENT_ID=architect
```

**Validation**:
```bash
pnpm typecheck
# Should compile without errors in core-orb
```

---

### Step 2: Parallel Implementation (2-3 days)

Once Agent A completes, start these agents **in parallel**:

#### Agent B: Te (Reflection)
**Prompt**: `docs/prompts/learning-loop/agent-b-te-reflection.md` (to be created)

Implements:
- Pattern detector (frequent actions, time routines, mode preferences)
- Insight generator
- Learning store (file + SQL)

#### Agent C: Mav (Actions)
**Prompt**: `docs/prompts/learning-loop/agent-c-mav-actions.md` (to be created)

Implements:
- Event emission for all actions
- Execution metadata capture
- Error detail logging

#### Agent D: Luna (Preferences)
**Prompt**: `docs/prompts/learning-loop/agent-d-luna-preferences.md` (to be created)

Implements:
- Preference learning from patterns
- Adaptive constraint suggestions
- Confidence threshold application

#### Agent E: Sol (Inference)
**Prompt**: `docs/prompts/learning-loop/agent-e-sol-inference.md` (to be created)

Implements:
- Natural language insight generation
- Recommendation engine
- Daily/weekly summaries

---

### Step 3: UI & Testing (2-3 days)

Once agents B/C/D/E complete, start these **in parallel**:

#### Agent F: Orb-Web
**Prompt**: `docs/prompts/learning-loop/agent-f-orb-web.md` (to be created)

Implements:
- Insights dashboard
- Pattern visualizations
- Approval interface

#### Agent G: Tests
**Prompt**: `docs/prompts/learning-loop/agent-g-tests.md` (to be created)

Implements:
- Pattern detection tests
- End-to-end learning pipeline tests
- Integration tests

---

## ✅ Success Criteria

### Phase 6.1 (Must Have)

- [ ] Event taxonomy defined and documented
- [ ] Events emitted for all Mav actions
- [ ] Pattern detector finds frequent actions
- [ ] Insights generated in natural language
- [ ] Basic insights dashboard in orb-web
- [ ] 80%+ test coverage

### Phase 6.2 (Nice to Have)

- [ ] Adaptive preference updates (with approval)
- [ ] Workflow optimization suggestions
- [ ] Daily/weekly learning summaries
- [ ] Pattern visualization charts

---

## 📊 Demo Flow

After completion, the learning loop should work like this:

```bash
# 1. User performs action multiple times
pnpm dev --filter apps/orb-web
# ... execute same action 5+ times ...

# 2. Pattern detector runs (automatically or on-demand)
# ... detects frequent_action pattern ...

# 3. Insight generated
# ... "You execute 'X' 3x/day. Consider automation?" ...

# 4. User reviews in dashboard
# ... approves/rejects suggestion ...

# 5. Preference updated
# ... automation created or preference learned ...
```

---

## 🔍 Validation Checklist

After each step, validate:

```bash
# Type check
pnpm typecheck

# Run tests
pnpm test --filter "packages/core-*"

# Build all packages
pnpm build

# Run demo flow
pnpm dev --filter apps/orb-web
```

---

## 📚 Key References

- **Mission Overview**: `docs/prompts/MISSION_6_LEARNING_LOOP.md`
- **Agent Prompts**: `docs/prompts/learning-loop/`
- **Roadmap Phase 6**: `orb-system/docs/ROADMAP.md` (line 273)
- **Event Bus**: `orb-system/packages/core-orb/src/events/`
- **Adaptation Engine**: `orb-system/packages/core-orb/src/adaptation/`

---

## 🆘 Troubleshooting

### If Agent A gets stuck:
- Review existing event types: `core-orb/src/events/types.ts`
- Check adaptation engine: `core-orb/src/adaptation/engine.ts`
- Reference SomaOS patterns in `docs/SOMAOS_PORTING_PLAN.md`

### If parallel agents conflict:
- Agent A must complete first (defines contracts)
- Agents B/C/D/E coordinate on event format
- Use consistent confidence scoring (0-1 scale)

### If tests fail:
- Ensure all core packages built: `pnpm build`
- Check for missing exports in index files
- Run linter: `pnpm lint`

---

## 🎉 What's Next (Phase 7)

After Phase 6 completes, next up is:

**Phase 7 - Multi-Device & Auto-Building Behavior**

This enables:
- Cross-device learning synchronization
- Predictive actions
- Autonomous system improvements

See: `orb-system/docs/ROADMAP.md` (Phase 7)

