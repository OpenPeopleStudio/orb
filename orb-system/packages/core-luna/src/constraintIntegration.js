/**
 * Luna Constraint Integration
 *
 * Integrates Luna's preference-based constraints with the core constraint system.
 * This provides a bridge between Luna profiles and core-orb constraint evaluation.
 */
import { evaluateAction as coreEvaluateAction, createConstraintSet, constraint as constraintBuilder, } from '@orb-system/core-orb';
/**
 * Convert Luna constraint to core Constraint
 */
export function lunaConstraintToCoreConstraint(lunaConstraint) {
    const builder = constraintBuilder(lunaConstraint.id);
    builder.description(lunaConstraint.description || 'Luna constraint');
    builder.active(lunaConstraint.active);
    // Map constraint type
    switch (lunaConstraint.type) {
        case 'block_tool':
            if (lunaConstraint.toolId) {
                builder.blockTool(lunaConstraint.toolId);
            }
            builder.severity('hard');
            break;
        case 'max_risk':
            if (lunaConstraint.maxRisk) {
                builder.maxRisk(lunaConstraint.maxRisk);
            }
            builder.severity('soft');
            break;
        case 'require_confirmation':
            builder.type('require_confirm');
            builder.severity('soft');
            break;
        case 'other':
        default:
            builder.type('other');
            builder.severity('warning');
            break;
    }
    // Apply role restrictions if present
    if (lunaConstraint.appliesToRoles && lunaConstraint.appliesToRoles.length > 0) {
        builder.blockForRoles(...lunaConstraint.appliesToRoles);
    }
    return builder.build();
}
/**
 * Convert Luna profile to core ConstraintSet
 */
export function lunaProfileToConstraintSet(profile) {
    const coreConstraints = profile.constraints.map(c => lunaConstraintToCoreConstraint(c));
    return createConstraintSet(`luna-profile-${profile.userId}-${profile.modeId}`, `Luna Profile for ${profile.modeId}`, `Constraints from Luna profile for user ${profile.userId} in mode ${profile.modeId}`, coreConstraints, {
        modes: [profile.modeId],
    });
}
/**
 * Convert Luna action descriptor to core ActionContext
 */
export function lunaActionToActionContext(action, additionalContext) {
    return {
        actionId: action.id,
        actionType: action.kind,
        role: action.role,
        toolId: action.toolId,
        estimatedRisk: action.estimatedRisk,
        description: action.description,
        userId: additionalContext?.userId,
        sessionId: additionalContext?.sessionId,
        deviceId: additionalContext?.deviceId,
        mode: additionalContext?.mode,
        persona: additionalContext?.persona,
    };
}
/**
 * Evaluate action using Luna profile and core constraint system
 */
export function evaluateActionWithLunaProfile(action, profile, additionalContext) {
    const actionContext = lunaActionToActionContext(action, additionalContext);
    const constraintSet = lunaProfileToConstraintSet(profile);
    return coreEvaluateAction(actionContext, [constraintSet]);
}
//# sourceMappingURL=constraintIntegration.js.map