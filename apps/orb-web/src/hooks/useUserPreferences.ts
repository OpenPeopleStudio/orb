import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';

import { getSupabaseClient, isSupabaseConfigured } from '../lib/supabase/client';
import type { UserPreferenceRow } from '../lib/supabase/types';

export type ThemePreference = 'default' | 'high-contrast' | 'neural-glass';
export type DensityPreference = 'comfortable' | 'compact';
export type CornerRadiusPreference = 'small' | 'large';
type StorageProvider = 'supabase' | 'local';
type PreferenceScope = 'global' | 'device';

export interface AppearancePreferences {
  theme: ThemePreference;
  density: DensityPreference;
  cornerRadius: CornerRadiusPreference;
}

export type MissionEscalationLevel = 'all' | 'critical';

export interface NotificationPreferences {
  inboxPriorityOnly: boolean;
  inboxDesktopAlerts: boolean;
  missionEscalations: MissionEscalationLevel;
  weeklyDigest: boolean;
}

export interface LayoutPreferences {
  panelStyle: 'windowed' | 'stacked';
  showTimeline: boolean;
  showAgentDock: boolean;
  focusMode: boolean;
}

export interface WidgetPreferences {
  pinned: string[];
  quickLaunch: string[];
  showWeather: boolean;
}

export interface DeviceOverrideConfig {
  label?: string;
  appearance?: Partial<AppearancePreferences>;
  layout?: Partial<LayoutPreferences>;
  widgets?: Partial<WidgetPreferences>;
  notifications?: Partial<NotificationPreferences>;
  updatedAt?: string;
}

export interface PreferencePreset {
  id: string;
  label: string;
  description?: string;
  scope: 'system' | 'user';
  config: {
    appearance?: Partial<AppearancePreferences>;
    notifications?: Partial<NotificationPreferences>;
    layout?: Partial<LayoutPreferences>;
    widgets?: Partial<WidgetPreferences>;
  };
}

export interface UserPreferencesState {
  appearance: AppearancePreferences;
  notifications: NotificationPreferences;
  layout: LayoutPreferences;
  widgets: WidgetPreferences;
  presets: PreferencePreset[];
  deviceOverrides: Record<string, DeviceOverrideConfig>;
  metadata: Record<string, unknown>;
  updatedAt?: string;
  storageProvider: StorageProvider;
}

export interface UseUserPreferencesResult {
  userId: string | null;
  deviceId: string;
  deviceLabel: string;
  preferences: UserPreferencesState;
  effectiveAppearance: AppearancePreferences;
  effectiveLayout: LayoutPreferences;
  effectiveWidgets: WidgetPreferences;
  deviceOverrideEnabled: boolean;
  availablePresets: PreferencePreset[];
  activePresetId?: string;
  notifications: NotificationPreferences;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  saveError: string | null;
  authError: string | null;
  updateAppearance: (updates: Partial<AppearancePreferences>, options?: { scope?: PreferenceScope }) => Promise<void>;
  updateNotifications: (updates: Partial<NotificationPreferences>) => Promise<void>;
  updateLayout: (updates: Partial<LayoutPreferences>, options?: { scope?: PreferenceScope }) => Promise<void>;
  updateWidgets: (updates: Partial<WidgetPreferences>, options?: { scope?: PreferenceScope }) => Promise<void>;
  toggleDeviceOverride: (enabled: boolean) => Promise<void>;
  applyPreset: (presetId: string) => Promise<void>;
  resetPreferences: () => Promise<void>;
}

type PreferenceUpdater = (current: UserPreferencesState) => UserPreferencesState;

const LOCAL_USER_KEY = 'local-anon';
const DEVICE_STORAGE_KEY = 'orb:user-device-id';

const DEFAULT_APPEARANCE: AppearancePreferences = {
  theme: 'default',
  density: 'comfortable',
  cornerRadius: 'large',
};

const DEFAULT_NOTIFICATIONS: NotificationPreferences = {
  inboxPriorityOnly: false,
  inboxDesktopAlerts: true,
  missionEscalations: 'all',
  weeklyDigest: true,
};

const DEFAULT_LAYOUT: LayoutPreferences = {
  panelStyle: 'windowed',
  showTimeline: true,
  showAgentDock: true,
  focusMode: false,
};

const DEFAULT_WIDGETS: WidgetPreferences = {
  pinned: ['inbox', 'finance', 'missions'],
  quickLaunch: ['compose', 'new-mission'],
  showWeather: false,
};

