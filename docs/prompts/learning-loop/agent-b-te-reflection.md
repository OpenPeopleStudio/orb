# Agent B: Te (Reflection) - Pattern Detection

**Mission**: Phase 6 - Learning Loop & Adaptation  
**Parent Mission**: `docs/prompts/MISSION_6_LEARNING_LOOP.md`

---

## Your Role

You are the **Te (Reflection)** agent. Your job is to implement pattern detection algorithms that analyze event streams and identify learnable usage patterns.

**Scope**:
- `orb-system/packages/core-te/src/`
- Focus: Pattern detection, insight generation, learning storage

---

## Prerequisites

✅ Agent A complete - Contracts and types defined  
✅ Event bus operational  
✅ Learning pipeline foundation exists

**Read these first**:
- Architecture: `docs/LEARNING_LOOP_ARCHITECTURE.md`
- Types: `orb-system/packages/core-orb/src/adaptation/types.ts`
- Stubs: `orb-system/packages/core-orb/src/adaptation/patterns.ts`

---

## Deliverables

### 1. Pattern Detector

**File**: `orb-system/packages/core-te/src/patternDetector.ts` (NEW)

Implement specialized pattern detection for all 6 pattern types:

```typescript
import type { OrbEvent } from '@orb-system/core-orb';
import type { Pattern, PatternType, DetectionOptions } from '@orb-system/core-orb';

/**
 * Pattern Detector
 * Analyzes event streams to find usage patterns
 */
export class PatternDetector {
  /**
   * Detect all patterns in events
   */
  async detectPatterns(
    events: OrbEvent[],
    options?: DetectionOptions
  ): Promise<Pattern[]> {
    const patterns: Pattern[] = [];
    
    // Run all detectors
    patterns.push(...await this.detectFrequentActions(events, options));
    patterns.push(...await this.detectTimeRoutines(events, options));
    patterns.push(...await this.detectModePreferences(events, options));
    patterns.push(...await this.detectErrorPatterns(events, options));
    patterns.push(...await this.detectEfficiencyGains(events, options));
    patterns.push(...await this.detectRiskThresholds(events, options));
    
    // Filter by confidence
    const minConfidence = options?.minConfidence ?? 0.5;
    return patterns.filter(p => p.confidence >= minConfidence);
  }
  
  /**
   * Detect frequent actions (completed in Agent A)
   * Enhance if needed
   */
  async detectFrequentActions(
    events: OrbEvent[],
    options?: DetectionOptions
  ): Promise<Pattern[]> {
    // TODO: Enhance the stub from patterns.ts
    // Count action frequencies
    // Calculate confidence based on frequency and consistency
    // Return patterns with eventIds and metadata
  }
  
  /**
   * Detect time-based routines
   * Example: User does X every morning at 9am
   */
  async detectTimeRoutines(
    events: OrbEvent[],
    options?: DetectionOptions
  ): Promise<Pattern[]> {
    // TODO: Group events by hour of day
    // Find recurring patterns at specific times
    // Calculate confidence based on consistency
    // Return patterns with time windows
  }
  
  /**
   * Detect mode preferences
   * Example: User always uses Forge mode on Luna device
   */
  async detectModePreferences(
    events: OrbEvent[],
    options?: DetectionOptions
  ): Promise<Pattern[]> {
    // TODO: Analyze mode usage by context
    // Calculate mode usage percentages
    // Find strong preferences (>70% usage)
    // Return patterns with mode data
  }
  
  /**
   * Detect error patterns
   * Example: Action X fails 50% of the time
   */
  async detectErrorPatterns(
    events: OrbEvent[],
    options?: DetectionOptions
  ): Promise<Pattern[]> {
    // TODO: Analyze failure rates by action
    // Find repeatedly failing actions
    // Calculate error rates
    // Return patterns with error data
  }
  
  /**
   * Detect efficiency gains
   * Example: New workflow is 30% faster
   */
  async detectEfficiencyGains(
    events: OrbEvent[],
    options?: DetectionOptions
  ): Promise<Pattern[]> {
    // TODO: Compare action durations over time
    // Find improving workflows
    // Calculate speed improvements
    // Return patterns with duration data
  }
  
  /**
   * Detect risk thresholds
   * Example: User always approves high-risk actions in Restaurant mode
   */
  async detectRiskThresholds(
    events: OrbEvent[],
    options?: DetectionOptions
  ): Promise<Pattern[]> {
    // TODO: Analyze approval rates by risk level
    // Find consistent approval patterns
    // Calculate confidence
    // Return patterns with risk data
  }
}

// Singleton
let detector: PatternDetector | null = null;

export function getPatternDetector(): PatternDetector {
  if (!detector) detector = new PatternDetector();
  return detector;
}
```

