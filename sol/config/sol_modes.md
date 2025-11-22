# Sol OS Modes

Sol operates in multiple modes, each tailored to a specific context and emotional state. Modes affect OS behavior, visual presentation, notification handling, and interaction patterns.

---

## Mode: Sol / Exploration

**Intent**: Deep exploration, design work, system building, creative flow

**When Active**: Default mode for Sol device; active when doing OS design, architecture work, or creative exploration

### Emotional Tone
- Curious
- Focused
- Open to possibility
- Calm under complexity

### OS Behavior

**Layout Emphasis**
- Full-screen, distraction-free workspaces
- Token Studio and design tools prominent
- Schema Lab readily accessible
- Alien Console visible for health monitoring

**Notifications**
- Minimal interruptions
- Only critical alerts surface immediately
- Non-urgent messages queued for later review
- System health warnings always shown

**Color / Motion**
- Background: Deep near-black (#050508)
- Primary surfaces: Off-white (#F4F6FA)
- Accent: Cyan (#00E4FF) for active elements
- Motion: Smooth, critically damped (0.4s default duration)
- Calm pulse animations on focus elements

**Navigation**
- Command palette always available (⌘K)
- Quick access to design tools
- Schema Lab one tap away
- Mode switcher in consistent location

---

## Mode: Mars / Restaurant Ops

**Intent**: Restaurant operations, task execution, time-sensitive coordination

**When Active**: During restaurant shifts, coordination work, or high-tempo operations

### Emotional Tone
- Alert
- Decisive
- Time-aware
- Grounded

### OS Behavior

**Layout Emphasis**
- Task list and calendar prominent
- Quick-access contacts for staff/vendors
- Financial tools visible (daily sales, expenses)
- Time display prominent

**Notifications**
- Immediate alerts for time-sensitive items
- Staff messages prioritized
- Vendor/delivery notifications surface quickly
- Personal items muted unless urgent

**Color / Motion**
- Background: Slightly warmer near-black (#080605)
- Surfaces: Warm off-white (#FAF6F4)
- Accent: Amber/orange (#FF9500) for urgency
- Motion: Snappier (0.2s default), responsive feel
- Task completion animations clear and affirming

**Navigation**
- Quick task creation always available
- One-tap access to staff contacts
- Finance dashboard accessible
- Calendar/schedule always visible

---

## Mode: Earth / Personal / Life

**Intent**: Personal life, relationships, reflection, rest

**When Active**: Off-work hours, personal time, family/friend interactions, rest periods

### Emotional Tone
- Present
- Warm
- Reflective
- Relaxed

### OS Behavior

**Layout Emphasis**
- Contacts and relationships prominent
- Messages and personal communications front
- Calendar focused on personal events
- Alien reflection tools accessible

**Notifications**
- Personal messages prioritized
- Work items minimized or muted
- Family/friend alerts immediate
- Health and rest reminders active

**Color / Motion**
- Background: Softer near-black (#06080A)
- Surfaces: Neutral off-white (#F6F6F8)
- Accent: Soft cyan or green (#40E0D0)
- Motion: Gentle, unhurried (0.6s default)
- Breathing animations, calm pulses

**Navigation**
- Quick access to personal contacts
- Message threads prioritized
- Calendar showing personal events
- Reflection tools (Alien Console) prominent

---

## Mode Transitions

### Automatic Triggers
- **Time of day**: Mars mode during restaurant hours, Earth mode evenings/weekends
- **Location**: Mars mode when at restaurant, Sol mode when at desk
- **Calendar**: Automatically shift based on calendar context
- **Manual override**: Always available via mode switcher

### Transition Behavior
- **Duration**: 0.8–1.0 seconds
- **Motion**: Smooth cross-fade, subtle scale
- **Feedback**: Haptic confirmation (iOS), visual accent pulse
- **State preservation**: Current task/view maintained where possible

### Visual Transition
- Background color shifts gradually
- Accent colors fade in/out
- Layout elements reposition smoothly
- No jarring cuts or sudden changes

---

## Mode Indicators

### Visual
- Small color-coded badge in status bar (cyan = Sol, amber = Mars, soft teal = Earth)
- Subtle background tint reflecting mode color
- Accent colors throughout UI reflect mode

### Contextual
- Navigation elements adapt to mode priorities
- Notification behavior reflects mode intent
- Available tools/surfaces shift per mode

---

## Implementation Notes

- Modes should feel like **context shifts**, not theme changes
- Each mode optimizes for its primary use case
- Transitions must be smooth, never disruptive
- Manual override should be effortless (one tap)
- Mode history tracked for learning user patterns

---

## Future Modes (Potential)

- **Studio / Design**: Deep creative work, design tools emphasis
- **Research / Learn**: Information gathering, reading, note-taking
- **Travel**: Location-aware, minimal local services
- **Focus**: Ultra-minimal, single-task emphasis

---

**Version**: 1.0  
**Last Updated**: 2025-11-22

