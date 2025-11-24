# Finance MVP Testing Guide

Complete testing checklist for Orb Finance Phase 0 + 0.5.

---

## Prerequisites Checklist

Before testing, ensure:

- [ ] Supabase project created
- [ ] `.env` file has correct credentials:
  ```bash
  VITE_SUPABASE_URL=https://your-project.supabase.co
  VITE_SUPABASE_ANON_KEY=your-anon-key
  ```
- [ ] Database migrations run successfully
- [ ] Seed data loaded
- [ ] You're authenticated in the app (logged in)

---

## Step 1: Run Database Migrations

### 1.1 Apply Schema Migration

In Supabase SQL Editor:

```sql
-- Run: supabase/migrations/20250123000000_finance_schema.sql
-- Verify tables created:
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name LIKE 'finance_%';

-- Expected: 5 tables
-- finance_accounts
-- finance_categories
-- finance_transactions
-- finance_budgets
-- finance_review_sessions
```

### 1.2 Load Seed Data

```sql
-- Run: scripts/seed-finance-data.sql
-- Verify categories loaded:
SELECT COUNT(*) FROM finance_categories WHERE is_core = true;
-- Expected: 20+ categories
```

### 1.3 Verify RLS Policies

```sql
-- Check policies exist:
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE tablename LIKE 'finance_%';

-- Expected: Multiple policies per table
```

---

## Step 2: Test Authentication

### 2.1 Sign In to Your App

1. Navigate to your app
2. Ensure you're logged in via Supabase Auth
3. Open browser console and run:

```javascript
// Check if user is authenticated
const { data: { user } } = await window._supabase.auth.getUser();
console.log('Authenticated user:', user?.id);
```

If not authenticated, the finance system will use `demo-user` as fallback.

---

## Step 3: Test Accounts Management

### 3.1 Create First Account

1. Navigate to `/finance`
2. Click "Add Account" button (top right or in empty state)
3. Fill in form:
   - **Name**: RBC Chequing
   - **Type**: Checking
   - **Balance**: 2500.00
   - **Institution**: Royal Bank of Canada
   - **Last 4**: 1234
4. Click "Create Account"

**✅ Expected**: 
- Account appears in list immediately
- No errors in console
- Account shows up in Accounts page

**Verify in Database**:
```sql
SELECT id, name, type, current_balance, user_id 
FROM finance_accounts 
WHERE name = 'RBC Chequing';
-- Should return your account with your user_id
```

### 3.2 Update Account Balance

1. Click "Update Balance" on any account
2. Enter new balance: 2750.00
3. Click "Update Balance"

**✅ Expected**:
- Balance updates immediately
- Total balance recalculates
- No errors

**Verify in Database**:
```sql
SELECT name, current_balance, updated_at 
FROM finance_accounts 
WHERE name = 'RBC Chequing';
-- current_balance should be 2750.00
-- updated_at should be recent
```

### 3.3 Create Multiple Account Types

Create at least one of each:
- Savings account (TD Savings, $10,000)
- Credit card (Amex Personal, -$450)
- Cash (Wallet, $120)

**✅ Expected**:
- All accounts visible in grid
- Total balance calculates correctly
- Different icons for each type

---

## Step 4: Test Transaction Entry

### 4.1 Add Income Transaction

1. In transaction entry form:
   - **Account**: RBC Chequing
   - **Date**: Today's date
   - **Type**: Click "Income" button (green)
   - **Amount**: 5000.00
   - **Description**: Payroll Deposit
   - **Category**: 💰 Salary
2. Click "Add Transaction"

**✅ Expected**:
- Transaction appears in list immediately
- Amount shows as +$5,000.00 in green
- Summary cards update:
  - Income: $5,000.00
  - Expenses: $0.00
  - Net: $5,000.00

**Verify in Database**:
```sql
SELECT id, amount, description_raw, category_id, review_status
FROM finance_transactions
WHERE description_raw = 'Payroll Deposit';
-- amount should be positive (5000.00)
-- review_status should be 'unreviewed'
```

### 4.2 Add Expense Transaction

1. In transaction entry form:
   - **Account**: RBC Chequing
   - **Date**: Today's date
   - **Type**: Click "Expense" button (red)
   - **Amount**: 87.45
   - **Description**: Loblaws Grocery Shopping
   - **Category**: 🛒 Groceries
2. Click "Add Transaction"

**✅ Expected**:
- Transaction appears in list
- Amount shows as -$87.45 in red
- Summary updates:
  - Expenses: $87.45
  - Net: $4,912.55

### 4.3 Add Uncategorized Transaction

1. Add transaction without selecting category
2. **Amount**: 45.20
3. **Description**: Mystery charge

**✅ Expected**:
- Transaction creates successfully
- Shows "Uncategorized" in list
- Can edit category inline later

---

## Step 5: Test Transaction List Features

