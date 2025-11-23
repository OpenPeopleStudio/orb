# 🎯 Multi-Agent Mission: Phase 6 - Learning Loop & Adaptation

## Mission Overview

**Goal**: Implement the learning loop that allows Orb to learn from usage patterns, adapt behavior, and surface insights.

**Status**: Infrastructure exists (event bus, adaptation engine, Te reflection) but not wired up for actual learning.

**Impact**: This transforms Orb from a reactive system to one that learns and improves over time.

---

## 🏗️ Architecture

The learning loop connects all four core layers:

```
User Action → Mav (executes) → Event Bus → Te (reflects) 
    ↓                                          ↓
Luna (evaluates) ← Adaptation Engine ← Pattern Detection
    ↓
Sol (suggests improvements)
```

---

## 👥 Agent Roster

### **Agent A: Architect** 
**Scope**: `orb-system/packages/core-orb/src/{events,adaptation}`, docs  
**Mission**: Define learning loop contracts and event taxonomy

### **Agent B: Te (Reflection)**  
**Scope**: `orb-system/packages/core-te/src/`  
**Mission**: Build reflection pipeline that processes events into insights

### **Agent C: Mav (Actions)**  
**Scope**: `orb-system/packages/core-mav/src/`  
**Mission**: Emit structured events for every action executed

### **Agent D: Luna (Preferences)**  
**Scope**: `orb-system/packages/core-luna/src/`  
**Mission**: Update preferences based on learned patterns

### **Agent E: Sol (Inference)**  
**Scope**: `orb-system/packages/core-sol/src/`  
**Mission**: Generate insights and recommendations from patterns

### **Agent F: Orb-Web**  
**Scope**: `apps/orb-web/src/`  
**Mission**: Visualize insights, patterns, and learning trends

### **Agent G: Tests**  
**Scope**: All `**/__tests__/`, `**/*.test.ts`  
**Mission**: Test learning pipeline end-to-end

---

## 📋 Detailed Agent Tasks

### **Agent A: Architect** - Learning Loop Foundation

**Files to Create/Modify**:
- `orb-system/packages/core-orb/src/events/types.ts` (enhance)
- `orb-system/packages/core-orb/src/adaptation/types.ts` (new)
- `orb-system/packages/core-orb/src/adaptation/patterns.ts` (new)
- `docs/LEARNING_LOOP_ARCHITECTURE.md` (new)

**Deliverables**:
1. **Event Taxonomy** - Define standardized event types:
   - `ActionExecuted`, `ActionFailed`, `ModeChanged`, `PreferenceUpdated`
   - `ReflectionCreated`, `InsightGenerated`, `PatternDetected`
   
2. **Pattern Types** - Define what patterns we detect:
   ```typescript
   type PatternType = 
     | 'frequent_action'      // User does X often
     | 'time_based_routine'   // User does Y at specific times
     | 'mode_preference'      // User prefers mode Z for context W
     | 'error_pattern'        // Action fails repeatedly
     | 'efficiency_gain'      // New workflow is faster
     | 'risk_threshold';      // User's actual risk tolerance
   ```

3. **Learning Pipeline Contract**:
   ```typescript
   interface LearningPipeline {
     // Events → Patterns → Insights → Actions
     processEvent(event: OrbEvent): Promise<void>;
     detectPatterns(events: OrbEvent[]): Promise<Pattern[]>;
     generateInsights(patterns: Pattern[]): Promise<Insight[]>;
     applyLearning(insights: Insight[]): Promise<LearningAction[]>;
   }
   ```

4. **Documentation** - Architecture doc explaining the loop

---

### **Agent B: Te (Reflection)** - Pattern Detection & Insights

**Files to Create/Modify**:
- `orb-system/packages/core-te/src/patternDetector.ts` (new)
- `orb-system/packages/core-te/src/insightGenerator.ts` (new)
- `orb-system/packages/core-te/src/reflectionPipeline.ts` (enhance)
- `orb-system/packages/core-te/src/learningStore.ts` (new)

**Deliverables**:
1. **Pattern Detector** - Analyze event streams:
   ```typescript
   class PatternDetector {
     // Find frequent actions
     detectFrequentActions(events: OrbEvent[], window: TimeWindow): Pattern[];
     
     // Find time-based routines
     detectTimeRoutines(events: OrbEvent[]): Pattern[];
     
     // Find mode preferences
     detectModePreferences(events: OrbEvent[]): Pattern[];
     
     // Find error patterns
     detectErrorPatterns(events: OrbEvent[]): Pattern[];
   }
   ```

