# Soma → Sol: OS Redesign Brief

**Version**: 1.0  
**Date**: 2025-11-22  
**Status**: Active

---

## Problem Framing

### Current State: Soma

Soma has grown organically, accumulating features, surfaces, and interaction patterns over multiple iterations. While functional and increasingly sophisticated, the current implementation reveals structural tensions:

1. **Navigation fragmentation**: Multiple entry points, inconsistent patterns, unclear hierarchy
2. **Mode confusion**: Sol/Mars/Earth modes exist but feel bolted-on rather than fundamental
3. **Surface proliferation**: New features added as isolated screens rather than integrated flows
4. **Emotional disconnect**: The OS doesn't fully express its own awareness or intent
5. **Design debt**: Token systems, motion language, and visual consistency need tightening

SomaOS works. But it doesn't yet *feel* like a unified operating system with a clear point of view.

### Why Sol?

The redesign isn't a rebrand — it's a **crystallization**. Sol represents:

- **Clarity**: One OS, multiple modes, coherent structure
- **Opinion**: The system knows what it believes and expresses it
- **Evolution**: Soma was exploration; Sol is the destination (for now)
- **Identity**: This is an OS for one human, not a generic AI app

The name "Sol" evokes:
- The sun: central, life-giving, constant
- Solar system: orbits, relationships, gravitational structure
- Solitary: built for one person, deeply personal
- Solution: the OS that solves for human cognitive load

---

## North Star

### How Sol Should Feel

When you use Sol every day, it should feel like:

1. **An extension of your mind**  
   The OS anticipates context, surfaces what you need, hides what you don't. It remembers where you were and helps you pick up threads effortlessly.

2. **Emotionally honest**  
   The Alien Console shows system stress. Token Studio reveals design DNA. Schema Lab maps data structure. Sol doesn't hide its internals — it makes them legible and beautiful.

3. **Calm under load**  
   Even with chaos in the inbox, complex projects in flight, and the restaurant melting down, Sol never screams. It prioritizes, organizes, and presents with precision.

4. **Mode-aware**  
   Sol mode for exploration, Mars mode for operations, Earth mode for life. Transitions are smooth, context is preserved, and the OS always knows where you are.

5. **Fast and light**  
   No lag. No friction. Command palette omnipresent. Keyboard shortcuts muscle memory. The OS gets out of your way while remaining fully present.

---

## Design Pillars

### 1. Clarity Under Load

**What It Means**  
Complex information presented simply. Visual hierarchy that guides attention. No ambiguity about what's important, what's next, what can wait.

**How It Shows Up**
- Clean typography, generous whitespace
- One primary action per screen
- Progressive disclosure: see summary, drill for detail
- Color used sparingly, meaningfully (cyan = active, amber = urgent)

**Anti-Patterns**
- Dense information walls
- Competing visual hierarchies
- Ambiguous next actions

### 2. Emotionally Honest

**What It Means**  
The OS doesn't pretend. It shows its state, its stress, its structure. When something's wrong, it says so. When the system is calm, you feel it.

**How It Shows Up**
- Alien Console: visible health metrics
- Token Studio: inspectable design DNA
- Schema Lab: legible data model
- Error states that explain, not just report

**Anti-Patterns**
- Generic loading spinners
- Vague error messages
- Hidden system state

### 3. Keyboard-First, Always

**What It Means**  
Every action accessible via keyboard. Command palette omnipresent. Mouse is optional, never required.

**How It Shows Up**
- ⌘K opens command palette from anywhere
- Consistent shortcuts across modes
- Discoverable via inline hints
- Search-first navigation

**Anti-Patterns**
- Mouse-only interactions
- Hidden or inconsistent shortcuts
- Unclear search results

### 4. Mode as Context, Not Theme

**What It Means**  
Sol/Mars/Earth aren't visual themes — they're *context shifts*. Each mode optimizes layout, notifications, and priorities for its use case.

**How It Shows Up**
- Different information hierarchies per mode
- Smart notification filtering by mode
- Smooth transitions preserve state
- Manual override always available

**Anti-Patterns**
- Modes as mere color schemes
- Losing context on mode switch
- Jarring transitions

### 5. Progressive Disclosure

**What It Means**  
Show what's needed now. Everything else is one tap/keystroke away. Dense information available but not overwhelming.

**How It Shows Up**
- Summary → detail hierarchy
- Collapsible sections with clear labels
- Quick actions at top level
- Deep functionality accessible but hidden

**Anti-Patterns**
- Showing all options at once
- Burying critical functions
- Unclear paths to advanced features

---

## Scope

### In Scope for Sol Redesign

**Core OS Structure**
- Navigation system: how you move through the OS
- Mode system: Sol/Mars/Earth definitions and transitions
- Command palette: universal search/action interface
- Status/header: persistent context and controls

