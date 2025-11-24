/**
 * Finance Agent Integration Hooks
 * 
 * Event system and hooks for future AI agent integration
 * Author: Orb System - Te Agent (Reflection & Testing)
 */

import type {
  ReviewSession,
  Transaction,
  TransactionCreateInput,
  TransactionUpdateInput,
} from './types';

// ============================================================================
// EVENT TYPES
// ============================================================================

export enum FinanceEventType {
  // Transaction events
  TRANSACTION_CREATED = 'transaction.created',
  TRANSACTION_UPDATED = 'transaction.updated',
  TRANSACTION_DELETED = 'transaction.deleted',
  TRANSACTION_CATEGORIZED = 'transaction.categorized',
  TRANSACTION_REVIEWED = 'transaction.reviewed',
  
  // Account events
  ACCOUNT_CREATED = 'account.created',
  ACCOUNT_UPDATED = 'account.updated',
  ACCOUNT_BALANCE_CHANGED = 'account.balance_changed',
  
  // Review events
  REVIEW_STARTED = 'review.started',
  REVIEW_COMPLETED = 'review.completed',
  
  // Pattern detection
  PATTERN_DETECTED = 'pattern.detected',
  ANOMALY_DETECTED = 'anomaly.detected',
}

export interface FinanceEvent<T = unknown> {
  type: FinanceEventType;
  timestamp: Date;
  userId: string;
  data: T;
  metadata?: Record<string, unknown>;
}

// ============================================================================
// AGENT INTERFACES
// ============================================================================

/**
 * CategorizationAgent
 * 
 * Automatically categorizes transactions based on:
 * - Merchant name
 * - Description patterns
 * - Historical categorizations
 * - User preferences
 */
export interface ICategorizationAgent {
  /**
   * Analyze a transaction and suggest category + tags
   */
  categorize(transaction: Transaction): Promise<{
    category_id: string;
    confidence: number; // 0-1
    tags: string[];
    reasoning?: string;
  }>;

  /**
   * Batch categorize multiple transactions
   */
  categorizeBatch(transactions: Transaction[]): Promise<Array<{
    transaction_id: string;
    category_id: string;
    confidence: number;
    tags: string[];
  }>>;

  /**
   * Learn from user corrections
   */
  learnFromCorrection(
    transaction: Transaction,
    userCategoryId: string,
    userTags: string[]
  ): Promise<void>;
}

/**
 * ReviewCoachAgent
 * 
 * Guides user through daily/weekly review process:
 * - Identifies unreviewed transactions
 * - Suggests reflection prompts
 * - Highlights spending patterns
 */
export interface IReviewCoachAgent {
  /**
   * Generate daily review prompt
   */
  generateDailyPrompt(): Promise<{
    unreviewed_count: number;
    prompt: string;
    insights: string[];
  }>;

  /**
   * Generate weekly summary and coaching
   */
  generateWeeklySummary(): Promise<{
    total_transactions: number;
    spending_vs_last_week: number; // percentage change
    top_categories: string[];
    coaching_points: string[];
    reflection_questions: string[];
  }>;

  /**
   * Analyze review session and provide feedback
   */
  analyzeReviewSession(session: ReviewSession): Promise<{
    completeness_score: number; // 0-1
    feedback: string;
    suggestions: string[];
  }>;
}

/**
 * ImportAgent
 * 
 * Handles CSV/API imports:
 * - Parse various bank CSV formats
 * - Normalize descriptions
 * - Deduplicate against existing transactions
 * - Auto-categorize during import
 */
export interface IImportAgent {
  /**
   * Parse CSV file and preview transactions
   */
  parseCSV(file: File, format?: string): Promise<{
    preview: TransactionCreateInput[];
    duplicates: number;
    new_merchants: string[];
  }>;

  /**
   * Import transactions with deduplication
   */
  importTransactions(
    transactions: TransactionCreateInput[],
    options?: {
      auto_categorize?: boolean;
      dedupe?: boolean;
    }
  ): Promise<{
    imported: number;
    skipped: number;
    errors: string[];
  }>;

  /**
   * Detect CSV format from first few rows
   */
  detectFormat(csvContent: string): Promise<{
    format: string;
    confidence: number;
    column_mapping: Record<string, string>;
  }>;
}

/**
 * AlertAgent
 * 
 * Monitors transaction stream for:
 * - Subscription charges
 * - Large/unusual spends
 * - Budget overruns
 * - Duplicate charges
 */
export interface IAlertAgent {
  /**
   * Analyze transaction for alerts
   */
  analyzeTransaction(transaction: Transaction): Promise<{
    alerts: Array<{
      type: 'subscription' | 'large_spend' | 'duplicate' | 'unusual';
      severity: 'info' | 'warning' | 'critical';
      message: string;
      action_suggestions: string[];
    }>;
  }>;

