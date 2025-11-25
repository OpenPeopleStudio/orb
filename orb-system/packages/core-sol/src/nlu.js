/**
 * Natural Language Understanding Service
 *
 * Migrated from repo: SomaOS, path: Services/NLUService.swift
 * Date: 2025-11-22
 * Role: OrbRole.SOL (inference/engine)
 *
 * Handles intent parsing, emotion detection, and embedding creation.
 */
import { OrbRole } from '@orb-system/core-orb';
import { parseIntent } from './intentParser';
import { analyzeEmotion } from './emotionAnalyzer';
/**
 * NLU Service for parsing, emotion detection, and embedding creation
 */
export class NLUService {
    constructor() { }
    static getInstance() {
        if (!NLUService.instance) {
            NLUService.instance = new NLUService();
        }
        return NLUService.instance;
    }
    /**
     * Parse intent from text
     */
    async parse(ctx, text) {
        if (ctx.role !== OrbRole.SOL) {
            console.warn(`parse called with role ${ctx.role}, expected SOL`);
        }
        try {
            return await parseIntent(text);
        }
        catch (error) {
            console.error('NLUService.parse error:', error);
            return {
                intent: 'none',
                tasks: [],
                events: [],
                commands: [],
                personaHint: null,
                isReflection: false,
                confidence: 0.0,
            };
        }
    }
    /**
     * Analyze emotion from text
     */
    async analyzeEmotion(ctx, text, deviceId) {
        if (ctx.role !== OrbRole.SOL) {
            console.warn(`analyzeEmotion called with role ${ctx.role}, expected SOL`);
        }
        try {
            return await analyzeEmotion(text, deviceId);
        }
        catch (error) {
            console.error('NLUService.analyzeEmotion error:', error);
            return {
                emotion: 'neutral',
                intensity: 0.0,
                valence: 0.0,
                energy: 'neutral',
                explanation: 'Unable to analyze emotion',
            };
        }
    }
    /**
     * Create embedding for text
     * Note: This delegates to memory service (Te layer) for actual embedding creation
     */
    async createEmbedding(ctx, text, persona, mode, sourceID) {
        if (ctx.role !== OrbRole.SOL) {
            console.warn(`createEmbedding called with role ${ctx.role}, expected SOL`);
        }
        // This would delegate to MemoryService (Te layer)
        // For now, just log the intent
        console.log(`[SOL] Creating embedding for source ${sourceID}`);
    }
}
export const nluService = NLUService.getInstance();
//# sourceMappingURL=nlu.js.map