### 5.1 Period Filters

1. Add transactions on different dates:
   - Today: $50
   - Yesterday: $30
   - Last week: $100
   - Last month: $200

2. Test each filter chip:
   - **Today**: Should show only today's transactions
   - **This Week**: Should show this week + today
   - **This Month**: Should show all current month
   - **Last 30 Days**: Should show all in 30 day window

**✅ Expected**:
- List updates immediately
- Transaction count changes
- Summary cards recalculate

### 5.2 Inline Category Editing

1. Click on any transaction to expand
2. Change category via dropdown
3. Click outside to close

**✅ Expected**:
- Category updates immediately
- No page reload
- "Top Categories" section updates

### 5.3 Review Status Toggle

1. Click the review status badge (?) on a transaction
2. Should change to (✓)
3. Click again to toggle back

**✅ Expected**:
- Status toggles between unreviewed/confirmed
- Color changes (yellow → green)
- Database updates

**Verify**:
```sql
SELECT description_raw, review_status 
FROM finance_transactions 
ORDER BY created_at DESC 
LIMIT 5;
```

---

## Step 6: Test Financial Summary

### 6.1 Summary Cards

With mixed transactions, verify:
- **Income** card shows total positive amounts
- **Expenses** card shows total negative amounts (as positive number)
- **Net** card shows difference
- **Net** is green if positive, red if negative

### 6.2 Top Categories Breakdown

1. Add transactions in multiple categories
2. Scroll to "Top Categories" section

**✅ Expected**:
- Shows top 5 categories by spend amount
- Each has:
  - Category name
  - Dollar amount
  - Percentage of total
  - Progress bar
- Sorted by amount (highest first)

---

## Step 7: Test Edge Cases

### 7.1 Empty States

1. Create new account
2. Navigate to finance page before adding transactions

**✅ Expected**:
- Friendly empty state message
- Suggestion to add first transaction
- No errors

### 7.2 Large Amounts

Test with:
- $100,000.00 (5 digits)
- $1,000,000.00 (7 digits)
- $0.01 (small amount)

**✅ Expected**:
- Formatting works correctly
- No overflow in UI
- Database stores accurately

### 7.3 Special Characters

Test description with:
- Emojis: "Coffee ☕ with team"
- Symbols: "Transfer $$ to savings"
- Unicode: "Café français"

**✅ Expected**:
- All characters save and display correctly

### 7.4 Concurrent Updates

1. Open app in two browser tabs
2. Add transaction in tab 1
3. Refresh tab 2

**✅ Expected**:
- Transaction appears in tab 2
- No data loss or corruption

---

## Step 8: Test Data Isolation (Multi-User)

### 8.1 User Isolation Test

1. Note your current user_id:
```sql
-- In Supabase SQL editor
SELECT current_setting('request.jwt.claims', true)::json->>'sub' as user_id;
```

2. Verify you only see your data:
```sql
-- Should only return your accounts
SELECT user_id, name FROM finance_accounts;

-- Should only return your transactions
SELECT user_id, description_raw FROM finance_transactions;
```

3. Try accessing another user's data (should fail):
```sql
-- This should return 0 rows due to RLS
SELECT * FROM finance_accounts WHERE user_id != 'your-user-id';
```

**✅ Expected**:
- RLS policies enforce user isolation
- Can't see other users' data
- Can't modify other users' data

---

## Step 9: Performance Testing

### 9.1 Load Test

1. Create 100 transactions using this script:

```sql
-- Run in Supabase SQL Editor
DO $$
DECLARE
  test_account_id UUID;
  test_user_id TEXT := 'your-user-id';
BEGIN
  -- Get first account
  SELECT id INTO test_account_id 
  FROM finance_accounts 
  WHERE user_id = test_user_id 
  LIMIT 1;

  -- Create 100 transactions
  FOR i IN 1..100 LOOP
    INSERT INTO finance_transactions (
      user_id, account_id, date_posted, amount, 
      description_raw, category_id
    ) VALUES (
      test_user_id,
      test_account_id,
      CURRENT_DATE - (i || ' days')::INTERVAL,
      (RANDOM() * 100 - 50)::NUMERIC(10,2),
      'Test Transaction ' || i,
      (SELECT id FROM finance_categories WHERE type = 'expense' ORDER BY RANDOM() LIMIT 1)
    );
  END LOOP;
END $$;
```

2. Navigate to finance page

**✅ Expected**:
- Page loads within 2-3 seconds
- Pagination shows 50 transactions
- Summary calculates correctly
- No UI lag or freezing

### 9.2 Category Performance

1. Change category on multiple transactions rapidly
2. Toggle review status quickly

**✅ Expected**:
- Updates feel instant (< 200ms)
- No errors in console
- Optimistic updates work

---

## Step 10: Error Handling

### 10.1 Network Errors