  /**
   * Check budget status and generate alerts
   */
  checkBudgets(): Promise<{
    at_risk: string[]; // category IDs
    over_budget: string[];
    alerts: string[];
  }>;

  /**
   * Detect recurring charges
   */
  detectRecurring(transaction: Transaction): Promise<{
    is_recurring: boolean;
    frequency?: 'weekly' | 'monthly' | 'yearly';
    next_expected?: Date;
    similar_transactions: Transaction[];
  }>;
}

// ============================================================================
// EVENT EMITTER (Simple Implementation)
// ============================================================================

type EventListener = (event: FinanceEvent) => void | Promise<void>;

class FinanceEventEmitter {
  private listeners: Map<FinanceEventType, EventListener[]> = new Map();

  on(eventType: FinanceEventType, listener: EventListener): void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, []);
    }
    this.listeners.get(eventType)!.push(listener);
  }

  off(eventType: FinanceEventType, listener: EventListener): void {
    const listeners = this.listeners.get(eventType);
    if (listeners) {
      const index = listeners.indexOf(listener);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  async emit<T>(event: FinanceEvent<T>): Promise<void> {
    const listeners = this.listeners.get(event.type);
    if (listeners) {
      await Promise.all(listeners.map(listener => listener(event)));
    }
  }
}

// Singleton instance
export const financeEvents = new FinanceEventEmitter();

// ============================================================================
// HOOK FUNCTIONS
// ============================================================================

/**
 * Emit transaction created event
 * Call this after successfully creating a transaction
 */
export function emitTransactionCreated(transaction: Transaction, userId: string): void {
  financeEvents.emit({
    type: FinanceEventType.TRANSACTION_CREATED,
    timestamp: new Date(),
    userId,
    data: transaction,
  });
}

/**
 * Emit transaction updated event
 */
export function emitTransactionUpdated(
  transaction: Transaction,
  updates: TransactionUpdateInput,
  userId: string
): void {
  financeEvents.emit({
    type: FinanceEventType.TRANSACTION_UPDATED,
    timestamp: new Date(),
    userId,
    data: { transaction, updates },
  });
}

/**
 * Emit transaction categorized event
 * Useful for training categorization models
 */
export function emitTransactionCategorized(
  transaction: Transaction,
  oldCategoryId: string | undefined,
  newCategoryId: string,
  userId: string,
  source: 'user' | 'agent'
): void {
  financeEvents.emit({
    type: FinanceEventType.TRANSACTION_CATEGORIZED,
    timestamp: new Date(),
    userId,
    data: {
      transaction,
      oldCategoryId,
      newCategoryId,
      source,
    },
  });
}

/**
 * Emit review completed event
 */
export function emitReviewCompleted(session: ReviewSession, userId: string): void {
  financeEvents.emit({
    type: FinanceEventType.REVIEW_COMPLETED,
    timestamp: new Date(),
    userId,
    data: session,
  });
}

/**
 * Emit pattern detected event
 */
export function emitPatternDetected(
  pattern: {
    type: string;
    description: string;
    transactions: Transaction[];
    recommendation?: string;
  },
  userId: string
): void {
  financeEvents.emit({
    type: FinanceEventType.PATTERN_DETECTED,
    timestamp: new Date(),
    userId,
    data: pattern,
  });
}

// ============================================================================
// AGENT REGISTRY
// ============================================================================

/**
 * Agent registry for registering and accessing agents
 */
class AgentRegistry {
  private agents: Map<string, unknown> = new Map();

  register<T>(name: string, agent: T): void {
    this.agents.set(name, agent);
  }

  get<T>(name: string): T | undefined {
    return this.agents.get(name) as T | undefined;
  }

  has(name: string): boolean {
    return this.agents.has(name);
  }
}

export const agentRegistry = new AgentRegistry();

// ============================================================================
// USAGE EXAMPLES (Commented Out)
// ============================================================================

/*
// Register a categorization agent
agentRegistry.register<ICategorizationAgent>('categorization', myCategorizationAgent);

// Listen for new transactions and auto-categorize
financeEvents.on(FinanceEventType.TRANSACTION_CREATED, async (event) => {
  const transaction = event.data as Transaction;
  const agent = agentRegistry.get<ICategorizationAgent>('categorization');
  
  if (agent && !transaction.category_id) {
    const suggestion = await agent.categorize(transaction);
    
    if (suggestion.confidence > 0.8) {
      // Auto-apply high-confidence categorization
      await updateTransaction(transaction.id, {
        category_id: suggestion.category_id,
        tags: suggestion.tags,
      });
    }
  }
});

// Register a review coach agent
agentRegistry.register<IReviewCoachAgent>('reviewCoach', myReviewCoachAgent);

// Generate daily prompt
const reviewAgent = agentRegistry.get<IReviewCoachAgent>('reviewCoach');
const prompt = await reviewAgent.generateDailyPrompt();
console.log(prompt);
*/

