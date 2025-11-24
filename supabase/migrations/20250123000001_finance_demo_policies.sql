-- Finance Demo Policies for Phase 0.5
-- 
-- This migration adds temporary policies that allow the frontend to work
-- without authentication during Phase 0.5 testing.
--
-- IMPORTANT: These policies are PERMISSIVE for demo purposes.
-- In production (Phase 1.0+), replace these with proper auth-based policies.
--
-- Author: Orb System - Sol Agent (Security Analysis)
-- Date: 2025-01-24

-- ============================================================================
-- TEMPORARY DEMO POLICIES (Phase 0.5 Only)
-- ============================================================================

-- Allow anonymous users to manage accounts for demo-user
CREATE POLICY "Demo: Allow anon to manage demo-user accounts"
  ON finance_accounts
  FOR ALL
  USING (user_id = 'demo-user')
  WITH CHECK (user_id = 'demo-user');

-- Allow anonymous users to manage transactions for demo-user
CREATE POLICY "Demo: Allow anon to manage demo-user transactions"
  ON finance_transactions
  FOR ALL
  USING (user_id = 'demo-user')
  WITH CHECK (user_id = 'demo-user');

-- Allow anonymous users to manage budgets for demo-user
CREATE POLICY "Demo: Allow anon to manage demo-user budgets"
  ON finance_budgets
  FOR ALL
  USING (user_id = 'demo-user')
  WITH CHECK (user_id = 'demo-user');

-- Allow anonymous users to manage review sessions for demo-user
CREATE POLICY "Demo: Allow anon to manage demo-user review sessions"
  ON finance_review_sessions
  FOR ALL
  USING (user_id = 'demo-user')
  WITH CHECK (user_id = 'demo-user');

-- ============================================================================
-- VERIFICATION
-- ============================================================================

-- Check all policies for finance tables
SELECT 
  tablename,
  policyname,
  CASE 
    WHEN policyname LIKE 'Demo:%' THEN '✓ DEMO POLICY (Phase 0.5)'
    ELSE 'Production Policy'
  END as policy_type
FROM pg_policies
WHERE schemaname = 'public' 
  AND tablename LIKE 'finance_%'
ORDER BY tablename, policyname;

-- ============================================================================
-- NOTES FOR FUTURE PHASES
-- ============================================================================

/*
PHASE 1.0+ MIGRATION:

When implementing proper authentication:

1. DROP these demo policies:
   DROP POLICY "Demo: Allow anon to manage demo-user accounts" ON finance_accounts;
   DROP POLICY "Demo: Allow anon to manage demo-user transactions" ON finance_transactions;
   DROP POLICY "Demo: Allow anon to manage demo-user budgets" ON finance_budgets;
   DROP POLICY "Demo: Allow anon to manage demo-user review sessions" ON finance_review_sessions;

2. UPDATE the existing policies to use proper auth:
   - Replace: current_setting('app.current_user_id', true)
   - With: auth.uid() or your auth system's user identifier

3. KEEP the existing restrictive policies as the primary security layer
*/

