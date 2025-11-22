# Sol User Personas

Sol is designed to serve multiple personas, each with distinct goals, workflows, and needs. Understanding these personas ensures the OS redesign addresses real friction points and delivers meaningful value.

---

## Persona 1: Architect / Designer

**Role**: System builder, product designer, OS architect  
**Primary Context**: Sol mode, creative exploration, deep technical work

### Primary Goals
- Design and architect complex systems with clarity
- Move fluidly between high-level vision and implementation details
- Maintain context across long, multi-session projects
- Express intent clearly to AI agents and human collaborators

### Daily Activities
- Designing OS surfaces, navigation flows, interaction patterns
- Writing specs, briefs, and design documentation
- Reviewing implementation work (Swift, TypeScript)
- Prototyping new concepts in playground environments
- Managing multi-agent development workflows

### Current Friction Points in Soma
- **Context switching overhead**: Moving between design intent and code implementation feels jarring
- **Tool fragmentation**: Design tokens in one place, implementation in another, specs elsewhere
- **Reflection gap**: Hard to step back and see the full system from a distance
- **Intent → execution latency**: Too much manual translation between "what I want" and "what gets built"

### Non-Negotiables for Sol Redesign
1. **Token Studio always accessible** — design DNA must be inspectable and modifiable at any time
2. **Seamless multi-agent coordination** — working with Luna, playground agents, and coordinators should feel natural
3. **Schema Lab integration** — understanding data structure is critical for good design
4. **Command palette supremacy** — keyboard-first navigation, minimal mouse dependency
5. **Clean visual hierarchy** — no clutter, every element earns its place

### Success Metrics
- Time from intent to spec: < 5 minutes
- Context recovery time after interruption: < 30 seconds
- Design/implementation alignment: 90%+ match between spec and implementation
- Daily tool switches: Minimize or eliminate friction at each switch

---

## Persona 2: Restaurateur / Operator

**Role**: Restaurant owner/operator managing daily operations  
**Primary Context**: Mars mode, high-tempo coordination, time-sensitive decisions

### Primary Goals
- Coordinate staff efficiently during service
- Track daily financials (sales, expenses, cash flow)
- Manage vendor relationships and orders
- Maintain inventory and supply chain visibility
- Balance operational demands with strategic planning

### Daily Activities
- Morning prep: checking orders, inventory, schedule
- Service coordination: communicating with staff in real-time
- Financial tracking: logging sales, expenses, tips
- Vendor coordination: placing orders, managing deliveries
- End-of-day reconciliation: closing out, reviewing performance

### Current Friction Points in Soma
- **Mode switching delay**: Transitioning from personal to restaurant mode feels manual
- **Contact chaos**: Hard to find the right staff member or vendor quickly under pressure
- **Financial lag**: Recording transactions feels like extra overhead during busy shifts
- **Notification noise**: Personal items interrupting during service
- **Task visibility**: Hard to track what needs doing across the day

### Non-Negotiables for Sol Redesign
1. **Instant mode switching** — Mars mode must activate automatically or with single tap
2. **Smart contact prioritization** — staff and vendors surface immediately when needed
3. **Zero-friction financial logging** — capturing transactions must be faster than current flow
4. **Context-aware notifications** — work only in Mars mode, personal only in Earth mode
5. **Clear task visibility** — always know what's next, what's urgent, what can wait

### Success Metrics
- Mode switch time: < 1 second
- Contact access time: < 2 seconds from any screen
- Financial entry time: < 15 seconds per transaction
- Task completion rate: 95%+ of daily tasks closed
- Notification relevance: 100% (no wrong-context alerts)

---

## Persona 3: Realtor

**Role**: Real estate professional managing listings, clients, and transactions  
**Primary Context**: Mixed Mars/Earth mode, relationship-focused, deal-driven

### Primary Goals
- Manage property listings and client relationships
- Track deals through complex multi-step pipelines
- Coordinate showings, inspections, closings
- Maintain detailed property and client notes
- Balance multiple concurrent transactions

