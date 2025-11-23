# Agent A: Architect - Learning Loop Foundation

**Mission**: Phase 6 - Learning Loop & Adaptation  
**Parent Mission**: `docs/prompts/MISSION_6_LEARNING_LOOP.md`

---

## Your Role

You are the **Architect** agent. Your job is to define the contracts, types, and architecture for the learning loop that allows Orb to learn from usage patterns.

**Scope**:
- `orb-system/packages/core-orb/src/events/`
- `orb-system/packages/core-orb/src/adaptation/`
- `docs/` (architecture docs)

---

## Prerequisites

Before starting, ensure:
- ✅ You've read `packages/forge/src/agents.ts` for your agent definition
- ✅ You understand the Orb model (Sol/Te/Mav/Luna/Orb)
- ✅ Event bus infrastructure exists in `core-orb/src/events/`
- ✅ Adaptation engine stub exists in `core-orb/src/adaptation/`

---

## Deliverables

### 1. Event Taxonomy

**File**: `orb-system/packages/core-orb/src/events/types.ts` (enhance)

Define standardized event types for the learning loop:

```typescript
// Event types for learning loop
export type OrbEventType = 
  // Mav action events
  | 'action_started'
  | 'action_completed'
  | 'action_failed'
  
  // Luna decision events
  | 'decision_made'
  | 'constraint_triggered'
  | 'preference_updated'
  | 'mode_changed'
  
  // Te reflection events
  | 'reflection_created'
  | 'pattern_detected'
  | 'insight_generated'
  
  // Sol inference events
  | 'model_called'
  | 'intent_analyzed'
  | 'recommendation_made'
  
  // User events
  | 'user_action'
  | 'user_feedback'
  | 'session_started'
  | 'session_ended';

export interface OrbEvent {
  id: string;
  type: OrbEventType;
  timestamp: string;
  role: OrbRole;
  
  // Context
  userId: string;
  deviceId: string;
  sessionId: string;
  mode?: OrbMode;
  persona?: OrbPersona;
  
  // Payload (type-specific)
  payload: Record<string, unknown>;
  
  // Metadata
  metadata?: {
    duration?: number;
    confidence?: number;
    success?: boolean;
    errorMessage?: string;
  };
}
```

### 2. Pattern Types

**File**: `orb-system/packages/core-orb/src/adaptation/types.ts` (new)

Define what patterns the system can detect:

```typescript
export type PatternType = 
  | 'frequent_action'      // User does X often
  | 'time_based_routine'   // User does Y at specific times
  | 'mode_preference'      // User prefers mode Z for context W
  | 'error_pattern'        // Action fails repeatedly
  | 'efficiency_gain'      // New workflow is faster
  | 'risk_threshold';      // User's actual risk tolerance

export interface Pattern {
  id: string;
  type: PatternType;
  detectedAt: string;
  confidence: number; // 0-1
  
  // Pattern-specific data
  data: {
    frequency?: number;
    timeWindow?: { start: string; end: string };
    actions?: string[];
    modes?: OrbMode[];
    errorRate?: number;
    avgDuration?: number;
  };
  
  // Supporting evidence
  eventIds: string[];
  eventCount: number;
  
  // Lifecycle
  status: 'detected' | 'validated' | 'applied' | 'rejected';
}

export interface Insight {
  id: string;
  patternId: string;
  generatedAt: string;
  confidence: number;
  
  // Natural language insight
  title: string;
  description: string;
  recommendation: string;
  
  // Actionable suggestions
  suggestedActions: LearningAction[];
  
  // User feedback
  userFeedback?: 'accepted' | 'rejected' | 'modified';
  appliedAt?: string;
}

export type LearningActionType =
  | 'update_preference'
  | 'adjust_constraint'
  | 'suggest_automation'
  | 'recommend_mode'
  | 'adjust_risk_threshold'
  | 'create_shortcut';

export interface LearningAction {
  id: string;
  type: LearningActionType;
  insightId: string;
  confidence: number;
  
  // What to do
  target: string; // e.g., "notification_frequency", "risk_level"
  currentValue: unknown;
  suggestedValue: unknown;
  reason: string;
  
  // Lifecycle
  status: 'pending' | 'applied' | 'rejected';
  appliedAt?: string;
}
```

### 3. Learning Pipeline

**File**: `orb-system/packages/core-orb/src/adaptation/patterns.ts` (new)

Define the pipeline interface:

