import { OrbContext, OrbRole, getOrbPalette } from '@orb-system/core-orb';

export interface SolInsight {
  role: OrbRole;
  intent: string;
  confidence: number;
  tone: 'positive' | 'neutral' | 'urgent';
  summary: string;
  highlightColor: string;
  // Enhanced fields
  entities?: {
    what?: string[];      // What is being worked on
    when?: string[];      // Time references
    who?: string[];       // People/teams mentioned
    where?: string[];     // Locations/contexts
  };
  priority?: 'low' | 'medium' | 'high' | 'critical';
  scope?: 'task' | 'feature' | 'project' | 'strategic';
  actionable?: boolean;   // Can we act on this immediately?
  keywords?: string[];    // Key terms extracted
  sentiment?: number;     // -1 to 1 sentiment score
}

export interface SolInsightRecord {
  id: string;
  user_id: string;
  session_id: string | null;
  intent: string;
  confidence: number;
  tone: 'positive' | 'neutral' | 'urgent';
  prompt: string;
  summary: string;
  role: string;
  highlight_color: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

// Intent patterns with priority and scope
interface IntentPattern {
  pattern: RegExp;
  intent: string;
  tone: SolInsight['tone'];
  priority: SolInsight['priority'];
  scope: SolInsight['scope'];
  weight: number; // For confidence calculation
}

const intentPatterns: IntentPattern[] = [
  // Launch & Deployment
  { pattern: /(ship|launch|deploy|release|go[-\s]?live)/i, intent: 'launch-readiness', tone: 'urgent', priority: 'high', scope: 'project', weight: 0.95 },
  { pattern: /(production|prod|live)/i, intent: 'production-deployment', tone: 'urgent', priority: 'critical', scope: 'project', weight: 0.9 },
  
  // Development & Build
  { pattern: /(build|implement|develop|code|create)/i, intent: 'implementation', tone: 'neutral', priority: 'medium', scope: 'feature', weight: 0.8 },
  { pattern: /(feature|functionality|capability)/i, intent: 'feature-development', tone: 'positive', priority: 'medium', scope: 'feature', weight: 0.75 },
  
  // Design & UX
  { pattern: /(design|redesign|ui|ux|interface|experience|persona)/i, intent: 'experience-design', tone: 'positive', priority: 'medium', scope: 'feature', weight: 0.8 },
  { pattern: /(prototype|mockup|wireframe)/i, intent: 'design-iteration', tone: 'positive', priority: 'low', scope: 'task', weight: 0.7 },
  
  // Debugging & Fixes
  { pattern: /(debug|fix|bug|issue|error|problem|blocker)/i, intent: 'stability-pass', tone: 'urgent', priority: 'high', scope: 'task', weight: 0.9 },
  { pattern: /(crash|broken|failing|failed)/i, intent: 'critical-fix', tone: 'urgent', priority: 'critical', scope: 'task', weight: 0.95 },
  
  // Testing & QA
  { pattern: /(test|qa|quality|verify|validate)/i, intent: 'quality-assurance', tone: 'neutral', priority: 'medium', scope: 'feature', weight: 0.75 },
  
  // Optimization & Performance
  { pattern: /(optimize|performance|speed|improve|enhance)/i, intent: 'optimization', tone: 'positive', priority: 'medium', scope: 'feature', weight: 0.7 },
  { pattern: /(refactor|cleanup|technical[-\s]?debt)/i, intent: 'technical-improvement', tone: 'neutral', priority: 'low', scope: 'task', weight: 0.65 },
  
  // Planning & Strategy
  { pattern: /(plan|strategy|roadmap|vision)/i, intent: 'strategic-planning', tone: 'neutral', priority: 'medium', scope: 'strategic', weight: 0.8 },
  { pattern: /(research|explore|investigate|analyze)/i, intent: 'discovery', tone: 'neutral', priority: 'low', scope: 'strategic', weight: 0.7 },
  
  // Communication & Sync
  { pattern: /(sync|synchronize|standup|meeting|discuss)/i, intent: 'synchronization', tone: 'neutral', priority: 'low', scope: 'task', weight: 0.6 },
  { pattern: /(update|status|report|summary)/i, intent: 'status-update', tone: 'neutral', priority: 'low', scope: 'task', weight: 0.65 },
  
  // Documentation
  { pattern: /(document|docs|documentation|readme)/i, intent: 'documentation', tone: 'neutral', priority: 'low', scope: 'task', weight: 0.6 },
  
  // Urgent Actions
  { pattern: /(urgent|asap|immediately|critical|emergency)/i, intent: 'urgent-action', tone: 'urgent', priority: 'critical', scope: 'task', weight: 0.95 },
  { pattern: /(hotfix|patch)/i, intent: 'hotfix', tone: 'urgent', priority: 'critical', scope: 'task', weight: 0.9 },
];

// Entity extraction patterns
const entityPatterns = {
  // Time references
  time: [
    /\b(today|tomorrow|tonight|asap|now|immediately)\b/gi,
    /\b(this\s+(week|month|quarter|year))\b/gi,
    /\b(next\s+(week|month|quarter|year))\b/gi,
    /\b(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/gi,
    /\b(\d{1,2}[-/]\d{1,2}[-/]\d{2,4})\b/gi,
  ],
  // People/teams
  who: [
    /\b(team|squad|group|department)\b/gi,
    /\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\b/g, // Capitalized names
    /\b(we|us|our|team|everyone)\b/gi,
  ],
  // Locations/contexts
  where: [
    /\b(production|staging|development|local|cloud|server)\b/gi,
    /\b(frontend|backend|database|api|ui|ux)\b/gi,
  ],
};

// Sentiment analysis keywords
const sentimentKeywords = {
  positive: ['great', 'excellent', 'good', 'improve', 'better', 'enhance', 'success', 'ready', 'complete'],
  negative: ['bug', 'issue', 'problem', 'error', 'fail', 'broken', 'blocker', 'urgent', 'critical', 'bad'],
};

/**
 * Extract entities from the prompt
 */
function extractEntities(prompt: string): SolInsight['entities'] {
  const entities: SolInsight['entities'] = {};
  
  // Extract time references
  const timeMatches: string[] = [];
  entityPatterns.time.forEach(pattern => {
    const matches = prompt.match(pattern);
    if (matches) timeMatches.push(...matches);
  });
  if (timeMatches.length > 0) {
    entities.when = [...new Set(timeMatches.map(m => m.toLowerCase()))];
  }
  
  // Extract people/teams (basic)
  const whoMatches: string[] = [];
  entityPatterns.who.forEach(pattern => {
    const matches = prompt.match(pattern);
    if (matches) whoMatches.push(...matches);
  });
  if (whoMatches.length > 0) {
    entities.who = [...new Set(whoMatches)].slice(0, 5); // Limit to top 5
  }
  
  // Extract locations/contexts
  const whereMatches: string[] = [];
  entityPatterns.where.forEach(pattern => {
    const matches = prompt.match(pattern);
    if (matches) whereMatches.push(...matches);
  });
  if (whereMatches.length > 0) {
    entities.where = [...new Set(whereMatches.map(m => m.toLowerCase()))];
  }
  
  return Object.keys(entities).length > 0 ? entities : undefined;
}

/**
 * Extract keywords from prompt
 */
function extractKeywords(prompt: string): string[] {
  // Remove common words
  const stopWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'];
  const words = prompt.toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 3 && !stopWords.includes(word));
  
  return [...new Set(words)].slice(0, 10); // Top 10 unique keywords
}

/**
 * Calculate sentiment score
 */
function calculateSentiment(prompt: string): number {
  const lowerPrompt = prompt.toLowerCase();
  let score = 0;
  
  sentimentKeywords.positive.forEach(word => {
    if (lowerPrompt.includes(word)) score += 0.1;
  });
  
  sentimentKeywords.negative.forEach(word => {
    if (lowerPrompt.includes(word)) score -= 0.1;
  });
  
  return Math.max(-1, Math.min(1, score)); // Clamp between -1 and 1
}

/**
 * Determine if intent is actionable
 */
function isActionable(intent: string, prompt: string): boolean {
  const actionVerbs = ['ship', 'launch', 'deploy', 'fix', 'debug', 'build', 'create', 'implement', 'test', 'update'];
  const hasActionVerb = actionVerbs.some(verb => prompt.toLowerCase().includes(verb));
  const hasUrgency = prompt.toLowerCase().match(/(asap|urgent|now|immediately)/);
  
  return hasActionVerb || !!hasUrgency;
}

/**
 * Enhanced intent analysis
 */
export const analyzeIntent = (context: OrbContext, prompt: string): SolInsight => {
  const palette = getOrbPalette(context.role);
  
  // Find all matching patterns
  const matches = intentPatterns
    .filter(pattern => pattern.pattern.test(prompt))
    .sort((a, b) => b.weight - a.weight); // Sort by weight descending
  
  // Use the highest weighted match, or default
  const primaryMatch = matches[0];
  const intent = primaryMatch?.intent ?? 'general-strategy';
  const tone = primaryMatch?.tone ?? 'neutral';
  const priority = primaryMatch?.priority ?? 'medium';
  const scope = primaryMatch?.scope ?? 'task';
  
  // Calculate confidence based on multiple factors
  const hasMultipleMatches = matches.length > 1;
  const promptLength = prompt.length;
  const lengthFactor = Math.min(promptLength / 100, 1); // Longer prompts = more context
  const matchWeight = primaryMatch?.weight ?? 0.5;
  const clarityBonus = hasMultipleMatches ? 0.1 : 0; // Multiple matches = clearer intent
  
  const confidence = Number(Math.min(
    matchWeight * (0.7 + 0.3 * lengthFactor) + clarityBonus,
    0.99
  ).toFixed(2));
  
  // Extract entities and metadata
  const entities = extractEntities(prompt);
  const keywords = extractKeywords(prompt);
  const sentiment = calculateSentiment(prompt);
  const actionable = isActionable(intent, prompt);
  
  // Build enhanced summary
  let summary = `Detected ${intent.replace(/-/g, ' ')}`;
  if (priority === 'critical' || priority === 'high') {
    summary += ` (${priority} priority)`;
  }
  if (entities?.when && entities.when.length > 0) {
    summary += ` — Timeline: ${entities.when.join(', ')}`;
  }
  if (actionable) {
    summary += ' — Ready for action';
  }
  
  return {
    role: context.role,
    intent,
    tone,
    confidence,
    summary,
    highlightColor: palette.accent,
    entities,
    priority,
    scope,
    actionable,
    keywords,
    sentiment,
  };
};

export const summarizeSignals = (insights: SolInsight[]): string => {
  if (!insights.length) {
    return 'No active signals.';
  }

  return insights
    .map((insight) => `${insight.intent} (${Math.round(insight.confidence * 100)}%)`)
    .join(' • ');
};

/**
 * Convert SolInsight to database record format
 */
export const toInsightRecord = (
  insight: SolInsight,
  context: OrbContext,
  prompt: string,
  metadata: Record<string, unknown> = {}
): Omit<SolInsightRecord, 'created_at'> => {
  return {
    id: `sol_${context.sessionId}_${Date.now()}`,
    user_id: context.userId || 'anonymous',
    session_id: context.sessionId,
    intent: insight.intent,
    confidence: insight.confidence,
    tone: insight.tone,
    prompt,
    summary: insight.summary,
    role: 'sol',
    highlight_color: insight.highlightColor,
    metadata,
  };
};
