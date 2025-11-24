# Phase 0.5 Manual Test Plan

Execute these tests after deployment to verify Phase 0.5 is working correctly.

## Prerequisites

- ✅ Database migrations run (both migrations + seed data)
- ✅ `.env` file configured with Supabase credentials
- ✅ Dev server running (`pnpm dev --filter @orb-system/orb-web`)
- ✅ Browser open to `http://localhost:5173/finance`

## Test Suite

### Test 1: Initial Load & Empty States

**Steps:**
1. Navigate to `/finance`
2. Observe the page loads without errors

**Expected Results:**
- ✅ Page loads successfully
- ✅ Navigation shows "💰 Finance" as active
- ✅ Summary cards show (may be $0.00 if no data)
- ✅ Transaction entry form visible on left
- ✅ Transaction list shows empty state: "💸 No transactions yet"
- ❌ No console errors

**If Failed:** Check browser console for Supabase connection errors

---

### Test 2: Create Test Account (SQL)

**Steps:**
1. Open Supabase SQL Editor
2. Run: `scripts/create-test-account.sql`
3. Verify output shows the created account

**Expected Results:**
- ✅ Query returns 1 row with account details
- ✅ `name`: "Test Checking Account"
- ✅ `current_balance`: 2500.00

---

### Test 3: View Accounts List

**Steps:**
1. Click **"Manage Accounts"** button (top right)
2. Observe accounts page loads

**Expected Results:**
- ✅ Page shows "Accounts" header
- ✅ Account card displays:
  - 🏦 icon
  - Name: "Test Checking Account"
  - Type: "Checking"
  - Balance: "CA$2,500.00"
  - Institution: "Test Bank"
- ✅ Total balance card at bottom shows CA$2,500.00
- ✅ "Across 1 account"

**If Failed:** 
- Check Supabase: `SELECT * FROM finance_accounts WHERE user_id = 'demo-user';`
- Verify RLS demo policies are installed

---

### Test 4: Update Account Balance

**Steps:**
1. On account card, click **"Update Balance"**
2. Modal appears
3. Change balance to `3000`
4. Click **"Update Balance"**

**Expected Results:**
- ✅ Modal closes
- ✅ Account card balance updates to CA$3,000.00
- ✅ Total balance updates to CA$3,000.00
- ❌ No error messages

**Verify in Database:**
```sql
SELECT current_balance FROM finance_accounts 
WHERE user_id = 'demo-user' AND name = 'Test Checking Account';
-- Should return: 3000.00
```

---

### Test 5: Add Income Transaction

**Steps:**
1. Go back to `/finance`
2. Fill out form:
   - Account: "Test Checking Account"
   - Date: Today (leave default)
   - Toggle: Click **"Income"** (green)
   - Amount: `5000`
   - Description: "Salary payment"
   - Category: "💰 Salary"
3. Click **"Add Transaction"**

**Expected Results:**
- ✅ Alert: "Transaction added successfully!"
- ✅ Form clears (except account stays selected)
- ✅ Transaction appears immediately in list
- ✅ Shows: "Today" | "Salary payment" | "+CA$5,000.00" (green)
- ✅ Summary cards update:
  - Income: CA$5,000.00
  - Net: CA$5,000.00

---

### Test 6: Add Expense Transaction

**Steps:**
1. Fill out form again:
   - Account: "Test Checking Account"
   - Date: Today
   - Toggle: **"Expense"** (red)
   - Amount: `87.45`
   - Description: "Grocery shopping at Loblaws"
   - Category: "🛒 Groceries"
2. Click **"Add Transaction"**

**Expected Results:**
- ✅ Alert: "Transaction added successfully!"
- ✅ Transaction appears in list with:
  - Amount: "-CA$87.45" (red)
  - Category: "🛒 Groceries"
- ✅ Summary updates:
  - Income: CA$5,000.00
  - Expenses: CA$87.45
  - Net: CA$4,912.55

---

### Test 7: Add Multiple Transactions (Different Dates)

