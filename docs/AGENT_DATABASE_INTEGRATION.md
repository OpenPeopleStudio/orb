# Agent Database Integration

## Overview

This document describes how Sol, Luna, Te, and Mav agents are integrated with the Supabase database, enabling persistent storage and querying of agent data through the Database Viewer.

## Architecture

```
┌─────────────────┐
│  Core Packages  │
│  (sol/luna/te/  │
│     mav)        │
└────────┬────────┘
         │
         │ Helper Functions
         │ (toRecord*)
         ↓
┌─────────────────┐
│   Supabase      │
│   Database      │
│   Tables        │
└────────┬────────┘
         │
         │ Query Functions
         │ (fetch*)
         ↓
┌─────────────────┐
│  Database       │
│  Viewer UI      │
│  (Admin Panel)  │
└─────────────────┘
```

## Database Schema

### 1. Sol Insights (`sol_insights`)

Stores strategic insights and intent analysis from Sol agent.

**Columns:**
- `id` (TEXT, PRIMARY KEY) - Unique identifier
- `user_id` (TEXT) - User who generated the insight
- `session_id` (TEXT) - Session context
- `intent` (TEXT) - Detected intent (launch-readiness, experience-refresh, etc.)
- `confidence` (NUMERIC) - Confidence score 0.0-1.0
- `tone` (TEXT) - Tone indicator (positive, neutral, urgent)
- `prompt` (TEXT) - Original prompt text
- `summary` (TEXT) - Generated summary
- `role` (TEXT) - Agent role (always 'sol')
- `highlight_color` (TEXT) - UI color hint
- `metadata` (JSONB) - Additional metadata
- `created_at` (TIMESTAMPTZ) - Creation timestamp

**Indexes:**
- `idx_sol_insights_user` - Query by user
- `idx_sol_insights_session` - Query by session
- `idx_sol_insights_intent` - Filter by intent
- `idx_sol_insights_tone` - Filter by tone
- `idx_sol_insights_created` - Order by time

### 2. Luna Profiles (`luna_profiles`)

Stores user preferences and constraints per mode.

**Columns:**
- `user_id` (TEXT) - User identifier
- `mode_id` (TEXT) - Mode identifier (work, personal, research, etc.)
- `preferences` (JSONB) - User preferences
- `constraints` (JSONB) - Mode constraints
- `updated_at` (TIMESTAMPTZ) - Last update time

**Primary Key:** `(user_id, mode_id)`

**Indexes:**
- `idx_luna_profiles_user` - Query by user
- `idx_luna_profiles_mode` - Query by mode

### 3. Luna Active Modes (`luna_active_modes`)

Tracks the currently active mode for each user.

**Columns:**
- `user_id` (TEXT, PRIMARY KEY) - User identifier
- `mode_id` (TEXT) - Current mode
- `updated_at` (TIMESTAMPTZ) - Last update time

### 4. Te Reflections (`te_reflections`)

Stores reflection and learning logs from Te agent.

**Columns:**
- `id` (TEXT, PRIMARY KEY) - Unique identifier
- `user_id` (TEXT) - User identifier
- `session_id` (TEXT) - Session context
- `input` (TEXT) - Input prompt/signal
- `output` (TEXT) - Reflection output
- `tags` (JSONB) - Classification tags
- `notes` (TEXT) - Additional notes
- `created_at` (TIMESTAMPTZ) - Creation timestamp

**Indexes:**
- `idx_te_reflections_user` - Query by user
- `idx_te_reflections_session` - Query by session
- `idx_te_reflections_created` - Order by time

### 5. Mav Actions (`mav_actions`)

Logs action executions from Mav agent.

**Columns:**
- `id` (TEXT, PRIMARY KEY) - Unique identifier
- `user_id` (TEXT) - User identifier
- `session_id` (TEXT) - Session context
- `task_id` (TEXT) - Task identifier
- `action_id` (TEXT) - Action identifier
- `tool_id` (TEXT) - Tool used
- `kind` (TEXT) - Action kind (execute, read, write, etc.)
- `params` (JSONB) - Action parameters
- `status` (TEXT) - Execution status (queued, running, completed, failed)
- `output` (TEXT) - Action output
- `error` (TEXT) - Error message if failed
- `created_at` (TIMESTAMPTZ) - Creation timestamp

**Indexes:**
- `idx_mav_actions_user` - Query by user
- `idx_mav_actions_task` - Query by task
- `idx_mav_actions_status` - Filter by status
- `idx_mav_actions_created` - Order by time

## Core Package Integration

Each core package now exports helper functions to convert agent data to database record format.

