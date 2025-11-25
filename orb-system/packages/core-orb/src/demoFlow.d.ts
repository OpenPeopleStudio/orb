import { type OrbContext } from './orbRoles';
import { type LunaDecision } from '@orb-system/core-luna';
import { type MavTaskResult } from '@orb-system/core-mav';
import { type TeEvaluation } from '@orb-system/core-te';
export interface DemoFlowInput {
    userId: string;
    sessionId: string;
    prompt: string;
    mode?: string;
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
export declare const runDemoFlow: (input: DemoFlowInput) => Promise<DemoFlowResult>;
//# sourceMappingURL=demoFlow.d.ts.map