/**
 * Luna Presets
 * 
 * Default profile presets for Luna modes.
 */

import { Mode, MODE_DESCRIPTORS } from './types';
import type { LunaModeId } from './types';

export interface ProfilePreset {
  preferences: string[];
  constraints: string[];
}

/**
 * Create a profile from preset defaults
 */
export function createProfileFromPreset(userId: string, modeId: LunaModeId): ProfilePreset {
  const descriptor = MODE_DESCRIPTORS[modeId] ?? MODE_DESCRIPTORS[Mode.DEFAULT];

  return {
    preferences: descriptor.defaultPreferences.length
      ? descriptor.defaultPreferences
      : ['balanced-ui'],
    constraints: descriptor.defaultConstraints.length
      ? descriptor.defaultConstraints
      : ['require-confirmation'],
  };
}

