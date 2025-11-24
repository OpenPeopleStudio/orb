# Finance Agent Integration Guide

This document describes how to integrate AI agents with the Orb Finance system.

---

## Overview

The finance system is designed with **agent-ready hooks** that allow AI agents to:
- Auto-categorize transactions
- Coach users through reviews
- Import and parse bank data
- Detect patterns and anomalies
- Send alerts and notifications

All agent interfaces are defined in `apps/orb-web/src/lib/finance/agent-hooks.ts`.

---

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                    User Interface                    │
│        (Manual entry, review flows, etc.)            │
└───────────────────┬──────────────────────────────────┘
                    │
                    ↓ Emit Events
┌─────────────────────────────────────────────────────┐
│              Finance Event System                    │
│  - transaction.created    - transaction.updated     │
│  - review.completed       - pattern.detected        │
└───────────────────┬──────────────────────────────────┘
                    │
                    ↓ Subscribe
┌─────────────────────────────────────────────────────┐
│                   AI Agents                          │
│  - CategorizationAgent  - ReviewCoachAgent          │
│  - ImportAgent          - AlertAgent                │
└─────────────────────────────────────────────────────┘
```

---

## Agent Types

### 1. CategorizationAgent

**Purpose**: Automatically categorize transactions based on patterns.

**Interface**:
```typescript
interface ICategorizationAgent {
  categorize(transaction: Transaction): Promise<{
    category_id: string;
    confidence: number; // 0-1
    tags: string[];
    reasoning?: string;
  }>;

  categorizeBatch(transactions: Transaction[]): Promise<...>;
  
  learnFromCorrection(
    transaction: Transaction,
    userCategoryId: string,
    userTags: string[]
  ): Promise<void>;
}
```

**How it works**:
1. Listens to `transaction.created` events
2. Analyzes `description_raw`, `merchant_name`, and `amount`
3. Suggests category + tags with confidence score
4. If confidence > 0.8, auto-applies categorization
5. Learns from user corrections via `learnFromCorrection()`

**Implementation Ideas**:
- Use LLM (GPT-4, Claude) with few-shot prompting
- Fine-tune on user's historical categorizations
- Use embeddings + similarity search for merchant matching

---

### 2. ReviewCoachAgent

**Purpose**: Guide users through daily/weekly review rituals.

**Interface**:
```typescript
interface IReviewCoachAgent {
  generateDailyPrompt(): Promise<{
    unreviewed_count: number;
    prompt: string;
    insights: string[];
  }>;

  generateWeeklySummary(): Promise<{
    total_transactions: number;
    spending_vs_last_week: number;
    top_categories: string[];
    coaching_points: string[];
    reflection_questions: string[];
  }>;

  analyzeReviewSession(session: ReviewSession): Promise<{
    completeness_score: number;
    feedback: string;
    suggestions: string[];
  }>;
}
```

**How it works**:
1. Runs daily (triggered by cron or manual review start)
2. Fetches unreviewed transactions
3. Generates personalized prompt:
   - "You have 7 unreviewed transactions since yesterday"
   - "Your dining spending this week is 20% higher than last week"
4. After review, analyzes intent labels and provides feedback

**Implementation Ideas**:
- Use LLM to generate coaching prompts
- Track spending patterns over time
- Personalize based on user's goals and past reviews

---

### 3. ImportAgent

**Purpose**: Parse bank CSVs and import transactions with deduplication.

**Interface**:
```typescript
interface IImportAgent {
  parseCSV(file: File, format?: string): Promise<{
    preview: TransactionCreateInput[];
    duplicates: number;
    new_merchants: string[];
  }>;

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

