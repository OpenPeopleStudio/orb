# Constraints and Modes Overview

**Created**: 2025-11-22  
**Agent**: Architect (Agent A)  
**Mission**: Multi-Agent Mission - Constraints, Modes, Personas, Preferences

---

## Purpose

This document describes the **constraint system** and **mode transition logic** for the Orb ecosystem. It defines the core contracts that other modules use to:

1. **Evaluate actions** against user preferences and system constraints
2. **Validate mode transitions** to ensure safe and contextual state changes
3. **Enforce guard rails** based on persona, device, and operational context

---

## Core Concepts

### 1. Constraints

**Constraints** are rules that limit or guide what actions can be performed in the system. They can:

- Block specific tools or actions entirely
- Limit risk levels for operations
- Require user confirmation for sensitive actions
- Restrict based on mode, persona, device, or time

#### Constraint Types

```typescript
type ConstraintType =
  | 'block_action'      // Block a specific action entirely
  | 'block_tool'        // Block use of a specific tool
  | 'max_risk'          // Limit maximum risk level
  | 'require_confirmation' // Require user confirmation
  | 'mode_transition'   // Restrict mode transitions
  | 'persona_mismatch'  // Block if persona doesn't match
  | 'device_restriction' // Restrict to specific devices
  | 'time_restriction'  // Restrict based on time
  | 'other';            // Custom/extensible
```

#### Constraint Structure

```typescript
interface Constraint {
  id: string;
  type: ConstraintType;
  active: boolean;
  severity: 'warning' | 'error' | 'critical';
  
  // Scope - when does this apply?
  appliesToModes?: OrbMode[];
  appliesToPersonas?: OrbPersona[];
  appliesToDevices?: OrbDevice[];
  appliesToRoles?: OrbRole[];
  
  // Type-specific fields
  toolId?: string;
  maxRisk?: RiskLevel;
  allowedModes?: OrbMode[];
  
  description: string;
  reason?: string;
}
```

### 2. Action Context

The **ActionContext** captures all the information needed to evaluate whether an action is allowed:

```typescript
interface ActionContext {
  userId: string;
  sessionId: string;
  deviceId?: string;
  device?: OrbDevice;
  mode: OrbMode;
  persona: OrbPersona;
  feature?: string; // e.g. 'SWL', 'RealEstate'
  role?: OrbRole;
  timestamp?: string;
}
```

### 3. Action Evaluation

Actions are evaluated against **constraint sets** (collections of constraints). The evaluator:

1. Collects all active constraints for the current context
2. Checks each constraint to see if it applies (based on mode, persona, device, etc.)
3. Evaluates whether the constraint is violated
4. Returns a decision: `allow`, `deny`, or `require_confirmation`

```typescript
interface ConstraintEvaluationResult {
  allowed: boolean;
  decision: 'allow' | 'deny' | 'require_confirmation';
  reasons: string[];
  triggeredConstraints: TriggeredConstraint[];
  effectiveRisk: RiskLevel;
  recommendations?: string[];
}
```

### 4. Mode Transitions

Mode transitions are validated before execution. The system checks:

- **Device compatibility**: Is this mode typically used on this device?
- **Persona compatibility**: Is this mode compatible with the current persona?
- **Constraint violations**: Do any mode transition constraints block this?

```typescript
interface ModeTransitionResult {
  allowed: boolean;
  fromMode: OrbMode;
  toMode: OrbMode;
  reasons: string[];
  triggeredConstraints: TriggeredConstraint[];
  recommendations?: string[];
}
```

---

## Module Structure

The constraint system lives in `packages/core-orb/src/constraints/`:

```
constraints/
├── index.ts              # Main exports
├── types.ts              # Core types and interfaces
├── evaluator.ts          # Action evaluation logic
├── builder.ts            # Helpers for building constraints
├── modeTransitions.ts    # Mode transition validation
└── storage.ts            # (TODO) Persistent storage layer
```

### Key Functions

#### Action Evaluation

```typescript
import { evaluateAction } from '@orb-system/core-orb/constraints';

const result = evaluateAction(action, context, constraintSets);
if (!result.allowed) {
  console.log('Action blocked:', result.reasons);
}
```

#### Mode Transitions

```typescript
import { validateModeTransition, canTransitionMode } from '@orb-system/core-orb/constraints';

// Full validation with details
const request: ModeTransitionRequest = {
  fromMode: 'sol',
  toMode: 'mars',
  context,
};
const result = validateModeTransition(request, constraintSets);

// Simple boolean check
const allowed = canTransitionMode('sol', 'mars', context, constraintSets);
```

