-- Seed Data for Orb Agent Tables
-- Test data for Sol, Luna, Te, and Mav agents
-- 
-- Run this in Supabase SQL Editor after running the migration
-- Author: Orb System
-- Date: 2025-01-24

-- ============================================================================
-- SET USER CONTEXT FOR RLS
-- ============================================================================
-- Replace 'test-user-123' with your actual user ID
SET app.current_user_id = 'test-user-123';

-- ============================================================================
-- 1. SOL INSIGHTS - Strategic Intent Analysis
-- ============================================================================
INSERT INTO sol_insights (id, user_id, session_id, intent, confidence, tone, prompt, summary, role, highlight_color, metadata, created_at)
VALUES
  (
    'sol_session1_001',
    'test-user-123',
    'session1',
    'launch-readiness',
    0.85,
    'urgent',
    'We need to ship the new dashboard feature by end of week',
    'SOL sees launch-readiness with 85% confidence',
    'sol',
    '#FFD700',
    '{"priority": "high", "stakeholders": ["product", "engineering"]}',
    NOW() - INTERVAL '2 hours'
  ),
  (
    'sol_session1_002',
    'test-user-123',
    'session1',
    'experience-refresh',
    0.78,
    'positive',
    'The onboarding flow needs better design and persona integration',
    'SOL sees experience-refresh with 78% confidence',
    'sol',
    '#FFD700',
    '{"focus_area": "onboarding", "impact": "medium"}',
    NOW() - INTERVAL '1 hour'
  ),
  (
    'sol_session2_003',
    'test-user-123',
    'session2',
    'stability-pass',
    0.92,
    'urgent',
    'Critical bug blocking production deployment',
    'SOL sees stability-pass with 92% confidence',
    'sol',
    '#FFD700',
    '{"severity": "critical", "environment": "production"}',
    NOW() - INTERVAL '30 minutes'
  ),
  (
    'sol_session3_004',
    'test-user-123',
    'session3',
    'synchronization',
    0.65,
    'neutral',
    'Need a quick standup summary for the team',
    'SOL sees synchronization with 65% confidence',
    'sol',
    '#FFD700',
    '{"meeting_type": "standup", "team": "engineering"}',
    NOW() - INTERVAL '15 minutes'
  );

-- ============================================================================
-- 2. LUNA PROFILES - User Preferences per Mode
-- ============================================================================
INSERT INTO luna_profiles (user_id, mode_id, preferences, constraints, updated_at)
VALUES
  (
    'test-user-123',
    'work',
    '{"theme": "dark", "notifications": "focus", "sidebar": "collapsed", "fontSize": 14}',
    '{"maxCost": 100, "allowedTools": ["terminal", "browser", "editor"], "workingHours": "9-17"}',
    NOW() - INTERVAL '1 day'
  ),
  (
    'test-user-123',
    'personal',
    '{"theme": "light", "notifications": "all", "sidebar": "expanded", "fontSize": 16}',
    '{"maxCost": 50, "allowedTools": ["all"], "workingHours": "any"}',
    NOW() - INTERVAL '2 days'
  ),
  (
    'test-user-123',
    'research',
    '{"theme": "dark", "notifications": "minimal", "sidebar": "expanded", "fontSize": 12}',
    '{"maxCost": 200, "allowedTools": ["terminal", "browser", "jupyter"], "workingHours": "any"}',
    NOW() - INTERVAL '3 days'
  );

-- ============================================================================
-- 3. LUNA ACTIVE MODES - Current Mode per User
-- ============================================================================
INSERT INTO luna_active_modes (user_id, mode_id, updated_at)
VALUES
  ('test-user-123', 'work', NOW())
ON CONFLICT (user_id) DO UPDATE
  SET mode_id = EXCLUDED.mode_id,
      updated_at = EXCLUDED.updated_at;

