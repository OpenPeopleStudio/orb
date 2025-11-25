-- Extend user_preferences for multi-tenant customization

ALTER TABLE user_preferences
  ADD COLUMN IF NOT EXISTS notifications JSONB NOT NULL DEFAULT jsonb_build_object(
    'inboxPriorityOnly', false,
    'inboxDesktopAlerts', true,
    'missionEscalations', 'all',
    'weeklyDigest', true
  );

ALTER TABLE user_preferences
  ADD COLUMN IF NOT EXISTS layout JSONB NOT NULL DEFAULT jsonb_build_object(
    'panelStyle', 'windowed',
    'showTimeline', true,
    'showAgentDock', true,
    'focusMode', false
  );

ALTER TABLE user_preferences
  ADD COLUMN IF NOT EXISTS widgets JSONB NOT NULL DEFAULT jsonb_build_object(
    'pinned', jsonb_build_array('inbox', 'finance', 'missions'),
    'quickLaunch', jsonb_build_array('compose', 'new-mission'),
    'showWeather', false
  );

ALTER TABLE user_preferences
  ADD COLUMN IF NOT EXISTS presets JSONB NOT NULL DEFAULT jsonb_build_array();

ALTER TABLE user_preferences
  ADD COLUMN IF NOT EXISTS device_overrides JSONB NOT NULL DEFAULT '{}'::jsonb;

-- Tighten RLS policies for multi-tenant Supabase auth (replaces legacy policies)
DROP POLICY IF EXISTS "Users can read their preferences" ON user_preferences;
DROP POLICY IF EXISTS "Users can insert their preferences" ON user_preferences;
DROP POLICY IF EXISTS "Users can update their preferences" ON user_preferences;

DROP POLICY IF EXISTS "Users manage their preferences" ON user_preferences;
CREATE POLICY "Users manage their preferences"
  ON user_preferences
  USING (auth.uid() IS NOT NULL AND user_id = auth.uid()::text)
  WITH CHECK (auth.uid() IS NOT NULL AND user_id = auth.uid()::text);


