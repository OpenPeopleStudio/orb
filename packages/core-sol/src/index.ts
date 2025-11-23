import { OrbContext, OrbRole, getOrbPalette } from '@orb-system/core-orb';

export interface SolInsight {
  role: OrbRole;
  intent: string;
  confidence: number;
  tone: 'positive' | 'neutral' | 'urgent';
  summary: string;
  highlightColor: string;
}

const intentMatchers: Array<{ pattern: RegExp; intent: string; tone: SolInsight['tone'] }> = [
  { pattern: /(ship|launch|deploy)/i, intent: 'launch-readiness', tone: 'urgent' },
  { pattern: /(design|persona|experience)/i, intent: 'experience-refresh', tone: 'positive' },
  { pattern: /(debug|issue|blocker)/i, intent: 'stability-pass', tone: 'urgent' },
  { pattern: /(sync|summary|standup)/i, intent: 'synchronization', tone: 'neutral' },
];

export const analyzeIntent = (context: OrbContext, prompt: string): SolInsight => {
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

export const summarizeSignals = (insights: SolInsight[]): string => {
  if (!insights.length) {
    return 'No active signals.';
  }

  return insights
    .map((insight) => `${insight.intent} (${Math.round(insight.confidence * 100)}%)`)
    .join(' • ');
};
