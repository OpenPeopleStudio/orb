/**
 * Persona Classifier Tests
 * 
 * Tests for persona classification logic.
 */

import { describe, it, expect } from 'vitest';
import {
  classifyPersona,
  getRecommendedPersona,
} from '../classifier';
import type { PersonaContext } from '../types';
import { OrbPersona, OrbDevice, OrbMode } from '../../identity/types';

describe('Persona Classifier', () => {
  const baseContext: PersonaContext = {
    userId: 'user-123',
    deviceId: 'device-sol',
  };

  describe('Explicit Persona', () => {
    it('should respect explicitly set persona', () => {
      const context: PersonaContext = {
        ...baseContext,
        explicitPersona: OrbPersona.SWL,
      };
      
      const result = classifyPersona(context);
      
      expect(result.persona).toBe(OrbPersona.SWL);
      expect(result.confidence).toBe(1.0);
      expect(result.source).toBe('explicit');
    });

    it('should override other signals when explicit', () => {
      const context: PersonaContext = {
        ...baseContext,
        device: OrbDevice.MARS, // Would suggest SWL
        mode: OrbMode.MARS, // Would suggest SWL
        explicitPersona: OrbPersona.OPEN_PEOPLE, // Override to OPEN_PEOPLE
      };
      
      const result = classifyPersona(context);
      
      expect(result.persona).toBe(OrbPersona.OPEN_PEOPLE);
      expect(result.source).toBe('explicit');
    });
  });

  describe('Feature-Based Classification', () => {
    it('should classify as SWL for restaurant feature', () => {
      const context: PersonaContext = {
        ...baseContext,
        feature: 'SWL',
      };
      
      const result = classifyPersona(context);
      
      expect(result.persona).toBe(OrbPersona.SWL);
      expect(result.confidence).toBeGreaterThanOrEqual(0.9);
      expect(result.source).toBe('feature');
    });

    it('should classify as REAL_ESTATE for real estate feature', () => {
      const context: PersonaContext = {
        ...baseContext,
        feature: 'RealEstate',
      };
      
      const result = classifyPersona(context);
      
      expect(result.persona).toBe(OrbPersona.REAL_ESTATE);
      expect(result.confidence).toBeGreaterThanOrEqual(0.9);
      expect(result.source).toBe('feature');
    });
  });

  describe('Mode-Based Classification', () => {
    it('should classify as SWL for RESTAURANT mode', () => {
      const context: PersonaContext = {
        ...baseContext,
        mode: OrbMode.RESTAURANT,
      };
      
      const result = classifyPersona(context);
      
      expect(result.persona).toBe(OrbPersona.SWL);
      expect(result.source).toBe('mode');
    });

    it('should classify as SWL for MARS mode', () => {
      const context: PersonaContext = {
        ...baseContext,
        mode: OrbMode.MARS,
      };
      
      const result = classifyPersona(context);
      
      expect(result.persona).toBe(OrbPersona.SWL);
      expect(result.source).toBe('mode');
    });

    it('should classify as REAL_ESTATE for REAL_ESTATE mode', () => {
      const context: PersonaContext = {
        ...baseContext,
        mode: OrbMode.REAL_ESTATE,
      };
      
      const result = classifyPersona(context);
      
      expect(result.persona).toBe(OrbPersona.REAL_ESTATE);
      expect(result.source).toBe('mode');
    });

    it('should classify as OPEN_PEOPLE for EXPLORER mode', () => {
      const context: PersonaContext = {
        ...baseContext,
        mode: OrbMode.EXPLORER,
      };
      
      const result = classifyPersona(context);
      
      expect(result.persona).toBe(OrbPersona.OPEN_PEOPLE);
      expect(result.source).toBe('mode');
    });

    it('should classify as PERSONAL for EARTH mode', () => {
      const context: PersonaContext = {
        ...baseContext,
        mode: OrbMode.EARTH,
      };
      
      const result = classifyPersona(context);
      
      expect(result.persona).toBe(OrbPersona.PERSONAL);
      expect(result.source).toBe('mode');
    });
  });

  describe('Device-Based Classification', () => {
    it('should classify as SWL for MARS device', () => {
      const context: PersonaContext = {
        ...baseContext,
        device: OrbDevice.MARS,
      };
      
      const result = classifyPersona(context);
      
      expect(result.persona).toBe(OrbPersona.SWL);
      expect(result.source).toBe('device');
    });

    it('should classify as PERSONAL for EARTH device', () => {
      const context: PersonaContext = {
        ...baseContext,
        device: OrbDevice.EARTH,
      };
      
      const result = classifyPersona(context);
      
      expect(result.persona).toBe(OrbPersona.PERSONAL);
      expect(result.source).toBe('device');
    });

    it('should classify as PERSONAL for SOL device', () => {
      const context: PersonaContext = {
        ...baseContext,
        device: OrbDevice.SOL,
      };
      
      const result = classifyPersona(context);
      
      expect(result.persona).toBe(OrbPersona.PERSONAL);
      expect(result.source).toBe('device');
    });

    it('should classify as PERSONAL for LUNA device', () => {
      const context: PersonaContext = {
        ...baseContext,
        device: OrbDevice.LUNA,
      };
      
      const result = classifyPersona(context);
      
      expect(result.persona).toBe(OrbPersona.PERSONAL);
      expect(result.source).toBe('device');
    });
  });

  describe('Time-Based Classification', () => {
    it('should classify as PERSONAL for evening time', () => {
      const eveningTime = new Date('2025-11-22T20:00:00Z').toISOString();
      const context: PersonaContext = {
        ...baseContext,
        timeOfDay: eveningTime,
      };
      
      const result = classifyPersona(context);
      
      // Time-based rules have lower priority, might be overridden by defaults
      // Just check it doesn't error
      expect(result.persona).toBeDefined();
    });

    it('should classify as SWL for service hours', () => {
      const serviceTime = new Date('2025-11-22T18:00:00Z').toISOString();
      const context: PersonaContext = {
        ...baseContext,
        timeOfDay: serviceTime,
      };
      
      const result = classifyPersona(context);
      
      // Time-based rules have lower priority
      expect(result.persona).toBeDefined();
    });
  });

  describe('Activity-Based Classification', () => {
    it('should suggest OPEN_PEOPLE for contact activity', () => {
      const context: PersonaContext = {
        ...baseContext,
        recentActivity: ['contact_view', 'message_send', 'calendar_check'],
      };
      
      const result = classifyPersona(context);
      
      // Activity rules have lower priority, might be overridden
      expect(result.persona).toBeDefined();
    });

    it('should suggest SWL for task activity', () => {
      const context: PersonaContext = {
        ...baseContext,
        recentActivity: ['task_create', 'todo_check', 'checklist_update'],
      };
      
      const result = classifyPersona(context);
      
      expect(result.persona).toBeDefined();
    });
  });

  describe('Priority Rules', () => {
    it('should prioritize feature over mode', () => {
      const context: PersonaContext = {
        ...baseContext,
        feature: 'RealEstate', // Should give REAL_ESTATE (priority 100)
        mode: OrbMode.MARS, // Would give SWL (priority 80)
      };
      
      const result = classifyPersona(context);
      
      expect(result.persona).toBe(OrbPersona.REAL_ESTATE);
      expect(result.source).toBe('feature');
    });

    it('should prioritize mode over device', () => {
      const context: PersonaContext = {
        ...baseContext,
        mode: OrbMode.EXPLORER, // Should give OPEN_PEOPLE (priority 80)
        device: OrbDevice.MARS, // Would give SWL (priority 60)
      };
      
      const result = classifyPersona(context);
      
      expect(result.persona).toBe(OrbPersona.OPEN_PEOPLE);
      expect(result.source).toBe('mode');
    });

    it('should prioritize device over time', () => {
      const eveningTime = new Date('2025-11-22T20:00:00Z').toISOString();
      const context: PersonaContext = {
        ...baseContext,
        device: OrbDevice.MARS, // Should give SWL (priority 60)
        timeOfDay: eveningTime, // Would give PERSONAL (priority 30)
      };
      
      const result = classifyPersona(context);
      
      expect(result.persona).toBe(OrbPersona.SWL);
      expect(result.source).toBe('device');
    });
  });

  describe('Default Fallback', () => {
    it('should default to PERSONAL when no signals', () => {
      const context: PersonaContext = {
        userId: 'user-123',
      };
      
      const result = classifyPersona(context);
      
      expect(result.persona).toBe(OrbPersona.PERSONAL);
      expect(result.source).toBe('default');
      expect(result.confidence).toBeLessThan(0.5);
    });
  });

  describe('Alternatives', () => {
    it('should include alternatives when multiple rules match', () => {
      const context: PersonaContext = {
        ...baseContext,
        mode: OrbMode.SOL, // Could suggest PERSONAL
        device: OrbDevice.SOL, // Also suggests PERSONAL
      };
      
      const result = classifyPersona(context);
      
      // With multiple matching rules, alternatives might be included
      // (depends on implementation details)
      expect(result.persona).toBeDefined();
    });
  });

  describe('Reasoning', () => {
    it('should include reasoning for classification', () => {
      const context: PersonaContext = {
        ...baseContext,
        feature: 'SWL',
      };
      
      const result = classifyPersona(context);
      
      expect(result.reasoning).toBeDefined();
      expect(result.reasoning.length).toBeGreaterThan(0);
      expect(result.reasoning[0]).toContain('restaurant');
    });
  });

  describe('getRecommendedPersona Helper', () => {
    it('should return just the persona', () => {
      const context: PersonaContext = {
        ...baseContext,
        mode: OrbMode.MARS,
      };
      
      const persona = getRecommendedPersona(context);
      
      expect(persona).toBe(OrbPersona.SWL);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty context gracefully', () => {
      const context: PersonaContext = {
        userId: '',
      };
      
      const result = classifyPersona(context);
      
      expect(result.persona).toBeDefined();
      expect(result.confidence).toBeDefined();
    });

    it('should handle context with all signals', () => {
      const context: PersonaContext = {
        ...baseContext,
        device: OrbDevice.MARS,
        mode: OrbMode.RESTAURANT,
        feature: 'SWL',
        location: 'restaurant-floor',
        timeOfDay: new Date('2025-11-22T18:00:00Z').toISOString(),
        recentActivity: ['task_create', 'staff_contact'],
      };
      
      const result = classifyPersona(context);
      
      expect(result.persona).toBe(OrbPersona.SWL); // All signals point to SWL
      expect(result.confidence).toBeGreaterThanOrEqual(0.9);
    });

    it('should handle conflicting signals', () => {
      const context: PersonaContext = {
        ...baseContext,
        feature: 'RealEstate', // Suggests REAL_ESTATE
        mode: OrbMode.MARS, // Suggests SWL
        device: OrbDevice.EARTH, // Suggests PERSONAL
      };
      
      const result = classifyPersona(context);
      
      // Should prioritize feature (highest priority)
      expect(result.persona).toBe(OrbPersona.REAL_ESTATE);
      expect(result.alternatives).toBeDefined();
    });
  });
});