  detectFormat(csvContent: string): Promise<{
    format: string;
    confidence: number;
    column_mapping: Record<string, string>;
  }>;
}
```

**How it works**:
1. User uploads CSV file
2. Agent detects format (RBC, TD, Amex, etc.)
3. Parses and normalizes data:
   - Maps columns to `date_posted`, `amount`, `description_raw`
   - Cleans descriptions (remove bank noise)
   - Detects duplicates (same account + date + amount)
4. Shows preview with duplicates highlighted
5. On confirm, imports new transactions
6. Optionally auto-categorizes via CategorizationAgent

**Implementation Ideas**:
- Maintain CSV format library (RBC, TD, etc.)
- Use fuzzy matching for duplicate detection
- Extract merchant names via regex/LLM

---

### 4. AlertAgent

**Purpose**: Monitor transactions and send real-time alerts.

**Interface**:
```typescript
interface IAlertAgent {
  analyzeTransaction(transaction: Transaction): Promise<{
    alerts: Array<{
      type: 'subscription' | 'large_spend' | 'duplicate' | 'unusual';
      severity: 'info' | 'warning' | 'critical';
      message: string;
      action_suggestions: string[];
    }>;
  }>;

  checkBudgets(): Promise<{
    at_risk: string[]; // category IDs
    over_budget: string[];
    alerts: string[];
  }>;

  detectRecurring(transaction: Transaction): Promise<{
    is_recurring: boolean;
    frequency?: 'weekly' | 'monthly' | 'yearly';
    next_expected?: Date;
    similar_transactions: Transaction[];
  }>;
}
```

**How it works**:
1. Listens to `transaction.created` events
2. Runs pattern detection:
   - Is this a subscription charge? (recurring merchant)
   - Is this unusually large? (> 2σ from average)
   - Is this a duplicate? (same merchant + amount within 24h)
3. Generates alerts:
   - "New subscription detected: Netflix $19.99/month"
   - "Large purchase: $450 at Home Depot (2x your average)"
4. Sends notifications via Orb notification system

**Implementation Ideas**:
- Track historical transactions per merchant
- Use statistical analysis for anomaly detection
- Integrate with Orb notification/toast system

---

## Event System

### Emitting Events

Emit finance events to notify agents:

```typescript
import {
  financeEvents,
  FinanceEventType,
  emitTransactionCreated,
  emitTransactionCategorized,
} from '@/lib/finance/agent-hooks';

// After creating a transaction
const transaction = await createTransaction(input);
emitTransactionCreated(transaction, userId);

// After user categorizes manually
await updateTransaction(id, { category_id });
emitTransactionCategorized(transaction, oldCategoryId, newCategoryId, userId, 'user');
```

### Listening to Events

Agents subscribe to events:

```typescript
import { financeEvents, FinanceEventType } from '@/lib/finance/agent-hooks';

financeEvents.on(FinanceEventType.TRANSACTION_CREATED, async (event) => {
  const transaction = event.data;
  
  // Do something with the transaction
  console.log('New transaction:', transaction);
});
```

### Event Types

- `transaction.created` - New transaction added
- `transaction.updated` - Transaction modified
- `transaction.categorized` - Category changed
- `transaction.reviewed` - Review status changed
- `review.completed` - User finished a review session
- `pattern.detected` - Agent detected a pattern
- `anomaly.detected` - Unusual transaction flagged

---

## Agent Registry

Register and access agents:

```typescript
import { agentRegistry } from '@/lib/finance/agent-hooks';

// Register an agent
agentRegistry.register<ICategorizationAgent>('categorization', myAgent);

// Get an agent
const agent = agentRegistry.get<ICategorizationAgent>('categorization');

// Check if registered
if (agentRegistry.has('categorization')) {
  // ...
}
```

---

## Implementation Example: Auto-Categorization

```typescript
import {
  financeEvents,
  FinanceEventType,
  agentRegistry,
  type ICategorizationAgent,
} from '@/lib/finance/agent-hooks';

