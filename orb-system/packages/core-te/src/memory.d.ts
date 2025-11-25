/**
 * Memory Service
 *
 * Migrated from repo: SomaOS, path: Services/MemoryService.swift
 * Date: 2025-11-22
 * Role: OrbRole.TE (reflection/memory)
 *
 * Handles memory storage, retrieval, and semantic search.
 */
import { OrbContext } from '@orb-system/core-orb';
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
export declare class MemoryService {
    private static instance;
    private constructor();
    static getInstance(): MemoryService;
    /**
     * Create embedding for content
     */
    createEmbedding(ctx: OrbContext, request: CreateEmbeddingRequest): Promise<void>;
    /**
     * Search embeddings by query
     */
    searchEmbeddings(ctx: OrbContext, query: string): Promise<MemoryResult[]>;
    /**
     * Memory stitch - find relevant past context
     */
    memoryStitch(ctx: OrbContext, text: string, options?: {
        persona?: string;
        mode?: string;
        topK?: number;
    }): Promise<MemoryStitchResult>;
    /**
     * Store semantic thread
     */
    storeSemanticThread(ctx: OrbContext, messageID: string, messageText: string, options?: {
        label?: string;
        threadID?: string;
    }): Promise<StoreSemanticThreadResponse>;
}
export declare const memoryService: MemoryService;
//# sourceMappingURL=memory.d.ts.map