**Steps:**
1. Add transaction with date = yesterday:
   - Expense, $45.20, "Coffee shop"
2. Add transaction with date = 3 days ago:
   - Expense, $120.00, "Gas station"
3. Add transaction with date = last week:
   - Expense, $200.00, "Phone bill"

**Expected Results:**
- ✅ All transactions appear in list
- ✅ Sorted by date (newest first)
- ✅ Date labels show "Today", "Yesterday", or formatted date

---

### Test 8: Filter by "Today"

**Steps:**
1. Click **"Today"** filter chip

**Expected Results:**
- ✅ Chip highlights (blue background)
- ✅ List shows only today's transactions (2 from Tests 5 & 6)
- ✅ Summary recalculates for today only

---

### Test 9: Filter by "This Week"

**Steps:**
1. Click **"This Week"** filter chip

**Expected Results:**
- ✅ "This Week" chip highlights
- ✅ List shows all transactions from current week
- ✅ Should include yesterday and 3 days ago (if still in week)
- ✅ Summary updates

---

### Test 10: Filter by "This Month"

**Steps:**
1. Click **"This Month"** filter chip

**Expected Results:**
- ✅ Shows all transactions from current month
- ✅ Summary reflects month totals

---

### Test 11: Filter by "Last 30 Days"

**Steps:**
1. Click **"Last 30 Days"** filter chip

**Expected Results:**
- ✅ Shows all transactions (assuming all within 30 days)
- ✅ Summary shows full totals

---

### Test 12: Expand Transaction Details

**Steps:**
1. Click on any transaction row to expand it

**Expected Results:**
- ✅ Row expands
- ✅ Shows category dropdown
- ✅ Shows account name
- ✅ Shows "Delete Transaction" button

---

### Test 13: Change Transaction Category

**Steps:**
1. Expand a transaction
2. Change category dropdown to different category
3. Click outside to close

**Expected Results:**
- ✅ Category updates immediately
- ✅ Transaction row shows new category icon/name
- ✅ Review status button shows green ✓ (confirmed)

**Verify in Database:**
```sql
SELECT description_raw, category_id, review_status 
FROM finance_transactions 
WHERE user_id = 'demo-user' 
ORDER BY created_at DESC 
LIMIT 1;
-- category_id should have changed
-- review_status might still be 'unreviewed' or 'confirmed'
```

---

### Test 14: Mark Transaction as Reviewed

**Steps:**
1. Find a transaction with yellow `?` badge
2. Click the `?` badge

**Expected Results:**
- ✅ Badge changes to green `✓`
- ✅ Background color changes (subtle)

**Click again:**
- ✅ Toggles back to yellow `?`

---

### Test 15: Delete Transaction

**Steps:**
1. Expand a transaction
2. Click **"Delete Transaction"** (red text)
3. Confirm deletion in browser prompt

**Expected Results:**
- ✅ Transaction disappears from list
- ✅ Summary updates (totals decrease)
- ❌ Transaction no longer in database

**Verify in Database:**
```sql
SELECT COUNT(*) FROM finance_transactions WHERE user_id = 'demo-user';
-- Count should decrease by 1
```

---

### Test 16: Transaction List Summary Bar

**Steps:**
1. Scroll to bottom of transaction list
2. Observe summary bar

**Expected Results:**
- ✅ Shows 3 columns: Income | Expenses | Net
- ✅ Matches summary cards at top
- ✅ Values calculated correctly from visible transactions

---

### Test 17: Navigation Between Pages

**Steps:**
1. From `/finance`, click **"Manage Accounts"**
2. From `/finance/accounts`, click **"← Back to Finance"**
3. Test main nav: Click **"💰 Finance"** from another page

**Expected Results:**
- ✅ Navigation works smoothly
- ✅ No page reload (SPA navigation)
- ✅ Context data persists (no re-fetch on back navigation)

---

### Test 18: Empty States

**Steps:**
1. Delete all transactions
2. Navigate to accounts page
3. Click "Add Account" (will show alert placeholder)

