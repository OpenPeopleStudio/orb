/**
 * Events API Handler
 * 
 * Server-side API handler for querying events from the event bus.
 * This runs in Node.js context and can access the event bus directly.
 */

import type { EventFilter, EventStats } from '../shims/core-orb';
import { getEventBus, initializeEventSinks } from '../shims/core-orb';

// Ensure event sinks are initialized
let sinksInitialized = false;
function ensureSinksInitialized() {
  if (!sinksInitialized) {
    try {
      initializeEventSinks();
      sinksInitialized = true;
    } catch (error) {
      console.error('[Events API] Failed to initialize event sinks:', error);
      // Continue anyway - in-memory store will still work
    }
  }
}

/**
 * Query events from the event bus
 */
export async function queryEvents(filter?: EventFilter) {
  try {
    ensureSinksInitialized();
    const eventBus = getEventBus();
    return await eventBus.query(filter || {});
  } catch (error) {
    console.error('[Events API] Error querying events:', error);
    return [];
  }
}

/**
 * Get event statistics from the event bus
 */
export async function getEventStats(filter?: EventFilter): Promise<EventStats> {
  try {
    ensureSinksInitialized();
    const eventBus = getEventBus();
    return await eventBus.getStats(filter);
  } catch (error) {
    console.error('[Events API] Error getting event stats:', error);
    // Return empty stats on error
    return {
      totalEvents: 0,
      byType: {} as Record<string, number>,
      byMode: {},
      byRole: {} as Record<string, number>,
      mostUsedModes: [],
      errorRate: 0,
    };
  }
}

