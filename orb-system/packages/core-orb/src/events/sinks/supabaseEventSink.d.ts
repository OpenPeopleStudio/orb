/**
 * Supabase Event Sink
 *
 * Role: Event persistence
 *
 * Supabase-based event sink that stores events in a database.
 * Provides long-term storage and querying capabilities.
 */
import type { OrbEvent, EventFilter, EventStats } from '../types';
import type { OrbEventSink } from '../types';
/**
 * Supabase Event Sink
 *
 * Stores events in Supabase `orb_events` table.
 * Requires Supabase to be configured.
 */
export declare class SupabaseEventSink implements OrbEventSink {
    private supabase;
    constructor();
    /**
     * Emit an event to Supabase
     */
    emit(event: OrbEvent): Promise<void>;
    /**
     * Query events from Supabase
     */
    query(filter: EventFilter): Promise<OrbEvent[]>;
    /**
     * Get event statistics from Supabase
     */
    getStats(filter?: EventFilter): Promise<EventStats>;
}
//# sourceMappingURL=supabaseEventSink.d.ts.map