/**
 * Intent Parser
 * 
 * Migrated from repo: supabase, path: functions/parse-intent/index.ts
 * Date: 2025-11-22
 * Role: OrbRole.SOL (inference/engine)
 * 
 * Extracts structured intent information from user messages.
 */

import { OrbRole, OrbContext, getConfig } from '@orb-system/core-orb';

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
export async function parseIntent(text: string): Promise<IntentExtractionResult> {
  const config = getConfig();
  const openaiApiKey = config.openaiApiKey;
  
  if (!openaiApiKey) {
    throw new Error('OPENAI_API_KEY not configured');
  }
  
  const systemPrompt = `You are an intent extraction system for SOMA OS. Analyze the user's message and extract structured information.

Return ONLY valid JSON with this exact structure:
{
  "intent": "reflection" | "task" | "event" | "command" | "finance" | "conversation" | "none",
  "tasks": [{"title": "...", "priority": 0.0-1.0, "due_date": "ISO8601", "status": "..."}],
  "events": [{"title": "...", "start_time": "ISO8601", "end_time": "ISO8601", "location": "..."}],
  "commands": [{"type": "switch_mode" | "switch_persona", "value": "..."}],
  "personaHint": "SWL" | "Real Estate" | "Open People" | "Personal" | null,
  "isReflection": boolean,
  "confidence": 0.0-1.0
}

Guidelines:
- Intent: primary category of the message. Use "finance" for questions about spending, money, transactions, receipts, budgets, or financial patterns.
- Tasks: extract actionable items with title, optional priority (0.0-1.0), due_date (ISO8601), status
- Events: extract calendar events with title, start_time (ISO8601), end_time (ISO8601), optional location
- Commands: detect mode/persona switches (type: "switch_mode" or "switch_persona", value: mode/persona name)
- Persona hint: infer persona context from message content
- Is reflection: true if message is a thought, feeling, or reflection
- Confidence: how confident you are in the extraction (0.0-1.0)

Finance intent keywords: spending, money, transaction, receipt, budget, cost, expense, purchase, bought, spent, financial, merchant, category, monthly spend, how much, what did I spend`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${openaiApiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: text },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3,
    }),
  });
  
  const json = await response.json();
  
  if (!response.ok) {
    throw new Error(json.error?.message || 'OpenAI API error');
  }
  
  const content = json.choices[0].message.content;
  let parsedResult: IntentExtractionResult;
  
  try {
    parsedResult = JSON.parse(content);
  } catch {
    parsedResult = {
      intent: 'none',
      tasks: [],
      events: [],
      commands: [],
      personaHint: null,
      isReflection: false,
      confidence: 0.0,
    };
  }
  
  return {
    intent: parsedResult.intent || 'none',
    tasks: parsedResult.tasks || [],
    events: parsedResult.events || [],
    commands: parsedResult.commands || [],
    personaHint: parsedResult.personaHint || null,
    isReflection: parsedResult.isReflection || false,
    confidence: parsedResult.confidence ?? 0.5,
  };
}