### Daily Activities
- Morning: reviewing active deals, scheduling showings
- Client communication: texts, calls, emails about properties
- Property research: gathering comps, market data
- Showing coordination: logistics, timing, follow-ups
- Deal management: tracking paperwork, deadlines, contingencies

### Current Friction Points in Soma
- **Client/property linkage**: Hard to see all properties associated with a client
- **Deal pipeline visibility**: No clear view of where each transaction stands
- **Note fragmentation**: Property notes, client notes, deal notes scattered
- **Scheduling complexity**: Coordinating multiple parties for showings is manual
- **Document tracking**: Hard to know what paperwork is outstanding

### Non-Negotiables for Sol Redesign
1. **Relationship graphs** — see connections between clients, properties, deals at a glance
2. **Pipeline visualization** — clear status of every active transaction
3. **Unified notes** — all context for a person/property/deal in one place
4. **Smart scheduling** — coordinate multi-party events with minimal friction
5. **Document checklists** — always know what's needed, what's waiting, what's done

### Success Metrics
- Client context retrieval: < 5 seconds
- Deal status visibility: One glance, no drilling
- Scheduling friction: 50% reduction vs current tools
- Document completion rate: 100% (nothing falls through cracks)
- Follow-up timeliness: 90%+ of follow-ups happen on time

---

## Persona 4: Researcher / Writer

**Role**: Knowledge worker focused on deep reading, thinking, and writing  
**Primary Context**: Sol mode (exploration), Earth mode (reflection), minimal Mars

### Primary Goals
- Gather and synthesize information from diverse sources
- Maintain deep focus for extended reading/writing sessions
- Build coherent mental models from scattered inputs
- Produce clear, well-structured written output
- Reflect on ideas and make conceptual connections

### Daily Activities
- Deep reading: articles, papers, books, documentation
- Note-taking: capturing insights, quotes, connections
- Writing: drafting articles, specs, essays
- Research: following threads across multiple sources
- Reflection: reviewing notes, identifying patterns

### Current Friction Points in Soma
- **Capture friction**: Switching from reading to note-taking breaks flow
- **Connection blindness**: Hard to see relationships between notes/ideas
- **Focus fragmentation**: Notifications and context switches disrupt deep work
- **Search limitations**: Finding the right note/source when needed is slow
- **Output inertia**: Moving from notes to structured writing feels heavy

### Non-Negotiables for Sol Redesign
1. **Frictionless capture** — save thoughts without leaving current context
2. **Graph visibility** — see connections between ideas, sources, notes
3. **Focus protection** — deep work mode with zero interruptions
4. **Instant search** — find any note/idea in < 2 seconds
5. **Note → draft flow** — seamless transition from scattered notes to structured output

### Success Metrics
- Capture latency: < 3 seconds from thought to saved note
- Context switches during deep work: < 3 per hour
- Search success rate: 95%+ find what they need first try
- Connection discovery: Surfacing 5+ non-obvious links per research session
- Writing velocity: 50% increase in words per focused hour

---

## Cross-Persona Insights

### Shared Needs
- **Speed**: Every persona needs fast, low-friction interactions
- **Context**: Rich context must be available instantly when needed
- **Clarity**: Visual hierarchy and information design must be impeccable
- **Trust**: The OS must be reliable, predictable, and honest
- **Calm**: No unnecessary noise, motion, or cognitive load

### Shared Friction Points
- Mode switching feels manual
- Context recovery after interruptions is slow
- Information scattered across multiple surfaces
- Notifications poorly matched to current context

### Design Implications
- **One OS, multiple modes** — don't fragment the experience, adapt it
- **Command palette universality** — every persona benefits from keyboard-first access
- **Smart defaults** — learn patterns, reduce repetitive decisions
- **Graceful degradation** — when things break, break obviously and recoverably
- **Progressive disclosure** — show what's needed, hide what's not, always allow drilling deeper

---

**Version**: 1.0  
**Last Updated**: 2025-11-22

