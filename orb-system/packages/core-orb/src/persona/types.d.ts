/**
 * Persona Classification Types
 *
 * Types for persona detection and classification.
 */
import type { OrbPersona, OrbDevice, OrbMode } from '../identity/types';
/**
 * Persona Context - inputs for persona classification
 */
export interface PersonaContext {
    userId: string;
    deviceId?: string;
    device?: OrbDevice;
    mode?: OrbMode;
    feature?: string;
    stream?: string;
    location?: string;
    timeOfDay?: string;
    recentActivity?: string[];
    explicitPersona?: OrbPersona;
    metadata?: Record<string, unknown>;
}
/**
 * Persona Classification Result
 */
export interface PersonaClassificationResult {
    persona: OrbPersona;
    confidence: number;
    source: 'override' | 'explicit' | 'device' | 'feature' | 'mode' | 'time' | 'activity' | 'default';
    reasoning: string[];
    alternatives?: Array<{
        persona: OrbPersona;
        confidence: number;
    }>;
}
/**
 * Persona Rule - a rule for classifying persona
 */
export interface PersonaRule {
    id: string;
    priority?: number;
    description?: string;
    applies: (context: PersonaContext) => boolean;
    persona: OrbPersona;
    confidence: number;
    reasoning?: string;
}
//# sourceMappingURL=types.d.ts.map