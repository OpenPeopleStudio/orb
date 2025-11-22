import { OrbRole, type OrbContext } from './orbRoles';
import {
  evaluateActionWithDefaults,
  type LunaActionDescriptor,
  type LunaDecision,
} from '@orb-system/core-luna';
import {
  runTaskWithDefaults,
  type MavTask,
  type MavTaskResult,
} from '@orb-system/core-mav';
import {
  createTeReflection,
  evaluateRun,
  type TeEvaluation,
} from '@orb-system/core-te';
import { createDefaultLunaStore, createDefaultTeStore } from './storeFactories';
import { getEventBus } from './events/bus';
import { OrbEventType, type OrbEvent } from './events/types';
import { OrbMode } from './identity';

/**
 * NOTE: core-sol is currently a stub. Replace this with the real orchestrator once available.
 */
const mockSolGenerate = async (prompt: string): Promise<string> => {
  return `Mock Sol Response: ${prompt.toUpperCase()} :: synthesized`;
};

/**
 * Helper to map mode string to OrbMode enum
 */
function mapModeToOrbMode(mode: string): OrbMode {
  switch (mode) {
    case 'restaurant':
      return OrbMode.RESTAURANT;
    case 'real_estate':
      return OrbMode.REAL_ESTATE;
    case 'builder':
      return OrbMode.BUILDER;
    case 'explorer':
      return OrbMode.EXPLORER;
    case 'forge':
      return OrbMode.FORGE;
    default:
      return OrbMode.DEFAULT;
  }
}

/**
 * Helper to generate a unique ID
 */
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * Helper to create and emit an event
 */
async function emitEvent(
  type: OrbEventType,
  context: OrbContext,
  mode: string,
  payload: Record<string, unknown>,
  metadata?: Record<string, unknown>
): Promise<void> {
  try {
    const eventBus = getEventBus();
    const event: OrbEvent = {
      id: generateId(),
      type,
      timestamp: new Date().toISOString(),
      userId: context.userId,
      sessionId: context.sessionId,
      deviceId: context.deviceId as any,
      mode: mapModeToOrbMode(mode),
      persona: context.persona as any,
      role: context.role,
      payload,
      metadata,
    };
    
    await eventBus.emit(event);
  } catch (error) {
    // Don't fail the flow if event emission fails
    console.error('[demoFlow] Failed to emit event:', error);
  }
}

export interface DemoFlowInput {
  userId: string;
  sessionId: string;
  prompt: string;
  mode?: string; // Luna mode: 'default' | 'restaurant' | 'real_estate' | 'builder'
}

export interface DemoFlowResult {
  context: OrbContext;
  mode: string;
  lunaDecision: LunaDecision;
  solOutput?: string;
  mavTaskResult?: MavTaskResult;
  teEvaluation?: TeEvaluation;
}

/**
 * Runs a minimal Orb flow:
 * - Build OrbContext and ask Luna if we can run a mock tool call
 * - If allowed, call Sol, execute a mock Mav task, and record Te evaluation
 */
