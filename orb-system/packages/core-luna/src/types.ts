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
 * Luna Risk Level
 */
export type LunaRiskLevel = 'low' | 'medium' | 'high';

/**
 * Luna Decision Type
 */
export type LunaDecisionType = 'allow' | 'require_confirmation' | 'deny';

/**
 * Luna Constraint - structured constraint definition
 */
export interface LunaConstraint {
  id: string;
  type: 'block_tool' | 'max_risk' | 'require_confirmation' | 'other';
  active: boolean;
  toolId?: string;
  maxRisk?: LunaRiskLevel;
  appliesToRoles?: string[];
  description?: string;
}

/**
 * Luna Action Descriptor - describes an action to be evaluated
 */
export interface LunaActionDescriptor {
  id: string;
  role: string;
  kind: 'tool_call' | 'file_write' | 'file_read' | 'api_call' | 'other';
  toolId?: string;
  estimatedRisk?: LunaRiskLevel;
  description?: string;
}

/**
 * Luna Decision - result of action evaluation
 */
export interface LunaDecision {
  type: LunaDecisionType;
  reasons: string[];
  triggeredConstraints: string[];
  effectiveRisk: LunaRiskLevel;
  context: {
    userId: string | null;
    sessionId: string;
  };
}

/**
 * Luna Profile - user preferences and constraints for a specific mode
 */
export interface LunaProfile {
  userId: string;
  modeId: LunaModeId;
  preferences: string[]; // Array of preference strings
  constraints: LunaConstraint[]; // Array of constraint objects
  updatedAt: string; // ISO timestamp
}