2. **Insight Generator** - Convert patterns to insights:
   ```typescript
   class InsightGenerator {
     generateInsight(pattern: Pattern, context: OrbContext): Insight;
     prioritizeInsights(insights: Insight[]): Insight[];
     formatForUser(insight: Insight): string;
   }
   ```

3. **Learning Store** - Persist patterns and insights:
   - File-based: `.orb-data/te/patterns.json`
   - SQL-based: `patterns` and `insights` tables
   - Includes confidence scores and timestamps

4. **Tests** - Pattern detection accuracy tests

---

### **Agent C: Mav (Actions)** - Event Emission

**Files to Modify**:
- `orb-system/packages/core-mav/src/taskRunner.ts`
- `orb-system/packages/core-mav/src/executors/index.ts`
- `orb-system/packages/core-mav/src/integrations/*.ts`

**Deliverables**:
1. **Event Emission** - Every action emits structured events:
   ```typescript
   // Before action
   emitEvent({
     type: 'action_started',
     role: OrbRole.MAV,
     payload: {
       actionId: action.id,
       actionType: action.type,
       context: orbContext,
       timestamp: new Date().toISOString(),
     }
   });
   
   // After action
   emitEvent({
     type: 'action_completed',
     role: OrbRole.MAV,
     payload: {
       actionId: action.id,
       result: result,
       duration: executionTime,
       success: true,
     }
   });
   ```

2. **Execution Metadata** - Rich context for every action:
   - Duration, success/failure, risk level
   - User confirmation required/given
   - Constraints triggered
   - Mode and persona at execution time

3. **Error Details** - Detailed error events for pattern detection

---

### **Agent D: Luna (Preferences)** - Adaptive Preferences

**Files to Create/Modify**:
- `orb-system/packages/core-luna/src/adaptivePreferences.ts` (new)
- `orb-system/packages/core-luna/src/preferenceLearning.ts` (new)
- `orb-system/packages/core-luna/src/modes.ts` (enhance)

**Deliverables**:
1. **Preference Learning** - Update preferences based on patterns:
   ```typescript
   class PreferenceLearning {
     // Adjust risk thresholds based on actual behavior
     learnRiskTolerance(pattern: Pattern): PreferenceUpdate;
     
     // Learn preferred modes for contexts
     learnModePreferences(pattern: Pattern): PreferenceUpdate;
     
     // Learn optimal notification settings
     learnNotificationPreferences(pattern: Pattern): PreferenceUpdate;
   }
   ```

2. **Adaptive Constraints** - Suggest constraint changes:
   - "You always override this constraint - remove it?"
   - "You never do X in mode Y - add constraint?"

3. **Confidence Thresholds** - Only auto-apply high-confidence learnings:
   - `> 0.9` confidence: auto-apply
   - `0.7 - 0.9`: suggest to user
   - `< 0.7`: log but don't surface

---

### **Agent E: Sol (Inference)** - Insight Generation

**Files to Create/Modify**:
- `orb-system/packages/core-sol/src/insightGenerator.ts` (new)
- `orb-system/packages/core-sol/src/patternSummarizer.ts` (new)
- `orb-system/packages/core-sol/src/recommendations.ts` (new)

**Deliverables**:
1. **Natural Language Insights** - Convert patterns to readable insights:
   ```typescript
   // Pattern: frequent_action with confidence 0.95
   // Output: "You execute 'update-notion' 3x per day in Restaurant mode. 
   //          Consider creating a hotkey or automation."
   ```

2. **Recommendations** - Actionable suggestions:
   - Workflow optimizations
   - Mode recommendations
   - Constraint adjustments
   - Integration suggestions

3. **Summaries** - Daily/weekly learning summaries:
   - Top patterns detected
   - Preferences learned
   - Efficiency gains measured

---

### **Agent F: Orb-Web** - Insights Dashboard

**Files to Create/Modify**:
- `apps/orb-web/src/components/InsightsDashboard.tsx` (new)
- `apps/orb-web/src/components/PatternVisualization.tsx` (new)
- `apps/orb-web/src/components/LearningTimeline.tsx` (new)
- `apps/orb-web/src/hooks/useInsights.ts` (new)

**Deliverables**:
1. **Insights Dashboard**:
   - Recent patterns detected
   - Pending learning suggestions
   - Applied preference updates
   - Confidence scores visualization

2. **Pattern Visualization**:
   - Frequency charts (action X done Y times)
   - Time-based heatmaps (when do you do Z?)
   - Mode usage pie chart

3. **Learning Timeline**:
   - "Today: Learned you prefer Forge mode on Luna"
   - "Yesterday: Adjusted risk threshold for financial actions"
   - "Last week: Created automation for frequent workflow"

