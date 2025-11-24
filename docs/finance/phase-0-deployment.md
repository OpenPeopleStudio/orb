# Phase 0 + 0.5 Deployment Guide

This guide walks you through deploying the Finance system (Phases 0 and 0.5).

## Prerequisites

1. **Supabase Project**
   - Create a free project at https://supabase.com
   - Note your project URL and API keys

2. **Node.js & pnpm**
   - Node.js v18+ installed
   - pnpm package manager

## Step 1: Environment Configuration

### 1.1 Create `.env` file in `apps/orb-web/`

```bash
cd apps/orb-web
cp .env.example .env
```

### 1.2 Get Supabase Credentials

1. Go to your Supabase project dashboard
2. Navigate to **Settings → API**
3. Copy the following values:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **Project API keys → anon / public** → `VITE_SUPABASE_ANON_KEY`

### 1.3 Update `.env` file

```env
VITE_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Step 2: Database Migration

### 2.1 Run Finance Schema Migration

**Migration 1: Core Schema**

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Click **+ New Query**
4. Copy the contents of `supabase/migrations/20250123000000_finance_schema.sql`
5. Paste into the SQL Editor
6. Click **Run** (or press `Ctrl+Enter`)

**Expected result:** 
```
Success. No rows returned.
```

This creates the following tables:
- `finance_accounts`
- `finance_transactions`
- `finance_categories`
- `finance_budgets`
- `finance_review_sessions`

**Migration 2: Demo Policies (Phase 0.5 only)**

7. Click **+ New Query** again
8. Copy the contents of `supabase/migrations/20250123000001_finance_demo_policies.sql`
9. Paste and **Run**

**Expected result:**
```
Success. Returns table showing all policies including new "Demo:" policies.
```

**Why this second migration?** The demo policies allow the frontend to work without authentication during Phase 0.5 testing. See `docs/finance/phase-0-rls-notes.md` for details.

**IMPORTANT:** These demo policies are for testing only. In Phase 1.0+, you'll replace them with proper auth-based policies.

### 2.2 Run Seed Data

1. In Supabase SQL Editor, create another new query
2. Copy the contents of `scripts/seed-finance-data.sql`
3. Paste and run

**Expected result:**
- 24 base categories created (Income, Expense, Transfer categories)
- 3 sample budgets for current month (optional, for demo-user)

### 2.3 Verify Database Setup

Run this query in SQL Editor to confirm:

```sql
-- Check categories were created
SELECT COUNT(*) as category_count FROM finance_categories;
-- Expected: 24

-- List all categories
SELECT name, type, icon FROM finance_categories ORDER BY sort_order;
```

## Step 3: Set User ID (Temporary)

For Phase 0.5, the app uses a hardcoded user ID: `'demo-user'`.

In a future phase, this will be replaced with proper authentication.

**To set the user ID for RLS policies:**

The Supabase client automatically uses the service role for backend operations.
For frontend operations, RLS policies check against `app.current_user_id`.

For now, the policies allow the service role full access, so you can test immediately.

## Step 4: Install Dependencies & Run

### 4.1 Install Dependencies

```bash
# From repo root
pnpm install
```

### 4.2 Start Dev Server

```bash
# From repo root
pnpm dev --filter @orb-system/orb-web

