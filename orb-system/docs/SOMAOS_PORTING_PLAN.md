# SomaOS Porting Plan

This document maps SomaOS concepts, architecture, and flows to `orb-system` implementation targets. Use this as a **map for Ultra agents**: "When porting X from SomaOS, this is where it goes in orb-system."

## Overview

**SomaOS** (SwiftUI app) is the **first organism**: a human-facing client that encodes product decisions, architecture, modules, and flows.

**orb-system** (TypeScript monorepo) is the **brain & skeleton**: types, flows, multi-agent Forge, web UI. This is where Ultra lives.

**The Plan**: Orb learns from SomaOS, then eventually SomaOS becomes "just one client" of orb.

---

## 1. Identity & Modes

### Source Documents
- `SomaOS/PLACE_PROFILE_DEPLOYMENT.md`
- `CONTACTS_COMPLETE_DATABASE_REQUIREMENTS.md`
- SomaOS device/persona/mode definitions

### Target Implementation
- **Package**: `packages/core-orb/src/identity/**`
  - `identity/types.ts` now exports `ORB_DEVICE_PROFILES`, `ORB_PERSONA_PROFILES`, `ORB_MODE_DESCRIPTORS`, and enriched `OrbUser`
- **Luna integration**: `packages/core-luna/src/types.ts`, `modes.ts`, and `presets.ts` read from the descriptors
- **Types to define**:
  - `OrbUser` - User identity, profiles, accounts
  - `OrbDevice` - Devices: Sol, Luna, Mars, Earth
  - `OrbPersona` - Personas: Personal / SWL / RealEstate / OpenPeople
  - `OrbMode` - Modes: explorer, forge, etc.
  - `OrbStream` - Messages, events, tasks

### Implementation Notes
- Base types on existing Supabase schema that SomaOS used
- Don't hardwire Supabase yet - keep types abstract
- Create single `core-orb` source of truth for devices, personas, modes (descriptors now live in `identity/types.ts`)
- Map SomaOS mode definitions to Luna mode service (already wired via descriptor exports)

### Agent Assignment
- **Primary**: `architect` (defines types, structure)
- **Secondary**: `luna` (mode service integration)

---

## 2. Multi-Agent Forge

### Source Documents
- `SOMAFORGE_FORGE_NODE_ARCHITECTURE.md`
- `MULTI_AGENT_SYSTEM.md`
- SomaOS agent coordination patterns

### Target Implementation
- **Package**: `packages/forge/**`
- **Prompts**: `docs/prompts/forge-*`

### Implementation Notes
- Agent registry already exists in `packages/forge/src/agents.ts`
- Port coordination patterns from SomaOS Forge architecture
- Extract task routing logic from SomaOS
- Port agent communication protocols

### Agent Assignment
- **Primary**: `architect` (system design)
- **Secondary**: All agents (as users of the system)

---

## 3. Playground / Alien

### Source Documents
- `ALIEN_EVOLUTION_QUICK_START.md`
- SomaOS emotional reflection patterns
- Alien interaction flows

### Target Implementation
- **Package**: `apps/orb-web/src/features/playground/**`
- **Event streams**: `packages/core-orb/src/events/**` (for emotional reflection)

### Implementation Notes
- Port alien interaction patterns to web UI
- Create event streams in `core-orb` for emotional reflection
- Map SomaOS emotional signals to Orb event types
- Integrate with Te reflection layer for emotional memory

### Agent Assignment
- **Primary**: `orb_ui` (UI implementation)
- **Secondary**: `te` (reflection integration), `architect` (event system)

---

## 4. Communication (Email / Messaging)

### Source Documents
- `EMAIL_LOADING_TROUBLESHOOTING.md`
- `GMAIL_MIGRATION_LINKS.md`
- SomaOS email/messaging architecture
- SMS, app message patterns

### Target Implementation
- **Package**: `packages/core-orb/src/messaging/**`
- **UI**: `apps/orb-web/src/features/inbox/**`

### Implementation Notes
- Define messaging domain types in `core-orb`
- Port email loading patterns from SomaOS
- Map Gmail integration patterns to Orb adapters
- Create inbox view in orb-web
- Integrate with Mav for message actions

### Agent Assignment
- **Primary**: `architect` (domain types), `mav` (integration adapters)
- **Secondary**: `orb_ui` (inbox UI)

---

## 5. Finances

### Source Documents
- SomaOS finance docs & schema
- Transaction patterns
- Category/account structures

### Target Implementation
- **Package**: `packages/core-orb/src/finances/**`
- **Data contract**: Orb data contract for Supabase later