4. **Approval Interface**:
   - Review and approve/reject suggested changes
   - Override auto-applied learnings
   - Provide feedback on accuracy

---

### **Agent G: Tests** - Learning Pipeline Validation

**Files to Create**:
- `orb-system/packages/core-te/src/__tests__/patternDetector.test.ts`
- `orb-system/packages/core-te/src/__tests__/insightGenerator.test.ts`
- `orb-system/packages/core-orb/src/__tests__/learningPipeline.test.ts`
- `apps/orb-web/src/__tests__/InsightsDashboard.test.tsx`

**Deliverables**:
1. **Pattern Detection Tests**:
   - Detect frequent actions correctly
   - Identify time-based routines
   - Calculate confidence scores accurately

2. **End-to-End Tests**:
   ```typescript
   it('learns from repeated action execution', async () => {
     // Execute same action 10 times
     for (let i = 0; i < 10; i++) {
       await mavExecutor.execute(testAction, context);
     }
     
     // Wait for pattern detection
     await wait(1000);
     
     // Check pattern was detected
     const patterns = await tePatternDetector.getPatterns();
     expect(patterns).toContainPattern('frequent_action');
     expect(patterns[0].confidence).toBeGreaterThan(0.8);
     
     // Check insight was generated
     const insights = await solInsightGenerator.getInsights();
     expect(insights).toContainMatch(/3x per day/);
   });
   ```

3. **Integration Tests** - Test full pipeline with mock events

---

## 🎯 Success Criteria

### Must Have (Phase 6.1)
- ✅ Event taxonomy defined and documented
- ✅ Events emitted for all Mav actions
- ✅ Pattern detector finds frequent actions and time routines
- ✅ Insights generated in natural language
- ✅ Basic insights dashboard in orb-web
- ✅ 80%+ test coverage on learning pipeline

### Nice to Have (Phase 6.2)
- ✅ Adaptive preference updates (with approval)
- ✅ Workflow optimization suggestions
- ✅ Daily/weekly learning summaries
- ✅ Pattern visualization (charts, timelines)

### Future (Phase 6.3)
- Predictive actions (suggest before user acts)
- Cross-user pattern sharing (privacy-preserving)
- Model fine-tuning based on feedback
- A/B testing of learned preferences

---

## 📊 Metrics to Track

1. **Pattern Detection Accuracy**:
   - True positive rate for detected patterns
   - False positive rate
   - User acceptance rate of suggestions

2. **Learning Effectiveness**:
   - Number of auto-applied preference updates
   - User-confirmed vs auto-applied ratio
   - Time to detect new patterns

3. **User Impact**:
   - Workflow efficiency improvements
   - Reduction in manual constraint adjustments
   - User engagement with insights dashboard

---

## 🚀 Execution Order

1. **Agent A** (Architect) - Define contracts (1-2 days)
2. **Agents B, C in parallel** - Te patterns + Mav events (2-3 days)
3. **Agent D** (Luna) - Adaptive preferences (1-2 days)
4. **Agent E** (Sol) - Insights and recommendations (1-2 days)
5. **Agent F** (Orb-Web) - Dashboard UI (2-3 days)
6. **Agent G** (Tests) - Throughout, finalize at end (1-2 days)

**Total Estimated Time**: 7-10 days with parallel work

---

## 📝 Coordination Notes

- **Shared Types**: Agent A must complete contracts before others start
- **Event Format**: Agents B & C must agree on event payload structure
- **Confidence Thresholds**: Agents B, D, E must use consistent confidence scoring
- **UI State**: Agent F needs APIs from Agents B, D, E

---

## 🔗 References

- Current event bus: `orb-system/packages/core-orb/src/events/`
- Adaptation engine: `orb-system/packages/core-orb/src/adaptation/engine.ts`
- Reflection engine: `orb-system/packages/core-te/src/reflectionEngine.ts`
- Mode service: `orb-system/packages/core-luna/src/modes.ts`
- Demo flow: `orb-system/packages/core-orb/src/demoFlow.ts`

---

## 🎬 Getting Started

To launch this mission, use the forge-agent-bootloader:

```bash
# See docs/prompts/forge-agent-bootloader.md for multi-agent coordination
```

Or start with Agent A (Architect) to lay the foundation:

```bash
# Provide this mission file to an AI agent with instructions to act as Agent A
```

---

This mission transforms Orb from a system that responds to commands into one that learns, adapts, and proactively helps. It's the bridge between reactive automation and true AI assistance.