# Or use the shortcut defined in .cursor/rules
# (if configured in your project commands)
```

### 4.3 Navigate to Finance

Open your browser to:
```
http://localhost:5173/finance
```

## Step 5: Manual Testing (Phase 0.5)

### Test 1: Create an Account

1. Click **"Manage Accounts"** or navigate to `/finance/accounts`
2. Click **"+ Add Account"** (placeholder alert will show - see Known Limitations)
3. **ALTERNATIVE:** Manually insert a test account via Supabase SQL Editor:

```sql
INSERT INTO finance_accounts (user_id, name, type, status, current_balance, currency, institution)
VALUES ('demo-user', 'RBC Chequing', 'checking', 'active', 2500.00, 'CAD', 'Royal Bank of Canada');
```

4. Refresh the page - you should see your account card

### Test 2: Update Account Balance

1. On the account card, click **"Update Balance"**
2. Enter a new balance (e.g., `3000.00`)
3. Click **"Update Balance"**
4. Verify the balance updates on the card

### Test 3: Add a Transaction

1. Go back to Finance home (`/finance`)
2. In the left panel, fill out the transaction form:
   - **Account:** Select your account
   - **Date:** Today (or pick a date)
   - **Amount:** Toggle to **Expense** or **Income**, enter amount (e.g., `87.45`)
   - **Description:** E.g., "Grocery shopping at Loblaws"
   - **Category:** Select "Groceries" (optional)
3. Click **"Add Transaction"**
4. Alert: "Transaction added successfully!"
5. Transaction appears in the list on the right

### Test 4: Filter Transactions

1. In the transaction list, click filter chips:
   - **"Today"** - shows today's transactions
   - **"This Week"** - shows last 7 days
   - **"This Month"** - shows current month
   - **"Last 30 Days"** - shows last 30 days
2. Verify transactions filter correctly

### Test 5: Edit Transaction Category

1. Click on a transaction in the list to expand it
2. Change the **Category** dropdown
3. Verify it updates (green checkmark appears for confirmed)

### Test 6: Mark Transaction as Reviewed

1. Click the yellow `?` button on an unreviewed transaction
2. It changes to a green `✓` (confirmed)
3. Click again to toggle back

### Test 7: Delete Transaction

1. Expand a transaction
2. Click **"Delete Transaction"** (red text at bottom)
3. Confirm the deletion
4. Transaction disappears from list

## Step 6: Verify Data in Supabase

1. Go to Supabase Dashboard → **Table Editor**
2. Select `finance_accounts` - see your accounts
3. Select `finance_transactions` - see your transactions
4. Verify data matches what you see in the UI

## Success Criteria ✅

Phase 0.5 is complete when:

- ✅ User can create/view accounts
- ✅ User can manually update account balances
- ✅ User can add transactions (date, amount, description)
- ✅ Transactions appear in list immediately
- ✅ Can filter by "This Week" and "This Month"
- ✅ Empty states guide user to add first transaction
- ✅ Keyboard flow is smooth for daily entry

## Known Limitations (Phase 0.5)

1. **No "Add Account" modal yet** - Must add accounts via SQL or will be added in Phase 1.0
2. **No CSV import** - Manual entry only
3. **No authentication** - Using hardcoded `'demo-user'`
4. **No keyboard shortcuts** - Planned for Phase 1.0
5. **No mobile optimization** - Desktop-first for now

## Troubleshooting

### "Missing Supabase configuration" Error

**Cause:** `.env` file not found or variables not set

**Fix:**
1. Ensure `.env` exists in `apps/orb-web/`
2. Check variables are prefixed with `VITE_`
3. Restart dev server after changing `.env`

### "Network Error" When Adding Transaction

**Cause:** Supabase RLS policies blocking request

**Fix:**
1. Check you ran the migration SQL (includes RLS policies)
2. Verify the `user_id` in code matches your test data
3. Check browser console for specific error

### Categories Not Showing

**Cause:** Seed data not run

**Fix:**
1. Run `scripts/seed-finance-data.sql` in Supabase SQL Editor
2. Verify with: `SELECT * FROM finance_categories;`

### Transaction List is Empty

**Cause:** Date filter may be outside your test data range

**Fix:**
1. Click **"Last 30 Days"** filter
2. Or add a transaction with today's date
3. Check Supabase: `SELECT * FROM finance_transactions WHERE user_id = 'demo-user';`

## Next Steps

After Phase 0.5 is validated:

- **Phase 1.0:** Add Account modal, CSV import, review ritual UI
- **Phase 1.5:** Agent integration (CategorizationAgent, ReviewCoachAgent)
- **Phase 2.0:** Budget tracking, alerts, forecasting
- **Phase 3.0:** Bank API integration (Plaid)

## Support

If you encounter issues not covered here, check:

1. Browser console for errors
2. Supabase Logs (`Logs → Database`) for SQL errors
3. Network tab to see API request/response details

For questions, refer to:
- `docs/finance/finance_overview.md` - Full system design
- `docs/finance/phase-0-5-manual-console.md` - Phase 0.5 spec

