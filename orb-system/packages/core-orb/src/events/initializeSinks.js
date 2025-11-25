/**
 * Initialize Event Sinks
 *
 * Helper to automatically register event sinks based on configuration.
 */
import { getEventBus } from './bus';
import { FileEventSink } from './sinks/fileEventSink';
import { SupabaseEventSink } from './sinks/supabaseEventSink';
import { getConfig } from '../config';
import { isSupabaseConfigured } from '../supabase';
/**
 * Initialize event sinks based on configuration
 *
 * Registers appropriate sinks:
 * - File sink: always registered (for local persistence)
 * - Supabase sink: registered if Supabase is configured
 */
export function initializeEventSinks() {
    const eventBus = getEventBus();
    const config = getConfig();
    // Always register file sink for local persistence
    try {
        const fileSink = new FileEventSink();
        eventBus.addSink(fileSink);
        console.log('[EventSinks] Registered file event sink');
    }
    catch (error) {
        console.warn('[EventSinks] Failed to register file sink:', error);
    }
    // Register Supabase sink if configured
    if (isSupabaseConfigured()) {
        try {
            const supabaseSink = new SupabaseEventSink();
            eventBus.addSink(supabaseSink);
            console.log('[EventSinks] Registered Supabase event sink');
        }
        catch (error) {
            console.warn('[EventSinks] Failed to register Supabase sink:', error);
        }
    }
    else {
        console.log('[EventSinks] Supabase not configured, skipping Supabase sink');
    }
}
//# sourceMappingURL=initializeSinks.js.map