1. Open DevTools → Network tab
2. Set network to "Offline"
3. Try adding transaction

**✅ Expected**:
- User-friendly error message
- No crash or white screen
- Data not corrupted

### 10.2 Invalid Data

Try creating transactions with:
- Empty description
- Zero amount
- Future date (should work)
- Invalid account_id (should fail gracefully)

**✅ Expected**:
- Form validation catches errors
- Clear error messages
- No console errors

---

## Step 11: Browser Compatibility

Test in multiple browsers:
- [ ] Chrome/Edge (Chromium)
- [ ] Firefox
- [ ] Safari (if on Mac)

**✅ Expected**:
- Consistent behavior
- No layout issues
- All features work

---

## Step 12: Mobile Responsiveness

1. Open DevTools
2. Toggle device toolbar (Ctrl+Shift+M)
3. Test on:
   - iPhone 12 Pro (390x844)
   - iPad Pro (1024x1366)

**✅ Expected**:
- Layout adapts to screen size
- Forms usable on mobile
- No horizontal scroll
- Touch targets large enough

---

## Automated Testing SQL Script

Run this to verify everything is set up correctly:

```sql
-- Finance System Health Check
-- Run this in Supabase SQL Editor

\echo '=== Finance System Health Check ==='

-- 1. Check tables exist
\echo '\n1. Tables Check:'
SELECT 
  CASE 
    WHEN COUNT(*) = 5 THEN '✅ All 5 tables exist'
    ELSE '❌ Missing tables (' || COUNT(*) || '/5)'
  END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name LIKE 'finance_%';

-- 2. Check categories loaded
\echo '\n2. Categories Check:'
SELECT 
  CASE 
    WHEN COUNT(*) >= 20 THEN '✅ ' || COUNT() || ' categories loaded'
    ELSE '❌ Only ' || COUNT(*) || ' categories (expected 20+)'
  END as status
FROM finance_categories WHERE is_core = true;

-- 3. Check RLS policies
\echo '\n3. RLS Policies Check:'
SELECT 
  tablename,
  COUNT(*) as policy_count,
  CASE 
    WHEN COUNT(*) >= 4 THEN '✅'
    ELSE '❌'
  END as status
FROM pg_policies 
WHERE tablename LIKE 'finance_%'
GROUP BY tablename;

-- 4. Check indexes
\echo '\n4. Indexes Check:'
SELECT 
  COUNT(*) as index_count,
  CASE 
    WHEN COUNT(*) >= 15 THEN '✅ Indexes created'
    ELSE '⚠️  Some indexes missing'
  END as status
FROM pg_indexes
WHERE tablename LIKE 'finance_%';

-- 5. Sample data check
\echo '\n5. Your Data:'
SELECT 
  (SELECT COUNT(*) FROM finance_accounts WHERE user_id = current_setting('request.jwt.claims', true)::json->>'sub') as accounts,
  (SELECT COUNT(*) FROM finance_transactions WHERE user_id = current_setting('request.jwt.claims', true)::json->>'sub') as transactions;

\echo '\n=== Health Check Complete ==='
```

---

## Success Criteria

**MVP is complete when:**

- [x] ✅ All 5 database tables exist
- [x] ✅ 20+ categories seeded
- [x] ✅ RLS policies active and working
- [x] ✅ Can create accounts via UI
- [x] ✅ Can add income/expense transactions
- [x] ✅ Can update account balances
- [x] ✅ Transaction list shows recent entries
- [x] ✅ Period filters work
- [x] ✅ Inline category editing works
- [x] ✅ Summary cards calculate correctly
- [x] ✅ Authentication integrated (uses real user ID)
- [x] ✅ No console errors during normal usage
- [x] ✅ Data isolated per user (RLS working)

---

## Troubleshooting

### Issue: "No authenticated user found"

**Solution**: 
- Ensure you're logged in
- Check Supabase auth status in console
- Falls back to demo-user gracefully

### Issue: Transactions not appearing

**Check**:
```sql
-- Verify user_id matches
SELECT user_id, COUNT(*) 
FROM finance_transactions 
GROUP BY user_id;
```

### Issue: Categories not in dropdown

**Check**:
```sql
-- Verify categories exist and are active
SELECT name, type, is_active 
FROM finance_categories 
WHERE is_active = true 
ORDER BY sort_order;
```

### Issue: RLS blocking access

**Check**:
```sql
-- Test RLS with your user ID
SET request.jwt.claims = '{"sub": "your-user-id-here"}';
SELECT * FROM finance_accounts;
```

---

## Next Steps After MVP

Once all tests pass:

1. **Phase 1.0**: Build review features
2. **Phase 2.0**: Implement AI agents
3. **Deploy to production**
4. **Invite beta users**

---

**Testing Complete!** 🎉

If all tests pass, your Finance MVP is production-ready.

