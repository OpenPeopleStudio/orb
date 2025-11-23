/**
 * Vite API Plugin
 * 
 * Adds API endpoints to Vite dev server.
 * Handles /api/* routes and executes server-side code.
 */

import type { IncomingMessage, ServerResponse } from 'http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import type { Plugin } from 'vite';

export function apiPlugin(): Plugin {
  return {
    name: 'orb-api',
    configureServer(server) {
      server.middlewares.use('/api', async (req: IncomingMessage, res: ServerResponse, next) => {
        // Only handle GET/POST requests
        if (req.method !== 'GET' && req.method !== 'POST') {
          return next();
        }

        try {
          // Parse URL - req.url includes the pathname
          const url = new URL(req.url || '', `http://${req.headers.host}`);
          const pathname = url.pathname;
          
          // Debug logging
          console.log('[API] Request:', req.method, pathname);

          // Handle /api/events
          if (pathname === '/api/events' || pathname === '/api/events/') {
            // Dynamic import to avoid bundling server code in client
            // Resolve path relative to this plugin file (vite-plugin-api.ts is in apps/orb-web/)
            const __filename = fileURLToPath(import.meta.url);
            const __dirname = path.dirname(__filename);
            // vite-plugin-api.ts is in apps/orb-web/, so src/api/events.ts is relative to that
            const eventsPath = path.resolve(__dirname, 'src/api/events.ts');
            
            console.log('[API] Loading events handler from:', eventsPath);
            
            // Try importing with .ts extension first, then .js
            let eventsModule;
            try {
              eventsModule = await import(
                /* @vite-ignore */
                `file://${eventsPath}`
              );
            } catch {
              // Try .js extension if .ts fails
              const eventsPathJs = eventsPath.replace(/\.ts$/, '.js');
              console.log('[API] Trying .js extension:', eventsPathJs);
              eventsModule = await import(
                /* @vite-ignore */
                `file://${eventsPathJs}`
              );
            }
            
            const { queryEvents, getEventStats } = eventsModule;

            if (req.method === 'GET') {
              // Parse query parameters
              const filter: Record<string, string | string[] | undefined> = {};
              
              // Parse type parameter - split comma-separated values into array
              const typeParam = url.searchParams.get('type');
              if (typeParam) {
                filter.type = typeParam.includes(',') 
                  ? typeParam.split(',').map(t => t.trim())
                  : typeParam;
              }
              if (url.searchParams.get('userId')) {
                filter.userId = url.searchParams.get('userId');
              }
              if (url.searchParams.get('sessionId')) {
                filter.sessionId = url.searchParams.get('sessionId');
              }
              if (url.searchParams.get('mode')) {
                filter.mode = url.searchParams.get('mode');
              }
              if (url.searchParams.get('role')) {
                filter.role = url.searchParams.get('role');
              }
              if (url.searchParams.get('dateFrom')) {
                filter.dateFrom = url.searchParams.get('dateFrom');
              }
              if (url.searchParams.get('dateTo')) {
                filter.dateTo = url.searchParams.get('dateTo');
              }
              if (url.searchParams.get('limit')) {
                filter.limit = parseInt(url.searchParams.get('limit') || '100', 10);
              }
              if (url.searchParams.get('search')) {
                filter.search = url.searchParams.get('search')!;
              }

              // Check if requesting stats
              if (url.searchParams.get('stats') === 'true') {
                const stats = await getEventStats(filter);
                res.setHeader('Content-Type', 'application/json');
                res.setHeader('Access-Control-Allow-Origin', '*');
                res.end(JSON.stringify({ stats }));
              } else {
                // Query events
                const events = await queryEvents(filter);
                res.setHeader('Content-Type', 'application/json');
                res.setHeader('Access-Control-Allow-Origin', '*');
                res.end(JSON.stringify({ events }));
              }
            } else if (req.method === 'POST') {
              // Parse request body
              let body = '';
              req.on('data', (chunk) => {
                body += chunk.toString();
              });
              
              req.on('end', async () => {
                try {
                  const { filter: rawFilter, stats } = JSON.parse(body || '{}');
                  
                  // Parse type parameter if it's a comma-separated string
                  const filter = { ...rawFilter };
                  if (filter.type && typeof filter.type === 'string' && filter.type.includes(',')) {
                    filter.type = filter.type.split(',').map((t: string) => t.trim());
                  }
                  // Search parameter is already a string, no parsing needed
                  
                  if (stats) {
                    const eventStats = await getEventStats(filter);
                    res.setHeader('Content-Type', 'application/json');
                    res.setHeader('Access-Control-Allow-Origin', '*');
                    res.end(JSON.stringify({ stats: eventStats }));
                  } else {
                    const events = await queryEvents(filter);
                    res.setHeader('Content-Type', 'application/json');
                    res.setHeader('Access-Control-Allow-Origin', '*');
                    res.end(JSON.stringify({ events }));
                  }
                } catch {
                  res.statusCode = 400;
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({ error: 'Invalid request body' }));
                }
              });
            }
          } else if (pathname === '/api/preferences' || pathname === '/api/preferences/') {
            const __filename = fileURLToPath(import.meta.url);
            const __dirname = path.dirname(__filename);
            const prefsPath = path.resolve(__dirname, 'src/api/preferences.ts');

            let prefsModule;
            try {
              prefsModule = await import(
                /* @vite-ignore */
                `file://${prefsPath}`
              );
            } catch {
              const prefsPathJs = prefsPath.replace(/\.ts$/, '.js');
              prefsModule = await import(
                /* @vite-ignore */
                `file://${prefsPathJs}`
              );
            }

            const { getPreferencesSnapshot, updatePreferences } = prefsModule;

            if (req.method === 'GET') {
              const userId = url.searchParams.get('userId') || undefined;
              const snapshot = await getPreferencesSnapshot(userId || undefined);
              res.setHeader('Content-Type', 'application/json');
              res.setHeader('Access-Control-Allow-Origin', '*');
              res.end(JSON.stringify({ preferences: snapshot }));
            } else if (req.method === 'POST') {
              let body = '';
              req.on('data', (chunk) => {
                body += chunk.toString();
              });
              req.on('end', async () => {
                try {
                  const parsed = JSON.parse(body || '{}');
                  const snapshot = await updatePreferences(parsed);
                  res.setHeader('Content-Type', 'application/json');
                  res.setHeader('Access-Control-Allow-Origin', '*');
                  res.end(JSON.stringify({ preferences: snapshot }));
                } catch (error) {
                  console.error('[API] Failed to update preferences', error);
                  res.statusCode = 400;
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({ error: 'Invalid request body' }));
                }
              });
            }
          } else {
            // Unknown API route - let it pass through
            return next();
          }
        } catch (error) {
          console.error('[API] Error handling request:', error);
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ 
            error: error instanceof Error ? error.message : 'Internal server error' 
          }));
        }
      });
    },
  };
}

