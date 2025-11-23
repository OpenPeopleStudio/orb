# Learning Loop Architecture

**Phase 6: Learning & Adaptation**  
**Version**: 1.0  
**Last Updated**: 2025-11-22

---

## Overview

The learning loop transforms Orb from a reactive system into one that learns from usage patterns and adapts behavior automatically. This document defines the architecture, data flow, and implementation strategy.

**Vision**: An OS that learns your preferences, adapts to your workflow, and proactively suggests improvements.

---

## Architecture

### High-Level Flow

```
User Action
    ↓
Mav (executes action) → Event Bus → File/SQL/Supabase Sinks
    ↓                       ↓
Luna (evaluates)     Te (analyzes events)
    ↑                       ↓
    └─────────────  Pattern Detection
                           ↓
                    Insight Generation (Sol)
                           ↓
                    Learning Actions (Luna)
                           ↓
                    User Review (Orb-Web)
                           ↓
                    Apply or Reject
                           ↓
                    Update Preferences/Constraints
```

### Core Pipeline

**Events → Patterns → Insights → Actions**

1. **Events**: Everything that happens emits structured events
2. **Patterns**: Te analyzes events to find usage patterns
3. **Insights**: Sol converts patterns to natural language insights
4. **Actions**: Luna applies insights to preferences/constraints
5. **Feedback**: User acceptance/rejection feeds back into confidence

---

## Components

### 1. Event Bus (`core-orb/src/events/`)

**Purpose**: Collect all events from every layer

**Key Types**:
```typescript
OrbEventType = 
  | 'action_started' | 'action_completed' | 'action_failed'
  | 'decision_made' | 'constraint_triggered' | 'preference_updated'
  | 'pattern_detected' | 'insight_generated'
  | 'user_action' | 'user_feedback'
```

**Features**:
- In-memory store (last 10,000 events)
- Pluggable sinks (file, SQL, Supabase)
- Query API with filters
- Real-time statistics

**Implementation**: ✅ Complete (Phase 4)

---

### 2. Pattern Detector (`core-te/src/patternDetector.ts`)

**Purpose**: Analyze event streams to find patterns

**Pattern Types**:
1. **frequent_action**: User does X often
   - Example: "update-notion" executed 3x/day
   - Confidence: Based on frequency and consistency
   
2. **time_based_routine**: User does Y at specific times
   - Example: Check email every morning at 9am
   - Confidence: Based on time clustering
   
3. **mode_preference**: User prefers mode Z for context W
   - Example: Always use Forge mode on Luna device
   - Confidence: Based on mode usage percentage
   
4. **error_pattern**: Action fails repeatedly
   - Example: File write fails 50% of the time
   - Confidence: Based on error rate
   
5. **efficiency_gain**: New workflow is faster
   - Example: New approach is 30% faster
   - Confidence: Based on duration comparison
   
6. **risk_threshold**: User's actual risk tolerance
   - Example: User always approves high-risk actions
   - Confidence: Based on approval rate

**Algorithm**:
```typescript
// Batch processing (runs periodically)
async detectPatterns(events: OrbEvent[], options: DetectionOptions): Promise<Pattern[]> {
  1. Filter events by timeWindow, userId, mode, etc.
  2. For each pattern type:
     - Run specialized detection algorithm
     - Calculate confidence score
     - Gather supporting evidence (event IDs)
  3. Filter by minimum confidence threshold
  4. Return detected patterns
}
```

**Confidence Calculation**:
- Frequency: `min(1.0, count / threshold)`
- Consistency: `1 - (stdDev / mean)`
- Statistical significance: P-value < 0.05

**Implementation**: ⚪ TODO (Agent B - Te)

---

### 3. Insight Generator (`core-sol/src/insightGenerator.ts`)

**Purpose**: Convert patterns to natural language insights

**Input**: Pattern object
**Output**: Insight with title, description, recommendation

**Examples**:

