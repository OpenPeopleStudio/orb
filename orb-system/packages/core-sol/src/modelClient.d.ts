/**
 * Model Client
 *
 * Migrated from repo: SomaOS, path: ConsciousTools/Shared/ConsciousAI.swift
 * Date: 2025-11-22
 * Role: OrbRole.SOL (inference/engine)
 *
 * Unified AI service interface for model interactions.
 */
import { OrbContext } from '@orb-system/core-orb';
export interface ReflectionSnapshot {
    context: string;
    created_at: Date;
}
export interface TaskItem {
    status: string;
    title: string;
}
export interface InboxMessage {
    sender: string;
    timestamp: Date;
}
export interface CalendarEvent {
    title: string;
    start_time: Date;
}
export interface Persona {
    rawValue: string;
}
export interface Mode {
    rawValue: string;
}
export interface EmotionalCurve {
    trend_label?: string;
    projected_shift?: string;
}
export interface MoodStateModel {
}
/**
 * Model client for AI interactions
 */
export declare class ModelClient {
    private static instance;
    private constructor();
    static getInstance(): ModelClient;
    /**
     * Generate insight from recent data
     */
    generateInsight(ctx: OrbContext, reflections: ReflectionSnapshot[], tasks: TaskItem[], messages: InboxMessage[], events: CalendarEvent[], persona: Persona, mode: Mode): Promise<string>;
    /**
     * Interpret quantum flip result
     */
    interpretFlip(ctx: OrbContext, result: string, emotionalClarity: number, avoidanceMarkers: string[], historicalPatterns: string[], placeContext?: string): Promise<string>;
    /**
     * Generate focus sanctuary directive
     */
    generateDirective(ctx: OrbContext, intention: string, emotionalCurve: EmotionalCurve | null, context: string, persona: Persona, mode: Mode): Promise<string>;
    private extractCommonWords;
}
export declare const modelClient: ModelClient;
//# sourceMappingURL=modelClient.d.ts.map