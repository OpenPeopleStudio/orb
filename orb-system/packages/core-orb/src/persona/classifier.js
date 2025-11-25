/**
 * Persona Classifier
 *
 * Rules-based persona classification from context.
 * Transparent, deterministic, and easily overridable.
 */
import { OrbPersona, OrbDevice, OrbMode } from '../identity/types';
const personaOverrides = new Map();
function getOverrideForContext(context) {
    if (!context.userId) {
        return null;
    }
    return personaOverrides.get(context.userId) ?? null;
}
/**
 * Classify persona based on context
 *
 * Returns the best-matching persona with confidence and reasoning.
 */
export function classifyPersona(context) {
    const override = getOverrideForContext(context);
    if (override) {
        return {
            persona: override,
            confidence: 1,
            source: 'override',
            reasoning: ['User override is active'],
        };
    }
    // Check for explicit persona (highest priority)
    if (context.explicitPersona) {
        return {
            persona: context.explicitPersona,
            confidence: 1.0,
            source: 'explicit',
            reasoning: ['User explicitly selected this persona'],
        };
    }
    // Evaluate all rules
    const rules = getPersonaRules();
    const matchedRules = rules
        .filter(rule => rule.applies(context))
        .sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0));
    // If no rules matched, return default
    if (matchedRules.length === 0) {
        return {
            persona: OrbPersona.PERSONAL,
            confidence: 0.3,
            source: 'default',
            reasoning: ['No specific signals detected, defaulting to Personal persona'],
        };
    }
    // Take the highest priority rule
    const topRule = matchedRules[0];
    const reasoning = topRule.reasoning ? [topRule.reasoning] : [];
    // Collect alternatives
    const alternatives = matchedRules
        .slice(1, 4) // Top 3 alternatives
        .map(rule => ({
        persona: rule.persona,
        confidence: rule.confidence,
    }));
    return {
        persona: topRule.persona,
        confidence: topRule.confidence,
        source: inferSource(topRule, context),
        reasoning,
        alternatives: alternatives.length > 0 ? alternatives : undefined,
    };
}
/**
 * Get persona rules
 *
 * Ordered by priority (highest first).
 * Higher priority rules override lower priority rules when multiple match.
 */
