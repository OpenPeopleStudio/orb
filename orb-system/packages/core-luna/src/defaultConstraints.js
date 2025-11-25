/**
 * Default Constraint Sets
 *
 * Role: OrbRole.LUNA (preferences/intent)
 *
 * Defines system-level default constraints that ship with Orb.
 * These are sensible defaults that users can override or extend.
 */
import { OrbMode, OrbRole, DEFAULT_CONSTRAINT_IDS, } from '@orb-system/core-orb';
/**
 * System-wide default constraints
 */
export function getSystemDefaultConstraints() {
    return [
        {
            id: DEFAULT_CONSTRAINT_IDS.NO_DESTRUCTIVE_ACTIONS,
            type: 'block_tool',
            severity: 'hard',
            active: true,
            description: 'Block destructive actions (delete, force push, etc.) unless explicitly allowed',
            // This would be expanded with specific tool IDs in production
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            createdBy: 'system',
        },
        {
            id: DEFAULT_CONSTRAINT_IDS.REQUIRE_CONFIRMATION_HIGH_RISK,
            type: 'require_confirmation',
            severity: 'soft',
            active: true,
            description: 'Require confirmation for high or critical risk actions',
            maxRisk: 'medium', // Actions above medium require confirmation
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            createdBy: 'system',
        },
    ];
}
/**
 * Mode-specific default constraint sets
 */
export function getModeDefaultConstraintSets() {
    const now = new Date().toISOString();
    return [
        // Earth Mode - No work, personal focus
        {
            id: 'default:earth-mode',
            name: 'Earth Mode Defaults',
            description: 'Constraints for personal/downtime mode',
            constraints: [
                {
                    id: DEFAULT_CONSTRAINT_IDS.NO_WORK_IN_EARTH_MODE,
                    type: 'other',
                    severity: 'soft',
                    active: true,
                    description: 'Minimize work-related actions and notifications in Earth mode',
                    createdAt: now,
                    updatedAt: now,
                    createdBy: 'system',
                },
                {
                    id: 'default:earth-limit-task-creation',
                    type: 'other',
                    severity: 'soft',
                    active: true,
                    description: 'Limit task creation to encourage rest and reflection',
                    createdAt: now,
                    updatedAt: now,
                    createdBy: 'system',
                },
            ],
            appliesTo: {
                modes: [OrbMode.EARTH],
            },
            priority: 100,
            createdAt: now,
            updatedAt: now,
        },
        // Mars Mode - No personal, operations focus
        {
            id: 'default:mars-mode',
            name: 'Mars Mode Defaults',
            description: 'Constraints for operations/restaurant mode',
            constraints: [
                {
                    id: DEFAULT_CONSTRAINT_IDS.NO_PERSONAL_IN_MARS_MODE,
                    type: 'other',
                    severity: 'soft',
                    active: true,
                    description: 'Minimize personal notifications and actions in Mars mode',
                    createdAt: now,
                    updatedAt: now,
                    createdBy: 'system',
                },
                {
                    id: 'default:mars-fast-confirmations',
                    type: 'other',
                    severity: 'soft',
                    active: true,
                    description: 'Enable fast confirmations for time-sensitive operations',
                    createdAt: now,
                    updatedAt: now,
                    createdBy: 'system',
                },
            ],
            appliesTo: {
                modes: [OrbMode.MARS, OrbMode.RESTAURANT],
            },
            priority: 100,
            createdAt: now,
            updatedAt: now,
        },
        // Forge Mode - Require review
        {
            id: 'default:forge-mode',
            name: 'Forge Mode Defaults',
            description: 'Constraints for multi-agent build sessions',
            constraints: [
                {
                    id: DEFAULT_CONSTRAINT_IDS.REQUIRE_REVIEW_IN_FORGE,
                    type: 'require_confirmation',
                    severity: 'hard',
                    active: true,
                    description: 'Require review/approval for code changes in Forge mode',
                    appliesToRoles: [OrbRole.MAV], // Apply to action execution role
                    createdAt: now,
                    updatedAt: now,
                    createdBy: 'system',
                },
                {
                    id: 'default:forge-no-prod-writes',
                    type: 'block_tool',
                    severity: 'hard',
                    active: true,
                    description: 'Block writes to production systems in Forge mode',
                    createdAt: now,
                    updatedAt: now,
                    createdBy: 'system',
                },
            ],
            appliesTo: {
                modes: [OrbMode.FORGE],
            },
            priority: 100,
            createdAt: now,
            updatedAt: now,
        },
        // Sol Mode - Deep focus, minimal interruptions
        {
            id: 'default:sol-mode',
            name: 'Sol Mode Defaults',
            description: 'Constraints for exploration and design work',
            constraints: [
                {
                    id: 'default:sol-suppress-notifications',
                    type: 'other',
                    severity: 'soft',
                    active: true,
                    description: 'Suppress non-critical notifications during deep work',
                    createdAt: now,
                    updatedAt: now,
                    createdBy: 'system',
                },
                {
                    id: 'default:sol-require-confirmation-high-risk',
                    type: 'require_confirmation',
                    severity: 'soft',
                    active: true,
                    description: 'Require confirmation for high-risk actions to avoid disrupting flow',
                    maxRisk: 'medium',
                    createdAt: now,
                    updatedAt: now,
                    createdBy: 'system',
                },
            ],
            appliesTo: {
                modes: [OrbMode.SOL, OrbMode.EXPLORER],
            },
            priority: 100,
            createdAt: now,
            updatedAt: now,
        },
    ];
}
/**
 * Get all default constraint sets (system + mode-specific)
 */
export function getAllDefaultConstraintSets() {
    const now = new Date().toISOString();
    // Wrap system defaults in a constraint set
    const systemSet = {
        id: 'default:system',
        name: 'System Defaults',
        description: 'Global system-level constraints',
        constraints: getSystemDefaultConstraints(),
        appliesTo: {}, // Applies to all contexts
        priority: 1000, // Highest priority
        createdAt: now,
        updatedAt: now,
    };
    return [systemSet, ...getModeDefaultConstraintSets()];
}
/**
 * Initialize a constraint store with defaults
 */
export async function initializeWithDefaults(store) {
    const defaults = getAllDefaultConstraintSets();
    for (const set of defaults) {
        await store.saveConstraintSet(set);
    }
}
//# sourceMappingURL=defaultConstraints.js.map