/**
 * Supabase Database Service
 * 
 * Functions for querying Orb tables
 */

import { getSupabaseClient } from './client';
import { TableName } from './types';
import type {
  TableRecord,
  QueryResult,
  QueryOptions,
  SolInsight,
  LunaProfile,
  LunaActiveMode,
  TeReflection,
  MavAction,
  UserPreferenceRow,
  TableMetadata,
} from './types';

/**
 * Fetch records from a table with pagination and search
 */
export async function fetchTableData<T extends TableRecord>(
  tableName: TableName,
  options: QueryOptions = {}
): Promise<QueryResult<T>> {
  try {
    const supabase = getSupabaseClient();
    const {
      limit = 50,
      offset = 0,
      search = '',
      orderBy = 'created_at',
      orderDirection = 'desc',
    } = options;

    let query = supabase.from(tableName).select('*', { count: 'exact' });

    // Apply search if provided
    if (search) {
      // Search across common text fields
      const searchFields = getSearchableFields(tableName);
      if (searchFields.length > 0) {
        const orConditions = searchFields
          .map((field) => `${field}.ilike.%${search}%`)
          .join(',');
        query = query.or(orConditions);
      }
    }

    // Apply ordering (fallback to updated_at or created_at)
    const orderField = hasColumn(tableName, orderBy)
      ? orderBy
      : hasColumn(tableName, 'created_at')
      ? 'created_at'
      : hasColumn(tableName, 'updated_at')
      ? 'updated_at'
      : undefined;

    if (orderField) {
      query = query.order(orderField, { ascending: orderDirection === 'asc' });
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      return {
        data: [],
        count: 0,
        error: error.message,
      };
    }

    return {
      data: (data as T[]) || [],
      count,
      error: null,
    };
  } catch (error) {
    return {
      data: [],
      count: 0,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Fetch Sol insights
 */
export async function fetchSolInsights(
  options?: QueryOptions
): Promise<QueryResult<SolInsight>> {
  return fetchTableData<SolInsight>(TableName.SOL_INSIGHTS, options);
}

/**
 * Fetch Luna profiles
 */
export async function fetchLunaProfiles(
  options?: QueryOptions
): Promise<QueryResult<LunaProfile>> {
  return fetchTableData<LunaProfile>(TableName.LUNA_PROFILES, {
    ...options,
    orderBy: 'updated_at',
  });
}

/**
 * Fetch Luna active modes
 */
export async function fetchLunaActiveModes(
  options?: QueryOptions
): Promise<QueryResult<LunaActiveMode>> {
  return fetchTableData<LunaActiveMode>(TableName.LUNA_ACTIVE_MODES, {
    ...options,
    orderBy: 'updated_at',
  });
}

/**
 * Fetch Te reflections
 */
export async function fetchTeReflections(
  options?: QueryOptions
): Promise<QueryResult<TeReflection>> {
  return fetchTableData<TeReflection>(TableName.TE_REFLECTIONS, options);
}

/**
 * Fetch Mav actions
 */
export async function fetchMavActions(
  options?: QueryOptions
): Promise<QueryResult<MavAction>> {
  return fetchTableData<MavAction>(TableName.MAV_ACTIONS, options);
}

/**
 * Fetch User Preferences (admin view)
 */
export async function fetchUserPreferencesRows(
  options?: QueryOptions
): Promise<QueryResult<UserPreferenceRow>> {
  return fetchTableData<UserPreferenceRow>(TableName.USER_PREFERENCES, {
    ...options,
    orderBy: 'updated_at',
  });
}

/**
 * Get searchable fields for a table
 */
function getSearchableFields(tableName: TableName): string[] {
  switch (tableName) {
    case TableName.SOL_INSIGHTS:
      return ['user_id', 'session_id', 'intent', 'tone', 'prompt', 'summary'];
    case TableName.LUNA_PROFILES:
      return ['user_id', 'mode_id'];
    case TableName.LUNA_ACTIVE_MODES:
      return ['user_id', 'mode_id'];
    case TableName.TE_REFLECTIONS:
      return ['user_id', 'session_id', 'input', 'output', 'notes'];
    case TableName.MAV_ACTIONS:
      return ['user_id', 'session_id', 'task_id', 'action_id', 'tool_id', 'kind', 'status'];
    case TableName.USER_PREFERENCES:
      return ['user_id'];
    default:
      return [];
  }
}

/**
 * Check if a table has a specific column
 */
function hasColumn(tableName: TableName, column: string): boolean {
  const columnMap: Record<TableName, string[]> = {
    [TableName.SOL_INSIGHTS]: [
      'id',
      'user_id',
      'session_id',
      'intent',
      'confidence',
      'tone',
      'prompt',
      'summary',
      'role',
      'highlight_color',
      'metadata',
      'created_at',
    ],
    [TableName.LUNA_PROFILES]: ['user_id', 'mode_id', 'preferences', 'constraints', 'updated_at'],
    [TableName.LUNA_ACTIVE_MODES]: ['user_id', 'mode_id', 'updated_at'],
    [TableName.TE_REFLECTIONS]: [
      'id',
      'user_id',
      'session_id',
      'input',
      'output',
      'tags',
      'notes',
      'created_at',
    ],
    [TableName.MAV_ACTIONS]: [
      'id',
      'user_id',
      'session_id',
      'task_id',
      'action_id',
      'tool_id',
      'kind',
      'params',
      'status',
      'output',
      'error',
      'created_at',
    ],
    [TableName.USER_PREFERENCES]: [
      'user_id',
      'appearance',
      'notifications',
      'layout',
      'widgets',
      'presets',
      'device_overrides',
      'metadata',
      'created_at',
      'updated_at',
    ],
  };

  return columnMap[tableName]?.includes(column) || false;
}

/**
 * Get table metadata for UI display
 */
export function getTableMetadata(tableName: TableName): TableMetadata {
  const metadata: Record<TableName, TableMetadata> = {
    [TableName.SOL_INSIGHTS]: {
      name: TableName.SOL_INSIGHTS,
      displayName: 'Sol Insights',
      description: 'Strategic insights and intent analysis from Sol',
      color: 'accent-sol',
      icon: '☀️',
      columns: [
        { key: 'id', label: 'ID', type: 'id', width: '100px' },
        { key: 'user_id', label: 'User ID', type: 'text', searchable: true },
        { key: 'session_id', label: 'Session', type: 'text', searchable: true },
        { key: 'intent', label: 'Intent', type: 'text', searchable: true },
        { key: 'confidence', label: 'Confidence', type: 'text', searchable: false },
        { key: 'tone', label: 'Tone', type: 'text', searchable: true },
        { key: 'prompt', label: 'Prompt', type: 'text', searchable: true },
        { key: 'summary', label: 'Summary', type: 'text', searchable: true },
        { key: 'metadata', label: 'Metadata', type: 'json' },
        { key: 'created_at', label: 'Created', type: 'timestamp' },
      ],
    },
    [TableName.LUNA_PROFILES]: {
      name: TableName.LUNA_PROFILES,
      displayName: 'Luna Profiles',
      description: 'User preferences and constraints per mode',
      color: 'accent-luna',
      icon: '🌙',
      columns: [
        { key: 'user_id', label: 'User ID', type: 'text', searchable: true },
        { key: 'mode_id', label: 'Mode ID', type: 'text', searchable: true },
        { key: 'preferences', label: 'Preferences', type: 'json' },
        { key: 'constraints', label: 'Constraints', type: 'json' },
        { key: 'updated_at', label: 'Updated', type: 'timestamp' },
      ],
    },
    [TableName.LUNA_ACTIVE_MODES]: {
      name: TableName.LUNA_ACTIVE_MODES,
      displayName: 'Luna Active Modes',
      description: 'Currently active mode for each user',
      color: 'accent-orb',
      icon: '🔵',
      columns: [
        { key: 'user_id', label: 'User ID', type: 'text', searchable: true },
        { key: 'mode_id', label: 'Mode ID', type: 'text', searchable: true },
        { key: 'updated_at', label: 'Updated', type: 'timestamp' },
      ],
    },
    [TableName.TE_REFLECTIONS]: {
      name: TableName.TE_REFLECTIONS,
      displayName: 'Te Reflections',
      description: 'Reflection logs from Te agent',
      color: 'accent-te',
      icon: '🧠',
      columns: [
        { key: 'id', label: 'ID', type: 'id', width: '100px' },
        { key: 'user_id', label: 'User ID', type: 'text', searchable: true },
        { key: 'session_id', label: 'Session', type: 'text', searchable: true },
        { key: 'input', label: 'Input', type: 'text', searchable: true },
        { key: 'output', label: 'Output', type: 'text', searchable: true },
        { key: 'tags', label: 'Tags', type: 'json' },
        { key: 'notes', label: 'Notes', type: 'text', searchable: true },
        { key: 'created_at', label: 'Created', type: 'timestamp' },
      ],
    },
    [TableName.MAV_ACTIONS]: {
      name: TableName.MAV_ACTIONS,
      displayName: 'Mav Actions',
      description: 'Action execution logs from Mav agent',
      color: 'accent-mav',
      icon: '⚡',
      columns: [
        { key: 'id', label: 'ID', type: 'id', width: '100px' },
        { key: 'user_id', label: 'User ID', type: 'text', searchable: true },
        { key: 'session_id', label: 'Session', type: 'text', searchable: true },
        { key: 'task_id', label: 'Task ID', type: 'text', searchable: true },
        { key: 'action_id', label: 'Action ID', type: 'text', searchable: true },
        { key: 'tool_id', label: 'Tool', type: 'text', searchable: true },
        { key: 'kind', label: 'Kind', type: 'text', searchable: true },
        { key: 'params', label: 'Parameters', type: 'json' },
        { key: 'status', label: 'Status', type: 'text', searchable: true },
        { key: 'output', label: 'Output', type: 'text' },
        { key: 'error', label: 'Error', type: 'text' },
        { key: 'created_at', label: 'Created', type: 'timestamp' },
      ],
    },
    [TableName.USER_PREFERENCES]: {
      name: TableName.USER_PREFERENCES,
      displayName: 'User Preferences',
      description: 'Appearance, notifications, layout, and widget settings per user',
      color: 'accent-luna',
      icon: '🎨',
      columns: [
        { key: 'user_id', label: 'User ID', type: 'text', searchable: true },
        { key: 'appearance', label: 'Appearance', type: 'json' },
        { key: 'notifications', label: 'Notifications', type: 'json' },
        { key: 'layout', label: 'Layout', type: 'json' },
        { key: 'widgets', label: 'Widgets', type: 'json' },
        { key: 'presets', label: 'Presets', type: 'json' },
        { key: 'device_overrides', label: 'Device Overrides', type: 'json' },
        { key: 'metadata', label: 'Metadata', type: 'json' },
        { key: 'created_at', label: 'Created', type: 'timestamp' },
        { key: 'updated_at', label: 'Updated', type: 'timestamp' },
      ],
    },
  };

  return metadata[tableName];
}

/**
 * Get all available tables
 */
export function getAllTables(): TableMetadata[] {
  return [
    getTableMetadata(TableName.SOL_INSIGHTS),
    getTableMetadata(TableName.LUNA_PROFILES),
    getTableMetadata(TableName.LUNA_ACTIVE_MODES),
    getTableMetadata(TableName.TE_REFLECTIONS),
    getTableMetadata(TableName.MAV_ACTIONS),
    getTableMetadata(TableName.USER_PREFERENCES),
  ];
}

