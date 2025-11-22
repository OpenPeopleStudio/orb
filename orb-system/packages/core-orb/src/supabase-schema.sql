-- Supabase Schema Migration
-- Run this SQL in your Supabase SQL editor to create the required tables

-- Luna profiles table
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

-- Luna active modes table
CREATE TABLE IF NOT EXISTS luna_active_modes (
  user_id TEXT PRIMARY KEY,
  mode_id TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Te reflections table
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

-- Mav actions log table
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
CREATE INDEX IF NOT EXISTS idx_mav_actions_created ON mav_actions(created_at DESC);

-- Enable Row Level Security (RLS) - adjust policies as needed
ALTER TABLE luna_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE luna_active_modes ENABLE ROW LEVEL SECURITY;
ALTER TABLE te_reflections ENABLE ROW LEVEL SECURITY;
ALTER TABLE mav_actions ENABLE ROW LEVEL SECURITY;

-- Basic policy: allow service role to do everything
-- In production, you should create more restrictive policies
CREATE POLICY "Service role can manage luna_profiles" ON luna_profiles
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Service role can manage luna_active_modes" ON luna_active_modes
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Service role can manage te_reflections" ON te_reflections
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Service role can manage mav_actions" ON mav_actions
  FOR ALL USING (true) WITH CHECK (true);

-- Orb events table (for event bus)
CREATE TABLE IF NOT EXISTS orb_events (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL,
  user_id TEXT,
  session_id TEXT,
  device_id TEXT,
  mode TEXT,
  persona TEXT,
  role TEXT,
  payload JSONB NOT NULL DEFAULT '{}',
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_orb_events_type ON orb_events(type);
CREATE INDEX IF NOT EXISTS idx_orb_events_user ON orb_events(user_id);
CREATE INDEX IF NOT EXISTS idx_orb_events_session ON orb_events(session_id);
CREATE INDEX IF NOT EXISTS idx_orb_events_timestamp ON orb_events(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_orb_events_mode ON orb_events(mode);
CREATE INDEX IF NOT EXISTS idx_orb_events_role ON orb_events(role);

ALTER TABLE orb_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can manage orb_events" ON orb_events
  FOR ALL USING (true) WITH CHECK (true);

