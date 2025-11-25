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
    createdAt: string;
    updatedAt: string;
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
export declare enum OrbDevice {
    SOL = "sol",// Primary development machine
    LUNA = "luna",// Secondary/backup machine
    MARS = "mars",// Remote/server instance
    EARTH = "earth"
}
export declare function getDeviceDisplayName(device: OrbDevice): string;
/**
 * Orb Persona - represents a user persona
 *
 * Personas define different contexts or roles a user operates in.
 * Ported from SomaOS: Personal, SWL, RealEstate, OpenPeople
 */
export declare enum OrbPersona {
    PERSONAL = "personal",
    SWL = "swl",// "Somewhere" - work/life context
    REAL_ESTATE = "real_estate",
    OPEN_PEOPLE = "open_people"
}
export declare function getPersonaDisplayName(persona: OrbPersona): string;
/**
 * Orb Mode - represents an operational mode
 *
 * Modes define different ways Orb behaves (explorer, forge, etc.)
 * These map to Luna mode service modes.
 */
export declare enum OrbMode {
    SOL = "sol",
    MARS = "mars",
    EARTH = "earth",
    DEFAULT = "default",
    EXPLORER = "explorer",
    FORGE = "forge",
    RESTAURANT = "restaurant",
    REAL_ESTATE = "real_estate",
    BUILDER = "builder"
}
export declare function getModeDisplayName(mode: OrbMode): string;
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
    createdAt: string;
    updatedAt: string;
    metadata?: Record<string, unknown>;
}
/**
 * Orb Stream Item - base type for stream items
 */
export interface OrbStreamItem {
    id: string;
    type: string;
    timestamp: string;
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
export declare const ORB_DEVICE_PROFILES: Record<OrbDevice, OrbDeviceProfile>;
export declare function getDeviceProfile(device: OrbDevice): OrbDeviceProfile;
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
export declare const ORB_PERSONA_PROFILES: Record<OrbPersona, OrbPersonaProfile>;
export declare function getPersonaProfile(persona: OrbPersona): OrbPersonaProfile;
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
export declare const ORB_MODE_DESCRIPTORS: Record<OrbMode, OrbModeDescriptor>;
export declare function getModeDescriptor(mode: OrbMode): OrbModeDescriptor;
//# sourceMappingURL=types.d.ts.map