**Key Surfaces**
- Launcher: entry point and task creation
- Inbox: unified messaging across channels
- Contacts: people graph and relationship management
- Finance: money tracking and insights
- Calendar/Tasks: time and todo management
- Alien Console: system health and emotional state

**Design Systems**
- Token Studio integration: design DNA inspectable
- Motion language: timing, easing, transitions
- Visual language: color, type, spacing, depth
- Component library: reusable building blocks

**Cross-Cutting**
- Notification system: context-aware, mode-respecting
- Search: universal, fast, relevant
- Settings: organized, discoverable
- Onboarding: first-run experience

### Explicitly Out of Scope (For Now)

**Implementation Details**
- Swift code architecture (SomaOS team handles)
- Database schema changes (coordinate via Schema Lab)
- Backend API design (Forge Node defines)

**Future Features**
- SomaForge Web interface (Luna's domain)
- Multi-device sync specifics (coordinate later)
- Third-party integrations beyond current set
- Public API or developer platform

**Edge Cases**
- Offline mode edge cases (handle in implementation)
- Accessibility fine-tuning (coordinate with implementation)
- Internationalization (English-first, expand later)

---

## Migration Strategy

### Phase 1: Foundation (Weeks 1-2)
- Define navigation model
- Specify mode system behaviors
- Create component inventory
- Establish token/motion standards

### Phase 2: Core Surfaces (Weeks 3-6)
- Redesign launcher and command palette
- Refine inbox and contacts
- Integrate Token Studio, Alien Console, Schema Lab
- Define settings organization

### Phase 3: Modes & Polish (Weeks 7-8)
- Implement full mode system
- Smooth transitions and animations
- Notification filtering by mode
- Edge case handling

### Phase 4: Validation (Week 9+)
- Real-world usage testing
- Persona-based validation
- Performance and friction audits
- Iteration based on feedback

### Rollout Approach
- **Parallel development**: Sol specs written while Soma implementation continues
- **Feature flags**: New Sol patterns introduced incrementally
- **A/B where possible**: Compare old vs new on non-critical surfaces
- **Kill switch**: Ability to revert if critical issues emerge

---

## Success Criteria

### Quantitative
- Navigation speed: 50% faster to common destinations
- Task completion: 30% increase in daily task closure rate
- Context recovery: < 30 seconds to resume after interruption
- Mode switching: < 1 second transition time
- Search relevance: 90%+ first-result accuracy

### Qualitative
- "The OS feels like it knows what I want"
- "I spend less time thinking about the tool, more time doing the work"
- "Mode switching is seamless and natural"
- "The system feels calm even when I'm stressed"
- "I trust the OS to handle the details"

### User-Facing
- Net Promoter Score: > 9 (10-point scale, single user)
- Daily friction points: < 3 per full day of use
- "Felt right" moments: > 10 per day
- Time spent in OS vs doing work: 10% decrease

---

## Risks & Mitigations

### Risk: Over-Design
**Concern**: Sol specs get too detailed, constraining implementation flexibility  
**Mitigation**: Focus on *what* and *why*, not *how*. Leave technical decisions to implementers.

### Risk: Scope Creep
**Concern**: Every problem becomes "let's redesign everything"  
**Mitigation**: Strict adherence to in-scope list. Out-of-scope ideas go to backlog.

### Risk: Implementation Lag
**Concern**: Sol specs produced faster than SomaOS can implement  
**Mitigation**: Coordinate with Luna/Forge. Specs inform multi-agent priorities.

### Risk: Breaking Existing Workflows
**Concern**: New patterns disrupt muscle memory  
**Mitigation**: Feature flags, gradual rollout, fallback to old patterns where critical.

---

## Stakeholders

**Sol Node (This Workspace)**  
Responsible for design intent, specs, navigation models, component definitions

**SomaOS (Swift/iOS)**  
Implements Sol designs in production app

**Luna (Forge Node)**  
Automates builds, multi-agent coordination, testing infrastructure

**Coordinator Agent**  
Routes tasks between agents, manages promotion from playground to production

**Human (You)**  
Final arbiter of "does this feel right?"

---

## Next Steps

1. **Define navigation system** (`navigation_system.md`)
2. **Inventory components** (`components_index.md`)
3. **Run exploration sessions** (use `prompts/sol_exploration_loop.md`)
4. **Generate implementation specs** (use `prompts/sol_ui_refactor.md`)
5. **Review existing surfaces** (use `prompts/sol_surface_review.md`)

---

**This brief is living**. As Sol evolves, this document should reflect new insights, changed priorities, and refined understanding. Update version number and date with each significant revision.

---

**Version**: 1.0  
**Status**: Active  
**Next Review**: After Phase 1 (2 weeks)

