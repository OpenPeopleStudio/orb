/**
 * Supabase Event Sink
 *
 * Role: Event persistence
 *
 * Supabase-based event sink that stores events in a database.
 * Provides long-term storage and querying capabilities.
 */
import { OrbEventType } from '../types';
import { getSupabaseClient, isSupabaseConfigured } from '../../supabase';
/**
 * Supabase Event Sink
 *
 * Stores events in Supabase `orb_events` table.
 * Requires Supabase to be configured.
 */
export class SupabaseEventSink {
    constructor() {
        if (!isSupabaseConfigured()) {
            throw new Error('Supabase not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables.');
        }
        this.supabase = getSupabaseClient();
    }
    /**
     * Emit an event to Supabase
     */
    async emit(event) {
        try {
            const { error } = await this.supabase
                .from('orb_events')
                .insert({
                id: event.id,
                type: event.type,
                timestamp: event.timestamp,
                user_id: event.userId,
                session_id: event.sessionId,
                device_id: event.deviceId,
                mode: event.mode,
                persona: event.persona,
                role: event.role,
                payload: event.payload,
                metadata: event.metadata || {},
            });
            if (error) {
                console.error('[SupabaseEventSink] Failed to emit event:', error);
                throw error;
            }
        }
        catch (error) {
            console.error('[SupabaseEventSink] Error emitting event:', error);
            throw error;
        }
    }
    /**
     * Query events from Supabase
     */
    async query(filter) {
        try {
            let query = this.supabase
                .from('orb_events')
                .select('*')
                .order('timestamp', { ascending: false });
            // Apply filters
            if (filter.type) {
                const types = Array.isArray(filter.type) ? filter.type : [filter.type];
                query = query.in('type', types);
            }
            if (filter.userId !== undefined) {
                query = query.eq('user_id', filter.userId);
            }
            if (filter.sessionId) {
                query = query.eq('session_id', filter.sessionId);
            }
            if (filter.deviceId) {
                query = query.eq('device_id', filter.deviceId);
            }
            if (filter.mode) {
                query = query.eq('mode', filter.mode);
            }
            if (filter.role) {
                query = query.eq('role', filter.role);
            }
            if (filter.dateFrom) {
                query = query.gte('timestamp', filter.dateFrom);
            }
            if (filter.dateTo) {
                query = query.lte('timestamp', filter.dateTo);
            }
            if (filter.limit) {
                query = query.limit(filter.limit);
            }
            const { data, error } = await query;
            if (error) {
                console.error('[SupabaseEventSink] Failed to query events:', error);
                throw error;
            }
            // Map database rows to OrbEvent
            return (data || []).map((row) => ({
                id: row.id,
                type: row.type,
                timestamp: row.timestamp,
                userId: row.user_id,
                sessionId: row.session_id,
                deviceId: row.device_id,
                mode: row.mode,
                persona: row.persona,
                role: row.role,
                payload: row.payload || {},
                metadata: row.metadata || {},
            }));
        }
        catch (error) {
            console.error('[SupabaseEventSink] Error querying events:', error);
            return [];
        }
    }
    /**
     * Get event statistics from Supabase
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
//# sourceMappingURL=supabaseEventSink.js.map