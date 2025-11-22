# Sol UI Components Index

**Version**: 1.0  
**Date**: 2025-11-22

Comprehensive inventory of UI components and surfaces that make up the Sol OS, organized by domain. Each component marked with status: **keep**, **refine**, **retire**, or **unknown**.

---

## Core Shell

Components that form the OS foundation and are always present or globally accessible.

| Component | Status | Notes |
|-----------|--------|-------|
| **ModeOrbit** | refine | Central navigation orb/sphere — may simplify or reduce prominence |
| **Mode Indicator Badge** | keep | Small visual indicator of current mode (Sol/Mars/Earth) |
| **Command Palette** | keep | ⌘K universal search/action interface — primary navigation |
| **Mode Switcher** | keep | Dropdown/radial menu for switching modes (⌘M) |
| **Status Bar** | refine | Top bar showing time, connectivity, mode — needs design pass |
| **Bottom Tab Bar** | refine | Primary surface navigation on iOS — may adapt per mode |
| **Sidebar** | keep | Mac/iPad collapsible surface navigation |
| **Back Button** | keep | Standard iOS back navigation |
| **Quick Action Button** | keep | Context-specific + or action button (top-right) |

---

## Inbox & Communications

Components for viewing and managing messages across channels (email, SMS, notifications).

| Component | Status | Notes |
|-----------|--------|-------|
| **InboxView** | refine | Main inbox list — needs mode-aware filtering |
| **MessageRow** | refine | Individual message in list — visual hierarchy needs work |
| **MessageDetailView** | refine | Full message view — improve readability |
| **ComposeView** | keep | Message composition interface |
| **ThreadView** | refine | Threaded message conversations — consider collapsing |
| **Notification Badge** | keep | Unread count indicator |
| **Inbox Search** | refine | Local search within messages — integrate with global search |
| **Message Filters** | unknown | Filter by sender, date, channel — may need adding |

---

## Contacts & People Graph

Components for managing contacts, relationships, and the people graph.

| Component | Status | Notes |
|-----------|--------|-------|
| **ContactListView** | refine | Contact list — needs better grouping/filtering |
| **ContactRow** | keep | Individual contact in list |
| **ContactDetailView** | refine | Full contact profile — add relationship context |
| **ContactEditView** | keep | Edit contact information |
| **RelationshipGraph** | unknown | Visual graph of connections — may need building |
| **Contact Search** | refine | Search contacts — integrate with global search |
| **Contact Tags** | keep | Tags for categorizing contacts (staff, vendor, friend) |
| **Quick Actions** | refine | Call, message, email buttons — make more prominent |

---

## Finance & Money

Components for tracking expenses, income, and financial insights.

| Component | Status | Notes |
|-----------|--------|-------|
| **FinanceDashboard** | refine | Overview of financial state — needs clearer hierarchy |
| **TransactionList** | keep | List of transactions |
| **TransactionRow** | refine | Individual transaction display |
| **ExpenseEntry** | refine | Quick expense logging — reduce friction |
| **IncomeEntry** | keep | Income logging interface |
| **CategoryPicker** | keep | Select transaction category |
| **DateRangePicker** | keep | Filter by date range |
| **Finance Charts** | refine | Visual spend/income trends — simplify |
| **Budget View** | unknown | Budget tracking — may need adding |

---

## Calendar & Time

Components for viewing and managing calendar events and time.

| Component | Status | Notes |
|-----------|--------|-------|
| **CalendarMonthView** | keep | Monthly calendar grid |
| **CalendarDayView** | refine | Day schedule view — improve density |
| **CalendarWeekView** | unknown | Week view — may need adding |
| **EventRow** | keep | Individual event in list |
| **EventDetailView** | refine | Full event details — add context (attendees, location) |
| **EventEditView** | keep | Create/edit event interface |
| **Time Picker** | keep | Select time for events |
| **Attendee Picker** | refine | Select event attendees from contacts |

---

## Tasks & Todos

Components for managing tasks and todo items.

| Component | Status | Notes |
|-----------|--------|-------|
| **TaskListView** | refine | Task list — needs better prioritization/grouping |
| **TaskRow** | refine | Individual task display — add due date prominence |
| **TaskDetailView** | keep | Full task view with notes, subtasks |
| **TaskEditView** | keep | Create/edit task interface |
| **Task Quick Add** | refine | Fast task creation — reduce to single tap + text |
| **Task Filters** | unknown | Filter by due date, priority, tag — may need adding |
| **Subtask Support** | unknown | Nested subtasks — evaluate need |

---

## Restaurant / SWL (Mars Mode)

Components specific to restaurant operations (Mars mode context).

| Component | Status | Notes |
|-----------|--------|-------|
| **Daily Sales View** | unknown | Quick view of daily sales — may need building |
| **Staff Contact List** | refine | Filtered contact list showing only staff |
| **Vendor Contact List** | refine | Filtered contact list showing only vendors |
| **Shift Schedule** | unknown | Staff shift scheduling — may need building |
| **Inventory View** | unknown | Track inventory levels — may need building |
| **Order Log** | unknown | Track vendor orders — may need building |

---

## Alien & Reflection

Components for alien evolution, system health, and reflection.

