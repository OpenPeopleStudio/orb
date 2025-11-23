import { OrbDevice, OrbMode, OrbPersona } from '../identity/types';
import type { PersonaContext, PersonaRule } from './types';

const dynamicRules: PersonaRule[] = [];

const DEFAULT_RULES: PersonaRule[] = [
  {
    id: 'device-mars-swl',
    description: 'Mars device or Restaurant mode implies SWL persona.',
    persona: OrbPersona.SWL,
    confidence: 0.85,
    applies: (context) =>
      context.device === OrbDevice.MARS ||
      context.mode === OrbMode.MARS ||
      context.mode === OrbMode.RESTAURANT ||
      context.feature === 'restaurant_ops',
  },
  {
    id: 'real-estate-mode',
    description: 'Real Estate mode/device implies Real Estate persona.',
    persona: OrbPersona.REAL_ESTATE,
    confidence: 0.8,
    applies: (context) =>
      context.mode === OrbMode.REAL_ESTATE ||
      context.feature === 'real_estate' ||
      context.stream === 'deals',
  },
  {
    id: 'earth-device-open-people',
    description: 'Earth device with calm contexts maps to Open People.',
    persona: OrbPersona.OPEN_PEOPLE,
    confidence: 0.7,
    applies: (context) =>
      context.device === OrbDevice.EARTH ||
      context.feature === 'relationships' ||
      context.metadata?.topic === 'reflection',
  },
  {
    id: 'forge-mode-personal',
    description: 'Forge/Builder modes default to the Personal persona.',
    persona: OrbPersona.PERSONAL,
    confidence: 0.9,
    applies: (context) =>
      context.mode === OrbMode.FORGE ||
      context.mode === OrbMode.BUILDER ||
      context.feature === 'automation',
  },
];

export function registerPersonaRule(rule: PersonaRule): void {
  dynamicRules.push(rule);
}

export function resetPersonaRules(): void {
  dynamicRules.length = 0;
}

export function getPersonaRules(): PersonaRule[] {
  return [...dynamicRules, ...DEFAULT_RULES];
}

export function findMatchingRule(context: PersonaContext): PersonaRule | undefined {
  const rules = getPersonaRules().sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0));
  return rules.find((rule) => {
    try {
      return rule.applies(context);
    } catch (error) {
      console.warn('[persona] Rule error', rule.id, error);
      return false;
    }
  });
}


