# Orb Web – Settings Customization Slice

## Data Model

- Table: `user_preferences` (Supabase/Postgres)
  - `user_id TEXT PRIMARY KEY` – one row per authenticated user.
  - `appearance JSONB` – theme, density, radius tokens.
  - `notifications JSONB` – inbox/mission alert switches.
  - `layout JSONB` – panel style, focus mode, dock visibility, etc.
  - `widgets JSONB` – pinned widgets + quick launch actions.
  - `presets JSONB` – user-defined bundles (array of `{ id, label, config }`).
  - `device_overrides JSONB` – map of device ids → partial overrides.
  - `metadata JSONB` – misc bookkeeping (active preset id, timestamps).
  - `created_at / updated_at TIMESTAMPTZ` – managed automatically with a trigger.
- RLS now keys off Supabase auth: `auth.uid()` must equal `user_id` for all reads/writes so every tenant only touches their own row.
- Migrations:
  - `supabase/migrations/20251124000000_user_preferences.sql` – base table + trigger.
  - `supabase/migrations/20251124020000_user_preferences_extensions.sql` – notification/layout/widget/device columns + consolidated RLS policy.

## Hook & Client Utilities

- `useUserPreferences` (`apps/orb-web/src/hooks/useUserPreferences.ts`)
  - Resolves the current Supabase user (`auth.getUser`) and falls back to a local-only storage key when not authenticated or when Supabase isn’t configured.
  - Loads/persists appearance, notifications, layout, widgets, presets, and device overrides via React Query + Supabase `upsert`, mirroring the latest snapshot to `localStorage` per user for offline continuity.
  - Exposes rich helpers: `updateAppearance`, `updateLayout`, `updateWidgets`, `updateNotifications`, `applyPreset`, `toggleDeviceOverride`, plus resolved metadata like `effectiveAppearance`, `availablePresets`, `deviceId`, and `storageProvider`.
  - `applyAppearanceToDocument` receives the **effective** appearance (global + device override) and updates `<html>` `data-orb-*` attributes so CSS variables react instantly.
- `App.tsx` merely calls the hook to keep the global theme/density synchronized; all other consumers (e.g., Settings) can use the same source of truth.

## UI Flow

- The `Settings → Customization` screen now includes:
  - Theme/density/radius controls with scope switching (global vs. per-device override).
  - System + user presets, including Deep Focus, Command Deck, and Neural Glass bundles.
  - Notification toggles (priority inbox, desktop alerts, mission escalation level, weekly digest).
  - Layout controls (panel style, agent dock, timeline, focus mode).
  - Widget management (pinned cards, quick-launch actions, ambient weather).
  - Device insights showing override status, device label, and id.
- Every interaction calls the appropriate hook helper, which:
  1. Updates the Supabase row (or local fallback if offline/unauthenticated),
  2. Writes the cached snapshot to `localStorage`,
  3. Invalidates React Query so any subscriber sees the same state.
- Device overrides layer on top of global state; the hook merges overrides before exposing `effectiveAppearance`, `effectiveLayout`, and `effectiveWidgets`.

## Adding New Preference Types

1. **Expand the shape**
   - Extend the relevant interface (`NotificationPreferences`, `LayoutPreferences`, etc.) or add a new JSONB-backed group.
   - Update the default constants + `normalize*` helpers in `useUserPreferences`.
2. **Persist schema**
   - For existing JSON columns, no migration needed—just store the new property.
   - For a brand new category, add a JSONB column via migration and extend `UserPreferenceRow`, metadata, and the upsert payload.
3. **Bind to UI + hook helpers**
   - Expose a typed helper (`updateFoo`) in the hook that handles scoping (global/device) and deep merges.
   - Surface controls inside the Customization tab (or another settings surface) that call the helper.
4. **Apply behavior**
   - Consume the hook (or derived helpers like `effectiveLayout`) wherever the preference matters—CSS tokens, contexts, panel ordering, etc.

This keeps the system vertical: each new preference requires (1) schema/types, (2) hook normalization + update helper, (3) a UI control, and (4) a consumer that reads the same centralized snapshot. Presets/device overrides continue to work automatically because they piggyback on the shared shape.

