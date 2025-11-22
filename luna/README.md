# SomaForge

SomaForge is the agent-building system (Forge) - a monorepo focused purely on the Forge control center.

> **Note**: SomaForge is **only** the agent-building system (Forge). SomaOS is a separate system. This repo is focused purely on the Forge control center.

## Project Structure

```
soma-forge/
  apps/
    forge-web/          # Next.js App Router web client
  packages/
    design-tokens/      # UI tokens module
    forge-core/         # Domain types + mock data
  docs/
    SomaForgeBrandManual.md
    SomaForgeVisualStyleTokens.md
    SomaForgeMotionTokenSet.md
    SomaForgePromptBlueprint.md
```

## Design Philosophy

SomaForge's UI and UX MUST follow the SomaForge design philosophy:

- **Visual + motion tokens** defined in `docs/SomaForgeVisualStyleTokens.md` and `docs/SomaForgeMotionTokenSet.md`.
- **Brand principles** in `docs/SomaForgeBrandManual.md`.
- **Prompt and interaction patterns** in `docs/SomaForgePromptBlueprint.md`.

All UI work in `apps/forge-web` must:

- Use `@soma-forge/design-tokens` for colors, spacing, motion, typography, etc.
- Avoid inline arbitrary hex values, timings, and radii.
- Include clear TODOs pointing future contributors at these docs.

## Getting Started

This is a pnpm workspace monorepo. Install dependencies:

```bash
pnpm install
```

Run the development server:

```bash
pnpm dev
```

Build the application:

```bash
pnpm build
```

## Workspace Configuration

- **Package Manager**: pnpm workspaces
- **TypeScript**: Strict mode enabled with base config in `tsconfig.base.json`
- **Next.js**: App Router with TypeScript

## Development

The monorepo uses pnpm workspaces for package management. Each app and package can be filtered:

```bash
pnpm --filter forge-web dev
pnpm --filter @soma-forge/design-tokens type-check
pnpm --filter @soma-forge/forge-core type-check
```

