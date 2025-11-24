-- Create Test Account for Phase 0.5 Testing
-- Run this in Supabase SQL Editor to create a sample account
--
-- This creates a test checking account with a starting balance
-- that you can use to test the Finance UI flows

INSERT INTO finance_accounts (
  user_id,
  name,
  type,
  status,
  current_balance,
  currency,
  institution,
  account_number_last4,
  notes
) VALUES (
  'demo-user',
  'Test Checking Account',
  'checking',
  'active',
  2500.00,
  'CAD',
  'Test Bank',
  '1234',
  'Created for Phase 0.5 testing'
)
ON CONFLICT (user_id, name) DO UPDATE
SET 
  current_balance = EXCLUDED.current_balance,
  updated_at = NOW();

-- Verify it was created
SELECT 
  id,
  name,
  type,
  current_balance,
  currency,
  institution,
  created_at
FROM finance_accounts
WHERE user_id = 'demo-user';

-- Result should show your test account with:
-- - name: "Test Checking Account"
-- - current_balance: 2500.00
-- - type: checking

