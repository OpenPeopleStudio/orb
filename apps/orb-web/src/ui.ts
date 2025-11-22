/**
 * Orb Web UI
 *
 * Main UI entry point for Orb console.
 */

import { modeService } from '@orb-system/core-luna';
import {
  createOrbContext,
  OrbRole,
  runDemoFlow as runCoreDemoFlow,
  type DemoFlowResult,
} from '@orb-system/core-orb';

export interface UIDemoFlowInput {
  userId?: string;
  sessionId?: string;
  prompt: string;
  modeId?: 'default' | 'restaurant' | 'real_estate' | 'builder';
}

export type UIDemoFlowResult = DemoFlowResult & {
  modeId: string;
};

/**
 * Run demo flow with mode selection
 */
export async function runDemoFlow(input: UIDemoFlowInput): Promise<UIDemoFlowResult> {
  const userId = input.userId || 'demo-user';
  const sessionId = input.sessionId || `session-${Date.now()}`;
  const modeId = input.modeId || 'default';

  // Set the active mode in Luna
  const lunaCtx = createOrbContext(OrbRole.LUNA, sessionId, { userId });
  await modeService.setMode(lunaCtx, userId, modeId);

  // Run the core demo flow with mode
  const result = await runCoreDemoFlow({
    userId,
    sessionId,
    prompt: input.prompt,
    mode: modeId,
  });

  return {
    modeId: result.mode,
    ...result,
  };
}