const SYSTEM_PRESETS: PreferencePreset[] = [
  {
    id: 'deep-focus',
    label: 'Deep Focus',
    description: 'High-contrast, compact density, critical mission alerts only.',
    scope: 'system',
    config: {
      appearance: { theme: 'high-contrast', density: 'compact', cornerRadius: 'small' },
      notifications: { missionEscalations: 'critical', inboxPriorityOnly: true, inboxDesktopAlerts: false },
      layout: { focusMode: true, showTimeline: false },
      widgets: { pinned: ['missions', 'inbox'], quickLaunch: ['new-mission'] },
    },
  },
  {
    id: 'command-deck',
    label: 'Command Deck',
    description: 'Balanced density with full mission telemetry and agent dock.',
    scope: 'system',
    config: {
      appearance: { theme: 'default', density: 'comfortable', cornerRadius: 'large' },
      layout: { panelStyle: 'windowed', showAgentDock: true, showTimeline: true, focusMode: false },
      widgets: { pinned: ['inbox', 'finance', 'missions', 'insights'] },
    },
  },
  {
    id: 'neural-glass',
    label: 'Neural Glass',
    description: 'Glassmorphism palette with relaxed layout and ambient widgets.',
    scope: 'system',
    config: {
      appearance: { theme: 'neural-glass', density: 'comfortable', cornerRadius: 'large' },
      widgets: { showWeather: true },
    },
  },
];

