/**
 * Mode Service
 *
 * Migrated from repo: SomaOS, path: Services/ModeService.swift
 * Date: 2025-11-22
 * Role: OrbRole.LUNA (preferences/intent)
 *
 * Handles mode management and transitions.
 */
import { OrbRole, OrbMode, validateModeTransition, getConstraintStorage, } from '@orb-system/core-orb';
import { MODE_DESCRIPTORS, PERSONA_PROFILES, } from './types';
/**
 * Mode Service for managing OS modes
 */
export class ModeService {
    constructor() {
        this.currentMode = OrbMode.EARTH;
    }
    static getInstance() {
        if (!ModeService.instance) {
            ModeService.instance = new ModeService();
        }
        return ModeService.instance;
    }
    /**
     * Fetch current mode for a device
     */
    async fetchMode(ctx, deviceID) {
        if (ctx.role !== OrbRole.LUNA) {
            console.warn(`fetchMode called with role ${ctx.role}, expected LUNA`);
        }
        // This would call the backend API
        // For now, return cached mode
        return this.currentMode;
    }
    /**
     * Validate mode transition before setting
     */
    async validateTransition(ctx, toMode, persona, reason) {
        const transitionContext = {
            fromMode: this.currentMode,
            toMode,
            reason,
            userId: ctx.userId,
            deviceId: ctx.deviceId,
            persona: (typeof persona === 'string' ? persona : persona),
            triggeredBy: 'user',
        };
        const storage = getConstraintStorage();
        const constraintSets = ctx.userId
            ? await storage.getActiveConstraintSets(ctx.userId, {
                mode: this.currentMode,
                persona: (typeof persona === 'string' ? persona : persona),
                device: ctx.deviceId,
            })
            : [];
        return validateModeTransition(transitionContext, constraintSets);
    }
    /**
     * Set mode for a device (with validation)
     */
    async setMode(ctx, mode, persona, options) {
        if (ctx.role !== OrbRole.LUNA) {
            console.warn(`setMode called with role ${ctx.role}, expected LUNA`);
        }
        // Validate transition unless explicitly skipped
        if (!options?.skipValidation) {
            const validation = await this.validateTransition(ctx, mode, persona, options?.reason);
            if (!validation.allowed) {
                console.error(`[LUNA] Mode transition denied: ${validation.reasons.join(', ')}`);
                throw new Error(`Mode transition denied: ${validation.reasons[0]}`);
            }
            if (validation.decision === 'require_confirmation') {
                console.warn(`[LUNA] Mode transition requires confirmation: ${validation.reasons.join(', ')}`);
                // In a real implementation, this would trigger a confirmation dialog
                // For now, we'll proceed but log the warning
            }
        }
        const request = {
            device_id: ctx.deviceId || '',
            device_label: '', // Would come from config
            persona: typeof persona === 'string' ? persona : persona,
            mode,
        };
        // This would call the backend API
        this.currentMode = mode;
        const descriptor = this.getModeDescriptor(mode);
        console.log(`[LUNA] Setting mode to ${mode} (${descriptor.intent}) for persona ${persona}`);
    }
    /**
     * Get current mode
     */
    getCurrentMode() {
        return this.currentMode;
    }
    /**
     * Get descriptor metadata for a given mode (defaults to current)
     */
    getModeDescriptor(mode) {
        const target = mode ?? this.currentMode;
        return MODE_DESCRIPTORS[target] ?? MODE_DESCRIPTORS[OrbMode.DEFAULT];
    }
    /**
     * Get persona profile metadata
     */
    getPersonaProfile(persona) {
        return PERSONA_PROFILES[persona];
    }
}
export const modeService = ModeService.getInstance();
//# sourceMappingURL=modes.js.map