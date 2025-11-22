# Build Core-Mav Action Graph

## Orb Context

You are working on the **Mav** layer of the Orb system. Mav is "what the model accomplishes" - actions, tools, external systems, and real-world changes.

**Orb Model Recap:**
- **Sol** → What the model runs on (engine/inference/brain)
- **Te** → What the model reflects on (reflection/memory)
- **Mav** → What the model accomplishes (actions/tools) ← **YOU ARE HERE**
- **Luna** → What the user decides they want it to be (preferences/intent)
- **Orb** → The package everything comes in (app/shell)

## Current State

The `core-mav` package has been scaffolded with:
- Basic task service (`tasks.ts`)
- Flow executor (`orchestrator/flowExecutor.ts`)
- Calendar integration (`integrations/calendar.ts`)
- Inbox integration (`integrations/inbox.ts`)

## Tasks

### 1. Define Action/Task Graph Structure

Create a task graph system that:
- Represents tasks as nodes with dependencies
- Supports parallel execution where possible
- Handles task failures and retries
- Tracks task state and progress

**Files to create:**
- `packages/core-mav/src/taskGraph.ts`
- `packages/core-mav/src/taskNode.ts`

### 2. Implement Task Scheduling / Queues

Build a scheduling system that:
- Queues tasks for execution
- Prioritizes tasks based on dependencies and urgency
- Supports task cancellation and rescheduling
- Provides visibility into queue state

**Files to create:**
- `packages/core-mav/src/taskScheduler.ts`
- `packages/core-mav/src/taskQueue.ts`

### 3. Add Adapters for Integrations

Create adapters for at least one real integration:
- Calendar (Google Calendar, Apple Calendar)
- Email (Gmail, IMAP)
- Task management (external APIs)
- Or another integration of your choice

**Files to create:**
- `packages/core-mav/src/integrations/calendar/googleCalendar.ts`
- `packages/core-mav/src/integrations/email/gmail.ts`
- Or adapters for your chosen integrations

### 4. Expose Safe, Inspectable Log of Actions

Create an action log system that:
- Records all actions taken by Mav
- Provides query interface for action history
- Supports filtering by type, date, status
- Enables action replay/undo where possible

**Files to create:**
- `packages/core-mav/src/actionLog.ts`
- `packages/core-mav/src/actionLogger.ts`

## Implementation Guidelines

- Use `OrbRole.MAV` for all operations
- Accept `OrbContext` in all public functions
- Tag all operations with appropriate role
- Never execute actions without Luna's constraints/preferences
- Always log actions for Te to evaluate later
- Support both synchronous and asynchronous execution

## Success Criteria

- [ ] Task graph structure supports dependencies and parallel execution
- [ ] Task scheduler queues and prioritizes tasks
- [ ] At least one real integration adapter is implemented
- [ ] Action log records and queries all Mav actions
- [ ] All code uses `OrbRole.MAV` and `OrbContext`

## Next Steps

After completing this, see:
- `build-core-te-reflection-engine.md` - For Te to evaluate Mav's actions
- `build-core-luna-intent-layer.md` - For respecting Luna's constraints

