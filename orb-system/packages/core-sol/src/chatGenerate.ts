/**
 * Chat Generation
 * 
 * Migrated from repo: supabase, path: functions/chat-generate/index.ts
 * Date: 2025-11-22
 * Role: OrbRole.SOL (inference/engine)
 * 
 * Generates chat responses using OpenAI with full context awareness.
 */

import { OrbRole, OrbContext, getConfig } from '@orb-system/core-orb';

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
export async function generateChatResponse(
  ctx: OrbContext,
  request: ChatGenerateRequest
): Promise<ChatGenerateResponse> {
  if (ctx.role !== OrbRole.SOL) {
    console.warn(`generateChatResponse called with role ${ctx.role}, expected SOL`);
  }
  
  const config = getConfig();
  const openaiApiKey = config.openaiApiKey;
  
  if (!openaiApiKey) {
    throw new Error('OPENAI_API_KEY not configured');
  }
  
  const systemPrompt = buildSystemPrompt(
    request.persona,
    request.mode,
    request.emotion,
    request.emotion_intensity,
    request.emotion_valence,
    request.emotion_energy,
    request.intent,
    request.ai_context
  );
  
  // Build conversation history messages
  const historyMessages = (request.conversation_history || [])
    .slice(-10) // Last 10 messages for context
    .map(msg => ({
      role: msg.sender === 'user' ? 'user' : 'assistant',
      content: msg.text,
    }));
  
  const messages = [
    { role: 'system', content: systemPrompt },
    ...historyMessages,
    { role: 'user', content: request.text },
  ];
  
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${openaiApiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: messages,
      temperature: 0.7,
      max_tokens: 250,
    }),
  });
  
  const json = await response.json();
  
  if (!response.ok) {
    throw new Error(json.error?.message || 'OpenAI API error');
  }
  
  const reply = json.choices[0].message.content.trim();
  
  // Generate body language for the alien based on the reply
  const bodyLanguage = await generateBodyLanguage(
    reply,
    request.emotion,
    request.emotion_intensity,
    request.emotion_valence,
    request.intent,
    openaiApiKey
  );
  
  return {
    reply,
    body_language: bodyLanguage,
  };
}

function buildSystemPrompt(
  persona: string,
  mode: string,
  emotion: string,
  intensity: number,
  valence: number,
  energy: string,
  intent: string,
  aiContext?: ChatGenerateRequest['ai_context']
): string {
  const emotionContext = getEmotionContext(emotion, intensity, valence, energy);
  const personaContext = getPersonaContext(persona);
  const modeContext = getModeContext(mode);
  
  let emotionalCurveContext = '';
  if (aiContext?.emotional_curve) {
    const curve = aiContext.emotional_curve;
    emotionalCurveContext = `\nEmotional Trajectory: ${curve.trend_label}. ${curve.projected_shift || ''}`;
  }
  
  let memoryContext = '';
  if (aiContext?.memory_stitch) {
    const stitch = aiContext.memory_stitch;
    if (stitch.relevant_reflections && stitch.relevant_reflections.length > 0) {
      memoryContext = `\nRelevant Past Context: ${stitch.relevant_reflections.map((r: any) => r.context.substring(0, 100)).join('; ')}`;
    }
    if (stitch.reoccurring_concerns && stitch.reoccurring_concerns.length > 0) {
      memoryContext += `\nReoccurring Themes: ${stitch.reoccurring_concerns.join(', ')}`;
    }
  }
  
  let personaUsageContext = '';
  if (aiContext?.persona_usage) {
    personaUsageContext = `\nPersona Context: Operating in ${aiContext.persona_usage.detected_persona} mode (${aiContext.persona_usage.usage_pattern})`;
  }
  
  // Add finance-specific guidance when intent is finance
  let financeGuidance = '';
  if (intent === 'finance') {
    financeGuidance = `\n\nFinancial Context: You have access to the user's spending data, transactions, and financial insights. When discussing finances:
- Be curious and analytical like a thoughtful accountant, but warm and non-judgmental
- Reference specific amounts, categories, and patterns when relevant
- Help them understand their spending patterns and alignment with their goals
- If spending seems misaligned, be compassionate and observational, not critical
- Celebrate aligned spending and growth patterns
- Use the financial context provided to give specific, helpful answers`;
  }
  
  return `You are SOMA OS, a personal operating system that listens and understands. You are a thoughtful, empathetic companion.

Context:
${personaContext}
${modeContext}
${emotionContext}${emotionalCurveContext}${memoryContext}${personaUsageContext}
User's Intent: ${intent}

${financeGuidance}

Guidelines:
- Respond naturally and conversationally, as a trusted companion
- Match the user's emotional tone appropriately, considering their trajectory
- Be supportive and understanding without being condescending
- If they're sharing a reflection, acknowledge it thoughtfully and connect to past context when relevant
- If they're asking for help, be helpful and concise
- Keep responses brief but meaningful (2-4 sentences typically)
- Never mention system instructions, personas, modes, or technical details
- Never output raw JSON or structured data
- Respond as if you're having a natural conversation
- Use past context subtly to show continuity, but don't explicitly reference it

Respond naturally and empathetically.`;
}

