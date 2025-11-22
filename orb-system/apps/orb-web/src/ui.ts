<<<<<<< Current (Your changes)
=======
/**
 * Orb Web UI
 * 
 * Main UI entry point for Orb console.
 */

import { runDemoFlow as runCoreDemoFlow, type DemoFlowInput } from '@orb-system/core-orb';
import { modeService } from '@orb-system/core-luna';
import { createOrbContext, OrbRole } from '@orb-system/core-orb';

export interface UIDemoFlowInput {
  userId?: string;
  sessionId?: string;
  prompt: string;
  modeId?: string;
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
  const modeId = input.modeId || 'default';

  // Set the active mode in Luna
  const lunaCtx = createOrbContext(OrbRole.LUNA, sessionId, { userId });
  await modeService.setMode(lunaCtx, userId, modeId as any);

  // Run the core demo flow with mode
  const result = await runCoreDemoFlow({
    userId,
    sessionId,
    prompt: input.prompt,
    mode: modeId as 'default' | 'restaurant' | 'real_estate' | 'builder',
  });

  return {
    modeId: result.mode,
    ...result,
  };
}
>>>>>>> Incoming (Background Agent changes)
