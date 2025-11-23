/**
 * Persona Classification
 * 
 * Rule-based persona classification with explicit overrides.
 * Uses context (device, mode, feature, stream) to infer active persona.
 */

import {
  OrbPersona,
  OrbDevice,
  OrbMode,
  type PersonaContext,
  type PersonaClassificationResult,
} from '@orb-system/core-orb';

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
 * Default persona classification rules
 * These are deterministic rules based on context signals
 */
const DEFAULT_RULES: PersonaRule[] = [
  // Device-based rules
  {
    id: 'device-mars-swl',
    weight: 10,
    matcher: (ctx) => ctx.deviceId === OrbDevice.MARS,
    persona: OrbPersona.SWL,
    reason: 'Mars device typically used for SWL work',
  },
  {
    id: 'device-earth-personal',
    weight: 8,
    matcher: (ctx) => ctx.deviceId === OrbDevice.EARTH,
    persona: OrbPersona.PERSONAL,
    reason: 'Earth device typically used for personal life',
  },
  {
    id: 'device-sol-work',
    weight: 7,
    matcher: (ctx) => ctx.deviceId === OrbDevice.SOL,
    persona: OrbPersona.OPEN_PEOPLE,
    reason: 'Sol device typically used for professional work',
  },
  
  // Mode-based rules
  {
    id: 'mode-restaurant',
    weight: 10,
    matcher: (ctx) => ctx.mode === OrbMode.RESTAURANT,
    persona: OrbPersona.SWL,
    reason: 'Restaurant mode indicates SWL work',
  },
  {
    id: 'mode-real-estate',
    weight: 10,
    matcher: (ctx) => ctx.mode === OrbMode.REAL_ESTATE,
    persona: OrbPersona.REAL_ESTATE,
    reason: 'Real estate mode indicates real estate work',
  },
  {
    id: 'mode-earth',
    weight: 9,
    matcher: (ctx) => ctx.mode === OrbMode.EARTH,
    persona: OrbPersona.PERSONAL,
    reason: 'Earth mode indicates personal context',
  },
  {
    id: 'mode-mars',
    weight: 8,
    matcher: (ctx) => ctx.mode === OrbMode.MARS,
    persona: OrbPersona.SWL,
    reason: 'Mars mode indicates work focus',
  },
  {
    id: 'mode-forge',
    weight: 7,
    matcher: (ctx) => ctx.mode === OrbMode.FORGE,
    persona: OrbPersona.OPEN_PEOPLE,
    reason: 'Forge mode indicates professional development',
  },
  
  // Feature-based rules
  {
    id: 'feature-swl',
    weight: 10,
    matcher: (ctx) => 
      ctx.feature?.toLowerCase().includes('snow white laundry') ||
      ctx.feature?.toLowerCase().includes('swl') ||
      ctx.feature?.toLowerCase().includes('restaurant'),
    persona: OrbPersona.SWL,
    reason: 'Feature indicates SWL business context',
  },
  {
    id: 'feature-real-estate',
    weight: 10,
    matcher: (ctx) =>
      ctx.feature?.toLowerCase().includes('real estate') ||
      ctx.feature?.toLowerCase().includes('property') ||
      ctx.feature?.toLowerCase().includes('listing'),
    persona: OrbPersona.REAL_ESTATE,
    reason: 'Feature indicates real estate context',
  },
  {
    id: 'feature-personal',
    weight: 9,
    matcher: (ctx) =>
      ctx.feature?.toLowerCase().includes('personal') ||
      ctx.feature?.toLowerCase().includes('family') ||
      ctx.feature?.toLowerCase().includes('friend'),
    persona: OrbPersona.PERSONAL,
    reason: 'Feature indicates personal context',
  },
  
  // Event type rules
  {
    id: 'event-calendar-work',
    weight: 6,
    matcher: (ctx) =>
      ctx.eventType === 'calendar_event' &&
      (ctx.mode === OrbMode.MARS || ctx.mode === OrbMode.SOL),
    persona: OrbPersona.SWL,
    reason: 'Work calendar event in work mode',
  },
  {
    id: 'event-message-personal',
    weight: 5,
    matcher: (ctx) =>
      ctx.eventType === 'message' &&
      ctx.mode === OrbMode.EARTH,
    persona: OrbPersona.PERSONAL,
    reason: 'Message in personal mode',
  },
];

/**
 * Classify persona based on context using rule-based matching
 */
