# Sol Navigation System

**Version**: 1.0  
**Date**: 2025-11-22

---

## Current State: Soma Navigation

### Existing Patterns

**ModeOrbit (Center Navigation)**
- Central breathing sphere representing current mode
- Tap alien/sphere to access Alien Console
- Radial tools menu for system features
- Mode indicator visible

**Tab-Based Navigation**
- Bottom tabs: Inbox, Contacts, Calendar, Finance, etc.
- Standard iOS pattern
- Persistent across mode switches

**Context-Specific Entry Points**
- Settings via gear icon
- Add/Create actions via + buttons
- Search within each surface
- Back buttons for hierarchical navigation

### Problems

1. **Unclear hierarchy**: Is ModeOrbit or tabs primary navigation?
2. **Mode confusion**: Mode switching buried, not obvious
3. **Command palette missing**: No universal keyboard-first access
4. **Deep linking fragile**: Hard to jump directly to specific contexts
5. **Search scattered**: Each surface has its own search, no global view

---

## Sol Navigation Principles

### 1. Layers, Not Hierarchies

Sol navigation has **three layers**, not a strict hierarchy:

**Layer 1: Mode Context**  
What mode am I in? (Sol/Mars/Earth)  
- Always visible via status indicator
- Switch via mode picker (⌘M or tap indicator)

**Layer 2: Surface Access**  
What am I looking at? (Inbox, Contacts, Finance, etc.)  
- Command palette (⌘K) primary access
- Persistent navigation (bottom tabs or sidebar) secondary
- Recent/frequent surfaces surfaced first

**Layer 3: Detail/Action**  
What am I doing right now? (Reading message, editing contact, etc.)  
- Context-specific actions at top
- Escape/back always available
- Cross-links to related contexts

### 2. Keyboard-First, Touch-Friendly

Every navigation action must have:
- A keyboard shortcut (primary method on Mac)
- A touch target (iOS, or Mac trackpad)
- A voice description (accessibility and future voice control)

### 3. Context Preservation

Switching modes, surfaces, or details should **never lose context** unless explicitly discarding it:
- Drafts auto-save
- Scroll position remembered
- Search state preserved
- Back stack maintained

---

## Navigation Entry Points

### Global: Command Palette

**Trigger**: ⌘K (Mac), long-press on mode indicator (iOS)

**Functionality**:
- Search everything: contacts, messages, events, tasks, settings
- Jump to any surface: "inbox", "contacts", "finance"
- Execute actions: "new task", "log expense", "call [contact]"
- Recent items surfaced first
- Fuzzy search, learns from usage

**Visual**:
- Full-screen overlay (dark backdrop, off-white panel)
- Search field at top, results below
- Grouped by type (Contacts, Messages, Actions, etc.)
- Keyboard navigable (arrows, enter to select)

**Examples**:
- Type "john" → see John's contact, recent messages, upcoming meetings
- Type "inbox" → jump to inbox surface
- Type "new task" → create task modal appears
- Type "token" → jump to Token Studio

### Global: Mode Switcher

**Trigger**: ⌘M (Mac), tap mode indicator (iOS)

**Functionality**:
- Switch between Sol/Mars/Earth modes
- Shows current mode with visual indicator
- Smooth transition (0.8s cross-fade)
- Context preserved where possible

**Visual**:
- Dropdown or radial menu (depends on device)
- Each mode: name, color indicator, brief description
- Current mode highlighted

**Behavior**:
- Selecting mode triggers transition
- Notifications filter immediately
- Layout shifts to mode-appropriate emphasis
- Haptic feedback confirms switch (iOS)

### Primary: Surface Navigation

**Two Options** (choose based on device/context):

**Option A: Bottom Tabs (iOS Standard)**
- 5-6 primary surfaces visible
- More surfaces via "More" tab → command palette encouraged
- Badges for unread/urgent items
- Tabs adapt to mode (Mars mode prioritizes Tasks/Calendar)

**Option B: Sidebar (Mac, iPad)**
- Collapsible sidebar (⌘B to toggle)
- All surfaces listed, organized by category
- Search field at top
- Pinned/frequent surfaces at top

**Hybrid** (Recommended):
- Bottom tabs on iPhone
- Sidebar on iPad/Mac
- Command palette always available as primary method

### Contextual: Quick Actions

**Location**: Top-right of each surface

**Examples**:
- Inbox: Compose new message
- Contacts: Add new contact
- Finance: Log expense
- Calendar: Create event
- Tasks: New task

**Pattern**:
- + icon or action label
- Tap/click opens creation modal or sheet
- Keyboard shortcut (e.g., ⌘N for "new" in context)

### System: Alien & Tools

**Alien Console**:
- Tap alien/orb in ModeOrbit (center)
- Or via command palette: "alien"
- Or via Tools radial menu

**Tools Radial Menu**:
- Token Studio
- Schema Lab
- Settings
- Alien Console
- Other system tools

---

## Deep Linking & URLs

### URL Scheme

```
sol://[mode]/[surface]/[id]/[action]?[params]
```

**Examples**:
- `sol://mars/inbox` → Jump to inbox in Mars mode
- `sol://sol/contacts/uuid-here` → View specific contact in Sol mode
- `sol://earth/calendar/event/uuid?action=edit` → Edit specific event in Earth mode
- `sol://any/token-studio` → Open Token Studio (mode-agnostic)

