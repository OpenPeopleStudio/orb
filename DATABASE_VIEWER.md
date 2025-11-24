# Database Viewer - Documentation

## Overview

The Database Viewer is a read-only admin interface for viewing and browsing Orb's Supabase database tables. It provides a clean, user-friendly way to inspect data without needing to use SQL or the Supabase dashboard.

## Features

### ✅ Implemented

1. **Table Browser**
   - View sol_insights (Sol agent strategic insights)
   - View luna_profiles (user preferences per mode)
   - View luna_active_modes (current mode per user)
   - View te_reflections (Te agent reflection logs)
   - View mav_actions (Mav agent action logs)

2. **Data Display**
   - Clean table layout with proper column formatting
   - JSON field expansion (click to see full JSON)
   - Long text truncation with "Show more" option
   - Smart timestamp formatting ("2h ago", "Yesterday", etc.)
   - ID field truncation (shows first 8 chars)

3. **Search & Filter**
   - Full-text search across all searchable columns
   - Real-time filtering as you type
   - Searches user_id, session_id, input, output, task_id, etc.

4. **Pagination**
   - 50 records per page
   - Previous/Next navigation
   - Total record count display
   - Page number indicator

5. **Color Coding**
   - Sol Insights → Yellow (accent-sol)
   - Luna tables → Purple (accent-luna)
   - Te Reflections → Green (accent-te)
   - Mav Actions → Orange (accent-mav)
   - Active Modes → Blue (accent-orb)

6. **Loading States**
   - Skeleton loaders while fetching
   - Error messages with retry option
   - Empty state when no records found

## Access

Navigate to **`/admin`** in the main navigation, then click **"Database Viewer"** or go directly to **`/admin/database`**.

## Setup

### Environment Variables

Add these to your `.env` file:

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

You can find these values in your Supabase project dashboard under **Settings → API**.

### Supabase Configuration

The viewer requires the following tables to exist in your Supabase database:

```sql
-- Run this in Supabase SQL Editor
-- See: supabase/migrations/20250124000000_orb_agents_schema.sql

CREATE TABLE IF NOT EXISTS sol_insights (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  session_id TEXT,
  intent TEXT NOT NULL,
  confidence NUMERIC(3, 2) NOT NULL,
  tone TEXT NOT NULL,
  prompt TEXT NOT NULL,
  summary TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'sol',
  highlight_color TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS luna_profiles (
  user_id TEXT NOT NULL,
  mode_id TEXT NOT NULL,
  preferences JSONB NOT NULL,
  constraints JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, mode_id)
);

CREATE TABLE IF NOT EXISTS luna_active_modes (
  user_id TEXT PRIMARY KEY,
  mode_id TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS te_reflections (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  session_id TEXT,
  input TEXT NOT NULL,
  output TEXT NOT NULL,
  tags JSONB NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS mav_actions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  session_id TEXT,
  task_id TEXT NOT NULL,
  action_id TEXT NOT NULL,
  tool_id TEXT,
  kind TEXT NOT NULL,
  params JSONB,
  status TEXT NOT NULL,
  output TEXT,
  error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### Row Level Security (RLS)

**Important**: For production, enable RLS and create policies:

```sql
-- Enable RLS
ALTER TABLE sol_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE luna_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE luna_active_modes ENABLE ROW LEVEL SECURITY;
ALTER TABLE te_reflections ENABLE ROW LEVEL SECURITY;
ALTER TABLE mav_actions ENABLE ROW LEVEL SECURITY;

-- Example policy (adjust for your auth setup)
CREATE POLICY "Users can view their own data"
  ON luna_profiles
  FOR SELECT
  USING (auth.uid()::text = user_id);
```

## Usage

### Viewing Data

1. Navigate to `/admin/database`
2. Select a table from the dropdown
3. Browse records in the table view
4. Click "Expand" on JSON fields to see full data
5. Click "Show more" on long text to expand

### Searching

Type in the search box to filter records. The search looks across:
- **Sol Insights**: user_id, session_id, intent, tone, prompt, summary
- **Luna Profiles**: user_id, mode_id
- **Luna Active Modes**: user_id, mode_id
- **Te Reflections**: user_id, session_id, input, output, notes
- **Mav Actions**: user_id, session_id, task_id, action_id, tool_id, kind, status

### Pagination

Use "Previous" and "Next" buttons to navigate through pages. Each page shows 50 records.

### Refreshing

Click the "🔄 Refresh" button to reload data from the database.

## Architecture

### File Structure

```
apps/orb-web/src/
├── lib/
│   └── supabase/
│       ├── client.ts       # Supabase client setup
│       ├── types.ts        # Table type definitions
│       └── database.ts     # Data fetching functions
├── components/
│   └── DataTable.tsx       # Reusable table component
└── pages/
    └── admin/
        ├── AdminHome.tsx        # Admin dashboard
        └── DatabaseViewer.tsx   # Database viewer page
```

### Data Flow

```
DatabaseViewer
  ↓
fetchTableData(tableName, options)
  ↓
Supabase Client
  ↓
Query Database
  ↓
Return QueryResult<T>
  ↓
