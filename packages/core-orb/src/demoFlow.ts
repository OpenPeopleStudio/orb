import {
  evaluateActionWithDefaults,
  type LunaActionDescriptor,
  type LunaDecision,
} from '@orb-system/core-luna';
import {
  runTaskWithDefaults,
  createDefaultMavExecutor,
  type MavTask,
  type MavTaskResult,
} from '@orb-system/core-mav';
import {
  createTeReflection,
  evaluateRun,
  type TeEvaluation,
} from '@orb-system/core-te';

import { OrbRole, type OrbContext } from './orbRoles';
import { createDefaultLunaStore, createDefaultTeStore } from './storeFactories';
import { getEventBus, OrbEventType, type OrbEvent } from './events';
import { getConfig } from './config';
import { OrbDevice, OrbMode } from './identity';

/**
 * NOTE: core-sol is currently a stub. Replace this with the real orchestrator once available.
 */
const mockSolGenerate = async (prompt: string): Promise<string> => {
  return `Mock Sol Response: ${prompt.toUpperCase()} :: synthesized`;
};

export interface DemoFlowInput {
  userId: string;
  sessionId: string;
  prompt: string;
  mode?: string; // Luna mode: 'default' | 'restaurant' | 'real_estate' | 'builder'
  deviceId?: OrbDevice; // Optional device context
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
 * Helper to emit events with consistent structure
 */
function createEvent(
  type: OrbEventType,
  context: OrbContext,
  payload: Record<string, unknown>,
  options?: {
    mode?: string;
    deviceId?: OrbDevice;
  }
): OrbEvent {
  const config = getConfig();
  return {
    id: `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type,
    timestamp: new Date().toISOString(),
    userId: context.userId,
    sessionId: context.sessionId,
    deviceId: options?.deviceId || (config.deviceId as OrbDevice | undefined),
    mode: (options?.mode || context.mode) as OrbMode | undefined,
    role: context.role,
    payload,
  };
}

/**
 * Runs a minimal Orb flow:
 * - Build OrbContext and ask Luna if we can run a mock tool call
 * - If allowed, call Sol, execute a mock Mav task, and record Te evaluation
 */
export const runDemoFlow = async (input: DemoFlowInput): Promise<DemoFlowResult> => {
  const eventBus = getEventBus();
  const context: OrbContext = {
    role: OrbRole.MAV,
    userId: input.userId,
    sessionId: input.sessionId,
  };

  // Emit flow start event
  await eventBus.emit(createEvent(
    OrbEventType.TASK_RUN,
    context,
    { prompt: input.prompt, flow: 'demoFlow' },
    { mode: input.mode, deviceId: input.deviceId }
  ));

  // Set mode if provided (for Luna)
  const mode = (input.mode || 'default') as 'default' | 'restaurant' | 'real_estate' | 'builder';
  const lunaStore = createDefaultLunaStore();
  await lunaStore.setActiveMode(input.userId, mode);

  // Emit mode change event if mode was set
  if (input.mode) {
    await eventBus.emit(createEvent(
      OrbEventType.MODE_CHANGE,
      context,
      { mode, previousMode: 'default' },
      { mode: input.mode, deviceId: input.deviceId }
    ));
  }

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

  // Emit Luna decision event
  await eventBus.emit(createEvent(
    lunaDecision.type === 'allow' ? OrbEventType.LUNA_ALLOW : OrbEventType.LUNA_DENY,
    { ...context, role: OrbRole.LUNA },
    {
      decision: lunaDecision.type,
      actionId: actionDescriptor.id,
      toolId: actionDescriptor.toolId,
      reason: lunaDecision.reason,
    },
    { mode, deviceId: input.deviceId }
  ));

  await eventBus.emit(createEvent(
    OrbEventType.LUNA_DECISION,
    { ...context, role: OrbRole.LUNA },
    {
      decision: lunaDecision,
      actionDescriptor,
    },
    { mode, deviceId: input.deviceId }
  ));

  if (lunaDecision.type === 'deny') {
    // Emit task fail event
    await eventBus.emit(createEvent(
      OrbEventType.TASK_FAIL,
      context,
      { reason: 'luna_denied', lunaDecision },
      { mode, deviceId: input.deviceId }
    ));
    return { context, mode, lunaDecision };
  }

  const solOutput = await mockSolGenerate(input.prompt);
  const actionId = `action-${Date.now()}`;

  const mavTask: MavTask = {
    id: `task-${Date.now()}`,
    label: 'Demo Flow File Log',
    actions: [
      {
        id: actionId,
        kind: 'log',
        toolId: 'mav_file_log',
        params: { prompt: input.prompt, solOutput, mode },
        metadata: { executor: 'mav_file_log', prompt: input.prompt },
      },
    ],
    metadata: { prompt: input.prompt, mode, source: 'demoFlow' },
  };

  // Emit Mav action event
  await eventBus.emit(createEvent(
    OrbEventType.MAV_ACTION,
    { ...context, role: OrbRole.MAV },
    {
      taskId: mavTask.id,
      actionId,
      toolId: 'mav_file_log',
      kind: 'log',
    },
    { mode, deviceId: input.deviceId }
  ));

  const defaultExecutor = createDefaultMavExecutor();
  const mavTaskResult = await runTaskWithDefaults(
    { ...context, role: OrbRole.MAV },
    mavTask,
    [defaultExecutor],
  );

  // Emit task completion event
  await eventBus.emit(createEvent(
    mavTaskResult.status === 'completed' ? OrbEventType.TASK_COMPLETE : OrbEventType.TASK_FAIL,
    { ...context, role: OrbRole.MAV },
    {
      taskId: mavTask.id,
      status: mavTaskResult.status,
      filesTouched: mavTaskResult.filesTouched,
      summary: mavTaskResult.summary,
    },
    { mode, deviceId: input.deviceId }
  ));

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

  // Emit reflection event
  await eventBus.emit(createEvent(
    OrbEventType.TE_REFLECTION,
    { ...context, role: OrbRole.TE },
    {
      reflectionId: reflection.id,
      tags: reflection.tags,
      notes: reflection.notes,
    },
    { mode, deviceId: input.deviceId }
  ));

  const teEvaluation = await evaluateRun(
    { ...context, role: OrbRole.TE },
    {
      input: reflection.input,
      output: reflection.output,
      metadata: mavTaskResult.metadata,
    },
  );

  // Emit evaluation event
  await eventBus.emit(createEvent(
    OrbEventType.TE_EVALUATION,
    { ...context, role: OrbRole.TE },
    {
      evaluation: teEvaluation,
      reflectionId: reflection.id,
      score: teEvaluation.score,
    },
    { mode, deviceId: input.deviceId }
  ));

  return {
    context,
    mode,
    lunaDecision,
    solOutput,
    mavTaskResult,
    teEvaluation,
  };
};

