# Build Core-Te Reflection Engine

## Orb Context

You are working on the **Te** layer of the Orb system. Te is "what the model reflects on" - memory, evaluation, self-critique, and journaling.

**Orb Model Recap:**
- **Sol** → What the model runs on (engine/inference/brain)
- **Te** → What the model reflects on (reflection/memory) ← **YOU ARE HERE**
- **Mav** → What the model accomplishes (actions/tools)
- **Luna** → What the user decides they want it to be (preferences/intent)
- **Orb** → The package everything comes in (app/shell)

## Current State

The `core-te` package has been scaffolded with:
- Basic reflection service (`reflection.ts`)
- Memory service (`memory.ts`)
- Reflection engine for financial insights (`reflectionEngine.ts`)
- Embeddings service (`embeddings.ts`)

## Tasks

### 1. Design Reflection Pipeline API

Create a robust reflection pipeline that can:
- Accept structured input (text, metadata, context)
- Generate reflections using AI (with configurable tone/approach)
- Store reflections with proper indexing
- Link reflections to related entities (tasks, events, messages)

**Files to create/modify:**
- `packages/core-te/src/reflectionPipeline.ts`
- Extend `packages/core-te/src/reflection.ts`

### 2. Implement Structured Journaling

Build a journaling system that:
- Supports daily/weekly/monthly journal entries
- Automatically generates summaries and patterns
- Links journal entries to emotional state, tasks, and events
- Provides query interface for historical patterns

**Files to create:**
- `packages/core-te/src/journaling.ts`
- `packages/core-te/src/journalSummarizer.ts`

### 3. Wire Reflection Summaries into Store

Integrate reflection summaries with database storage:
- Store summaries in a queryable format
- Create indexes for fast retrieval
- Support time-based queries (last week, last month, etc.)
- Enable semantic search across reflection history

**Files to create/modify:**
- `packages/core-te/src/reflectionStore.ts`
- Update `packages/core-te/src/memory.ts` to use store

### 4. Add Hooks for Evaluating Mav Actions

Create evaluation hooks that:
- Allow Te to review Mav's actions after execution
- Generate feedback on action effectiveness
- Store evaluation results for learning
- Provide insights for future action planning

**Files to create:**
- `packages/core-te/src/actionEvaluator.ts`
- Integration with `@orb-system/core-mav`

## Implementation Guidelines

- Use `OrbRole.TE` for all operations
- Accept `OrbContext` in all public functions
- Tag all operations with appropriate role
- Maintain separation from Sol (inference) and Mav (actions)
- Focus on reflection, evaluation, and memory - not execution

## Success Criteria

- [ ] Reflection pipeline accepts structured input and generates reflections
- [ ] Journaling system creates and summarizes entries
- [ ] Reflection summaries are stored and queryable
- [ ] Action evaluation hooks are integrated with Mav
- [ ] All code uses `OrbRole.TE` and `OrbContext`

## Next Steps

After completing this, see:
- `build-core-mav-action-graph.md` - For integrating with Mav actions
- `build-core-sol-model-orchestrator.md` - For using Sol's inference capabilities