export function useUserPreferences(userId?: string): UseUserPreferencesResult {
  const queryClient = useQueryClient();
  const resolvedUser = useResolvedUser(userId);
  const deviceId = getStableDeviceId();
  const queryKey = ['user-preferences', resolvedUser.storageMode, resolvedUser.userKey];

  const query = useQuery<UserPreferencesState>({
    queryKey,
    queryFn: () =>
      loadPreferences({
        userId: resolvedUser.userId,
        userKey: resolvedUser.userKey,
        storageMode: resolvedUser.storageMode,
      }),
    enabled: resolvedUser.status === 'ready',
    staleTime: 60 * 1000,
  });

  const mutation = useMutation<UserPreferencesState, Error, PreferenceUpdater>({
    mutationFn: async (updater) => {
      const current =
        queryClient.getQueryData<UserPreferencesState>(queryKey) ??
        createDefaultState(resolvedUser.storageMode);
      const next = updater(clonePreferences(current));
      next.storageProvider = resolvedUser.storageMode;

      const persisted = await persistPreferences({
        userId: resolvedUser.storageMode === 'supabase' ? resolvedUser.userId : null,
        userKey: resolvedUser.userKey,
        storageMode: resolvedUser.storageMode,
        snapshot: next,
      });

      return persisted;
    },
    onSuccess: (nextState) => {
      queryClient.setQueryData(queryKey, nextState);
    },
  });

  const preferences = query.data ?? createDefaultState(resolvedUser.storageMode);
  const currentOverride = preferences.deviceOverrides[deviceId];

  const effectiveAppearance = useMemo(
    () => mergeAppearance(preferences.appearance, currentOverride?.appearance),
    [preferences.appearance, currentOverride],
  );

  const effectiveLayout = useMemo(
    () => mergeLayout(preferences.layout, currentOverride?.layout),
    [preferences.layout, currentOverride],
  );

  const effectiveWidgets = useMemo(
    () => mergeWidgets(preferences.widgets, currentOverride?.widgets),
    [preferences.widgets, currentOverride],
  );

  const availablePresets = useMemo(
    () => buildAvailablePresets(preferences.presets),
    [preferences.presets],
  );

  const activePresetId =
    (preferences.metadata?.activePresetId as string | undefined) ?? undefined;
  const deviceLabel = currentOverride?.label ?? inferDeviceLabel();
  const deviceOverrideEnabled = Boolean(currentOverride);

  const updateAppearance = async (
    updates: Partial<AppearancePreferences>,
    options: { scope?: PreferenceScope } = {},
  ) => {
    const scope = options.scope ?? 'global';
    await mutation.mutateAsync((current) => {
      const next = clonePreferences(current);
      if (scope === 'device') {
        const overrides = { ...next.deviceOverrides };
        const override = ensureDeviceOverride(overrides, deviceId, deviceLabel, next);
        override.appearance = { ...(override.appearance ?? {}), ...updates };
        override.updatedAt = new Date().toISOString();
        overrides[deviceId] = override;
        next.deviceOverrides = overrides;
      } else {
        next.appearance = { ...next.appearance, ...updates };
      }
      next.updatedAt = new Date().toISOString();
      return next;
    });
  };

  const updateLayout = async (
    updates: Partial<LayoutPreferences>,
    options: { scope?: PreferenceScope } = {},
  ) => {
    const scope = options.scope ?? 'global';
    await mutation.mutateAsync((current) => {
      const next = clonePreferences(current);
      if (scope === 'device') {
        const overrides = { ...next.deviceOverrides };
        const override = ensureDeviceOverride(overrides, deviceId, deviceLabel, next);
        override.layout = { ...(override.layout ?? {}), ...updates };
        override.updatedAt = new Date().toISOString();
        overrides[deviceId] = override;
        next.deviceOverrides = overrides;
      } else {
        next.layout = { ...next.layout, ...updates };
      }
      next.updatedAt = new Date().toISOString();
      return next;
    });
  };

  const updateWidgets = async (
    updates: Partial<WidgetPreferences>,
    options: { scope?: PreferenceScope } = {},
  ) => {
    const scope = options.scope ?? 'global';
    await mutation.mutateAsync((current) => {
      const next = clonePreferences(current);
      if (scope === 'device') {
        const overrides = { ...next.deviceOverrides };
        const override = ensureDeviceOverride(overrides, deviceId, deviceLabel, next);
        override.widgets = { ...(override.widgets ?? {}), ...cloneWidgetUpdates(updates) };
        override.updatedAt = new Date().toISOString();
        overrides[deviceId] = override;
        next.deviceOverrides = overrides;
      } else {
        next.widgets = { ...next.widgets, ...cloneWidgetUpdates(updates) };
      }
      next.updatedAt = new Date().toISOString();
      return next;
    });
  };

  const updateNotifications = async (updates: Partial<NotificationPreferences>) => {
    await mutation.mutateAsync((current) => {
      const next = clonePreferences(current);
      next.notifications = { ...next.notifications, ...updates };
      next.updatedAt = new Date().toISOString();
      return next;
    });
  };

  const toggleDeviceOverride = async (enabled: boolean) => {
    await mutation.mutateAsync((current) => {
      const next = clonePreferences(current);
      const overrides = { ...next.deviceOverrides };
      if (enabled) {
        if (!overrides[deviceId]) {
          overrides[deviceId] = {
            label: deviceLabel,
            appearance: { ...next.appearance },
            layout: { ...next.layout },
            widgets: { ...next.widgets },
            updatedAt: new Date().toISOString(),
          };
        }
      } else {
        delete overrides[deviceId];
      }
      next.deviceOverrides = overrides;
      next.updatedAt = new Date().toISOString();
      return next;
    });
  };

  const applyPreset = async (presetId: string) => {
    await mutation.mutateAsync((current) => {
      const preset = findPreset(presetId, current);
      if (!preset) {
        return current;
      }
      const next = clonePreferences(current);
      if (preset.config.appearance) {
        next.appearance = { ...next.appearance, ...preset.config.appearance };
      }
      if (preset.config.notifications) {
        next.notifications = { ...next.notifications, ...preset.config.notifications };
      }
      if (preset.config.layout) {
        next.layout = { ...next.layout, ...preset.config.layout };
      }
      if (preset.config.widgets) {
        next.widgets = { ...next.widgets, ...cloneWidgetUpdates(preset.config.widgets) };
      }
      next.metadata = { ...next.metadata, activePresetId: preset.id, lastPresetAt: new Date().toISOString() };
      next.updatedAt = new Date().toISOString();
      return next;
    });
  };

  const resetPreferences = async () => {
    await mutation.mutateAsync(() => createDefaultState(resolvedUser.storageMode));
  };

  return {
    userId: resolvedUser.userId,
    deviceId,
    deviceLabel,
    preferences,
    effectiveAppearance,
    effectiveLayout,
    effectiveWidgets,
    deviceOverrideEnabled,
    availablePresets,
    activePresetId,
    notifications: preferences.notifications,
    isLoading: query.isLoading || resolvedUser.status === 'loading',
    isSaving: mutation.isPending,
    error: query.error ? (query.error as Error).message : null,
    saveError: mutation.error?.message ?? null,
    authError: resolvedUser.error,
    updateAppearance,
    updateNotifications,
    updateLayout,
    updateWidgets,
    toggleDeviceOverride,
    applyPreset,
    resetPreferences,
  };
}

