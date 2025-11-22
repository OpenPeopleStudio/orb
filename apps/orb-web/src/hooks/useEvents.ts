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

      // Build query parameters
      const params = new URLSearchParams();
      if (filter?.type) {
        const types = Array.isArray(filter.type) ? filter.type : [filter.type];
        params.append('type', types.join(','));
      }
      if (filter?.userId !== undefined) {
        params.append('userId', filter.userId || '');
      }
      if (filter?.sessionId) {
        params.append('sessionId', filter.sessionId);
      }
      if (filter?.mode) {
        params.append('mode', filter.mode);
      }
      if (filter?.role) {
        params.append('role', filter.role);
      }
      if (filter?.dateFrom) {
        params.append('dateFrom', filter.dateFrom);
      }
      if (filter?.dateTo) {
        params.append('dateTo', filter.dateTo);
      }
      if (filter?.limit) {
        params.append('limit', filter.limit.toString());
      }
      if (filter?.search) {
        params.append('search', filter.search);
      }

      // Fetch events and stats in parallel
      const [eventsResponse, statsResponse] = await Promise.all([
        fetch(`/api/events?${params.toString()}`),
        fetch(`/api/events?${params.toString()}&stats=true`),
      ]);

      if (!eventsResponse.ok) {
        throw new Error(`Failed to fetch events: ${eventsResponse.statusText}`);
      }
      if (!statsResponse.ok) {
        throw new Error(`Failed to fetch stats: ${statsResponse.statusText}`);
      }

      const eventsData = await eventsResponse.json();
      const statsData = await statsResponse.json();

      setEvents(eventsData.events || []);
      setStats(statsData.stats || null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch events');
      // Set empty data on error
      setEvents([]);
      setStats(null);
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

