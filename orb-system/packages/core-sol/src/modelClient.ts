/**
 * Model Client
 * 
 * Migrated from repo: SomaOS, path: ConsciousTools/Shared/ConsciousAI.swift
 * Date: 2025-11-22
 * Role: OrbRole.SOL (inference/engine)
 * 
 * Unified AI service interface for model interactions.
 */

import { OrbRole, OrbContext } from '@orb-system/core-orb';

export interface ReflectionSnapshot {
  context: string;
  created_at: Date;
}

export interface TaskItem {
  status: string;
  title: string;
}

export interface InboxMessage {
  sender: string;
  timestamp: Date;
}

export interface CalendarEvent {
  title: string;
  start_time: Date;
}

export interface Persona {
  rawValue: string;
}

export interface Mode {
  rawValue: string;
}

export interface EmotionalCurve {
  trend_label?: string;
  projected_shift?: string;
}

export interface MoodStateModel {
  // Mood state properties
}

/**
 * Model client for AI interactions
 */
export class ModelClient {
  private static instance: ModelClient;
  
  private constructor() {}
  
  static getInstance(): ModelClient {
    if (!ModelClient.instance) {
      ModelClient.instance = new ModelClient();
    }
    return ModelClient.instance;
  }
  
  /**
   * Generate insight from recent data
   */
  async generateInsight(
    ctx: OrbContext,
    reflections: ReflectionSnapshot[],
    tasks: TaskItem[],
    messages: InboxMessage[],
    events: CalendarEvent[],
    persona: Persona,
    mode: Mode
  ): Promise<string> {
    if (ctx.role !== OrbRole.SOL) {
      console.warn(`generateInsight called with role ${ctx.role}, expected SOL`);
    }
    
    // Gather last 48h of reflections
    const cutoffDate = new Date(Date.now() - 48 * 60 * 60 * 1000);
    const recentReflections = reflections.filter(r => r.created_at >= cutoffDate);
    
    // Generate insight based on patterns
    const insightParts: string[] = [];
    
    // Reflection patterns
    if (recentReflections.length > 0) {
      const reflectionTexts = recentReflections.map(r => r.context).join(' ');
      const commonWords = this.extractCommonWords(reflectionTexts, 2);
      if (commonWords.length > 0) {
        insightParts.push(`Your reflections show a focus on ${commonWords.slice(0, 3).join(', ')}`);
      } else {
        insightParts.push(`You've recorded ${recentReflections.length} reflections recently`);
      }
    }
    
    // Task patterns
    if (tasks.length > 0) {
      const incompleteTasks = tasks.filter(t => t.status !== 'completed' && t.status !== 'done');
      if (incompleteTasks.length > 3) {
        insightParts.push(`You have ${incompleteTasks.length} active tasks`);
      }
    }
    
    // Message patterns
    const recentMessages = messages.filter(m => 
      Date.now() - m.timestamp.getTime() < 48 * 60 * 60 * 1000
    );
    if (recentMessages.length > 0) {
      const uniqueSenders = new Set(recentMessages.map(m => m.sender));
      if (uniqueSenders.size > 5) {
        insightParts.push('Multiple conversations are active');
      }
    }
    
    // Generate final insight
    if (insightParts.length === 0) {
      return 'A quiet moment. Nothing pressing demands attention.';
    } else {
      return insightParts.join('. ') + '.';
    }
  }
  
  /**
   * Interpret quantum flip result
   */
  async interpretFlip(
    ctx: OrbContext,
    result: string,
    emotionalClarity: number,
    avoidanceMarkers: string[],
    historicalPatterns: string[],
    placeContext?: string
  ): Promise<string> {
    if (ctx.role !== OrbRole.SOL) {
      console.warn(`interpretFlip called with role ${ctx.role}, expected SOL`);
    }
    
    let interpretation: string;
    
    if (emotionalClarity > 0.7) {
      interpretation = `Your clarity is high. The ${result.toLowerCase()} aligns with your inner knowing.`;
    } else if (emotionalClarity < 0.3) {
      interpretation = `Your clarity is low. The ${result.toLowerCase()} offers a moment to pause and reflect.`;
    } else {
      interpretation = `The ${result.toLowerCase()} suggests a balanced path forward.`;
    }
    
    if (placeContext) {
      interpretation += ` ${placeContext}`;
    }
    
    if (avoidanceMarkers.length > 0) {
      interpretation += ' Notice any patterns of avoidance—they may be signaling something important.';
    }
    
    if (historicalPatterns.length > 0) {
      interpretation += ' Your recent patterns suggest this moment connects to larger themes.';
    }
    
    return interpretation;
  }
  
  /**
   * Generate focus sanctuary directive
   */
  async generateDirective(
    ctx: OrbContext,
    intention: string,
    emotionalCurve: EmotionalCurve | null,
    context: string,
    persona: Persona,
    mode: Mode
  ): Promise<string> {
    if (ctx.role !== OrbRole.SOL) {
      console.warn(`generateDirective called with role ${ctx.role}, expected SOL`);
    }
    
    let directive: string;
    
    // Persona-specific directives
    switch (persona.rawValue) {
      case 'SWL':
        directive = 'Operational clarity. Focus on what moves the system forward.';
        break;
      case 'Real Estate':
        directive = 'Connection and communication. Prioritize relationships.';
        break;
      case 'Open People':
        directive = 'Architectural thinking. Build with intention.';
        break;
      case 'Personal':
        directive = 'Presence and care. Attend to what matters most.';
        break;
      default:
        directive = 'Focus on what matters most.';
    }
    
    // Mode-specific adjustments
    switch (mode.rawValue) {
      case 'Sol':
        directive = 'Deep focus. One thing at a time.';
        break;
      case 'Mars':
        directive += ' Move with urgency and precision.';
        break;
      case 'Earth':
        directive += ' Balance multiple priorities with care.';
        break;
    }
    
    return directive;
  }
  
  private extractCommonWords(text: string, minCount: number): string[] {
    const words = text.toLowerCase()
      .split(/[^a-z0-9]+/)
      .filter(w => w.length > 3);
    
    const wordCounts: Record<string, number> = {};
    for (const word of words) {
      wordCounts[word] = (wordCounts[word] || 0) + 1;
    }
    
    return Object.entries(wordCounts)
      .filter(([, count]) => count >= minCount)
      .sort(([, a], [, b]) => b - a)
      .map(([word]) => word);
  }
}

export const modelClient = ModelClient.getInstance();

