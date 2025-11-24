# Row Level Security (RLS) Notes for Finance System

## Phase 0.5 Setup

### The Problem

The original migration (`20250123000000_finance_schema.sql`) includes RLS policies that check:
```sql
current_setting('app.current_user_id', true)
```

This assumes a backend service will set this session variable. However, in Phase 0.5:
- We're using the **Supabase JavaScript client** from the frontend
- The client uses the **anon (public) key**
- No session variable is being set

**Result:** All database operations would be blocked by RLS.

### The Solution (Phase 0.5)

We've added a second migration (`20250123000001_finance_demo_policies.sql`) that creates **temporary permissive policies**:

```sql
CREATE POLICY "Demo: Allow anon to manage demo-user accounts"
  ON finance_accounts
  FOR ALL
  USING (user_id = 'demo-user')
  WITH CHECK (user_id = 'demo-user');
```

These policies allow:
- ✅ Any anonymous user can CRUD data for `user_id = 'demo-user'`
- ✅ Frontend can work without authentication
- ❌ No real security (acceptable for demo/testing only)

### Why This is Safe for Phase 0.5

1. **Demo/Development Only**: Phase 0.5 is for testing, not production
2. **Scoped to demo-user**: Only affects the `'demo-user'` account
3. **Easy to Remove**: Policies are clearly marked "Demo:"
4. **Original Policies Remain**: The restrictive policies are still there, just not active yet

### Migration Path to Production

When implementing authentication (Phase 1.0+):

#### Step 1: Implement Auth
- Set up Supabase Auth or your auth system
- Update `getCurrentUserId()` in `apps/orb-web/src/lib/finance/client.ts`

#### Step 2: Update RLS Policies
Replace the `current_setting('app.current_user_id', true)` pattern with proper auth:

**Option A: Use Supabase Auth (recommended)**
```sql
-- Example for accounts table
DROP POLICY "Users can view their own accounts" ON finance_accounts;

CREATE POLICY "Users can view their own accounts"
  ON finance_accounts FOR SELECT
  USING (auth.uid()::text = user_id);
```

**Option B: Use JWT claims**
```sql
USING ((auth.jwt() -> 'sub')::text = user_id)
```

#### Step 3: Drop Demo Policies
```sql
DROP POLICY "Demo: Allow anon to manage demo-user accounts" ON finance_accounts;
DROP POLICY "Demo: Allow anon to manage demo-user transactions" ON finance_transactions;
DROP POLICY "Demo: Allow anon to manage demo-user budgets" ON finance_budgets;
DROP POLICY "Demo: Allow anon to manage demo-user review sessions" ON finance_review_sessions;
```

#### Step 4: Test with Real Users
1. Create test accounts via Supabase Auth
2. Verify users can only see their own data
3. Verify RLS policies block cross-user access

### Current Policy Structure

Each finance table has:

**Original Policies (not yet active):**
- "Users can view their own X" - Checks `app.current_user_id`
- "Users can insert their own X" - Checks `app.current_user_id`
- "Users can update their own X" - Checks `app.current_user_id`
- "Users can delete their own X" - Checks `app.current_user_id`

**Demo Policies (Phase 0.5 only):**
- "Demo: Allow anon to manage demo-user X" - Allows all ops for demo-user

**Active Policies:**
- Categories: "Anyone can view active categories" (always active)
- Demo policies (Phase 0.5)

### Verification

Run this in Supabase SQL Editor to see all policies:

```sql
SELECT 
  tablename,
  policyname,
  CASE 
    WHEN policyname LIKE 'Demo:%' THEN '⚠ DEMO POLICY'
    WHEN policyname LIKE 'Anyone%' THEN '✓ OPEN POLICY'
    ELSE '🔒 AUTH POLICY'
  END as policy_type,
  cmd as operations
FROM pg_policies
WHERE schemaname = 'public' 
  AND tablename LIKE 'finance_%'
ORDER BY tablename, policyname;
```

### Security Checklist for Production

Before deploying to production:

- [ ] Authentication system implemented
- [ ] `getCurrentUserId()` returns real user IDs
- [ ] RLS policies updated to use `auth.uid()` or equivalent
- [ ] Demo policies dropped
- [ ] Cross-user access tested and blocked
- [ ] Service role key secured (not exposed to frontend)
- [ ] Anon key has appropriate restrictions

### Resources

- [Supabase RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase Auth with RLS](https://supabase.com/docs/guides/auth/auth-helpers/nextjs)
- Finance system docs: `docs/finance/finance_overview.md`

