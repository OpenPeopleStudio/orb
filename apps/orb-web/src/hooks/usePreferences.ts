import { useCallback, useEffect, useState } from 'react';

export interface ConstraintDisplay {
  id: string;
  label: string;
  severity: string;
  description?: string;
}

export interface ConstraintSetDisplay {
  id: string;
  label: string;
  scope: string;
  constraintCount: number;
  constraints: ConstraintDisplay[];
}

export interface PreferencesData {
  userId: string;
  mode: string;
  persona: {
    id: string;
    confidence: number;
    reason: string;
    source: string;
    override?: string | null;
  };
  preferences: string[];
  constraints: ConstraintSetDisplay[];
}

interface UsePreferencesResult {
  data: PreferencesData | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  updatePersonaOverride: (personaId: string | null) => Promise<void>;
}

export function usePreferences(userId = 'demo-user'): UsePreferencesResult {
  const [data, setData] = useState<PreferencesData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPreferences = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/preferences?userId=${encodeURIComponent(userId)}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch preferences (${response.status})`);
      }
      const payload = await response.json();
      setData(payload.preferences);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const updatePersonaOverride = useCallback(
    async (personaId: string | null) => {
      try {
        setLoading(true);
        const response = await fetch('/api/preferences', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId,
            personaOverride: personaId,
          }),
        });
        if (!response.ok) {
          throw new Error(`Failed to update preferences (${response.status})`);
        }
        const payload = await response.json();
        setData(payload.preferences);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to update preferences');
      } finally {
        setLoading(false);
      }
    },
    [userId],
  );

  useEffect(() => {
    fetchPreferences();
  }, [fetchPreferences]);

  return {
    data,
    loading,
    error,
    refresh: fetchPreferences,
    updatePersonaOverride,
  };
}