function getPersonaRules() {
    return [
        // Feature-based rules (highest priority - very specific signals)
        {
            id: 'feature-swl',
            priority: 100,
            applies: (ctx) => ctx.feature === 'SWL' || ctx.feature === 'restaurant',
            persona: OrbPersona.SWL,
            confidence: 0.95,
            reasoning: 'Feature context indicates restaurant/SWL operations',
        },
        {
            id: 'feature-real-estate',
            priority: 100,
            applies: (ctx) => ctx.feature === 'RealEstate' || ctx.feature === 'deals',
            persona: OrbPersona.REAL_ESTATE,
            confidence: 0.95,
            reasoning: 'Feature context indicates real estate operations',
        },
        // Mode-based rules (high priority - strong signals)
        {
            id: 'mode-restaurant',
            priority: 90,
            applies: (ctx) => ctx.mode === OrbMode.RESTAURANT,
            persona: OrbPersona.SWL,
            confidence: 0.9,
            reasoning: 'Restaurant mode indicates SWL operations',
        },
        {
            id: 'mode-mars',
            priority: 80,
            applies: (ctx) => ctx.mode === OrbMode.MARS,
            persona: OrbPersona.SWL,
            confidence: 0.85,
            reasoning: 'Mars mode typically used for operational work (SWL)',
        },
        {
            id: 'mode-real-estate',
            priority: 90,
            applies: (ctx) => ctx.mode === OrbMode.REAL_ESTATE,
            persona: OrbPersona.REAL_ESTATE,
            confidence: 0.9,
            reasoning: 'Real Estate mode indicates real estate operations',
        },
        {
            id: 'mode-explorer',
            priority: 80,
            applies: (ctx) => ctx.mode === OrbMode.EXPLORER,
            persona: OrbPersona.OPEN_PEOPLE,
            confidence: 0.85,
            reasoning: 'Explorer mode indicates research/knowledge work',
        },
        {
            id: 'mode-earth',
            priority: 70,
            applies: (ctx) => ctx.mode === OrbMode.EARTH,
            persona: OrbPersona.PERSONAL,
            confidence: 0.8,
            reasoning: 'Earth mode indicates personal/life context',
        },
        // Device-based rules (medium priority - decent signals)
        {
            id: 'device-mars',
            priority: 60,
            applies: (ctx) => ctx.device === OrbDevice.MARS,
            persona: OrbPersona.SWL,
            confidence: 0.75,
            reasoning: 'Mars device typically used for restaurant operations',
        },
        {
            id: 'device-earth',
            priority: 60,
            applies: (ctx) => ctx.device === OrbDevice.EARTH,
            persona: OrbPersona.PERSONAL,
            confidence: 0.7,
            reasoning: 'Earth device typically used for personal context',
        },
        {
            id: 'device-sol',
            priority: 50,
            applies: (ctx) => ctx.device === OrbDevice.SOL || ctx.device === OrbDevice.LUNA,
            persona: OrbPersona.PERSONAL,
            confidence: 0.65,
            reasoning: 'Sol/Luna devices typically used for design/development work',
        },
        // Time-based rules (low priority - weak signals)
        {
            id: 'time-evening',
            priority: 30,
            applies: (ctx) => {
                if (!ctx.timeOfDay)
                    return false;
                const hour = new Date(ctx.timeOfDay).getHours();
                return hour >= 18 || hour < 6;
            },
            persona: OrbPersona.PERSONAL,
            confidence: 0.5,
            reasoning: 'Evening/night time suggests personal context',
        },
        {
            id: 'time-service-hours',
            priority: 30,
            applies: (ctx) => {
                if (!ctx.timeOfDay)
                    return false;
                const hour = new Date(ctx.timeOfDay).getHours();
                return (hour >= 11 && hour <= 14) || (hour >= 17 && hour <= 21);
            },
            persona: OrbPersona.SWL,
            confidence: 0.45,
            reasoning: 'Service hours suggest potential restaurant operations',
        },
        // Activity-based rules (low priority - context-dependent)
        {
            id: 'activity-contacts',
            priority: 40,
            applies: (ctx) => ctx.recentActivity?.some(a => a.includes('contact') || a.includes('message') || a.includes('calendar')) || false,
            persona: OrbPersona.OPEN_PEOPLE,
            confidence: 0.6,
            reasoning: 'Recent contact/messaging activity suggests relationship-focused work',
        },
        {
            id: 'activity-tasks',
            priority: 40,
            applies: (ctx) => ctx.recentActivity?.some(a => a.includes('task') || a.includes('todo') || a.includes('checklist')) || false,
            persona: OrbPersona.SWL,
            confidence: 0.55,
            reasoning: 'Task-focused activity suggests operational work',
        },
    ];
}
/**
 * Infer the source of classification from the rule
 */
function inferSource(rule, context) {
    if (rule.id.startsWith('feature-'))
        return 'feature';
    if (rule.id.startsWith('mode-'))
        return 'mode';
    if (rule.id.startsWith('device-'))
        return 'device';
    if (rule.id.startsWith('time-'))
        return 'time';
    if (rule.id.startsWith('activity-'))
        return 'activity';
    return 'default';
}
/**
 * Get recommended persona for a context
 *
 * Convenience function that returns just the persona.
 */
export function getRecommendedPersona(context) {
    const result = classifyPersona(context);
    return result.persona;
}
/**
 * Set or clear a persona override for a user.
 */
export function setPersonaOverride(userId, persona) {
    if (!userId) {
        return;
    }
    if (persona) {
        personaOverrides.set(userId, persona);
    }
    else {
        personaOverrides.delete(userId);
    }
}
/**
 * Get the active persona override for a user, if one exists.
 */
export function getPersonaOverride(userId) {
    if (!userId) {
        return null;
    }
    return personaOverrides.get(userId) ?? null;
}
/**
 * Clear any persona override for the provided user.
 */
export function clearPersonaOverride(userId) {
    if (!userId) {
        return;
    }
    personaOverrides.delete(userId);
}
/**
 * Override persona classification
 *
 * Store a user's explicit persona choice for future classification.
 *
 * TODO: Persistence - this should be stored in a preferences store
 */
export function setExplicitPersona(userId, persona) {
    // In a real implementation, this would save to a preferences store
    console.log(`[Persona] User ${userId} explicitly set persona to ${persona}`);
    // For now, this is just a placeholder
}
//# sourceMappingURL=classifier.js.map