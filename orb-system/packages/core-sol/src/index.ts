/**
 * core-sol
 * 
 * Inference/engine layer for Orb system.
 */

export * from './chatGenerate';
export * from './intentParser';
// Export emotionAnalyzer but exclude EmotionalCurve (exported from modelClient)
export { analyzeEmotion, type EmotionResult } from './emotionAnalyzer';
export * from './modelClient';
// Export nlu types and service, but exclude conflicting types (Mode, Persona, IntentExtractionResult)
export type { EmotionAnalysis } from './nlu';
export { nluService, NLUService } from './nlu';
export * from './insightGenerator';
export { insightGenerator } from './insightGenerator';
export * from './patternSummarizer';
export { patternSummarizer } from './patternSummarizer';

