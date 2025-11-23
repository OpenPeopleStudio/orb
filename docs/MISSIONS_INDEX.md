# Orb System Missions Index

Central tracking for all multi-agent missions in the orb-system project.

---

## Active Missions

### 🟢 Mission 6: Learning Loop & Adaptation
**Status**: Ready to Start  
**Priority**: High  
**Estimated Time**: 7-10 days

**Quick Links**:
- 📄 [Mission Overview](./prompts/MISSION_6_LEARNING_LOOP.md)
- 📋 [Quick Start Guide](./MISSION_6_QUICK_START.md)
- 📊 [Mission Summary](./MISSION_6_SUMMARY.md)
- 📁 [Agent Prompts](./prompts/learning-loop/)

**Goal**: Implement learning loop that allows Orb to learn from usage patterns and adapt behavior automatically.

**Agents**: 7 agents (Architect, Te, Mav, Luna, Sol, Orb-Web, Tests)

**Next Action**: Start with Agent A (Architect) - `prompts/learning-loop/agent-a-architect.md`

---

## Completed Missions

### ✅ Mission 4.2: Constraints & Modes System
**Status**: Complete  
**Completed**: 2025-11-22

**Quick Links**:
- 📊 [Summary](./MISSION_CONSTRAINTS_MODES_SUMMARY.md)
- 📄 [Complete Report](./MISSION_CONSTRAINTS_COMPLETE.md)
- 📋 [Overview](./CONSTRAINTS_AND_MODES_OVERVIEW.md)

**Achievements**:
- ✅ Constraint evaluation system
- ✅ Mode transitions
- ✅ Persona classification
- ✅ Constraint integration
- ✅ Comprehensive test suite

**Impact**: Luna can now enforce constraints and adapt behavior based on modes and personas.

---

### ✅ Mission 4: First Ultra Missions
**Status**: Complete

**Quick Links**:
- 📊 [Summary](./MISSION_4.2_SUMMARY.md)
- 📄 [Multi-Agent Summary](./MULTI_AGENT_MISSION_SUMMARY.md)

**Achievements**:
- ✅ Ultra workflow established
- ✅ Multi-agent coordination
- ✅ File persistence for Te/Luna
- ✅ Mode-aware console

---

## Planned Missions

### ⚪ Mission 7: Multi-Device & Auto-Building
**Status**: Planned  
**Priority**: Medium  
**Dependencies**: Mission 6

**Goal**: Enable cross-device learning and autonomous system improvements.

**Scope**:
- Device synchronization
- Predictive actions
- Cross-device patterns
- Auto-building behavior

**Estimated Time**: 10-14 days

---

### ⚪ Mission 8: SomaForge Integration
**Status**: Planned  
**Priority**: Low  
**Dependencies**: Mission 6, 7

**Goal**: Integrate SomaForge design system and motion tokens.

**Scope**:
- Design token integration
- Motion system
- Visual style consistency
- Brand manual adherence

**Estimated Time**: 7-10 days

---

## Mission Lifecycle

### 1. Planned (⚪)
- Mission defined in roadmap
- Dependencies identified
- Not yet started

### 2. Ready to Start (🟢)
- Mission prompt created
- Agent prompts defined
- Prerequisites complete
- Can be assigned immediately

### 3. In Progress (🟡)
- At least one agent active
- Work is ongoing
- Regular updates in mission summary

### 4. Complete (✅)
- All agents finished
- Tests passing
- Documentation updated
- Merged to main branch

---

## Mission Template

When creating a new mission, follow this structure:

```
docs/
  ├── prompts/
  │   ├── MISSION_X_[NAME].md          # Main mission document
  │   └── [mission-name]/
  │       ├── README.md                 # Mission overview
  │       ├── agent-a-[name].md         # Agent A prompt
  │       ├── agent-b-[name].md         # Agent B prompt
  │       └── ...
  ├── MISSION_X_QUICK_START.md         # Quick start guide
  └── MISSION_X_SUMMARY.md             # Mission summary

```

**Required Elements**:
1. Mission overview with goals
2. Agent roster with scopes
3. Detailed deliverables per agent
4. Success criteria
5. Execution order
6. Coordination notes

**See**: `prompts/MISSION_6_LEARNING_LOOP.md` as reference template

---

## Coordination Principles

### Multi-Agent Coordination
- Use forge-agent-bootloader for all agents
- Define clear scopes and boundaries
- Specify dependencies between agents
- Use shared types for contracts

### Communication
- Leave TODOs for other agents
- Update mission summary regularly
- Document decisions in code comments
- Use git commits to track progress

### Quality Gates
- Type check: `pnpm typecheck`
- Linting: `pnpm lint`
- Tests: `pnpm test`
- Build: `pnpm build`

---

## Roadmap Alignment

| Mission | Roadmap Phase | Status |
|---------|---------------|--------|
| Mission 0-3 | Phases 0-3 | ✅ Complete |
| Mission 4 | Phase 4 | ✅ Complete |
| Mission 4.2 | Phase 4 | ✅ Complete |
| Mission 5 | Phase 5 | 🟡 In Progress |
| Mission 6 | Phase 6 | 🟢 Ready to Start |
| Mission 7 | Phase 7 | ⚪ Planned |
| Mission 8 | Phase 8+ | ⚪ Planned |

**See**: `orb-system/docs/ROADMAP.md` for detailed phase breakdown

---

## Quick Reference

### Starting a Mission
1. Review mission overview: `prompts/MISSION_X_[NAME].md`
2. Read quick start: `MISSION_X_QUICK_START.md`
3. Start with Agent A (usually Architect)
4. Follow agent prompt: `prompts/[mission-name]/agent-a-*.md`
5. Use bootloader: `prompts/forge-agent-bootloader.md`

### During a Mission
1. Update status in mission summary
2. Coordinate through shared types
3. Leave TODOs for other agents
4. Run quality gates frequently

### Completing a Mission
1. Validate all success criteria
2. Run full test suite
3. Update documentation
4. Create completion summary
5. Update this index

---

## Questions & Support

### Mission Planning
- Review roadmap: `orb-system/docs/ROADMAP.md`
- Check phase status: `PHASE_STATUS.md`
- See SomaOS plan: `orb-system/docs/SOMAOS_PORTING_PLAN.md`

### Execution
- Bootloader: `prompts/forge-agent-bootloader.md`
- Bootloader usage: `prompts/FORGE_BOOTLOADER_USAGE.md`
- Ultra workflow: `prompts/ULTRA_WORKFLOW_QUICK_START.md`

### Technical
- Orb identity: `ORB_IDENTITY.md`
- Migration notes: `MIGRATION_NOTES.md`
- Git workflow: User rules in `.cursorrules` or project settings

---

## Contributing New Missions

To propose a new mission:

1. **Define in roadmap** - Add to appropriate phase in `orb-system/docs/ROADMAP.md`
2. **Create mission prompt** - Use `prompts/MISSION_6_LEARNING_LOOP.md` as template
3. **Break into agents** - Define 3-7 agents with clear scopes
4. **Write agent prompts** - One detailed prompt per agent
5. **Create quick start** - Step-by-step execution guide
6. **Update this index** - Add to "Planned Missions"

---

**Last Updated**: 2025-11-22  
**Active Missions**: 1  
**Completed Missions**: 2  
**Planned Missions**: 2

