# SomaForge UX Bible

## Purpose

This document defines how SomaForge should **feel** to use. It establishes the emotional and behavioral foundation for all UI work, ensuring that SomaForge feels:

- **Calm but powerful**: The interface should inspire confidence without overwhelming
- **Minimal clicks to perform key tasks**: Efficiency is paramount for power users
- **"Control center" for agents, not a toy playground**: Professional, focused, purposeful

## Core UX Principles

### Structure before power

Every screen prefers clarity of hierarchy over visual noise. Information architecture should be immediately apparent. Users should understand what they're looking at and what they can do with it before they need to explore.

**Examples:**
- Clear visual hierarchy with consistent typography scales
- Card-based surfaces that group related information
- Left nav rail that provides persistent context

### Operator, not spectator

The user should always feel they can **act**, not just view stats. Every view should offer clear next steps. Passive dashboards are secondary to actionable interfaces.

**Examples:**
- Primary actions are always visible and accessible
- Status indicators are paired with action buttons
- Empty states include clear calls-to-action

### Forgiving control

Destructive actions are guarded but not naggy. The system should prevent mistakes through good design, not through excessive confirmation dialogs. When confirmations are needed, they should be contextual and brief.

**Examples:**
- Undo/redo for reversible actions
- Clear visual distinction between safe and destructive actions
- Contextual warnings that don't block workflow

### Continuity of context

Navigating between agents, pipelines, and runs should preserve mental context. Users shouldn't lose their place or need to re-establish their understanding when moving between related views.

**Examples:**
- Breadcrumbs or context indicators showing current location
- Persistent filters and search state
- Smooth transitions that maintain visual continuity

## Primary User Journeys

### 1. Define a new agent

**Goal**: Create and configure a new agent with minimal friction.

**Flow**:
1. Navigate to Agents section
2. Click "New Agent" (prominent, always visible)
3. Fill in essential fields (name, type, basic config)
4. Save and immediately see the agent in the list
5. Option to configure advanced settings inline or in detail view

**Key UX requirements**:
- Progressive disclosure: show essentials first, advanced options available but not required
- Immediate feedback: agent appears in list as soon as saved
- Clear validation: errors shown inline, not in modal dialogs

### 2. Compose a pipeline from agents

**Goal**: Visually connect agents into a working pipeline.

**Flow**:
1. Navigate to Pipelines section
2. Create new pipeline or open existing
3. Drag agents from library or add from list
4. Connect agents visually (drag connections between nodes)
5. Configure connections (data flow, conditions)
6. Validate and save

**Key UX requirements**:
- Visual pipeline editor with drag-and-drop
- Clear connection points and visual feedback
- Real-time validation (show errors as you build)
- Ability to test individual connections

### 3. Trigger a run and inspect results

**Goal**: Execute a pipeline and understand what happened.

**Flow**:
1. Select pipeline from list
2. Click "Run" (with optional configuration)
3. See run status immediately (queued → running → completed)
4. View results in real-time as they stream in
5. Inspect logs, outputs, and metrics
6. Compare with previous runs

