/**
 * Natural Language Understanding Service
 *
 * Migrated from repo: SomaOS, path: Services/NLUService.swift
 * Date: 2025-11-22
 * Role: OrbRole.SOL (inference/engine)
 *
 * Handles intent parsing, emotion detection, and embedding creation.
 */
import { OrbContext } from '@orb-system/core-orb';
export interface IntentExtractionResult {
    intent: string;
    tasks: Array<{
        title: string;
        priority?: number;
        due_date?: string;
        status?: string;
    }>;
    events: Array<{
        title: string;
        start_time?: string;
        end_time?: string;
        location?: string;
    }>;
    commands: Array<{
        type: 'switch_mode' | 'switch_persona';
        value: string;
    }>;
    personaHint: string | null;
    isReflection: boolean;
    confidence: number;
}
export interface EmotionAnalysis {
    emotion: 'calm' | 'tense' | 'hopeful' | 'lowEnergy' | 'overwhelmed' | 'neutral';
    intensity: number;
    valence: number;
    energy: 'low' | 'neutral' | 'high';
    explanation?: string;
}
export interface Persona {
    rawValue: string;
}
export interface Mode {
    rawValue: string;
}
/**
 * NLU Service for parsing, emotion detection, and embedding creation
 */
export declare class NLUService {
    private static instance;
    private constructor();
    static getInstance(): NLUService;
    /**
     * Parse intent from text
     */
    parse(ctx: OrbContext, text: string): Promise<IntentExtractionResult>;
    /**
     * Analyze emotion from text
     */
    analyzeEmotion(ctx: OrbContext, text: string, deviceId?: string): Promise<EmotionAnalysis>;
    /**
     * Create embedding for text
     * Note: This delegates to memory service (Te layer) for actual embedding creation
     */
    createEmbedding(ctx: OrbContext, text: string, persona: Persona, mode: Mode, sourceID: string): Promise<void>;
}
export declare const nluService: NLUService;
//# sourceMappingURL=nlu.d.ts.map