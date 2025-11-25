/**
 * Supabase Client Module
 *
 * Provides Supabase client connection and initialization.
 */
import { getConfig } from './config';
let supabaseClient = null;
/**
 * Get or create the Supabase client instance
 */
export function getSupabaseClient() {
    if (supabaseClient) {
        return supabaseClient;
    }
    const config = getConfig();
    if (!config.supabaseUrl || !config.supabaseServiceRoleKey) {
        throw new Error('Supabase configuration missing. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables.');
    }
    // Lazy import to avoid issues in browser environments
    let createClient;
    try {
        const { createClient: createSupabaseClient } = require('@supabase/supabase-js');
        createClient = createSupabaseClient;
    }
    catch (error) {
        throw new Error('@supabase/supabase-js is required for Supabase. Install it with: npm install @supabase/supabase-js');
    }
    supabaseClient = createClient(config.supabaseUrl, config.supabaseServiceRoleKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    });
    return supabaseClient;
}
/**
 * Check if Supabase is configured
 */
export function isSupabaseConfigured() {
    const config = getConfig();
    return !!(config.supabaseUrl && config.supabaseServiceRoleKey);
}
/**
 * Reset Supabase client (useful for testing)
 */
export function resetSupabaseClient() {
    supabaseClient = null;
}
//# sourceMappingURL=supabase.js.map