**Key UX requirements**:
- Real-time status updates without page refresh
- Clear visual distinction between run states
- Expandable logs and details (don't overwhelm by default)
- Quick access to previous runs for comparison

### 4. Refine agents based on run outcomes

**Goal**: Iterate on agent configuration based on actual performance.

**Flow**:
1. View run results and identify issues
2. Navigate to agent configuration (preserve context of which run you're looking at)
3. Adjust agent parameters
4. Re-run pipeline or specific agent
5. Compare new results with previous

**Key UX requirements**:
- Easy navigation from run results to agent config
- Side-by-side comparison of runs
- Clear indication of what changed between runs
- Ability to revert to previous configuration

## UI Patterns

### Layout Structure

**Left Nav Rail** (`layout.navRail.width: 240px`)
- Primary sections: Agents, Pipelines, Runs, Settings
- Persistent across all views
- Collapsible to icon-only mode (`layout.navRail.collapsedWidth: 64px`)
- Active section clearly indicated

**Top Bar** (`layout.topBar.height: 64px`)
- Context indicators: current environment, project, active object
- Global actions: search, notifications, user menu
- Breadcrumbs for deep navigation

**Central Workspace**
- Card-based surfaces (`layout.card.radiusDefault`, `layout.card.padding`)
- Responsive grid layout
- Maximum content width (`layout.maxWidth.content: 1280px`) for readability
- Minimum workspace height (`layout.workspace.minHeight: 600px`)

**Right-Hand Side Panels** (`layout.panel.width: 320px`)
- Details panel: shows properties of selected item
- Logs panel: streaming logs for active runs
- Collapsible and resizable
- Minimum width (`layout.panel.minWidth: 280px`) for responsive behavior

### Component Patterns

**Cards**
- Elevated surfaces (`colors.background.elevated`)
- Soft shadows (`shadows.elevated`)
- Rounded corners (`radii.m`)
- Hover states with subtle lift (`motion.scale.hover`)

**Buttons**
- Primary: accent color (`colors.accent.primary`)
- Secondary: subtle border (`colors.border.subtle`)
- Destructive: error color (`colors.accent.error`) with clear labeling
- Press feedback (`motion.scale.press`, `motion.duration.xs`)

**Forms**
- Clear labels (`typography.label`)
- Inline validation
- Focus states with accent border (`colors.border.accent`)
- Grouped related fields

**Status Indicators**
- Color-coded states (success, warning, error from `colors.accent`)
- Icon + text for clarity
- Subtle animations for active states

## Motion Guidelines

### Duration

- **Quick feedback** (`motion.duration.xs: 100ms`): Button presses, hover states
- **Standard transitions** (`motion.duration.s: 200ms`, `motion.duration.m: 300ms`): Most UI changes, panel opens, card interactions
- **Deliberate transitions** (`motion.duration.l: 500ms`): Major state changes, page transitions

### Easing

- **Orbital** (`motion.easing.orbital`): For orbit-like movement, smooth but intentional
- **Soft snap** (`motion.easing.softSnap`): Button/press feel, natural deceleration
- **Smooth** (`motion.easing.smooth`): Standard easing for most transitions

### Principles

1. **Avoid large positional jumps**: Use opacity + small scale/motion to keep things grounded
2. **No animations on every frame**: Do not trigger animations on every frame of data change; prefer deliberate transitions
3. **Purposeful motion**: Every animation should serve a purpose (feedback, orientation, hierarchy)
4. **Respect reduced motion**: Honor user preferences for reduced motion

### Scale Factors

- **Press** (`motion.scale.press: 0.98`): Subtle but noticeable button feedback
- **Active** (`motion.scale.active: 0.95`): More pronounced active state
- **Hover** (`motion.scale.hover: 1.02`): Slight lift on hover

## Visual Language

### Color Usage

- **Dark base** (`colors.background.base`): Primary background, creates focused environment
- **Elevated surfaces** (`colors.background.surface`, `colors.background.elevated`): Cards, panels, modals
- **Accent highlights** (`colors.accent.primary`): Primary actions, active states, important information
- **Text hierarchy** (`colors.text.primary`, `colors.text.secondary`, `colors.text.muted`): Clear information hierarchy

### Typography

- **Headings** (`typography.heading.*`): Clear hierarchy, use for section titles and important labels
- **Body text** (`typography.body.*`): Readable, comfortable line heights for extended reading
- **Labels** (`typography.label`): Uppercase, letter-spaced for form labels and metadata
- **Code** (`typography.code`): Monospace for code, logs, technical data

### Spacing

- **Consistent scale** (`spacing.*`): Use token values, not arbitrary numbers
- **Card padding** (`layout.card.padding`): Comfortable spacing within cards
- **Section spacing**: Use `spacing.xl` or `spacing.xxl` between major sections

## Reference Documents

For deeper brand tone and visual language, refer to:

- `docs/SomaForgeBrandManual.md` - Overall brand philosophy and voice
- `docs/SomaForgeVisualStyleTokens.md` - Detailed visual style guidelines
- `docs/SomaForgeMotionTokenSet.md` - Motion and animation specifications
- `docs/SomaForgeSoundDesignBible.md` - Audio feedback guidelines (if present)
- `docs/SomaForgePromptBlueprint.md` - Prompt engineering and AI interaction patterns

## Implementation Notes

- All UI work in `apps/forge-web` should reference `@soma-forge/design-tokens`
- Use the theme object for comprehensive access: `import { theme } from "@soma-forge/design-tokens"`
- Follow the patterns described here, but adapt as needed for specific use cases
- When in doubt, prefer clarity and simplicity over visual complexity

