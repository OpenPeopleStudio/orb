# SomaOS Porting Plan

This document maps SomaOS concepts, modules, and flows to orb-system. Use this as a reference when porting features from SomaOS (SwiftUI app) into orb-system (TypeScript/Web OS layer).

**Principle**: SomaOS is the **concept quarry** - it encodes product decisions and architecture patterns. orb-system learns from SomaOS, then SomaOS becomes "just one client" of orb.

---

## 1. Identity & Modes

### Source Documents
- `SomaOS/PLACE_PROFILE_DEPLOYMENT.md`
- `CONTACTS_COMPLETE_DATABASE_REQUIREMENTS.md`
- SomaOS device/persona/mode definitions

### Target in orb-system
- `packages/core-orb/src/identity/**`
  - `identity/types.ts` now includes `OrbDeviceProfile`, `OrbPersonaProfile`, and `OrbModeDescriptor` maps (`ORB_DEVICE_PROFILES`, `ORB_PERSONA_PROFILES`, `ORB_MODE_DESCRIPTORS`)
- `packages/core-luna/src/types.ts` (modes, personas) consumes the descriptors from core-orb
- `packages/core-orb/src/config.ts` (device definitions)

### What to Port
- **Devices**: Sol, Luna, Mars, Earth
- **Personas**: Personal, SWL, RealEstate, OpenPeople
- **Modes**: explorer, forge, etc.
- **User/Profile model**: Identity, preferences, constraints

### Implementation Notes
- Start with type definitions in `core-orb`
- Don't hardwire Supabase yet - use pluggable stores
- Luna owns mode/persona logic, but core-orb defines the canonical types
- Identity descriptors now act as the single source of truth for devices/personas/modes across packages

---

## 2. Multi-Agent Forge

### Source Documents
- `SOMAFORGE_FORGE_NODE_ARCHITECTURE.md`
- `MULTI_AGENT_SYSTEM.md`

### Target in orb-system
- `packages/forge/**` (already exists)
- `docs/prompts/forge-*` (bootloader, templates)

### What to Port
- Agent coordination patterns
- Task routing and assignment logic
- Agent communication protocols
- Self-building behaviors

### Implementation Notes
- Forge is already implemented in orb-system
- Port any SomaOS-specific agent patterns that are missing
- Focus on task templates and coordination flows

---

## 3. Playground / Alien

### Source Documents
- `ALIEN_EVOLUTION_QUICK_START.md`
- SomaOS emotional reflection modules

### Target in orb-system
- `apps/orb-web/src/features/playground/**` (to be created)
- `packages/core-orb/src/domains/playground/**` (to be created)
- Event streams in `core-orb` for emotional reflection

### What to Port
- Alien evolution mechanics
- Emotional reflection patterns
- Playground UI/UX concepts
- Event-driven emotional state

### Implementation Notes
- This is a future domain - define types first
- Use Te (reflection) layer for emotional analysis
- Event bus (Phase 6) will enable real-time emotional streams

---

## 4. Communication (Email / Messaging)

### Source Documents
- `EMAIL_LOADING_TROUBLESHOOTING.md`
- `GMAIL_MIGRATION_LINKS.md`
- SomaOS inbox/messaging modules

### Target in orb-system
- `packages/core-orb/src/domains/messaging/**` (to be created)
- `apps/orb-web/src/features/inbox/**` (to be created)

### What to Port
- Email integration patterns
- Message threading and organization
- Inbox UI concepts
- Notification handling

### Implementation Notes
- Define messaging domain types in `core-orb`
- Mav layer will handle actual email API integrations
- UI will be in orb-web

---

## 5. Contacts

### Source Documents
- `CONTACTS_COMPLETE_DATABASE_REQUIREMENTS.md`
- SomaOS contacts/people modules

### Target in orb-system
- `packages/core-orb/src/domains/contacts/**` (to be created)
- Contact graph and emotional signals

### What to Port
- Contact data model
- Relationship graph
- Emotional signals and history
- Contact synchronization patterns

### Implementation Notes
- Start with type definitions
- Graph structure can use simple adjacency lists initially
- Emotional signals map to Te reflection layer

---

## 6. Finances

### Source Documents
- SomaOS finance docs & schema
- Transaction/category/account models

### Target in orb-system
- `packages/core-orb/src/domains/finances/**` (to be created)
- Orb data contract for Supabase later

### What to Port
- Transaction model
- Category system
- Account management
- Financial reflection patterns (Te integration)

### Implementation Notes
- Define types first, implementation later
- Te layer already has financial reflection hooks
- Mav will handle bank API integrations

---

## 7. System Readiness & Verification

### Source Documents
- `V1_VERIFICATION_CHECKLIST.md`
- `SYSTEM_READY.md`
- `DATABASE_PUSH_GUIDE.md`

### Target in orb-system
- `packages/core-orb/src/system/**` (implemented)
  - `system/checks.ts`: `checkNodeVersion`, `checkGitStatus`, `checkSupabaseConfig`, `checkDatabaseConfig`, `checkPersistenceMode`
  - `system/index.ts`: `runSystemReadiness()` helper + default check set
- System readiness checks API for orb-web / agents

### What to Port
- Readiness check patterns
- Verification workflows
- System health monitoring
- Database migration checks

### Implementation Notes
- Ready-to-use checks now run synchronously in Node (no external deps)
- `runSystemReadiness()` returns structured report (`ReadinessReport`) for UI/agents
- UI can display system status; agents can gate actions based on `overallStatus`

---

## Porting Workflow

When porting a feature from SomaOS:

1. **Identify the domain** (identity, messaging, contacts, etc.)
2. **Check this map** to find target location in orb-system
3. **Start with types** - define TypeScript interfaces in `core-orb/src/domains/<domain>/**`
4. **Implement in layers**:
   - Luna: preferences/constraints related to domain
   - Mav: actions/integrations for domain
   - Te: reflection patterns for domain
   - Orb UI: presentation for domain
5. **Use Forge agents** - assign tasks to appropriate agents via bootloader
6. **Document** - update this file with what was ported

---

## Status Tracking

- [x] Identity & Modes (Phase 5) — descriptors + Luna integration merged
- [ ] Multi-Agent Forge (mostly done, may need refinements)
- [ ] Playground / Alien (future)
- [ ] Communication (future)
- [ ] Contacts (future)
- [ ] Finances (future)
- [x] System Readiness (Phase 5) — readiness module + core checks in place

---

## Notes for Ultra Agents

When you encounter a task that says "port X from SomaOS":

1. Read the relevant SomaOS source document
2. Check this porting plan for target location
3. Start with type definitions in `core-orb`
4. Implement layer by layer (Luna → Mav → Te → UI)
5. Update this document's status tracking

**Remember**: SomaOS is the quarry, orb-system is the OS. Port concepts, not Swift code.
