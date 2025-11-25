/**
 * Event Bus
 *
 * Role: Core event system
 *
 * Central event bus for Orb system.
 * Collects events from all layers and routes to sinks.
 */
import type { OrbEvent, OrbEventSink, EventFilter, EventStats } from './types';
/**
 * Orb Event Bus
 *
 * Central event bus that collects events and routes them to sinks.
 */
export declare class OrbEventBus {
    private store;
    private sinks;
    constructor();
    /**
     * Register an event sink
     */
    addSink(sink: OrbEventSink): void;
    /**
     * Remove an event sink
     */
    removeSink(sink: OrbEventSink): void;
    /**
     * Emit an event
     */
    emit(event: OrbEvent): Promise<void>;
    /**
     * Query events
     */
    query(filter: EventFilter): Promise<OrbEvent[]>;
    /**
     * Get event statistics
     */
    getStats(filter?: EventFilter): Promise<EventStats>;
    /**
     * Clear all events (for testing)
     */
    clear(): void;
}
/**
 * Get the global event bus instance
 */
export declare function getEventBus(): OrbEventBus;
/**
 * Reset the global event bus (for testing)
 */
export declare function resetEventBus(): void;
//# sourceMappingURL=bus.d.ts.map