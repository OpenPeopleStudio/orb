/**
 * Constraint Evaluator Implementation
 *
 * Role: OrbRole.LUNA (preferences/intent)
 *
 * Implements the IConstraintEvaluator interface for evaluating actions
 * and mode transitions against user-defined and system constraints.
 */
/**
 * Default Constraint Evaluator
 *
 * Evaluates actions and mode transitions against constraint sets.
 */
export class DefaultConstraintEvaluator {
    constructor(store) {
        this.store = store;
    }
    /**
     * Evaluate an action against all relevant constraints
     */
    async evaluateAction(context, constraintSets) {
        const startTime = Date.now();
        // Get constraint sets if not provided
        const sets = constraintSets ?? await this.store.getConstraintSets(context.userId, context.currentMode, context.currentPersona);
        // Collect all active constraints
        const activeConstraints = this.collectActiveConstraints(sets, context);
        // Evaluate each constraint
        const triggeredConstraints = [];
        const reasons = [];
        const riskFactors = [];
        let decision = 'allow';
        let effectiveRisk = context.estimatedRisk ?? 'low';
        for (const constraint of activeConstraints) {
            const evaluation = this.evaluateSingleConstraint(constraint, context);
            if (evaluation.triggered) {
                triggeredConstraints.push({
                    constraintId: constraint.id,
                    constraintType: constraint.type,
                    severity: constraint.severity,
                    reason: evaluation.reason,
                });
                reasons.push(evaluation.reason);
                if (evaluation.riskFactor) {
                    riskFactors.push(evaluation.riskFactor);
                }
                // Determine decision based on severity
                if (constraint.severity === 'hard') {
                    decision = 'deny';
                }
                else if (decision !== 'deny' && constraint.type === 'require_confirmation') {
                    decision = 'require_confirmation';
                }
            }
        }
        // If no constraints triggered, allow
        if (triggeredConstraints.length === 0) {
            reasons.push('No constraints triggered');
            decision = 'allow';
        }
        // Assess effective risk
        if (riskFactors.length > 0) {
            effectiveRisk = this.assessEffectiveRisk(context.estimatedRisk ?? 'low', riskFactors.length);
        }
        return {
            allowed: decision === 'allow',
            decision,
            reasons,
            triggeredConstraints,
            effectiveRisk,
            riskFactors,
            evaluatedAt: new Date(),
            evaluationDurationMs: Date.now() - startTime,
        };
    }
    /**
     * Validate a mode transition
     */
    async validateModeTransition(context) {
        const startTime = Date.now();
        // Get constraint sets for both modes
        const fromSets = await this.store.getConstraintSets(context.userId, context.fromMode, context.persona);
        const toSets = await this.store.getConstraintSets(context.userId, context.toMode, context.persona);
        // Check for block_mode constraints
        const blockedBy = [];
        for (const set of fromSets) {
            for (const constraint of set.constraints) {
                if (!constraint.active)
                    continue;
                if (constraint.type === 'block_mode' && constraint.blockedModes?.includes(context.toMode)) {
                    blockedBy.push({
                        constraintId: constraint.id,
                        reason: constraint.description || `Transition to ${context.toMode} is blocked`,
                    });
                }
            }
        }
        // Check persona compatibility with target mode
        if (context.persona) {
            const personaCompatible = this.checkPersonaModeCompatibility(context.persona, context.toMode);
            if (!personaCompatible.compatible) {
                blockedBy.push({
                    constraintId: 'system:persona-mode-mismatch',
                    reason: personaCompatible.reason,
                });
            }
        }
        // Check device compatibility
        if (context.deviceId) {
            const deviceCompatible = this.checkDeviceModeCompatibility(context.deviceId, context.toMode);
            if (!deviceCompatible.compatible) {
                blockedBy.push({
                    constraintId: 'system:device-mode-mismatch',
                    reason: deviceCompatible.reason,
                });
            }
        }
        const success = blockedBy.length === 0;
        // Collect constraints that will be active in new mode
        const appliedConstraints = success ? toSets.flatMap(set => set.constraints.filter(c => c.active).map(c => c.id)) : undefined;
        return {
            success,
            fromMode: context.fromMode,
            toMode: context.toMode,
            blockedBy: success ? undefined : blockedBy,
            appliedConstraints,
            message: success
                ? `Mode transition from ${context.fromMode} to ${context.toMode} allowed`
                : `Mode transition blocked by ${blockedBy.length} constraint(s)`,
            timestamp: new Date(),
        };
    }
    /**
     * Get all active constraints for a given context
     */
    async getActiveConstraints(userId, mode, persona) {
        const sets = await this.store.getConstraintSets(userId, mode, persona);
        return sets.flatMap(set => set.constraints.filter(c => c.active));
    }
    // --- Private helper methods ---
    /**
     * Collect active constraints from sets, filtering by applicability
     */
    collectActiveConstraints(sets, context) {
        const constraints = [];
        for (const set of sets) {
            // Check if set applies to this context
            if (set.appliesTo.modes && !set.appliesTo.modes.includes(context.currentMode)) {
                continue;
            }
            if (set.appliesTo.personas && context.currentPersona && !set.appliesTo.personas.includes(context.currentPersona)) {
                continue;
            }
            if (set.appliesTo.devices && context.deviceId && !set.appliesTo.devices.includes(context.deviceId)) {
                continue;
            }
            if (set.appliesTo.roles && !set.appliesTo.roles.includes(context.actionRole)) {
                continue;
            }
            // Add active constraints from this set
            constraints.push(...set.constraints.filter(c => c.active));
        }
        return constraints;
    }
    /**
     * Evaluate a single constraint against an action context
     */
    evaluateSingleConstraint(constraint, context) {
        switch (constraint.type) {
            case 'block_tool':
                if (constraint.toolId && context.toolId === constraint.toolId) {
                    return {
                        triggered: true,
                        reason: `Tool ${context.toolId} is blocked by constraint ${constraint.id}`,
                        riskFactor: 'blocked_tool',
                    };
                }
                break;
            case 'max_risk':
                if (constraint.maxRisk && context.estimatedRisk) {
                    const allowed = this.isRiskAllowed(context.estimatedRisk, constraint.maxRisk);
                    if (!allowed) {
                        return {
                            triggered: true,
                            reason: `Action risk (${context.estimatedRisk}) exceeds maximum (${constraint.maxRisk})`,
                            riskFactor: 'risk_exceeded',
                        };
                    }
                }
                break;
            case 'require_confirmation':
                return {
                    triggered: true,
                    reason: constraint.description || 'Action requires user confirmation',
                };
            case 'role_restriction':
                if (constraint.appliesToRoles && !constraint.appliesToRoles.includes(context.actionRole)) {
                    return {
                        triggered: false,
                        reason: '',
                    };
                }
                break;
            case 'device_restriction':
                if (constraint.allowedDevices && context.deviceId && !constraint.allowedDevices.includes(context.deviceId)) {
                    return {
                        triggered: true,
                        reason: `Action not allowed on device ${context.deviceId}`,
                        riskFactor: 'device_mismatch',
                    };
                }
                break;
            case 'time_window':
                if (constraint.timeWindow) {
                    const inWindow = this.isInTimeWindow(constraint.timeWindow, context.timestamp);
                    if (!inWindow) {
                        return {
                            triggered: true,
                            reason: `Action only allowed during ${constraint.timeWindow.start} - ${constraint.timeWindow.end}`,
                            riskFactor: 'outside_time_window',
                        };
                    }
                }
                break;
        }
        return { triggered: false, reason: '' };
    }
    /**
     * Check if an action's risk level is within allowed limits
     */
    isRiskAllowed(actionRisk, maxRisk) {
        const riskLevels = ['low', 'medium', 'high', 'critical'];
        const actionIndex = riskLevels.indexOf(actionRisk);
        const maxIndex = riskLevels.indexOf(maxRisk);
        return actionIndex <= maxIndex;
    }
    /**
     * Check if current time is within allowed window
     */
    isInTimeWindow(window, timestamp) {
        const now = timestamp ?? new Date();
        const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
        return currentTime >= window.start && currentTime <= window.end;
    }
    /**
     * Assess effective risk based on base risk and number of risk factors
     */
    assessEffectiveRisk(baseRisk, factorCount) {
        const riskLevels = ['low', 'medium', 'high', 'critical'];
        const baseIndex = riskLevels.indexOf(baseRisk);
        const newIndex = Math.min(baseIndex + Math.floor(factorCount / 2), riskLevels.length - 1);
        return riskLevels[newIndex];
    }
    /**
     * Check persona-mode compatibility
     */
    checkPersonaModeCompatibility(persona, mode) {
        // Import mode descriptors to check compatibility
        // For now, use simple rules based on SomaOS mappings
        // Mars mode strongly prefers SWL persona
        if (mode === 'mars' && persona !== 'swl') {
            return {
                compatible: false,
                reason: 'Mars mode is optimized for SWL persona (restaurant operations)',
            };
        }
        // Earth mode prefers Personal or OpenPeople
        if (mode === 'earth' && persona !== 'personal' && persona !== 'open_people') {
            return {
                compatible: false,
                reason: 'Earth mode is optimized for Personal or OpenPeople personas',
            };
        }
        // Real Estate mode requires real_estate persona
        if (mode === 'real_estate' && persona !== 'real_estate') {
            return {
                compatible: false,
                reason: 'Real Estate mode requires real_estate persona',
            };
        }
        return { compatible: true, reason: '' };
    }
    /**
     * Check device-mode compatibility
     */
    checkDeviceModeCompatibility(device, mode) {
        // Forge mode primarily for Luna device
        if (mode === 'forge' && device !== 'luna') {
            return {
                compatible: false,
                reason: 'Forge mode is primarily intended for Luna device',
            };
        }
        // Mars mode primarily for Mars device
        if (mode === 'mars' && device !== 'mars') {
            return {
                compatible: false,
                reason: 'Mars mode is optimized for Mars device',
            };
        }
        return { compatible: true, reason: '' };
    }
}
/**
 * Helper function for creating an evaluator with default store
 */
export async function createConstraintEvaluator(store) {
    return new DefaultConstraintEvaluator(store);
}
//# sourceMappingURL=constraintEvaluator.js.map