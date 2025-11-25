/**
 * Persona Classifier
 *
 * Rules-based persona classification from context.
 * Transparent, deterministic, and easily overridable.
 */
import type { PersonaContext, PersonaClassificationResult } from './types';
import { OrbPersona } from '../identity/types';
/**
 * Classify persona based on context
 *
 * Returns the best-matching persona with confidence and reasoning.
 */
export declare function classifyPersona(context: PersonaContext): PersonaClassificationResult;
/**
 * Get recommended persona for a context
 *
 * Convenience function that returns just the persona.
 */
export declare function getRecommendedPersona(context: PersonaContext): OrbPersona;
/**
 * Set or clear a persona override for a user.
 */
export declare function setPersonaOverride(userId: string, persona: OrbPersona | null): void;
/**
 * Get the active persona override for a user, if one exists.
 */
export declare function getPersonaOverride(userId: string): OrbPersona | null;
/**
 * Clear any persona override for the provided user.
 */
export declare function clearPersonaOverride(userId: string): void;
/**
 * Override persona classification
 *
 * Store a user's explicit persona choice for future classification.
 *
 * TODO: Persistence - this should be stored in a preferences store
 */
export declare function setExplicitPersona(userId: string, persona: OrbPersona): void;
//# sourceMappingURL=classifier.d.ts.map