export function applyAppearanceToDocument(appearance: AppearancePreferences) {
  if (typeof document === 'undefined') {
    return;
  }
  const root = document.documentElement;
  root.dataset.orbTheme = appearance.theme;
  root.dataset.orbDensity = appearance.density;
  root.dataset.orbRadius = appearance.cornerRadius;
}

function useResolvedUser(explicitUserId?: string) {
  const supabaseConfigured = isSupabaseConfigured();
  const [state, setState] = useState<{
    userId: string | null;
    userKey: string;
    storageMode: StorageProvider;
    status: 'loading' | 'ready' | 'error';
    error: string | null;
  }>(() => {
    if (explicitUserId) {
      return {
        userId: explicitUserId,
        userKey: explicitUserId,
        storageMode: supabaseConfigured ? 'supabase' : 'local',
        status: 'ready',
        error: null,
      };
    }
    if (!supabaseConfigured) {
      return {
        userId: LOCAL_USER_KEY,
        userKey: LOCAL_USER_KEY,
        storageMode: 'local',
        status: 'ready',
        error: null,
      };
    }
    return {
      userId: null,
      userKey: LOCAL_USER_KEY,
      storageMode: 'supabase',
      status: 'loading',
      error: null,
    };
  });

  useEffect(() => {
    if (explicitUserId || !supabaseConfigured) {
      return;
    }
    const supabase = getSupabaseClient();
    let cancelled = false;

    async function resolveUser() {
      setState((prev) => ({ ...prev, status: 'loading', error: null }));
      const { data, error } = await supabase.auth.getUser();
      if (cancelled) return;
      if (error) {
        setState({
          userId: null,
          userKey: LOCAL_USER_KEY,
          storageMode: 'local',
          status: 'error',
          error: error.message,
        });
        return;
      }
      if (!data.user) {
        setState({
          userId: LOCAL_USER_KEY,
          userKey: LOCAL_USER_KEY,
          storageMode: 'local',
          status: 'ready',
          error: null,
        });
        return;
      }
      setState({
        userId: data.user.id,
        userKey: data.user.id,
        storageMode: 'supabase',
        status: 'ready',
        error: null,
      });
    }

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      if (cancelled) return;
      if (session?.user) {
        setState({
          userId: session.user.id,
          userKey: session.user.id,
          storageMode: 'supabase',
          status: 'ready',
          error: null,
        });
      } else {
        setState({
          userId: LOCAL_USER_KEY,
          userKey: LOCAL_USER_KEY,
          storageMode: 'local',
          status: 'ready',
          error: null,
        });
      }
    });

    resolveUser();

    return () => {
      cancelled = true;
      subscription?.subscription.unsubscribe();
    };
  }, [explicitUserId, supabaseConfigured]);

  return state;
}

async function loadPreferences(params: {
  userId: string | null;
  userKey: string;
  storageMode: StorageProvider;
}): Promise<UserPreferencesState> {
  const local = readLocalPreferences(params.userKey);
  if (params.storageMode !== 'supabase' || !params.userId) {
    return local ?? createDefaultState('local');
  }

  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('user_preferences')
      .select(
        'appearance, notifications, layout, widgets, presets, device_overrides, metadata, updated_at',
      )
      .eq('user_id', params.userId)
      .maybeSingle();

    if (error) {
      throw new Error(error.message);
    }

    if (!data) {
      const seed = createDefaultState('supabase');
      await supabase.from('user_preferences').upsert({
        user_id: params.userId,
        appearance: seed.appearance,
        notifications: seed.notifications,
        layout: seed.layout,
        widgets: seed.widgets,
        presets: seed.presets,
        device_overrides: seed.deviceOverrides,
        metadata: seed.metadata,
      });
      writeLocalPreferences(params.userKey, seed);
      return seed;
    }

    const hydrated = hydrateRow(data, 'supabase');
    writeLocalPreferences(params.userKey, hydrated);
    return hydrated;
  } catch (err) {
    console.error('[useUserPreferences] Failed to load Supabase preferences', err);
    if (local) {
      return local;
    }
    throw err instanceof Error ? err : new Error('Unknown preferences error');
  }
}