**Pattern**: `frequent_action`, confidence 0.95
```json
{
  "type": "frequent_action",
  "data": {
    "action": "update-notion",
    "frequency": 21,
    "avgPerDay": 3
  }
}
```

**Insight**:
```
Title: "Frequent Notion Updates Detected"
Description: "You execute 'update-notion' 3 times per day in Restaurant mode (21 times over 7 days)."
Recommendation: "Consider creating a hotkey (⌘+Shift+N) or scheduled automation to streamline this workflow."
```

**NLG Strategy**:
- Template-based for v1 (fast, predictable)
- LLM-enhanced for v2 (natural, contextual)
- Personalized based on user's persona

**Implementation**: ⚪ TODO (Agent E - Sol)

---

### 4. Preference Learning (`core-luna/src/preferenceLearning.ts`)

**Purpose**: Update preferences based on learned patterns

**Learning Actions**:

1. **update_preference**: Change user preference
   - Example: Default mode → Forge (on Luna device)
   - Threshold: 0.9 confidence

2. **adjust_constraint**: Modify constraint rules
   - Example: Increase risk tolerance for Restaurant mode
   - Threshold: 0.85 confidence

3. **suggest_automation**: Propose automation
   - Example: Auto-run task at specific time
   - Threshold: 0.8 confidence

4. **recommend_mode**: Suggest mode for context
   - Example: Use Mars mode for morning routine
   - Threshold: 0.75 confidence

5. **adjust_risk_threshold**: Change risk settings
   - Example: Allow high-risk actions in specific mode
   - Threshold: 0.9 confidence

6. **create_shortcut**: Add keyboard shortcut
   - Example: ⌘+Shift+N for frequent action
   - Threshold: 0.85 confidence

**Auto-Apply Logic**:
```typescript
if (confidence > 0.9) {
  // Auto-apply (high confidence)
  applyLearning(action);
  notifyUser("Applied: " + action.description);
} else if (confidence > 0.7) {
  // Suggest to user (medium confidence)
  showSuggestion(action);
  waitForUserApproval();
} else if (confidence > 0.5) {
  // Log only (low confidence)
  logInsight(action);
} else {
  // Ignore (very low confidence)
}
```

**Implementation**: ⚪ TODO (Agent D - Luna)

---

### 5. Learning Store (`core-te/src/learningStore.ts`)

**Purpose**: Persist patterns, insights, and learning actions

**Storage Backends**:
1. **File-based**: `.orb-data/te/patterns.json`, `.orb-data/te/insights.json`
2. **SQL-based**: `patterns`, `insights`, `learning_actions` tables
3. **Supabase**: Remote sync (future)

**Schema**:

```sql
-- Patterns table
CREATE TABLE patterns (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  detected_at TEXT NOT NULL,
  confidence REAL NOT NULL,
  data JSON NOT NULL,
  event_ids JSON NOT NULL,
  event_count INTEGER NOT NULL,
  status TEXT NOT NULL,
  metadata JSON
);

-- Insights table
CREATE TABLE insights (
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
);

-- Learning actions table
CREATE TABLE learning_actions (
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
);
```

**File Format** (`.orb-data/te/patterns.json`):
```json
{
  "patterns": [
    {
      "id": "pattern-freq-update-notion-123",
      "type": "frequent_action",
      "detectedAt": "2025-11-22T10:30:00Z",
      "confidence": 0.95,
      "data": {
        "action": "update-notion",
        "frequency": 21
      },
      "eventIds": ["evt-1", "evt-2", ...],
      "eventCount": 21,
      "status": "detected"
    }
  ]
}
```

**Implementation**: ⚪ TODO (Agent B - Te)

---

### 6. Insights Dashboard (`apps/orb-web/src/components/InsightsDashboard.tsx`)

**Purpose**: Visualize patterns, insights, and learning

**UI Components**:

1. **Insights List**:
   - Recent insights with confidence bars
   - Accept/Reject buttons
   - "Show Details" modal