### Behavior

- Deep links preserve mode context if specified
- If mode not specified, use current mode
- Invalid links gracefully fallback to home/launcher
- Links shareable (future: between devices on same account)

---

## Mode Switching Behavior

### Automatic Triggers

**Time-Based** (Optional, configurable):
- 9am–5pm weekdays: Mars mode (if restaurant context)
- Evenings/weekends: Earth mode
- Late night: Sol mode (if working)

**Location-Based** (Optional, requires geofence):
- At restaurant: Mars mode
- At home: Earth mode
- At office/desk: Sol mode

**Calendar-Based**:
- Event tagged with mode → auto-switch for event duration
- Return to previous mode after event

**Manual Override**:
- Always available via mode switcher
- Manual choice remembered (don't auto-switch away immediately)

### Transition Behavior

**Visual**:
- Background color shifts gradually (0.8s)
- Accent colors fade in/out
- Layout elements reposition smoothly
- No sudden cuts

**Layout**:
- Bottom tabs may reorder (Mars: Tasks first; Earth: Contacts first)
- Notification badge priorities shift
- Command palette results re-rank

**State**:
- Current surface preserved where possible
- If surface not relevant to new mode, return to launcher
- Scroll position maintained
- Drafts/unsaved work protected

---

## Search & Discovery

### Global Search (Command Palette)

**Indexed Content**:
- All contacts (name, notes, tags)
- All messages (subject, sender, snippet)
- All calendar events (title, location, attendees)
- All tasks (title, description)
- All financial transactions (description, category)
- All surfaces and actions

**Ranking**:
- Recency (recently viewed/accessed)
- Frequency (often used)
- Relevance (text match quality)
- Mode context (Mars mode boosts tasks/staff contacts)

**Result Presentation**:
- Grouped by type
- Icon + title + snippet
- Keyboard navigable
- Select to jump directly

### Surface-Specific Search

Each major surface has local search:
- Inbox: Filter messages by sender, subject, date
- Contacts: Filter by name, tag, relationship
- Finance: Filter by date, category, amount
- Calendar: Filter by date range, attendee

Local search UI:
- Search field at top of surface
- Real-time filtering
- Clear button to reset
- Remembers recent searches

---

## Migration Notes: Soma → Sol

### Phase 1: Add Command Palette
- Implement command palette (⌘K)
- Index all surfaces and content
- Keep existing tab navigation
- **Result**: Two navigation methods coexist

### Phase 2: Refine Mode System
- Make mode indicator always visible
- Implement mode switcher (⌘M)
- Define mode-specific layouts
- **Result**: Modes feel intentional, not bolted-on

### Phase 3: Unify Deep Linking
- Implement `sol://` URL scheme
- Update all internal navigation to use URLs
- Enable cross-app linking (if needed)
- **Result**: Navigation becomes addressable, shareable

### Phase 4: Surface-Level Polish
- Optimize tab order per mode
- Add quick actions to all surfaces
- Refine back/escape behavior
- **Result**: Every surface feels coherent

### Phase 5: Learn & Adapt
- Track navigation patterns
- Surface frequent destinations in command palette
- Auto-suggest mode switches
- **Result**: OS learns user preferences

---

## Shortcuts Reference

### Global
- `⌘K` — Command palette (search/jump/action)
- `⌘M` — Mode switcher
- `⌘B` — Toggle sidebar (Mac/iPad)
- `⌘,` — Settings
- `Esc` — Close current modal/sheet, or go back

### Surface Navigation
- `⌘1` through `⌘9` — Jump to tab 1-9 (if using tabs)
- `⌘[` / `⌘]` — Navigate back/forward in history
- `⌘T` — New tab/surface (future: multi-surface view)

### Context-Specific
- `⌘N` — New item in current context (message, contact, task, etc.)
- `⌘E` — Edit current item
- `⌘D` — Delete current item (with confirmation)
- `⌘/` — Show available shortcuts for current surface

### Future
- `⌘Space` — Quick capture (note, task, expense)
- `⌘Shift K` — Alien Console
- `⌘Shift T` — Token Studio

---

## Visual Language

### Mode Indicators
- **Sol**: Cyan glow (#00E4FF)
- **Mars**: Amber glow (#FF9500)
- **Earth**: Soft teal (#40E0D0)

Always visible in:
- Status bar (small badge)
- Mode switcher (current mode highlighted)
- Background subtle tint

### Navigation Affordances
- **Active surface**: Cyan accent, bold label
- **Inactive surface**: Muted gray, regular weight
- **Notification badge**: Red dot or count
- **Search field**: Magnifying glass icon, always visible

---

## Open Questions

1. **Tab vs Sidebar**: Default to tabs on iPhone, sidebar on Mac/iPad?
2. **ModeOrbit Future**: Keep central orb, or retire in favor of mode indicator badge?
3. **Voice Navigation**: Priority for voice-driven navigation?
4. **Multi-Surface View**: Split-screen or tabbed surfaces for iPad/Mac?

---

**Version**: 1.0  
**Next Review**: After Phase 1 implementation  
**Owner**: Sol Node

