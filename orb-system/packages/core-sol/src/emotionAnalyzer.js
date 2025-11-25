/**
 * Emotion Analyzer
 *
 * Migrated from repo: supabase, path: functions/emotion-analyze/index.ts
 * Date: 2025-11-22
 * Role: OrbRole.SOL (inference/engine)
 *
 * Analyzes emotional state from user messages.
 */
import { getConfig } from '@orb-system/core-orb';
/**
 * Analyze emotion from text using OpenAI
 */
export async function analyzeEmotion(text, deviceId) {
    const config = getConfig();
    const openaiApiKey = config.openaiApiKey;
    if (!openaiApiKey) {
        throw new Error('OPENAI_API_KEY not configured');
    }
    const systemPrompt = `You are an emotion analysis system for SOMA OS. Analyze the emotional state of the user's message.

Return ONLY valid JSON with this exact structure:
{
  "emotion": "calm" | "tense" | "hopeful" | "lowEnergy" | "overwhelmed" | "neutral",
  "intensity": 0.0-1.0,
  "valence": -1.0 to 1.0 (negative to positive),
  "energy": "low" | "neutral" | "high",
  "explanation": "brief explanation of the emotional state"
}

Emotion categories:
- calm: peaceful, relaxed, centered, at ease
- tense: anxious, stressed, pressured, worried
- hopeful: optimistic, forward-looking, positive expectation, encouraged
- lowEnergy: tired, drained, depleted, exhausted
- overwhelmed: too much, can't handle, overloaded, swamped
- neutral: balanced, no strong emotion, matter-of-fact

Intensity: how strong the emotion is (0.0 = none, 1.0 = very strong)
Valence: emotional positivity (-1.0 = very negative, 0.0 = neutral, 1.0 = very positive)
Energy: energy level (low, neutral, high)
Explanation: a brief 1-2 sentence explanation of the detected emotional state`;
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${openaiApiKey}`,
        },
        body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: text },
            ],
            response_format: { type: 'json_object' },
            temperature: 0.3,
        }),
    });
    const json = await response.json();
    if (!response.ok) {
        throw new Error(json.error?.message || 'OpenAI API error');
    }
    const content = json.choices[0].message.content;
    let parsedResult;
    try {
        parsedResult = JSON.parse(content);
    }
    catch {
        parsedResult = {
            emotion: 'neutral',
            intensity: 0.0,
            valence: 0.0,
            energy: 'neutral',
            explanation: 'Unable to analyze emotion',
        };
    }
    const emotionResult = {
        emotion: parsedResult.emotion || 'neutral',
        intensity: Math.max(0.0, Math.min(1.0, parsedResult.intensity || 0.0)),
        valence: Math.max(-1.0, Math.min(1.0, parsedResult.valence || 0.0)),
        energy: parsedResult.energy || 'neutral',
        explanation: parsedResult.explanation || 'Emotional state analyzed',
    };
    // Compute emotional curve if device_id provided
    // Note: This would require database access, which should be handled by Te layer
    // For now, we'll skip curve computation here
    return emotionResult;
}
//# sourceMappingURL=emotionAnalyzer.js.map