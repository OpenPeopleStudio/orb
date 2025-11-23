# Constraints Module

**Role**: Guard rails and validation for actions and mode transitions  
**Created**: 2025-11-22  
**Mission**: Multi-Agent Mission - Constraints, Modes, Personas, Preferences

---

## Quick Start

```typescript
import {
  evaluateAction,
  validateModeTransition,
  createConstraintSet,
  blockTool,
  maxRisk,
  getConstraintStore,
  initializeConstraintStore,
} from '@orb-system/core-orb/constraints';

// Initialize the constraint store (done automatically on first use)
initializeConstraintStore();

// Evaluate an action
const action: ActionDescriptor = {
  id: 'write-file',
  type: 'file_write',
  role: OrbRole.MAV,
  targetPath: '/important/file.txt',
  estimatedRisk: 'high',
  description: 'Write to important file',
};

const context: ActionContext = {
  userId: 'user-123',
  sessionId: 'session-456',
  mode: OrbMode.SOL,
  persona: OrbPersona.PERSONAL,
  device: OrbDevice.SOL,
};

const store = getConstraintStore();
const constraintSets = await store.getConstraintSets(context);
const result = evaluateAction(action, context, constraintSets);

if (!result.allowed) {
  console.log('Action blocked:', result.reasons);
}

// Validate a mode transition
const request: ModeTransitionRequest = {
  fromMode: OrbMode.SOL,
  toMode: OrbMode.MARS,
  context,
};

const transitionResult = validateModeTransition(request, constraintSets);
if (!transitionResult.allowed) {
  console.log('Transition blocked:', transitionResult.reasons);
}
```

---

## Architecture

```
constraints/
├── types.ts           # Core types and interfaces
├── evaluator.ts       # Action evaluation logic
├── builder.ts         # Helpers for building constraints
├── modeTransitions.ts # Mode transition validation
├── storage.ts         # Persistent storage layer
├── index.ts           # Main exports
└── README.md          # This file
```

---

## Key Concepts

### Constraint

A rule that limits or guides actions:

```typescript
interface Constraint {
  id: string;
  type: ConstraintType;
  active: boolean;
  severity: 'warning' | 'error' | 'critical';
  appliesToModes?: OrbMode[];
  appliesToPersonas?: OrbPersona[];
  description: string;
}
```

### Constraint Set

A named collection of constraints with a priority:

```typescript
interface ConstraintSet {
  id: string;
  name: string;
  constraints: Constraint[];
  priority: number; // Higher = evaluated first
}
```

### Action Context

The full context for evaluating an action:

```typescript
interface ActionContext {
  userId: string;
  sessionId: string;
  mode: OrbMode;
  persona: OrbPersona;
  device?: OrbDevice;
  role?: OrbRole;
}
```

---

## Default Constraints

Default constraints are loaded from mode descriptors (`ORB_MODE_DESCRIPTORS`). Each mode defines a list of constraint strings in its `defaultConstraints` array.

These are parsed into `Constraint` objects by `parseConstraintString()` in `builder.ts`.

Example mode constraints:
- **SOL**: `no-destructive-actions`, `require-confirmation`
- **MARS**: `no-personal-notifications`, `fast-confirmations`
- **EARTH**: `no-work-alerts`, `limit-task-creation`
- **FORGE**: `require-review`
- **BUILDER**: `no-prod-writes`

---

## Extending

### Add a New Constraint Type

1. Add to `ConstraintType` union in `types.ts`
2. Add type-specific fields to `Constraint` interface
3. Add evaluation logic in `checkConstraintViolation()` in `evaluator.ts`
4. Optionally add builder helper in `builder.ts`

### Add a New Constraint String

Add a case to `parseConstraintString()` in `builder.ts`:

```typescript
case 'my-new-constraint':
  return {
    id: generateConstraintId('my-new'),
    type: 'other',
    active: true,
    severity: 'warning',
    description: 'My new constraint',
    appliesToModes: mode ? [mode] : undefined,
  };
```

### Custom Storage

Implement the `ConstraintStore` interface:

```typescript
class MyCustomStore implements ConstraintStore {
  async getConstraintSets(context: ActionContext): Promise<ConstraintSet[]> {
    // Fetch from your storage backend
  }
  
  async saveConstraintSet(set: ConstraintSet): Promise<void> {
    // Save to your storage backend
  }
  
  // ... implement other methods
}

// Initialize with custom store
initializeConstraintStore(new MyCustomStore());
```

---

## Integration

### With Luna (Preferences)

Luna uses constraints to enforce user preferences:

```typescript
import { evaluateAction } from '@orb-system/core-orb/constraints';

const decision = await evaluateAction(action, context, constraintSets);
if (decision === 'deny') {
  throw new Error('Action blocked by preferences');
}
```

### With Mav (Action Execution)

Mav checks constraints before executing tasks:

```typescript
const result = evaluateAction(actionDescriptor, context, constraintSets);
if (result.decision === 'require_confirmation') {
  await requestUserConfirmation(result.reasons);
}
```

### With Orb-Web (UI)

Display constraints and validate mode changes:

```typescript
// Get constraints for current mode
const store = getConstraintStore();
const sets = await store.getConstraintSetsByMode(currentMode);

// Validate mode transition
const transitionResult = validateModeTransition(request, sets);
if (!transitionResult.allowed) {
  showError(transitionResult.reasons);
}
```

---

## Testing

See `packages/core-orb/src/constraints/__tests__/` for test examples.

```bash
pnpm test --filter @orb-system/core-orb
```

---

## References

- [Constraints and Modes Overview](../../../../docs/CONSTRAINTS_AND_MODES_OVERVIEW.md)
- [Identity Types](../identity/types.ts)
- [Luna Types](../../../core-luna/src/types.ts)

