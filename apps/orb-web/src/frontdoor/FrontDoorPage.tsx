import type { User } from '@supabase/supabase-js';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { useUserPreferences } from '../hooks/useUserPreferences';
import { getSupabaseClient, isSupabaseConfigured } from '../lib/supabase/client';

import DimensionalWindow from './DimensionalWindow';
import FrontDoorLogin from './FrontDoorLogin';
import FrontDoorWelcome from './FrontDoorWelcome';
import OrbPresence from './OrbPresence';
import SpaceBackground from './SpaceBackground';
import { useOrbPresenceStream } from './useOrbPresenceStream';

const FrontDoorPage = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(isSupabaseConfigured());
  const [error, setError] = useState<string | null>(null);
  const supabaseEnabled = isSupabaseConfigured();
  const preferencesResult = useUserPreferences(user?.id ?? 'demo-user');
  const starfield = useMemo(
    () => deriveStarfield(preferencesResult.preferences.metadata, user?.id ?? 'demo-user'),
    [preferencesResult.preferences.metadata, user?.id]
  );
  const displayName = user?.user_metadata?.full_name ?? user?.email ?? 'traveler';
  const presenceStatus = loading ? 'syncing' : user ? 'ready' : 'listening';
  const persona = user ? 'Sol' : 'Luna';
  const { text: streamedText, isStreaming } = useOrbPresenceStream({
    persona,
    displayName,
    seed: user?.id ?? 'demo-user',
    enabled: !loading,
  });

  const refreshSession = useCallback(async () => {
    if (!supabaseEnabled) {
      setLoading(false);
      setUser(null);
      return;
    }
    try {
      setLoading(true);
      const supabase = getSupabaseClient();
      const { data, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) {
        throw sessionError;
      }
      setUser(data.session?.user ?? null);
      setError(null);
    } catch (sessionErr) {
      const message = sessionErr instanceof Error ? sessionErr.message : 'Failed to fetch session';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [supabaseEnabled]);

  useEffect(() => {
    refreshSession();

    if (!supabaseEnabled) {
      return;
    }

    const supabase = getSupabaseClient();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setError(null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [refreshSession, supabaseEnabled]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-black text-white">
      <SpaceBackground
        starCount={starfield.density}
        shootingStarCount={starfield.shootingStars}
        starHue={starfield.hue}
        starSaturation={starfield.saturation}
        starLightness={starfield.lightness}
        auroraAlpha={starfield.auroraAlpha}
      />
      <div className="relative z-10 flex min-h-screen items-center justify-center px-6 py-16">
        <DimensionalWindow
          title={user ? 'Gateway unlocked' : 'Orb dimensional front door'}
          subtitle={
            user
              ? 'Your neural web awaits. Confirm your intent to enter.'
              : 'The shell listens for your cadence before opening.'
          }
          size="wide"
        >
          <div className="space-y-10">
            <OrbPresence
              persona={persona}
              status={presenceStatus}
              message={
                user
                  ? `Signal steady, ${displayName}. Orb is ready when you are.`
                  : 'Listening for your cadence — approach and the shell will align.'
              }
              signatureHue={starfield.hue}
              streamText={streamedText}
              isStreaming={isStreaming}
            />
            {loading ? (
              <div className="flex flex-col items-center gap-4 text-white/70">
                <div className="h-12 w-12 animate-spin rounded-full border-2 border-white/20 border-t-white/70" />
                <p>Syncing with Supabase…</p>
              </div>
            ) : user ? (
              <FrontDoorWelcome user={user} onSignOut={refreshSession} />
            ) : (
              <>
                {error ? <p className="text-sm text-rose-300">{error}</p> : null}
                <FrontDoorLogin onSuccess={refreshSession} />
              </>
            )}
          </div>
        </DimensionalWindow>
      </div>
    </div>
  );
};

export default FrontDoorPage;

function deriveStarfield(
  metadata: Record<string, unknown>,
  seed: string
): {
  hue: number;
  saturation: number;
  lightness: number;
  density: number;
  shootingStars: number;
  auroraAlpha: number;
} {
  const starfieldMeta = (metadata?.starfield as Record<string, unknown> | undefined) ?? undefined;
  const signatureHue = asNumber(metadata?.signatureHue);

  const hue =
    clampNumber(
      asNumber(starfieldMeta?.hue) ?? signatureHue ?? seededRange(seed, 180, 320),
      0,
      360
    ) ?? 210;
  const saturation =
    clampNumber(asNumber(starfieldMeta?.saturation), 30, 95) ?? seededRange(seed, 45, 75);
  const lightness =
    clampNumber(asNumber(starfieldMeta?.lightness), 65, 92) ?? seededRange(seed, 72, 88);
  const density =
    Math.round(
      clampNumber(asNumber(starfieldMeta?.density), 90, 220) ?? seededRange(seed, 120, 190)
    ) ?? 140;
  const shootingStars =
    Math.round(
      clampNumber(asNumber(starfieldMeta?.shootingStarCount), 1, 4) ?? seededRange(seed, 1.2, 3.4)
    ) || 2;
  const auroraAlpha =
    clampNumber(asNumber(starfieldMeta?.auroraAlpha), 0.12, 0.45) ?? seededRange(seed, 0.2, 0.35);

  return {
    hue,
    saturation,
    lightness,
    density,
    shootingStars,
    auroraAlpha,
  };
}

function asNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function clampNumber(value: number | null | undefined, min: number, max: number): number | null {
  if (value === null || value === undefined) {
    return null;
  }
  return Math.min(Math.max(value, min), max);
}

function seededRange(seed: string, min: number, max: number): number {
  const normalized = simpleHash(seed) / 997;
  return min + normalized * (max - min);
}

function simpleHash(input: string): number {
  const base = input || 'orb';
  return base
    .split('')
    .reduce((acc, char) => (acc * 31 + char.charCodeAt(0)) % 997, 0);
}

