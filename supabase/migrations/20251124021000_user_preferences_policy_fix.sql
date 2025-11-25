-- Fix user_preferences RLS policy to handle text user_id vs Supabase UUID auth IDs

DROP POLICY IF EXISTS "Users manage their preferences" ON user_preferences;

CREATE POLICY "Users manage their preferences"
  ON user_preferences
  USING (
    auth.uid() IS NOT NULL
    AND user_id = auth.uid()::text
  )
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND user_id = auth.uid()::text
  );


