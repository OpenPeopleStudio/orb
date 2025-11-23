/**
 * Persona Classification Interface
 * 
 * Defines the contract for classifying personas based on context.
 * 
 * Role: Core identity layer (used by all packages)
 */

import type { PersonaContext, PersonaClassificationResult } from './types';

/**
 * Persona Classifier Interface
 * 
 * Implementations of this interface infer the active persona
 * based on available context signals.
 */
export interface IPersonaClassifier {
  /**
   * Classify persona based on context
   * 
   * @param context - The persona context with available signals
   * @returns Classification result with confidence and reasoning
   */
  classifyPersona(context: PersonaContext): Promise<PersonaClassificationResult>;
  
  /**
   * Set explicit persona override for a user
   * 
   * @param userId - User ID
   * @param persona - The persona to set
   * @param sessionId - Optional session ID
   */
  setPersonaOverride(
    userId: string,
    persona: string,
    sessionId?: string
  ): Promise<void>;
  
  /**
   * Get current persona override for a user
   * 
   * @param userId - User ID
   * @param sessionId - Optional session ID
   * @returns The overridden persona, or null if none set
   */
  getPersonaOverride(
    userId: string,
    sessionId?: string
  ): Promise<string | null>;
  
  /**
   * Clear persona override
   * 
   * @param userId - User ID
   * @param sessionId - Optional session ID
   */
  clearPersonaOverride(
    userId: string,
    sessionId?: string
  ): Promise<void>;
}

// TODO: PERSONA_AGENT - Implement RuleBasedPersonaClassifier class
// TODO: PERSONA_AGENT - Add rule configuration for device → persona mappings
// TODO: PERSONA_AGENT - Add rule configuration for feature → persona mappings
// TODO: PERSONA_AGENT - Implement persona override persistence

