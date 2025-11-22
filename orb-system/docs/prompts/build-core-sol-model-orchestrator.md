# Build Core-Sol Model Orchestrator

## Orb Context

You are working on the **Sol** layer of the Orb system. Sol is "what the model runs on" - engine, inference, model routing, and token control.

**Orb Model Recap:**
- **Sol** → What the model runs on (engine/inference/brain) ← **YOU ARE HERE**
- **Te** → What the model reflects on (reflection/memory)
- **Mav** → What the model accomplishes (actions/tools)
- **Luna** → What the user decides they want it to be (preferences/intent)
- **Orb** → The package everything comes in (app/shell)

## Current State

The `core-sol` package has been scaffolded with:
- Model client (`modelClient.ts`)
- NLU service (`nlu.ts`)
- Intent parser (`intentParser.ts`)
- Emotion analyzer (`emotionAnalyzer.ts`)
- Chat generation (`chatGenerate.ts`)

## Tasks

### 1. Centralize Model Invocations

Create a model orchestrator that:
- Manages all model API calls (OpenAI, Anthropic, etc.)
- Handles rate limiting and retries
- Provides consistent error handling
- Tracks usage and costs

**Files to create:**
- `packages/core-sol/src/modelOrchestrator.ts`
- `packages/core-sol/src/modelProvider.ts`

### 2. Support Multiple Model Providers

Build provider abstraction that:
- Supports OpenAI, Anthropic, and other providers
- Allows switching providers per-request or globally
- Handles provider-specific differences (API format, streaming, etc.)
- Provides fallback mechanisms

**Files to create:**
- `packages/core-sol/src/providers/openai.ts`
- `packages/core-sol/src/providers/anthropic.ts`
- `packages/core-sol/src/providers/base.ts`

### 3. Handle Context Windows

Implement context window management:
- Track token usage per request
- Manage context window limits
- Implement smart truncation strategies
- Support context summarization for long conversations

**Files to create:**
- `packages/core-sol/src/contextManager.ts`
- `packages/core-sol/src/tokenCounter.ts`

### 4. Support Streaming

Add streaming support for:
- Chat completions
- Long-running inference tasks
- Real-time updates to clients
- Graceful handling of stream interruptions

**Files to create:**
- `packages/core-sol/src/streaming.ts`
- `packages/core-sol/src/streamHandler.ts`

## Implementation Guidelines

- Use `OrbRole.SOL` for all operations
- Accept `OrbContext` in all public functions
- Tag all operations with appropriate role
- Sol should not execute actions (that's Mav's job)
- Sol should not store memories (that's Te's job)
- Sol should respect Luna's preferences for model selection

## Success Criteria

- [ ] Model orchestrator centralizes all model calls
- [ ] Multiple providers are supported with abstraction
- [ ] Context windows are managed intelligently
- [ ] Streaming is supported for real-time responses
- [ ] All code uses `OrbRole.SOL` and `OrbContext`

## Next Steps

After completing this, see:
- `build-core-te-reflection-engine.md` - For Te to use Sol's inference
- `build-core-mav-action-graph.md` - For Mav to use Sol's intent parsing

