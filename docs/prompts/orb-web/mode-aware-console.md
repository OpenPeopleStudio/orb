# Orb UI Agent Task: Mode-Aware Console

## Context

This is a task ticket for the **Orb UI agent** (`id: 'orb_ui'`). Use the bootloader (`docs/prompts/forge-agent-bootloader.md`) with:
- `{AGENT_ID}` = `orb_ui`
- `{TASK_BLOCK}` = contents of this file

## Orb Model Recap

- **Orb** → shell (UI/app the human touches)
- **Luna** → intent (what the user decides they want it to be)
- **Sol** → engine (what the model runs on)
- **Te** → reflection (what the model reflects on)
- **Mav** → execution (what the model accomplishes)

Orb UI owns: presentation layer, console views, and user interaction.

## Goal

Create a mode-aware console view that displays the full Luna→Mav→Te loop for debugging and visualization.

## Files to Touch

- `apps/orb-web/src/**` (your scope)
- May need to read `packages/core-orb/src/demoFlow.ts` to understand flow structure

## Non-Touch Zones

- `packages/**` (core packages are other agents' domains)
- `docs/**` (Architect's domain, unless explicitly asked)
- `node_modules/`, `dist/` (build artifacts)

## Tasks

1. **Review existing UI structure**
   - Check `apps/orb-web/src/App.tsx` or main component
   - Understand current console/UI layout

2. **Create mode-aware console view**
   - Display for one demo flow run:
     - Current `mode` (default, restaurant, real_estate, builder)
     - Luna decision (allow/deny/require_confirmation)
     - Mav task & result (if allowed)
     - Te evaluation (if task ran)
   - Make it a clear "debug HUD" for the OS loop

3. **Wire to demoFlow**
   - Connect UI to `runDemoFlow` from `packages/core-orb/src/demoFlow.ts`
   - Display results in the console view

4. **Test and polish**
   - Run `pnpm dev --filter apps/orb-web` to test UI
   - Ensure console displays all loop segments clearly

## Expected Outcome

- Console view shows complete Luna→Mav→Te loop
- Mode is clearly displayed
- All segments (decision, task, evaluation) are visible
- UI is functional and readable

## Follow-ups

- If `demoFlow` API needs changes, leave TODO for Architect
- If design tokens are needed, coordinate with Architect
