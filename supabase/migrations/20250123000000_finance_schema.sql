-- Finance Schema Migration for Orb Personal Finance
-- Phases 0 + 0.5: Core tables, indexes, and RLS policies
-- 
-- Tables:
--   - finance_accounts: Bank accounts, credit cards, etc.
--   - finance_transactions: Money movements
--   - finance_categories: Classification system
--   - finance_budgets: Monthly envelopes per category
--   - finance_review_sessions: Daily/weekly review metadata
--
-- Author: Orb System - Mav Agent (Database)
-- Date: 2025-01-23

-- ============================================================================
-- 1. ACCOUNTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS finance_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  
  -- Core fields
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('checking', 'savings', 'credit_card', 'loan', 'investment', 'cash', 'other')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'archived')),
  
  -- Balance tracking (manual for Phase 0.5)
  current_balance NUMERIC(12, 2),
  currency TEXT NOT NULL DEFAULT 'CAD',
  
  -- Optional metadata
  institution TEXT,
  account_number_last4 TEXT,
  notes TEXT,
  metadata JSONB DEFAULT '{}',
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT finance_accounts_user_name_unique UNIQUE (user_id, name)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_finance_accounts_user ON finance_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_finance_accounts_status ON finance_accounts(status);
CREATE INDEX IF NOT EXISTS idx_finance_accounts_type ON finance_accounts(type);

-- ============================================================================
-- 2. CATEGORIES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS finance_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Core fields
  name TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense', 'transfer')),
  
  -- Hierarchy
  parent_id UUID REFERENCES finance_categories(id) ON DELETE SET NULL,
  
  -- System vs user-created
  is_core BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  
  -- Display
  icon TEXT,
  color TEXT,
  sort_order INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_finance_categories_type ON finance_categories(type);
CREATE INDEX IF NOT EXISTS idx_finance_categories_parent ON finance_categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_finance_categories_active ON finance_categories(is_active);

-- ============================================================================
-- 3. TRANSACTIONS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS finance_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  account_id UUID NOT NULL REFERENCES finance_accounts(id) ON DELETE CASCADE,
  
  -- Core transaction data
  date_posted DATE NOT NULL,
  amount NUMERIC(12, 2) NOT NULL, -- positive = inflow, negative = outflow
  currency TEXT NOT NULL DEFAULT 'CAD',
  
  -- Descriptions
  description_raw TEXT NOT NULL,
  description_clean TEXT,
  merchant_name TEXT,
  
  -- Classification
  category_id UUID REFERENCES finance_categories(id) ON DELETE SET NULL,
  tags JSONB DEFAULT '[]',
  
  -- Review & Intent
  review_status TEXT NOT NULL DEFAULT 'unreviewed' CHECK (review_status IN ('unreviewed', 'confirmed', 'flagged')),
  intent_label TEXT CHECK (intent_label IN ('aligned', 'neutral', 'misaligned')),
  
  -- Metadata
  is_recurring BOOLEAN DEFAULT false,
  notes TEXT,
  source TEXT NOT NULL DEFAULT 'manual' CHECK (source IN ('manual', 'csv_import', 'api')),
  metadata JSONB DEFAULT '{}',
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_finance_transactions_user ON finance_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_finance_transactions_account ON finance_transactions(account_id);
CREATE INDEX IF NOT EXISTS idx_finance_transactions_date ON finance_transactions(date_posted DESC);
CREATE INDEX IF NOT EXISTS idx_finance_transactions_category ON finance_transactions(category_id);
CREATE INDEX IF NOT EXISTS idx_finance_transactions_review_status ON finance_transactions(review_status);
CREATE INDEX IF NOT EXISTS idx_finance_transactions_intent ON finance_transactions(intent_label);
CREATE INDEX IF NOT EXISTS idx_finance_transactions_source ON finance_transactions(source);

-- GIN index for JSONB tags search
CREATE INDEX IF NOT EXISTS idx_finance_transactions_tags ON finance_transactions USING GIN (tags);

-- ============================================================================
-- 4. BUDGETS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS finance_budgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  category_id UUID NOT NULL REFERENCES finance_categories(id) ON DELETE CASCADE,
  
  -- Period (YYYY-MM format)
  period TEXT NOT NULL, -- e.g. "2025-01"
  
  -- Budget amounts
  amount_planned NUMERIC(12, 2) NOT NULL,
  amount_spent NUMERIC(12, 2) DEFAULT 0,
  
  -- Status (computed)
  status TEXT CHECK (status IN ('under', 'at', 'over')),
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT finance_budgets_user_category_period_unique UNIQUE (user_id, category_id, period)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_finance_budgets_user ON finance_budgets(user_id);
CREATE INDEX IF NOT EXISTS idx_finance_budgets_category ON finance_budgets(category_id);
CREATE INDEX IF NOT EXISTS idx_finance_budgets_period ON finance_budgets(period);

-- ============================================================================
-- 5. REVIEW SESSIONS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS finance_review_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  
  -- Session metadata
  started_at TIMESTAMPTZ NOT NULL,
  ended_at TIMESTAMPTZ,
  scope TEXT NOT NULL CHECK (scope IN ('daily', 'weekly', 'monthly')),
  
  -- What was reviewed
  transactions_reviewed JSONB DEFAULT '[]', -- array of transaction IDs
  
  -- Reflection
  summary_text TEXT,
  intent_score INTEGER CHECK (intent_score BETWEEN 1 AND 5),
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_finance_review_sessions_user ON finance_review_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_finance_review_sessions_started ON finance_review_sessions(started_at DESC);
CREATE INDEX IF NOT EXISTS idx_finance_review_sessions_scope ON finance_review_sessions(scope);

