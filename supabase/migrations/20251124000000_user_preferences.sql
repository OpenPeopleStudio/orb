-- User Preferences Schema
-- Stores customizable appearance settings per user

CREATE TABLE IF NOT EXISTS user_preferences (
  user_id TEXT PRIMARY KEY,
  appearance JSONB NOT NULL DEFAULT jsonb_build_object(
    'theme', 'default',
    'density', 'comfortable',
    'cornerRadius', 'rounded'
  ),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Keep updated_at fresh on every update
CREATE OR REPLACE FUNCTION set_user_preferences_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_user_preferences_updated_at ON user_preferences;
CREATE TRIGGER trg_user_preferences_updated_at
BEFORE UPDATE ON user_preferences
FOR EACH ROW
EXECUTE FUNCTION set_user_preferences_updated_at();

-- Enable row-level security
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read their preferences" ON user_preferences;
CREATE POLICY "Users can read their preferences"
  ON user_preferences
  FOR SELECT
  USING (user_id = current_setting('app.current_user_id', true));

DROP POLICY IF EXISTS "Users can insert their preferences" ON user_preferences;
CREATE POLICY "Users can insert their preferences"
  ON user_preferences
  FOR INSERT
  WITH CHECK (user_id = current_setting('app.current_user_id', true));

DROP POLICY IF EXISTS "Users can update their preferences" ON user_preferences;
CREATE POLICY "Users can update their preferences"
  ON user_preferences
  FOR UPDATE
  USING (user_id = current_setting('app.current_user_id', true));