-- ============================================================================
-- 4. TE REFLECTIONS - Learning and Reflection Logs
-- ============================================================================
INSERT INTO te_reflections (id, user_id, session_id, input, output, tags, notes, created_at)
VALUES
  (
    'te_session1_001',
    'test-user-123',
    'session1',
    'User asked about implementing authentication',
    'TE reflects on 3 inputs and prioritizes quadrant 2. Authentication patterns: JWT vs Session',
    '["authentication", "security", "backend"]',
    'Consider adding OAuth2 support in future iterations',
    NOW() - INTERVAL '2 hours'
  ),
  (
    'te_session1_002',
    'test-user-123',
    'session1',
    'Database schema optimization questions',
    'TE reflects on 2 inputs and prioritizes quadrant 1. Index optimization recommended',
    '["database", "performance", "optimization"]',
    'Run EXPLAIN ANALYZE to identify slow queries',
    NOW() - INTERVAL '1 hour'
  ),
  (
    'te_session2_003',
    'test-user-123',
    'session2',
    'Frontend component architecture review',
    'TE reflects on 4 inputs and prioritizes quadrant 3. Component composition patterns',
    '["frontend", "react", "architecture"]',
    'Consider extracting shared logic into custom hooks',
    NOW() - INTERVAL '30 minutes'
  );

-- ============================================================================
-- 5. MAV ACTIONS - Action Execution Logs
-- ============================================================================
INSERT INTO mav_actions (id, user_id, session_id, task_id, action_id, tool_id, kind, params, status, output, error, created_at)
VALUES
  (
    'mav_session1_001',
    'test-user-123',
    'session1',
    'task_deploy_001',
    'action_001',
    'shell',
    'execute',
    '{"command": "npm run build", "cwd": "/app"}',
    'completed',
    'Build completed successfully in 45s',
    NULL,
    NOW() - INTERVAL '2 hours'
  ),
  (
    'mav_session1_002',
    'test-user-123',
    'session1',
    'task_deploy_001',
    'action_002',
    'shell',
    'execute',
    '{"command": "npm run test", "cwd": "/app"}',
    'completed',
    'All tests passed (24/24)',
    NULL,
    NOW() - INTERVAL '1 hour 50 minutes'
  ),
  (
    'mav_session1_003',
    'test-user-123',
    'session1',
    'task_deploy_001',
    'action_003',
    'vercel',
    'deploy',
    '{"project": "orb-web", "environment": "production"}',
    'running',
    NULL,
    NULL,
    NOW() - INTERVAL '1 hour 45 minutes'
  ),
  (
    'mav_session2_004',
    'test-user-123',
    'session2',
    'task_debug_001',
    'action_004',
    'terminal',
    'read_logs',
    '{"file": "/var/log/app.log", "lines": 100}',
    'completed',
    'Found 3 error entries in the last hour',
    NULL,
    NOW() - INTERVAL '30 minutes'
  ),
  (
    'mav_session2_005',
    'test-user-123',
    'session2',
    'task_debug_001',
    'action_005',
    'editor',
    'fix_bug',
    '{"file": "src/api/handler.ts", "line": 42}',
    'failed',
    NULL,
    'Syntax error: unexpected token',
    NOW() - INTERVAL '20 minutes'
  );

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Check Sol Insights count
SELECT COUNT(*) AS sol_insights_count FROM sol_insights WHERE user_id = 'test-user-123';

-- Check Luna Profiles count
SELECT COUNT(*) AS luna_profiles_count FROM luna_profiles WHERE user_id = 'test-user-123';

-- Check Luna Active Mode
SELECT * FROM luna_active_modes WHERE user_id = 'test-user-123';

-- Check Te Reflections count
SELECT COUNT(*) AS te_reflections_count FROM te_reflections WHERE user_id = 'test-user-123';

-- Check Mav Actions count and status distribution
SELECT status, COUNT(*) AS count 
FROM mav_actions 
WHERE user_id = 'test-user-123' 
GROUP BY status;

-- ============================================================================
-- CLEANUP (Optional - uncomment to remove test data)
-- ============================================================================
-- DELETE FROM sol_insights WHERE user_id = 'test-user-123';
-- DELETE FROM luna_profiles WHERE user_id = 'test-user-123';
-- DELETE FROM luna_active_modes WHERE user_id = 'test-user-123';
-- DELETE FROM te_reflections WHERE user_id = 'test-user-123';
-- DELETE FROM mav_actions WHERE user_id = 'test-user-123';

