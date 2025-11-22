/**
 * useEvents Hook
 * 
 * React hook for querying and displaying events from the event bus.
 * Note: This is a client-side hook that will need a backend API
 * to actually query events in production.
 */

import { useState, useEffect } from 'react';
import type { OrbEvent, EventFilter, EventStats } from '@orb-system/core-orb';

export interface UseEventsOptions {
  filter?: EventFilter;
  autoRefresh?: boolean;
  refreshInterval?: number; // milliseconds
}

export interface UseEventsResult {
  events: OrbEvent[];
  stats: EventStats | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

/**
 * Hook to query events from the event bus
 * 
 * TODO: In production, this should call a backend API endpoint
 * that queries the event bus. For now, this is a placeholder.
 */
export function useEvents(options: UseEventsOptions = {}): UseEventsResult {
  const { filter, autoRefresh = false, refreshInterval = 5000 } = options;
  const [events, setEvents] = useState<OrbEvent[]>([]);
  const [stats, setStats] = useState<EventStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError(null);

      // TODO: Replace with actual API call
      // For now, we'll use a mock implementation
      // In production: const response = await fetch('/api/events', { ... });
      
      // Mock implementation - in real app, this would call backend
      const mockEvents: OrbEvent[] = [];
      const mockStats: EventStats = {
        totalEvents: 0,
        byType: {} as any,
        byMode: {},
        byRole: {} as any,
        mostUsedModes: [],
        errorRate: 0,
      };

      setEvents(mockEvents);
      setStats(mockStats);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch events');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();

    if (autoRefresh) {
      const interval = setInterval(fetchEvents, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [filter, autoRefresh, refreshInterval]);

  return {
    events,
    stats,
    loading,
    error,
    refresh: fetchEvents,
  };
}

