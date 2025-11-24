-- Finance Setup Verification Script
-- Run this in Supabase SQL Editor to verify Phase 0 setup
-- 
-- Expected results:
-- - All tables exist
-- - Categories are seeded (24 total)
-- - Indexes are created
-- - RLS policies are enabled

-- ============================================================================
-- 1. CHECK TABLES EXIST
-- ============================================================================

SELECT 
  'finance_accounts' as table_name,
  CASE WHEN EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_name = 'finance_accounts'
  ) THEN '✓ EXISTS' ELSE '✗ MISSING' END as status
UNION ALL
SELECT 
  'finance_transactions' as table_name,
  CASE WHEN EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_name = 'finance_transactions'
  ) THEN '✓ EXISTS' ELSE '✗ MISSING' END as status
UNION ALL
SELECT 
  'finance_categories' as table_name,
  CASE WHEN EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_name = 'finance_categories'
  ) THEN '✓ EXISTS' ELSE '✗ MISSING' END as status
UNION ALL
SELECT 
  'finance_budgets' as table_name,
  CASE WHEN EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_name = 'finance_budgets'
  ) THEN '✓ EXISTS' ELSE '✗ MISSING' END as status
UNION ALL
SELECT 
  'finance_review_sessions' as table_name,
  CASE WHEN EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_name = 'finance_review_sessions'
  ) THEN '✓ EXISTS' ELSE '✗ MISSING' END as status;

-- ============================================================================
-- 2. CHECK CATEGORIES SEEDED
-- ============================================================================

SELECT 
  'Categories Count' as check_name,
  COUNT(*)::text as value,
  CASE 
    WHEN COUNT(*) = 24 THEN '✓ CORRECT (24 expected)'
    WHEN COUNT(*) = 0 THEN '✗ EMPTY - Run seed script'
    ELSE '⚠ PARTIAL - Expected 24'
  END as status
FROM finance_categories;

-- ============================================================================
-- 3. CHECK CATEGORIES BY TYPE
-- ============================================================================

SELECT 
  type,
  COUNT(*) as count,
  STRING_AGG(name, ', ' ORDER BY sort_order) as categories
FROM finance_categories
GROUP BY type
ORDER BY type;

-- ============================================================================
-- 4. CHECK RLS POLICIES
-- ============================================================================

SELECT 
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE schemaname = 'public' 
  AND tablename LIKE 'finance_%'
ORDER BY tablename, policyname;

-- ============================================================================
-- 5. CHECK INDEXES
-- ============================================================================

SELECT 
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public' 
  AND tablename LIKE 'finance_%'
ORDER BY tablename, indexname;

-- ============================================================================
-- 6. CHECK SAMPLE DATA (Optional - only if you've added test data)
-- ============================================================================

SELECT 
  'Accounts' as entity,
  COUNT(*)::text as count
FROM finance_accounts
UNION ALL
SELECT 
  'Transactions' as entity,
  COUNT(*)::text as count
FROM finance_transactions
UNION ALL
SELECT 
  'Budgets' as entity,
  COUNT(*)::text as count
FROM finance_budgets;

-- ============================================================================
-- INTERPRETATION
-- ============================================================================

/*
EXPECTED RESULTS:

1. All 5 tables should show "✓ EXISTS"
2. Categories count should be "✓ CORRECT (24 expected)"
3. Categories by type should show:
   - expense: 17 categories
   - income: 5 categories
   - transfer: 1 category
4. Each table should have multiple RLS policies
5. Multiple indexes per table
6. Sample data counts (0 if no test data added yet)

IF ANY CHECKS FAIL:
- Tables missing → Run: supabase/migrations/20250123000000_finance_schema.sql
- Categories empty → Run: scripts/seed-finance-data.sql
- Policies missing → Re-run migration (includes policy creation)
*/

