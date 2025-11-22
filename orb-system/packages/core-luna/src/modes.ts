/**
 * Mode Service
 * 
 * Migrated from repo: SomaOS, path: Services/ModeService.swift
 * Date: 2025-11-22
 * Role: OrbRole.LUNA (preferences/intent)
 * 
 * Handles mode management and transitions.
 */

import { OrbRole, OrbContext, OrbMode } from '@orb-system/core-orb';
import {
  Mode,
  ModeDescriptor,
  Persona,
  PersonaProfile,
  MODE_DESCRIPTORS,
  PERSONA_PROFILES,
} from './types';

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
export class ModeService {
  private static instance: ModeService;
  private currentMode: Mode = OrbMode.EARTH;
  
  private constructor() {}
  
  static getInstance(): ModeService {
    if (!ModeService.instance) {
      ModeService.instance = new ModeService();
    }
    return ModeService.instance;
  }
  
  /**
   * Fetch current mode for a device
   */
  async fetchMode(ctx: OrbContext, deviceID: string): Promise<Mode> {
    if (ctx.role !== OrbRole.LUNA) {
      console.warn(`fetchMode called with role ${ctx.role}, expected LUNA`);
    }
    
    // This would call the backend API
    // For now, return cached mode
    return this.currentMode;
  }
  
  /**
   * Set mode for a device
   */
  async setMode(
    ctx: OrbContext,
    mode: Mode,
    persona: Persona | string
  ): Promise<void> {
    if (ctx.role !== OrbRole.LUNA) {
      console.warn(`setMode called with role ${ctx.role}, expected LUNA`);
    }
    
    const request: SetModeRequest = {
      device_id: ctx.deviceId || '',
      device_label: '', // Would come from config
      persona: typeof persona === 'string' ? persona : (persona as string),
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
  getCurrentMode(): Mode {
    return this.currentMode;
  }

  /**
   * Get descriptor metadata for a given mode (defaults to current)
   */
  getModeDescriptor(mode?: Mode): ModeDescriptor {
    const target = mode ?? this.currentMode;
    return MODE_DESCRIPTORS[target] ?? MODE_DESCRIPTORS[OrbMode.DEFAULT];
  }

  /**
   * Get persona profile metadata
   */
  getPersonaProfile(persona: Persona): PersonaProfile {
    return PERSONA_PROFILES[persona];
  }
}

export const modeService = ModeService.getInstance();

