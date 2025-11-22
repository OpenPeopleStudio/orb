#!/bin/bash
# Luna device script - Run agent mission
# Phase 7: Multi-device orchestration
# 
# Luna as Forge Host - maintains scripts for heavy builds,
# periodic agent jobs, and dev sessions.

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../../.." && pwd)"

cd "$REPO_ROOT"

# Load device context
export DEVICE_ID=luna
export DEVICE_LABEL="Luna (Secondary/Backup Machine - Forge Host)"

# Run agent mission via CLI
pnpm --filter @orb-system/orb-cli exec orb run agent-mission "$@"

