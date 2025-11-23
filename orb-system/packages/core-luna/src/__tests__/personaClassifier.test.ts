/**
 * Persona Classifier Tests
 * 
 * Tests for rule-based persona classification.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { RuleBasedPersonaClassifier } from '../personaClassifier';
import {
  type PersonaContext,
  OrbPersona,
  OrbMode,
  OrbDevice,
} from '@orb-system/core-orb';

describe('RuleBasedPersonaClassifier', () => {
  let classifier: RuleBasedPersonaClassifier;
  
  beforeEach(() => {
    classifier = new RuleBasedPersonaClassifier();
  });
  
  describe('classifyPersona', () => {
    it('should use user override when provided', async () => {
      const context: PersonaContext = {
        userId: 'user-123',
        sessionId: 'session-456',
        deviceId: OrbDevice.MARS, // Would normally suggest SWL
        currentMode: OrbMode.MARS,
        userOverride: OrbPersona.PERSONAL, // But user explicitly set Personal
      };
      
      const result = await classifier.classifyPersona(context);
      
      expect(result.persona).toBe(OrbPersona.PERSONAL);
      expect(result.confidence).toBe(1.0);
      expect(result.overridden).toBe(true);
      expect(result.reasons).toContain('User override active');
    });
    
    it('should infer SWL persona from Mars device', async () => {
      const context: PersonaContext = {
        userId: 'user-123',
        sessionId: 'session-456',
        deviceId: OrbDevice.MARS,
      };
      
      const result = await classifier.classifyPersona(context);
      
      expect(result.persona).toBe(OrbPersona.SWL);
      expect(result.confidence).toBeGreaterThan(0.5);
      expect(result.signals).toContain('Mars device → SWL persona (operations)');
    });
    
    it('should infer Personal persona from Sol device', async () => {
      const context: PersonaContext = {
        userId: 'user-123',
        sessionId: 'session-456',
        deviceId: OrbDevice.SOL,
      };
      
      const result = await classifier.classifyPersona(context);
      
      expect(result.persona).toBe(OrbPersona.PERSONAL);
      expect(result.signals).toContain('Sol device → Personal persona (creative work)');
    });
    
    it('should strongly weight mode correlation', async () => {
      const context: PersonaContext = {
        userId: 'user-123',
        sessionId: 'session-456',
        currentMode: OrbMode.REAL_ESTATE,
      };
      
      const result = await classifier.classifyPersona(context);
      
      expect(result.persona).toBe(OrbPersona.REAL_ESTATE);
      expect(result.confidence).toBeGreaterThan(0.7);
      expect(result.signals).toContain('Real Estate mode → RealEstate persona');
    });
    
    it('should use feature context for classification', async () => {
      const context: PersonaContext = {
        userId: 'user-123',
        sessionId: 'session-456',
        activeFeature: 'SWL',
      };
      
      const result = await classifier.classifyPersona(context);
      
      expect(result.persona).toBe(OrbPersona.SWL);
      expect(result.signals).toContain('Feature "SWL" → SWL persona');
    });
    
    it('should combine multiple signals', async () => {
      const context: PersonaContext = {
        userId: 'user-123',
        sessionId: 'session-456',
        deviceId: OrbDevice.EARTH, // Suggests Personal/OpenPeople
        currentMode: OrbMode.EARTH, // Also suggests Personal/OpenPeople
        timeOfDay: 'evening', // Suggests Personal/OpenPeople
      };
      
      const result = await classifier.classifyPersona(context);
      
      // Should be Personal or OpenPeople with high confidence
      expect([OrbPersona.PERSONAL, OrbPersona.OPEN_PEOPLE]).toContain(result.persona);
      expect(result.confidence).toBeGreaterThan(0.6);
      expect(result.signals.length).toBeGreaterThan(2);
    });
    
    it('should use uniform distribution when no signals', async () => {
      const context: PersonaContext = {
        userId: 'user-123',
        sessionId: 'session-456',
        // No signals provided
      };
      
      const result = await classifier.classifyPersona(context);
      
      // All personas should have equal weight
      expect(result.distribution[OrbPersona.PERSONAL]).toBe(0.25);
      expect(result.distribution[OrbPersona.SWL]).toBe(0.25);
      expect(result.distribution[OrbPersona.REAL_ESTATE]).toBe(0.25);
      expect(result.distribution[OrbPersona.OPEN_PEOPLE]).toBe(0.25);
      expect(result.reasons).toContain('No strong signals, defaulting to balanced distribution');
    });
    
    it('should handle location hints', async () => {
      const context: PersonaContext = {
        userId: 'user-123',
        sessionId: 'session-456',
        locationHint: 'restaurant',
      };
      
      const result = await classifier.classifyPersona(context);
      
      expect(result.persona).toBe(OrbPersona.SWL);
      expect(result.signals).toContain('Location "restaurant" → SWL persona');
    });
    
    it('should bias toward OpenPeople at night', async () => {
      const context: PersonaContext = {
        userId: 'user-123',
        sessionId: 'session-456',
        timeOfDay: 'night',
      };
      
      const result = await classifier.classifyPersona(context);
      
      expect(result.signals).toContain('Night → OpenPeople bias (reflection)');
      // May not be strongest signal alone, but should contribute
      expect(result.distribution[OrbPersona.OPEN_PEOPLE]).toBeGreaterThan(0);
    });
  });
  
  describe('persona overrides', () => {
    it('should set and retrieve persona override', async () => {
      await classifier.setPersonaOverride('user-123', OrbPersona.SWL);
      
      const override = await classifier.getPersonaOverride('user-123');
      
      expect(override).toBe(OrbPersona.SWL);
    });
    
    it('should use retrieved override in classification', async () => {
      // Set override
      await classifier.setPersonaOverride('user-123', OrbPersona.REAL_ESTATE, 'session-456');
      
      // Classify without explicit userOverride in context
      const context: PersonaContext = {
        userId: 'user-123',
        sessionId: 'session-456',
        deviceId: OrbDevice.MARS, // Would normally suggest SWL
      };
      
      const result = await classifier.classifyPersona(context);
      
      expect(result.persona).toBe(OrbPersona.REAL_ESTATE);
      expect(result.overridden).toBe(true);
    });
    
    it('should clear persona override', async () => {
      await classifier.setPersonaOverride('user-123', OrbPersona.SWL);
      await classifier.clearPersonaOverride('user-123');
      
      const override = await classifier.getPersonaOverride('user-123');
      
      expect(override).toBeNull();
    });
    
    it('should support session-scoped overrides', async () => {
      await classifier.setPersonaOverride('user-123', OrbPersona.SWL, 'session-1');
      await classifier.setPersonaOverride('user-123', OrbPersona.PERSONAL, 'session-2');
      
      const override1 = await classifier.getPersonaOverride('user-123', 'session-1');
      const override2 = await classifier.getPersonaOverride('user-123', 'session-2');
      
      expect(override1).toBe(OrbPersona.SWL);
      expect(override2).toBe(OrbPersona.PERSONAL);
    });
    
    it('should reject invalid persona', async () => {
      await expect(
        classifier.setPersonaOverride('user-123', 'invalid-persona' as any)
      ).rejects.toThrow('Invalid persona');
    });
  });
  
  describe('distribution normalization', () => {
    it('should normalize distribution to sum to 1.0', async () => {
      const context: PersonaContext = {
        userId: 'user-123',
        sessionId: 'session-456',
        deviceId: OrbDevice.MARS,
        currentMode: OrbMode.MARS,
        activeFeature: 'SWL',
      };
      
      const result = await classifier.classifyPersona(context);
      
      const sum = Object.values(result.distribution).reduce((a, b) => a + b, 0);
      expect(sum).toBeCloseTo(1.0, 5);
    });
  });
});

