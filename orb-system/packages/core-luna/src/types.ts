/**
 * Luna Types
 * 
 * Migrated from repo: SomaOS, path: Models/LauncherModels.swift
 * Date: 2025-11-22
 * Role: OrbRole.LUNA (preferences/intent)
 * 
 * Core types for modes and personas.
 */

export enum Mode {
  SOL = 'Sol',
  MARS = 'Mars',
  EARTH = 'Earth',
}

export enum Persona {
  PERSONAL = 'Personal',
  SWL = 'SWL',
  REAL_ESTATE = 'Real Estate',
  OPEN_PEOPLE = 'Open People',
}

export interface PersonaDistribution {
  personal: number;
  swl: number;
  realEstate: number;
  openPeople: number;
}

export function getModeDisplayName(mode: Mode): string {
  switch (mode) {
    case Mode.SOL:
      return 'Sol Mode';
    case Mode.MARS:
      return 'Mars Mode';
    case Mode.EARTH:
      return 'Earth Mode';
  }
}

export function getPersonaDisplayName(persona: Persona): string {
  return persona;
}