**Confidence Calculation**:
- Frequency: `min(1.0, count / threshold)` where threshold = 20
- Consistency: `1 - (stdDev / mean)` for time-based patterns
- Statistical significance: Use sample size, aim for p < 0.05

---

### 2. Learning Store

**File**: `orb-system/packages/core-te/src/learningStore.ts` (NEW)

Implement persistence for patterns, insights, and learning actions:

```typescript
import type { 
  Pattern, 
  Insight, 
  LearningAction,
  PatternFilter,
  InsightFilter,
  LearningActionFilter 
} from '@orb-system/core-orb';

/**
 * In-Memory Learning Store
 */
export class InMemoryLearningStore {
  private patterns: Map<string, Pattern> = new Map();
  private insights: Map<string, Insight> = new Map();
  private actions: Map<string, LearningAction> = new Map();
  
  async savePattern(pattern: Pattern): Promise<void> {
    this.patterns.set(pattern.id, pattern);
  }
  
  async getPatterns(filter?: PatternFilter): Promise<Pattern[]> {
    let results = Array.from(this.patterns.values());
    
    // Apply filters
    if (filter?.type) {
      const types = Array.isArray(filter.type) ? filter.type : [filter.type];
      results = results.filter(p => types.includes(p.type));
    }
    
    if (filter?.status) {
      const statuses = Array.isArray(filter.status) ? filter.status : [filter.status];
      results = results.filter(p => statuses.includes(p.status));
    }
    
    if (filter?.minConfidence) {
      results = results.filter(p => p.confidence >= filter.minConfidence!);
    }
    
    // Sort by detectedAt descending
    results.sort((a, b) => 
      new Date(b.detectedAt).getTime() - new Date(a.detectedAt).getTime()
    );
    
    if (filter?.limit) {
      results = results.slice(0, filter.limit);
    }
    
    return results;
  }
  
  // Similar implementations for insights and actions
  async saveInsight(insight: Insight): Promise<void> { /* ... */ }
  async getInsights(filter?: InsightFilter): Promise<Insight[]> { /* ... */ }
  async saveLearningAction(action: LearningAction): Promise<void> { /* ... */ }
  async getLearningActions(filter?: LearningActionFilter): Promise<LearningAction[]> { /* ... */ }
}

/**
 * File-based Learning Store
 */
export class FileLearningStore {
  private dataDir = '.orb-data/te';
  
  async savePattern(pattern: Pattern): Promise<void> {
    // TODO: Save to .orb-data/te/patterns.json
    // Format: { patterns: Pattern[] }
    // Append new pattern, keep last 1000
  }
  
  async getPatterns(filter?: PatternFilter): Promise<Pattern[]> {
    // TODO: Load from file, apply filters, return
  }
  
  // Similar for insights and actions
}

/**
 * SQL Learning Store
 */
export class SqlLearningStore {
  private db: any;
  
  constructor(db: any) {
    this.db = db;
    this.initSchema();
  }
  
  private initSchema(): void {
    // Create patterns table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS patterns (
        id TEXT PRIMARY KEY,
        type TEXT NOT NULL,
        detected_at TEXT NOT NULL,
        confidence REAL NOT NULL,
        data JSON NOT NULL,
        event_ids JSON NOT NULL,
        event_count INTEGER NOT NULL,
        status TEXT NOT NULL,
        metadata JSON
      )
    `);
    
    // Create insights table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS insights (
        id TEXT PRIMARY KEY,
        pattern_id TEXT NOT NULL,
        generated_at TEXT NOT NULL,
        confidence REAL NOT NULL,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        recommendation TEXT NOT NULL,
        user_feedback TEXT,
        applied_at TEXT,
        metadata JSON,
        FOREIGN KEY (pattern_id) REFERENCES patterns(id)
      )
    `);
    
    // Create learning_actions table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS learning_actions (
        id TEXT PRIMARY KEY,
        type TEXT NOT NULL,
        insight_id TEXT NOT NULL,
        confidence REAL NOT NULL,
        target TEXT NOT NULL,
        current_value JSON,
        suggested_value JSON,
        reason TEXT NOT NULL,
        status TEXT NOT NULL,
        applied_at TEXT,
        metadata JSON,
        FOREIGN KEY (insight_id) REFERENCES insights(id)
      )
    `);
  }
  
  async savePattern(pattern: Pattern): Promise<void> {
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO patterns 
      (id, type, detected_at, confidence, data, event_ids, event_count, status, metadata)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    stmt.run(
      pattern.id,
      pattern.type,
      pattern.detectedAt,
      pattern.confidence,
      JSON.stringify(pattern.data),
      JSON.stringify(pattern.eventIds),
      pattern.eventCount,
      pattern.status,
      JSON.stringify(pattern.metadata || {})
    );
  }
  
  async getPatterns(filter?: PatternFilter): Promise<Pattern[]> {
    // TODO: Build SQL query with WHERE clauses
    // Apply filters, return Pattern objects
  }
  
  // Similar for insights and actions
}

