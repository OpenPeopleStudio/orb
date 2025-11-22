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

