/**
 * Memory Service
 * 
 * Migrated from repo: SomaOS, path: Services/MemoryService.swift
 * Date: 2025-11-22
 * Role: OrbRole.TE (reflection/memory)
 * 
 * Handles memory storage, retrieval, and semantic search.
 */

import { OrbRole, OrbContext } from '@orb-system/core-orb';
import { createEmbedding } from './embeddings';

export interface MemoryResult {
  id: string;
  source: string;
  source_id: string;
  content: string;
  similarity: number;
}

export interface MemoryStitchResult {
  relevant_reflections?: Array<{
    context: string;
    relevance: number;
  }>;
  continuity_threads?: Array<{
    threadId: string;
    relevance: number;
    label?: string;
  }>;
  reoccurring_concerns?: string[];
}

export interface CreateEmbeddingRequest {
  source: string;
  sourceID: string;
  content: string;
  persona: string;
  mode: string;
}

export interface StoreSemanticThreadRequest {
  device_id: string;
  message_id: string;
  message_text: string;
  label?: string;
  thread_id?: string;
}

export interface StoreSemanticThreadResponse {
  success: boolean;
  thread_id: string;
  action: 'created' | 'updated' | 'matched_and_updated';
}

/**
 * Memory Service for managing memory and embeddings
 */
export class MemoryService {
  private static instance: MemoryService;
  
  private constructor() {}
  
  static getInstance(): MemoryService {
    if (!MemoryService.instance) {
      MemoryService.instance = new MemoryService();
    }
    return MemoryService.instance;
  }
  
  /**
   * Create embedding for content
   */
  async createEmbedding(
    ctx: OrbContext,
    request: CreateEmbeddingRequest
  ): Promise<void> {
    if (ctx.role !== OrbRole.TE) {
      console.warn(`createEmbedding called with role ${ctx.role}, expected TE`);
    }
    
    await createEmbedding(ctx, request);
  }
  
  /**
   * Search embeddings by query
   */
  async searchEmbeddings(ctx: OrbContext, query: string): Promise<MemoryResult[]> {
    if (ctx.role !== OrbRole.TE) {
      console.warn(`searchEmbeddings called with role ${ctx.role}, expected TE`);
    }
    
    // This would call the backend API
    // For now, return empty array as placeholder
    return [];
  }
  
  /**
   * Memory stitch - find relevant past context
   */
  async memoryStitch(
    ctx: OrbContext,
    text: string,
    options?: {
      persona?: string;
      mode?: string;
      topK?: number;
    }
  ): Promise<MemoryStitchResult> {
    if (ctx.role !== OrbRole.TE) {
      console.warn(`memoryStitch called with role ${ctx.role}, expected TE`);
    }
    
    // This would call the backend API
    // For now, return empty result as placeholder
    return {
      relevant_reflections: [],
      continuity_threads: [],
      reoccurring_concerns: [],
    };
  }
  
  /**
   * Store semantic thread
   */
  async storeSemanticThread(
    ctx: OrbContext,
    messageID: string,
    messageText: string,
    options?: {
      label?: string;
      threadID?: string;
    }
  ): Promise<StoreSemanticThreadResponse> {
    if (ctx.role !== OrbRole.TE) {
      console.warn(`storeSemanticThread called with role ${ctx.role}, expected TE`);
    }
    
    // This would call the backend API
    // For now, return placeholder response
    return {
      success: true,
      thread_id: options?.threadID || crypto.randomUUID(),
      action: options?.threadID ? 'updated' : 'created',
    };
  }
}

export const memoryService = MemoryService.getInstance();