```typescript
/**
 * Learning Pipeline
 * 
 * Events → Patterns → Insights → Actions
 */
export interface LearningPipeline {
  /**
   * Process a single event
   * (called by event bus for every event)
   */
  processEvent(event: OrbEvent): Promise<void>;
  
  /**
   * Detect patterns from event history
   * (called periodically or on-demand)
   */
  detectPatterns(
    events: OrbEvent[], 
    options?: DetectionOptions
  ): Promise<Pattern[]>;
  
  /**
   * Generate insights from patterns
   */
  generateInsights(patterns: Pattern[]): Promise<Insight[]>;
  
  /**
   * Apply learning (update preferences, constraints, etc.)
   */
  applyLearning(insights: Insight[]): Promise<LearningAction[]>;
}

export interface DetectionOptions {
  // Time window to analyze
  timeWindow?: { start: Date; end: Date };
  
  // Minimum confidence to report
  minConfidence?: number;
  
  // Specific pattern types to detect
  patternTypes?: PatternType[];
  
  // Filter by context
  userId?: string;
  deviceId?: string;
  mode?: OrbMode;
}

/**
 * Default implementation (stub for now)
 */
export class DefaultLearningPipeline implements LearningPipeline {
  private events: OrbEvent[] = [];
  
  async processEvent(event: OrbEvent): Promise<void> {
    this.events.push(event);
    // TODO: Real-time pattern detection for high-frequency patterns
  }
  
  async detectPatterns(
    events: OrbEvent[], 
    options?: DetectionOptions
  ): Promise<Pattern[]> {
    // TODO: Implement pattern detection algorithms
    // For now, return empty
    return [];
  }
  
  async generateInsights(patterns: Pattern[]): Promise<Insight[]> {
    // TODO: Convert patterns to insights
    return [];
  }
  
  async applyLearning(insights: Insight[]): Promise<LearningAction[]> {
    // TODO: Apply learning to preferences/constraints
    return [];
  }
}
```

### 4. Documentation

**File**: `docs/LEARNING_LOOP_ARCHITECTURE.md` (new)

Write comprehensive architecture doc:

```markdown
# Learning Loop Architecture

## Overview

The learning loop transforms Orb from a reactive system to one that learns and adapts.

## Flow

1. **Events** - Everything that happens emits an OrbEvent
2. **Pattern Detection** - Te analyzes event streams to find patterns
3. **Insight Generation** - Sol converts patterns to natural language insights
4. **Learning Actions** - Luna applies insights to preferences/constraints
5. **Feedback Loop** - User acceptance/rejection feeds back into confidence

## Components

### Event Bus (core-orb)
- Collects all events from Mav, Luna, Te, Sol, Orb-Web
- Persists to file/SQL/Supabase
- Supports real-time and batch querying

### Pattern Detector (core-te)
- Analyzes event streams
- Detects frequent actions, routines, preferences
- Calculates confidence scores

### Insight Generator (core-sol)
- Converts patterns to insights
- Generates natural language descriptions
- Suggests actionable improvements

### Preference Learning (core-luna)
- Updates preferences based on insights
- Adjusts constraints
- Manages confidence thresholds

## Confidence Thresholds

- `> 0.9`: Auto-apply (high confidence)
- `0.7 - 0.9`: Suggest to user
- `< 0.7`: Log but don't surface

## Privacy & Control

- All learning is local by default
- User can disable auto-learning per pattern type
- All applied learnings are reversible
- User can provide explicit feedback

## Examples

### Example 1: Frequent Action

**Events**: User executes "update-notion" action 3x/day for 7 days

**Pattern**: `frequent_action` with confidence 0.95

**Insight**: "You execute 'update-notion' 3x per day in Restaurant mode. Consider creating a hotkey or automation."

**Action**: `suggest_automation` - create a shortcut or scheduled task

### Example 2: Mode Preference

**Events**: User switches to Forge mode on Luna device 90% of the time

**Pattern**: `mode_preference` with confidence 0.92

**Insight**: "You prefer Forge mode on Luna. Set as default?"

**Action**: `update_preference` - change default mode to Forge for Luna device

### Example 3: Risk Threshold

**Events**: User always approves high-risk actions in Restaurant mode

**Pattern**: `risk_threshold` with confidence 0.85

**Insight**: "You consistently approve high-risk actions in Restaurant mode. Adjust risk threshold?"

**Action**: `adjust_constraint` - increase risk tolerance for Restaurant mode
```

---

## Implementation Steps

1. **Read existing event infrastructure**:
   ```bash
   cat orb-system/packages/core-orb/src/events/types.ts
   cat orb-system/packages/core-orb/src/events/bus.ts
   ```

2. **Enhance event types** with learning-specific events

3. **Create adaptation types** in new file

4. **Create pattern detection interface** with stub implementation

5. **Write architecture doc** explaining the system

6. **Update exports** in `core-orb/src/index.ts`

---

## Success Criteria

- ✅ Event taxonomy covers all 15+ event types
- ✅ Pattern types cover 6+ pattern types
- ✅ Learning pipeline interface is clear and documented
- ✅ Architecture doc is comprehensive (> 50 lines)
- ✅ Types compile without errors
- ✅ All exports are wired up

---

## Handoff to Other Agents

Once complete, the following agents can start in parallel:

- **Agent B (Te)**: Implement pattern detection algorithms
- **Agent C (Mav)**: Add event emission to action executors
- **Agent D (Luna)**: Implement preference learning
- **Agent E (Sol)**: Implement insight generation

Leave clear TODOs in the stub implementations for these agents.

---

## Estimated Time

1-2 days