export function classifyPersona(
  context: PersonaContext,
  customRules: PersonaRule[] = []
): PersonaClassificationResult {
  // If explicit persona is set, use it
  if (context.explicitPersona) {
    return {
      persona: context.explicitPersona,
      confidence: 1.0,
      reasons: ['Explicitly set by user'],
      source: 'explicit',
    };
  }
  
  // Check recent persona history (sticky behavior)
  if (context.recentPersonas && context.recentPersonas.length > 0) {
    const mostRecent = context.recentPersonas[0];
    const recencySeconds = (Date.now() - new Date(mostRecent.timestamp).getTime()) / 1000;
    
    // If recent persona is less than 5 minutes old, stick with it
    if (recencySeconds < 300) {
      return {
        persona: mostRecent.persona,
        confidence: 0.9,
        reasons: ['Recently active persona (sticky behavior)'],
        source: 'inferred',
      };
    }
  }
  
  // Apply all rules and collect scores
  const allRules = [...DEFAULT_RULES, ...customRules];
  const scores: Record<OrbPersona, number> = {
    [OrbPersona.PERSONAL]: 0,
    [OrbPersona.SWL]: 0,
    [OrbPersona.REAL_ESTATE]: 0,
    [OrbPersona.OPEN_PEOPLE]: 0,
  };
  const matchedReasons: string[] = [];
  
  for (const rule of allRules) {
    if (rule.matcher(context)) {
      scores[rule.persona] += rule.weight;
      matchedReasons.push(rule.reason);
    }
  }
  
  // Calculate distribution
  const totalScore = Object.values(scores).reduce((sum, score) => sum + score, 0);
  const distribution: Record<OrbPersona, number> = {
    [OrbPersona.PERSONAL]: totalScore > 0 ? scores[OrbPersona.PERSONAL] / totalScore : 0.25,
    [OrbPersona.SWL]: totalScore > 0 ? scores[OrbPersona.SWL] / totalScore : 0.25,
    [OrbPersona.REAL_ESTATE]: totalScore > 0 ? scores[OrbPersona.REAL_ESTATE] / totalScore : 0.25,
    [OrbPersona.OPEN_PEOPLE]: totalScore > 0 ? scores[OrbPersona.OPEN_PEOPLE] / totalScore : 0.25,
  };
  
  // Find highest scoring persona
  let maxPersona = OrbPersona.PERSONAL;
  let maxScore = scores[OrbPersona.PERSONAL];
  
  for (const [persona, score] of Object.entries(scores)) {
    if (score > maxScore) {
      maxScore = score;
      maxPersona = persona as OrbPersona;
    }
  }
  
  // If no rules matched, use default (PERSONAL)
  if (matchedReasons.length === 0) {
    return {
      persona: OrbPersona.PERSONAL,
      confidence: 0.25,
      reasons: ['No context signals available, using default'],
      distribution,
      source: 'default',
    };
  }
  
  // Calculate confidence based on score difference
  const secondHighest = Math.max(
    ...Object.entries(scores)
      .filter(([p]) => p !== maxPersona)
      .map(([, s]) => s)
  );
  const confidence = totalScore > 0 
    ? Math.min(1.0, (maxScore - secondHighest) / totalScore + 0.5)
    : 0.5;
  
  return {
    persona: maxPersona,
    confidence,
    reasons: matchedReasons,
    distribution,
    source: 'inferred',
  };
}

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
  expiresAt?: string; // ISO timestamp
  createdAt: string;
}

/**
 * In-memory persona override store
 */
class PersonaOverrideStore {
  private overrides = new Map<string, PersonaOverride[]>();
  
  setOverride(override: PersonaOverride): void {
    const userOverrides = this.overrides.get(override.userId) || [];
    
    // Remove existing override with same context
    const filtered = userOverrides.filter(o => {
      if (override.context) {
        return !(
          o.context?.deviceId === override.context.deviceId &&
          o.context?.mode === override.context.mode &&
          o.context?.feature === override.context.feature
        );
      }
      return true;
    });
    
    filtered.push(override);
    this.overrides.set(override.userId, filtered);
  }
  
  getOverride(userId: string, context: PersonaContext): PersonaOverride | null {
    const userOverrides = this.overrides.get(userId);
    if (!userOverrides) return null;
    
    const now = new Date().toISOString();
    
    // Find matching override
    for (const override of userOverrides) {
      // Check if expired
      if (override.expiresAt && override.expiresAt < now) {
        continue;
      }
      
      // Check context match
      if (override.context) {
        const matches =
          (!override.context.deviceId || override.context.deviceId === context.deviceId) &&
          (!override.context.mode || override.context.mode === context.mode) &&
          (!override.context.feature || override.context.feature === context.feature);
        
        if (matches) return override;
      } else {
        // Global override
        return override;
      }
    }
    
    return null;
  }
  
  clearOverride(userId: string, context?: PersonaContext): void {
    if (!context) {
      this.overrides.delete(userId);
      return;
    }
    
    const userOverrides = this.overrides.get(userId);
    if (!userOverrides) return;
    
    const filtered = userOverrides.filter(o => {
      if (!o.context) return true;
      
      return !(
        o.context.deviceId === context.deviceId &&
        o.context.mode === context.mode &&
        o.context.feature === context.feature
      );
    });
    
    this.overrides.set(userId, filtered);
  }
}

/**
 * Global persona override store
 */
const personaOverrideStore = new PersonaOverrideStore();

/**
 * Set a persona override for a user
 */
export function setPersonaOverride(
  userId: string,
  persona: OrbPersona,
  options?: {
    context?: {
      deviceId?: OrbDevice;
      mode?: OrbMode;
      feature?: string;
    };
    expiresAt?: string;
  }
): void {
  personaOverrideStore.setOverride({
    userId,
    persona,
    context: options?.context,
    expiresAt: options?.expiresAt,
    createdAt: new Date().toISOString(),
  });
}

/**
 * Get persona override for a user in a given context
 */
export function getPersonaOverride(
  userId: string,
  context: PersonaContext
): PersonaOverride | null {
  return personaOverrideStore.getOverride(userId, context);
}

/**
 * Clear persona override for a user
 */
export function clearPersonaOverride(
  userId: string,
  context?: PersonaContext
): void {
  personaOverrideStore.clearOverride(userId, context);
}

/**
 * Classify persona with override support
 */
export function classifyPersonaWithOverrides(
  userId: string,
  context: PersonaContext,
  customRules: PersonaRule[] = []
): PersonaClassificationResult {
  // Check for override first
  const override = getPersonaOverride(userId, context);
  if (override) {
    return {
      persona: override.persona,
      confidence: 1.0,
      reasons: ['User override active'],
      source: 'explicit',
    };
  }
  
  // Otherwise, use rule-based classification
  return classifyPersona(context, customRules);
}

