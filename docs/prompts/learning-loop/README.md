# Learning Loop Mission Prompts

This directory contains agent-specific prompts for **Phase 6: Learning Loop & Adaptation**.

## Mission Overview

See parent mission: `../MISSION_6_LEARNING_LOOP.md`

**Goal**: Implement the learning loop that allows Orb to learn from usage patterns, adapt behavior, and surface insights.

---

## Agent Prompts

### Sequential (Must Complete First)

1. **[Agent A: Architect](./agent-a-architect.md)** - Define contracts & types ⚠️ START HERE
   - Event taxonomy
   - Pattern types
   - Learning pipeline interface
   - Architecture documentation

### Parallel (After Agent A)

2. **[Agent B: Te (Reflection)](./agent-b-te-reflection.md)** - Pattern detection
   - Implement pattern detector
   - Build insight generator
   - Create learning store

3. **[Agent C: Mav (Actions)](./agent-c-mav-actions.md)** - Event emission
   - Add event emission to all actions
   - Include execution metadata
   - Capture error details

4. **[Agent D: Luna (Preferences)](./agent-d-luna-preferences.md)** - Adaptive preferences
   - Implement preference learning
   - Suggest constraint changes
   - Apply confidence thresholds

5. **[Agent E: Sol (Inference)](./agent-e-sol-inference.md)** - Insight generation
   - Convert patterns to insights
   - Generate recommendations
   - Create daily/weekly summaries

### UI & Testing (After B, C, D, E)

6. **[Agent F: Orb-Web](./agent-f-orb-web.md)** - Insights dashboard
   - Build insights dashboard
   - Create pattern visualizations
   - Add approval interface

7. **[Agent G: Tests](./agent-g-tests.md)** - End-to-end validation
   - Pattern detection tests
   - Learning pipeline tests
   - Integration tests

---

## Execution Order

```
Agent A (Architect)
    ↓
┌───┴────┬─────┬─────┐
B (Te)   C (Mav) D (Luna) E (Sol)
└───┬────┴─────┴─────┘
    ↓
┌───┴────┐
F (Web)  G (Tests)
└────────┘
```

**Total Time**: 7-10 days with parallel work

---

## Quick Start

### For Coordinator/Lead Developer

1. Review main mission: `../MISSION_6_LEARNING_LOOP.md`
2. Assign Agent A first
3. Once Agent A completes, assign B/C/D/E in parallel
4. Once B/C/D/E complete, assign F/G in parallel

### For Individual Agents

1. Read your agent prompt (e.g., `agent-a-architect.md`)
2. Follow the bootloader: `../forge-agent-bootloader.md`
3. Complete your deliverables
4. Hand off to next agents with clear TODOs

---

## Coordination Notes

- **Shared Types**: All agents depend on Agent A's contracts
- **Event Format**: Agents B & C must coordinate on event structure
- **Confidence Thresholds**: Agents B, D, E must use consistent 0-1 confidence
- **UI APIs**: Agent F needs completed APIs from B, D, E

---

## Success Metrics

### Phase 6.1 (Must Have)
- ✅ Event taxonomy defined
- ✅ Events emitted for all actions
- ✅ Pattern detector working
- ✅ Insights generated
- ✅ Basic dashboard
- ✅ 80%+ test coverage

### Phase 6.2 (Nice to Have)
- ✅ Adaptive preferences
- ✅ Workflow optimizations
- ✅ Learning summaries
- ✅ Pattern visualizations

---

## Questions?

See:
- Main roadmap: `../../orb-system/docs/ROADMAP.md` (Phase 6)
- Orb identity: `../ORB_IDENTITY.md`
- SomaOS porting: `../../orb-system/docs/SOMAOS_PORTING_PLAN.md`