-- ============================================================================
-- 6. ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE finance_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE finance_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE finance_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE finance_budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE finance_review_sessions ENABLE ROW LEVEL SECURITY;

-- Accounts policies
DROP POLICY IF EXISTS "Users can view their own accounts" ON finance_accounts;
CREATE POLICY "Users can view their own accounts"
  ON finance_accounts FOR SELECT
  USING (user_id = current_setting('app.current_user_id', true));

DROP POLICY IF EXISTS "Users can insert their own accounts" ON finance_accounts;
CREATE POLICY "Users can insert their own accounts"
  ON finance_accounts FOR INSERT
  WITH CHECK (user_id = current_setting('app.current_user_id', true));

DROP POLICY IF EXISTS "Users can update their own accounts" ON finance_accounts;
CREATE POLICY "Users can update their own accounts"
  ON finance_accounts FOR UPDATE
  USING (user_id = current_setting('app.current_user_id', true));

DROP POLICY IF EXISTS "Users can delete their own accounts" ON finance_accounts;
CREATE POLICY "Users can delete their own accounts"
  ON finance_accounts FOR DELETE
  USING (user_id = current_setting('app.current_user_id', true));

-- Categories policies (read-only for core, CRUD for user-created)
DROP POLICY IF EXISTS "Anyone can view active categories" ON finance_categories;
CREATE POLICY "Anyone can view active categories"
  ON finance_categories FOR SELECT
  USING (is_active = true);

-- Transactions policies
DROP POLICY IF EXISTS "Users can view their own transactions" ON finance_transactions;
CREATE POLICY "Users can view their own transactions"
  ON finance_transactions FOR SELECT
  USING (user_id = current_setting('app.current_user_id', true));

DROP POLICY IF EXISTS "Users can insert their own transactions" ON finance_transactions;
CREATE POLICY "Users can insert their own transactions"
  ON finance_transactions FOR INSERT
  WITH CHECK (user_id = current_setting('app.current_user_id', true));

DROP POLICY IF EXISTS "Users can update their own transactions" ON finance_transactions;
CREATE POLICY "Users can update their own transactions"
  ON finance_transactions FOR UPDATE
  USING (user_id = current_setting('app.current_user_id', true));

DROP POLICY IF EXISTS "Users can delete their own transactions" ON finance_transactions;
CREATE POLICY "Users can delete their own transactions"
  ON finance_transactions FOR DELETE
  USING (user_id = current_setting('app.current_user_id', true));

-- Budgets policies
DROP POLICY IF EXISTS "Users can view their own budgets" ON finance_budgets;
CREATE POLICY "Users can view their own budgets"
  ON finance_budgets FOR SELECT
  USING (user_id = current_setting('app.current_user_id', true));

DROP POLICY IF EXISTS "Users can insert their own budgets" ON finance_budgets;
CREATE POLICY "Users can insert their own budgets"
  ON finance_budgets FOR INSERT
  WITH CHECK (user_id = current_setting('app.current_user_id', true));

DROP POLICY IF EXISTS "Users can update their own budgets" ON finance_budgets;
CREATE POLICY "Users can update their own budgets"
  ON finance_budgets FOR UPDATE
  USING (user_id = current_setting('app.current_user_id', true));

DROP POLICY IF EXISTS "Users can delete their own budgets" ON finance_budgets;
CREATE POLICY "Users can delete their own budgets"
  ON finance_budgets FOR DELETE
  USING (user_id = current_setting('app.current_user_id', true));

-- Review sessions policies
DROP POLICY IF EXISTS "Users can view their own review sessions" ON finance_review_sessions;
CREATE POLICY "Users can view their own review sessions"
  ON finance_review_sessions FOR SELECT
  USING (user_id = current_setting('app.current_user_id', true));

DROP POLICY IF EXISTS "Users can insert their own review sessions" ON finance_review_sessions;
CREATE POLICY "Users can insert their own review sessions"
  ON finance_review_sessions FOR INSERT
  WITH CHECK (user_id = current_setting('app.current_user_id', true));

-- ============================================================================
-- 7. TRIGGERS FOR UPDATED_AT
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_finance_accounts_updated_at ON finance_accounts;
CREATE TRIGGER update_finance_accounts_updated_at
  BEFORE UPDATE ON finance_accounts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_finance_categories_updated_at ON finance_categories;
CREATE TRIGGER update_finance_categories_updated_at
  BEFORE UPDATE ON finance_categories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_finance_transactions_updated_at ON finance_transactions;
CREATE TRIGGER update_finance_transactions_updated_at
  BEFORE UPDATE ON finance_transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_finance_budgets_updated_at ON finance_budgets;
CREATE TRIGGER update_finance_budgets_updated_at
  BEFORE UPDATE ON finance_budgets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 8. HELPER FUNCTIONS
-- ============================================================================

-- Function to calculate budget status
CREATE OR REPLACE FUNCTION calculate_budget_status()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.amount_spent < NEW.amount_planned * 0.9 THEN
    NEW.status = 'under';
  ELSIF NEW.amount_spent <= NEW.amount_planned THEN
    NEW.status = 'at';
  ELSE
    NEW.status = 'over';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_finance_budgets_status ON finance_budgets;
CREATE TRIGGER set_finance_budgets_status
  BEFORE INSERT OR UPDATE OF amount_spent, amount_planned ON finance_budgets
  FOR EACH ROW
  EXECUTE FUNCTION calculate_budget_status();

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================
-- Next step: Run scripts/seed-finance-data.sql to populate base categories

