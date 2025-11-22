/**
 * Orb Web UI
 * 
 * Main UI entry point for Orb console.
 */

import { runDemoFlow as runCoreDemoFlow, type DemoFlowInput } from '../../../packages/core-orb/src/demoFlow';
import { createOrbContext, OrbRole } from '../../../packages/core-orb/src/orbRoles';
import { modeService } from '../../../packages/core-luna/src/modes';
import { Mode, Persona, MODE_DESCRIPTORS } from '../../../packages/core-luna/src/types';

export interface UIDemoFlowInput {
  userId?: string;
  sessionId?: string;
  prompt: string;
  modeId?: Mode;
  personaId?: Persona;
}

export interface UIDemoFlowResult {
  modeId: string;
  lunaDecision: any;
  solOutput?: string;
  mavTaskResult?: any;
  teEvaluation?: any;
}

/**
 * Run demo flow with mode selection
 */
export async function runDemoFlow(input: UIDemoFlowInput): Promise<UIDemoFlowResult> {
  const userId = input.userId || 'demo-user';
  const sessionId = input.sessionId || `session-${Date.now()}`;
  const modeId = input.modeId || Mode.DEFAULT;
  const descriptor = MODE_DESCRIPTORS[modeId] ?? MODE_DESCRIPTORS[Mode.DEFAULT];
  const personaId =
    input.personaId || (descriptor.defaultPersonas[0] as Persona | undefined) || Persona.PERSONAL;

  // Set the active mode in Luna
  const lunaCtx = createOrbContext(OrbRole.LUNA, sessionId, { userId });
  await modeService.setMode(lunaCtx, modeId, personaId);

  // Run the core demo flow with mode
  const result = await runCoreDemoFlow({
    userId,
    sessionId,
    prompt: input.prompt,
    mode: modeId as DemoFlowInput['mode'],
  });

  return {
    modeId: result.mode,
    ...result,
  };
}