async function persistPreferences(params: {
  userId: string | null;
  userKey: string;
  storageMode: StorageProvider;
  snapshot: UserPreferencesState;
}): Promise<UserPreferencesState> {
  if (params.storageMode !== 'supabase' || !params.userId) {
    return writeLocalPreferences(params.userKey, { ...params.snapshot, storageProvider: 'local' });
  }

  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('user_preferences')
    .upsert(
      {
        user_id: params.userId,
        appearance: params.snapshot.appearance,
        notifications: params.snapshot.notifications,
        layout: params.snapshot.layout,
        widgets: params.snapshot.widgets,
        presets: params.snapshot.presets,
        device_overrides: params.snapshot.deviceOverrides,
        metadata: params.snapshot.metadata,
      },
      { onConflict: 'user_id' },
    )
    .select(
      'appearance, notifications, layout, widgets, presets, device_overrides, metadata, updated_at',
    )
    .single();

  if (error) {
    throw new Error(error.message);
  }

  const hydrated = hydrateRow(data, 'supabase');
  writeLocalPreferences(params.userKey, hydrated);
  return hydrated;
}

function hydrateRow(row: UserPreferenceRow, storageProvider: StorageProvider): UserPreferencesState {
  return {
    appearance: normalizeAppearance(row.appearance),
    notifications: normalizeNotifications(row.notifications),
    layout: normalizeLayout(row.layout),
    widgets: normalizeWidgets(row.widgets),
    presets: normalizePresets(row.presets),
    deviceOverrides: normalizeDeviceOverrides(row.device_overrides),
    metadata: normalizeMetadata(row.metadata),
    updatedAt: row.updated_at ?? undefined,
    storageProvider,
  };
}

function createDefaultState(storageProvider: StorageProvider): UserPreferencesState {
  return {
    appearance: { ...DEFAULT_APPEARANCE },
    notifications: { ...DEFAULT_NOTIFICATIONS },
    layout: { ...DEFAULT_LAYOUT },
    widgets: {
      pinned: [...DEFAULT_WIDGETS.pinned],
      quickLaunch: [...DEFAULT_WIDGETS.quickLaunch],
      showWeather: DEFAULT_WIDGETS.showWeather,
    },
    presets: [],
    deviceOverrides: {},
    metadata: {},
    storageProvider,
  };
}

function clonePreferences(state: UserPreferencesState): UserPreferencesState {
  return {
    appearance: { ...state.appearance },
    notifications: { ...state.notifications },
    layout: { ...state.layout },
    widgets: {
      pinned: [...state.widgets.pinned],
      quickLaunch: [...state.widgets.quickLaunch],
      showWeather: state.widgets.showWeather,
    },
    presets: state.presets.map((preset) => ({
      ...preset,
      config: {
        appearance: preset.config.appearance ? { ...preset.config.appearance } : undefined,
        notifications: preset.config.notifications ? { ...preset.config.notifications } : undefined,
        layout: preset.config.layout ? { ...preset.config.layout } : undefined,
        widgets: preset.config.widgets ? cloneWidgetUpdates(preset.config.widgets) : undefined,
      },
    })),
    deviceOverrides: Object.fromEntries(
      Object.entries(state.deviceOverrides).map(([key, value]) => [
        key,
        {
          ...value,
          appearance: value.appearance ? { ...value.appearance } : undefined,
          layout: value.layout ? { ...value.layout } : undefined,
          widgets: value.widgets ? cloneWidgetUpdates(value.widgets) : undefined,
          notifications: value.notifications ? { ...value.notifications } : undefined,
        },
      ]),
    ),
    metadata: { ...state.metadata },
    updatedAt: state.updatedAt,
    storageProvider: state.storageProvider,
  };
}

function normalizeAppearance(raw?: Record<string, unknown> | null): AppearancePreferences {
  return {
    theme: (raw?.theme as ThemePreference) || DEFAULT_APPEARANCE.theme,
    density: (raw?.density as DensityPreference) || DEFAULT_APPEARANCE.density,
    cornerRadius: (raw?.cornerRadius as CornerRadiusPreference) || DEFAULT_APPEARANCE.cornerRadius,
  };
}

