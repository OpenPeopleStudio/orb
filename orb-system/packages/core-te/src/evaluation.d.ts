/**
 * Te Evaluation
 *
 * Role: OrbRole.TE (reflection/memory)
 *
 * Evaluates run quality and provides feedback.
 */
import { type OrbContext } from '@orb-system/core-orb';
export interface TeEvaluation {
    score: number;
    tags: string[];
    summary: string;
    recommendations: string[];
    metadata?: Record<string, unknown>;
}
/**
 * Evaluate a run (input/output pair) for quality
 */
export declare function evaluateRun(ctx: OrbContext, data: {
    input: string;
    output: string;
    metadata?: Record<string, unknown>;
}): TeEvaluation;
//# sourceMappingURL=evaluation.d.ts.map