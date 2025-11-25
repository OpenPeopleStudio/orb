/**
 * Emotion Analyzer
 *
 * Migrated from repo: supabase, path: functions/emotion-analyze/index.ts
 * Date: 2025-11-22
 * Role: OrbRole.SOL (inference/engine)
 *
 * Analyzes emotional state from user messages.
 */
export interface EmotionResult {
    emotion: 'calm' | 'tense' | 'hopeful' | 'lowEnergy' | 'overwhelmed' | 'neutral';
    intensity: number;
    valence: number;
    energy: 'low' | 'neutral' | 'high';
    explanation?: string;
    curve?: EmotionalCurve;
}
export interface EmotionalCurve {
    current_emotion: string;
    intensity: number;
    valence: number;
    energy: string;
    trajectory: 'improving' | 'declining' | 'stable' | 'volatile';
    trend_label: string;
    projected_shift?: string;
    window_size: number;
}
/**
 * Analyze emotion from text using OpenAI
 */
export declare function analyzeEmotion(text: string, deviceId?: string): Promise<EmotionResult>;
//# sourceMappingURL=emotionAnalyzer.d.ts.map