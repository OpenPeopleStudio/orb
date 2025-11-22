# @soma-forge/forge-core

Forge Core is the **domain layer** for SomaForge, providing the single source of truth for core domain types and mock data.

## Overview

This package defines the core domain model for SomaForge, including:

- **Agents** - Individual AI agents with their roles, capabilities, and status
- **Pipelines** - Workflow definitions composed of multiple steps
- **Runs** - Execution history of pipeline runs

## Current Implementation

The current implementation is **mock-only** and uses static data. This allows UI components to be developed and tested without a backend. The mock data will be replaced with real persistence and API calls in later development phases.

## Usage

### Types

All domain types are exported from the main entry point:

```typescript
import type { Agent, Pipeline, Run, AgentStatus, RunStatus } from "@soma-forge/forge-core";
```

### Mock Data

Mock data is available under namespaces:

```typescript
import { mockAgents, mockPipelines, mockRuns } from "@soma-forge/forge-core";

// Access mock agents
const agents = mockAgents.agents;
```

### React Hooks

React hooks provide a clean API for accessing domain data:

```typescript
import { useAgents, useAgent, usePipelines, usePipeline, useRuns, useRun } from "@soma-forge/forge-core";

// Get all agents
const { data: agents, isLoading, error } = useAgents();

// Get a specific agent
const agent = useAgent("agent-codegen-001");

// Get all pipelines
const { data: pipelines } = usePipelines();

// Get a specific pipeline
const pipeline = usePipeline("pipeline-full-stack-001");

// Get all runs
const { data: runs } = useRuns();

// Get a specific run
const run = useRun("run-001");
```

**Note:** Components using these hooks must be marked with `"use client"` in Next.js.

## Dependencies

The UI should depend **only** on these types and hooks for domain data. This ensures:

1. Type safety across the application
2. Consistent data structures
3. Easy migration to real data sources later
4. Clear separation of concerns

## Future Migration

When transitioning to real data sources:

1. The hook implementations will be updated to fetch from APIs
2. The `isLoading` and `error` states will become functional
3. Mock data exports will remain available for testing
4. The public API (hooks and types) will remain unchanged

## Package Structure

```
src/
  types.ts           # Core domain type definitions
  mocks/             # Mock data
    agents.ts
    pipelines.ts
    runs.ts
  hooks/             # React hooks
    useAgents.ts
    useAgent.ts
    usePipelines.ts
    usePipeline.ts
    useRuns.ts
    useRun.ts
  index.ts           # Public API exports
```

