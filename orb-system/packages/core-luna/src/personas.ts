/**
 * Persona Classifier
 * 
 * Migrated from repo: SomaOS, path: Services/PersonaClassifier.swift
 * Date: 2025-11-22
 * Role: OrbRole.LUNA (preferences/intent)
 * 
 * Classifies text samples into persona distribution.
 */

import { OrbRole, OrbContext, getConfig } from '@orb-system/core-orb';
import { Persona, PersonaDistribution } from './types';

export interface ClassifyPersonaRequest {
  text: string;
}

export interface PersonaClassificationResult {
  persona: string;
  confidence: number;
}

/**
 * Persona Classifier for determining persona from text
 */
export class PersonaClassifier {
  private static instance: PersonaClassifier;
  
  private constructor() {}
  
  static getInstance(): PersonaClassifier {
    if (!PersonaClassifier.instance) {
      PersonaClassifier.instance = new PersonaClassifier();
    }
    return PersonaClassifier.instance;
  }
  
  /**
   * Classify text samples into persona distribution
   */
  async classify(
    ctx: OrbContext,
    samples: string[]
  ): Promise<PersonaDistribution> {
    if (ctx.role !== OrbRole.LUNA) {
      console.warn(`classify called with role ${ctx.role}, expected LUNA`);
    }
    
    if (samples.length === 0) {
      return {
        personal: 0.25,
        swl: 0.25,
        realEstate: 0.25,
        openPeople: 0.25,
      };
    }
    
    // Combine samples for classification
    const combinedText = samples.join(' ');
    
    try {
      const config = getConfig();
      const openaiApiKey = config.openaiApiKey;
      
      if (!openaiApiKey) {
        throw new Error('OPENAI_API_KEY not configured');
      }
      
      // This would call the backend API
      // For now, return uniform distribution
      // In production, this would make an API call to classify-persona endpoint
      
      return {
        personal: 0.25,
        swl: 0.25,
        realEstate: 0.25,
        openPeople: 0.25,
      };
    } catch (error) {
      console.error('PersonaClassifier.classify error:', error);
      // Return uniform distribution on error
      return {
        personal: 0.25,
        swl: 0.25,
        realEstate: 0.25,
        openPeople: 0.25,
      };
    }
  }
}

export const personaClassifier = PersonaClassifier.getInstance();