#### Building Constraints

```typescript
import {
  blockTool,
  maxRisk,
  requireConfirmation,
  createConstraintSet,
} from '@orb-system/core-orb/constraints';

const constraints = [
  blockTool('dangerous_tool', {
    description: 'Block dangerous tool in production',
    appliesToModes: ['mars'],
  }),
  maxRisk('medium', {
    description: 'Limit risk during restaurant hours',
    appliesToModes: ['mars', 'restaurant'],
  }),
  requireConfirmation('Confirm destructive actions'),
];

const constraintSet = createConstraintSet('production-safety', constraints, {
  priority: 100,
});
```

---

## Integration Points

### For Luna (Preferences)

Luna uses the constraint system to enforce user preferences:

```typescript
// Luna evaluates actions before executing them
const decision = await lunaEvaluateAction(context, action);
if (decision.type === 'deny') {
  throw new Error('Action blocked by Luna constraints');
}
```

### For Mav (Action Execution)

Mav checks constraints before executing tasks:

```typescript
// Mav checks constraints for each action
const result = evaluateAction(actionDescriptor, context, constraintSets);
if (result.decision === 'require_confirmation') {
  await requestUserConfirmation(result.reasons);
}
```

### For Orb-Web (UI)

The web UI displays current constraints and allows mode changes:

```typescript
// Show current constraints in preferences
const constraintSets = await getConstraintSetsForUser(userId, mode);

// Validate mode change before applying
const transitionResult = validateModeTransition(request, constraintSets);
if (!transitionResult.allowed) {
  showError(transitionResult.reasons);
}
```

---

## Default Constraints by Mode

Each mode has default constraints defined in its descriptor (`ORB_MODE_DESCRIPTORS`):

- **SOL**: `['no-destructive-actions', 'require-confirmation']`
- **MARS**: `['no-personal-notifications', 'fast-confirmations']`
- **EARTH**: `['no-work-alerts', 'limit-task-creation']`
- **FORGE**: `['require-review']`
- **BUILDER**: `['no-prod-writes']`

These are parsed into `Constraint` objects using `parseConstraintString()` in `builder.ts`.

---

## TODOs and Extension Points

### TODO: CORE_ORB_AGENT (Agent B)
- Implement persistent storage layer (`storage.ts`)
- Add default constraint sets and configuration
- Wire up to existing Luna preference stores

### TODO: PERSONA_AGENT (Agent C)
- Integrate persona classification with mode recommendations
- Add persona-aware constraint filtering
- Implement override mechanisms for user-chosen personas

### TODO: ORB_WEB_AGENT (Agent D)
- Display constraints in preferences UI
- Allow safe constraint editing
- Show mode transition validation results

### TODO: TESTS_AGENT (Agent E)
- Add comprehensive tests for constraint evaluation
- Test mode transition edge cases
- Test persona/device/mode combinations

---

## Design Principles

1. **Explicit > Implicit**: Constraints are clear, not hidden heuristics
2. **Transparent**: Users can see why an action was blocked
3. **Extensible**: New constraint types can be added easily
4. **Scoped**: Constraints apply only where relevant (mode, persona, device)
5. **Overridable**: Forced overrides available for emergencies

---

## Example: Restaurant Mode Constraints

```typescript
const restaurantConstraints = createConstraintSet(
  'restaurant-operations',
  [
    // Block personal notifications during service
    {
      id: 'no-personal-notifs',
      type: 'block_action',
      active: true,
      severity: 'warning',
      description: 'Block personal notifications during service',
      appliesToModes: ['mars', 'restaurant'],
    },
    
    // Limit risk for financial operations
    maxRisk('medium', {
      description: 'Limit financial operation risk',
      appliesToModes: ['mars', 'restaurant'],
      appliesToRoles: ['mav'],
    }),
    
    // Require confirmation for large transactions
    requireConfirmation('Large transaction confirmation', {
      reason: 'Transactions over $500 need approval',
      appliesToModes: ['mars', 'restaurant'],
    }),
  ],
  { priority: 50 }
);
```

---

## References

- **Identity Types**: `packages/core-orb/src/identity/types.ts`
- **Luna Types**: `packages/core-luna/src/types.ts`
- **Mode Descriptors**: `ORB_MODE_DESCRIPTORS` in identity types
- **Action Evaluator** (existing): `packages/core-luna/src/actionEvaluator.ts`

---

**End of Overview**