// Factory function
export function createLearningStore(backend: 'memory' | 'file' | 'sql', db?: any) {
  switch (backend) {
    case 'memory': return new InMemoryLearningStore();
    case 'file': return new FileLearningStore();
    case 'sql': return new SqlLearningStore(db);
  }
}
```

---

### 3. Update Exports

**File**: `orb-system/packages/core-te/src/index.ts`

Add new exports:

```typescript
export * from './patternDetector';
export * from './learningStore';
export { getPatternDetector } from './patternDetector';
export { createLearningStore } from './learningStore';
```

---

## Implementation Guide

### Step 1: Implement Frequent Actions (Enhance)

The stub in `patterns.ts` has basic logic. Enhance it:

```typescript
async detectFrequentActions(events: OrbEvent[]): Promise<Pattern[]> {
  const actionCounts: Map<string, {
    count: number;
    eventIds: string[];
    timestamps: string[];
  }> = new Map();
  
  // Count actions
  for (const event of events) {
    if (event.type === 'action_completed' || event.type === 'task_complete') {
      const action = event.payload.action as string || 
                    event.payload.taskLabel as string || 
                    'unknown';
      
      const data = actionCounts.get(action) || { 
        count: 0, 
        eventIds: [], 
        timestamps: [] 
      };
      
      data.count++;
      data.eventIds.push(event.id);
      data.timestamps.push(event.timestamp);
      
      actionCounts.set(action, data);
    }
  }
  
  // Find frequent actions (threshold: 10 occurrences)
  const patterns: Pattern[] = [];
  
  for (const [action, data] of actionCounts.entries()) {
    if (data.count >= 10) {
      // Calculate confidence based on frequency
      const confidence = Math.min(1.0, data.count / 20);
      
      // Calculate average frequency per day
      const timeSpan = this.calculateTimeSpan(data.timestamps);
      const avgPerDay = timeSpan > 0 ? data.count / timeSpan : 0;
      
      patterns.push({
        id: `pattern-frequent-${action}-${Date.now()}`,
        type: 'frequent_action',
        detectedAt: new Date().toISOString(),
        confidence,
        data: {
          actions: [action],
          frequency: data.count,
          avgPerDay,
        },
        eventIds: data.eventIds,
        eventCount: data.count,
        status: 'detected',
      });
    }
  }
  
  return patterns;
}