### Implementation Notes
- Define finance domain types (transactions, categories, accounts)
- Port transaction patterns from SomaOS
- Create data contract compatible with Supabase schema
- Integrate with Te for financial reflection/insights

### Agent Assignment
- **Primary**: `architect` (domain types, data contract)
- **Secondary**: `te` (financial reflection integration)

---

## 6. Contacts

### Source Documents
- `CONTACTS_COMPLETE_DATABASE_REQUIREMENTS.md`
- SomaOS contact graph patterns
- Emotional signals in contacts

### Target Implementation
- **Package**: `packages/core-orb/src/contacts/**`
- **Types**: Contact graph, relationship types, emotional signals

### Implementation Notes
- Define contact domain types
- Port contact graph structure from SomaOS
- Map emotional signals to Orb event types
- Integrate with Te for relationship reflection

### Agent Assignment
- **Primary**: `architect` (domain types)
- **Secondary**: `te` (relationship reflection)

---

## 7. System Readiness & Verification

### Source Documents
- `V1_VERIFICATION_CHECKLIST.md`
- `SYSTEM_READY.md`
- `DATABASE_PUSH_GUIDE.md`

### Target Implementation
- **Package**: `packages/core-orb/src/system/**`
  - `system/checks.ts`: `checkNodeVersion`, `checkGitStatus`, `checkSupabaseConfig`, `checkDatabaseConfig`, `checkPersistenceMode`
  - `system/index.ts`: `runSystemReadiness()` helper returning aggregated reports
- **Functions**: System readiness checks, verification utilities

### Implementation Notes
- Port verification checklists to Orb functions (supplied above)
- `runSystemReadiness()` produces a structured `ReadinessReport` for UI/agents
- Integrate with orb-web for system status display

### Agent Assignment
- **Primary**: `architect` (system checks)
- **Secondary**: `infra` (infrastructure validation), `orb_ui` (status display)

---

## 8. Design Tokens & Visual System

### Source Documents
- `SomaForgeBrandManual.md`
- `SomaForgeVisualStyleTokens.md`
- `SomaForgeMotionTokenSet.md`
- `SomaForgeUXBible.md`

### Target Implementation
- **Package**: `luna/packages/design-tokens/**` (already exists)
- **UI**: `apps/orb-web/src/styles/**`

### Implementation Notes
- Design tokens package already exists in `luna/packages/design-tokens`
- Port visual style tokens from SomaOS
- Apply motion tokens to orb-web
- Ensure UX patterns align with SomaForge UX Bible

### Agent Assignment
- **Primary**: `orb_ui` (UI implementation)
- **Secondary**: `architect` (design system integration)

---

## Porting Workflow

### For Each Domain

1. **Read Source Documents**
   - Identify key concepts, types, flows
   - Extract patterns and architecture decisions

2. **Define Types in core-orb**
   - Create domain module (e.g. `packages/core-orb/src/messaging/types.ts`)
   - Keep types abstract (don't hardwire Supabase yet)
   - Document mapping from SomaOS concepts

3. **Implement Core Logic**
   - Port business logic to appropriate core package
   - Integrate with existing Orb layers (Sol/Te/Mav/Luna)
   - Maintain Orb model consistency

4. **Create UI (if needed)**
   - Port UI patterns to orb-web
   - Use design tokens from `luna/packages/design-tokens`
   - Ensure consistency with SomaOS UX

5. **Document Mapping**
   - Update this document with implementation details
   - Note any deviations from SomaOS patterns
   - Document integration points

### Agent Coordination

- **Architect** creates initial porting plan for each domain
- **Domain-specific agents** (luna, te, mav, orb_ui) implement their parts
- **Architect** integrates cross-cutting concerns
- **All agents** document their changes in this file

---

## Priority Order

1. **Identity & Modes** (Phase 5, foundational)
2. **System Readiness** (Phase 5, enables verification)
3. **Multi-Agent Forge** (Already in progress, refine)
4. **Design Tokens** (Apply to orb-web)
5. **Messaging** (High-value feature)
6. **Contacts** (Graph structure)
7. **Finances** (Complex domain)
8. **Playground/Alien** (Nice-to-have)

---

## Notes for Ultra Agents

When porting from SomaOS:

- **Don't copy-paste Swift code** - Extract concepts and patterns, implement in TypeScript
- **Keep types abstract** - Don't hardwire Supabase or specific implementations
- **Respect Orb model** - Map SomaOS concepts to Sol/Te/Mav/Luna/Orb roles
- **Maintain consistency** - Use existing patterns in orb-system
- **Document deviations** - If you change something from SomaOS, note why
- **Test incrementally** - Port in small chunks, verify each step

This document is a **living map** - update it as you port features.

