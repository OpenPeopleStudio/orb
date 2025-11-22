#!/bin/bash
# Sol device script - Run demo flow
# Phase 7: Multi-device orchestration

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../../.." && pwd)"

cd "$REPO_ROOT"

# Load device context
export DEVICE_ID=sol
export DEVICE_LABEL="Sol (Primary Development Machine)"

# Run demo flow via CLI
pnpm --filter @orb-system/orb-cli exec orb run demo-flow "$@"