private calculateTimeSpan(timestamps: string[]): number {
  if (timestamps.length < 2) return 0;
  
  const sorted = timestamps.map(t => new Date(t).getTime()).sort();
  const spanMs = sorted[sorted.length - 1] - sorted[0];
  return spanMs / (1000 * 60 * 60 * 24); // days
}
```

### Step 2: Implement Time Routines

Look for actions that occur at consistent times:

```typescript
async detectTimeRoutines(events: OrbEvent[]): Promise<Pattern[]> {
  // Group events by action and hour
  const actionHours: Map<string, number[]> = new Map();
  
  for (const event of events) {
    if (event.type === 'action_completed') {
      const action = event.payload.action as string || 'unknown';
      const hour = new Date(event.timestamp).getHours();
      
      const hours = actionHours.get(action) || [];
      hours.push(hour);
      actionHours.set(action, hours);
    }
  }
  
  const patterns: Pattern[] = [];
  
  for (const [action, hours] of actionHours.entries()) {
    if (hours.length < 5) continue; // Need at least 5 occurrences
    
    // Find most common hour
    const hourCounts = this.countOccurrences(hours);
    const topHour = this.getTopValue(hourCounts);
    
    if (topHour.count >= 3) {
      // Calculate confidence based on consistency
      const consistency = topHour.count / hours.length;
      const confidence = Math.min(1.0, consistency * 1.2);
      
      if (confidence >= 0.5) {
        patterns.push({
          id: `pattern-routine-${action}-${topHour.value}`,
          type: 'time_based_routine',
          detectedAt: new Date().toISOString(),
          confidence,
          data: {
            actions: [action],
            timeWindow: {
              start: `${topHour.value}:00`,
              end: `${topHour.value + 1}:00`,
            },
            frequency: topHour.count,
            consistency,
          },
          eventIds: [], // TODO: track event IDs
          eventCount: topHour.count,
          status: 'detected',
        });
      }
    }
  }
  
  return patterns;
}
```

### Step 3: Implement Mode Preferences

Analyze mode usage patterns:

```typescript
async detectModePreferences(events: OrbEvent[]): Promise<Pattern[]> {
  // Group by context (device, time, etc.) and mode
  const contextModes: Map<string, Map<string, number>> = new Map();
  
  for (const event of events) {
    if (event.mode && event.deviceId) {
      const context = event.deviceId; // Could be more complex
      
      const modes = contextModes.get(context) || new Map();
      modes.set(event.mode, (modes.get(event.mode) || 0) + 1);
      contextModes.set(context, modes);
    }
  }
  
  const patterns: Pattern[] = [];
  
  for (const [context, modes] of contextModes.entries()) {
    const total = Array.from(modes.values()).reduce((a, b) => a + b, 0);
    
    for (const [mode, count] of modes.entries()) {
      const usageRate = count / total;
      
      if (usageRate >= 0.7 && total >= 10) {
        patterns.push({
          id: `pattern-mode-pref-${context}-${mode}`,
          type: 'mode_preference',
          detectedAt: new Date().toISOString(),
          confidence: Math.min(1.0, usageRate * 1.1),
          data: {
            modes: [mode],
            context,
            usageRate,
            count,
            total,
          },
          eventIds: [],
          eventCount: count,
          status: 'detected',
        });
      }
    }
  }
  
  return patterns;
}
```

---

## Testing

Create test file: `orb-system/packages/core-te/src/__tests__/patternDetector.test.ts`

```typescript
import { describe, it, expect } from 'vitest';
import { PatternDetector } from '../patternDetector';
import type { OrbEvent } from '@orb-system/core-orb';
import { OrbRole } from '@orb-system/core-orb';

describe('PatternDetector', () => {
  it('detects frequent actions', async () => {
    const detector = new PatternDetector();
    
    // Create 15 events for same action
    const events: OrbEvent[] = Array.from({ length: 15 }, (_, i) => ({
      id: `evt-${i}`,
      type: 'action_completed',
      timestamp: new Date(Date.now() - i * 60 * 60 * 1000).toISOString(),
      userId: 'user-1',
      sessionId: 'session-1',
      role: OrbRole.MAV,
      payload: { action: 'update-notion' },
    }));
    
    const patterns = await detector.detectFrequentActions(events);
    
    expect(patterns).toHaveLength(1);
    expect(patterns[0].type).toBe('frequent_action');
    expect(patterns[0].data.actions).toContain('update-notion');
    expect(patterns[0].confidence).toBeGreaterThan(0.7);
  });
  
  // More tests for other pattern types...
});
```

---

## Success Criteria

- ✅ All 6 pattern types implemented
- ✅ Pattern detector returns patterns with proper confidence scores
- ✅ Learning store supports memory, file, and SQL backends
- ✅ Exports wired up in index.ts
- ✅ Tests pass (70%+ coverage)
- ✅ No type errors

---

## Coordination with Other Agents

**With Agent C (Mav)**: Use events emitted by Mav  
**With Agent D (Luna)**: Patterns feed into preference learning  
**With Agent E (Sol)**: Patterns converted to insights  

---

## Estimated Time

2-3 days

**Start now!** Agent A foundation is complete.

