/**
 * Supabase Database Types
 * 
 * TypeScript interfaces for Orb database tables
 */

/**
 * Sol Insights Table
 * Stores strategic insights and intent analysis from Sol
 */
export interface SolInsight {
  id: string;
  user_id: string;
  session_id: string | null;
  intent: string;
  confidence: number;
  tone: 'positive' | 'neutral' | 'urgent';
  prompt: string;
  summary: string;
  role: string;
  highlight_color: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

/**
 * Luna Profiles Table
 * Stores user preferences and constraints per mode
 */
export interface LunaProfile {
  user_id: string;
  mode_id: string;
  preferences: Record<string, unknown>;
  constraints: Record<string, unknown>;
  updated_at: string;
}

/**
 * Luna Active Modes Table
 * Tracks which mode each user is currently in
 */
export interface LunaActiveMode {
  user_id: string;
  mode_id: string;
  updated_at: string;
}

/**
 * Te Reflections Table
 * Stores reflection logs from the Te agent
 */
export interface TeReflection {
  id: string;
  user_id: string;
  session_id: string | null;
  input: string;
  output: string;
  tags: string[];
  notes: string | null;
  created_at: string;
}

/**
 * Mav Actions Table
 * Logs actions executed by the Mav agent
 */
export interface MavAction {
  id: string;
  user_id: string;
  session_id: string | null;
  task_id: string;
  action_id: string;
  tool_id: string | null;
  kind: string;
  params: Record<string, unknown> | null;
  status: string;
  output: string | null;
  error: string | null;
  created_at: string;
}

/**
 * User Preferences Table
 * Stores per-user appearance and customization settings
 */
export interface UserPreferenceRow {
  user_id: string;
  appearance: Record<string, unknown>;
  notifications: Record<string, unknown>;
  layout: Record<string, unknown>;
  widgets: Record<string, unknown>;
  presets: Record<string, unknown>[];
  device_overrides: Record<string, unknown>;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

/**
 * Table names enum for type safety
 */
export enum TableName {
  SOL_INSIGHTS = 'sol_insights',
  LUNA_PROFILES = 'luna_profiles',
  LUNA_ACTIVE_MODES = 'luna_active_modes',
  TE_REFLECTIONS = 'te_reflections',
  MAV_ACTIONS = 'mav_actions',
  USER_PREFERENCES = 'user_preferences',
}

/**
 * Union type of all table records
 */
export type TableRecord =
  | SolInsight
  | LunaProfile
  | LunaActiveMode
  | TeReflection
  | MavAction
  | UserPreferenceRow;

/**
 * Table metadata for UI display
 */
export interface TableMetadata {
  name: TableName;
  displayName: string;
  description: string;
  color: string;
  icon: string;
  columns: ColumnMetadata[];
}

/**
 * Column metadata for UI display
 */
export interface ColumnMetadata {
  key: string;
  label: string;
  type: 'text' | 'json' | 'timestamp' | 'id';
  width?: string;
  searchable?: boolean;
}

/**
 * Query result with pagination
 */
export interface QueryResult<T> {
  data: T[];
  count: number | null;
  error: string | null;
}

/**
 * Query options
 */
export interface QueryOptions {
  limit?: number;
  offset?: number;
  search?: string;
  orderBy?: string;
  orderDirection?: 'asc' | 'desc';
}

