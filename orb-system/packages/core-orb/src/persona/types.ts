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
  feature?: string; // e.g. 'SWL', 'RealEstate', 'Personal'
  stream?: string; // e.g. 'deals', 'relationships', 'tasks'
  location?: string;
  timeOfDay?: string; // ISO time or hour
  recentActivity?: string[]; // Recent action/event types
  explicitPersona?: OrbPersona; // User-chosen persona (overrides inference)
  metadata?: Record<string, unknown>;
}

/**
 * Persona Classification Result
 */
export interface PersonaClassificationResult {
  persona: OrbPersona;
  confidence: number; // 0-1
  source: 'explicit' | 'device' | 'feature' | 'mode' | 'time' | 'activity' | 'default';
  reasoning: string[];
  alternatives?: Array<{ persona: OrbPersona; confidence: number }>;
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

