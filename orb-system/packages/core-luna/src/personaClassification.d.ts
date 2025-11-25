/**
 * Persona Classification
 *
 * Rule-based persona classification with explicit overrides.
 * Uses context (device, mode, feature, stream) to infer active persona.
 */
import { OrbPersona, OrbDevice, OrbMode, type PersonaContext, type PersonaClassificationResult } from '@orb-system/core-orb';
/**
 * Persona classification rules
 */
interface PersonaRule {
    id: string;
    weight: number;
    matcher: (context: PersonaContext) => boolean;
    persona: OrbPersona;
    reason: string;
}
/**
 * Classify persona based on context using rule-based matching
 */
export declare function classifyPersona(context: PersonaContext, customRules?: PersonaRule[]): PersonaClassificationResult;
/**
 * Persona override storage
 */
interface PersonaOverride {
    userId: string;
    persona: OrbPersona;
    context?: {
        deviceId?: OrbDevice;
        mode?: OrbMode;
        feature?: string;
    };
    expiresAt?: string;
    createdAt: string;
}
/**
 * Set a persona override for a user
 */
export declare function setPersonaOverride(userId: string, persona: OrbPersona, options?: {
    context?: {
        deviceId?: OrbDevice;
        mode?: OrbMode;
        feature?: string;
    };
    expiresAt?: string;
}): void;
/**
 * Get persona override for a user in a given context
 */
export declare function getPersonaOverride(userId: string, context: PersonaContext): PersonaOverride | null;
/**
 * Clear persona override for a user
 */
export declare function clearPersonaOverride(userId: string, context?: PersonaContext): void;
/**
 * Classify persona with override support
 */
export declare function classifyPersonaWithOverrides(userId: string, context: PersonaContext, customRules?: PersonaRule[]): PersonaClassificationResult;
export {};
//# sourceMappingURL=personaClassification.d.ts.map