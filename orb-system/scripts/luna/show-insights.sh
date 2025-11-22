#!/bin/bash
# Luna device script - Show adaptation insights
# Phase 7: Multi-device orchestration

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../../.." && pwd)"

cd "$REPO_ROOT"

# Load device context
export DEVICE_ID=luna
export DEVICE_LABEL="Luna (Secondary/Backup Machine)"

# Show insights via CLI
pnpm --filter @orb-system/orb-cli exec orb insights "$@"

