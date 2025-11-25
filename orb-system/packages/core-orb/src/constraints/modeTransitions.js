/**
 * Mode Transitions
 *
 * Logic for validating and executing mode transitions.
 * Ensures transitions respect constraints and contextual rules.
 */
import { OrbMode, ORB_MODE_DESCRIPTORS } from '../identity/types';
/**
 * Validate a mode transition request
 *
 * Checks if transitioning from one mode to another is allowed
 * based on context and constraints.
 */
export function validateModeTransition(request, constraintSets) {
    const { fromMode, toMode, context, reason, forced } = request;
    const timestamp = new Date().toISOString();
    // If forced, allow the transition (for emergency overrides)
    if (forced) {
        return {
            allowed: true,
            fromMode,
            toMode,
            reasons: ['Transition forced by user override'],
            triggeredConstraints: [],
            timestamp,
        };
    }
    const triggeredConstraints = [];
    const reasons = [];
    const recommendations = [];
    // Check if transition is to the same mode (always allowed)
    if (fromMode === toMode) {
        return {
            allowed: true,
            fromMode,
            toMode,
            reasons: ['No transition needed (same mode)'],
            triggeredConstraints: [],
            timestamp,
        };
    }
    // Check device compatibility
    const toModeDescriptor = ORB_MODE_DESCRIPTORS[toMode];
    if (context.device && !toModeDescriptor.defaultDevices.includes(context.device)) {
        reasons.push(`Mode ${toMode} is not typically used on device ${context.device}`);
        recommendations.push(`${toMode} is optimized for: ${toModeDescriptor.defaultDevices.join(', ')}`);
    }
    // Check persona compatibility
    if (!toModeDescriptor.defaultPersonas.includes(context.persona)) {
        reasons.push(`Mode ${toMode} is not typically used with persona ${context.persona}`);
        recommendations.push(`${toMode} is optimized for: ${toModeDescriptor.defaultPersonas.join(', ')}`);
    }
    // Evaluate mode transition constraints
    for (const constraintSet of constraintSets) {
        for (const constraint of constraintSet.constraints) {
            if (!constraint.active)
                continue;
            // Only check mode_transition constraints
            if (constraint.type !== 'mode_transition')
                continue;
            // Check if constraint applies to the current mode
            if (constraint.appliesToModes && !constraint.appliesToModes.includes(fromMode)) {
                continue;
            }
            // Check if target mode is in allowed list
            if (constraint.allowedModes && !constraint.allowedModes.includes(toMode)) {
                triggeredConstraints.push({
                    constraintId: constraint.id,
                    constraintType: constraint.type,
                    severity: constraint.severity,
                    reason: constraint.reason || `Transition to ${toMode} not allowed from ${fromMode}`,
                });
                reasons.push(constraint.reason || `Transition to ${toMode} is restricted by constraint ${constraint.id}`);
                recommendations.push(`Allowed transitions from ${fromMode}: ${constraint.allowedModes.join(', ')}`);
            }
        }
    }
    // Determine if transition is allowed
    const hasHardBlocks = triggeredConstraints.some(tc => tc.severity === 'critical' || tc.severity === 'error');
    const allowed = !hasHardBlocks;
    if (allowed && reasons.length === 0) {
        reasons.push(`Transition from ${fromMode} to ${toMode} allowed`);
        if (reason) {
            reasons.push(`Reason: ${reason}`);
        }
    }
    return {
        allowed,
        fromMode,
        toMode,
        reasons,
        triggeredConstraints,
        recommendations: recommendations.length > 0 ? recommendations : undefined,
        timestamp,
    };
}
/**
 * Check if a mode transition is allowed
 *
 * Simpler API that returns a boolean.
 */
export function canTransitionMode(fromMode, toMode, context, constraintSets = []) {
    const request = {
        fromMode,
        toMode,
        context,
    };
    const result = validateModeTransition(request, constraintSets);
    return result.allowed;
}
/**
 * Get common denial reasons for mode transitions
 *
 * Provides user-friendly explanations for why a transition might be blocked.
 */
export function getModeTransitionDenialReasons() {
    return {
        'persona-mismatch': 'Your current persona is not compatible with the target mode',
        'device-restriction': 'The target mode is not available on your current device',
        'hard-constraint': 'A system constraint prevents this transition',
        'time-restriction': 'Mode transitions are restricted at this time',
        'unsafe-context': 'Current system state makes this transition unsafe',
    };
}
/**
 * Get recommended mode based on context
 *
 * TODO: PERSONA_AGENT - Integrate with persona classification
 */
export function getRecommendedMode(context) {
    // Simple heuristic based on device and persona
    // This should be enhanced by persona classification logic
    const { device, persona } = context;
    // Device-based defaults
    if (device) {
        const deviceToMode = {
            sol: OrbMode.SOL,
            luna: OrbMode.FORGE,
            mars: OrbMode.MARS,
            earth: OrbMode.EARTH,
        };
        if (deviceToMode[device]) {
            return deviceToMode[device];
        }
    }
    // Persona-based defaults
    const personaToMode = {
        personal: OrbMode.SOL,
        swl: OrbMode.MARS,
        real_estate: OrbMode.REAL_ESTATE,
        open_people: OrbMode.EXPLORER,
    };
    if (personaToMode[persona]) {
        return personaToMode[persona];
    }
    // Fallback to default
    return OrbMode.DEFAULT;
}
//# sourceMappingURL=modeTransitions.js.map