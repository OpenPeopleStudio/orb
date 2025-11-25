/**
 * Luna Presets
 *
 * Default profile presets for Luna modes.
 */
import { Mode, MODE_DESCRIPTORS } from './types';
/**
 * Create a profile from preset defaults
 */
export function createProfileFromPreset(userId, modeId) {
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
//# sourceMappingURL=presets.js.map