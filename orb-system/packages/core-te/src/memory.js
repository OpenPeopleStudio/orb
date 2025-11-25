/**
 * Memory Service
 *
 * Migrated from repo: SomaOS, path: Services/MemoryService.swift
 * Date: 2025-11-22
 * Role: OrbRole.TE (reflection/memory)
 *
 * Handles memory storage, retrieval, and semantic search.
 */
import { OrbRole } from '@orb-system/core-orb';
import { createEmbedding } from './embeddings';
/**
 * Memory Service for managing memory and embeddings
 */
export class MemoryService {
    constructor() { }
    static getInstance() {
        if (!MemoryService.instance) {
            MemoryService.instance = new MemoryService();
        }
        return MemoryService.instance;
    }
    /**
     * Create embedding for content
     */
    async createEmbedding(ctx, request) {
        if (ctx.role !== OrbRole.TE) {
            console.warn(`createEmbedding called with role ${ctx.role}, expected TE`);
        }
        await createEmbedding(ctx, request);
    }
    /**
     * Search embeddings by query
     */
    async searchEmbeddings(ctx, query) {
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
    async memoryStitch(ctx, text, options) {
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
    async storeSemanticThread(ctx, messageID, messageText, options) {
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
//# sourceMappingURL=memory.js.map