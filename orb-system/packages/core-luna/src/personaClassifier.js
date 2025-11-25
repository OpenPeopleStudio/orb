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
import { OrbPersona, OrbMode, OrbDevice, } from '@orb-system/core-orb';
/**
 * In-Memory Persona Override Store
 */
class InMemoryPersonaOverrideStore {
    constructor() {
        this.overrides = new Map();
    }
    async getOverride(userId, sessionId) {
        const key = sessionId ? `${userId}:${sessionId}` : userId;
        return this.overrides.get(key) ?? null;
    }
    async setOverride(userId, persona, sessionId) {
        const key = sessionId ? `${userId}:${sessionId}` : userId;
        this.overrides.set(key, persona);
    }
    async clearOverride(userId, sessionId) {
        const key = sessionId ? `${userId}:${sessionId}` : userId;
        this.overrides.delete(key);
    }
}
/**
 * Rule-Based Persona Classifier
 *
 * Uses deterministic rules based on device, mode, feature, and other signals
 * to infer the active persona.
 */
export class RuleBasedPersonaClassifier {
    constructor(overrideStore) {
        this.overrideStore = overrideStore ?? new InMemoryPersonaOverrideStore();
    }
    /**
     * Classify persona based on context
     */
    async classifyPersona(context) {
        const signals = [];
        const distribution = {
            [OrbPersona.PERSONAL]: 0,
            [OrbPersona.SWL]: 0,
            [OrbPersona.REAL_ESTATE]: 0,
            [OrbPersona.OPEN_PEOPLE]: 0,
        };
        // Check for user override first
        let overridden = false;
        if (context.userId) {
            const override = context.userOverride ?? await this.overrideStore.getOverride(context.userId, context.sessionId);
            if (override) {
                signals.push(`User explicitly set persona to ${override}`);
                return {
                    persona: override,
                    confidence: 1.0,
                    distribution: {
                        [override]: 1.0,
                        ...Object.fromEntries(Object.values(OrbPersona)
                            .filter(p => p !== override)
                            .map(p => [p, 0])),
                    },
                    reasons: ['User override active'],
                    signals,
                    overridden: true,
                    classifiedAt: new Date(),
                };
            }
        }
        // Apply rules to build distribution
        const reasons = [];
        // Rule 1: Device hints
        if (context.deviceId) {
            const deviceWeight = this.applyDeviceRule(context.deviceId, distribution, signals);
            if (deviceWeight > 0) {
                reasons.push(`Device ${context.deviceId} suggests persona`);
            }
        }
        // Rule 2: Mode correlation
        if (context.currentMode) {
            const modeWeight = this.applyModeRule(context.currentMode, distribution, signals);
            if (modeWeight > 0) {
                reasons.push(`Mode ${context.currentMode} correlates with persona`);
            }
        }
        // Rule 3: Active feature/area
        if (context.activeFeature) {
            const featureWeight = this.applyFeatureRule(context.activeFeature, distribution, signals);
            if (featureWeight > 0) {
                reasons.push(`Active feature ${context.activeFeature} indicates persona`);
            }
        }
        // Rule 4: Time of day
        if (context.timeOfDay) {
            const timeWeight = this.applyTimeOfDayRule(context.timeOfDay, distribution, signals);
            if (timeWeight > 0) {
                reasons.push(`Time of day ${context.timeOfDay} suggests context`);
            }
        }
        // Rule 5: Location hint
        if (context.locationHint) {
            const locationWeight = this.applyLocationRule(context.locationHint, distribution, signals);
            if (locationWeight > 0) {
                reasons.push(`Location hint suggests persona`);
            }
        }
        // Normalize distribution
        const total = Object.values(distribution).reduce((sum, val) => sum + val, 0);
        if (total > 0) {
            for (const persona of Object.values(OrbPersona)) {
                distribution[persona] /= total;
            }
        }
        else {
            // No signals, uniform distribution
            for (const persona of Object.values(OrbPersona)) {
                distribution[persona] = 0.25;
            }
            reasons.push('No strong signals, defaulting to balanced distribution');
        }
        // Select persona with highest weight
        const entries = Object.entries(distribution);
        entries.sort((a, b) => b[1] - a[1]);
        const [topPersona, confidence] = entries[0];
        if (reasons.length === 0) {
            reasons.push(`Inferred ${topPersona} from available signals`);
        }
        return {
            persona: topPersona,
            confidence,
            distribution,
            reasons,
            signals,
            overridden,
            classifiedAt: new Date(),
        };
    }
    /**
     * Set explicit persona override
     */
    async setPersonaOverride(userId, persona, sessionId) {
        // Validate persona
        if (!Object.values(OrbPersona).includes(persona)) {
            throw new Error(`Invalid persona: ${persona}`);
        }
        await this.overrideStore.setOverride(userId, persona, sessionId);
    }
    /**
     * Get current persona override
     */
    async getPersonaOverride(userId, sessionId) {
        return await this.overrideStore.getOverride(userId, sessionId);
    }
    /**
     * Clear persona override
     */
    async clearPersonaOverride(userId, sessionId) {
        await this.overrideStore.clearOverride(userId, sessionId);
    }
    // --- Private rule methods ---
    /**
     * Apply device-based rules
     */
    applyDeviceRule(device, distribution, signals) {
        let weight = 0;
        switch (device) {
            case OrbDevice.MARS:
                // Mars device → SWL persona (restaurant operations)
                distribution[OrbPersona.SWL] += 3;
                signals.push('Mars device → SWL persona (operations)');
                weight = 3;
                break;
            case OrbDevice.EARTH:
                // Earth device → Personal or OpenPeople
                distribution[OrbPersona.PERSONAL] += 2;
                distribution[OrbPersona.OPEN_PEOPLE] += 2;
                signals.push('Earth device → Personal/OpenPeople personas');
                weight = 2;
                break;
            case OrbDevice.SOL:
                // Sol device → Personal (design/architecture work)
                distribution[OrbPersona.PERSONAL] += 2;
                signals.push('Sol device → Personal persona (creative work)');
                weight = 2;
                break;
            case OrbDevice.LUNA:
                // Luna device → Personal (forge/build work)
                distribution[OrbPersona.PERSONAL] += 1;
                signals.push('Luna device → Personal persona (build work)');
                weight = 1;
                break;
        }
        return weight;
    }
    /**
     * Apply mode-based rules
     */
    applyModeRule(mode, distribution, signals) {
        let weight = 0;
        switch (mode) {
            case OrbMode.MARS:
            case OrbMode.RESTAURANT:
                // Mars/Restaurant mode → SWL persona
                distribution[OrbPersona.SWL] += 4;
                signals.push(`${mode} mode → SWL persona`);
                weight = 4;
                break;
            case OrbMode.REAL_ESTATE:
                // Real Estate mode → RealEstate persona
                distribution[OrbPersona.REAL_ESTATE] += 4;
                signals.push('Real Estate mode → RealEstate persona');
                weight = 4;
                break;
            case OrbMode.EARTH:
                // Earth mode → Personal or OpenPeople
                distribution[OrbPersona.PERSONAL] += 2;
                distribution[OrbPersona.OPEN_PEOPLE] += 2;
                signals.push('Earth mode → Personal/OpenPeople personas');
                weight = 2;
                break;
            case OrbMode.SOL:
            case OrbMode.EXPLORER:
            case OrbMode.FORGE:
            case OrbMode.BUILDER:
                // Work modes → Personal
                distribution[OrbPersona.PERSONAL] += 2;
                signals.push(`${mode} mode → Personal persona (work context)`);
                weight = 2;
                break;
            case OrbMode.DEFAULT:
                // No strong signal from default mode
                break;
        }
        return weight;
    }
    /**
     * Apply feature-based rules
     */
    applyFeatureRule(feature, distribution, signals) {
        let weight = 0;
        const featureLower = feature.toLowerCase();
        // Direct feature → persona mappings
        if (featureLower.includes('swl') || featureLower.includes('restaurant') || featureLower.includes('laundry')) {
            distribution[OrbPersona.SWL] += 5;
            signals.push(`Feature "${feature}" → SWL persona`);
            weight = 5;
        }
        else if (featureLower.includes('real') && featureLower.includes('estate')) {
            distribution[OrbPersona.REAL_ESTATE] += 5;
            signals.push(`Feature "${feature}" → RealEstate persona`);
            weight = 5;
        }
        else if (featureLower.includes('open') && featureLower.includes('people')) {
            distribution[OrbPersona.OPEN_PEOPLE] += 5;
            signals.push(`Feature "${feature}" → OpenPeople persona`);
            weight = 5;
        }
        else if (featureLower.includes('personal') || featureLower.includes('design') || featureLower.includes('code')) {
            distribution[OrbPersona.PERSONAL] += 3;
            signals.push(`Feature "${feature}" → Personal persona`);
            weight = 3;
        }
        return weight;
    }
    /**
     * Apply time-of-day rules
     */
    applyTimeOfDayRule(timeOfDay, distribution, signals) {
        let weight = 0;
        switch (timeOfDay) {
            case 'morning':
                // Morning → slight bias toward Personal (planning/reflection)
                distribution[OrbPersona.PERSONAL] += 0.5;
                signals.push('Morning → slight Personal bias');
                weight = 0.5;
                break;
            case 'afternoon':
                // Afternoon → slight bias toward SWL (operations peak)
                distribution[OrbPersona.SWL] += 0.5;
                signals.push('Afternoon → slight SWL bias (operations)');
                weight = 0.5;
                break;
            case 'evening':
                // Evening → Personal or OpenPeople (wind down)
                distribution[OrbPersona.PERSONAL] += 1;
                distribution[OrbPersona.OPEN_PEOPLE] += 1;
                signals.push('Evening → Personal/OpenPeople bias');
                weight = 1;
                break;
            case 'night':
                // Night → OpenPeople (reflection, research)
                distribution[OrbPersona.OPEN_PEOPLE] += 1;
                signals.push('Night → OpenPeople bias (reflection)');
                weight = 1;
                break;
        }
        return weight;
    }
    /**
     * Apply location-based rules
     */
    applyLocationRule(location, distribution, signals) {
        let weight = 0;
        const locationLower = location.toLowerCase();
        if (locationLower.includes('restaurant') || locationLower.includes('work') || locationLower.includes('shop')) {
            distribution[OrbPersona.SWL] += 3;
            signals.push(`Location "${location}" → SWL persona`);
            weight = 3;
        }
        else if (locationLower.includes('home') || locationLower.includes('personal')) {
            distribution[OrbPersona.PERSONAL] += 2;
            signals.push(`Location "${location}" → Personal persona`);
            weight = 2;
        }
        else if (locationLower.includes('office') || locationLower.includes('studio')) {
            distribution[OrbPersona.PERSONAL] += 1;
            distribution[OrbPersona.REAL_ESTATE] += 1;
            signals.push(`Location "${location}" → work-related persona`);
            weight = 1;
        }
        return weight;
    }
}
/**
 * Default singleton instance
 */
let defaultClassifier = null;
/**
 * Get or create the default persona classifier
 */
export function getPersonaClassifier() {
    if (!defaultClassifier) {
        defaultClassifier = new RuleBasedPersonaClassifier();
    }
    return defaultClassifier;
}
/**
 * Helper function for classifying persona with default classifier
 */
export async function classifyPersona(context) {
    const classifier = getPersonaClassifier();
    return await classifier.classifyPersona(context);
}
//# sourceMappingURL=personaClassifier.js.map