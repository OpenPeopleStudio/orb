/**
 * Mode Service
 *
 * Migrated from repo: SomaOS, path: Services/ModeService.swift
 * Date: 2025-11-22
 * Role: OrbRole.LUNA (preferences/intent)
 *
 * Handles mode management and transitions.
 */
import { OrbContext, type ModeTransitionResult } from '@orb-system/core-orb';
import { Mode, ModeDescriptor, Persona, PersonaProfile } from './types';
export interface ModeResponse {
    mode: string;
}
export interface SetModeRequest {
    device_id: string;
    device_label: string;
    persona: string;
    mode: string;
}
/**
 * Mode Service for managing OS modes
 */
export declare class ModeService {
    private static instance;
    private currentMode;
    private constructor();
    static getInstance(): ModeService;
    /**
     * Fetch current mode for a device
     */
    fetchMode(ctx: OrbContext, deviceID: string): Promise<Mode>;
    /**
     * Validate mode transition before setting
     */
    validateTransition(ctx: OrbContext, toMode: Mode, persona: Persona | string, reason?: string): Promise<ModeTransitionResult>;
    /**
     * Set mode for a device (with validation)
     */
    setMode(ctx: OrbContext, mode: Mode, persona: Persona | string, options?: {
        skipValidation?: boolean;
        reason?: string;
    }): Promise<void>;
    /**
     * Get current mode
     */
    getCurrentMode(): Mode;
    /**
     * Get descriptor metadata for a given mode (defaults to current)
     */
    getModeDescriptor(mode?: Mode): ModeDescriptor;
    /**
     * Get persona profile metadata
     */
    getPersonaProfile(persona: Persona): PersonaProfile;
}
export declare const modeService: ModeService;
//# sourceMappingURL=modes.d.ts.map