### Sol Core (`@orb-system/core-sol`)

```typescript
import { analyzeIntent, toInsightRecord } from '@orb-system/core-sol';
import { createOrbContext, OrbRole } from '@orb-system/core-orb';

const context = createOrbContext(OrbRole.SOL, 'session-123', {
  userId: 'user-456'
});

const prompt = 'We need to ship the dashboard feature this week';
const insight = analyzeIntent(context, prompt);

// Convert to database record
const record = toInsightRecord(insight, context, prompt, {
  priority: 'high'
});

// Save to Supabase
await supabase.from('sol_insights').insert(record);
```

### Luna Core (`@orb-system/core-luna`)

```typescript
import { buildPersonaBrief, toProfileRecord, toActiveModeRecord } from '@orb-system/core-luna';
import { OrbRole } from '@orb-system/core-orb';

const brief = buildPersonaBrief(OrbRole.LUNA, {
  userId: 'user-456',
  mode: 'work'
});

// Save profile
const profileRecord = toProfileRecord(
  brief,
  { theme: 'dark', notifications: 'focus' },
  { maxCost: 100 }
);
await supabase.from('luna_profiles').insert(profileRecord);

// Save active mode
const modeRecord = toActiveModeRecord('user-456', 'work');
await supabase.from('luna_active_modes').upsert(modeRecord);
```

### Te Core (`@orb-system/core-te`)

```typescript
import { reflect, toReflectionRecord } from '@orb-system/core-te';
import { createOrbContext, OrbRole } from '@orb-system/core-orb';

const context = createOrbContext(OrbRole.TE, 'session-123', {
  userId: 'user-456'
});

const signals = ['User asked about auth', 'Database optimization needed'];
const reflection = reflect(context, signals);

// Convert to database record
const record = toReflectionRecord(
  reflection,
  context,
  signals.join('; '),
  ['auth', 'database'],
  'Consider JWT for auth'
);

// Save to Supabase
await supabase.from('te_reflections').insert(record);
```

### Mav Core (`@orb-system/core-mav`)

```typescript
import { buildActionPlan, toActionRecord } from '@orb-system/core-mav';
import { createOrbContext, OrbRole } from '@orb-system/core-orb';

const context = createOrbContext(OrbRole.MAV, 'session-123', {
  userId: 'user-456'
});

const goals = ['Deploy to production', 'Run tests'];
const plan = buildActionPlan(context, goals);

// Convert first action to database record
const record = toActionRecord(
  plan.actions[0],
  context,
  'task-789',
  'shell',
  'execute',
  { command: 'npm run deploy' },
  'Deployment successful',
  null
);

// Save to Supabase
await supabase.from('mav_actions').insert(record);
```

## Database Viewer

The Database Viewer in the admin panel (`/admin/database`) now includes all agent tables.

### Features

- **Table Selection**: Dropdown to select between Sol, Luna, Te, and Mav tables
- **Search**: Full-text search across relevant columns
- **Pagination**: Browse large datasets with 50 records per page
- **JSON Expansion**: Click to expand JSON fields
- **Color Coding**: Each agent has its own color scheme
  - Sol: Yellow (`accent-sol`)
  - Luna: Purple (`accent-luna`)
  - Te: Green (`accent-te`)
  - Mav: Orange (`accent-mav`)

### Accessing the Viewer

1. Navigate to `/admin` in the app
2. Click "Database Viewer"
3. Select a table from the dropdown
4. Browse, search, and filter records

## Setup Instructions

### 1. Run the Migration

Execute the migration to create all agent tables:

```bash
# In Supabase SQL Editor
-- Run: supabase/migrations/20250124000000_orb_agents_schema.sql
```

### 2. Seed Test Data (Optional)

Populate tables with sample data for testing:

```bash
# In Supabase SQL Editor
-- Run: scripts/seed-agent-data.sql
```

### 3. Configure Environment

Ensure your `.env` file has Supabase credentials:

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 4. Set User Context for RLS

When using the database directly (not through the viewer), set the user context:

```sql
SET app.current_user_id = 'your-user-id';
```

Or use Supabase auth:

```typescript
const { data: { user } } = await supabase.auth.getUser();
// RLS policies automatically use auth.uid()
```

## Row Level Security (RLS)

All tables have RLS enabled with user-scoped policies:

- **Sol Insights**: Users can only view/insert their own insights
- **Luna Profiles**: Users can CRUD their own profiles
- **Luna Active Modes**: Users can CRUD their own active mode
- **Te Reflections**: Users can view/insert their own reflections
- **Mav Actions**: Users can view/insert/update their own actions