2. **Pattern Visualization**:
   - Frequency chart (action X done Y times)
   - Time heatmap (when do you do Z?)
   - Mode usage pie chart
   - Device distribution

3. **Learning Timeline**:
   - "Today: Learned you prefer Forge mode on Luna"
   - "Yesterday: Created automation for frequent task"
   - "Last week: Adjusted risk threshold"

4. **Approval Interface**:
   - Review pending suggestions
   - Preview changes before applying
   - Provide feedback (👍/👎)
   - Override auto-applied learnings

**Wireframe**:
```
┌─────────────────────────────────────────┐
│ Insights Dashboard                      │
├─────────────────────────────────────────┤
│ 📊 Recent Patterns                      │
│                                         │
│ 🟢 Frequent Action (95% confidence)    │
│    You execute 'update-notion' 3x/day  │
│    [Show Details] [Accept] [Reject]    │
│                                         │
│ 🟡 Mode Preference (82% confidence)    │
│    You prefer Forge mode on Luna       │
│    [Show Details] [Accept] [Reject]    │
├─────────────────────────────────────────┤
│ 📈 Visualizations                       │
│    [Frequency] [Time] [Mode] [Device]  │
├─────────────────────────────────────────┤
│ 📅 Learning Timeline                    │
│    Nov 22: Learned mode preference      │
│    Nov 21: Created automation           │
│    Nov 20: Adjusted risk threshold      │
└─────────────────────────────────────────┘
```

**Implementation**: ⚪ TODO (Agent F - Orb-Web)

---

## Data Flow

### Event Emission (Agent C - Mav)

```typescript
// Before action
await eventBus.emit({
  id: generateId(),
  type: OrbEventType.ACTION_STARTED,
  timestamp: new Date().toISOString(),
  userId: context.userId,
  sessionId: context.sessionId,
  deviceId: context.deviceId,
  mode: context.mode,
  role: OrbRole.MAV,
  payload: {
    actionId: action.id,
    actionType: action.type,
    context: serializeContext(context),
  },
  metadata: {
    riskLevel: action.riskLevel,
  },
});

// After action
await eventBus.emit({
  id: generateId(),
  type: OrbEventType.ACTION_COMPLETED,
  timestamp: new Date().toISOString(),
  userId: context.userId,
  sessionId: context.sessionId,
  role: OrbRole.MAV,
  payload: {
    actionId: action.id,
    result: result,
  },
  metadata: {
    duration: executionTime,
    success: true,
  },
});
```

### Pattern Detection (Agent B - Te)

```typescript
// Periodic batch processing (every 5 minutes)
setInterval(async () => {
  const events = await eventBus.query({
    dateFrom: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // Last 24h
  });
  
  const patterns = await patternDetector.detectPatterns(events, {
    minConfidence: 0.5,
  });
  
  for (const pattern of patterns) {
    await learningStore.savePattern(pattern);
    
    // Emit pattern detected event
    await eventBus.emit({
      type: OrbEventType.PATTERN_DETECTED,
      payload: { patternId: pattern.id, patternType: pattern.type },
    });
  }
}, 5 * 60 * 1000);
```

### Insight Generation (Agent E - Sol)

```typescript
// Triggered by pattern detection
eventBus.on(OrbEventType.PATTERN_DETECTED, async (event) => {
  const pattern = await learningStore.getPattern(event.payload.patternId);
  
  if (pattern.confidence > ConfidenceThreshold.LOG_ONLY) {
    const insight = await insightGenerator.generate(pattern);
    await learningStore.saveInsight(insight);
    
    // Emit insight generated event
    await eventBus.emit({
      type: OrbEventType.INSIGHT_GENERATED,
      payload: { insightId: insight.id },
    });
  }
});
```

### Learning Application (Agent D - Luna)

