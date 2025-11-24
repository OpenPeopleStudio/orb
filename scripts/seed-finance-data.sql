-- Seed Data for Orb Finance System
-- Provides base categories and sample data for development
--
-- Run after: supabase/migrations/20250123000000_finance_schema.sql
-- Author: Orb System - Mav Agent (Database)
-- Date: 2025-01-23

-- ============================================================================
-- 1. BASE CATEGORIES
-- ============================================================================

-- Income Categories
INSERT INTO finance_categories (name, type, is_core, icon, color, sort_order) VALUES
('Salary', 'income', true, '💰', '#10b981', 10),
('Freelance', 'income', true, '💼', '#34d399', 20),
('Investment Income', 'income', true, '📈', '#6ee7b7', 30),
('Gifts Received', 'income', true, '🎁', '#a7f3d0', 40),
('Other Income', 'income', true, '💵', '#d1fae5', 50);

-- Expense Categories - Essential
INSERT INTO finance_categories (name, type, is_core, icon, color, sort_order) VALUES
('Rent/Mortgage', 'expense', true, '🏠', '#ef4444', 100),
('Utilities', 'expense', true, '⚡', '#f87171', 110),
('Groceries', 'expense', true, '🛒', '#fca5a5', 120),
('Transportation', 'expense', true, '🚗', '#fecaca', 130),
('Insurance', 'expense', true, '🛡️', '#fee2e2', 140);

-- Expense Categories - Lifestyle
INSERT INTO finance_categories (name, type, is_core, icon, color, sort_order) VALUES
('Dining Out', 'expense', true, '🍽️', '#f59e0b', 200),
('Entertainment', 'expense', true, '🎬', '#fbbf24', 210),
('Shopping', 'expense', true, '🛍️', '#fcd34d', 220),
('Health & Fitness', 'expense', true, '💪', '#fde68a', 230),
('Personal Care', 'expense', true, '💇', '#fef3c7', 240);

-- Expense Categories - Professional
INSERT INTO finance_categories (name, type, is_core, icon, color, sort_order) VALUES
('Tools & Software', 'expense', true, '🔧', '#8b5cf6', 300),
('Education', 'expense', true, '📚', '#a78bfa', 310),
('Professional Development', 'expense', true, '📊', '#c4b5fd', 320),
('Subscriptions', 'expense', true, '📱', '#ddd6fe', 330);

-- Expense Categories - Other
INSERT INTO finance_categories (name, type, is_core, icon, color, sort_order) VALUES
('Gifts Given', 'expense', true, '🎁', '#ec4899', 400),
('Charity', 'expense', true, '❤️', '#f472b6', 410),
('Uncategorized', 'expense', true, '❓', '#9ca3af', 900);

-- Transfer Category
INSERT INTO finance_categories (name, type, is_core, icon, color, sort_order) VALUES
('Transfer', 'transfer', true, '🔄', '#6366f1', 1000);

-- ============================================================================
-- 2. SAMPLE BUDGETS (Optional - for current month)
-- ============================================================================

-- Get current month in YYYY-MM format
DO $$
DECLARE
  current_period TEXT := TO_CHAR(CURRENT_DATE, 'YYYY-MM');
  dining_cat_id UUID;
  groceries_cat_id UUID;
  subscriptions_cat_id UUID;
  user_id_value TEXT := 'demo-user';
BEGIN
  -- Get category IDs
  SELECT id INTO dining_cat_id FROM finance_categories WHERE name = 'Dining Out';
  SELECT id INTO groceries_cat_id FROM finance_categories WHERE name = 'Groceries';
  SELECT id INTO subscriptions_cat_id FROM finance_categories WHERE name = 'Subscriptions';

  -- Insert sample budgets
  IF dining_cat_id IS NOT NULL THEN
    INSERT INTO finance_budgets (user_id, category_id, period, amount_planned, amount_spent)
    VALUES (user_id_value, dining_cat_id, current_period, 400.00, 0.00)
    ON CONFLICT (user_id, category_id, period) DO NOTHING;
  END IF;

  IF groceries_cat_id IS NOT NULL THEN
    INSERT INTO finance_budgets (user_id, category_id, period, amount_planned, amount_spent)
    VALUES (user_id_value, groceries_cat_id, current_period, 600.00, 0.00)
    ON CONFLICT (user_id, category_id, period) DO NOTHING;
  END IF;

  IF subscriptions_cat_id IS NOT NULL THEN
    INSERT INTO finance_budgets (user_id, category_id, period, amount_planned, amount_spent)
    VALUES (user_id_value, subscriptions_cat_id, current_period, 100.00, 0.00)
    ON CONFLICT (user_id, category_id, period) DO NOTHING;
  END IF;