function normalizeNotifications(raw?: Record<string, unknown> | null): NotificationPreferences {
  return {
    inboxPriorityOnly: typeof raw?.inboxPriorityOnly === 'boolean' ? (raw!.inboxPriorityOnly as boolean) : DEFAULT_NOTIFICATIONS.inboxPriorityOnly,
    inboxDesktopAlerts: typeof raw?.inboxDesktopAlerts === 'boolean' ? (raw!.inboxDesktopAlerts as boolean) : DEFAULT_NOTIFICATIONS.inboxDesktopAlerts,
    missionEscalations:
      raw?.missionEscalations === 'critical'
        ? 'critical'
        : DEFAULT_NOTIFICATIONS.missionEscalations,
    weeklyDigest: typeof raw?.weeklyDigest === 'boolean' ? (raw!.weeklyDigest as boolean) : DEFAULT_NOTIFICATIONS.weeklyDigest,
  };
}

function normalizeLayout(raw?: Record<string, unknown> | null): LayoutPreferences {
  return {
    panelStyle: raw?.panelStyle === 'stacked' ? 'stacked' : DEFAULT_LAYOUT.panelStyle,
    showTimeline:
      typeof raw?.showTimeline === 'boolean' ? (raw!.showTimeline as boolean) : DEFAULT_LAYOUT.showTimeline,
    showAgentDock:
      typeof raw?.showAgentDock === 'boolean'
        ? (raw!.showAgentDock as boolean)
        : DEFAULT_LAYOUT.showAgentDock,
    focusMode:
      typeof raw?.focusMode === 'boolean' ? (raw!.focusMode as boolean) : DEFAULT_LAYOUT.focusMode,
  };
}

function normalizeWidgets(raw?: Record<string, unknown> | null): WidgetPreferences {
  return {
    pinned: Array.isArray(raw?.pinned) ? [...(raw!.pinned as string[])] : [...DEFAULT_WIDGETS.pinned],
    quickLaunch: Array.isArray(raw?.quickLaunch)
      ? [...(raw!.quickLaunch as string[])]
      : [...DEFAULT_WIDGETS.quickLaunch],
    showWeather:
      typeof raw?.showWeather === 'boolean' ? (raw!.showWeather as boolean) : DEFAULT_WIDGETS.showWeather,
  };
}

function normalizePresets(raw?: Record<string, unknown>[]): PreferencePreset[] {
  if (!Array.isArray(raw)) {
    return [];
  }
  return raw
    .map((entry) => {
      const config = (entry as { config?: Record<string, unknown> }).config ?? {};
      return {
        id: typeof entry.id === 'string' ? entry.id : randomId('preset'),
        label: typeof entry.label === 'string' ? entry.label : 'Preset',
        description: typeof entry.description === 'string' ? entry.description : undefined,
        scope: 'user' as const,
        config: {
          appearance: config.appearance as Partial<AppearancePreferences> | undefined,
          notifications: config.notifications as Partial<NotificationPreferences> | undefined,
          layout: config.layout as Partial<LayoutPreferences> | undefined,
          widgets: config.widgets as Partial<WidgetPreferences> | undefined,
        },
      };
    })
    .filter(Boolean);
}

function normalizeDeviceOverrides(raw?: Record<string, unknown>): Record<string, DeviceOverrideConfig> {
  if (!raw || typeof raw !== 'object') {
    return {};
  }
  return Object.fromEntries(
    Object.entries(raw).map(([deviceId, value]) => {
      if (!value || typeof value !== 'object') {
        return [deviceId, {}];
      }
      const typed = value as Record<string, unknown>;
      return [
        deviceId,
        {
          label: typeof typed.label === 'string' ? typed.label : undefined,
          appearance: typed.appearance as Partial<AppearancePreferences> | undefined,
          layout: typed.layout as Partial<LayoutPreferences> | undefined,
          widgets: typed.widgets as Partial<WidgetPreferences> | undefined,
          notifications: typed.notifications as Partial<NotificationPreferences> | undefined,
          updatedAt: typeof typed.updatedAt === 'string' ? typed.updatedAt : undefined,
        },
      ];
    }),
  );
}

function normalizeMetadata(raw?: Record<string, unknown>): Record<string, unknown> {
  return raw && typeof raw === 'object' ? { ...raw } : {};
}

function writeLocalPreferences(userKey: string, state: UserPreferencesState): UserPreferencesState {
  if (typeof window !== 'undefined') {
    const payload: UserPreferencesState = {
      ...state,
      widgets: {
        pinned: [...state.widgets.pinned],
        quickLaunch: [...state.widgets.quickLaunch],
        showWeather: state.widgets.showWeather,
      },
      updatedAt: state.updatedAt ?? new Date().toISOString(),
      storageProvider: 'local',
    };
    window.localStorage.setItem(localPreferencesKey(userKey), JSON.stringify(payload));
    return payload;
  }
  return state;
}