// 1. Create a categorization agent
class SimpleCategorization Agent implements ICategorizationAgent {
  async categorize(transaction: Transaction) {
    // Use LLM or rules to categorize
    const prompt = `Categorize this transaction:
    Description: ${transaction.description_raw}
    Amount: ${transaction.amount}
    
    Choose from: Groceries, Dining Out, Transportation, etc.`;
    
    const response = await callLLM(prompt);
    
    return {
      category_id: response.category_id,
      confidence: response.confidence,
      tags: response.tags,
      reasoning: response.reasoning,
    };
  }

  async categorizeBatch(transactions: Transaction[]) {
    return Promise.all(transactions.map(t => this.categorize(t)));
  }

  async learnFromCorrection(transaction, userCategoryId, userTags) {
    // Store correction for future training
    await storeTrainingExample({
      description: transaction.description_raw,
      correct_category: userCategoryId,
      correct_tags: userTags,
    });
  }
}

// 2. Register the agent
const agent = new SimpleCategorizationAgent();
agentRegistry.register('categorization', agent);

// 3. Listen for new transactions
financeEvents.on(FinanceEventType.TRANSACTION_CREATED, async (event) => {
  const transaction = event.data as Transaction;
  
  if (!transaction.category_id) {
    const result = await agent.categorize(transaction);
    
    if (result.confidence > 0.8) {
      // Auto-apply high-confidence categorization
      await updateTransaction(transaction.id, {
        category_id: result.category_id,
        tags: result.tags,
      });
      
      // Emit categorized event
      emitTransactionCategorized(
        transaction,
        undefined,
        result.category_id,
        event.userId,
        'agent'
      );
    }
  }
});

// 4. Learn from user corrections
financeEvents.on(FinanceEventType.TRANSACTION_CATEGORIZED, async (event) => {
  const { transaction, oldCategoryId, newCategoryId, source } = event.data;
  
  if (source === 'user' && oldCategoryId) {
    // User corrected agent's categorization - learn from it
    await agent.learnFromCorrection(
      transaction,
      newCategoryId,
      transaction.tags
    );
  }
});
```

---

## Integration Checklist

To add a new agent:

- [ ] Implement the agent interface (`ICategorizationAgent`, etc.)
- [ ] Register the agent via `agentRegistry.register()`
- [ ] Subscribe to relevant events via `financeEvents.on()`
- [ ] Emit events after agent actions
- [ ] Test with sample transactions
- [ ] Add UI for agent settings (enable/disable, confidence threshold, etc.)
- [ ] Add documentation to this file

---

## Future Enhancements

### Phase 2.0 (Agent Integration)
- Build CategorizationAgent with LLM
- Build ReviewCoachAgent with personalized prompts
- Add UI for reviewing agent suggestions

### Phase 2.5 (Import & Alerts)
- Build ImportAgent with CSV parsing
- Build AlertAgent with pattern detection
- Add notification system integration

### Phase 3.0 (Advanced Agents)
- Forecasting agent (predict future spending)
- Budget optimization agent (suggest better budgets)
- Investment tracking agent (for investment accounts)

---

## Testing Agents

Mock events for testing:

```typescript
import { financeEvents, FinanceEventType } from '@/lib/finance/agent-hooks';

// Emit a test event
financeEvents.emit({
  type: FinanceEventType.TRANSACTION_CREATED,
  timestamp: new Date(),
  userId: 'test-user',
  data: mockTransaction,
});

// Verify agent behavior
const agent = agentRegistry.get<ICategorizationAgent>('categorization');
const result = await agent.categorize(mockTransaction);
expect(result.category_id).toBe('groceries');
```

---

## Questions?

See:
- `apps/orb-web/src/lib/finance/agent-hooks.ts` for interface definitions
- `docs/finance/finance_overview.md` for system overview
- `docs/prompts/forge-agent-bootloader.md` for multi-agent coordination

---

**Status**: Agent hooks implemented, interfaces defined, event system ready.  
**Next**: Implement CategorizationAgent in Phase 2.0.

