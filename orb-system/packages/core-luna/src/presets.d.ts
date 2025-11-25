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
export declare function createProfileFromPreset(userId: string, modeId: LunaModeId): ProfilePreset;
//# sourceMappingURL=presets.d.ts.map