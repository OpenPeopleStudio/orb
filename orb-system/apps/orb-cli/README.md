# Orb CLI

Multi-device orchestration CLI for Orb system.

**Phase 7**: Multi-device & Auto-Building Behavior

## Installation

The CLI is part of the orb-system monorepo. Build it with:

```bash
pnpm build --filter @orb-system/orb-cli
```

## Usage

### Run Demo Flow

```bash
orb run demo-flow --prompt="Hello, Orb!" --mode=forge
```

Options:
- `--userId <id>` - User ID (default: default-user)
- `--sessionId <id>` - Session ID (default: auto-generated)
- `--prompt <text>` - Prompt text
- `--mode <mode>` - Mode (default, forge, explorer, etc.)
- `--deviceId <device>` - Device (sol, luna, mars, earth)

### Run Agent Mission

```bash
orb run agent-mission --agent=luna --task=persist-store
```

This command prepares the context for running an agent mission. In a full implementation, this would spawn a Cursor Ultra session with the appropriate task prompt.

### Show Adaptation Insights

```bash
orb insights
orb insights --filter=mode:forge
```

Displays:
- Most used modes
- Failing features
- Device usage statistics
- Role activity
- Error/success rates
- Discovered patterns
- Recommendations

### Query Events

```bash
orb events
orb events --limit=50 --filter=mode:forge,role:mav
```

## Device-Specific Scripts

### Sol (Primary Development Machine)

```bash
./scripts/sol/run-demo-flow.sh --prompt="Hello"
./scripts/sol/run-agent-mission.sh --agent=luna --task=persist-store
./scripts/sol/show-insights.sh
```

### Luna (Secondary/Backup Machine - Forge Host)

```bash
./scripts/luna/run-demo-flow.sh --prompt="Hello"
./scripts/luna/run-agent-mission.sh --agent=luna --task=persist-store
./scripts/luna/show-insights.sh
```

Luna scripts are designed for:
- Heavy builds (numerical tasks, CI)
- Periodic agent jobs (nightly refactors, documentation sync)
- Local LLM tasks (future)

## Architecture

The CLI:
1. Routes commands to core-orb flows
2. Emits events via the event bus
3. Computes adaptation insights from event history
4. Provides device-aware context for multi-device orchestration

## Future Enhancements

- Spawn Cursor Ultra sessions automatically
- Schedule periodic agent jobs
- Cross-device synchronization
- Real-time event streaming

