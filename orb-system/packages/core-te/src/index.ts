/**
 * core-te
 * 
 * Reflection/memory layer for Orb system.
 */

export * from './reflection';
export * from './reflectionEngine';
export * from './embeddings';
// export * from './evaluation'; // File doesn't exist yet
export * from './reflectionHelpers';
export * from './inMemoryReflectionStore';
export * from './fileReflectionStore';
export * from './sqlStore';
export * from './dbReflectionStore';
export * from './supabaseReflectionStore';

// Export memory types explicitly to avoid conflict with CreateEmbeddingRequest
export type {
  MemoryResult,
  MemoryStitchResult,
  StoreSemanticThreadRequest,
  StoreSemanticThreadResponse,
} from './memory';
export { MemoryService, memoryService } from './memory';

