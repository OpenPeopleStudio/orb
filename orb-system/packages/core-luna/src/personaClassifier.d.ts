/**
 * Rule-Based Persona Classifier
 *
 * Role: OrbRole.LUNA (preferences/intent)
 *
 * Classifies persona based on context signals using a transparent,
 * rule-based approach (not ML/LLM).
 *
 * Implements IPersonaClassifier interface from @orb-system/core-orb.
 */
import { type PersonaContext, type PersonaClassificationResult, type IPersonaClassifier, OrbPersona } from '@orb-system/core-orb';
/**
 * Persona Override Store Interface
 */
interface IPersonaOverrideStore {
    getOverride(userId: string, sessionId?: string): Promise<OrbPersona | null>;
    setOverride(userId: string, persona: OrbPersona, sessionId?: string): Promise<void>;
    clearOverride(userId: string, sessionId?: string): Promise<void>;
}
/**
 * Rule-Based Persona Classifier
 *
 * Uses deterministic rules based on device, mode, feature, and other signals
 * to infer the active persona.
 */
export declare class RuleBasedPersonaClassifier implements IPersonaClassifier {
    private overrideStore;
    constructor(overrideStore?: IPersonaOverrideStore);
    /**
     * Classify persona based on context
     */
    classifyPersona(context: PersonaContext): Promise<PersonaClassificationResult>;
    /**
     * Set explicit persona override
     */
    setPersonaOverride(userId: string, persona: string, sessionId?: string): Promise<void>;
    /**
     * Get current persona override
     */
    getPersonaOverride(userId: string, sessionId?: string): Promise<string | null>;
    /**
     * Clear persona override
     */
    clearPersonaOverride(userId: string, sessionId?: string): Promise<void>;
    /**
     * Apply device-based rules
     */
    private applyDeviceRule;
    /**
     * Apply mode-based rules
     */
    private applyModeRule;
    /**
     * Apply feature-based rules
     */
    private applyFeatureRule;
    /**
     * Apply time-of-day rules
     */
    private applyTimeOfDayRule;
    /**
     * Apply location-based rules
     */
    private applyLocationRule;
}
/**
 * Get or create the default persona classifier
 */
export declare function getPersonaClassifier(): RuleBasedPersonaClassifier;
/**
 * Helper function for classifying persona with default classifier
 */
export declare function classifyPersona(context: PersonaContext): Promise<PersonaClassificationResult>;
export {};
//# sourceMappingURL=personaClassifier.d.ts.map