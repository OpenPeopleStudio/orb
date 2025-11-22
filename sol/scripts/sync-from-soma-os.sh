#!/usr/bin/env bash
# sync-from-soma-os.sh
#
# Purpose: Sync code snippets from SomaOS repo into Sol workspace for reference
#
# Usage:
#   ./sync-from-soma-os.sh <relative-path-in-soma-os>
#
# Example:
#   ./sync-from-soma-os.sh SomaOS/Views/Dashboard/LauncherView.swift
#
# This script reads the soma-os path from config/sol.device.json and copies
# specified files to workspace/archives/ for analysis and reference.

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SOL_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"

# Config file path
CONFIG_FILE="${SOL_ROOT}/config/sol.device.json"

echo "Sol Sync: Syncing from SomaOS repo"
echo "===================================="
echo ""

# Check if config file exists
if [ ! -f "${CONFIG_FILE}" ]; then
    echo -e "${RED}Error: Config file not found at ${CONFIG_FILE}${NC}"
    exit 1
fi

# Check if jq is available (for JSON parsing)
if ! command -v jq &> /dev/null; then
    echo -e "${YELLOW}Warning: jq not found. Using grep as fallback (less reliable)${NC}"
    USE_JQ=false
else
    USE_JQ=true
fi

# TODO: Parse config file to get soma-os repository path
# For now, we'll use the default from the worktree structure
SOMA_OS_PATH="${SOL_ROOT}"

echo -e "SomaOS path: ${GREEN}${SOMA_OS_PATH}${NC}"
echo ""

# Check if argument provided
if [ $# -eq 0 ]; then
    echo -e "${YELLOW}Usage: $0 <relative-path-in-soma-os>${NC}"
    echo ""
    echo "Example:"
    echo "  $0 SomaOS/Views/Dashboard/LauncherView.swift"
    echo ""
    exit 1
fi

SOURCE_PATH="$1"
FULL_SOURCE_PATH="${SOMA_OS_PATH}/${SOURCE_PATH}"

# Check if source file exists
if [ ! -f "${FULL_SOURCE_PATH}" ]; then
    echo -e "${RED}Error: Source file not found: ${FULL_SOURCE_PATH}${NC}"
    exit 1
fi

# TODO: Implement actual file copying
# For now, we'll just show what would be copied

echo -e "${GREEN}Would copy:${NC}"
echo "  From: ${FULL_SOURCE_PATH}"
echo "  To:   ${SOL_ROOT}/workspace/archives/$(basename "${SOURCE_PATH}")"
echo ""

# TODO: Implement these features:
# 1. Parse config/sol.device.json to get correct soma-os path
# 2. Create dated archive directory (e.g., archives/2025-11-22/)
# 3. Copy file to archive directory with timestamp
# 4. Generate a summary markdown file with:
#    - Original path
#    - Sync date
#    - File size
#    - Brief description (extracted from comments if available)
# 5. Support syncing entire directories, not just single files
# 6. Add --dry-run flag to preview without copying

echo -e "${YELLOW}TODO: Actual file copying not yet implemented${NC}"
echo "This is a placeholder script. Implement file copying logic here."
echo ""

exit 0

