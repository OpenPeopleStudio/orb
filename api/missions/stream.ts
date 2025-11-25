import type { VercelRequest, VercelResponse } from '@vercel/node';
import type { MissionResult, MissionState } from '@orb-system/forge';
import { processMissionStream } from '@orb-system/forge';
import { missionStore } from '../../../apps/orb-service/src/store';

const DEFAULT_USER_ID = 'demo-user';

export const config = {
  runtime: 'nodejs',
  maxDuration: 60,
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body ?? {};
    const { prompt, userId, sessionId } = body as {
      prompt?: string;
      userId?: string;
      sessionId?: string;
    };

    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders?.();

    let aborted = false;
    req.on('close', () => {
      aborted = true;
    });

    const iterator = processMissionStream(prompt, {
      userId: userId ?? DEFAULT_USER_ID,
      sessionId,
    });

    let finalResult: MissionResult | null = null;

    while (true) {
      const { value, done } = await iterator.next();

      if (done) {
        finalResult = value ?? null;
        break;
      }

      const state = value as MissionState;
      await missionStore.save(state);

      if (!aborted) {
        res.write(`data: ${JSON.stringify(state)}\n\n`);
      } else {
        break;
      }
    }

    if (!aborted && finalResult) {
      await missionStore.save(finalResult.state);
      res.write(`event: result\ndata: ${JSON.stringify(finalResult)}\n\n`);
    }

    if (!aborted) {
      res.write('event: end\n\n');
      res.end();
    }
  } catch (error) {
    console.error('[api/missions/stream] Failed to process mission stream', error);
    res.write(
      `event: error\ndata: ${JSON.stringify({
        message: error instanceof Error ? error.message : 'Mission processing failed',
      })}\n\n`
    );
    res.end();
  }
}


