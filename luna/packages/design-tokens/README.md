# @soma-forge/design-tokens

Design tokens for SomaForge - a token-based design system that ensures UI consistency across the platform.

## Philosophy

SomaForge design tokens express a unique aesthetic:

- **40% aerospace**: Precision, grid, monochrome foundation
- **30% EV product**: Smooth surfaces, clarity, modern interfaces
- **30% human-centric device**: Emotional restraint, typography-first approach

The goal is to make SomaForge UI feel **inevitable** - dark, focused base surfaces with high-contrast but controlled accents, and soft but intentional motion.

## Usage

### Import individual token modules

```typescript
import { colors, spacing, typography } from "@soma-forge/design-tokens";

const buttonStyle = {
  backgroundColor: colors.accent.primary,
  padding: spacing.m,
  fontSize: typography.body.m.fontSize,
};
```

### Import the complete theme

```typescript
import { theme } from "@soma-forge/design-tokens";

const cardStyle = {
  backgroundColor: theme.colors.background.elevated,
  borderRadius: theme.radii.m,
  padding: theme.spacing.l,
  boxShadow: theme.shadows.elevated,
};
```

### In apps/forge-web

A thin helper is available at `apps/forge-web/src/lib/tokens.ts` that re-exports all tokens for convenience.

## Token Categories

- **colors**: Background, accent, text, and border colors
- **typography**: Font families, text styles (headings, body, labels)
- **spacing**: Consistent spacing scale (xxs to xxxl)
- **radii**: Border radius values (none to pill)
- **shadows**: Surface, elevated, and glow shadows
- **motion**: Durations, easings, and scale factors
- **layout**: Layout constants (max widths, nav rail, top bar, etc.)

## Alignment with Brand

These tokens align with SomaForge's design philosophy as documented in:
- `docs/SomaForgeBrandManual.md`
- `docs/SomaForgeVisualStyleTokens.md`
- `docs/SomaForgeMotionTokenSet.md`

When exact values are unknown, tokens include `TODO` comments referencing the relevant documentation.

