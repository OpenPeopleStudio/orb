#!/usr/bin/env bash
# snapshot-ui-state.sh
#
# Purpose: Create a timestamped snapshot note file in workspace/notes/
#
# Usage:
#   ./snapshot-ui-state.sh
#
# This script creates a dated snapshot file with a template for recording
# current UI state, focus areas, active flows, and known issues.

set -euo pipefail

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SOL_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"

# Generate timestamp
TIMESTAMP=$(date +"%Y-%m-%d_%H%M%S")
DATE_HUMAN=$(date +"%Y-%m-%d %H:%M:%S")
DATE_SHORT=$(date +"%Y-%m-%d")

# Snapshot file path
SNAPSHOT_FILE="${SOL_ROOT}/workspace/notes/snapshot-${TIMESTAMP}.md"

echo "Sol Snapshot: Creating UI state snapshot"
echo "========================================"
echo ""
echo -e "Snapshot file: ${GREEN}${SNAPSHOT_FILE}${NC}"
echo ""

# Create the snapshot file with template
cat > "${SNAPSHOT_FILE}" << EOF
# UI State Snapshot

**Date**: ${DATE_HUMAN}  
**Type**: UI State Snapshot

---

## Current Focus

[What area of the OS are you currently working on or thinking about?]

- 
- 
- 

---

## Active Flows

[What user flows or interactions are you testing or refining?]

### Flow 1: [Name]

**Status**: [In Progress / Blocked / Complete]

**Description**: [Brief description]

**Next steps**:
- [ ] 
- [ ] 

### Flow 2: [Name]

**Status**: [In Progress / Blocked / Complete]

**Description**: [Brief description]

**Next steps**:
- [ ] 
- [ ] 

---

## Known Issues

[What's broken or not working as expected?]

1. **[Issue name]**  
   *Severity*: [Critical / High / Medium / Low]  
   *Surface*: [Which screen/component]  
   *Description*: [What's wrong]  
   *Workaround*: [If any]

2. **[Issue name]**  
   *Severity*: [Critical / High / Medium / Low]  
   *Surface*: [Which screen/component]  
   *Description*: [What's wrong]  
   *Workaround*: [If any]

---

## Recent Changes

[What has changed since the last snapshot?]

- 
- 
- 

---

## Observations

[Any notable insights, patterns, or concerns?]

- 
- 
- 

---

## Mode Context

**Primary mode in use**: [Sol / Mars / Earth]

**Mode switch frequency**: [How often are you switching modes?]

**Mode-specific notes**:

- **Sol**: 
- **Mars**: 
- **Earth**: 

---

## Design Decisions

[Any design decisions made or questions raised?]

### Decision: [Title]

**Context**: [Why this decision was needed]

**Chosen approach**: [What you decided]

**Alternatives considered**: [What else was considered]

**Rationale**: [Why this approach]

### Question: [Title]

**Context**: [What you're uncertain about]

**Options**:
- Option A: 
- Option B: 
- Option C: 

**Next steps**: [How to resolve]

---

## Next Session Goals

[What do you want to accomplish next time?]

1. 
2. 
3. 

---

## References

- Related explorations: 
- Related refactor specs: 
- Related reviews: 

EOF

echo -e "${GREEN}✓ Snapshot created successfully${NC}"
echo ""
echo "Edit the snapshot file to record your current state:"
echo "  ${SNAPSHOT_FILE}"
echo ""

# TODO: Implement these enhancements:
# 1. Auto-detect current git branch and commit hash
# 2. Auto-list recently modified files in SomaOS repo
# 3. Auto-capture current mode from alien state (if available)
# 4. Support --open flag to automatically open in editor
# 5. Support --quick flag for minimal template (fewer sections)
# 6. Add snapshot index file that lists all snapshots with summaries

echo -e "${YELLOW}Tip: You can edit this template in the script to customize your snapshot format${NC}"
echo ""

exit 0