END $$;

-- ============================================================================
-- 3. SAMPLE ACCOUNTS (Optional - for development)
-- ============================================================================

-- Uncomment to create sample accounts for testing
/*
INSERT INTO finance_accounts (user_id, name, type, status, current_balance, currency, institution) VALUES
('demo-user', 'RBC Chequing', 'checking', 'active', 2500.00, 'CAD', 'Royal Bank of Canada'),
('demo-user', 'TD Savings', 'savings', 'active', 10000.00, 'CAD', 'TD Bank'),
('demo-user', 'Amex Personal', 'credit_card', 'active', -450.00, 'CAD', 'American Express'),
('demo-user', 'Cash Wallet', 'cash', 'active', 120.00, 'CAD', NULL);
*/

-- ============================================================================
-- 4. SAMPLE TRANSACTIONS (Optional - for development)
-- ============================================================================

-- Uncomment to create sample transactions for testing
/*
DO $$
DECLARE
  checking_account_id UUID;
  groceries_cat_id UUID;
  dining_cat_id UUID;
  salary_cat_id UUID;
  user_id_value TEXT := 'demo-user';
BEGIN
  -- Get IDs
  SELECT id INTO checking_account_id FROM finance_accounts WHERE user_id = user_id_value AND name = 'RBC Chequing';
  SELECT id INTO groceries_cat_id FROM finance_categories WHERE name = 'Groceries';
  SELECT id INTO dining_cat_id FROM finance_categories WHERE name = 'Dining Out';
  SELECT id INTO salary_cat_id FROM finance_categories WHERE name = 'Salary';

  IF checking_account_id IS NOT NULL THEN
    -- Sample salary (inflow)
    INSERT INTO finance_transactions (
      user_id, account_id, date_posted, amount, description_raw, description_clean,
      category_id, review_status, intent_label, source
    ) VALUES (
      user_id_value, checking_account_id, CURRENT_DATE - INTERVAL '15 days', 5000.00,
      'PAYROLL DEPOSIT - EMPLOYER INC', 'Payroll Deposit',
      salary_cat_id, 'confirmed', 'aligned', 'manual'
    );

    -- Sample grocery expense
    INSERT INTO finance_transactions (
      user_id, account_id, date_posted, amount, description_raw, description_clean, merchant_name,
      category_id, review_status, intent_label, source
    ) VALUES (
      user_id_value, checking_account_id, CURRENT_DATE - INTERVAL '3 days', -87.45,
      'LOBLAWS #1234 TORONTO ON', 'Loblaws Grocery', 'Loblaws',
      groceries_cat_id, 'confirmed', 'aligned', 'manual'
    );

    -- Sample dining expense
    INSERT INTO finance_transactions (
      user_id, account_id, date_posted, amount, description_raw, description_clean, merchant_name,
      category_id, review_status, intent_label, source, tags
    ) VALUES (
      user_id_value, checking_account_id, CURRENT_DATE - INTERVAL '1 day', -45.20,
      'RESTO CAFE TORONTO ON', 'Restaurant Cafe', 'Restaurant Cafe',
      dining_cat_id, 'unreviewed', NULL, 'manual', '["lunch", "work"]'::jsonb
    );

    -- Sample unreviewed transaction
    INSERT INTO finance_transactions (
      user_id, account_id, date_posted, amount, description_raw, source
    ) VALUES (
      user_id_value, checking_account_id, CURRENT_DATE, -12.99,
      'AMAZON.CA PURCHASE', 'manual'
    );
  END IF;
END $$;
*/

-- ============================================================================
-- SEED DATA COMPLETE
-- ============================================================================
-- Next: Use Supabase dashboard or API to verify tables and data
-- Categories should now be visible and ready for use

