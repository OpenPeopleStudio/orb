/**
 * Persona Classification Tests
 * 
 * Tests for rule-based persona classification
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  classifyPersona,
  classifyPersonaWithOverrides,
  setPersonaOverride,
  getPersonaOverride,
  clearPersonaOverride,
} from '../personaClassification';
import {
  OrbPersona,
  OrbDevice,
  OrbMode,
  type PersonaContext,
} from '@orb-system/core-orb';

describe('Persona Classification', () => {
  describe('Rule-based Classification', () => {
    it('should return default persona with no context', () => {
      const context: PersonaContext = {};
      
      const result = classifyPersona(context);
      
      expect(result.persona).toBe(OrbPersona.PERSONAL);
      expect(result.source).toBe('default');
      expect(result.confidence).toBeLessThan(0.5);
    });
    
    it('should classify based on device', () => {
      const context: PersonaContext = {
        deviceId: OrbDevice.MARS,
      };
      
      const result = classifyPersona(context);
      
      expect(result.persona).toBe(OrbPersona.SWL);
      expect(result.source).toBe('inferred');
      expect(result.confidence).toBeGreaterThan(0.5);
      expect(result.reasons.length).toBeGreaterThan(0);
    });
    
    it('should classify based on mode', () => {
      const context: PersonaContext = {
        mode: OrbMode.REAL_ESTATE,
      };
      
      const result = classifyPersona(context);
      
      expect(result.persona).toBe(OrbPersona.REAL_ESTATE);
      expect(result.source).toBe('inferred');
      expect(result.reasons.some(r => r.includes('Real estate mode'))).toBe(true);
    });
    
    it('should classify based on feature', () => {
      const context: PersonaContext = {
        feature: 'Snow White Laundry Schedule',
      };
      
      const result = classifyPersona(context);
      
      expect(result.persona).toBe(OrbPersona.SWL);
      expect(result.source).toBe('inferred');
    });
    
    it('should combine multiple signals', () => {
      const context: PersonaContext = {
        deviceId: OrbDevice.MARS,
        mode: OrbMode.RESTAURANT,
        feature: 'SWL Staff Management',
      };
      
      const result = classifyPersona(context);
      
      expect(result.persona).toBe(OrbPersona.SWL);
      expect(result.confidence).toBeGreaterThan(0.7);
      expect(result.reasons.length).toBeGreaterThan(1);
    });
    
    it('should use explicit persona when provided', () => {
      const context: PersonaContext = {
        deviceId: OrbDevice.MARS,
        mode: OrbMode.RESTAURANT,
        explicitPersona: OrbPersona.PERSONAL,
      };
      
      const result = classifyPersona(context);
      
      expect(result.persona).toBe(OrbPersona.PERSONAL);
      expect(result.source).toBe('explicit');
      expect(result.confidence).toBe(1.0);
    });
    
    it('should provide distribution for all personas', () => {
      const context: PersonaContext = {
        deviceId: OrbDevice.EARTH,
      };
      
      const result = classifyPersona(context);
      
      expect(result.distribution).toBeDefined();
      expect(Object.keys(result.distribution!)).toHaveLength(4);
      expect(result.distribution![OrbPersona.PERSONAL]).toBeGreaterThan(0);
    });
    
    it('should handle recent persona history (sticky behavior)', () => {
      const fiveMinutesAgo = new Date(Date.now() - 4 * 60 * 1000).toISOString();
      
      const context: PersonaContext = {
        deviceId: OrbDevice.MARS,
        recentPersonas: [
          { persona: OrbPersona.REAL_ESTATE, timestamp: fiveMinutesAgo },
        ],
      };
      
      const result = classifyPersona(context);
      
      // Should stick with recent persona
      expect(result.persona).toBe(OrbPersona.REAL_ESTATE);
      expect(result.source).toBe('inferred');
      expect(result.reasons.some(r => r.includes('Recently active'))).toBe(true);
    });
    
    it('should not stick to old persona history', () => {
      const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();
      
      const context: PersonaContext = {
        deviceId: OrbDevice.MARS,
        recentPersonas: [
          { persona: OrbPersona.REAL_ESTATE, timestamp: tenMinutesAgo },
        ],
      };
      
      const result = classifyPersona(context);
      
      // Should classify based on device, not old history
      expect(result.persona).toBe(OrbPersona.SWL);
    });
  });
  
  describe('Persona Overrides', () => {
    const testUserId = 'test-user';
    
    beforeEach(() => {
      // Clear overrides before each test
      clearPersonaOverride(testUserId);
    });
    
    it('should set and get persona override', () => {
      setPersonaOverride(testUserId, OrbPersona.SWL);
      
      const context: PersonaContext = {
        deviceId: OrbDevice.EARTH,
      };
      
      const override = getPersonaOverride(testUserId, context);
      
      expect(override).not.toBeNull();
      expect(override!.persona).toBe(OrbPersona.SWL);
    });
    
    it('should use override in classification', () => {
      setPersonaOverride(testUserId, OrbPersona.OPEN_PEOPLE);
      
      const context: PersonaContext = {
        deviceId: OrbDevice.MARS, // Would normally infer SWL
      };
      
      const result = classifyPersonaWithOverrides(testUserId, context);
      
      expect(result.persona).toBe(OrbPersona.OPEN_PEOPLE);
      expect(result.source).toBe('explicit');
      expect(result.confidence).toBe(1.0);
    });
    
    it('should support context-specific overrides', () => {
      setPersonaOverride(testUserId, OrbPersona.SWL, {
        context: {
          deviceId: OrbDevice.MARS,
          mode: OrbMode.RESTAURANT,
        },
      });
      
      // Matching context
      const matchingContext: PersonaContext = {
        deviceId: OrbDevice.MARS,
        mode: OrbMode.RESTAURANT,
      };
      
      const matchingOverride = getPersonaOverride(testUserId, matchingContext);
      expect(matchingOverride).not.toBeNull();
      expect(matchingOverride!.persona).toBe(OrbPersona.SWL);
      
      // Non-matching context
      const nonMatchingContext: PersonaContext = {
        deviceId: OrbDevice.EARTH,
        mode: OrbMode.EARTH,
      };
      
      const nonMatchingOverride = getPersonaOverride(testUserId, nonMatchingContext);
      expect(nonMatchingOverride).toBeNull();
    });
    
    it('should support expiring overrides', () => {
      const oneSecondAgo = new Date(Date.now() - 1000).toISOString();
      
      setPersonaOverride(testUserId, OrbPersona.SWL, {
        expiresAt: oneSecondAgo,
      });
      
      const context: PersonaContext = {};
      const override = getPersonaOverride(testUserId, context);
      
      expect(override).toBeNull();
    });
    
    it('should clear overrides', () => {
      setPersonaOverride(testUserId, OrbPersona.SWL);
      
      clearPersonaOverride(testUserId);
      
      const context: PersonaContext = {};
      const override = getPersonaOverride(testUserId, context);
      
      expect(override).toBeNull();
    });
    
    it('should clear context-specific overrides', () => {
      setPersonaOverride(testUserId, OrbPersona.SWL, {
        context: {
          deviceId: OrbDevice.MARS,
        },
      });
      
      const clearContext: PersonaContext = {
        deviceId: OrbDevice.MARS,
      };
      
      clearPersonaOverride(testUserId, clearContext);
      
      const override = getPersonaOverride(testUserId, clearContext);
      expect(override).toBeNull();
    });
  });
  
  describe('Edge Cases', () => {
    it('should handle empty feature string', () => {
      const context: PersonaContext = {
        feature: '',
      };
      
      const result = classifyPersona(context);
      
      expect(result.persona).toBe(OrbPersona.PERSONAL);
      expect(result.source).toBe('default');
    });
    
    it('should handle case-insensitive feature matching', () => {
      const context: PersonaContext = {
        feature: 'SNOW WHITE LAUNDRY',
      };
      
      const result = classifyPersona(context);
      
      expect(result.persona).toBe(OrbPersona.SWL);
    });
    
    it('should handle conflicting signals gracefully', () => {
      const context: PersonaContext = {
        deviceId: OrbDevice.EARTH, // Suggests PERSONAL
        mode: OrbMode.RESTAURANT, // Suggests SWL
      };
      
      const result = classifyPersona(context);
      
      // Should have a winner but with moderate confidence
      expect(result.persona).toBeDefined();
      expect(result.source).toBe('inferred');
    });
  });
});

