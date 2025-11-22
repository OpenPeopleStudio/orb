/**
 * Reflection Service
 * 
 * Migrated from repo: SomaOS, path: Services/ReflectionService.swift
 * Date: 2025-11-22
 * Role: OrbRole.TE (reflection/memory)
 * 
 * Handles reflection creation and retrieval.
 */

import { OrbRole, OrbContext } from '@orb-system/core-orb';
import { createEmbedding } from './embeddings';

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
export class ReflectionService {
  private static instance: ReflectionService;
  
  private constructor() {}
  
  static getInstance(): ReflectionService {
    if (!ReflectionService.instance) {
      ReflectionService.instance = new ReflectionService();
    }
    return ReflectionService.instance;
  }
  
  /**
   * Fetch reflections for a device
   */
  async fetchReflections(ctx: OrbContext, deviceID: string): Promise<ReflectionSnapshot[]> {
    if (ctx.role !== OrbRole.TE) {
      console.warn(`fetchReflections called with role ${ctx.role}, expected TE`);
    }
    
    // This would call the backend API
    // For now, return empty array as placeholder
    // In production, this would make an HTTP request to get-reflections endpoint
    return [];
  }
  
  /**
   * Add a new reflection
   */
  async addReflection(
    ctx: OrbContext,
    context: string,
    options?: {
      metadata?: Record<string, any>;
      persona?: string;
      mode?: string;
    }
  ): Promise<void> {
    if (ctx.role !== OrbRole.TE) {
      console.warn(`addReflection called with role ${ctx.role}, expected TE`);
    }
    
    const request: AddReflectionRequest = {
      device_id: ctx.deviceId || '',
      device_label: '', // Would come from config
      persona: options?.persona,
      mode: options?.mode,
      context: context,
      metadata: options?.metadata,
    };
    
    // This would call the backend API
    // For now, just log
    console.log(`[TE] Adding reflection: ${context.substring(0, 50)}...`);
    
    // Create embedding for the reflection asynchronously
    if (options?.persona && options?.mode) {
      // Get the reflection ID (would come from API response)
      const reflectionId = crypto.randomUUID();
      
      // Create embedding asynchronously
      createEmbedding(ctx, {
        source: 'reflection',
        sourceID: reflectionId,
        content: context,
        persona: options.persona,
        mode: options.mode,
      }).catch(error => {
        console.error('Failed to create embedding for reflection:', error);
      });
    }
  }
}

export const reflectionService = ReflectionService.getInstance();

