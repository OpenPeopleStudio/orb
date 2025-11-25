/**
 * Chat Generation
 *
 * Migrated from repo: supabase, path: functions/chat-generate/index.ts
 * Date: 2025-11-22
 * Role: OrbRole.SOL (inference/engine)
 *
 * Generates chat responses using OpenAI with full context awareness.
 */
import { OrbContext } from '@orb-system/core-orb';
export interface ChatGenerateRequest {
    text: string;
    intent: string;
    emotion: string;
    emotion_intensity: number;
    emotion_valence: number;
    emotion_energy: string;
    persona: string;
    mode: string;
    device_id: string;
    conversation_history?: Array<{
        text: string;
        sender: string;
        timestamp: string;
    }>;
    ai_context?: {
        daily_insight?: string;
        priorities?: string[];
        recent_reflections?: string[];
        emotional_curve?: any;
        memory_stitch?: any;
        temporal_weighting?: any;
        persona_usage?: any;
        finance_context?: string;
    };
}
export interface ChatGenerateResponse {
    reply: string;
    body_language?: {
        action: string;
        emotion: string;
        intensity: number;
        duration: number;
    };
}
/**
 * Generate chat response with full context
 */
export declare function generateChatResponse(ctx: OrbContext, request: ChatGenerateRequest): Promise<ChatGenerateResponse>;
//# sourceMappingURL=chatGenerate.d.ts.map