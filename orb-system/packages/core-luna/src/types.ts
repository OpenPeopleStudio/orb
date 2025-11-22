/**
 * Luna Types
 * 
 * Migrated from repo: SomaOS, path: Models/LauncherModels.swift
 * Date: 2025-11-22
 * Role: OrbRole.LUNA (preferences/intent)
 * 
 * Core types for modes and personas. Backed by the identity descriptors
 * defined in @orb-system/core-orb.
 */

import {
  type OrbMode,
  type OrbPersona,
  type OrbModeDescriptor,
  type OrbPersonaProfile,
  ORB_MODE_DESCRIPTORS,
  ORB_PERSONA_PROFILES,
  getModeDisplayName as coreGetModeDisplayName,
  getPersonaDisplayName as coreGetPersonaDisplayName,
} from '@orb-system/core-orb';

export { OrbMode as Mode, OrbPersona as Persona } from '@orb-system/core-orb';

export type ModeDescriptor = OrbModeDescriptor;
export type PersonaProfile = OrbPersonaProfile;

export const MODE_DESCRIPTORS: Record<OrbMode, ModeDescriptor> = ORB_MODE_DESCRIPTORS;
export const PERSONA_PROFILES: Record<OrbPersona, PersonaProfile> = ORB_PERSONA_PROFILES;

export interface PersonaDistribution {
  personal: number;
  swl: number;
  realEstate: number;
  openPeople: number;
}

export function getModeDisplayName(mode: OrbMode): string {
  return coreGetModeDisplayName(mode);
}

export function getPersonaDisplayName(persona: OrbPersona): string {
  return coreGetPersonaDisplayName(persona);
}

/**
 * Luna Mode ID - string identifier for a mode
 */
export type LunaModeId = OrbMode;

/**
 * Luna Profile - user preferences and constraints for a specific mode
 */
export interface LunaProfile {
  userId: string;
  modeId: LunaModeId;
  preferences: string[]; // Array of preference strings
  constraints: string[]; // Array of constraint strings
  updatedAt: string; // ISO timestamp
}

