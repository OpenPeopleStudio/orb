#!/usr/bin/env bash
# Git Worktree Summary Script
# Shows status, commits, and changes for all worktrees

set -euo pipefail

DETAILED=false
SHOW_DIFF=false

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -d|--detailed)
            DETAILED=true
            shift
            ;;
        --diff)
            SHOW_DIFF=true
            shift
            ;;
        *)
            echo "Unknown option: $1"
            echo "Usage: $0 [-d|--detailed] [--diff]"
            exit 1
            ;;
    esac
done

# Colors
CYAN='\033[0;36m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
MAGENTA='\033[0;35m'
GRAY='\033[0;90m'
WHITE='\033[1;37m'
NC='\033[0m' # No Color

echo -e "\n${CYAN}╔════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║          Git Worktree Summary - Orb Project                   ║${NC}"
echo -e "${CYAN}╚════════════════════════════════════════════════════════════════╝${NC}\n"

# Get all worktrees
mapfile -t WORKTREES < <(git worktree list --porcelain)

if [ ${#WORKTREES[@]} -eq 0 ]; then
    echo -e "${YELLOW}No worktrees found.${NC}"
    exit 0
fi

# Parse worktrees
declare -a WT_PATHS
declare -a WT_BRANCHES
declare -a WT_COMMITS

CURRENT_PATH=""
CURRENT_BRANCH=""
CURRENT_COMMIT=""

for line in "${WORKTREES[@]}"; do
    if [[ $line =~ ^worktree[[:space:]](.+)$ ]]; then
        if [ -n "$CURRENT_PATH" ]; then
            WT_PATHS+=("$CURRENT_PATH")
            WT_BRANCHES+=("$CURRENT_BRANCH")
            WT_COMMITS+=("$CURRENT_COMMIT")
        fi
        CURRENT_PATH="${BASH_REMATCH[1]}"
        CURRENT_BRANCH=""
        CURRENT_COMMIT=""
    elif [[ $line =~ ^HEAD[[:space:]](.+)$ ]]; then
        CURRENT_COMMIT="${BASH_REMATCH[1]}"
    elif [[ $line =~ ^branch[[:space:]](.+)$ ]]; then
        CURRENT_BRANCH="${BASH_REMATCH[1]##refs/heads/}"
    fi
done

# Add last worktree
if [ -n "$CURRENT_PATH" ]; then
    WT_PATHS+=("$CURRENT_PATH")
    WT_BRANCHES+=("$CURRENT_BRANCH")
    WT_COMMITS+=("$CURRENT_COMMIT")
fi

# Display each worktree
INDEX=1
TOTAL_WITH_CHANGES=0
TOTAL_CLEAN=0

for i in "${!WT_PATHS[@]}"; do
    PATH="${WT_PATHS[$i]}"
    BRANCH="${WT_BRANCHES[$i]}"
    COMMIT="${WT_COMMITS[$i]}"
    COMMIT_SHORT="${COMMIT:0:7}"
    
    BRANCH_NAME="${BRANCH:-detached HEAD}"
    
    echo -e "${WHITE}[$INDEX]${NC} ${GRAY}Worktree:${NC} ${CYAN}$PATH${NC}"
    echo -e "    ${GRAY}Branch:${NC} ${GREEN}$BRANCH_NAME${NC}"
    echo -e "    ${GRAY}Commit:${NC} ${YELLOW}$COMMIT_SHORT${NC}"
    
    # Get status
    STATUS=$(git -C "$PATH" status --porcelain 2>/dev/null || echo "")
    
    if [ -n "$STATUS" ]; then
        echo -e "    ${GRAY}Status:${NC} ${RED}HAS CHANGES${NC}"
        
        # Count changes
        STAGED=$(echo "$STATUS" | grep -c '^[MADRC]' || true)
        UNSTAGED=$(echo "$STATUS" | grep -c '^.[MD]' || true)
        UNTRACKED=$(echo "$STATUS" | grep -c '^??' || true)
        
        [ $STAGED -gt 0 ] && echo -e "      ${GRAY}•${NC} Staged: ${GREEN}$STAGED files${NC}"
        [ $UNSTAGED -gt 0 ] && echo -e "      ${GRAY}•${NC} Unstaged: ${YELLOW}$UNSTAGED files${NC}"
        [ $UNTRACKED -gt 0 ] && echo -e "      ${GRAY}•${NC} Untracked: ${MAGENTA}$UNTRACKED files${NC}"
        
        if [ "$DETAILED" = true ]; then
            echo -e "\n      ${GRAY}Changed files:${NC}"
            echo "$STATUS" | while IFS= read -r line; do
                echo -e "        ${GRAY}$line${NC}"
            done
        fi
        
        TOTAL_WITH_CHANGES=$((TOTAL_WITH_CHANGES + 1))
    else
        echo -e "    ${GRAY}Status:${NC} ${GREEN}Clean${NC}"
        TOTAL_CLEAN=$((TOTAL_CLEAN + 1))
    fi
    
    # Recent commits
    if [ -n "$BRANCH" ]; then
        RECENT=$(git -C "$PATH" log --oneline -3 2>/dev/null || echo "")
        if [ -n "$RECENT" ]; then
            echo -e "\n    ${GRAY}Recent commits:${NC}"
            echo "$RECENT" | while IFS= read -r commit; do
                echo -e "      ${GRAY}• $commit${NC}"
            done
        fi
        
        # Ahead/behind main
        MAIN_BRANCH=$(git -C "$PATH" symbolic-ref refs/remotes/origin/HEAD 2>/dev/null | sed 's|refs/remotes/origin/||' || echo "main")
        
        if [ "$BRANCH" != "$MAIN_BRANCH" ]; then
            AHEAD=$(git -C "$PATH" rev-list --count "$MAIN_BRANCH..$BRANCH" 2>/dev/null || echo "0")
            BEHIND=$(git -C "$PATH" rev-list --count "$BRANCH..$MAIN_BRANCH" 2>/dev/null || echo "0")
            
            if [ "$AHEAD" -gt 0 ] || [ "$BEHIND" -gt 0 ]; then
                echo -e "\n    ${GRAY}Compared to $MAIN_BRANCH:${NC}"
                [ "$AHEAD" -gt 0 ] && echo -e "      ${GREEN}↑ $AHEAD commits ahead${NC}"
                [ "$BEHIND" -gt 0 ] && echo -e "      ${YELLOW}↓ $BEHIND commits behind${NC}"
            fi
        fi
    fi
    
    # Show diff if requested
    if [ "$SHOW_DIFF" = true ] && [ -n "$STATUS" ]; then
        echo -e "\n    ${GRAY}Diff preview:${NC}"
        git -C "$PATH" diff --stat 2>/dev/null | sed 's/^/      /' || true
    fi
    
    echo ""
    INDEX=$((INDEX + 1))
done

# Summary
echo -e "${CYAN}╔════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║  Summary                                                       ║${NC}"
echo -e "${CYAN}╚════════════════════════════════════════════════════════════════╝${NC}"

TOTAL=${#WT_PATHS[@]}
echo -e "${GRAY}Total worktrees:${NC} ${WHITE}$TOTAL${NC}"
echo -e "${GRAY}With changes:   ${NC} ${YELLOW}$TOTAL_WITH_CHANGES${NC}"
echo -e "${GRAY}Clean:          ${NC} ${GREEN}$TOTAL_CLEAN${NC}"
echo ""

echo -e "${GRAY}TIP: Run with --detailed to see all changed files${NC}"
echo -e "${GRAY}TIP: Run with --diff to see diff stats${NC}"
echo ""

