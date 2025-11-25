/**
 * File Event Sink
 *
 * Role: Event persistence
 *
 * File-based event sink that stores events in JSON files.
 * Useful for development and lightweight deployments.
 */
import type { OrbEvent, EventFilter, EventStats } from '../types';
import type { OrbEventSink } from '../types';
/**
 * File Event Sink
 *
 * Stores events in JSON files under `.orb-data/events/`
 */
export declare class FileEventSink implements OrbEventSink {
    private eventsPath;
    private maxEventsPerFile;
    constructor(maxEventsPerFile?: number);
    /**
     * Ensure events directory exists
     */
    private ensureDirectory;
    /**
     * Get relative file path for a date
     */
    private getRelativePath;
    /**
     * Emit an event to the file sink
     */
    emit(event: OrbEvent): Promise<void>;
    /**
     * Query events from file sink
     */
    query(filter: EventFilter): Promise<OrbEvent[]>;
    /**
     * Check if event matches filter
     */
    private matchesFilter;
    /**
     * Get event statistics from file sink
     */
    getStats(filter?: EventFilter): Promise<EventStats>;
}
//# sourceMappingURL=fileEventSink.d.ts.map