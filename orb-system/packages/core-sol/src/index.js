/**
 * core-sol
 *
 * Inference/engine layer for Orb system.
 */
export * from './chatGenerate';
export * from './intentParser';
// Export emotionAnalyzer but exclude EmotionalCurve (exported from modelClient)
export { analyzeEmotion } from './emotionAnalyzer';
export * from './modelClient';
export { nluService, NLUService } from './nlu';
export * from './insightGenerator';
export { insightGenerator } from './insightGenerator';
export * from './patternSummarizer';
export { patternSummarizer } from './patternSummarizer';
//# sourceMappingURL=index.js.map