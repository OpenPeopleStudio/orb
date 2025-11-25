/**
 * Reflection Service
 *
 * Migrated from repo: SomaOS, path: Services/ReflectionService.swift
 * Date: 2025-11-22
 * Role: OrbRole.TE (reflection/memory)
 *
 * Handles reflection creation and retrieval.
 */
import { OrbContext } from '@orb-system/core-orb';
export interface ReflectionSnapshot {
    id: string;
    device_id: string;
    persona?: string;
    mode?: string;
    context: string;
    metadata?: Record<string, any>;
    created_at: Date;
}
export interface AddReflectionRequest {
    device_id: string;
    device_label: string;
    persona?: string;
    mode?: string;
    context: string;
    metadata?: Record<string, any>;
}
export interface AddReflectionResponse {
    success: boolean;
}
/**
 * Reflection Service for managing reflections
 */
export declare class ReflectionService {
    private static instance;
    private constructor();
    static getInstance(): ReflectionService;
    /**
     * Fetch reflections for a device
     */
    fetchReflections(ctx: OrbContext, deviceID: string): Promise<ReflectionSnapshot[]>;
    /**
     * Add a new reflection
     */
    addReflection(ctx: OrbContext, context: string, options?: {
        metadata?: Record<string, any>;
        persona?: string;
        mode?: string;
    }): Promise<void>;
}
export declare const reflectionService: ReflectionService;
//# sourceMappingURL=reflection.d.ts.map