**Expected Results:**
- ✅ Transaction list shows empty state:
  - "💸 No transactions yet"
  - "Add your first transaction..."
- ✅ Account page works even with one account
- ✅ "Add Account" shows placeholder alert (expected limitation)

---

### Test 19: Form Validation

**Steps:**
Test each validation case:

**A. No account selected:**
1. Leave account empty
2. Fill other fields
3. Submit

**Expected:** Alert "Please select an account"

**B. No amount:**
1. Select account
2. Leave amount empty
3. Submit

**Expected:** HTML5 validation or alert "Please enter an amount"

**C. No description:**
1. Fill account and amount
2. Leave description empty
3. Submit

**Expected:** HTML5 validation or alert "Please enter a description"

---

### Test 20: Browser Refresh (Data Persistence)

**Steps:**
1. Add several transactions
2. Hard refresh page (Ctrl+R or Cmd+R)

**Expected Results:**
- ✅ All transactions reload from database
- ✅ Accounts reload
- ✅ Summary recalculates
- ✅ No data loss

---

### Test 21: Categories Load Correctly

**Steps:**
1. Open transaction form
2. Toggle between Expense and Income
3. Observe category dropdown options

**Expected Results:**
- ✅ **Expense mode:** Shows expense categories only (Groceries, Dining Out, etc.)
- ✅ **Income mode:** Shows income categories only (Salary, Freelance, etc.)
- ✅ All categories have icons
- ✅ "Uncategorized" option always available

---

### Test 22: Concurrent Transactions

**Steps:**
1. Open `/finance` in two browser tabs
2. Add transaction in Tab 1
3. Switch to Tab 2

**Expected Results:**
- ⚠️ Tab 2 does NOT auto-update (expected for Phase 0.5)
- ✅ Refresh Tab 2 → transaction appears

**Note:** Real-time sync is out of scope for Phase 0.5

---

### Test 23: Negative Balances (Credit Cards)

**Steps:**
1. Update account balance to `-450` (credit card debt)
2. View accounts page

**Expected Results:**
- ✅ Balance shows: "-CA$450.00" or "CA$450.00" (formatting)
- ✅ Total balance correctly accounts for negative

---

### Test 24: Large Numbers

**Steps:**
1. Add transaction with amount: `50000`
2. Observe formatting

**Expected Results:**
- ✅ Displays as: "CA$50,000.00" (with thousands separator)
- ✅ Summary handles large numbers correctly

---

## Success Criteria

**Phase 0.5 is validated when:**

- ✅ All 24 tests pass
- ❌ No console errors during normal operation
- ✅ Data persists across page reloads
- ✅ UI is responsive and updates reflect immediately

## Known Issues (Acceptable for Phase 0.5)

1. **No "Add Account" UI** - Use SQL workaround
2. **Browser alert() for messages** - Replace with toasts in Phase 1.0
3. **No real-time sync across tabs** - Out of scope
4. **Hardcoded 'demo-user'** - Auth in Phase 1.0
5. **No keyboard shortcuts** - Phase 1.0 feature

## Performance Benchmarks

**Target (acceptable for Phase 0.5):**
- ✅ Page load: < 2 seconds
- ✅ Transaction add: < 500ms (optimistic update = immediate)
- ✅ Filter change: < 300ms
- ✅ Account balance update: < 500ms

## Accessibility Notes

**Not tested in Phase 0.5 (defer to Phase 1.0):**
- Screen reader compatibility
- Keyboard-only navigation
- ARIA labels
- Focus management

---

## Post-Test Actions

After all tests pass:

1. **Document any bugs found** in `docs/finance/phase-0-5-bugs.md`
2. **Take screenshots** of key UI states for documentation
3. **Record demo video** (optional) showing core flows
4. **Update README** with setup instructions
5. **Mark Phase 0.5 as COMPLETE** ✅

## Troubleshooting

See `docs/finance/phase-0-deployment.md` § Troubleshooting for common issues.