```typescript
// Triggered by insight generation
eventBus.on(OrbEventType.INSIGHT_GENERATED, async (event) => {
  const insight = await learningStore.getInsight(event.payload.insightId);
  
  if (insight.confidence >= ConfidenceThreshold.AUTO_APPLY) {
    // Auto-apply high-confidence insights
    const actions = await preferenceLearning.applyLearning([insight]);
    
    for (const action of actions) {
      await learningStore.saveLearningAction(action);
      
      // Notify user
      await notificationService.show({
        title: 'Learning Applied',
        message: insight.title,
        action: 'View Details',
      });
    }
  } else if (insight.confidence >= ConfidenceThreshold.SUGGEST) {
    // Show suggestion in UI
    await insightDashboard.showSuggestion(insight);
  }
});
```

---

## Confidence Thresholds

### Auto-Apply (> 0.9)
- Very high confidence
- Apply automatically
- Notify user after applying
- Allow easy undo

**Examples**:
- Mode preference with 95% usage rate
- Risk threshold with 100+ confirmations

### Suggest (0.7 - 0.9)
- High confidence
- Show in insights dashboard
- Require explicit user approval
- Explain reasoning clearly

**Examples**:
- Frequent action with 15+ occurrences
- Time routine with moderate consistency

### Log Only (0.5 - 0.7)
- Medium confidence
- Store in learning store
- Don't surface to user
- Use for future analysis

**Examples**:
- Emerging patterns
- Patterns with limited evidence

### Ignore (< 0.5)
- Low confidence
- Don't store or surface
- May be noise or false positive

---

## Privacy & Control

### User Control
- **Global toggle**: Enable/disable all learning
- **Per-pattern toggle**: Disable specific pattern types
- **Review history**: See all applied learnings
- **Undo/Revert**: Roll back any learning
- **Export data**: Download all patterns/insights

### Privacy
- **Local-first**: All learning happens locally by default
- **No telemetry**: No data sent to servers without explicit opt-in
- **Transparent**: User can see exactly what was learned
- **Consent**: Require approval for sharing anonymous patterns

### Security
- **Sandboxed**: Learning can't execute arbitrary code
- **Validated**: All learning actions validated before applying
- **Rate-limited**: Prevent learning spam or abuse

---

## Examples

### Example 1: Frequent Action → Automation

**Day 1-7**: User executes "update-notion" action manually 21 times

**Events Captured**:
```json
[
  {
    "type": "action_completed",
    "payload": { "action": "update-notion" },
    "timestamp": "2025-11-15T09:30:00Z"
  },
  // ... 20 more events ...
]
```

**Day 7**: Pattern detector runs

**Pattern Detected**:
```json
{
  "type": "frequent_action",
  "confidence": 0.95,
  "data": {
    "action": "update-notion",
    "frequency": 21,
    "avgPerDay": 3
  }
}
```

**Insight Generated**:
```
Title: "Automate Frequent Notion Updates"
Description: "You execute 'update-notion' 3 times per day. This could be automated or assigned a keyboard shortcut."
Recommendation: "Create ⌘+Shift+N shortcut or schedule automatic updates."
```

**User Reviews** → Approves shortcut creation

**Result**: System creates `⌘+Shift+N` shortcut for update-notion

**Metrics**:
- Time saved: ~30 seconds/day
- User satisfaction: +1 (approved)
- Pattern confidence: 0.95 → 0.99 (validated)

---

### Example 2: Mode Preference → Default Mode

**Week 1**: User switches to Forge mode 45/50 times on Luna device

**Pattern Detected**:
```json
{
  "type": "mode_preference",
  "confidence": 0.9,
  "data": {
    "mode": "Forge",
    "device": "Luna",
    "usageRate": 0.9
  }
}
```

**Insight Generated**:
```
Title: "Set Forge as Default on Luna"
Description: "You use Forge mode 90% of the time on Luna device. Would you like to set it as the default?"
Recommendation: "Set Forge as default mode for Luna device."
```

