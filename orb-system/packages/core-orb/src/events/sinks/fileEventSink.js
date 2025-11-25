/**
 * File Event Sink
 *
 * Role: Event persistence
 *
 * File-based event sink that stores events in JSON files.
 * Useful for development and lightweight deployments.
 */
import { OrbEventType } from '../types';
import { readJson, writeJson, getDataDirectory } from '../../fileStore';
import path from 'node:path';
import { promises as fs } from 'node:fs';
/**
 * File Event Sink
 *
 * Stores events in JSON files under `.orb-data/events/`
 */
export class FileEventSink {
    constructor(maxEventsPerFile = 1000) {
        this.maxEventsPerFile = 1000;
        this.maxEventsPerFile = maxEventsPerFile;
        const dataDir = getDataDirectory();
        this.eventsPath = path.join(dataDir, 'events');
    }
    /**
     * Ensure events directory exists
     */
    async ensureDirectory() {
        try {
            await fs.mkdir(this.eventsPath, { recursive: true });
        }
        catch (error) {
            // Directory might already exist, ignore
        }
    }
    /**
     * Get relative file path for a date
     */
    getRelativePath(date) {
        const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD
        return `events/events-${dateStr}.json`;
    }
    /**
     * Emit an event to the file sink
     */
    async emit(event) {
        await this.ensureDirectory();
        const eventDate = new Date(event.timestamp);
        const dateStr = eventDate.toISOString().split('T')[0]; // YYYY-MM-DD
        const relativePath = `events/events-${dateStr}.json`;
        // Read existing events for this date
        const existingEvents = await readJson(relativePath, []);
        // Append new event
        existingEvents.push(event);
        // Keep only last N events per file
        const eventsToKeep = existingEvents.slice(-this.maxEventsPerFile);
        // Write back
        await writeJson(relativePath, eventsToKeep);
    }
    /**
     * Query events from file sink
     */
    async query(filter) {
        await this.ensureDirectory();
        const results = [];
        // Get date range
        const dateFrom = filter.dateFrom ? new Date(filter.dateFrom) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // Default: last 30 days
        const dateTo = filter.dateTo ? new Date(filter.dateTo) : new Date();
        // Iterate through date range
        const currentDate = new Date(dateFrom);
        while (currentDate <= dateTo) {
            const relativePath = this.getRelativePath(currentDate);
            const events = await readJson(relativePath, []);
            // Filter events
            for (const event of events) {
                if (this.matchesFilter(event, filter)) {
                    results.push(event);
                }
            }
            // Move to next day
            currentDate.setDate(currentDate.getDate() + 1);
        }
        // Sort by timestamp descending
        results.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        // Apply limit
        if (filter.limit) {
            return results.slice(0, filter.limit);
        }
        return results;
    }
    /**
     * Check if event matches filter
     */
    matchesFilter(event, filter) {
        if (filter.type) {
            const types = Array.isArray(filter.type) ? filter.type : [filter.type];
            if (!types.includes(event.type)) {
                return false;
            }
        }
        if (filter.userId !== undefined && event.userId !== filter.userId) {
            return false;
        }
        if (filter.sessionId && event.sessionId !== filter.sessionId) {
            return false;
        }
        if (filter.deviceId && event.deviceId !== filter.deviceId) {
            return false;
        }
        if (filter.mode && event.mode !== filter.mode) {
            return false;
        }
        if (filter.role && event.role !== filter.role) {
            return false;
        }
        if (filter.dateFrom && new Date(event.timestamp) < new Date(filter.dateFrom)) {
            return false;
        }
        if (filter.dateTo && new Date(event.timestamp) > new Date(filter.dateTo)) {
            return false;
        }
        return true;
    }
    /**
     * Get event statistics from file sink
     */
    async getStats(filter) {
        const events = await this.query(filter || {});
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
}
//# sourceMappingURL=fileEventSink.js.map