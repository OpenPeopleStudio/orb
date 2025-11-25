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
import { ORB_MODE_DESCRIPTORS, ORB_PERSONA_PROFILES, getModeDisplayName as coreGetModeDisplayName, getPersonaDisplayName as coreGetPersonaDisplayName, } from '@orb-system/core-orb';
export { OrbMode as Mode, OrbPersona as Persona } from '@orb-system/core-orb';
export const MODE_DESCRIPTORS = ORB_MODE_DESCRIPTORS;
export const PERSONA_PROFILES = ORB_PERSONA_PROFILES;
export function getModeDisplayName(mode) {
    return coreGetModeDisplayName(mode);
}
export function getPersonaDisplayName(persona) {
    return coreGetPersonaDisplayName(persona);
}
//# sourceMappingURL=types.js.map