import { getOrbPalette } from '@orb-system/core-orb';
const intentMatchers = [
    { pattern: /(ship|launch|deploy)/i, intent: 'launch-readiness', tone: 'urgent' },
    { pattern: /(design|persona|experience)/i, intent: 'experience-refresh', tone: 'positive' },
    { pattern: /(debug|issue|blocker)/i, intent: 'stability-pass', tone: 'urgent' },
    { pattern: /(sync|summary|standup)/i, intent: 'synchronization', tone: 'neutral' },
];
export const analyzeIntent = (context, prompt) => {
    const matcher = intentMatchers.find((entry) => entry.pattern.test(prompt));
    const palette = getOrbPalette(context.role);
    const intent = matcher?.intent ?? 'general-strategy';
    const tone = matcher?.tone ?? 'neutral';
    const signalStrength = Math.min(prompt.length / 120, 1);
    const confidence = Number((0.6 + 0.4 * signalStrength).toFixed(2));
    return {
        role: context.role,
        intent,
        tone,
        confidence,
        summary: `${context.role.toUpperCase()} sees ${intent} with ${Math.round(confidence * 100)}% confidence`,
        highlightColor: palette.accent,
    };
};
export const summarizeSignals = (insights) => {
    if (!insights.length) {
        return 'No active signals.';
    }
    return insights
        .map((insight) => `${insight.intent} (${Math.round(insight.confidence * 100)}%)`)
        .join(' • ');
};
//# sourceMappingURL=index.js.map