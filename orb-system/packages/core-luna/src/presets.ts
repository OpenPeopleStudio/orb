/**
 * Luna Presets
 * 
 * Default profile presets for Luna modes.
 */

import type { LunaModeId } from './types';

export interface ProfilePreset {
  preferences: string[];
  constraints: string[];
}

/**
 * Create a profile from preset defaults
 */
export function createProfileFromPreset(userId: string, modeId: LunaModeId): ProfilePreset {
  // Default presets based on mode
  const presets: Record<string, ProfilePreset> = {
    default: {
      preferences: ['efficiency', 'clarity', 'user-friendly'],
      constraints: ['no-destructive-actions', 'require-confirmation'],
    },
    restaurant: {
      preferences: ['food-quality', 'service-speed', 'atmosphere'],
      constraints: ['no-allergen-mixing', 'hygiene-standards'],
    },
    real_estate: {
      preferences: ['location', 'price-range', 'amenities'],
      constraints: ['legal-compliance', 'disclosure-requirements'],
    },
    builder: {
      preferences: ['code-quality', 'performance', 'maintainability'],
      constraints: ['type-safety', 'test-coverage'],
    },
  };

  return presets[modeId] || presets.default;
}

