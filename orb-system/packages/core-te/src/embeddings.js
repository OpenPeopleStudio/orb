/**
 * Embeddings Service
 *
 * Migrated from repo: supabase, path: functions/create-embedding/index.ts
 * Date: 2025-11-22
 * Role: OrbRole.TE (reflection/memory)
 *
 * Creates and manages embeddings for semantic search and memory.
 */
import { OrbRole, getConfig } from '@orb-system/core-orb';
/**
 * Create embedding for content using OpenAI
 */
export async function createEmbedding(ctx, request) {
    if (ctx.role !== OrbRole.TE) {
        console.warn(`createEmbedding called with role ${ctx.role}, expected TE`);
    }
    const config = getConfig();
    const openaiApiKey = config.openaiApiKey;
    if (!openaiApiKey) {
        throw new Error('OPENAI_API_KEY not configured');
    }
    // Create embedding using OpenAI
    const embedReq = await fetch('https://api.openai.com/v1/embeddings', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${openaiApiKey}`,
        },
        body: JSON.stringify({
            input: request.content,
            model: 'text-embedding-3-small', // Using small model for 1536 dimensions
        }),
    });
    if (!embedReq.ok) {
        const errorData = await embedReq.json();
        throw new Error(errorData.error?.message || 'OpenAI API error');
    }
    const embedData = await embedReq.json();
    const vector = embedData.data[0].embedding;
    // Store embedding in database
    // Note: This would require database access, which should be handled by a backend service
    // For now, just log the intent
    console.log(`[TE] Created embedding for source ${request.source}:${request.sourceID}`);
    // In production, this would insert into the embeddings table:
    // await supabase.from('embeddings').insert({
    //   device_id: ctx.deviceId,
    //   persona: request.persona,
    //   mode: request.mode,
    //   source: request.source,
    //   source_id: request.sourceID,
    //   content: request.content,
    //   embedding: vector,
    // });
}
//# sourceMappingURL=embeddings.js.map