/**
 * Vite API Plugin
 * 
 * Adds API endpoints to Vite dev server.
 * Handles /api/* routes and executes server-side code.
 */

import type { Plugin } from 'vite';
import type { IncomingMessage, ServerResponse } from 'http';

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
          // Parse URL
          const url = new URL(req.url || '', `http://${req.headers.host}`);
          const pathname = url.pathname;

          // Handle /api/events
          if (pathname === '/api/events' || pathname === '/api/events/') {
            // Dynamic import to avoid bundling server code in client
            // Import from the source directory relative to this file
            const { queryEvents, getEventStats } = await import(
              /* @vite-ignore */
              './src/api/events'
            );

            if (req.method === 'GET') {
              // Parse query parameters
              const filter: any = {};
              
              if (url.searchParams.get('type')) {
                filter.type = url.searchParams.get('type');
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
                  const { filter, stats } = JSON.parse(body || '{}');
                  
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
                } catch (error) {
                  res.statusCode = 400;
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({ error: 'Invalid request body' }));
                }
              });
            }
          } else {
            // Unknown API route
            res.statusCode = 404;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: 'Not found' }));
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

