/**
 * Event Bus
 *
 * Role: Core event system
 *
 * Central event bus for Orb system.
 * Collects events from all layers and routes to sinks.
 */
import { OrbEventType } from './types';
/**
 * In-memory event store
 */
class InMemoryEventStore {
    constructor() {
        this.events = [];
    }
    add(event) {
        this.events.push(event);
        // Keep only last 10,000 events in memory
        if (this.events.length > 10000) {
            this.events = this.events.slice(-10000);
        }
    }
    query(filter) {
        let results = [...this.events];
        if (filter.type) {
            const types = Array.isArray(filter.type) ? filter.type : [filter.type];
            results = results.filter((e) => types.includes(e.type));
        }
        if (filter.userId !== undefined) {
            results = results.filter((e) => e.userId === filter.userId);
        }
        if (filter.sessionId) {
            results = results.filter((e) => e.sessionId === filter.sessionId);
        }
        if (filter.deviceId) {
            results = results.filter((e) => e.deviceId === filter.deviceId);
        }
        if (filter.mode) {
            results = results.filter((e) => e.mode === filter.mode);
        }
        if (filter.role) {
            results = results.filter((e) => e.role === filter.role);
        }
        if (filter.dateFrom) {
            const from = new Date(filter.dateFrom);
            results = results.filter((e) => new Date(e.timestamp) >= from);
        }
        if (filter.dateTo) {
            const to = new Date(filter.dateTo);
            results = results.filter((e) => new Date(e.timestamp) <= to);
        }
        if (filter.search) {
            const searchLower = filter.search.toLowerCase();
            results = results.filter((e) => {
                // Search in payload JSON string representation
                const payloadStr = JSON.stringify(e.payload).toLowerCase();
                // Also search in metadata if present
                const metadataStr = e.metadata ? JSON.stringify(e.metadata).toLowerCase() : '';
                // Search in event type and other string fields
                const typeStr = e.type.toLowerCase();
                return payloadStr.includes(searchLower) ||
                    metadataStr.includes(searchLower) ||
                    typeStr.includes(searchLower);
            });
        }
        // Sort by timestamp descending
        results.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        if (filter.limit) {
            results = results.slice(0, filter.limit);
        }
        return results;
    }
    getStats(filter) {
        const events = filter ? this.query(filter) : this.events;
        const byType = {};
        const byMode = {};
        const byRole = {};
        let errorCount = 0;
        let totalScore = 0;
        let scoreCount = 0;
        for (const event of events) {
            byType[event.type] = (byType[event.type] || 0) + 1;
            if (event.mode) {
                byMode[event.mode] = (byMode[event.mode] || 0) + 1;
            }
            if (event.role) {
                byRole[event.role] = (byRole[event.role] || 0) + 1;
            }
            if (event.type === OrbEventType.ERROR) {
                errorCount++;
            }
            if (event.type === OrbEventType.TE_EVALUATION && typeof event.payload.score === 'number') {
                totalScore += event.payload.score;
                scoreCount++;
            }
        }
        const mostUsedModes = Object.entries(byMode)
            .map(([mode, count]) => ({ mode, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 10);
        return {
            totalEvents: events.length,
            byType: byType,
            byMode,
            byRole: byRole,
            mostUsedModes,
            errorRate: events.length > 0 ? errorCount / events.length : 0,
            averageScore: scoreCount > 0 ? totalScore / scoreCount : undefined,
        };
    }
    clear() {
        this.events = [];
    }
}
/**
 * Orb Event Bus
 *
 * Central event bus that collects events and routes them to sinks.
 */
export class OrbEventBus {
    constructor() {
        this.store = new InMemoryEventStore();
        this.sinks = [];
    }
    /**
     * Register an event sink
     */
    addSink(sink) {
        this.sinks.push(sink);
    }
    /**
     * Remove an event sink
     */
    removeSink(sink) {
        this.sinks = this.sinks.filter((s) => s !== sink);
    }
    /**
     * Emit an event
     */
    async emit(event) {
        // Store in memory
        this.store.add(event);
        // Route to all sinks
        await Promise.all(this.sinks.map((sink) => sink.emit(event).catch((err) => {
            console.error('[OrbEventBus] Sink error:', err);
        })));
    }
    /**
     * Query events
     */
    async query(filter) {
        return this.store.query(filter);
    }
    /**
     * Get event statistics
     */
    async getStats(filter) {
        return this.store.getStats(filter);
    }
    /**
     * Clear all events (for testing)
     */
    clear() {
        this.store.clear();
    }
}
// Global event bus instance
let globalEventBus = null;
/**
 * Get the global event bus instance
 */
export function getEventBus() {
    if (!globalEventBus) {
        globalEventBus = new OrbEventBus();
    }
    return globalEventBus;
}
/**
 * Reset the global event bus (for testing)
 */
export function resetEventBus() {
    globalEventBus = null;
}
//# sourceMappingURL=bus.js.map