DataTable (display)
```

### Type Safety

All tables have TypeScript interfaces:
- `SolInsight`
- `LunaProfile`
- `LunaActiveMode`
- `TeReflection`
- `MavAction`

Columns are defined with metadata including type (`text`, `json`, `timestamp`, `id`), which controls how they're rendered.

## Components

### DataTable

**Props**:
- `data: TableRecord[]` - Array of records to display
- `columns: ColumnMetadata[]` - Column definitions
- `loading?: boolean` - Show loading skeleton
- `color?: string` - Accent color for buttons

**Features**:
- Automatic column rendering based on type
- JSON expansion/collapse
- Text truncation with expand
- Timestamp formatting
- ID shortening

### DatabaseViewer

**Features**:
- Table selector dropdown
- Search input
- Pagination controls
- Refresh button
- Stats display (total records)
- Error handling
- Supabase configuration check

## Security

### Client-Side Access

The viewer uses the **anon key** (not service key), which means:
- RLS policies are enforced
- Users can only see data they're authorized to see
- No write operations are possible

### Authentication

Currently, the viewer doesn't require authentication. To add auth:

1. Check if user is logged in:
```typescript
const { data: { user } } = await supabase.auth.getUser();
if (!user) {
  navigate('/login');
}
```

2. Create RLS policies that filter by `auth.uid()`

## Future Enhancements

### Planned Features

- [ ] Export data as CSV/JSON
- [ ] Column visibility toggle
- [ ] Sort by any column
- [ ] Advanced filters (date range, status, etc.)
- [ ] Edit mode (update records)
- [ ] Delete records with confirmation
- [ ] Create new records
- [ ] Bulk operations
- [ ] Data visualization (charts/graphs)
- [ ] Audit log (who viewed what)
- [ ] Saved views/filters
- [ ] Real-time updates (subscribe to changes)
- [ ] Agent-specific analytics dashboards
- [ ] Cross-agent correlation views

### Admin Tools

The `/admin` page is designed to be extensible:
- Database Viewer ✅ (Sol, Luna, Te, Mav)
- System Logs (planned)
- User Management (planned)
- API Keys (planned)
- Agent Analytics (planned)

## Troubleshooting

### "Supabase Not Configured" Error

**Solution**: Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` to your `.env` file.

### No Data Showing

**Possible causes**:
1. Tables don't exist - Run the schema migration SQL
2. RLS blocking access - Check your RLS policies
3. Wrong environment variables - Verify URL and key are correct

### "Failed to fetch" Error

**Possible causes**:
1. Network issue - Check internet connection
2. Wrong Supabase URL - Verify URL in `.env`
3. Invalid anon key - Verify key in `.env`
4. CORS issue - Check Supabase project settings

### Search Not Working

**Possible causes**:
1. No searchable fields for that table
2. RLS filtering results
3. Typo in search query

**Debug**:
```typescript
// Check which fields are searchable
import { getSearchableFields } from '@/lib/supabase/database';
console.log(getSearchableFields(TableName.TE_REFLECTIONS));
```

## Performance

### Current Limits

- 50 records per page (configurable)
- Client-side search filtering
- No caching (fresh data on every page load)

### Optimization Tips

1. **Use RLS policies** to limit data scope
2. **Search before paginating** to reduce result set
3. **Create indexes** on frequently searched columns
4. **Limit JSONB field size** for faster rendering

## Testing

### Manual Testing Checklist

- [ ] Navigate to `/admin/database`
- [ ] See Supabase configuration message if not configured
- [ ] Select each table from dropdown
- [ ] Verify data displays correctly
- [ ] Test search functionality
- [ ] Test pagination (Previous/Next)
- [ ] Click "Expand" on JSON fields
- [ ] Click "Show more" on long text
- [ ] Test with empty table (no records)
- [ ] Test with RLS enabled
- [ ] Test refresh button
- [ ] Check responsive design on mobile

### Example Test Data

Insert test records:

```sql
-- Test data for sol_insights
INSERT INTO sol_insights (id, user_id, session_id, intent, confidence, tone, prompt, summary, role, highlight_color, metadata, created_at)
VALUES
  ('sol_1', 'user1', 'session1', 'launch-readiness', 0.85, 'urgent', 'Ship feature', 'SOL sees launch-readiness', 'sol', '#FFD700', '{}', NOW());

-- Test data for luna_profiles
INSERT INTO luna_profiles (user_id, mode_id, preferences, constraints, updated_at)
VALUES 
  ('user1', 'work', '{"theme": "dark"}', '{"max_cost": 100}', NOW()),
  ('user1', 'personal', '{"theme": "light"}', '{}', NOW());

-- Test data for te_reflections
INSERT INTO te_reflections (id, user_id, session_id, input, output, tags, notes, created_at)
VALUES
  ('refl1', 'user1', 'session1', 'Test input', 'Test output', '["tag1", "tag2"]', 'Test notes', NOW());

-- Test data for mav_actions
INSERT INTO mav_actions (id, user_id, session_id, task_id, action_id, tool_id, kind, params, status, output, error, created_at)
VALUES
  ('act1', 'user1', 'session1', 'task1', 'action1', 'tool1', 'execute', '{"param": "value"}', 'completed', 'Success', NULL, NOW());
```

## Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/introduction)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- Schema: `supabase/migrations/20250124000000_orb_agents_schema.sql`
- Test Data: `scripts/seed-agent-data.sql`
- Integration Guide: `docs/AGENT_DATABASE_INTEGRATION.md`

---

**Status**: ✅ Fully implemented and ready to use!

The database viewer provides a professional admin interface for viewing Orb's database tables without needing SQL knowledge.

