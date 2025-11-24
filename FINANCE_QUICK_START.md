# Finance System - Quick Start Guide

Get the Orb Finance system running in 5 minutes.

---

## Prerequisites

- Node.js 18+
- pnpm installed
- Supabase project created
- `.env` file with Supabase credentials

---

## 1. Run Database Migration

In your Supabase SQL Editor, run these two files in order:

```sql
-- File 1: Schema
-- Copy/paste: supabase/migrations/20250123000000_finance_schema.sql

-- File 2: Seed Data  
-- Copy/paste: scripts/seed-finance-data.sql
```

✅ You should now have 5 tables and 20+ categories in your database.

---

## 2. Update Auth (Temporary Fix)

For now, finance uses a demo user. To connect to your real user:

**Edit**: `apps/orb-web/src/lib/finance/client.ts`

```typescript
function getCurrentUserId(): string {
  // TODO: Replace with real auth
  // return 'demo-user';
  
  // Option 1: Get from Supabase auth
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id || 'demo-user';
  
  // Option 2: Hardcode your user ID for testing
  // return 'your-user-id-from-supabase';
}
```

---

## 3. Install & Run

```bash
# Install dependencies
pnpm install

# Start dev server
pnpm dev --filter @orb-system/orb-web
```

---

## 4. Test the System

Navigate to: `http://localhost:5173/finance`

### Test Flow:

1. **Create Account** (Note: Currently placeholder - see Known Issues below)
   - For now, manually insert via Supabase SQL:
   ```sql
   INSERT INTO finance_accounts (user_id, name, type, current_balance, currency)
   VALUES ('your-user-id', 'Test Checking', 'checking', 1000.00, 'CAD');
   ```

2. **Add Transaction**
   - Select account
   - Choose date
   - Click "Expense" or "Income"
   - Enter amount (e.g., 50.00)
   - Enter description (e.g., "Grocery shopping")
   - Select category (e.g., "🛒 Groceries")
   - Click "Add Transaction"

3. **View Transaction List**
   - Should appear immediately in list below
   - Try period filters (Today, This Week, This Month)

4. **Edit Transaction**
   - Click on transaction to expand
   - Change category via dropdown
   - Click review status checkbox to confirm

5. **View Summary**
   - Income/Expenses/Net cards at top
   - Top categories breakdown at bottom

---

## Known Issues & Workarounds

### 1. Add Account Modal Missing

**Issue**: Clicking "Add Account" shows alert instead of modal.

**Workaround**: Manually create accounts via Supabase SQL:

```sql
INSERT INTO finance_accounts (user_id, name, type, current_balance, currency, institution)
VALUES 
  ('your-user-id', 'RBC Chequing', 'checking', 2500.00, 'CAD', 'Royal Bank'),
  ('your-user-id', 'TD Savings', 'savings', 10000.00, 'CAD', 'TD Bank'),
  ('your-user-id', 'Amex Personal', 'credit_card', -450.00, 'CAD', 'American Express');
```

**Fix Coming**: Modal component needs to be built.

### 2. Demo User Hardcoded

**Issue**: All users share same "demo-user" data.

**Workaround**: See step 2 above.

**Fix Coming**: Proper auth integration.

---

## Verify Categories Loaded

Check that seed data ran correctly:

```sql
SELECT name, type, icon FROM finance_categories ORDER BY sort_order;
```

You should see:
- 💰 Salary (income)
- 🛒 Groceries (expense)  
- 🍽️ Dining Out (expense)
- 🔧 Tools & Software (expense)
- ...and 16 more

---

## Test with Sample Data

Want to test with pre-populated data? Run this:

```sql
-- Create sample account
INSERT INTO finance_accounts (user_id, name, type, current_balance, currency)
VALUES ('your-user-id', 'Test Account', 'checking', 5000.00, 'CAD')
RETURNING id; -- Copy this ID

-- Add sample transactions (replace ACCOUNT_ID)
INSERT INTO finance_transactions (
  user_id, account_id, date_posted, amount, description_raw, category_id
) VALUES
  -- Income
  ('your-user-id', 'ACCOUNT_ID', CURRENT_DATE - INTERVAL '15 days', 5000.00, 
   'Payroll Deposit', (SELECT id FROM finance_categories WHERE name = 'Salary')),
  
  -- Groceries
  ('your-user-id', 'ACCOUNT_ID', CURRENT_DATE - INTERVAL '3 days', -87.45,
   'Loblaws Grocery', (SELECT id FROM finance_categories WHERE name = 'Groceries')),
  
  -- Dining
  ('your-user-id', 'ACCOUNT_ID', CURRENT_DATE - INTERVAL '1 day', -45.20,
   'Restaurant Lunch', (SELECT id FROM finance_categories WHERE name = 'Dining Out')),
  
  -- Unreviewed
  ('your-user-id', 'ACCOUNT_ID', CURRENT_DATE, -12.99,
   'Amazon Purchase', NULL);
```

Now refresh the page - you should see:
- Income: $5,000.00
- Expenses: $145.64
- Net: $4,854.36
- 4 transactions in the list

---

## Next Steps

Once you've verified it works:

1. **Build Add Account Modal**
   - Copy style from `AccountBalanceModal.tsx`
   - Add form for name, type, institution, initial balance

2. **Integrate Real Auth**
   - Update `getCurrentUserId()` in `client.ts`
   - Test with multiple users

3. **Add Features from Phase 1.0**
   - Review screen
   - Intent labels
   - Reflection prompts

---

## Need Help?

**Documentation**:
- `FINANCE_IMPLEMENTATION_PLAN.md` - Master plan
- `FINANCE_IMPLEMENTATION_COMPLETE.md` - What was built
- `docs/finance/agent-integration.md` - Agent system

**Code**:
- `apps/orb-web/src/lib/finance/` - API client & types
- `apps/orb-web/src/components/finance/` - UI components
- `apps/orb-web/src/pages/finance/` - Pages
- `supabase/migrations/` - Database schema

**Common Issues**:
- Migration errors? Check Supabase logs
- No categories? Re-run seed script
- No data? Check user_id matches
- Types not working? Run `pnpm build`

---

**Status**: ✅ System is functional, just needs account creation modal and auth integration.

**Time to first transaction**: ~5 minutes (with workarounds)  
**Time to production ready**: ~1 hour (after modal + auth)