### Default Policy Pattern

```sql
-- View own data
CREATE POLICY "Users can view their own data"
  ON table_name FOR SELECT
  USING (user_id = current_setting('app.current_user_id', true));

-- Insert own data
CREATE POLICY "Users can insert their own data"
  ON table_name FOR INSERT
  WITH CHECK (user_id = current_setting('app.current_user_id', true));
```

## Query Examples

### Sol Insights by Intent

```sql
SELECT * FROM sol_insights
WHERE user_id = 'user-456'
  AND intent = 'launch-readiness'
ORDER BY created_at DESC
LIMIT 10;
```

### Luna Mode Preferences

```sql
SELECT mode_id, preferences->>'theme' AS theme
FROM luna_profiles
WHERE user_id = 'user-456';
```

### Te Reflections with Tags

```sql
SELECT id, input, output, tags
FROM te_reflections
WHERE user_id = 'user-456'
  AND tags @> '["authentication"]'
ORDER BY created_at DESC;
```

### Mav Actions by Status

```sql
SELECT task_id, status, COUNT(*) AS action_count
FROM mav_actions
WHERE user_id = 'user-456'
GROUP BY task_id, status
ORDER BY task_id;
```

### Recent Agent Activity (All Agents)

```sql
-- Sol recent insights
SELECT 'sol' AS agent, intent AS activity, created_at
FROM sol_insights
WHERE user_id = 'user-456'

UNION ALL

-- Te recent reflections
SELECT 'te' AS agent, LEFT(input, 50) AS activity, created_at
FROM te_reflections
WHERE user_id = 'user-456'

UNION ALL

-- Mav recent actions
SELECT 'mav' AS agent, kind AS activity, created_at
FROM mav_actions
WHERE user_id = 'user-456'

ORDER BY created_at DESC
LIMIT 20;
```

## TypeScript Types

All database record types are exported from the core packages:

```typescript
// Sol
import type { SolInsightRecord } from '@orb-system/core-sol';

// Luna
import type { LunaProfileRecord, LunaActiveModeRecord } from '@orb-system/core-luna';

// Te
import type { TeReflectionRecord } from '@orb-system/core-te';

// Mav
import type { MavActionRecord } from '@orb-system/core-mav';
```

Web app types are in:

```typescript
import type {
  SolInsight,
  LunaProfile,
  LunaActiveMode,
  TeReflection,
  MavAction
} from '@/lib/supabase/types';
```

## Troubleshooting

### RLS Blocking Queries

If queries return no results despite data existing:

1. Check that `app.current_user_id` is set:
   ```sql
   SHOW app.current_user_id;
   ```

2. Temporarily disable RLS for debugging (dev only):
   ```sql
   ALTER TABLE table_name DISABLE ROW LEVEL SECURITY;
   ```

3. Check policy permissions:
   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'sol_insights';
   ```

### Database Viewer Shows "No Records"

1. Verify Supabase is configured in `.env`
2. Check that tables exist and have data
3. Verify RLS policies allow access
4. Check browser console for errors

### Migration Errors

If migration fails:

1. Check if tables already exist:
   ```sql
   SELECT tablename FROM pg_tables WHERE schemaname = 'public';
   ```

2. Drop tables if needed (destructive):
   ```sql
   DROP TABLE IF EXISTS sol_insights CASCADE;
   -- Repeat for other tables
   ```

3. Re-run migration

## Performance Considerations

### Indexing

All tables have indexes on:
- `user_id` - Fast user-scoped queries
- `session_id` - Fast session-scoped queries
- `created_at` - Fast time-based ordering
- Agent-specific fields (intent, status, etc.)

### Query Optimization

- Use indexes in WHERE clauses
- Limit result sets with LIMIT
- Use pagination for large datasets
- Filter by user_id first (leverages RLS)

### JSONB Performance

For JSONB columns (preferences, metadata, tags):

- Use GIN indexes for array operations
- Use `->` for key access
- Use `@>` for containment checks

```sql
-- Fast: Uses GIN index
WHERE tags @> '["authentication"]'

-- Slower: Sequential scan
WHERE tags::text LIKE '%authentication%'
```

## Future Enhancements

- [ ] Real-time subscriptions for live updates
- [ ] Export agent data as CSV/JSON
- [ ] Agent-specific analytics dashboards
- [ ] Cross-agent correlation queries
- [ ] Bulk data operations
- [ ] Data retention policies
- [ ] Agent performance metrics

---

**Status**: ✅ Fully implemented and ready to use

All four agents (Sol, Luna, Te, Mav) are now integrated with the database and accessible through the Database Viewer.

