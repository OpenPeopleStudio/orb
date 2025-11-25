/**
 * Te Evaluation
 *
 * Role: OrbRole.TE (reflection/memory)
 *
 * Evaluates run quality and provides feedback.
 */
import { OrbRole } from '@orb-system/core-orb';
/**
 * Evaluate a run (input/output pair) for quality
 */
export function evaluateRun(ctx, data) {
    if (ctx.role !== OrbRole.TE) {
        console.warn(`evaluateRun called with role ${ctx.role}, expected TE`);
    }
    const outputLength = data.output.length;
    const inputLength = data.input.length;
    const tags = [];
    const recommendations = [];
    let score = 50; // Base score
    // Length checks
    if (outputLength < 20) {
        tags.push('too_short');
        score -= 30;
        recommendations.push('Provide more detailed output');
    }
    else if (outputLength > 2000) {
        tags.push('too_long');
        score -= 20;
        recommendations.push('Consider condensing the output');
    }
    else {
        tags.push('good');
        score += 10;
    }
    // Vague language detection
    const vagueWords = ['maybe', 'perhaps', 'sort of', 'kind of', 'possibly', 'might', 'could', 'guess'];
    const outputLower = data.output.toLowerCase();
    const vagueCount = vagueWords.filter(word => outputLower.includes(word)).length;
    if (vagueCount > 2) {
        tags.push('vague');
        score -= 15;
        recommendations.push('Use more direct and specific language');
    }
    // Actionable detection
    const actionWords = ['create', 'run', 'execute', 'build', 'deploy', 'implement', 'fix', 'update'];
    const hasActions = actionWords.some(word => outputLower.includes(word));
    if (hasActions) {
        tags.push('actionable');
        score += 15;
    }
    // Ensure score is in valid range
    score = Math.max(0, Math.min(100, score));
    // Generate summary
    const summary = tags.includes('good') && tags.includes('actionable')
        ? 'High-quality, actionable output'
        : tags.includes('too_short')
            ? 'Output is too brief'
            : tags.includes('vague')
                ? 'Output contains vague language'
                : 'Output quality is acceptable';
    return {
        score,
        tags,
        summary,
        recommendations,
        metadata: {
            outputLength,
            inputLength,
            vagueCount,
            hasActions,
            ...data.metadata,
        },
    };
}
//# sourceMappingURL=evaluation.js.map