**Confidence**: 0.9 → Auto-applied

**Result**: Default mode for Luna changed to Forge

**User Notification**:
```
"Learning Applied: Forge is now your default mode on Luna (used 90% of the time)."
[Undo] [Details]
```

---

### Example 3: Error Pattern → Risk Adjustment

**Week 2**: User approves 25/25 high-risk actions in Restaurant mode

**Pattern Detected**:
```json
{
  "type": "risk_threshold",
  "confidence": 0.88,
  "data": {
    "mode": "Restaurant",
    "riskLevel": "high",
    "approvalRate": 1.0,
    "sampleSize": 25
  }
}
```

**Insight Generated**:
```
Title: "Increase Risk Tolerance for Restaurant Mode"
Description: "You always approve high-risk actions in Restaurant mode (25/25 approvals)."
Recommendation: "Adjust risk threshold to reduce confirmation prompts in Restaurant mode."
```

**Confidence**: 0.88 → Suggest to user

**User Reviews** → Approves

**Result**: Risk threshold increased for Restaurant mode

---

## Performance Considerations

### Pattern Detection
- **Batch processing**: Run every 5 minutes (configurable)
- **Event limit**: Process last 10,000 events max
- **Time window**: Default to last 24 hours
- **Parallel detectors**: Run pattern detectors in parallel

### Storage
- **In-memory cache**: Recent events (last 1000)
- **File-based**: For long-term storage
- **SQL indexes**: On userId, timestamp, type
- **Compaction**: Archive old patterns monthly

### UI Updates
- **WebSocket**: Real-time insight notifications
- **Polling**: Fallback to 30s polling
- **Lazy loading**: Load insights on-demand
- **Pagination**: Show 20 insights per page

---

## Testing Strategy

### Unit Tests
- Pattern detection accuracy
- Confidence calculation correctness
- Insight generation quality
- Learning action validation

### Integration Tests
- End-to-end learning flow
- Event → Pattern → Insight → Action
- User approval flow
- Undo/revert functionality

### E2E Tests
```typescript
it('learns from repeated action execution', async () => {
  // Execute action 10 times
  for (let i = 0; i < 10; i++) {
    await mavExecutor.execute(testAction, context);
  }
  
  // Run pattern detection
  await patternDetector.detectPatterns(await eventBus.query({}));
  
  // Verify pattern detected
  const patterns = await learningStore.getPatterns({ type: 'frequent_action' });
  expect(patterns).toHaveLength(1);
  expect(patterns[0].confidence).toBeGreaterThan(0.8);
  
  // Verify insight generated
  const insights = await learningStore.getInsights({ patternId: patterns[0].id });
  expect(insights).toHaveLength(1);
  expect(insights[0].title).toContain('Frequent');
});
```

---

## Rollout Plan

### Phase 6.1 (Must Have)
- ✅ Event taxonomy defined
- ⚪ Events emitted for all Mav actions
- ⚪ Pattern detector (frequent_action, mode_preference)
- ⚪ Basic insight generation
- ⚪ Insights dashboard
- ⚪ 80%+ test coverage

**Timeline**: 7-10 days

### Phase 6.2 (Nice to Have)
- Adaptive preference updates
- Workflow optimization suggestions
- Daily/weekly summaries
- Pattern visualizations

**Timeline**: 5-7 days

### Phase 6.3 (Future)
- Predictive actions
- Cross-device learning
- Pattern sharing (anonymous)
- Model fine-tuning

**Timeline**: TBD

---

## References

- Event bus: `orb-system/packages/core-orb/src/events/`
- Adaptation engine: `orb-system/packages/core-orb/src/adaptation/engine.ts`
- Mission prompt: `docs/prompts/MISSION_6_LEARNING_LOOP.md`
- Agent prompts: `docs/prompts/learning-loop/`

---

**Next Steps**: Start with Agent B (Te) to implement pattern detection algorithms.

