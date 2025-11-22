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

  if (lunaDecision.type === 'deny') {
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

  const mavTaskResult = await runTaskWithDefaults(
    { ...context, role: OrbRole.MAV },
    mavTask,
  );

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

  const teEvaluation = await evaluateRun(
    { ...context, role: OrbRole.TE },
    {
      input: reflection.input,
      output: reflection.output,
      metadata: mavTaskResult.metadata,
    },
  );

  return {
    context,
    mode,
    lunaDecision,
    solOutput,
    mavTaskResult,
    teEvaluation,
  };
};
