#!/usr/bin/env bash
# open-studio.sh
#
# Purpose: Convenience script to open Sol Studio (workspace and docs)
#
# Usage:
#   ./open-studio.sh [--docs-only] [--workspace-only]
#
# This script opens Sol workspace files and documentation in your
# preferred editor (Cursor, VSCode, etc.) or default apps.

set -euo pipefail

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SOL_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"

echo "Sol Studio Launcher"
echo "==================="
echo ""

# Parse arguments
DOCS_ONLY=false
WORKSPACE_ONLY=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --docs-only)
            DOCS_ONLY=true
            shift
            ;;
        --workspace-only)
            WORKSPACE_ONLY=true
            shift
            ;;
        *)
            echo "Unknown option: $1"
            echo "Usage: $0 [--docs-only] [--workspace-only]"
            exit 1
            ;;
    esac
done

# Core files to open
CORE_FILES=(
    "${SOL_ROOT}/README.md"
    "${SOL_ROOT}/config/sol.device.json"
    "${SOL_ROOT}/design/os_redesign_brief.md"
)

WORKSPACE_AREAS=(
    "${SOL_ROOT}/workspace/explorations"
    "${SOL_ROOT}/workspace/notes"
)

# TODO: Detect available editor
# Check for common editors in order of preference
EDITOR_CMD=""

# Check for Cursor
if command -v cursor &> /dev/null; then
    EDITOR_CMD="cursor"
    EDITOR_NAME="Cursor"
# Check for VSCode
elif command -v code &> /dev/null; then
    EDITOR_CMD="code"
    EDITOR_NAME="Visual Studio Code"
# Check for default text editor on macOS
elif [[ "$OSTYPE" == "darwin"* ]]; then
    EDITOR_CMD="open -a TextEdit"
    EDITOR_NAME="TextEdit (default)"
else
    echo -e "${YELLOW}Warning: No editor found (cursor, code)${NC}"
    echo "Please open files manually:"
    echo ""
    for file in "${CORE_FILES[@]}"; do
        echo "  - ${file}"
    done
    echo ""
    exit 1
fi

echo -e "Using editor: ${GREEN}${EDITOR_NAME}${NC}"
echo -e "Sol root: ${BLUE}${SOL_ROOT}${NC}"
echo ""

# TODO: Implement actual file opening
# For now, just show what would be opened

if [ "$WORKSPACE_ONLY" = false ]; then
    echo -e "${GREEN}Would open core documentation:${NC}"
    for file in "${CORE_FILES[@]}"; do
        echo "  - $(basename "${file}")"
    done
    echo ""
fi

if [ "$DOCS_ONLY" = false ]; then
    echo -e "${GREEN}Would open workspace areas:${NC}"
    for area in "${WORKSPACE_AREAS[@]}"; do
        echo "  - $(basename "${area}")/"
    done
    echo ""
fi

# TODO: Implement these features:
# 1. Actually open files in detected editor
#    Example: cursor "${SOL_ROOT}/README.md"
# 2. Open all files in a single window/workspace
#    Example: cursor --add "${SOL_ROOT}"
# 3. Support --editor flag to specify editor manually
# 4. Support --recent flag to open recently modified files
# 5. Create a Cursor workspace file (.code-workspace) for Sol
# 6. Support opening specific prompts with --prompt flag
#    Example: ./open-studio.sh --prompt exploration

echo -e "${YELLOW}TODO: Actual file opening not yet implemented${NC}"
echo "This is a placeholder script."
echo ""
echo "Manual opening command examples:"
echo "  cursor ${SOL_ROOT}"
echo "  code ${SOL_ROOT}"
echo "  open -a Cursor ${SOL_ROOT}"
echo ""

# Change to Sol root directory
echo "Changing directory to Sol root..."
cd "${SOL_ROOT}"
echo -e "${GREEN}✓ Now in: $(pwd)${NC}"
echo ""

exit 0

