/**
 * Identity Types
 * 
 * Role: Core identity layer (used by all packages)
 * 
 * Core identity types for Orb system, ported from SomaOS concepts.
 * These types define users, devices, personas, modes, and streams.
 * 
 * Source: SomaOS device/persona/mode definitions
 * Target: Single source of truth for identity in orb-system
 */

/**
 * Orb User - represents a user identity
 */
export interface OrbUser {
  id: string;
  email?: string;
  name?: string;
  createdAt: string; // ISO timestamp
  updatedAt: string; // ISO timestamp
  persona?: OrbPersona;
  preferredModes?: OrbMode[];
  devices?: OrbDevice[];
  timezone?: string;
  location?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Orb Device - represents a device (Sol, Luna, Mars, Earth)
 * 
 * Devices are physical or logical endpoints where Orb runs.
 */
export enum OrbDevice {
  SOL = 'sol',   // Primary development machine
  LUNA = 'luna', // Secondary/backup machine
  MARS = 'mars', // Remote/server instance
  EARTH = 'earth', // Mobile/portable instance
}

export function getDeviceDisplayName(device: OrbDevice): string {
  switch (device) {
    case OrbDevice.SOL:
      return 'Sol';
    case OrbDevice.LUNA:
      return 'Luna';
    case OrbDevice.MARS:
      return 'Mars';
    case OrbDevice.EARTH:
      return 'Earth';
  }
}

/**
 * Orb Persona - represents a user persona
 * 
 * Personas define different contexts or roles a user operates in.
 * Ported from SomaOS: Personal, SWL, RealEstate, OpenPeople
 */
export enum OrbPersona {
  PERSONAL = 'personal',
  SWL = 'swl', // "Somewhere" - work/life context
  REAL_ESTATE = 'real_estate',
  OPEN_PEOPLE = 'open_people',
}

export function getPersonaDisplayName(persona: OrbPersona): string {
  switch (persona) {
    case OrbPersona.PERSONAL:
      return 'Personal';
    case OrbPersona.SWL:
      return 'SWL';
    case OrbPersona.REAL_ESTATE:
      return 'Real Estate';
    case OrbPersona.OPEN_PEOPLE:
      return 'Open People';
  }
}

/**
 * Orb Mode - represents an operational mode
 * 
 * Modes define different ways Orb behaves (explorer, forge, etc.)
 * These map to Luna mode service modes.
 */
export enum OrbMode {
  SOL = 'sol',
  MARS = 'mars',
  EARTH = 'earth',
  DEFAULT = 'default',
  EXPLORER = 'explorer',
  FORGE = 'forge',
  RESTAURANT = 'restaurant',
  REAL_ESTATE = 'real_estate',
  BUILDER = 'builder',
}

export function getModeDisplayName(mode: OrbMode): string {
  switch (mode) {
    case OrbMode.DEFAULT:
      return 'Default';
    case OrbMode.SOL:
      return 'Sol';
    case OrbMode.MARS:
      return 'Mars';
    case OrbMode.EARTH:
      return 'Earth';
    case OrbMode.EXPLORER:
      return 'Explorer';
    case OrbMode.FORGE:
      return 'Forge';
    case OrbMode.RESTAURANT:
      return 'Restaurant';
    case OrbMode.REAL_ESTATE:
      return 'Real Estate';
    case OrbMode.BUILDER:
      return 'Builder';
  }
}

/**
 * Orb Stream - represents a stream of messages, events, or tasks
 * 
 * Streams are sequences of related items (messages, events, tasks)
 * that flow through the Orb system.
 */
export interface OrbStream<T = unknown> {
  id: string;
  userId: string;
  deviceId?: OrbDevice;
  mode?: OrbMode;
  persona?: OrbPersona;
  items: T[];
  createdAt: string; // ISO timestamp
  updatedAt: string; // ISO timestamp
  metadata?: Record<string, unknown>;
}

/**
 * Orb Stream Item - base type for stream items
 */
export interface OrbStreamItem {
  id: string;
  type: string;
  timestamp: string; // ISO timestamp
  payload: Record<string, unknown>;
}

/**
 * Message Stream Item - for messaging streams
 */
export interface MessageStreamItem extends OrbStreamItem {
  type: 'message';
  payload: {
    from: string;
    to: string;
    subject?: string;
    body: string;
    channel: 'email' | 'sms' | 'app';
  };
}

/**
 * Event Stream Item - for event streams
 */
export interface EventStreamItem extends OrbStreamItem {
  type: 'event';
  payload: {
    eventType: string;
    source: string;
    data: Record<string, unknown>;
  };
}

/**
 * Task Stream Item - for task streams
 */
export interface TaskStreamItem extends OrbStreamItem {
  type: 'task';
  payload: {
    taskId: string;
    status: 'pending' | 'in_progress' | 'completed' | 'failed';
    label: string;
  };
}

/**
 * Orb Device Profile - metadata about a device
 */
export interface OrbDeviceProfile {
  id: OrbDevice;
  label: string;
  description: string;
  primaryUseCases: string[];
  defaultMode: OrbMode;
  supportedModes: OrbMode[];
  capabilities: string[];
  locationHint?: string;
}

export const ORB_DEVICE_PROFILES: Record<OrbDevice, OrbDeviceProfile> = {
  [OrbDevice.SOL]: {
    id: OrbDevice.SOL,
    label: 'Sol · Primary Studio',
    description: 'Primary architect/developer machine focused on exploration, design, and system building.',
    primaryUseCases: [
      'Deep exploration & design',
      'System architecture',
      'Creative prototyping',
    ],
    defaultMode: OrbMode.SOL,
    supportedModes: [OrbMode.SOL, OrbMode.EXPLORER, OrbMode.FORGE, OrbMode.DEFAULT],
    capabilities: [
      'High-performance tooling',
      'Full design + coding environment',
      'Mode switch orchestration',
    ],
    locationHint: 'Studio / desk setup',
  },
  [OrbDevice.LUNA]: {
    id: OrbDevice.LUNA,
    label: 'Luna · Secondary/Forge Host',
    description: 'Secondary machine optimized for Forge sessions, infra jobs, and orchestration.',
    primaryUseCases: [
      'Forge host / multi-agent orchestration',
      'Periodic infra jobs (builds, docs sync)',
      'Support for heavy local tasks',
    ],
    defaultMode: OrbMode.FORGE,
    supportedModes: [OrbMode.FORGE, OrbMode.DEFAULT, OrbMode.SOL],
    capabilities: [
      'Agent session hosting',
      'CI-style task execution',
      'Device bridging between Sol and Mars',
    ],
    locationHint: 'PC / WSL / Forge host',
  },
  [OrbDevice.MARS]: {
    id: OrbDevice.MARS,
    label: 'Mars · Operations Terminal',
    description: 'Remote/server instance tuned for restaurant operations, time-sensitive coordination, and data sync.',
    primaryUseCases: [
      'Restaurant operations',
      'Task execution & scheduling',
      'Vendor/staff coordination',
    ],
    defaultMode: OrbMode.MARS,
    supportedModes: [OrbMode.MARS, OrbMode.RESTAURANT, OrbMode.REAL_ESTATE],
    capabilities: [
      'Realtime notifications',
      'Vendor/staff contact prioritization',
      'Operational dashboards',
    ],
    locationHint: 'On-site operations',
  },
  [OrbDevice.EARTH]: {
    id: OrbDevice.EARTH,
    label: 'Earth · Personal Surface',
    description: 'Mobile/portable surface focused on personal relationships, reflection, and calm contexts.',
    primaryUseCases: [
      'Personal communications',
      'Reflection & journaling',
      'Lightweight triage while away from desk',
    ],
    defaultMode: OrbMode.EARTH,
    supportedModes: [OrbMode.EARTH, OrbMode.DEFAULT, OrbMode.REAL_ESTATE],
    capabilities: [
      'Context-aware notifications',
      'Alien/Playground access',
      'Personal contact graph view',
    ],
    locationHint: 'Mobile / couch / on-the-go',
  },
};

export function getDeviceProfile(device: OrbDevice): OrbDeviceProfile {
  return ORB_DEVICE_PROFILES[device];
}

/**
 * Orb Persona Profile - metadata derived from SomaOS personas
 */
export interface OrbPersonaProfile {
  id: OrbPersona;
  label: string;
  intent: string;
  primaryGoals: string[];
  dailyActivities: string[];
  nonNegotiables: string[];
  successMetrics: string[];
  preferredModes: OrbMode[];
}

export const ORB_PERSONA_PROFILES: Record<OrbPersona, OrbPersonaProfile> = {
  [OrbPersona.PERSONAL]: {
    id: OrbPersona.PERSONAL,
    label: 'Architect / Designer',
    intent: 'Design and architect complex systems with clarity.',
    primaryGoals: [
      'Move fluidly between vision and implementation',
      'Maintain multi-session context',
      'Express intent clearly to agents',
    ],
    dailyActivities: [
      'Designing OS surfaces & flows',
      'Writing specs and briefs',
      'Reviewing implementation work',
    ],
    nonNegotiables: [
      'Token Studio always accessible',
      'Seamless multi-agent coordination',
      'Command palette supremacy',
    ],
    successMetrics: [
      'Intent-to-spec < 5 minutes',
      'Context recovery < 30 seconds',
      'High design/implementation alignment',
    ],
    preferredModes: [OrbMode.SOL, OrbMode.EXPLORER, OrbMode.FORGE],
  },
  [OrbPersona.SWL]: {
    id: OrbPersona.SWL,
    label: 'Restaurateur / Operator',
    intent: 'Coordinate high-tempo operations with zero friction.',
    primaryGoals: [
      'Track daily financials and inventory',
      'Coordinate staff and vendors',
      'Maintain task visibility during service',
    ],
    dailyActivities: [
      'Service coordination & scheduling',
      'Vendor and staff communication',
      'End-of-day reconciliation',
    ],
    nonNegotiables: [
      'Instant mode switching',
      'Smart contact prioritization',
      'Context-aware notifications',
    ],
    successMetrics: [
      'Mode switch time < 1 second',
      'Contact access < 2 seconds',
      'Financial entry < 15 seconds',
    ],
    preferredModes: [OrbMode.MARS, OrbMode.RESTAURANT],
  },
  [OrbPersona.REAL_ESTATE]: {
    id: OrbPersona.REAL_ESTATE,
    label: 'Real Estate Operator',
    intent: 'Manage listings, clients, and multi-step pipelines.',
    primaryGoals: [
      'Track deals through complex stages',
      'Maintain unified client + property context',
      'Coordinate showings and paperwork',
    ],
    dailyActivities: [
      'Scheduling showings',
      'Client communication across channels',
      'Deal management & documentation',
    ],
    nonNegotiables: [
      'Relationship graphs for people/properties',
      'Pipeline visualization',
      'Document checklists',
    ],
    successMetrics: [
      'Client context retrieval < 5 seconds',
      'Scheduling friction reduced by 50%',
      'Document completion at 100%',
    ],
    preferredModes: [OrbMode.REAL_ESTATE, OrbMode.MARS, OrbMode.EARTH],
  },
  [OrbPersona.OPEN_PEOPLE]: {
    id: OrbPersona.OPEN_PEOPLE,
    label: 'Researcher / Writer',
    intent: 'Gather, synthesize, and reflect on information calmly.',
    primaryGoals: [
      'Maintain deep focus for reading/writing',
      'Build coherent mental models',
      'Transition smoothly from notes to output',
    ],
    dailyActivities: [
      'Deep reading & note-taking',
      'Writing drafts and essays',
      'Reflection and connection mapping',
    ],
    nonNegotiables: [
      'Frictionless capture',
      'Focus protection',
      'Instant search & graph visibility',
    ],
    successMetrics: [
      'Capture latency < 3 seconds',
      'Context switches < 3 per hour',
      'Search success > 95%',
    ],
    preferredModes: [OrbMode.EARTH, OrbMode.SOL, OrbMode.DEFAULT],
  },
};

export function getPersonaProfile(persona: OrbPersona): OrbPersonaProfile {
  return ORB_PERSONA_PROFILES[persona];
}

/**
 * Orb Mode Descriptor - metadata for mode behavior
 */
export interface OrbModeDescriptor {
  id: OrbMode;
  label: string;
  intent: string;
  description: string;
  emotionalTone: string[];
  layoutFocus: string[];
  notifications: string[];
  colorPalette: {
    background: string;
    surface: string;
    accent: string;
  };
  triggers: string[];
  defaultDevices: OrbDevice[];
  defaultPersonas: OrbPersona[];
  defaultPreferences: string[];
  defaultConstraints: string[];
}

export const ORB_MODE_DESCRIPTORS: Record<OrbMode, OrbModeDescriptor> = {
  [OrbMode.SOL]: {
    id: OrbMode.SOL,
    label: 'Sol · Exploration',
    intent: 'Deep exploration, design work, and system building.',
    description: 'Distraction-free creative flow optimized for architecture and prototyping.',
    emotionalTone: ['Curious', 'Focused', 'Calm under complexity'],
    layoutFocus: [
      'Full-screen workspaces',
      'Token Studio + Schema Lab prominence',
      'Alien Console visible for health',
    ],
    notifications: [
      'Minimal interruptions',
      'Only critical alerts surface immediately',
      'Non-urgent messages queued',
    ],
    colorPalette: {
      background: '#050508',
      surface: '#F4F6FA',
      accent: '#00E4FF',
    },
    triggers: [
      'Design/architecture sessions',
      'Desk location detection',
      'Manual override via mode switcher',
    ],
    defaultDevices: [OrbDevice.SOL, OrbDevice.LUNA],
    defaultPersonas: [OrbPersona.PERSONAL, OrbPersona.OPEN_PEOPLE],
    defaultPreferences: ['clarity-first', 'deep-focus', 'command-palette'],
    defaultConstraints: ['no-destructive-actions', 'require-confirmation'],
  },
  [OrbMode.MARS]: {
    id: OrbMode.MARS,
    label: 'Mars · Operations',
    intent: 'Restaurant operations and time-sensitive coordination.',
    description: 'Urgent task execution with prioritized contacts and financial visibility.',
    emotionalTone: ['Alert', 'Decisive', 'Grounded'],
    layoutFocus: [
      'Task list + calendar prominence',
      'Quick-access staff + vendor contacts',
      'Finance dashboard inline',
    ],
    notifications: [
      'Immediate alerts for time-sensitive items',
      'Staff/vendor channels prioritized',
      'Personal items muted unless urgent',
    ],
    colorPalette: {
      background: '#080605',
      surface: '#FAF6F4',
      accent: '#FF9500',
    },
    triggers: [
      'Restaurant hours',
      'On-site location',
      'Active staff communication',
    ],
    defaultDevices: [OrbDevice.MARS],
    defaultPersonas: [OrbPersona.SWL],
    defaultPreferences: ['task-speed', 'notification-priority', 'finance-visibility'],
    defaultConstraints: ['no-personal-notifications', 'fast-confirmations'],
  },
  [OrbMode.EARTH]: {
    id: OrbMode.EARTH,
    label: 'Earth · Personal',
    intent: 'Personal life, relationships, reflection, and rest.',
    description: 'Calm surfaces emphasizing contacts, reflection, and health.',
    emotionalTone: ['Present', 'Warm', 'Reflective'],
    layoutFocus: [
      'Contacts and relationships first',
      'Messages and reflection tools accessible',
      'Calendar scoped to personal events',
    ],
    notifications: [
      'Personal messages prioritized',
      'Work items minimized or muted',
      'Health and rest reminders active',
    ],
    colorPalette: {
      background: '#06080A',
      surface: '#F6F6F8',
      accent: '#40E0D0',
    },
    triggers: [
      'Evenings/weekends',
      'Manual downtime scheduling',
      'Location away from workspaces',
    ],
    defaultDevices: [OrbDevice.EARTH],
    defaultPersonas: [OrbPersona.OPEN_PEOPLE, OrbPersona.PERSONAL],
    defaultPreferences: ['calm-ui', 'relationship-focus', 'reflection-prompts'],
    defaultConstraints: ['no-work-alerts', 'limit-task-creation'],
  },
  [OrbMode.DEFAULT]: {
    id: OrbMode.DEFAULT,
    label: 'Default · Auto',
    intent: 'Baseline context before personalization kicks in.',
    description: 'Balanced mode used before a better match is detected.',
    emotionalTone: ['Stable', 'Neutral'],
    layoutFocus: ['Console overview', 'Mode selector accessible'],
    notifications: ['Standard priority routing'],
    colorPalette: {
      background: '#05070A',
      surface: '#0C0F13',
      accent: '#B9E4FF',
    },
    triggers: ['Fallback when no signals available'],
    defaultDevices: [OrbDevice.SOL, OrbDevice.LUNA, OrbDevice.EARTH],
    defaultPersonas: [
      OrbPersona.PERSONAL,
      OrbPersona.SWL,
      OrbPersona.REAL_ESTATE,
      OrbPersona.OPEN_PEOPLE,
    ],
    defaultPreferences: ['balanced-ui'],
    defaultConstraints: [],
  },
  [OrbMode.EXPLORER]: {
    id: OrbMode.EXPLORER,
    label: 'Explorer',
    intent: 'Curiosity-driven research sessions.',
    description: 'Emphasizes discovery tools, search, and quick capture.',
    emotionalTone: ['Curious', 'Playful'],
    layoutFocus: ['Knowledge graph', 'Capture widgets'],
    notifications: ['Only research-relevant nudges'],
    colorPalette: {
      background: '#05070A',
      surface: '#10141B',
      accent: '#5ED5FF',
    },
    triggers: ['Knowledge-mode selection', 'Research/calendared blocks'],
    defaultDevices: [OrbDevice.SOL, OrbDevice.EARTH],
    defaultPersonas: [OrbPersona.OPEN_PEOPLE],
    defaultPreferences: ['graph-visibility', 'instant-search'],
    defaultConstraints: ['suppress-non-research'],
  },
  [OrbMode.FORGE]: {
    id: OrbMode.FORGE,
    label: 'Forge',
    intent: 'Multi-agent building sessions and automation.',
    description: 'Highlights task tickets, diffs, and agent coordination.',
    emotionalTone: ['Determined', 'Precise'],
    layoutFocus: ['Task queue', 'Diff surfaces', 'Agent controls'],
    notifications: ['Agent state changes', 'Build failures'],
    colorPalette: {
      background: '#0A0A0F',
      surface: '#14141C',
      accent: '#9B7BFF',
    },
    triggers: ['Forge session start', 'Script invocation on Luna'],
    defaultDevices: [OrbDevice.LUNA],
    defaultPersonas: [OrbPersona.PERSONAL],
    defaultPreferences: ['code-quality', 'guard-rails'],
    defaultConstraints: ['require-review'],
  },
  [OrbMode.RESTAURANT]: {
    id: OrbMode.RESTAURANT,
    label: 'Restaurant Focus',
    intent: 'Task view specialized for service operations.',
    description: 'Shortcut view layered on top of Mars mode for service-specific tooling.',
    emotionalTone: ['Urgent', 'Coordinated'],
    layoutFocus: ['Task queue + staff roster', 'POS integrations'],
    notifications: ['Service-critical only'],
    colorPalette: {
      background: '#0B0502',
      surface: '#1A110C',
      accent: '#FF7A00',
    },
    triggers: ['Service start timer', 'POS integration signal'],
    defaultDevices: [OrbDevice.MARS],
    defaultPersonas: [OrbPersona.SWL],
    defaultPreferences: ['staff-priority', 'fast-task-switch'],
    defaultConstraints: ['mute-personal'],
  },
  [OrbMode.REAL_ESTATE]: {
    id: OrbMode.REAL_ESTATE,
    label: 'Real Estate',
    intent: 'Deal + relationship tracking for transactions.',
    description: 'Puts pipeline, documents, and contact graphs front-and-center.',
    emotionalTone: ['Confident', 'Organized'],
    layoutFocus: ['Pipeline board', 'Client/property graph'],
    notifications: ['Deadline reminders', 'Client follow-ups'],
    colorPalette: {
      background: '#04070A',
      surface: '#101820',
      accent: '#47C6FF',
    },
    triggers: ['Deal pipeline activity', 'Calendar context for showings'],
    defaultDevices: [OrbDevice.MARS, OrbDevice.EARTH],
    defaultPersonas: [OrbPersona.REAL_ESTATE],
    defaultPreferences: ['pipeline-clarity', 'document-tracking'],
    defaultConstraints: ['require-deal-links'],
  },
  [OrbMode.BUILDER]: {
    id: OrbMode.BUILDER,
    label: 'Builder',
    intent: 'Heads-down implementation with strong guard rails.',
    description: 'Focuses on implementation details, tests, and execution safety.',
    emotionalTone: ['Precise', 'Grounded'],
    layoutFocus: ['Task breakdown', 'Diffs', 'Test status'],
    notifications: ['Build/test failures only'],
    colorPalette: {
      background: '#040406',
      surface: '#0E0E12',
      accent: '#40C3FF',
    },
    triggers: ['Execution tasks', 'CI job start'],
    defaultDevices: [OrbDevice.SOL, OrbDevice.LUNA],
    defaultPersonas: [OrbPersona.PERSONAL],
    defaultPreferences: ['test-first', 'code-review'],
    defaultConstraints: ['no-prod-writes'],
  },
};

export function getModeDescriptor(mode: OrbMode): OrbModeDescriptor {
  return ORB_MODE_DESCRIPTORS[mode];
}

