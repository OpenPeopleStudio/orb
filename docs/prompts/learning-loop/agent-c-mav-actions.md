# Agent C: Mav (Actions) - Event Emission

**Mission**: Phase 6 - Learning Loop & Adaptation  
**Parent Mission**: `docs/prompts/MISSION_6_LEARNING_LOOP.md`

---

## Your Role

You are the **Mav (Actions)** agent. Your job is to emit structured events for every action execution, capturing metadata needed for pattern detection and learning.

**Scope**:
- `orb-system/packages/core-mav/src/`
- Focus: Event emission around action execution

---

## Deliverables

### 1. Emit Events in Task Runner

**File**: `orb-system/packages/core-mav/src/taskRunner.ts`

Add event emission around task execution:

```typescript
import { getEventBus, OrbEventType } from '@orb-system/core-orb';

export async function runTaskWithDefaults(
  task: MavTask,
  context: OrbContext
): Promise<MavTaskResult> {
  const eventBus = getEventBus();
  const startTime = Date.now();
  
  // Emit ACTION_STARTED event
  await eventBus.emit({
    id: `evt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type: OrbEventType.ACTION_STARTED,
    timestamp: new Date().toISOString(),
    userId: context.userId,
    sessionId: context.sessionId,
    deviceId: context.deviceId,
    mode: context.mode,
    persona: context.persona,
    role: OrbRole.MAV,
    payload: {
      taskId: task.id,
      taskLabel: task.label,
      actionType: task.type,
      riskLevel: task.riskLevel || 'medium',
    },
    metadata: {
      startTime,
    },
  });
  
  try {
    // Execute task
    const result = await executeTask(task, context);
    const endTime = Date.now();
    
    // Emit ACTION_COMPLETED event
    await eventBus.emit({
      id: `evt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: OrbEventType.ACTION_COMPLETED,
      timestamp: new Date().toISOString(),
      userId: context.userId,
      sessionId: context.sessionId,
      deviceId: context.deviceId,
      mode: context.mode,
      role: OrbRole.MAV,
      payload: {
        taskId: task.id,
        taskLabel: task.label,
        result: result.output,
        success: result.success,
      },
      metadata: {
        duration: endTime - startTime,
        success: true,
      },
    });
    
    return result;
    
  } catch (error) {
    const endTime = Date.now();
    
    // Emit ACTION_FAILED event
    await eventBus.emit({
      id: `evt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: OrbEventType.ACTION_FAILED,
      timestamp: new Date().toISOString(),
      userId: context.userId,
      sessionId: context.sessionId,
      deviceId: context.deviceId,
      mode: context.mode,
      role: OrbRole.MAV,
      payload: {
        taskId: task.id,
        taskLabel: task.label,
        error: error.message,
      },
      metadata: {
        duration: endTime - startTime,
        success: false,
        errorMessage: error.message,
      },
    });
    
    throw error;
  }
}
```

### 2. Emit Events in Executors

**File**: `orb-system/packages/core-mav/src/executors/index.ts`

Wrap all executor methods:

```typescript
export function createDefaultMavExecutor(): MavExecutor {
  const eventBus = getEventBus();
  
  return {
    async execute(action, context) {
      const startTime = Date.now();
      
      // Emit start event
      await eventBus.emit({
        id: generateEventId(),
        type: OrbEventType.ACTION_STARTED,
        timestamp: new Date().toISOString(),
        userId: context.userId,
        sessionId: context.sessionId,
        role: OrbRole.MAV,
        payload: { action: action.type },
      });
      
      try {
        const result = await executeAction(action, context);
        
        // Emit complete event
        await eventBus.emit({
          id: generateEventId(),
          type: OrbEventType.ACTION_COMPLETED,
          timestamp: new Date().toISOString(),
          userId: context.userId,
          role: OrbRole.MAV,
          payload: { action: action.type, result },
          metadata: { duration: Date.now() - startTime },
        });
        
        return result;
      } catch (error) {
        // Emit failed event
        await eventBus.emit({
          id: generateEventId(),
          type: OrbEventType.ACTION_FAILED,
          timestamp: new Date().toISOString(),
          userId: context.userId,
          role: OrbRole.MAV,
          payload: { action: action.type, error: error.message },
          metadata: { duration: Date.now() - startTime },
        });
        
        throw error;
      }
    },
  };
}
```

---

## Success Criteria

- ✅ Events emitted for all actions (start, complete, fail)
- ✅ Events include proper metadata (duration, risk level)
- ✅ No performance impact (events are fire-and-forget)
- ✅ Type errors resolved

**Time**: 1-2 days

