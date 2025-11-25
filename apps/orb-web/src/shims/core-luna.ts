import type { OrbMode, OrbPersona } from './core-orb';

export enum Mode {
  DEFAULT = 'default',
  RESTAURANT = 'restaurant',
  REAL_ESTATE = 'real_estate',
  BUILDER = 'builder',
}

export enum Persona {
  PERSONAL = 'personal',
  BUSINESS = 'business',
  EXECUTIVE = 'executive',
  INVESTOR = 'investor',
}

type ModeDescriptor = {
  label: string;
  description: string;
  color: string;
  defaultPersonas: Persona[];
  keywords: string[];
};

export const MODE_DESCRIPTORS: Record<Mode, ModeDescriptor> = {
  [Mode.DEFAULT]: {
    label: 'Default',
    description: 'Balanced assistant tuned for general workflows.',
    color: 'text-accent-luna',
    defaultPersonas: [Persona.PERSONAL, Persona.BUSINESS],
    keywords: ['general', 'overview', 'summary'],
  },
  [Mode.RESTAURANT]: {
    label: 'Restaurant Ops',
    description: 'Hospitality-focused persona fluent in SWL operations.',
    color: 'text-orange-400',
    defaultPersonas: [Persona.EXECUTIVE],
    keywords: ['restaurant', 'hospitality', 'snow white laundry'],
  },
  [Mode.REAL_ESTATE]: {
    label: 'Real Estate',
    description: 'Handles market research, outreach, and diligence.',
    color: 'text-blue-400',
    defaultPersonas: [Persona.INVESTOR],
    keywords: ['property', 'listing', 'market'],
  },
  [Mode.BUILDER]: {
    label: 'Builder',
    description: 'Hands-on execution mode with a bias to action.',
    color: 'text-purple-400',
    defaultPersonas: [Persona.BUSINESS],
    keywords: ['execution', 'build', 'ship'],
  },
};

export const modeService = {
  currentMode: Mode.DEFAULT,
  currentPersona: Persona.PERSONAL,
  async setMode(
    _context: { sessionId: string; userId?: string },
    mode: Mode | OrbMode,
    persona: Persona | OrbPersona
  ) {
    this.currentMode = mode as Mode;
    this.currentPersona = persona as Persona;
    return { mode: this.currentMode, persona: this.currentPersona };
  },
  getCurrentMode() {
    return this.currentMode;
  },
};

export function createProfileFromPreset(userId: string, mode: Mode) {
  return {
    userId,
    mode,
    preferences: ['bias to action', 'favor clarity', 'close the loop'],
    constraints: [],
  };
}