export const runDemoFlow = async (input: DemoFlowInput): Promise<DemoFlowResult> => {
  const context: OrbContext = {
    role: OrbRole.MAV,
    userId: input.userId,
    sessionId: input.sessionId,
  };

  // Set mode if provided (for Luna)
  const mode = (input.mode || 'default') as 'default' | 'restaurant' | 'real_estate' | 'builder';
  const lunaStore = createDefaultLunaStore();
  await lunaStore.setActiveMode(input.userId, mode);

  // Emit: User input event
  await emitEvent(
    OrbEventType.USER_INPUT,
    context,
    mode,
    { prompt: input.prompt },
    { flow: 'demo' }
  );

  // Emit: Mode change event
  await emitEvent(
    OrbEventType.MODE_CHANGE,
    context,
    mode,
    { mode, previousMode: 'default' },
    { userId: input.userId }
  );

  const actionDescriptor: LunaActionDescriptor = {
    id: 'mock_tool_action',
    role: OrbRole.MAV,
    kind: 'tool_call',
    toolId: 'mock_tool',
    metadata: { prompt: input.prompt },
  };

  const lunaDecision = await evaluateActionWithDefaults(
    { ...context, role: OrbRole.LUNA },
    actionDescriptor,
  );

  // Emit: Luna decision event
  await emitEvent(
    OrbEventType.LUNA_DECISION,
    { ...context, role: OrbRole.LUNA },
    mode,
    {
      decisionType: lunaDecision.type,
      reasoning: lunaDecision.reasoning,
      riskLevel: lunaDecision.riskLevel,
      actionId: actionDescriptor.id,
    },
    { action: actionDescriptor }
  );

  // Emit: Specific Luna decision type
  if (lunaDecision.type === 'allow') {
    await emitEvent(
      OrbEventType.LUNA_ALLOW,
      { ...context, role: OrbRole.LUNA },
      mode,
      { actionId: actionDescriptor.id, reasoning: lunaDecision.reasoning }
    );
  } else if (lunaDecision.type === 'deny') {
    await emitEvent(
      OrbEventType.LUNA_DENY,
      { ...context, role: OrbRole.LUNA },
      mode,
      { actionId: actionDescriptor.id, reasoning: lunaDecision.reasoning }
    );
    return { context, mode, lunaDecision };
  }

  const solOutput = await mockSolGenerate(input.prompt);

  const mavTask: MavTask = {
    id: `task-${Date.now()}`,
    label: 'Tool Execution',
    actions: [
      {
        id: 'action-1',
        kind: 'file_write',
        toolId: 'file_log',
        params: { input: input.prompt, output: solOutput, mode },
        metadata: { executor: 'file', prompt: input.prompt },
      },
    ],
    metadata: { prompt: input.prompt, mode },
  };

  // Emit: Task run event
  await emitEvent(
    OrbEventType.TASK_RUN,
    { ...context, role: OrbRole.MAV },
    mode,
    {
      taskId: mavTask.id,
      taskLabel: mavTask.label,
      actionCount: mavTask.actions.length,
    },
    { task: mavTask }
  );

  const mavTaskResult = await runTaskWithDefaults(
    { ...context, role: OrbRole.MAV },
    mavTask,
  );

  // Emit: Task completion event
  if (mavTaskResult.status === 'completed') {
    await emitEvent(
      OrbEventType.TASK_COMPLETE,
      { ...context, role: OrbRole.MAV },
      mode,
      {
        taskId: mavTaskResult.taskId,
        actionsCompleted: mavTaskResult.actionsCompleted,
        actionsTotal: mavTaskResult.actionsTotal,
        filesTouched: mavTaskResult.metadata?.filesTouched,
      },
      { result: mavTaskResult }
    );
  } else {
    await emitEvent(
      OrbEventType.TASK_FAIL,
      { ...context, role: OrbRole.MAV },
      mode,
      {
        taskId: mavTaskResult.taskId,
        status: mavTaskResult.status,
        error: mavTaskResult.error,
        actionsCompleted: mavTaskResult.actionsCompleted,
        actionsTotal: mavTaskResult.actionsTotal,
      },
      { result: mavTaskResult }
    );
  }

  // Emit: Mav action events for file operations
  if (mavTaskResult.metadata?.filesTouched) {
    const filesTouched = mavTaskResult.metadata.filesTouched as string[];
    for (const file of filesTouched) {
      await emitEvent(
        OrbEventType.FILE_WRITE,
        { ...context, role: OrbRole.MAV },
        mode,
        { filePath: file, taskId: mavTaskResult.taskId },
        { executor: 'file_system' }
      );
    }
  }

  const reflection = createTeReflection(
    { ...context, role: OrbRole.TE },
    {
      input: input.prompt,
      output: solOutput,
      tags: mavTaskResult.status === 'completed' ? ['success'] : ['failure'],
      notes: `Task status: ${mavTaskResult.status}`,
    },
  );

  // Save reflection persistently
  const teStore = createDefaultTeStore();
  await teStore.saveReflection(reflection, input.userId, input.sessionId);

  // Emit: Te reflection event
  await emitEvent(
    OrbEventType.TE_REFLECTION,
    { ...context, role: OrbRole.TE },
    mode,
    {
      reflectionId: reflection.id,
      tags: reflection.tags,
      notes: reflection.notes,
    },
    { reflection }
  );

  const teEvaluation = await evaluateRun(
    { ...context, role: OrbRole.TE },
    {
      input: reflection.input,
      output: reflection.output,
      metadata: mavTaskResult.metadata,
    },
  );

  // Emit: Te evaluation event
  await emitEvent(
    OrbEventType.TE_EVALUATION,
    { ...context, role: OrbRole.TE },
    mode,
    {
      score: teEvaluation.score,
      tags: teEvaluation.tags,
      recommendations: teEvaluation.recommendations,
      summary: teEvaluation.summary,
      reflectionId: reflection.id,
    },
    { evaluation: teEvaluation }
  );

  // Run adaptation engine periodically (every 10th run or so)
  // This allows the system to learn and adjust defaults
  try {
    const { getAdaptationEngine } = await import('./adaptation');
    const adaptationEngine = getAdaptationEngine();
    
    // Only run adaptation analysis occasionally to avoid performance impact
    const shouldRunAdaptation = Math.random() < 0.1; // 10% chance
    if (shouldRunAdaptation) {
      await adaptationEngine.computeAndApplyAdjustments({
        userId: input.userId,
        sessionId: input.sessionId,
      });
    }
  } catch (error) {
    // Don't fail the flow if adaptation fails
    console.error('[demoFlow] Adaptation engine error:', error);
  }

  return {
    context,
    mode,
    lunaDecision,
    solOutput,
    mavTaskResult,
    teEvaluation,
  };
};