function readLocalPreferences(userKey: string): UserPreferencesState | null {
  if (typeof window === 'undefined') {
    return null;
  }
  try {
    const raw = window.localStorage.getItem(localPreferencesKey(userKey));
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw) as UserPreferencesState;
    return {
      appearance: normalizeAppearance(parsed.appearance),
      notifications: normalizeNotifications(parsed.notifications),
      layout: normalizeLayout(parsed.layout),
      widgets: normalizeWidgets(parsed.widgets),
      presets: parsed.presets ?? [],
      deviceOverrides: parsed.deviceOverrides ?? {},
      metadata: normalizeMetadata(parsed.metadata),
      updatedAt: parsed.updatedAt,
      storageProvider: 'local',
    };
  } catch (err) {
    console.warn('[useUserPreferences] Failed to read local preferences', err);
    return null;
  }
}

function localPreferencesKey(userKey: string) {
  return `orb:user-preferences:${userKey}`;
}

function mergeAppearance(
  base: AppearancePreferences,
  override?: Partial<AppearancePreferences>,
): AppearancePreferences {
  if (!override) {
    return base;
  }
  return { ...base, ...override };
}

function mergeLayout(base: LayoutPreferences, override?: Partial<LayoutPreferences>): LayoutPreferences {
  if (!override) {
    return base;
  }
  return { ...base, ...override };
}

function mergeWidgets(base: WidgetPreferences, override?: Partial<WidgetPreferences>): WidgetPreferences {
  if (!override) {
    return base;
  }
  return {
    pinned: override.pinned ? [...override.pinned] : [...base.pinned],
    quickLaunch: override.quickLaunch ? [...override.quickLaunch] : [...base.quickLaunch],
    showWeather: override.showWeather ?? base.showWeather,
  };
}

function cloneWidgetUpdates(updates?: Partial<WidgetPreferences>): Partial<WidgetPreferences> {
  if (!updates) {
    return {};
  }
  const clone: Partial<WidgetPreferences> = { ...updates };
  if (updates.pinned) {
    clone.pinned = [...updates.pinned];
  }
  if (updates.quickLaunch) {
    clone.quickLaunch = [...updates.quickLaunch];
  }
  return clone;
}

function ensureDeviceOverride(
  overrides: Record<string, DeviceOverrideConfig>,
  deviceId: string,
  label: string,
  current: UserPreferencesState,
): DeviceOverrideConfig {
  if (overrides[deviceId]) {
    return { ...overrides[deviceId] };
  }
  return {
    label,
    appearance: { ...current.appearance },
    layout: { ...current.layout },
    widgets: {
      pinned: [...current.widgets.pinned],
      quickLaunch: [...current.widgets.quickLaunch],
      showWeather: current.widgets.showWeather,
    },
    updatedAt: new Date().toISOString(),
  };
}

function buildAvailablePresets(userPresets: PreferencePreset[]): PreferencePreset[] {
  const map = new Map<string, PreferencePreset>();
  SYSTEM_PRESETS.forEach((preset) => map.set(preset.id, preset));
  userPresets.forEach((preset) => map.set(preset.id, { ...preset, scope: 'user' }));
  return Array.from(map.values());
}

function findPreset(presetId: string, state: UserPreferencesState): PreferencePreset | undefined {
  const presets = buildAvailablePresets(state.presets);
  return presets.find((preset) => preset.id === presetId);
}

function getStableDeviceId(): string {
  if (typeof window === 'undefined') {
    return 'server';
  }
  const existing = window.localStorage.getItem(DEVICE_STORAGE_KEY);
  if (existing) {
    return existing;
  }
  const nextId = randomId('device');
  window.localStorage.setItem(DEVICE_STORAGE_KEY, nextId);
  return nextId;
}

function inferDeviceLabel(): string {
  if (typeof navigator === 'undefined') {
    return 'Web Client';
  }
  const nav = navigator as Navigator & { userAgentData?: { platform?: string } };
  const platform = nav.userAgentData?.platform ?? nav.platform ?? 'Web';
  return platform;
}

function randomId(prefix: string): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

