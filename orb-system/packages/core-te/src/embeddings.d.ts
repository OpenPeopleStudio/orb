/**
 * Embeddings Service
 *
 * Migrated from repo: supabase, path: functions/create-embedding/index.ts
 * Date: 2025-11-22
 * Role: OrbRole.TE (reflection/memory)
 *
 * Creates and manages embeddings for semantic search and memory.
 */
import { OrbContext } from '@orb-system/core-orb';
export interface CreateEmbeddingRequest {
    source: string;
    sourceID: string;
    content: string;
    persona: string;
    mode: string;
}
/**
 * Create embedding for content using OpenAI
 */
export declare function createEmbedding(ctx: OrbContext, request: CreateEmbeddingRequest): Promise<void>;
//# sourceMappingURL=embeddings.d.ts.map