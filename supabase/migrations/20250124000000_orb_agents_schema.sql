-- Orb Agents Schema Migration
-- Tables for Sol, Luna, Te, and Mav agents
-- 
-- Tables:
--   - sol_insights: Strategic insights and intent analysis from Sol
--   - luna_profiles: User preferences per mode (Luna)
--   - luna_active_modes: Current active mode per user (Luna)
--   - te_reflections: Reflection logs (Te)
--   - mav_actions: Action execution logs (Mav)
--
-- Author: Orb System
-- Date: 2025-01-24

-- ============================================================================
-- 1. SOL INSIGHTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS sol_insights (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  session_id TEXT,
  
  -- Intent analysis
  intent TEXT NOT NULL,
  confidence NUMERIC(3, 2) NOT NULL CHECK (confidence >= 0 AND confidence <= 1),
  tone TEXT NOT NULL CHECK (tone IN ('positive', 'neutral', 'urgent')),
  
  -- Context
  prompt TEXT NOT NULL,
  summary TEXT NOT NULL,
  
  -- Metadata
  role TEXT NOT NULL DEFAULT 'sol',
  highlight_color TEXT,
  metadata JSONB DEFAULT '{}',
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_sol_insights_user ON sol_insights(user_id);
CREATE INDEX idx_sol_insights_session ON sol_insights(session_id);
CREATE INDEX idx_sol_insights_intent ON sol_insights(intent);
CREATE INDEX idx_sol_insights_tone ON sol_insights(tone);
CREATE INDEX idx_sol_insights_created ON sol_insights(created_at DESC);

-- ============================================================================
-- 2. LUNA PROFILES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS luna_profiles (
  user_id TEXT NOT NULL,
  mode_id TEXT NOT NULL,
  preferences JSONB NOT NULL,
  constraints JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, mode_id)
);

CREATE INDEX IF NOT EXISTS idx_luna_profiles_user ON luna_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_luna_profiles_mode ON luna_profiles(mode_id);

-- ============================================================================
-- 3. LUNA ACTIVE MODES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS luna_active_modes (
  user_id TEXT PRIMARY KEY,
  mode_id TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 4. TE REFLECTIONS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS te_reflections (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  session_id TEXT,
  input TEXT NOT NULL,
  output TEXT NOT NULL,
  tags JSONB NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_te_reflections_user ON te_reflections(user_id);
CREATE INDEX IF NOT EXISTS idx_te_reflections_session ON te_reflections(session_id);
CREATE INDEX IF NOT EXISTS idx_te_reflections_created ON te_reflections(created_at DESC);

-- ============================================================================
-- 5. MAV ACTIONS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS mav_actions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  session_id TEXT,
  task_id TEXT NOT NULL,
  action_id TEXT NOT NULL,
  tool_id TEXT,
  kind TEXT NOT NULL,
  params JSONB,
  status TEXT NOT NULL,
  output TEXT,
  error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_mav_actions_user ON mav_actions(user_id);
CREATE INDEX IF NOT EXISTS idx_mav_actions_task ON mav_actions(task_id);
CREATE INDEX IF NOT EXISTS idx_mav_actions_status ON mav_actions(status);
CREATE INDEX IF NOT EXISTS idx_mav_actions_created ON mav_actions(created_at DESC);

-- ============================================================================
-- 6. ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE sol_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE luna_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE luna_active_modes ENABLE ROW LEVEL SECURITY;
ALTER TABLE te_reflections ENABLE ROW LEVEL SECURITY;
ALTER TABLE mav_actions ENABLE ROW LEVEL SECURITY;

-- Sol Insights policies
CREATE POLICY "Users can view their own insights"
  ON sol_insights FOR SELECT
  USING (user_id = current_setting('app.current_user_id', true));

CREATE POLICY "Users can insert their own insights"
  ON sol_insights FOR INSERT
  WITH CHECK (user_id = current_setting('app.current_user_id', true));

-- Luna Profiles policies
CREATE POLICY "Users can view their own luna profiles"
  ON luna_profiles FOR SELECT
  USING (user_id = current_setting('app.current_user_id', true));

CREATE POLICY "Users can insert their own luna profiles"
  ON luna_profiles FOR INSERT
  WITH CHECK (user_id = current_setting('app.current_user_id', true));

CREATE POLICY "Users can update their own luna profiles"
  ON luna_profiles FOR UPDATE
  USING (user_id = current_setting('app.current_user_id', true));

-- Luna Active Modes policies
CREATE POLICY "Users can view their own active mode"
  ON luna_active_modes FOR SELECT
  USING (user_id = current_setting('app.current_user_id', true));

CREATE POLICY "Users can insert their own active mode"
  ON luna_active_modes FOR INSERT
  WITH CHECK (user_id = current_setting('app.current_user_id', true));

CREATE POLICY "Users can update their own active mode"
  ON luna_active_modes FOR UPDATE
  USING (user_id = current_setting('app.current_user_id', true));

-- Te Reflections policies
CREATE POLICY "Users can view their own reflections"
  ON te_reflections FOR SELECT
  USING (user_id = current_setting('app.current_user_id', true));

CREATE POLICY "Users can insert their own reflections"
  ON te_reflections FOR INSERT
  WITH CHECK (user_id = current_setting('app.current_user_id', true));

-- Mav Actions policies
CREATE POLICY "Users can view their own actions"
  ON mav_actions FOR SELECT
  USING (user_id = current_setting('app.current_user_id', true));

CREATE POLICY "Users can insert their own actions"
  ON mav_actions FOR INSERT
  WITH CHECK (user_id = current_setting('app.current_user_id', true));

CREATE POLICY "Users can update their own actions"
  ON mav_actions FOR UPDATE
  USING (user_id = current_setting('app.current_user_id', true));

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================
-- All Orb agent tables are now ready for use