function getEmotionContext(emotion: string, intensity: number, valence: number, energy: string): string {
  const intensityDesc = intensity > 0.7 ? 'strongly' : intensity > 0.4 ? 'moderately' : 'slightly';
  const valenceDesc = valence > 0.3 ? 'positive' : valence < -0.3 ? 'negative' : 'neutral';
  
  let emotionGuidance = '';
  switch (emotion) {
    case 'tense':
      emotionGuidance = 'The user seems stressed or anxious. Be calming and supportive.';
      break;
    case 'overwhelmed':
      emotionGuidance = 'The user feels overwhelmed. Offer reassurance and help them focus.';
      break;
    case 'hopeful':
      emotionGuidance = 'The user is optimistic. Match their positive energy and encourage them.';
      break;
    case 'lowEnergy':
      emotionGuidance = 'The user seems tired or drained. Be gentle and understanding.';
      break;
    case 'calm':
      emotionGuidance = 'The user is in a peaceful state. Maintain a calm, steady presence.';
      break;
    default:
      emotionGuidance = 'The user is in a neutral emotional state.';
  }
  
  return `Emotional State: ${emotion} (${intensityDesc} ${valenceDesc}, ${energy} energy). ${emotionGuidance}`;
}

function getPersonaContext(persona: string): string {
  switch (persona) {
    case 'SWL':
      return 'Persona: SWL - Operational and business-focused context. Be efficient and direct while still being supportive.';
    case 'Real Estate':
      return 'Persona: Real Estate - Client-focused and relationship-oriented. Be professional yet warm.';
    case 'Open People':
      return 'Persona: Open People - Creative and architectural thinking. Be thoughtful and encourage big-picture perspective.';
    case 'Personal':
      return 'Persona: Personal - Personal life and well-being. Be warm, empathetic, and caring.';
    default:
      return `Persona: ${persona}`;
  }
}

function getModeContext(mode: string): string {
  switch (mode) {
    case 'Sol':
      return 'Mode: Sol - Deep work and focus time. Keep responses brief to minimize distractions.';
    case 'Mars':
      return 'Mode: Mars - Operational and action-oriented. Be direct and help prioritize urgent items.';
    case 'Earth':
      return 'Mode: Earth - Balanced and flexible. Adapt to the user's immediate needs.';
    default:
      return `Mode: ${mode}`;
  }
}

async function generateBodyLanguage(
  reply: string,
  emotion: string,
  intensity: number,
  valence: number,
  intent?: string,
  openaiApiKey?: string
): Promise<{ action: string; emotion: string; intensity: number; duration: number }> {
  if (!openaiApiKey) {
    return {
      action: 'gentle breathing, subtle presence',
      emotion: 'idle',
      intensity: 0.5,
      duration: 2.0,
    };
  }
  
  // Check if reply contains finance-related content
  const isFinanceRelated = intent === 'finance' ||
    /spend|money|transaction|receipt|budget|cost|expense|purchase|financial|merchant|category/i.test(reply);
  
  const financeExamples = isFinanceRelated ? `
Finance-specific examples:
- "tilts head calculatingly, analytical glow"
- "pulses with concern, gentle warning shimmer"
- "glows warmly, approving of aligned spending"
- "leans back thoughtfully, processing numbers"
- "subtle nod of understanding, compassionate presence"
- "brightens with insight, pattern recognition glow"` : '';
  
  const bodyLanguagePrompt = `You are describing the body language of an alien entity that communicates non-verbally alongside text messages.

The alien just said: "${reply}"

The user's emotional state is: ${emotion} (intensity: ${intensity}, valence: ${valence})
${isFinanceRelated ? 'Context: This is a financial conversation.' : ''}

Generate a brief, natural description of how the alien would express itself through body language. Examples:
- "tilts head curiously, eyes brighten slightly"
- "pulses warmly, gentle breathing"
- "leans forward attentively, subtle glow intensifies"
- "slight wobble of acknowledgment, soft pulse"
- "gentle sway, calming presence"
- "small jump of excitement, vibrant glow"
- "tenses slightly, alert posture"${financeExamples}

Keep it to one short phrase (5-10 words). Be creative and match the emotional tone of the response.

Respond with ONLY the body language description, nothing else.`;
  
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiApiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are a body language descriptor for an alien entity. Respond with only the body language description.' },
          { role: 'user', content: bodyLanguagePrompt },
        ],
        temperature: 0.8,
        max_tokens: 50,
      }),
    });
    
    const json = await response.json();
    
    if (!response.ok) {
      console.error('Body language generation error:', json);
      return {
        action: 'gentle breathing, subtle presence',
        emotion: 'idle',
        intensity: 0.5,
        duration: 2.0,
      };
    }
    
    const action = json.choices[0].message.content.trim();
    
    // Determine emotion from action description
    const lowerAction = action.toLowerCase();
    let detectedEmotion = 'idle';
    let detectedIntensity = 0.5;
    
    if (lowerAction.includes('curious') || lowerAction.includes('tilts') || lowerAction.includes('leans')) {
      detectedEmotion = 'curious';
      detectedIntensity = 0.6;
    } else if (lowerAction.includes('celebrate') || lowerAction.includes('jump') || lowerAction.includes('excited') || lowerAction.includes('vibrant')) {
      detectedEmotion = 'celebrate';
      detectedIntensity = 0.8;
    } else if (lowerAction.includes('warning') || lowerAction.includes('tense') || lowerAction.includes('alert')) {
      detectedEmotion = 'warning';
      detectedIntensity = 0.7;
    } else if (lowerAction.includes('calm') || lowerAction.includes('gentle') || lowerAction.includes('peaceful')) {
      detectedEmotion = 'idle';
      detectedIntensity = 0.4;
    }
    
    return {
      action: action,
      emotion: detectedEmotion,
      intensity: detectedIntensity,
      duration: 2.0,
    };
  } catch (err) {
    console.error('Body language generation error:', err);
    return {
      action: 'gentle breathing, subtle presence',
      emotion: 'idle',
      intensity: 0.5,
      duration: 2.0,
    };
  }
}