| Component | Status | Notes |
|-----------|--------|-------|
| **Alien Entity View** | keep | 3D alien rendering with animations |
| **Alien Console** | keep | System health dashboard — already strong |
| **Health Metrics Display** | keep | Stress, energy, attention, etc. |
| **Evolution Progress** | keep | Growth stage and milestone tracking |
| **Reflection Prompts** | unknown | Guided reflection interface — may need adding |
| **Memory Timeline** | unknown | Historical state snapshots — may need adding |

---

## Design Tools (System)

Components for inspecting and modifying OS design DNA.

| Component | Status | Notes |
|-----------|--------|-------|
| **Token Studio** | keep | Visual/motion/sound token inspector — core feature |
| **Visual Tokens Panel** | keep | Color, glass, depth settings |
| **Motion Tokens Panel** | keep | Duration, curve, intensity settings |
| **Sound Tokens Panel** | keep | Alert, ambient, one-shot sound settings |
| **Token Draft Mode** | keep | Experiment with token overrides |
| **Token Reset** | keep | Restore defaults |

---

## Schema & Structure (System)

Components for exploring database schema and data structure.

| Component | Status | Notes |
|-----------|--------|-------|
| **Schema Lab** | keep | Database schema explorer — core feature |
| **Schema Section List** | keep | Browse by functional category |
| **Table List View** | keep | List of tables with metadata |
| **Table Detail View** | keep | Columns, keys, indexes for one table |
| **Schema Search** | keep | Search tables and columns |
| **Relationship Graph** | unknown | Visual map of table relationships — may need adding |

---

## Settings & Configuration

Components for system settings and configuration.

| Component | Status | Notes |
|-----------|--------|-------|
| **Settings Home** | refine | Main settings screen — needs organization |
| **Account Settings** | keep | User profile, account details |
| **Device Settings** | keep | Device-specific configuration |
| **Mode Settings** | refine | Configure mode behaviors and auto-switching |
| **Notification Settings** | refine | Per-mode notification preferences |
| **Appearance Settings** | keep | Dark mode, text size, etc. |
| **About / Info** | keep | Version, legal, support |

---

## Shared UI Elements

Reusable components used across surfaces.

| Component | Status | Notes |
|-----------|--------|-------|
| **Button (Primary)** | keep | Cyan accent, off-white text |
| **Button (Secondary)** | keep | Outline style, muted |
| **Button (Destructive)** | keep | Red accent for dangerous actions |
| **Text Field** | keep | Standard text input |
| **Text Area** | keep | Multi-line text input |
| **Picker (Dropdown)** | keep | Select from list |
| **Date Picker** | keep | Calendar-style date selection |
| **Time Picker** | keep | Clock-style time selection |
| **Toggle / Switch** | keep | Binary on/off control |
| **Slider** | keep | Continuous value selection |
| **Segmented Control** | keep | Multiple choice, single selection |
| **Search Field** | refine | Magnifying glass icon, clear button — unify styling |
| **Modal / Sheet** | keep | Overlay for detail/edit views |
| **Alert / Confirmation** | keep | System alerts and confirmations |
| **Toast / Notification** | refine | Transient feedback messages — improve positioning |
| **Loading Spinner** | refine | Replace with more meaningful loading states |
| **Empty State** | refine | What to show when list/view is empty |
| **Error State** | refine | How to present errors — make actionable |

---

## Motion & Animation

Animation patterns used throughout the OS.

| Pattern | Status | Notes |
|---------|--------|-------|
| **Breathe Cycle** | keep | 6-second breathing animation on alien/orb |
| **Mode Transition** | keep | 0.8s cross-fade between modes |
| **Surface Transition** | keep | Standard push/pop navigation |
| **Modal Present/Dismiss** | keep | Sheet slides up/down |
| **Button Press** | keep | Subtle scale down on tap |
| **List Item Swipe** | keep | Swipe actions on list items |
| **Loading Pulse** | refine | Replace with more intentional animation |
| **Success Confirmation** | refine | Affirming animation on task completion |
| **Error Shake** | keep | Subtle shake on error |

---

## Status Summary

| Status | Count | Notes |
|--------|-------|-------|
| **keep** | 57 | Components that work well and need no changes |
| **refine** | 34 | Components that exist but need design/UX improvements |
| **retire** | 0 | Components to remove (none identified yet) |
| **unknown** | 15 | Components that may need building or further evaluation |

**Total Components**: 106

---

## Next Steps

### High Priority Refines
1. **Command Palette** — Implement or enhance as primary navigation
2. **Task Quick Add** — Reduce friction to near-zero
3. **Expense Entry** — Faster logging for Mars mode
4. **Contact Detail View** — Add relationship/context emphasis
5. **Settings Organization** — Clearer hierarchy and grouping

### Unknown → Decide
1. **Relationship Graph** — Visual people/entity connections
2. **Budget View** — Financial planning interface
3. **Staff Shift Schedule** — Mars mode restaurant operations
4. **Reflection Prompts** — Guided alien/user reflection
5. **Schema Relationship Graph** — Visual database map

### Design System Unification
- Standardize search field styling across all surfaces
- Unify button styles and states
- Consistent empty/error/loading states
- Motion timing aligned with token standards

---

**Version**: 1.0  
**Next Review**: After Phase 2 (surface redesigns)  
**Owner**: Sol Node

