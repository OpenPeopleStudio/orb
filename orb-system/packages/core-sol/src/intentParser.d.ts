/**
 * Intent Parser
 *
 * Migrated from repo: supabase, path: functions/parse-intent/index.ts
 * Date: 2025-11-22
 * Role: OrbRole.SOL (inference/engine)
 *
 * Extracts structured intent information from user messages.
 */
export interface IntentExtractionResult {
    intent: 'reflection' | 'task' | 'event' | 'command' | 'finance' | 'conversation' | 'none';
    tasks: Array<{
        title: string;
        priority?: number;
        due_date?: string;
        status?: string;
    }>;
    events: Array<{
        title: string;
        start_time?: string;
        end_time?: string;
        location?: string;
    }>;
    commands: Array<{
        type: 'switch_mode' | 'switch_persona';
        value: string;
    }>;
    personaHint: 'SWL' | 'Real Estate' | 'Open People' | 'Personal' | null;
    isReflection: boolean;
    confidence: number;
}
/**
 * Parse intent from text using OpenAI
 */
export declare function parseIntent(text: string): Promise<IntentExtractionResult>;
//# sourceMappingURL=intentParser.d.ts.map