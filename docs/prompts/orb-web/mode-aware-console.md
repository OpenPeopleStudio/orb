# Orb UI Agent Task: Mode-Aware Console

## Context

You are the **Orb UI Agent** working on the presentation layer of the Orb system.

**Orb Model Recap**:
- **Sol** → engine (what the model runs on)
- **Te** → reflection (what the model reflects on)
- **Mav** → execution (what the model accomplishes)
- **Luna** → intent (what the user decides they want it to be)
- **Orb** → shell (UI/app that the human touches) ← **You are here**

## Your Scope

You MAY edit files matching:
- `apps/orb-web/**`

You MUST NOT edit:
- `node_modules/`, `dist/`, `sol/`, `luna/` scripts
- Core packages (`core-luna`, `core-te`, `core-mav`, `core-sol`, `core-orb`)
- Root configs or docs (that's `architect`'s job)

## Task: Implement Mode-Aware Orb Console

### Goal

Create a console view in orb-web that shows the complete Luna–Mav–Te loop for a single run, including mode selection and all decision points.

### Current State

- orb-web has basic console UI showing Sol/Te/Mav/Luna roles
- orb-web has mode selector + prompt input
- orb-web needs a detailed view showing the full loop execution

### Files to Touch

1. **`apps/orb-web/src/components/OrbConsole.tsx`** (or equivalent)
   - Add mode display (show current mode: default, restaurant, real_estate, builder)
   - Add Luna decision panel (show: allow/deny/require_confirmation + reasoning)
   - Add Mav task panel (show: task status, actions, files touched)
   - Add Te evaluation panel (show: score, tags, recommendations)

2. **`apps/orb-web/src/ui.ts`** (or equivalent)
   - Ensure `runDemoFlow` accepts and passes `modeId` parameter
   - Wire UI to display all segments of the loop

3. **`apps/orb-web/src/App.tsx`** (or main component)
   - Add console view that shows one complete run
   - Display mode, Luna decision, Mav result, Te evaluation in a clear layout

### Implementation Notes

- This is your **debug HUD** for the OS loop
- Show mode prominently (it affects all decisions)
- Show Luna decision with reasoning (why allow/deny)
- Show Mav task execution with file changes
- Show Te evaluation with score and tags
- Use design tokens from `luna/packages/design-tokens` if available

### UI Layout Suggestion

```
┌─────────────────────────────────────┐
│ Mode: [restaurant]                  │
├─────────────────────────────────────┤
│ Luna Decision: ALLOW               │
│ Reasoning: "User wants restaurant   │
│            recommendations..."       │
├─────────────────────────────────────┤
│ Mav Task: completed                 │
│ Files: apps/orb-web/src/...          │
│ Actions: 3 completed                │
├─────────────────────────────────────┤
│ Te Evaluation: Score 85             │
│ Tags: [good, actionable, clear]     │
│ Recommendations: "Consider adding..."│
└─────────────────────────────────────┘
```

### Testing

- Test with different modes (default, restaurant, real_estate, builder)
- Test with denied Luna decisions (should show reasoning)
- Test with failed Mav tasks (should show errors)
- Test with low Te scores (should show recommendations)

### Follow-ups

After completing:
- Note if `architect` needs to update `demoFlow.ts` to return more structured data
- Note if design tokens need to be ported from SomaOS

## Output Format

When done, provide:
- Summary of changes per file
- Any commands run (lint, test, build, dev)
- Follow-ups for other agents

